#!/usr/bin/env sh 

# if "docker" not in $(groups) $(sudo ...) else (...)
docker ps -q --filter "name=adad_db_dev" | xargs docker kill 
docker rm adad_db_dev
