import { createTodoSchema } from './create-todo.dto';

describe('CreateTodoDto', () => {
  describe('バリデーション', () => {
    it('有効なタスクが渡された場合、バリデーションが成功すること', () => {
      const result = createTodoSchema.safeParse({ task: '有効なタスク' });
      expect(result.success).toBe(true);
    });

    it('タスクが空文字列の場合、バリデーションが失敗すること', () => {
      const result = createTodoSchema.safeParse({ task: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('タスクは必須です');
      }
    });

    it('タスクが未定義の場合、バリデーションが失敗すること', () => {
      const result = createTodoSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('タスクは必須です');
      }
    });
  });
}); 