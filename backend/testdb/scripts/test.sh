#!/usr/bin/env bash

# --- Configuration (Must match your .env and Dockerfile settings) ---
CONTAINER_NAME="adad_db"
DB_NAME="adad_db"
DB_USER="user"
DB_PASSWORD="password"
AUTH_DB="admin" # Root user is created in the 'admin' database by default

echo "========================================="
echo "[*] Testing MongoDB Authentication and Connection"
echo "========================================="
echo "[*] Container: $CONTAINER_NAME"
echo "[*] Database: $DB_NAME (Authenticated as '$DB_USER' against '$AUTH_DB')"
echo "-----------------------------------------"

# Execute mongosh with explicit authentication parameters (-u, -p, --authenticationDatabase)
# This command attempts to log in using the credentials defined above.
sudo docker exec -i $CONTAINER_NAME mongosh \
    --authenticationDatabase "$AUTH_DB" \
    -u "$DB_USER" \
    -p "$DB_PASSWORD" \
    --eval "
    // Check if the connection was successful by running a command that requires auth
    try {
        var userCheck = db.runCommand({ connectionStatus: 1 });
        print('[\u2713] Authentication successful: Current user is ' + userCheck.authInfo.authenticatedUser);
    } catch (e) {
        print('[\u2717] Authentication failed: ' + e.message);
        quit(1); // Exit with error code if authentication fails
    }

    // Switch to the target database to query application data
    var targetDb = db.getSiblingDB('$DB_NAME');
    
    // Test collection queries
    print('--- Example Query: users collection ---');
    targetDb.users.find().limit(1).forEach(printjson);
    
    print('\n--- Example Query: movies collection ---');
    targetDb.movies.find().limit(1).forEach(printjson);
    
    print('-----------------------------------------');
    "

# Check the exit status of the docker exec command
if [ $? -eq 0 ]; then
    echo "[*] Test finished successfully. Authentication and queries passed."
else
    echo "[!] Test failed. Check MongoDB logs and connection parameters."
fi
echo "========================================="
