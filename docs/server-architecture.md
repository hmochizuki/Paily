# サーバーアーキテクチャ設計

## 概要

あとでリアーキする時のためのドキュメントです。
本ドキュメントは、Pailyプロジェクトにおけるサーバーサイドのアーキテクチャ設計方針を定義します。Next.js Server Actionsからレイヤードアーキテクチャへの移行により、責務の分離と保守性の向上を実現します。

## 設計方針

### レイヤードアーキテクチャの採用理由

1. **責務の分離**: 各層が明確な役割を持ち、変更の影響を局所化
2. **テスタビリティ**: ビジネスロジックを独立してテスト可能
3. **再利用性**: ドメインロジックを複数のエントリーポイントから利用可能
4. **保守性**: コードの見通しが良く、修正箇所が特定しやすい

### アーキテクチャ構造

```
src/server/
├── handlers/           # HTTPハンドラー相当（Server Actions呼び出し）
├── services/          # ドメインサービス（ビジネスロジック）
├── repositories/      # データアクセス層
├── models/           # ドメインモデル（バリデーション含む）
└── errors/           # カスタムエラー
```

## 各層の責務

### 1. Handler層 (`src/server/handlers/`)

**責務:**
- 認証・認可チェック
- リクエストデータの抽出と基本的な検証
- サービス層の呼び出し
- レスポンスの整形
- エラーハンドリング（ユーザー向けメッセージへの変換）

**実装例:**
```typescript
// src/server/handlers/couple/create-invitation.handler.ts
export async function createCoupleInvitationHandler(
  userId: string,
  params: { origin?: string; inviteCode?: string }
): Promise<CreateCoupleInvitationResult> {
  try {
    const result = await coupleService.createInvitation({
      inviterProfileId: userId,
      inviteCode: params.inviteCode,
      origin: params.origin,
    });
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { success: false, error: error.message };
    }
    throw error;
  }
}
```

### 2. Service層 (`src/server/services/`)

**責務:**
- ビジネスロジックの実装
- 複数のリポジトリを協調させた処理
- ドメインルールの適用
- トランザクション境界の管理

**実装例:**
```typescript
// src/server/services/couple/couple.service.ts
export class CoupleService {
  async createInvitation(params: CreateInvitationParams): Promise<InvitationResult> {
    // ビジネスロジック
    const profile = await this.ensureProfileExists(params.inviterProfileId);
    const inviteCode = params.inviteCode || generateInviteCode();
    
    // バリデーション
    const validatedCode = InviteCodeModel.validate(inviteCode);
    
    // データ作成
    return await this.partnerInviteRepo.createInvitation({
      inviterProfileId: profile.id,
      code: validatedCode,
      expiresAt: this.calculateExpiryDate(),
    });
  }
}
```

### 3. Repository層 (`src/server/repositories/`)

**責務:**
- データアクセスの抽象化
- Prismaクエリの実装
- データ変換（DB ↔ ドメインモデル）
- トランザクション処理

**実装例:**
```typescript
// src/server/repositories/partner-invite.repository.ts
export class PartnerInviteRepository {
  constructor(private prisma: PrismaClient) {}
  
  async createInvitation(data: CreateInvitationData): Promise<PartnerInvite> {
    return await this.prisma.partnerInvite.create({
      data: {
        id: crypto.randomUUID(),
        ...data,
      },
    });
  }
  
  async findByCode(code: string): Promise<PartnerInvite | null> {
    return await this.prisma.partnerInvite.findFirst({
      where: { code, status: "pending" },
    });
  }
}
```

### 4. Model層 (`src/server/models/`)

**責務:**
- ドメインモデルの定義
- バリデーションルール
- ビジネスルールのカプセル化
- 値オブジェクトの実装

**実装例:**
```typescript
// src/server/models/partner-invite.model.ts
export class InviteCodeModel {
  static readonly MIN_LENGTH = 4;
  static readonly MAX_LENGTH = 12;
  static readonly PATTERN = /^[A-Z]{4,12}$/;
  
  static validate(code: string): string {
    const upperCode = code.toUpperCase();
    if (!this.PATTERN.test(upperCode)) {
      throw new ValidationError(
        `招待コードは英字${this.MIN_LENGTH}〜${this.MAX_LENGTH}文字で指定してください。`
      );
    }
    return upperCode;
  }
  
  static generate(length = 6): string {
    // 生成ロジック
  }
}
```

### 5. Error層 (`src/server/errors/`)

**責務:**
- カスタムエラークラスの定義
- エラーの分類（ValidationError, BusinessError, NotFoundError等）
- エラーコードの管理

**実装例:**
```typescript
// src/server/errors/index.ts
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class BusinessError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "BusinessError";
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`);
    this.name = "NotFoundError";
  }
}
```

## Server Actionの実装

Server Actionは薄いラッパーとして実装し、実質的な処理はHandler層に委譲します。

```typescript
// src/features/couple/actions/create-couple-invitation.ts
"use server";

import { createCoupleInvitationHandler } from "@/server/handlers/couple/create-invitation.handler";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function createCoupleInvitationAction(
  _prevState: CreateCoupleState,
  formData: FormData
): Promise<CreateCoupleState> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/");
  }
  
  const result = await createCoupleInvitationHandler(user.id, {
    origin: formData.get("origin") as string,
    inviteCode: formData.get("inviteCode") as string,
  });
  
  if (!result.success) {
    return { status: "error", message: result.error };
  }
  
  revalidatePath("/couple/create");
  return {
    status: "success",
    inviteCode: result.data.code,
    inviteUrl: result.data.inviteUrl,
  };
}
```

## 命名規則

### ファイル名
- Handler: `[resource]-[action].handler.ts`
- Service: `[domain].service.ts`
- Repository: `[entity].repository.ts`
- Model: `[entity].model.ts`

### クラス・関数名
- Handler: `[Action][Resource]Handler`
- Service: `[Domain]Service`
- Repository: `[Entity]Repository`
- Model: `[Entity]Model`

## トランザクション管理

トランザクションはService層で管理し、Repository層に渡します。

```typescript
// Service層でのトランザクション管理
async createWithProfile(data: CreateWithProfileData) {
  return await this.prisma.$transaction(async (tx) => {
    const profile = await this.profileRepo.create(data.profile, tx);
    const invite = await this.inviteRepo.create(data.invite, tx);
    return { profile, invite };
  });
}
```

## エラーハンドリング方針

1. **Model層**: ValidationErrorをスロー
2. **Repository層**: データアクセスエラーをそのままスロー
3. **Service層**: ビジネスエラーをBusinessErrorとしてスロー
4. **Handler層**: 各種エラーをキャッチしてユーザー向けメッセージに変換

## リファクタリング用プロンプト

既存のServer Actionをレイヤー構造にリファクタリングする際は、以下のプロンプトを使用してください：

```
以下のServer Actionをレイヤードアーキテクチャにリファクタリングしてください。

[既存のServer Actionのコードを貼り付け]

以下の構造で実装してください：
1. Handler層: 認証チェック、パラメータ抽出、エラーハンドリング
2. Service層: ビジネスロジック、トランザクション管理
3. Repository層: データアクセス
4. Model層: バリデーション、ドメインロジック
5. 必要に応じてカスタムエラークラスを追加

各層は src/server/ 配下の適切なディレクトリに配置し、
元のServer Actionは薄いラッパーとして残してください。
```

## 実装順序

1. エラークラスの定義 (`src/server/errors/`)
2. Model層の実装（バリデーションロジックの抽出）
3. Repository層の実装（データアクセスの抽出）
4. Service層の実装（ビジネスロジックの抽出）
5. Handler層の実装（リクエスト処理の抽出）
6. Server Actionの修正（Handler呼び出しのみに）

## 参考資料

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)