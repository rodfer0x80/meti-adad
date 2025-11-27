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
> backend - nodejs API (backend:5000) (w/ bash test script)
> frontend - react js UI (frontend:3000) 
> nginx - nginx https reverse proxy (nginx:443->localhost:8443, nginx:80->localhost:8080)
> database - mongodb (w/ sharding) (router:27020) 
```
