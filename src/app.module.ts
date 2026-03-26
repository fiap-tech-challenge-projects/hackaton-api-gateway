import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { appConfig } from "./config/app.config";
import { CorrelationIdMiddleware } from "./middleware/correlation-id.middleware";
import { FileSizeLimitMiddleware } from "./middleware/file-size-limit.middleware";
import { HealthController } from "./controllers/health.controller";
import { ProxyController } from "./controllers/proxy.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ".env",
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => [
        {
          name: "default",
          ttl: parseInt(process.env.THROTTLE_TTL || "60000", 10),
          limit: parseInt(process.env.THROTTLE_LIMIT || "60", 10),
        },
      ],
    }),
  ],
  controllers: [HealthController, ProxyController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes("*");

    consumer
      .apply(FileSizeLimitMiddleware)
      .forRoutes({ path: "/api/v1/analyses", method: RequestMethod.POST });
  }
}
