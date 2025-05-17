import { writeFileSync } from 'fs';
import { resolve } from 'path';

// 出力先パスを設定
const outputPath = resolve(__dirname, '../trpc-types.d.ts');

// 型定義ファイルの内容を作成
const content = `/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND.
 */

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from './src/common/trpc/trpc.router';

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
`;

// ファイルに書き込む
writeFileSync(outputPath, content);

console.log(`Type definition file generated at ${outputPath}`); 