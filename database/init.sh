#!/bin/bash
set -euo pipefail

DB="adad_db"
ROUTER="router:27020"
CONFIG="configsvr:27019"
SHARD1="shard1:27018"
SHARD2="shard2:27017"

log() { echo "[$(date +%H:%M:%S)] $*"; }

init_replset() {
  local host=$1 rs_name=$2 extra=$3
  log "Initializing $rs_name on $host..."

  mongosh --host "$host" --quiet <<EOF
try {
  const status = rs.status();
  if (status.ok === 1) {
    print("$rs_name already initialized.");
  }
} catch (e) {
  print("Running rs.initiate() for $rs_name...");
  const cfg = { _id: "$rs_name", members: [ { _id: 0, host: "$host" } ] $extra };
  const res = rs.initiate(cfg);
  printjson(res);
}
EOF

  # Wait for PRIMARY
  until mongosh --host "$host" --quiet --eval "rs.isMaster().ismaster" | grep -q true; do
    printf '.'; sleep 2;
  done
  log " $rs_name is PRIMARY."
}

# === MAIN ===
log "Starting sharded cluster bootstrap..."

init_replset "$CONFIG" "configReplSet" ', configsvr: true'
init_replset "$SHARD1" "shard1ReplSet" ''
init_replset "$SHARD2" "shard2ReplSet" ''

log "Waiting for router ($ROUTER)..."
until mongosh --host "$ROUTER" --quiet --eval "db.runCommand({ ping: 1 }).ok" | grep -q 1; do
  printf '.'; sleep 2
done
log " Router ready."

log "Adding shards..."
mongosh --host "$ROUTER" --quiet <<EOF
db.adminCommand({ enableSharding: "$DB" });
sh.enableSharding("adad_db")
sh.addShard("shard1ReplSet/$SHARD1");
sh.addShard("shard2ReplSet/$SHARD2");
sh.shardCollection("$DB.users",  { _id: 'hashed' });
sh.shardCollection("$DB.events", { _id: 'hashed' });
sh.startBalancer()
EOF

log "Enabling sharding on $DB..."
mongosh --host "$ROUTER" --quiet <<EOF
db.adminCommand({ enableSharding: "$DB" });
EOF

log "Importing data (if available)..."
if [ -f /data/users.json ]; then
  mongoimport --host router --port 27020 --db "$DB" --collection users  --file /data/users.json  --jsonArray --quiet
  log "users.json imported"
else
  log "users.json not found — skipped"
fi

if [ -f /data/events.json ]; then
  mongoimport --host router --port 27020 --db "$DB" --collection events --file /data/events.json --jsonArray --quiet
  log "events.json imported"
else
  log "events.json not found — skipped"
fi

log "Sharded cluster ready."
touch /init.done

