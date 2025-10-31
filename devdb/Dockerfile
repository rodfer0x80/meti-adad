FROM mongo:latest

ENV MONGO_INITDB_DATABASE=adad_db

COPY ../database/data /docker-entrypoint-initdb.d/data/
COPY ./init.sh /docker-entrypoint-initdb.d/

RUN chmod +x /docker-entrypoint-initdb.d/init.sh

EXPOSE 27017
