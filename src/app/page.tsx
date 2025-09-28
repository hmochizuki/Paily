import Form from "next/form";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { prisma } from "@/lib/prisma";

export default function Home() {
  // Server Action
  async function createUser(formData: FormData) {
    "use server";

    const name = formData.get("name");
    const email = formData.get("email");

    try {
      // ユーザー作成処理
      await prisma.user.create({
        data: {
          name: name as string,
          email: email as string,
        },
      });

      console.log("ユーザー作成に成功しました");
    } catch (error) {
      console.error(`ユーザー作成に失敗しました, ${error}`);
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[var(--color-text-default)] mb-2">
          ようこそ
        </h2>
        <p className="text-[var(--color-text-muted)]">新規ユーザー登録をしてください</p>
      </div>

      <Form action={createUser} className="space-y-5">
        <TextField
          name="name"
          label="名前"
          placeholder="山田 太郎"
          required
        />
        <TextField
          name="email"
          type="email"
          label="メールアドレス"
          placeholder="example@mail.com"
          required
        />
        <Button type="submit" fullWidth size="lg">
          ユーザーを作成
        </Button>
      </Form>
    </div>
  );
}
