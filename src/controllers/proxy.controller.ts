import { All, Controller, Req, Res, Next } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiExcludeController } from "@nestjs/swagger";
import { Request, Response, NextFunction } from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";

@ApiExcludeController()
@Controller()
export class ProxyController {
  private readonly uploadProxy: ReturnType<typeof createProxyMiddleware>;
  private readonly reportProxy: ReturnType<typeof createProxyMiddleware>;

  constructor(private readonly configService: ConfigService) {
    const uploadServiceUrl = this.configService.get<string>(
      "app.uploadServiceUrl",
    );
    const reportServiceUrl = this.configService.get<string>(
      "app.reportServiceUrl",
    );

    const commonOptions: Partial<Options> = {
      changeOrigin: true,
      on: {
        error: (err, req, res) => {
          const response = res as Response;
          response.status(502).json({
            statusCode: 502,
            error: "Bad Gateway",
            message: "Upstream service unavailable",
          });
        },
      },
    };

    this.uploadProxy = createProxyMiddleware({
      target: uploadServiceUrl,
      ...commonOptions,
    });

    this.reportProxy = createProxyMiddleware({
      target: reportServiceUrl,
      ...commonOptions,
    });
  }

  // IMPORTANT: More specific routes must be declared before generic ones.
  // /api/v1/analyses/:id/report must come before /api/v1/analyses/:id,
  // and /api/v1/reports/:id must come before /api/v1/reports, so that
  // NestJS matches the specific path first during route resolution.

  @All("/api/v1/analyses")
  proxyAnalyses(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): void {
    this.uploadProxy(req, res, next);
  }

  @All("/api/v1/analyses/:id/report")
  proxyAnalysisReport(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): void {
    this.reportProxy(req, res, next);
  }

  @All("/api/v1/analyses/:id")
  proxyAnalysisById(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): void {
    this.uploadProxy(req, res, next);
  }

  @All("/api/v1/reports/:id")
  proxyReportById(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): void {
    this.reportProxy(req, res, next);
  }

  @All("/api/v1/reports")
  proxyReports(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): void {
    this.reportProxy(req, res, next);
  }

  @All("/api/v1/docs")
  proxyDocs(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): void {
    this.uploadProxy(req, res, next);
  }
}
