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
    "custo": "",
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

echo "[9] Fetching PUT /events/:id"
TEST_PUT_EVENT_JSON='{
    "nome_atividade": "Trip Hunting with Tim",
    "localizacao": "Shroom Forest",
    "latitude": "4.20",
    "longitude": "-4.20",
    "custo": ""
}'
curl -s -X PUT $API/events/$INSERTED_EVENT_ID \
    -H "Content-Type: application/json" \
    -d "${TEST_PUT_EVENT_JSON}" | jq > $WORKDIR/put_events_by_id.txt

echo "[10] Fetching PUT /users/:id"
TEST_PUT_USER_JSON='{
    "nome": "Timothy Leary",
    "localizacao": "Heaven (on a trip)",
    "latitude": "7.77",
    "longitude": "-7.77"
}'
curl -s -X PUT $API/users/$INSERTED_USER_ID \
    -H "Content-Type: application/json" \
    -d "${TEST_PUT_USER_JSON}" | jq > $WORKDIR/put_users_by_id.txt


echo "[11] Fetching GET /events/top/:limit"
curl -s -X GET $API/events/top/1 > $WORKDIR/get_list_top_1.txt
curl -s -X GET $API/events/top/5 > $WORKDIR/get_list_top_5.txt

echo "[12] Fetching GET /events/ratings/:order"
curl -s -X GET $API/events/ratings/asc | jq > $WORKDIR/get_order_events_by_ratings_asc.txt
curl -s -X GET $API/events/ratings/desc | jq > $WORKDIR/get_order_events_by_ratings_desc.txt

echo "[13] Fetching GET /events/star"
curl -s -X GET $API/events/star | jq > $WORKDIR/get_list_star.txt

echo "[14] Fetching GET /events/2025"
curl -s -X GET $API/events/2025?page=1\&limit=10 | jq > $WORKDIR/get_list_rated_events_by_year.txt

echo "[15] Fetching POST /users/:id/review/:event_id"
curl -s -X POST $API/users/${INSERTED_USER_ID}/review/72704?score=5 | jq > $WORKDIR/post_users_review_event.txt

echo "[7] Fetching DELETE /events/:id"
curl -s -X DELETE $API/events/$INSERTED_EVENT_ID > $WORKDIR/delete_events_by_id.txt

echo "[8] Fetching DELETE /users/:id"
curl -s -X DELETE $API/users/$INSERTED_USER_ID > $WORKDIR/delete_users_by_id.txt

echo "All test requests completed. Check $WORKDIR for output."
