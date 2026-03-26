import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { HealthController, HealthResponse } from './health.controller'

describe('HealthController', () => {
  let controller: HealthController
  let configService: ConfigService

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, string> = {
        'app.uploadServiceUrl': 'http://upload-service:3001',
        'app.processingServiceUrl': 'http://processing-service:3002',
        'app.reportServiceUrl': 'http://report-service:3003',
      }
      return config[key] ?? defaultValue
    }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    controller = module.get<HealthController>(HealthController)
    configService = module.get<ConfigService>(ConfigService)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('health()', () => {
    it('should return ok status when all services are healthy', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
      })
      global.fetch = mockFetch as any

      const result: HealthResponse = await controller.health()

      expect(result.status).toBe('ok')
      expect(result.service).toBe('api-gateway')
      expect(result.version).toBe('1.0.0')
      expect(result.timestamp).toBeDefined()
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp)
      expect(result.services['upload-service']).toBe('ok')
      expect(result.services['processing-service']).toBe('ok')
      expect(result.services['report-service']).toBe('ok')
    })

    it('should return degraded status when a service returns non-ok response', async () => {
      const mockFetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: true, status: 200 })
        .mockResolvedValueOnce({ ok: false, status: 503 })
        .mockResolvedValueOnce({ ok: true, status: 200 })
      global.fetch = mockFetch as any

      const result: HealthResponse = await controller.health()

      expect(result.status).toBe('degraded')
      expect(Object.values(result.services)).toContain('error')
    })

    it('should return degraded status when a service is unreachable', async () => {
      const mockFetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: true, status: 200 })
        .mockRejectedValueOnce(new Error('ECONNREFUSED'))
        .mockResolvedValueOnce({ ok: true, status: 200 })
      global.fetch = mockFetch as any

      const result: HealthResponse = await controller.health()

      expect(result.status).toBe('degraded')
      expect(Object.values(result.services)).toContain('unreachable')
    })

    it('should return degraded status when all services are unreachable', async () => {
      const mockFetch = jest.fn().mockRejectedValue(new Error('Network failure'))
      global.fetch = mockFetch as any

      const result: HealthResponse = await controller.health()

      expect(result.status).toBe('degraded')
      expect(result.services['upload-service']).toBe('unreachable')
      expect(result.services['processing-service']).toBe('unreachable')
      expect(result.services['report-service']).toBe('unreachable')
    })

    it('should call health endpoint on each service URL', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true, status: 200 })
      global.fetch = mockFetch as any

      await controller.health()

      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://upload-service:3001/api/v1/health',
        expect.objectContaining({ signal: expect.any(Object) }),
      )
      expect(mockFetch).toHaveBeenCalledWith(
        'http://processing-service:3002/api/v1/health',
        expect.objectContaining({ signal: expect.any(Object) }),
      )
      expect(mockFetch).toHaveBeenCalledWith(
        'http://report-service:3003/api/v1/health',
        expect.objectContaining({ signal: expect.any(Object) }),
      )
    })

    it('should include valid ISO timestamp in response', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true, status: 200 })
      global.fetch = mockFetch as any

      const before = new Date()
      const result = await controller.health()
      const after = new Date()

      const timestamp = new Date(result.timestamp)
      expect(timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(timestamp.getTime()).toBeLessThanOrEqual(after.getTime())
    })
  })
})
