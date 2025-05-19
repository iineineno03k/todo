import { updateTodoSchema } from './update-todo.dto';

describe('UpdateTodoDto', () => {
  describe('バリデーション', () => {
    it('有効なタスクが渡された場合、バリデーションが成功すること', () => {
      const result = updateTodoSchema.safeParse({ task: '有効なタスク' });
      expect(result.success).toBe(true);
    });

    it('タスクが空文字列の場合、バリデーションが失敗すること', () => {
      const result = updateTodoSchema.safeParse({ task: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('タスクは必須です');
      }
    });

    it('completedのみが渡された場合、バリデーションが成功すること', () => {
      const result = updateTodoSchema.safeParse({ completed: true });
      expect(result.success).toBe(true);
    });

    it('空のオブジェクトが渡された場合、バリデーションが成功すること', () => {
      const result = updateTodoSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
}); 