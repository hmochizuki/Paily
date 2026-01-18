import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getNotesData } from "@/server/services/noteService";
import { CreateNoteButton } from "@/features/notes/components/CreateNoteButton";
import { formatDate } from "@/utils/dateHelpers";

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
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="block rounded-lg border border-[var(--color-border-default)] bg-white p-4 transition-colors hover:bg-[var(--color-background-muted)]"
            >
              <div className="space-y-2">
                <h3 className="text-base font-medium text-[var(--color-text-default)]">
                  {note.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                  <span>{note.sheets.length} シート</span>
                  <span>{formatDate(note.createdAt)}</span>
                </div>
              </div>
            </Link>
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