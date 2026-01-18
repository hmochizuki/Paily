import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getNoteWithSheets } from "@/server/services/noteService";
import { NoteDetailContent } from "@/features/notes/components/NoteDetailContent";

type Props = {
  params: {
    noteId: string;
  };
};

export async function generateMetadata({ params }: Props) {
  const user = await requireUser();

  try {
    const note = await getNoteWithSheets(params.noteId, user.id);
    return {
      title: note.title,
    };
  } catch {
    return {
      title: "ノート",
    };
  }
}

export default async function NoteDetailPage({ params }: Props) {
  const user = await requireUser();

  let note;
  try {
    note = await getNoteWithSheets(params.noteId, user.id);
  } catch {
    notFound();
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-default)] bg-white">
        <div className="flex items-center gap-3">
          <Link
            href="/notes"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-default)]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-[var(--color-text-default)]">
            {note.title}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <NoteDetailContent note={note} />
      </div>
    </div>
  );
}