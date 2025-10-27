#!/usr/bin/env sh

# if "docker" not in $(groups) $(sudo ...) else (...)
docker run -d -p 27017:27017 --name adad_db adad_db 
