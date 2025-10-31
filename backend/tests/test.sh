#!/usr/bin/env sh

API="http://127.0.0.1:5000"
WORKDIR="./tests/debug"

mkdir -p "$WORKDIR"

fetch() {
  local METHOD=$1
  local URL=$2
  local OUTPUT_FILE=$3
  shift 3
  local EXTRA_ARGS=("$@")

  RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" "${EXTRA_ARGS[@]}")
  BODY=$(echo "$RESPONSE" | head -n -1)
  STATUS=$(echo "$RESPONSE" | tail -n 1)

  echo "$BODY" | jq . > "$OUTPUT_FILE" 2>/dev/null || echo "$BODY" > "$OUTPUT_FILE"

  if [ "$STATUS" -lt 200 ] || [ "$STATUS" -ge 300 ]; then
    echo "Error: $METHOD $URL => HTTP $STATUS"
  else
    echo ">> $METHOD $URL => HTTP $STATUS"
  fi
}

echo "[1] Fetching GET /events"
fetch GET "$API/events" "$WORKDIR/get_events.txt"

echo "[2] Fetching GET /users"
fetch GET "$API/users" "$WORKDIR/get_users.txt"

echo "[3] Fetching POST /events"
TEST_POST_EVENT_JSON=$(cat <<'EOF'
{
  "tipologia": "Hunting Event",
  "id": "11111111-deaf-beef-8343-2376e2da4bc2",
  "data_inicio": "2026-03-01",
  "data_fim": "2026-03-01",
  "nome_atividade": "Forest Hunting",
  "horario": "21:00:00",
  "custo": "",
  "sinopse": "Hunting for meat",
  "organizacao": "Meat Inc.",
  "publico_destinatario": "Ballerz Only",
  "localizacao": "The Dark Forest",
  "latitude": "0.0",
  "longitude": "0.0"
}
EOF
)
TMP_EVENT_JSON=$(mktemp)
echo "$TEST_POST_EVENT_JSON" > "$TMP_EVENT_JSON"

INSERTED_EVENT_ID=$(curl -s -X POST "$API/events" \
  -H "Content-Type: application/json" \
  -d @"$TMP_EVENT_JSON" | jq -r '.insertedId')

if [ -z "$INSERTED_EVENT_ID" ] || [ "$INSERTED_EVENT_ID" = "null" ]; then
  echo "❌ POST /events failed." > "$WORKDIR/post_events.txt"
else
  echo "✅ Event created: $INSERTED_EVENT_ID" > "$WORKDIR/post_events.txt"
fi
rm "$TMP_EVENT_JSON"

echo "[4] Fetching POST /users"
TEST_POST_USER_JSON=$(cat <<'EOF'
{
  "id": "666",
  "registo": "2025-10-31",
  "ultimo_login": "2025-10-31",
  "nome": "Lucifer Morningstar",
  "localizacao": "Hell",
  "latitude": "6.66",
  "longitude": "-6.66"
}
EOF
)
TMP_USER_JSON=$(mktemp)
echo "$TEST_POST_USER_JSON" > "$TMP_USER_JSON"

INSERTED_USER_ID=$(curl -s -X POST "$API/users" \
  -H "Content-Type: application/json" \
  -d @"$TMP_USER_JSON" | jq -r '.insertedId')

if [ -z "$INSERTED_USER_ID" ] || [ "$INSERTED_USER_ID" = "null" ]; then
  echo "POST /users failed." > "$WORKDIR/post_users.txt"
else
  echo "User created: $INSERTED_USER_ID" > "$WORKDIR/post_users.txt"
fi
rm "$TMP_USER_JSON"

echo "[5] Fetching GET /events/:id"
fetch GET "$API/events/$INSERTED_EVENT_ID" "$WORKDIR/get_events_search_by_id.txt"

echo "[6] Fetching GET /users/:id"
fetch GET "$API/users/$INSERTED_USER_ID" "$WORKDIR/get_users_search_by_id.txt"

echo "[9] Fetching PUT /events/:id"
TEST_PUT_EVENT_JSON=$(cat <<'EOF'
{
  "nome_atividade": "Trip Hunting with Tim",
  "localizacao": "Shroom Forest",
  "latitude": "4.20",
  "longitude": "-4.20",
  "custo": ""
}
EOF
)
TMP_PUT_EVENT_JSON=$(mktemp)
echo "$TEST_PUT_EVENT_JSON" > "$TMP_PUT_EVENT_JSON"

fetch PUT "$API/events/$INSERTED_EVENT_ID" "$WORKDIR/put_events_by_id.txt" \
  -H "Content-Type: application/json" \
  -d @"$TMP_PUT_EVENT_JSON"
rm "$TMP_PUT_EVENT_JSON"

echo "[10] Fetching PUT /users/:id"
TEST_PUT_USER_JSON=$(cat <<'EOF'
{
  "nome": "Timothy Leary",
  "localizacao": "Heaven (on a trip)",
  "latitude": "7.77",
  "longitude": "-7.77"
}
EOF
)
TMP_PUT_USER_JSON=$(mktemp)
echo "$TEST_PUT_USER_JSON" > "$TMP_PUT_USER_JSON"

fetch PUT "$API/users/$INSERTED_USER_ID" "$WORKDIR/put_users_by_id.txt" \
  -H "Content-Type: application/json" \
  -d @"$TMP_PUT_USER_JSON"
rm "$TMP_PUT_USER_JSON"

echo "[11] Fetching GET /events/top/:limit"
fetch GET "$API/events/top/5" "$WORKDIR/get_list_top_5.txt"

echo "[12] Fetching GET /events/ratings/:order"
fetch GET "$API/events/ratings/asc" "$WORKDIR/get_order_events_by_ratings_asc.txt"
fetch GET "$API/events/ratings/desc" "$WORKDIR/get_order_events_by_ratings_desc.txt"

echo "[13] Fetching GET /events/star"
fetch GET "$API/events/star" "$WORKDIR/get_list_star.txt"

echo "[14] Fetching GET /events/2025"
fetch GET "$API/events/2025?page=1&limit=10" "$WORKDIR/get_list_rated_events_by_year.txt"

echo "[15] Fetching POST /users/:id/review/:event_id"
fetch POST "$API/users/${INSERTED_USER_ID}/review/72704?score=5" "$WORKDIR/post_users_review_event.txt"

echo "[C1] Fetching GET /users/nearby/:id"
fetch GET "$API/users/nearby/$INSERTED_USER_ID?latitude=39.646&longitude=-8.628&radius=4" "$WORKDIR/get_users_nearby_events_from_user.txt"

echo "[C2] Fetching GET /events/date"
fetch GET "$API/events/date/?start_day=10&start_month=10&start_year=2025&end_day=19&end_month=10&end_year=2025" "$WORKDIR/get_events_filter_by_date.txt"

echo "[C3] Fetching GET /events/name"
fetch GET "$API/events/name?k=hunt" "$WORKDIR/get_events_search_by_name.txt"

echo "[C4] Fetching GET /events/free"
fetch GET "$API/events/free" "$WORKDIR/get_events_list_free.txt"

echo "[7] Fetching DELETE /events/:id"
fetch DELETE "$API/events/$INSERTED_EVENT_ID" "$WORKDIR/delete_events_by_id.txt"

echo "[8] Fetching DELETE /users/:id"
fetch DELETE "$API/users/$INSERTED_USER_ID" "$WORKDIR/delete_users_by_id.txt"

# ======================================================
echo "All test requests completed. Check $WORKDIR for output."

