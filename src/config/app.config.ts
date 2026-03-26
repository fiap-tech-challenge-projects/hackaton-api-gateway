import { registerAs } from "@nestjs/config";

export const appConfig = registerAs("app", () => ({
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  uploadServiceUrl:
    process.env.UPLOAD_SERVICE_URL || "http://upload-service:3001",
  processingServiceUrl:
    process.env.PROCESSING_SERVICE_URL || "http://processing-service:3002",
  reportServiceUrl:
    process.env.REPORT_SERVICE_URL || "http://report-service:3003",
  throttleTtl: parseInt(process.env.THROTTLE_TTL || "60000", 10),
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT || "60", 10),
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : ["*"],
  maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
}));
