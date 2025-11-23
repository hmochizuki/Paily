import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function getClient(tx?: Prisma.TransactionClient) {
  return tx ?? prisma;
}

export function findEventsByCoupleIds(coupleIds: string[]) {
  if (coupleIds.length === 0) {
    return Promise.resolve([]);
  }

  return prisma.calendarEvent.findMany({
    where: { coupleId: { in: coupleIds } },
    orderBy: { startAt: "asc" },
    include: {
      createdBy: {
        select: { displayName: true },
      },
    },
  });
}

export function findEventById(eventId: string) {
  return prisma.calendarEvent.findUnique({
    where: { id: eventId },
    include: {
      couple: {
        include: {
          partners: true,
        },
      },
    },
  });
}

export function findEventCoupleId(eventId: string) {
  return prisma.calendarEvent.findUnique({
    where: { id: eventId },
    select: { coupleId: true },
  });
}

export function createEvent(
  data: Prisma.CalendarEventUncheckedCreateInput,
  tx?: Prisma.TransactionClient,
) {
  return getClient(tx).calendarEvent.create({ data });
}

export function updateEvent(
  eventId: string,
  data: Prisma.CalendarEventUpdateInput,
  tx?: Prisma.TransactionClient,
) {
  return getClient(tx).calendarEvent.update({
    where: { id: eventId },
    data,
  });
}

export function deleteEvent(eventId: string, tx?: Prisma.TransactionClient) {
  return getClient(tx).calendarEvent.delete({
    where: { id: eventId },
  });
}
