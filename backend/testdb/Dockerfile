FROM mongo:latest

ENV MONGO_INITDB_ROOT_USERNAME=user
ENV MONGO_INITDB_ROOT_PASSWORD=password
ENV MONGO_INITDB_DATABASE=adad_db

COPY ./data /docker-entrypoint-initdb.d/data/
COPY ./init.sh /docker-entrypoint-initdb.d/

RUN chmod +x /docker-entrypoint-initdb.d/init.sh

EXPOSE 27017
