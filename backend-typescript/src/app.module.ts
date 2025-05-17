import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TodoModule } from './todo/todo.module';
import { LoggerService } from './common/logger/logger.service';
import { LoggingMiddleware } from './common/middleware/logging.middleware';

@Module({
  imports: [TodoModule],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes('*'); // すべてのルートにミドルウェアを適用
  }
} 