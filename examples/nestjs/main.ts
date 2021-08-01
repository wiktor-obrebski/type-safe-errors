import { NestFactory } from '@nestjs/core';
import morgan from 'morgan';

import { PayModule } from './pay/pay.module';

bootstrap();

async function bootstrap() {
  const app = await NestFactory.create(PayModule);

  const logger = morgan('combined');
  app.use(logger);

  await app.listen(3000);
}
