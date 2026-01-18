import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getNotesData } from "@/server/services/noteService";
import { CreateNoteButton } from "@/features/notes/components/CreateNoteButton";
import { DeleteNoteButton } from "@/features/notes/components/DeleteNoteButton";

export const metadata = {
  title: "ノート",
};

export const revalidate = 60;

export default async function NotesPage() {
  const user = await requireUser();
  const notes = await getNotesData(user.id);

  return (
    <div className="space-y-6 px-4 pt-4 pb-24">
      <h1 className="text-2xl font-semibold text-[var(--color-text-default)]">
        ノート
      </h1>

      {notes.length === 0 ? (
        <NoNotesMessage />
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="relative rounded-lg border border-[var(--color-border-default)] bg-white transition-colors hover:bg-[var(--color-bg-subtle)]"
            >
              <Link href={`/notes/${note.id}`} className="block p-4" prefetch={true}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-medium text-[var(--color-text-default)]">
                      {note.title}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      {note.sheets.length} シート
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {new Date(note.updatedAt).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                </div>
              </Link>
              <div className="absolute right-2 top-2">
                <DeleteNoteButton noteId={note.id} noteTitle={note.title} />
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateNoteButton />
    </div>
  );
}

function NoNotesMessage() {
  return (
    <div className="rounded-lg border border-dashed border-[var(--color-border-default)] bg-white p-8 text-center">
      <p className="text-sm text-[var(--color-text-muted)]">
        まだノートが作成されていません。
        <br />
        新しいノートを作成して、アイデアやメモを記録しましょう。
      </p>
    </div>
  );
}