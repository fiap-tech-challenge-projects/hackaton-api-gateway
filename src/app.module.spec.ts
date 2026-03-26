import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "./app.module";
import { HealthController } from "./controllers/health.controller";
import { ProxyController } from "./controllers/proxy.controller";

describe("AppModule", () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it("should compile the module", () => {
    expect(module).toBeDefined();
  });

  it("should provide HealthController", () => {
    const controller = module.get<HealthController>(HealthController);
    expect(controller).toBeDefined();
  });

  it("should provide ProxyController", () => {
    const controller = module.get<ProxyController>(ProxyController);
    expect(controller).toBeDefined();
  });
});
