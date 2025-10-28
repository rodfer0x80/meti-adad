#!/bin/bash
set -e

DB_NAME="adad_db"
COLLECTION_NAME_USERS="users"
SHARD_KEY_USERS="{ partitionKey: 1, _id: 1 }"
COLLECTION_NAME_MOVIES="movies"
SHARD_KEY_MOVIES="{ _id: 1 }"

# Function to wait for a MongoDB host to be ready for connections
function wait_for_mongo() {
    local host_port=$1
    echo "Waiting for $host_port to accept connections..."
    local retries=30
    local count=0
    until mongosh --host $host_port --eval 'quit(db.runCommand({ ping: 1 }).ok ? 0 : 2)' > /dev/null 2>&1 || [ $count -ge $retries ]; do
        printf '.'
        sleep 1
        count=$((count+1))
    done

    if [ $count -ge $retries ]; then
        echo "ERROR: $host_port failed to accept connections after $retries attempts."
        exit 1
    fi
    echo "$host_port is up."
}

# Function to run rs.initiate, wait for primary, and handle success/failure
function initiate_and_wait() {
    local host_port=$1
    local rs_config_json=$2
    local rs_name=$3

    wait_for_mongo "$host_port"

    echo "Attempting to initiate replica set $rs_name on $host_port..."

    # Check if replica set is already initialized
    if mongosh --host "$host_port" --quiet --eval "rs.status().ok" > /dev/null 2>&1; then
        echo "Replica set $rs_name already initialized on $host_port. Skipping rs.initiate()."
        return 0
    fi

    # Initiate the replica set
    if mongosh --host "$host_port" --eval "rs.initiate($rs_config_json)"; then
        echo "Initiation command sent successfully for $rs_name."
    else
        echo "ERROR: Failed to send rs.initiate command for $rs_name."
        exit 1
    fi

    echo "Waiting for $rs_name to elect a primary..."
    # Wait for status to show a primary member
    local retries=30
    local count=0
    until mongosh --host "$host_port" --quiet --eval "rs.status().members.forEach(function(m){ if(m.stateStr == 'PRIMARY') { quit(0); } })" > /dev/null 2>&1 || [ $count -ge $retries ]; do
        printf '.'
        sleep 2
        count=$((count+1))
    done

    if [ $count -ge $retries ]; then
        echo "ERROR: $rs_name failed to elect a primary after $retries attempts. Check logs for $host_port."
        exit 1
    fi
    echo "$rs_name primary elected."
}

# Function to add shard and enable sharding on the router
function configure_router() {
    local router_host=$1

    wait_for_mongo "$router_host"
    echo "Router is up. Configuring shards and enabling sharding..."

    # Run the configuration script using a heredoc for clarity and variable substitution
    mongosh --host "$router_host" <<EOF
        // Add the shards to the cluster
        sh.addShard("shard1ReplSet/shard1:27018")
        sh.addShard("shard2ReplSet/shard2:27017")

        // Enable sharding for the database
        sh.enableSharding("$DB_NAME")

        // ----------------------------------------------------
        // Configuration for 'users' collection (Hashed/Ranged Sharding Example)
        // ----------------------------------------------------
        db.getSiblingDB("$DB_NAME").$COLLECTION_NAME_USERS.createIndex($SHARD_KEY_USERS)
        sh.shardCollection("$DB_NAME.$COLLECTION_NAME_USERS", $SHARD_KEY_USERS)

        // Add Tags and Tag Ranges for zone sharding on 'users'
        sh.addShardTag("shard1ReplSet", "shardA")
        sh.addShardTag("shard2ReplSet", "shardB")
        sh.addTagRange("$DB_NAME.$COLLECTION_NAME_USERS", { partitionKey: 0 }, { partitionKey: 1}, "shardA")
        sh.addTagRange("$DB_NAME.$COLLECTION_NAME_USERS", { partitionKey: 1 }, { partitionKey: 2}, "shardB")

        // ----------------------------------------------------
        // Configuration for 'movies' collection (Simple Sharding)
        // ----------------------------------------------------
        db.getSiblingDB("$DB_NAME").$COLLECTION_NAME_MOVIES.createIndex($SHARD_KEY_MOVIES)
        sh.shardCollection("$DB_NAME.$COLLECTION_NAME_MOVIES", $SHARD_KEY_MOVIES)

EOF
}


# --- 1. Initialize the config replica set ---
CONFIG_RS_CONFIG='{
  _id: "configReplSet",
  configsvr: true,
  members: [
    { _id: 0, host: "configsvr:27019" }
  ]
}'
initiate_and_wait "configsvr:27019" "$CONFIG_RS_CONFIG" "configReplSet"

# --- 2. Initialize the shard replica sets ---
SHARD1_RS_CONFIG='{
  _id: "shard1ReplSet",
  members: [
    { _id: 0, host: "shard1:27018" }
  ]
}'
initiate_and_wait "shard1:27018" "$SHARD1_RS_CONFIG" "shard1ReplSet"

SHARD2_RS_CONFIG='{
  _id: "shard2ReplSet",
  members: [
    { _id: 0, host: "shard2:27017" }
  ]
}'
initiate_and_wait "shard2:27017" "$SHARD2_RS_CONFIG" "shard2ReplSet"

# --- 3. Configure the Query Router (mongos) ---
echo "Waiting 30 seconds for mongos router to fully load config set and stabilize..."
sleep 30
configure_router "router:27020"

echo "--- PHASE 4: Data Import via the Router ---"

# Import data through the router (mongos), ensuring data lands on the newly sharded collections
# The files are available at /data/users.json and /data/movies.json
wait_for_mongo "router:27020" # Ensure router is still up before importing
mongoimport --host router --port 27020 --db $DB_NAME --collection users --type json --file /data/users.json --jsonArray
mongoimport --host router --port 27020 --db $DB_NAME --collection movies --type json --file /data/movies.json --jsonArray

echo "MongoDB Sharded Cluster initialization and data import complete."
