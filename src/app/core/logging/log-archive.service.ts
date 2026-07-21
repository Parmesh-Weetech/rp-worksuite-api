import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { access, mkdir, rm } from 'fs/promises';
import * as fs from 'fs';
import * as path from 'path';
const archiver = require('archiver');
import { loggingConfig } from './logging.config';
import { logger } from '../../common/logger/logger';

@Injectable()
export class LogArchiverService {
  constructor(
    @Inject(loggingConfig.KEY)
    private readonly config: ConfigType<typeof loggingConfig>,
  ) {}

  async archiveOldLogFiles(): Promise<number> {
    const logsDirPath = path.resolve('logs');
    const archiveDirPath = path.resolve(this.config.logsArchiveDirPath);

    await mkdir(archiveDirPath, { recursive: true });

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = yesterday.getFullYear();
    const month = pad(yesterday.getMonth() + 1);
    const day = pad(yesterday.getDate());
    const folderName = `${day}-${month}-${year}`;

    const targetFolderPath = path.join(logsDirPath, folderName);

    try {
      await access(targetFolderPath);
    } catch {
      logger.debug?.(`No log folder found for yesterday (${folderName}).`);
      return 0;
    }

    const zipFileName = `${folderName}.zip`;
    const targetZipPath = path.resolve(archiveDirPath, zipFileName);

    try {
      await new Promise<void>((resolve, reject) => {
        const output = fs.createWriteStream(targetZipPath);
        const archive = archiver('zip', {
          zlib: { level: 9 }, // Sets the compression level.
        });

        output.on('close', () => {
          resolve();
        });

        archive.on('warning', (err: any) => {
          if (err.code === 'ENOENT') {
            logger.warn(`Archiver warning: ${err.message}`);
          } else {
            reject(err);
          }
        });

        archive.on('error', (err: any) => {
          reject(err);
        });

        archive.pipe(output);

        // Append files from the directory, mapping to folderName inside the zip
        archive.directory(targetFolderPath, folderName);

        archive.finalize();
      });

      await rm(targetFolderPath, { recursive: true, force: true });

      logger.log(
        `Successfully archived logs for ${folderName} into ${targetZipPath} and deleted the original folder.`,
      );
      return 1;
    } catch (error: any) {
      logger.error(
        `Failed to archive logs for ${folderName}: ${error.message}`,
      );
      return 0;
    }
  }
}
