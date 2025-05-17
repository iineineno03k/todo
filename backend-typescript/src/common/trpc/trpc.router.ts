import { INestApplication, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { initTRPC, TRPCError } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { TodoService } from '../../todo/services/todo.service';
import { createTodoSchema } from '../../todo/dtos/create-todo.dto';
import { updateTodoSchema } from '../../todo/dtos/update-todo.dto';

const t = initTRPC.create();

@Injectable()
export class TrpcRouter {
  constructor(private readonly todoService: TodoService) {}

  appRouter = t.router({
    // Todo操作のためのルーター
    todos: t.router({
      // 全てのTodoを取得
      findAll: t.procedure.query(async () => {
        return this.todoService.findAll();
      }),

      // IDによるTodo取得
      findById: t.procedure.input(z.number()).query(async ({ input }) => {
        const todo = await this.todoService.findById(input);
        if (!todo) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Todo not found',
          });
        }
        return todo;
      }),

      // 新規Todo作成
      create: t.procedure.input(createTodoSchema).mutation(async ({ input }) => {
        return this.todoService.create(input);
      }),

      // Todo更新
      update: t.procedure
        .input(
          z.object({
            id: z.number(),
            data: updateTodoSchema,
          }),
        )
        .mutation(async ({ input }) => {
          const todo = await this.todoService.update(input.id, input.data);
          if (!todo) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Todo not found',
            });
          }
          return todo;
        }),

      // Todo削除
      delete: t.procedure.input(z.number()).mutation(async ({ input }) => {
        const deleted = await this.todoService.delete(input);
        if (!deleted) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Todo not found',
          });
        }
        return { success: true };
      }),
    }),
  });

  enableTRPC(app: INestApplication) {
    // express app取得
    const expressApp = app.getHttpAdapter().getInstance();

    // tRPC APIエンドポイントの設定
    expressApp.use(
      '/trpc',
      trpcExpress.createExpressMiddleware({
        router: this.appRouter,
      }),
    );

    return this;
  }
}

export type AppRouter = TrpcRouter['appRouter'];
