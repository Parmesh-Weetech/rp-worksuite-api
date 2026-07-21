import { logger } from './logger';
import 'reflect-metadata';

export const LOG_AROUND_METADATA_KEY = 'logAround';

const lastLogTime = new Map<string, number>();

function safeStringify(obj: unknown): string {
  const cache = new Set();
  try {
    return JSON.stringify(obj, (key: string, value: unknown) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return '[Circular]';
        }
        cache.add(value);
      }
      return value;
    });
  } catch (err) {
    logger.error('Error stringifying object for logging:', err);
    return '[Unserializable]';
  }
}

export const logAround = (options?: {
  ignoreArgs?: boolean;
  ignoreReturn?: boolean;
}) => {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    // Do not break runtime if reflect-metadata isn't available.
    try {
      Reflect.defineMetadata(LOG_AROUND_METADATA_KEY, true, descriptor.value);
    } catch {}

    const targetMethod = descriptor.value as (...args: unknown[]) => unknown;

    if (targetMethod.constructor.name === 'AsyncFunction') {
      descriptor.value = async function (this: unknown, ...args: unknown[]) {
        const instance = this as { constructor: { name: string } };
        const className = instance?.constructor?.name || 'unknown';
        const key = `${className}.${propertyKey}`;
        const now = Date.now();
        const lastTime = lastLogTime.get(key) || 0;
        const isInLoop = now - lastTime < 100;
        lastLogTime.set(key, now);

        try {
          const hasArgs = args.length > 0;
          const isSimple = !options;

          if (!isInLoop) {
            if (isSimple || options?.ignoreArgs || !hasArgs) {
              logger.log(`[${className}.${propertyKey}] called`);
            } else {
              logger.log(
                `[${className}.${propertyKey}] called with args: ${safeStringify(args)}`,
              );
            }
          }

          const value = (await targetMethod.apply(this, args)) as unknown;
          const time = Date.now() - now;

          if (!isInLoop) {
            if (isSimple || options?.ignoreReturn || value === undefined) {
              logger.log(
                `[${className}.${propertyKey}] completed in ${time}ms`,
              );
            } else {
              logger.log(
                `[${className}.${propertyKey}] returned: ${safeStringify(value)} (in ${time}ms)`,
              );
            }
          }

          return value;
        } catch (error) {
          const time = Date.now() - now;
          const err = error instanceof Error ? error : new Error(String(error));

          if (!options?.ignoreArgs && args.length > 0) {
            logger.error(
              `[${className}.${propertyKey}] failed with args: ${safeStringify(args)}`,
            );
          }

          logger.error(
            `[${className}.${propertyKey}] threw error: ${err.message} (in ${time}ms)`,
          );
          throw error;
        }
      };

      return descriptor;
    } else {
      descriptor.value = function (this: unknown, ...args: unknown[]) {
        const instance = this as { constructor: { name: string } };
        const className = instance?.constructor?.name || 'unknown';
        const key = `${className}.${propertyKey}`;
        const now = Date.now();
        const lastTime = lastLogTime.get(key) || 0;
        const isInLoop = now - lastTime < 100;
        lastLogTime.set(key, now);

        try {
          const hasArgs = args.length > 0;
          const isSimple = !options;

          if (!isInLoop) {
            if (isSimple || options?.ignoreArgs || !hasArgs) {
              logger.log(`[${className}.${propertyKey}] called`);
            } else {
              logger.log(
                `[${className}.${propertyKey}] called with args: ${safeStringify(args)}`,
              );
            }
          }

          const value = targetMethod.apply(this, args) as unknown;
          const time = Date.now() - now;

          if (!isInLoop) {
            if (isSimple || options?.ignoreReturn || value === undefined) {
              logger.log(
                `[${className}.${propertyKey}] completed in ${time}ms`,
              );
            } else {
              logger.log(
                `[${className}.${propertyKey}] returned: ${safeStringify(value)} (in ${time}ms)`,
              );
            }
          }

          return value;
        } catch (error) {
          const time = Date.now() - now;
          const err = error instanceof Error ? error : new Error(String(error));

          if (!options?.ignoreArgs && args.length > 0) {
            logger.error(
              `[${className}.${propertyKey}] failed with args: ${safeStringify(args)}`,
            );
          }

          logger.error(
            `[${className}.${propertyKey}] threw error: ${err.message} (in ${time}ms)`,
          );
          throw error;
        }
      };

      return descriptor;
    }
  };
};
