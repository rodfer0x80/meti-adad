#!/usr/bin/env sh

# mkdir -p ./tests/debug 

API="http://127.0.0.1:5000"
WORKDIR="./tests/debug"

echo "[1] Fetching GET /events"
curl -s -X GET $API/events | jq > $WORKDIR/get_events.txt

echo "[2] Fetching GET /users"
curl -s -X GET $API/users | jq > $WORKDIR/get_users.txt

echo "[3] Fetching PORT /events"
TEST_POST_EVENT_JSON='{
    "tipologia": "Hunting Event",
    "id": "11111111-deaf-beef-8343-2376e2da4bc2",
    "data_inicio": "2026-03-01",
    "data_fim": "2026-03-01",
    "nome_atividade": "POST Hunting",
    "horario": "21:00:00",
    "custo": "Free",
    "sinopse": "Hunting for meat",
    "organizacao": "Meat Inc.",
    "publico_destinatario": "Ballerz Only",
    "localizacao": "The Dark Forest",
    "latitude": "0.0",
    "longitude": "0.0"
}'
INSERTED_EVENT_ID=$(curl -s -X POST $API/events \
  -H "Content-Type: application/json" \
  -d "${TEST_POST_EVENT_JSON}" | jq -r '.insertedId')
if [ -z "$INSERTED_EVENT_ID" ] || [ "$INSERTED_EVENT_ID" == "null" ]; then
    echo "POST /events failed." > $WORKDIR/post_events.txt 
else 
  echo "" > $WORKDIR/post_events.txt
fi

echo "[4] Fetching POST /users"
TEST_POST_USER_JSON='{
    "id": "666",
    "registo": "2025-10-31",
    "ultimo_login": "2025-10-31",
    "nome": "Lucifer Morningstar",
    "localizacao": "Hell",
    "latitude": "6.66",
    "longitude": "-6.66"
}'
INSERTED_USER_ID=$(curl -s -X POST $API/users \
    -H "Content-Type: application/json" \
    -d "${TEST_POST_USER_JSON}" | jq -r '.insertedId')
if [ -z "$INSERTED_USER_ID" ] || [ "$INSERTED_USER_ID" == "null" ]; then
    echo "POST /users failed." > $WORKDIR/post_users.txt 
else 
  echo "" > $WORKDIR/post_users.txt
fi

echo "[5] Fetching GET /events/:id"
curl -s -X GET $API/events/$INSERTED_EVENT_ID | jq > $WORKDIR/get_events_search_by_id.txt

echo "[6] Fetching GET /users/:id"
curl -s -X GET $API/users/$INSERTED_USER_ID | jq > $WORKDIR/get_users_search_by_id.txt

echo "[7] Fetching DELETE /events/:id"
# Response should be empty
curl -s -X DELETE $API/events/$INSERTED_EVENT_ID > $WORKDIR/delete_events_by_id.txt

echo "[8] Fetching DELETE /users/:id"
# Response should be empty
curl -s -X DELETE $API/users/$INSERTED_USER_ID > $WORKDIR/delete_users_by_id.txt
