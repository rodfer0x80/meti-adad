#!/usr/bin/env sh

HOST="127.0.0.1"
PORT="5000"

curl -X GET -i http://"$HOST":"$PORT"/events

curl -X GET -i http://"$HOST":"$PORT"/users 
