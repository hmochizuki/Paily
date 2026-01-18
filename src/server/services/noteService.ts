"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import type { Note, Sheet } from "@prisma/client";

export const getNotesData = cache(async (profileId: string) => {
  const notes = await prisma.note.findMany({
    where: {
      profileId,
    },
    include: {
      sheets: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return notes;
});

export const getNoteWithSheets = cache(async (noteId: string, profileId: string) => {
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      profileId,
    },
    include: {
      sheets: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!note) {
    throw new Error("Note not found");
  }

  return note;
});

export async function createNoteAction(formData: FormData) {
  const user = await requireUser();
  const title = formData.get("title")?.toString() || "";

  if (!title.trim()) {
    throw new Error("ノートのタイトルは必須です");
  }

  const noteId = randomUUID();
  const sheetId = randomUUID();

  await prisma.note.create({
    data: {
      id: noteId,
      profileId: user.id,
      title: title.trim(),
      sheets: {
        create: {
          id: sheetId,
          title: "シート1",
          content: "",
          sortOrder: 0,
        },
      },
    },
  });

  revalidatePath("/notes");
  return { success: true, noteId };
}

export async function updateSheetAction(formData: FormData) {
  const user = await requireUser();
  const sheetId = formData.get("sheetId")?.toString();
  const title = formData.get("title")?.toString();
  const content = formData.get("content")?.toString();

  if (!sheetId) {
    throw new Error("シートIDは必須です");
  }

  const sheet = await prisma.sheet.findFirst({
    where: {
      id: sheetId,
      note: {
        profileId: user.id,
      },
    },
  });

  if (!sheet) {
    throw new Error("シートが見つかりません");
  }

  await prisma.sheet.update({
    where: {
      id: sheetId,
    },
    data: {
      title: title?.trim() || sheet.title,
      content: content || sheet.content,
      updatedAt: new Date(),
    },
  });

  revalidatePath(`/notes/${sheet.noteId}`);
  return { success: true };
}

export async function createSheetAction(formData: FormData) {
  const user = await requireUser();
  const noteId = formData.get("noteId")?.toString();
  const title = formData.get("title")?.toString() || "新しいシート";

  if (!noteId) {
    throw new Error("ノートIDは必須です");
  }

  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      profileId: user.id,
    },
  });

  if (!note) {
    throw new Error("ノートが見つかりません");
  }

  const maxSortOrder = await prisma.sheet.aggregate({
    where: {
      noteId,
    },
    _max: {
      sortOrder: true,
    },
  });

  const sheetId = randomUUID();

  await prisma.sheet.create({
    data: {
      id: sheetId,
      noteId,
      title: title.trim(),
      content: "",
      sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
    },
  });

  revalidatePath(`/notes/${noteId}`);
  return { success: true, sheetId };
}

export async function deleteNoteAction(formData: FormData) {
  const user = await requireUser();
  const noteId = formData.get("noteId")?.toString();

  if (!noteId) {
    throw new Error("ノートIDは必須です");
  }

  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      profileId: user.id,
    },
  });

  if (!note) {
    throw new Error("ノートが見つかりません");
  }

  await prisma.note.delete({
    where: {
      id: noteId,
    },
  });

  revalidatePath("/notes");
  return { success: true };
}

export async function deleteSheetAction(formData: FormData) {
  const user = await requireUser();
  const sheetId = formData.get("sheetId")?.toString();

  if (!sheetId) {
    throw new Error("シートIDは必須です");
  }

  const sheet = await prisma.sheet.findFirst({
    where: {
      id: sheetId,
      note: {
        profileId: user.id,
      },
    },
    include: {
      note: {
        include: {
          sheets: true,
        },
      },
    },
  });

  if (!sheet) {
    throw new Error("シートが見つかりません");
  }

  if (sheet.note.sheets.length === 1) {
    throw new Error("最後のシートは削除できません");
  }

  await prisma.sheet.delete({
    where: {
      id: sheetId,
    },
  });

  revalidatePath(`/notes/${sheet.noteId}`);
  return { success: true };
}