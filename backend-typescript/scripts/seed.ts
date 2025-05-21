import { PrismaClient } from '@prisma/client';

// Prismaクライアントの作成
const prisma = new PrismaClient();

// シードデータ
const todos = [
  { task: 'プロジェクトのセットアップ', completed: true },
  { task: 'APIエンドポイントの実装', completed: true },
  { task: 'フロントエンドの接続', completed: true },
  { task: 'ユニットテストの作成', completed: false },
  { task: 'ドキュメントの作成', completed: false },
];

async function main() {
  console.log('シードデータのインポートを開始...');

  // データベースをクリア
  await prisma.todo.deleteMany({});
  console.log('既存のデータを削除しました。');

  // シードデータを挿入
  for (const todo of todos) {
    await prisma.todo.create({
      data: todo,
    });
  }

  console.log(`${todos.length}件のTodoデータをインポートしました。`);
}

main()
  .catch((e) => {
    console.error('シードプロセスでエラーが発生しました。', e);
    process.exit(1);
  })
  .finally(async () => {
    // データベース接続を閉じる
    await prisma.$disconnect();
  }); 