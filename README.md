# Group "strictmode"

## Members
- s340076 Miglietta Lorenzo
- s343656 Pedrani Alessandro
- s338856 Carloni Michele
- s339423 Revalor Riccardo
- s343452 Gontero Diana

# Exercise "SurplusFood"

## To set up the database and start the Express server
```sh
npm install
# choose one of the two alternatives:
npm run migrate         # inits the db for the first time
npm run migrate:samples # inits te db for the first time and inserts sample data
npm run start
```

## To start the React client
```sh
npm run dev
```

## To run the tests (db repos, server routes)
```sh
npm run test
```

## To run just the Express server routes tests
```sh
npm run test:server
```

# To run the simple_api to fetch data from the Express server
```sh
npm run simple_api
```