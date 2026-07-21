import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fsr = require('file-stream-rotator');
const originalGetDate = fsr.getDate;
fsr.getDate = function (format: any, date_format: any, utc: any) {
  if (date_format === 'CUSTOM_HOURLY') {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');

    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());

    const currentHour = d.getHours();
    const nextHour = (currentHour + 1) % 24;

    const dateStr = `${day}-${month}-${year}`;
    const currentHourStr = pad(currentHour);
    const nextHourStr = pad(nextHour);

    return `${dateStr}/${currentHourStr}:00-${nextHourStr}:00`;
  }
  return originalGetDate.apply(this, [format, date_format, utc]);
};

const fileTransportOptions = {
  filename: 'logs/%DATE%.log',
  datePattern: 'CUSTOM_HOURLY',
  zippedArchive: false,
  maxFiles: '90d',

  format: winston.format.combine(
    winston.format((info: any) => {
      const ignoredContexts = [
        'InstanceLoader',
        'RoutesResolver',
        'RouterExplorer',
        'NestApplication',
        'NestFactory',
        'ExceptionsHandler',
      ];
      if (info.context && ignoredContexts.includes(info.context)) {
        return false; // drop these logs
      }
      return info;
    })(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }: any) => {
      // Remove stack trace to prevent log bloat
      if (meta.stack) {
        delete meta.stack;
      }

      // Return a pure JSON string so log parsers can read it perfectly
      return JSON.stringify({ timestamp, level, message, ...meta });
    }),
  ),
};

// Console transport: colorized, same format
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format((info: any) => {
      const ignoredContexts = ['ExceptionsHandler'];
      if (info.context && ignoredContexts.includes(info.context)) {
        return false;
      }
      return info;
    })(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }: any) => {
      if (meta.type === 'http_request_summary') return '';

      if (
        meta.type === 'http_success_summary' ||
        meta.type === 'http_success' ||
        meta.type === 'http_error_summary' ||
        meta.type === 'http_error'
      ) {
        const terminalJson = {
          timestamp,
          level,
          route: meta.url,
          method: meta.method,
          status: meta.type.includes('success') ? 'success' : 'failed',
          message: meta.type.includes('success')
            ? 'Request completed successfully'
            : meta.errorMessage || 'Request failed',
          executionTime: `${meta.durationMs?.toFixed(2)}ms`,
        };
        return `${timestamp} [${level}]: ${JSON.stringify(terminalJson)}`;
      }
      let logLine = `${timestamp} [${level}]`;
      if (meta.context) {
        logLine += ` [${meta.context}]`;
      }
      logLine += `: ${message}`;

      // Remove stack trace to keep terminal output clean
      if (meta.stack) {
        delete meta.stack;
      }

      const cleanMeta = { ...meta };
      delete cleanMeta.context;
      delete cleanMeta.stack;
      if (Object.keys(cleanMeta).length > 0) {
        logLine += ` | ${JSON.stringify(cleanMeta)}`;
      }

      return logLine;
    }),
  ),
});

const fileTransportInstance = new winston.transports.DailyRotateFile({
  ...fileTransportOptions,
}) as any;

export const logger = WinstonModule.createLogger({
  transports: [fileTransportInstance, consoleTransport],
  level: 'debug',
});

process.on('uncaughtException', (err: unknown) => {
  try {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error({
      level: 'error',
      context: 'uncaughtException',
      message: error.message,
      stack: error.stack,
    });
  } catch {
    // never crash logging
  }
});

process.on('unhandledRejection', (reason: unknown) => {
  try {
    const msg =
      reason instanceof Error
        ? reason.message
        : typeof reason === 'string'
          ? reason
          : JSON.stringify(reason);

    const stack = reason instanceof Error ? reason.stack : undefined;

    logger.error({
      level: 'error',
      context: 'unhandledRejection',
      message: msg,
      stack,
    });
  } catch {
    // never crash logging
  }
});
