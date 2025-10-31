#!/usr/bin/env bash

until mongosh --norc --eval 'quit(db.runCommand({ ping: 1 }).ok ? 0 : 2)' > /dev/null 2>&1; do
  echo "[\] Waiting for MongoDB to be available..."
  sleep 1
done
echo "[*] MongoDB is up and running!"

DB_NAME="$MONGO_INITDB_DATABASE"
mongoimport --host localhost --db $DB_NAME --collection users --type json --file /docker-entrypoint-initdb.d/data/users.json --jsonArray
mongoimport --host localhost --db $DB_NAME --collection events --type json --file /docker-entrypoint-initdb.d/data/events.json --jsonArray
echo "[*] Data import completed."
