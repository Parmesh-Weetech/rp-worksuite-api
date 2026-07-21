import type { ConfigService } from '@nestjs/config';

/**
 * Safely retrieve a config value from ConfigService.
 * This eliminates the need for non-null assertions while maintaining type safety.
 */
export const getConfig = <T>(configService: ConfigService, key: string): T => {
  const value = configService.get<T>(key);
  if (value === undefined || value === null) {
    throw new Error(`Configuration key '${key}' is not defined`);
  }
  return value;
};
