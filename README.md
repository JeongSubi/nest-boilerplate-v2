# NestJS Boilerplate V2(Session Auth ver.)
: NestJS Boilerplate with session auth

## tech stack
: NestJs, Typescript, TypeORM, PostgreSQL, Redis(session), jwt, Docker, Jest


## ERD
[ERD sample 링크]()

## sample API
```
[user]
- 회원가입: 
- 회원탈퇴: 
```

## Getting Started

```
USING YARN (Recommend)
$ yarn install
$ docker compose -f ./docker/docker-compose-localhost.yml up -d (localhost environment)
$ yarn start

USING NPM
$ npm i OR npm i --legacy-peer-deps
$ docker compose -f ./docker/docker-compose-localhost.yml up -d (localhost environment)
$ npm start
```

## Test Coverage

```
UNIT TEST
$ npm run test

E2E TEST
$ npm run test:e2e

TEST COVERAGE
$ npm run test:cov
```

## Author

```
2023.09.20 ~
Author: Subi Jeong
```

