import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

describe('TodoController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let todoId: number;

  beforeAll(async () => {
    // テスト用の環境変数をロード
    const envPath = path.resolve(__dirname, '../.env.test');
    if (fs.existsSync(envPath)) {
      require('dotenv').config({ path: envPath });
    }

    // テスト用のモジュールと環境設定
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // main.tsと同じ設定を適用
    app.setGlobalPrefix('api');
    await app.init();

    // テスト用のPrismaクライアント
    prisma = new PrismaClient();
    
    // テスト前にデータベースをクリア
    await prisma.todo.deleteMany({});
  });

  afterAll(async () => {
    // テストデータクリーンアップ
    await prisma.todo.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  // 各テスト実行前にデータをクリア
  beforeEach(async () => {
    await prisma.todo.deleteMany({});
  });

  // 最初にルーティングが正しく設定されているか確認するテスト
  it('API routing should be correctly configured', async () => {
    // グローバルプレフィックス + コントローラールートのパス
    const response = await request(app.getHttpServer()).get('/api/todos');
    expect(response.status).not.toBe(404); // 404でないことを確認
  });

  it('GET /api/todos - should return an empty array initially', () => {
    return request(app.getHttpServer())
      .get('/api/todos')
      .expect(HttpStatus.OK)
      .expect([]);
  });

  it('POST /api/todos - should create a new todo', () => {
    return request(app.getHttpServer())
      .post('/api/todos')
      .send({ task: 'E2E Test Task' })
      .expect(HttpStatus.CREATED)
      .expect((res: any) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.task).toBe('E2E Test Task');
        expect(res.body.completed).toBe(false);
        todoId = res.body.id;
      });
  });

  it('GET /api/todos - should return an array with the created todo', async () => {
    // まずタスクを作成
    const createResponse = await request(app.getHttpServer())
      .post('/api/todos')
      .send({ task: 'E2E Test Task' });
    todoId = createResponse.body.id;

    // 作成したタスクが取得できることを確認
    return request(app.getHttpServer())
      .get('/api/todos')
      .expect(HttpStatus.OK)
      .expect((res: any) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
        expect(res.body[0].id).toBe(todoId);
      });
  });

  it('GET /api/todos/:id - should return a todo by id', async () => {
    // まずタスクを作成
    const createResponse = await request(app.getHttpServer())
      .post('/api/todos')
      .send({ task: 'E2E Test Task' });
    todoId = createResponse.body.id;

    return request(app.getHttpServer())
      .get(`/api/todos/${todoId}`)
      .expect(HttpStatus.OK)
      .expect((res: any) => {
        expect(res.body.id).toBe(todoId);
        expect(res.body.task).toBe('E2E Test Task');
      });
  });

  it('PUT /api/todos/:id - should update a todo', async () => {
    // まずタスクを作成
    const createResponse = await request(app.getHttpServer())
      .post('/api/todos')
      .send({ task: 'E2E Test Task' });
    todoId = createResponse.body.id;

    return request(app.getHttpServer())
      .put(`/api/todos/${todoId}`)
      .send({ task: 'Updated E2E Test Task', completed: true })
      .expect(HttpStatus.OK)
      .expect((res: any) => {
        expect(res.body.id).toBe(todoId);
        expect(res.body.task).toBe('Updated E2E Test Task');
        expect(res.body.completed).toBe(true);
      });
  });

  it('DELETE /api/todos/:id - should delete a todo', async () => {
    // まずタスクを作成
    const createResponse = await request(app.getHttpServer())
      .post('/api/todos')
      .send({ task: 'E2E Test Task' });
    todoId = createResponse.body.id;

    return request(app.getHttpServer())
      .delete(`/api/todos/${todoId}`)
      .expect(HttpStatus.OK)
      .expect({ success: true });
  });

  it('GET /api/todos - should return an empty array after deletion', async () => {
    // まずタスクを作成
    const createResponse = await request(app.getHttpServer())
      .post('/api/todos')
      .send({ task: 'E2E Test Task' });
    todoId = createResponse.body.id;

    // 作成したタスクを削除
    await request(app.getHttpServer())
      .delete(`/api/todos/${todoId}`)
      .expect(HttpStatus.OK);

    // 削除後は空の配列が返ってくることを確認
    return request(app.getHttpServer())
      .get('/api/todos')
      .expect(HttpStatus.OK)
      .expect([]);
  });

  it('GET /api/todos/:id - should return 404 if todo not found', () => {
    return request(app.getHttpServer())
      .get(`/api/todos/999`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('PUT /api/todos/:id - should return 404 if todo not found', () => {
    return request(app.getHttpServer())
      .put(`/api/todos/999`)
      .send({ task: 'This should fail', completed: true })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('DELETE /api/todos/:id - should return 404 if todo not found', () => {
    return request(app.getHttpServer())
      .delete(`/api/todos/999`)
      .expect(HttpStatus.NOT_FOUND);
  });
}); 