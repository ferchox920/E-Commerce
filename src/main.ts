import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import  config  from 'config';
import { TransformationInterception } from './resposeInterceptor';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.useGlobalInterceptors(new TransformationInterception())
  await app.listen(config.get('port'),()=>{
    console.log(`Server is running in port ${config.get('port')}`);
    
  });
}
bootstrap();
