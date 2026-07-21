import { Injectable } from '@nestjs/common';
import { isTest } from '../../common/helpers/env';
import { MailService } from '../../mail/services/mail.service';
import { EmailTemplates } from '../../mail/types/email-templates.type';
import { DeviceMetadataService } from '../../device/services/device-metadata.service';
import { ConfigService } from '@nestjs/config';
import { logger } from 'src/app/common/logger';
import { SeriousStatusCode } from './dev-alert-email.types';

function splitRecipients(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function getErrorText(err: unknown): string {
  if (err instanceof Error) {
    const stack = err.stack || err.message;
    const lines = stack.split('\n');

    // Keep the first line (error type/message) and any lines that are from the application code (not node_modules or internal Node.js)
    const appLines = lines.filter(
      (line, i) =>
        i === 0 || (!line.includes('node_modules') && !line.includes('node:')),
    );

    // If filtering removes all frames, fallback to showing the first 4 frames
    const finalLines =
      appLines.length > 1 ? appLines.slice(0, 7) : lines.slice(0, 5);

    if (finalLines.length < lines.length) {
      finalLines.push(
        `    ... (${lines.length - finalLines.length + 1} framework lines truncated for readability)`,
      );
    }

    return finalLines.join('\n');
  }
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function shouldMapDbUnavailableTo503(err: unknown): boolean {
  const text = getErrorText(err).toLowerCase();

  return (
    text.includes('too many connections') ||
    text.includes('connection terminated') ||
    text.includes('terminating connection') ||
    text.includes('server closed the connection') ||
    text.includes('connection refused') ||
    text.includes('econnrefused') ||
    text.includes('etimedout') ||
    text.includes('timeout') ||
    text.includes('57p01')
  );
}

@Injectable()
export class DevAlertEmailSender {
  private readonly lastSentAtMs = new Map<SeriousStatusCode, number>();

  constructor(
    private readonly mailService: MailService,
    private readonly deviceMetadataService: DeviceMetadataService,
    private readonly configService: ConfigService,
  ) {}

  async send(params: {
    statusCode: SeriousStatusCode;
    requestInfo?: {
      method?: string;
      url?: string;
      headers?: Record<string, unknown>;
      body?: unknown;
      query?: unknown;
      errorCode?: unknown;
      ip?: string;
      userAgent?: string;
      user?: any;
    };
    error?: unknown;
  }): Promise<void> {
    if (isTest()) return;

    const recipients = splitRecipients(
      this.configService.get<string>('DEVELOPER_EMAIL'),
    );
    if (recipients.length === 0) return;

    // Throttle per status code. Default: 60s.
    const throttleMs =
      Number(this.configService.get<string>('DEV_ALERT_EMAIL_THROTTLE_MS')) ||
      60000;
    const now = Date.now();
    const prev = this.lastSentAtMs.get(params.statusCode);
    if (prev && throttleMs > 0 && now - prev < throttleMs) return;

    const statusCode = params.statusCode;
    const timestamp = new Date().toISOString();

    const path = params.requestInfo?.url || '';
    const method = params.requestInfo?.method || '';

    const stackText = params.error ? getErrorText(params.error) : undefined;
    const errorCode = params.requestInfo?.errorCode;

    const envString = (
      this.configService.get<string>('NODE_ENV') || 'DEV'
    ).toUpperCase();
    const projectName =
      this.configService.get<string>('PROJECT_NAME') || 'RitualPlanner';
    const subject = `⚠️ [${envString}] ${projectName} - Critical ${statusCode} Error`;

    // Mark sent before awaiting to reduce duplicated emails on slow SMTP.
    this.lastSentAtMs.set(params.statusCode, now);

    let locationStr = 'Unknown Location';
    if (params.requestInfo?.ip && params.requestInfo?.userAgent) {
      try {
        const metadata = await this.deviceMetadataService.extract(
          params.requestInfo.ip,
          params.requestInfo.userAgent,
        );

        const geoInfo = metadata.geoLocationInfo;
        const parts: string[] = [];
        if (geoInfo?.city) parts.push(geoInfo.city);
        if (geoInfo?.country) parts.push(geoInfo.country);

        if (parts.length > 0) {
          locationStr = parts.join(', ');
        }
      } catch (e) {
        // Ignore metadata fetch errors
      }
    }

    const reqUser = params.requestInfo?.user;
    let name = 'Unknown';
    if (reqUser?.firstName || reqUser?.lastName) {
      name = `${reqUser.firstName || ''} ${reqUser.lastName || ''}`.trim();
    }

    const userPayload = {
      id: reqUser?.id || 'Unknown',
      name,
      username: reqUser?.username || 'Unknown',
      email: reqUser?.email || 'Unknown',
    };

    try {
      await this.mailService.sendEmail({
        to: recipients.join(','),
        subject,
        templateName: EmailTemplates.DEV_ALERT_5XX,
        type: EmailTemplates.DEV_ALERT_5XX as any,
        data: {
          errorCode: statusCode,
          environment:
            this.configService.get<string>('NODE_ENV') || 'development',
          timestamp,
          method,
          path,
          ip: params.requestInfo?.ip || 'Unknown',
          location: locationStr,
          user: userPayload,
          errorMessage:
            typeof params.error === 'object' &&
            params.error !== null &&
            'message' in params.error
              ? (params.error as any).message
              : '',
          stackTrace: stackText || '',
          headers: params.requestInfo?.headers || {},
          query: params.requestInfo?.query || {},
          body: params.requestInfo?.body || {},
        },
        payload: {},
      });
    } catch (err: any) {
      logger.error(
        `DevAlertEmailSender: failed to send developer alert email: ${err.message?.split('\n')[0]}`,
      );
    }
  }

  // Public helper to keep filter logic simple.
  mapToStatusCode(statusCode: number, error: unknown): SeriousStatusCode {
    const serious: SeriousStatusCode[] = [500, 501, 502, 503, 504];
    const base = (
      serious.includes(statusCode as SeriousStatusCode)
        ? (statusCode as SeriousStatusCode)
        : 500
    ) as SeriousStatusCode;
    if (base !== 503 && shouldMapDbUnavailableTo503(error)) return 503;
    return base;
  }
}
