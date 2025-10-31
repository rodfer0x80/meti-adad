#!/usr/bin/env bash
set -euo pipefail

DB_HOST="${DB_HOST:-router}"     
DB_PORT="${DB_PORT:-27020}"      
DB_NAME="${DB_NAME:-adad_db}"    
if [ $DB_HOST = "router" ]; then
  DOCKER_CONTAINER="router"
else 
  DOCKER_CONTAINER="adad_db_dev"
fi
MONGO_URI="${MONGO_URI:-mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}}"
DATA_DIR="./database/data"

mkdir -p "$DATA_DIR"

echo "[INFO] Using Mongo URI: $MONGO_URI"

echo "[INFO] Exporting 'users' collection → $DATA_DIR/users.json"
docker exec $DOCKER_CONTAINER mongoexport \
  --uri="$MONGO_URI" \
  --collection="users" \
  --db="$DB_NAME" \
  --out="/data/users.json" \
  --jsonArray

echo "[INFO] Exporting 'events' collection → $DATA_DIR/events.json"
docker exec $DOCKER_CONTAINER mongoexport \
  --uri="$MONGO_URI" \
  --collection="events" \
  --db="$DB_NAME" \
  --out="/data/events.json" \
  --jsonArray

echo "[INFO] Copying exported data to host..."
docker cp $DOCKER_CONTAINER:/data/users.json "$DATA_DIR/users.json"
docker cp $DOCKER_CONTAINER:/data/events.json "$DATA_DIR/events.json"

docker exec router rm -f /data/users.json /data/events.json

echo "[SUCCESS] Data exported successfully!"
ls -lh "$DATA_DIR"/*.json

