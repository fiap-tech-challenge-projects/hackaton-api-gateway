import { Injectable, NestMiddleware } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class FileSizeLimitMiddleware implements NestMiddleware {
  private readonly maxFileSizeBytes: number;

  constructor(private readonly configService: ConfigService) {
    this.maxFileSizeBytes = this.configService.get<number>(
      "app.maxFileSizeBytes",
      10 * 1024 * 1024,
    );
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const contentLength = parseInt(req.headers["content-length"] || "0", 10);

    if (contentLength > this.maxFileSizeBytes) {
      res.status(413).json({
        statusCode: 413,
        error: "Payload Too Large",
        message: "File size exceeds maximum of 10MB",
      });
      return;
    }

    next();
  }
}
