# API Gateway

API Gateway for the diagram analysis microservices system. Provides a single entry point with proxy routing, rate limiting, security headers, CORS configuration, and health check aggregation.

## Tech Stack

- **Runtime:** NestJS 11, TypeScript 5
- **Proxy:** http-proxy-middleware
- **Security:** Helmet, @nestjs/throttler
- **Docs:** Swagger / OpenAPI

## Features

- **Proxy Routing** -- forwards requests to upstream services (Upload Service, Report Service)
- **Rate Limiting** -- configurable via Throttler (default: 60 requests per 60 seconds)
- **Security Headers** -- Helmet middleware applied globally
- **CORS** -- configurable allowed origins, methods, and headers (including `X-Correlation-ID`)
- **Health Check Aggregation** -- calls all backend services and reports combined status
- **Error Handling** -- returns `502 Bad Gateway` when an upstream service is unreachable

## Proxy Routes

| Gateway Path                  | Upstream Service | Description                |
| ----------------------------- | ---------------- | -------------------------- |
| `/api/v1/analyses`            | Upload Service   | List / create analyses     |
| `/api/v1/analyses/:id`        | Upload Service   | Get analysis by ID         |
| `/api/v1/analyses/:id/report` | Report Service   | Get report for an analysis |
| `/api/v1/reports`             | Report Service   | List reports               |
| `/api/v1/reports/:id`         | Report Service   | Get report by ID           |
| `/api/v1/docs`                | Upload Service   | Swagger UI proxy           |

Gateway-docs for the gateway's own endpoints are at `/api/v1/gateway-docs`.

## Environment Variables

| Variable                 | Description                     | Required | Default       |
| ------------------------ | ------------------------------- | -------- | ------------- |
| `NODE_ENV`               | Environment                     | No       | `development` |
| `PORT`                   | Server port                     | No       | `3000`        |
| `UPLOAD_SERVICE_URL`     | Upload Service base URL         | Yes      | -             |
| `PROCESSING_SERVICE_URL` | Processing Service base URL     | Yes      | -             |
| `REPORT_SERVICE_URL`     | Report Service base URL         | Yes      | -             |
| `THROTTLE_TTL`           | Rate limit window in ms         | No       | `60000`       |
| `THROTTLE_LIMIT`         | Max requests per window         | No       | `60`          |
| `CORS_ORIGINS`           | Comma-separated allowed origins | No       | `*`           |

## Running Locally

```bash
cp .env.example .env
# Edit .env with your local values

npm install
npm run start:dev
```

## Tests

```bash
npm test              # Unit tests
npm run test:cov      # With coverage
npm run test:e2e      # End-to-end tests
```

## Docker

```bash
docker build -t api-gateway .
docker run -p 3000:3000 --env-file .env api-gateway
```

## License

UNLICENSED
