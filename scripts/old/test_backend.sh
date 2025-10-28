#!/usr/bin/env sh

# Configuration
BASE_URL="http://127.0.0.1:5000"
STATUS_ENDPOINT="/status"
ROOT_ENDPOINT="/"


test_endpoint() {
    ENDPOINT=$1
    DESCRIPTION=$2
    URL="${BASE_URL}${ENDPOINT}"

    printf "\n--- Testing %s (%s) ---\n" "$DESCRIPTION" "$ENDPOINT"

    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")

    RESPONSE_BODY=$(curl -s "$URL")

    printf "HTTP Status: %s\n" "$HTTP_STATUS"
    printf "Response Body:\n"
    
    if command -v jq > /dev/null 2>&1; then
        echo "$RESPONSE_BODY" | jq . 2>/dev/null || echo "$RESPONSE_BODY"
    else
        echo "$RESPONSE_BODY"
    fi
}


test_endpoint "$STATUS_ENDPOINT" "Health Check"
test_endpoint "$ROOT_ENDPOINT" "Root Route (404 Test)"

printf "\n--- Test Complete ---\n"
