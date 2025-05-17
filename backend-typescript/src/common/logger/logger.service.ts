import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import pino from 'pino';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private logger: pino.Logger;
  private context?: string;

  constructor() {
    this.logger = pino({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l o',
          ignore: 'pid,hostname',
          singleLine: false,
          messageFormat: '{context}: {msg}',
        },
      },
    });
    
    // すべての環境変数をログに出力（開発時に便利）
    if (process.env.NODE_ENV !== 'production') {
      this.debug('環境変数一覧:', 'Environment');
      this.debug(JSON.stringify(process.env, null, 2), 'Environment');
    }
  }

  setContext(context: string) {
    this.context = context;
    return this;
  }

  getContext() {
    return this.context;
  }

  log(message: any, context?: string): void {
    const contextToUse = context || this.context || 'Application';
    this.logger.info({ context: contextToUse }, message);
  }

  error(message: any, trace?: string, context?: string): void {
    const contextToUse = context || this.context || 'Application';
    this.logger.error(
      {
        context: contextToUse,
        ...(trace && { trace }),
      },
      message instanceof Error ? message.stack : message,
    );
  }

  warn(message: any, context?: string): void {
    const contextToUse = context || this.context || 'Application';
    this.logger.warn({ context: contextToUse }, message);
  }

  debug(message: any, context?: string): void {
    const contextToUse = context || this.context || 'Application';
    this.logger.debug({ context: contextToUse }, message);
  }

  verbose(message: any, context?: string): void {
    const contextToUse = context || this.context || 'Application';
    this.logger.trace({ context: contextToUse }, message);
  }
} 