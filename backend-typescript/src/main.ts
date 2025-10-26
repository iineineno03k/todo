import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './common/logger/logger.service';

async function bootstrap() {
  // アプリケーション起動時のロガーを作成
  const appLogger = new LoggerService().setContext('Bootstrap');
  
  try {
    appLogger.log('アプリケーションを起動しています...');
    
    const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // ロガーの設定
    const logger = await app.resolve(LoggerService);
    app.useLogger(logger);

    // CORSの設定
    app.enableCors({
      origin: [
        'http://localhost:4200', // Angularフロントエンド用
        'http://localhost:3000', // Next.jsフロントエンド用
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
    appLogger.log('CORS設定を適用しました');

    // グローバルプレフィックスの設定
    app.setGlobalPrefix('api');
    appLogger.log('APIグローバルプレフィックスを設定しました');

    const port = process.env.PORT || 8080;
    await app.listen(port);

    appLogger.log(`アプリケーションが起動しました: http://localhost:${port}`);
  } catch (error) {
    appLogger.error(`アプリケーション起動中にエラーが発生しました: ${error.message}`, error.stack);
    process.exit(1);
  }
}

bootstrap().catch(err => {
  console.error('予期せぬエラーが発生しました:', err);
  process.exit(1);
}); 