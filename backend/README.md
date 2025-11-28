# backend

# meti-adad
METI ADAD Project

``` 
>> REQUIREMENTS
> nodejs 
> npm 
> bash (tests)
```

```
>> ENV VARIABLES CONFIGURATION 

# Local (example)
HOST="127.0.0.1" 
PORT="5000"
DB_HOST="127.0.0.1" 
DB_PORT="27017"
DB_NAME="adad_db"
```

```
>> ENDPOINTS 

[x] #1 => GET /events => List events with pagination
    Params:
        ?page => page number
        ?limit => number of items per page

[x] #2 => GET /users => List users with pagination
    Params:
        ?page => page number
        ?limit => number of items per page

[x] #3 => POST /events => Add one or many events
    Params:
       event -> JSON object (example) {
                    "tipologia": "Xmas Event",
                    "id": "11111111-xmas-11f0-8343-2376e2da4bc2",
                    "data_inicio": "2026-12-25",
                    "data_fim": "2026-12-25",
                    "nome_atividade": "Automated Test Curl POST",
                    "horario": "20:00:00",
                    "custo": "Free",
                    "sinopse": "Testing the new POST /events endpoint logic.",
                    "organizacao": "Santa Inc.",
                    "publico_destinatario": "Ballers",
                    "localizacao": "Antartica",
                    "latitude": "0.0",
                    "longitude": "0.0"
        } 

[x] #4 => POST /users => Add one or many users
    Params:
        user data ..

[x] #5 => GET /events/:id => search event by _id (include all event information and average score)

[x] #6 => GET /users/:id => search user by _id (include user's top 3 events)

[x] #7 => DELETE /events/:id => remove event by _id

[x] #8 => DELETE /users/:id => remove user by _id 

[x] #9 => PUT /events/:id => update event data by _id 

[x] #10 => PUT /users/:id => update user data by _id 

[x] #11 => GET /events/top/:limit => list events by score in descending order. Show all event information . Limit number of events by :limit 

[x] #12 => GET /events/ratings/:order => list events by number of reviews. :ord - asc | desc 

[x] #13 => GET /events/star => List all events with 5 star score. Show all event information and number of reviews.

[x] #14 => GET /events/:year => List all rated events from :year 

[x] #15 => POST /users/:id/review/:event_id => Add a new review to :event_id from user :id
    Params:
        :id -> user _id 
        :event_id -> event _id 
        ?score -> user score regarding the event

[x] #C1 => GET /events/nearby/:id => List all neaby events by geo coords in given radius of the user
    Params: 
        :id -> user _id
        ?lat-> user coordinates for latitude - optional use ones stored in db for this user
        ?lon-> user coordinates for longitude - optional use ones stored in db for this user
        ?radius -> radius in km

[x] #C2 => GET /events/date => List all events that start after given start date and end before given end date
    Params:
        ?start_day -> day 
        ?start_month -> month
        ?start_year -> year
        ?end_day -> day 
        ?end_month -> month
        ?end_year -> year


[x] #C3 => GET /events/name => List all events that case insensitive match the string given compared to the 'nome_atividade' 
    Params:
        ?k -> string

[x] #C4 => GET /events/free => List all events with keyword \gratuito\ or empty string in 'custo' 
    Params:
        NULL
```
