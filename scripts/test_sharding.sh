#!/usr/bin/env bash
set -euo pipefail

ROUTER_CONTAINER="router"
ROUTER_PORT="27020"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

section() {
  echo ""
  echo "============================================================"
  echo "$1"
  echo "============================================================"
}

status() {
  local msg="$1"
  local color="$2"
  echo -e "${color}${msg}${NC}"
}

CONTAINER_ID=$(docker ps -q -f name=${ROUTER_CONTAINER})
if [ -z "$CONTAINER_ID" ]; then
  status "The MongoDB router container ('${ROUTER_CONTAINER}') is not running." "$RED"
  echo "Run: docker compose up -d"
  exit 1
fi

section "1. CLUSTER HEALTH (sh.status())"
echo "Overview of config servers, shards, and sharded collections."
if docker exec $ROUTER_CONTAINER mongosh --quiet --port $ROUTER_PORT --eval 'sh.status()' > /tmp/cluster_status.log 2>&1; then
  status "Successfully retrieved cluster status." "$GREEN"
else
  status "Failed to retrieve cluster status. Check sharding initialization." "$YELLOW"
  cat /tmp/cluster_status.log
fi

section "2. USERS SHARD DISTRIBUTION (adad_db.users)"
if docker exec $ROUTER_CONTAINER mongosh --quiet --port $ROUTER_PORT \
  --eval 'db.getSiblingDB("adad_db").users.getShardDistribution()' > /tmp/users_dist.log 2>&1; then
  status "Retrieved users shard distribution." "$GREEN"
  cat /tmp/users_dist.log
else
  status "Could not retrieve users shard distribution." "$YELLOW"
fi

section "3. events SHARD DISTRIBUTION (adad_db.events)"
if docker exec $ROUTER_CONTAINER mongosh --quiet --port $ROUTER_PORT \
  --eval 'db.getSiblingDB("adad_db").events.getShardDistribution()' > /tmp/events_dist.log 2>&1; then
  status "Retrieved events shard distribution." "$GREEN"
  cat /tmp/events_dist.log
else
  status "Could not retrieve events shard distribution." "$YELLOW"
fi

section "SUMMARY"
if grep -q "shards:" /tmp/cluster_status.log; then
  status "Sharded cluster appears healthy!" "$GREEN"
else
  status "Cluster may not be fully initialized or reachable." "$RED"
  exit 1
fi

