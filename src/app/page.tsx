import Form from "next/form";
import Button from "@/components/Button";
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
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          ようこそ
        </h2>
        <p className="text-gray-600">新規ユーザー登録をしてください</p>
      </div>

      <Form action={createUser} className="space-y-5">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            名前
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent text-base"
            placeholder="山田 太郎"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            メールアドレス
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent text-base"
            placeholder="example@mail.com"
          />
        </div>
        <Button type="submit" fullWidth size="lg">
          ユーザーを作成
        </Button>
      </Form>
    </div>
  );
}
