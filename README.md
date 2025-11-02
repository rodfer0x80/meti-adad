# meti-adad
METI ADAD Project

``` 
>> REQUIREMENTS
> docker
> docker-compose
```

```
>> ARCHITECTURE
(please refer to ./docs/ADAD_project_architecture.svg)
> backend - nodejs API (localhost:5000) (backend:5000) (w/ bash test script)
> frontend - react js UI (under dev) (localhost:3000) (frontend:3000) 
> nginx - nginx https reverse proxy (nginx:443->localhost:8443, nginx:80->localhost:8080)
> database - mongodb (w/ sharding) (router:27020) 
> devdb - dev and testing mongodb (no sharding) (localhost:27017)
```

```
>> ENV VARIABLES CONFIGURATION 

# Docker 
HOST="0.0.0.0" 
PORT="5000"
DB_HOST="router" 
DB_PORT="27020"
DB_NAME="adad_db"

# Local (example)
HOST="127.0.0.1" 
PORT="5000"
DB_HOST="127.0.0.1" 
DB_PORT="27017"
DB_NAME="adad_db"
```
