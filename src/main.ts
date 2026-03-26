import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import helmet from 'helmet'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Security headers
  app.use(helmet())

  // CORS
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['*']

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Correlation-ID',
      'X-Request-ID',
    ],
    credentials: true,
  })

  // Swagger for gateway's own endpoints
  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('API Gateway for diagram analysis microservices system')
    .setVersion('1.0')
    .addTag('health', 'Gateway health check')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/v1/gateway-docs', app, document)

  const port = process.env.PORT || 3000
  await app.listen(port)

  console.log(`API Gateway is running on: http://localhost:${port}`)
  console.log(`Gateway docs available at: http://localhost:${port}/api/v1/gateway-docs`)
}

bootstrap()
