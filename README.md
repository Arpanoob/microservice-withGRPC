<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest


```
microservices-eventDriven-BookStore
├─ README.md
├─ apps
│  ├─ books
│  │  ├─ .env
│  │  ├─ src
│  │  │  ├─ books.controller.ts
│  │  │  ├─ books.module.ts
│  │  │  ├─ books.service.spec.ts
│  │  │  ├─ books.service.ts
│  │  │  ├─ entities
│  │  │  │  └─ book.entity.ts
│  │  │  ├─ main.ts
│  │  │  └─ proto
│  │  │     └─ bookstock.proto
│  │  ├─ test
│  │  │  ├─ app.e2e-spec.ts
│  │  │  └─ jest-e2e.json
│  │  └─ tsconfig.app.json
│  ├─ bookstore
│  │  ├─ .env
│  │  ├─ src
│  │  │  ├─ app.controller.ts
│  │  │  ├─ app.module.ts
│  │  │  ├─ app.service.ts
│  │  │  ├─ entities
│  │  │  │  └─ bookstore.entities.ts
│  │  │  ├─ main.ts
│  │  │  └─ proto
│  │  │     └─ bookstock.proto
│  │  ├─ test
│  │  │  ├─ app.e2e-spec.ts
│  │  │  └─ jest-e2e.json
│  │  └─ tsconfig.app.json
│  ├─ bookstore-api-gateway
│  │  ├─ .env
│  │  ├─ src
│  │  │  ├─ auth
│  │  │  │  ├─ auth.module.ts
│  │  │  │  ├─ auth.service.ts
│  │  │  │  ├─ decorators
│  │  │  │  │  ├─ dynamic-roles.decorator.ts
│  │  │  │  │  ├─ exclude.decorator.ts
│  │  │  │  │  └─ roles.decorator.ts
│  │  │  │  ├─ guards
│  │  │  │  │  ├─ auth-guards.ts
│  │  │  │  │  ├─ dynamic-route-authguard.ts
│  │  │  │  │  ├─ dynamicRoute-roleGuard.ts
│  │  │  │  │  └─ role.gaurds.ts
│  │  │  │  └─ jwt-strategy.ts
│  │  │  ├─ bookstore-api-gateway.controller.ts
│  │  │  ├─ bookstore-api-gateway.module.ts
│  │  │  ├─ bookstore-api-gateway.service.ts
│  │  │  ├─ interface
│  │  │  │  └─ request.interface.ts
│  │  │  ├─ interseptor
│  │  │  │  └─ response.interseptor.ts
│  │  │  ├─ main.ts
│  │  │  └─ middleware
│  │  │     └─ response-format.middleware.ts
│  │  ├─ test
│  │  │  ├─ app.e2e-spec.ts
│  │  │  └─ jest-e2e.json
│  │  └─ tsconfig.app.json
│  ├─ orders
│  │  ├─ src
│  │  │  ├─ entities
│  │  │  │  └─ order.entity.ts
│  │  │  ├─ main.ts
│  │  │  ├─ orders.controller.ts
│  │  │  ├─ orders.module.ts
│  │  │  └─ orders.service.ts
│  │  ├─ test
│  │  │  ├─ app.e2e-spec.ts
│  │  │  └─ jest-e2e.json
│  │  └─ tsconfig.app.json
│  ├─ service-repository
│  │  ├─ src
│  │  │  ├─ main.ts
│  │  │  ├─ service-repository.controller.ts
│  │  │  ├─ service-repository.module.ts
│  │  │  └─ service-repository.service.ts
│  │  ├─ test
│  │  │  ├─ app.e2e-spec.ts
│  │  │  └─ jest-e2e.json
│  │  └─ tsconfig.app.json
│  └─ users
│     ├─ .env
│     ├─ src
│     │  ├─ entities
│     │  │  └─ user.entities.ts
│     │  ├─ main.ts
│     │  ├─ users.controller.ts
│     │  ├─ users.module.ts
│     │  └─ users.service.ts
│     ├─ test
│     │  ├─ app.e2e-spec.ts
│     │  └─ jest-e2e.json
│     └─ tsconfig.app.json
├─ dist
│  └─ apps
│     ├─ books
│     │  └─ main.js
│     ├─ bookstore
│     │  └─ main.js
│     └─ src
│        └─ proto
│           └─ bookstock.proto
├─ eslint.config.mjs
├─ libs
│  └─ contracts
│     ├─ src
│     │  ├─ bookStore
│     │  │  ├─ create-bookstore.dto.ts
│     │  │  └─ update-bookstore.dto.ts
│     │  ├─ books
│     │  │  ├─ book.dto.ts
│     │  │  ├─ create-book.dto.ts
│     │  │  └─ update-book.dto.ts
│     │  ├─ orders
│     │  │  ├─ create-order.dto.ts
│     │  │  ├─ order-item.dto.ts
│     │  │  └─ update-order.dto.ts
│     │  └─ users
│     │     ├─ create-user.dto.ts
│     │     └─ login-user.dto.ts
│     └─ tsconfig.lib.json
├─ nest-cli.json
├─ package-lock.json
├─ package.json
├─ tsconfig.build.json
└─ tsconfig.json

```

# microservice-withGRPC
