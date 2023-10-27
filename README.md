# NestJS Boilerplate V2(Session Auth ver.)
: NestJS Boilerplate with session auth

## tech stack
: NestJs, Typescript, TypeORM, PostgreSQL, Redis(session), jwt, Docker, Jest


## ERD
[ERD sample 링크]()

## sample API
```
[auth]
- 회원가입: (Post) http://localhost:4000/auth/register
- 로그인: (Post) http://localhost:4000/auth/login
- 로그아웃 : (Post) http://localhost:4000/auth/logout
- 패스워드 변경: (Patch) http://localhost:4000/auth/change-password
- 이메일 중복 확인: (Get) http://localhost:4000/auth/confirm-duplicate-email
- 로그인 세션 확인: (Get) http://localhost:4000/auth

[file]
- 파일업로드: (Post) http://localhost:4000/files/upload
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

