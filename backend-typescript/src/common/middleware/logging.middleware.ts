import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip, body } = req;
    const requestTime = Date.now();
    const requestId = Math.random().toString(36).substring(2, 15);

    // リクエスト情報をログ
    this.logger.log(
      `[${requestId}] Request ${method} ${originalUrl} - Body: ${JSON.stringify(body)}`,
      'HTTP',
    );

    // レスポンスをキャプチャするために元のメソッドを保存
    const originalSend = res.send;
    const originalJson = res.json;
    let responseBody: any;

    // jsonメソッドをオーバーライド
    res.json = function (body: any): Response {
      responseBody = body;
      return originalJson.call(this, body);
    };

    // sendメソッドをオーバーライド
    res.send = function (body: any): Response {
      responseBody = body;
      return originalSend.call(this, body);
    };

    // レスポンス完了時のログ
    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - requestTime;

      if (statusCode >= 500) {
        this.logger.error(
          `[${requestId}] Response ${statusCode} - ${responseTime}ms - ${JSON.stringify(responseBody)}`,
          undefined,
          'HTTP',
        );
      } else if (statusCode >= 400) {
        this.logger.warn(
          `[${requestId}] Response ${statusCode} - ${responseTime}ms - ${JSON.stringify(responseBody)}`,
          'HTTP',
        );
      } else {
        this.logger.log(
          `[${requestId}] Response ${statusCode} - ${responseTime}ms`,
          'HTTP',
        );
      }
    });

    next();
  }
} 