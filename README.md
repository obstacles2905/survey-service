# Survey service

## Description

A Node.js service which enables the creation and taking of user surveys.

## Routes

### Users
Entity storing all users

1. GET /users - get all users
2. GET /users/:id - get user by id
3. POST /users - create a new user

### Surveys
Entity storing all surveys

1. GET /surveys - get all surveys
2. GET /surveys/:id - get specific survey
3. POST /surveys - create a new survey (without questions)
4. PUT /surveys - modify existing survey - name, description, existing questions and answers
5. POST /surveys/question - add new questions to an existing survey

### Applyings
Entity storing all applyings made by users

1. GET /applyings - get all applyings
2. GET /applyings/:userId - get all applyings made by user
3. POST /applyings - create an applying and answer on questions

## Environment
Required environment variables
```bash
NODE_ENV

APPLICATION_PORT
```

You can change them in the .env file

## How to run

1. Install dependencies with:

```bash
yarn install
```

2. Start an application

```bash
yarn watch-ts
```

After performing those operations a server will start. A default port is 8080.

## Tests
1. Launch tests

```bash
yarn test
```