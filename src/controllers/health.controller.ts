import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";

export interface ServiceHealth {
  [serviceName: string]: "ok" | "error" | "unreachable";
}

export interface HealthResponse {
  status: "ok" | "degraded";
  service: string;
  version: string;
  timestamp: string;
  services: ServiceHealth;
}

@ApiTags("health")
@Controller()
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get("/api/v1/health")
  @SkipThrottle()
  @ApiOperation({ summary: "Aggregated health check for all services" })
  @ApiResponse({ status: 200, description: "Health status of all services" })
  async health(): Promise<HealthResponse> {
    const services: Record<string, string> = {
      "upload-service": this.configService.get<string>(
        "app.uploadServiceUrl",
        "http://upload-service:3001",
      ),
      "processing-service": this.configService.get<string>(
        "app.processingServiceUrl",
        "http://processing-service:3002",
      ),
      "report-service": this.configService.get<string>(
        "app.reportServiceUrl",
        "http://report-service:3003",
      ),
    };

    const results: ServiceHealth = {};

    await Promise.all(
      Object.entries(services).map(async ([name, url]) => {
        try {
          const res = await fetch(`${url}/api/v1/health`, {
            signal: AbortSignal.timeout(3000),
          });
          results[name] = res.ok ? "ok" : "error";
        } catch {
          results[name] = "unreachable";
        }
      }),
    );

    const allOk = Object.values(results).every((s) => s === "ok");

    return {
      status: allOk ? "ok" : "degraded",
      service: "api-gateway",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      services: results,
    };
  }
}
