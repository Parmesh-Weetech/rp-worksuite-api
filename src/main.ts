import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { AppModule } from './app/app.module';
import { setupApp } from './setup-app';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 5001;

  await setupApp(app);

  await app.listen(port).then(() => {
    console.log(
      `Application is running on: http://localhost:${port}/api/docs/v1`,
    );
  });
}
bootstrap().catch((error) => {
  console.error('Application failed to start: ', error);
  process.exit(1);
});
