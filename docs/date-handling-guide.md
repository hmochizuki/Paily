# Next.js / Prisma / Supabase における Date 型取り扱いガイド

## 1. なぜローカルと本番で Date → string に変わるのか
- `next dev` では API ルートとページが同じ Node.js プロセス内で動き、`getServerSideProps` や Route Handler から `props` として Date オブジェクトを直接渡せる。
- 本番 (`next start`) や Edge / Function 環境では API 応答は HTTP 越しの JSON 文字列になり、`Response` を経由した時点で Date は ISO 文字列になる。
- つまり BE 実装は共通でも、ローカルが「メモリ共有」、本番が「JSON 越し」という差分で `createdAt: Date` が `string` に変わる。

## 2. JSON シリアライズと fetch/SSR の挙動差
- Route Handler や API Routes では `return NextResponse.json(record)` のタイミングで `Date` が `toJSON()` され ISO 文字列化する。
- `fetch('/api/...')` は常に JSON 文字列を受け取るので、本番もローカルも `string` になる。
- `getServerSideProps` / `Server Components` で同一プロセスにある値を `return { props: record }` した場合は JSON を挟まないため Date が保持される。SSR 中でも fetch 経由にした瞬間に文字列化されることがポイント。

## 3. 共通の型に Date を含めると破綻する理由
- Prisma Client が返す `Prisma.User` などは `createdAt: Date` を前提にしている。
- そのまま `type UserDto = Prisma.User` のようにエクスポートし FE 用に使うと、実際のデータが `string` (ISO) になった瞬間に型安全性が失われ、`toLocaleDateString` で `TypeError` が起きる。
- DB (`Date`) / API (`string`) / FE (`Date | string`) が混在するので、単一の型共有は実装上も運用上も破綻する。

## 4. 再発防止の型定義戦略（DB 型と API 型の分離）
1. **DB 型**: Prisma が返す `Date` を含む型 (`AccountRecord`).
2. **API 型**: 外部公開する DTO。`Date` を `string` に置き換えた型 (`AccountDto`).
3. **FE 表現型**: FE で扱いやすいよう `Date` に戻したり `dayjs` の `Dayjs` を使う型 (`AccountViewModel`).
- それぞれを変換関数で橋渡しすれば、どの境界でどの型になるかが明確になり、再発を防げる。

## 5. DB → API → FE の 3 レイヤー設計
```mermaid
graph TD
  DB[Prisma Record (Date)] -->|serialize| API[API DTO (string)]
  API -->|fetch / NextResponse| FE_API[string]
  FE_API -->|parse| FE_VIEW[View Model (Date)]
```
- DB 層でのみ `Date` を信用し、API 層では必ず JSON シリアライズ済みの `string` を型で保証。
- FE は API 契約どおり `string` を受け、`new Date()` や `Temporal` などで ViewModel に変換する。

## 6. ReplaceDateWithString<T> utility
```ts
// Date を string に再帰的に置き換えるユーティリティ
export type ReplaceDateWithString<T> = T extends Date
  ? string
  : T extends Array<infer U>
    ? ReplaceDateWithString<U>[]
    : T extends object
      ? { [K in keyof T]: ReplaceDateWithString<T[K]> }
      : T;

// Prisma の DB 型 -> API DTO
type AccountRecord = Prisma.AccountGetPayload<{ select: typeof accountSelect }>;
export type AccountDto = ReplaceDateWithString<AccountRecord>;
```
- `Record<string, unknown>` を安全に変換するため、配列・ネストにも対応。
- API 層に `AccountDto` を公開すると、Date のまま渡すミスを型で検知できる。

## 7. API 型ベースでの FE 型変換
```ts
// API 層の公開型
export type AccountDto = ReplaceDateWithString<AccountRecord>;

// FE の ViewModel 型
type AccountViewModel = Omit<AccountDto, 'createdAt' | 'updatedAt'> & {
  createdAt: Date;
  updatedAt: Date;
};

// 共通ユーティリティ
function toAccountViewModel(dto: AccountDto): AccountViewModel {
  return {
    ...dto,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}
```
- API 層は `AccountDto` のように「すべて string」と定義しておき、FE では変換関数を通せば Date 扱いに戻せる。
- 依存ライブラリに頼らず、型定義と変換関数のみで API/FE の境界契約を守れる。

## 8. Prisma → API → FE のサンプルパイプライン
```ts
// prisma/account.ts
export async function findAccount(accountId: string) {
  const record = await prisma.account.findUniqueOrThrow({ where: { id: accountId } });
  return record; // AccountRecord (Date)
}

// app/api/account/[id]/route.ts
import { ReplaceDateWithString } from '@/lib/replace-date';
import { accountDtoSchema } from '@/schemas/account';

type AccountRecord = Awaited<ReturnType<typeof findAccount>>;
type AccountDto = ReplaceDateWithString<AccountRecord>;

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const record = await findAccount(params.id);
  const dto: AccountDto = {
    ...record,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
  return NextResponse.json(dto);
}

// app/(dashboard)/account/page.tsx (Server Component)
const account = await fetch('/api/account/123', { cache: 'no-store' })
  .then(res => res.json() as Promise<AccountDto>);
const viewModel = toAccountViewModel(account);
return <AccountCard createdAt={viewModel.createdAt.toLocaleDateString('ja-JP')} />;
```
- 3 レイヤーそれぞれで型を固定し、変換処理を明示することでエンジニアが追いやすくなる。

## 9. toLocaleDateString エラーが消える理由
- FE は API 契約として「`createdAt` は必ず string」であると知り、受信直後に `toAccountViewModel` や `toShoppingListItemViewModels` で Date に変換する。
- そのためローカル・本番いずれでも ViewModel は `Date` として確立され、`toLocaleDateString` 呼び出し時に `string` が紛れ込むことがなくなる。
- `ReplaceDateWithString` で API 層の型穴を塞ぎ、ViewModel 変換ファンクションを通過させることで、環境差異によるランタイムエラーを根絶できる。

## 10. 実装状況
- `src/types/replace-date-with-string.ts`: Date -> string 変換のユーティリティ型。
- `src/server/services/lists.ts`: Prisma の `createdAt`/`checkedAt` を string DTO として返却。
- `src/features/shopping-list/types.ts`: DTO -> ViewModel 変換 (`toShoppingListItemViewModels`) を定義。
- `src/features/shopping-list/components/ShoppingListDetailClient.tsx`: サーバーから受け取った DTO をクライアントで Date に復元してから UI に渡す。
- `src/features/shopping-list/components/ListsPageContent.tsx`: リスト一覧 (`ListOverviewDto`) を Date ベースの ViewModel に変換してから描画し、`toLocaleDateString` の実行時エラーを防止。
- `src/server/services/calendar.ts`: カレンダーイベントを DTO 化し、`startAt`/`endAt` を string で返却。
- `src/features/calendar/types.ts`: イベント DTO/ ViewModel と変換関数 (`toCalendarEventViewModels`) を提供。
- `src/features/calendar/components/CalendarPageContent.tsx` / `CalendarClient.tsx`: DTO を受け取ってクライアントで Date に変換し、以降の UI/楽観的更新は Date を信頼。
- `src/features/calendar/components/EventCard.tsx` / `EventDetailModal.tsx` / `CalendarView.tsx`: ViewModel が Date である前提に書き換え、`toLocaleDateString`/`toLocaleTimeString` が常に安全に動くよう統一。
- `src/server/services/profile.ts`: プロフィールのスペース情報を `SpaceDto` として返し、`createdAt` を string に正規化。
- `src/features/space/types.ts` / `components/SpaceSelector.tsx`: スペース DTO を Date に復元し、表示系・自動選択ロジックが環境差異の影響を受けないようにした。

## 11. 今後の横展開指針
- 新規 API/Route Handler を追加する際は、Prisma 型 → DTO (`ReplaceDateWithString`) → ViewModel 変換をテンプレートとして必ず実装する。
- 既存のサーバーアクションから FE コンポーネントへ `Date` を渡していないかコードレビュー時に確認し、DTO 化されていない箇所があれば本ガイドに基づきリファクタリングする。
- Supabase Edge Function や外部連携を追加する場合も同様に JSON シリアライズを前提とし、Date/Temporal 型を境界で string へ変換してから受信側で復元する。
