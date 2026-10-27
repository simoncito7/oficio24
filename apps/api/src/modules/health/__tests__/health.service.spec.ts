import { describe, expect, it } from 'vitest';
import { HealthService } from '../health.service.js';

describe('HealthService', () => {
  const service = new HealthService();

  describe('getHealth', () => {
    it('should return a valid health status', () => {
      const health = service.getHealth();

      expect(health.status).toBe('ok');

      expect(new Date(health.timestamp).toISOString())
        .toBe(health.timestamp);

      expect(health.uptime).toBeGreaterThanOrEqual(0);
    });
  });
});
