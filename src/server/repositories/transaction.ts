import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function runTransaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  return prisma.$transaction((tx) => callback(tx));
}
