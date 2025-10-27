#!/usr/bin/env sh 

# if "docker" not in $(groups) $(sudo ...) else (...)
docker ps -q --filter "name=adad" | xargs docker kill 
docker rm adad_lab3
