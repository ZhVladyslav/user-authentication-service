
## Installation

```bash
$ yarn install
```

## Running the app

``` .env file
    JWT_SECRET="jwt key"
    PORT=5000
    
    DB_HOST=127.0.0.1
    DB_PASSWORD=root
    DB_USER=root
    DB_NAME=auth-service
    DB_PORT=5432
    DATABASE_URL=postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
    
    REDIS_PORT=6379
    REDIS_PASSWORD=root
```

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov

# test integration
$ yarn run test:int
```

## License

Nest is [MIT licensed](LICENSE).
