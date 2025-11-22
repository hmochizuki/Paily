"use client";

import { useRouter } from "next/navigation";
import { startTransition, useEffect, useOptimistic, useRef } from "react";
import { createEventAction } from "../actions/createEvent";
import { deleteEventAction } from "../actions/deleteEvent";
import { updateEventAction } from "../actions/updateEvent";
import type { CalendarEventViewModel } from "../types";
import { CalendarView } from "./CalendarView";

type OptimisticAction =
  | { type: "replace"; events: CalendarEventViewModel[] }
  | { type: "add"; event: CalendarEventViewModel }
  | { type: "update"; event: CalendarEventViewModel }
  | { type: "delete"; eventId: string };

function optimisticReducer(
  events: CalendarEventViewModel[],
  action: OptimisticAction,
): CalendarEventViewModel[] {
  switch (action.type) {
    case "replace":
      return action.events;
    case "add":
      return [...events, action.event];
    case "update":
      return events.map((event) =>
        event.id === action.event.id ? action.event : event,
      );
    case "delete":
      return events.filter((event) => event.id !== action.eventId);
    default:
      return events;
  }
}

interface CalendarClientProps {
  coupleId: string;
  initialEvents: CalendarEventViewModel[];
  currentUserDisplayName: string;
}

function getStringValue(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" ? value : null;
}

function buildDateFromInput(
  date: string,
  time: string,
  seconds: string = "00",
): Date {
  return new Date(`${date}T${time}:${seconds}+09:00`);
}

function parseEventFields(formData: FormData): {
  title: string;
  description: string | null;
  startAt: string;
  endAt: string | null;
  isAllDay: boolean;
  color: string | null;
} | null {
  const title = getStringValue(formData, "title");
  const startDate = getStringValue(formData, "startDate");

  if (!title || title.trim() === "" || !startDate) {
    return null;
  }

  const descriptionValue = getStringValue(formData, "description");
  const description =
    descriptionValue && descriptionValue.trim() !== ""
      ? descriptionValue.trim()
      : null;

  const isAllDay = getStringValue(formData, "isAllDay") === "true";
  const colorValue = getStringValue(formData, "color");
  const color = colorValue && colorValue !== "" ? colorValue : null;
  const startTime = getStringValue(formData, "startTime");
  const endDate = getStringValue(formData, "endDate");
  const endTime = getStringValue(formData, "endTime");

  let startAt: Date;
  let endAt: Date | null = null;

  if (isAllDay) {
    startAt = buildDateFromInput(startDate, "00:00");
    if (endDate && endDate !== "") {
      endAt = buildDateFromInput(endDate, "23:59", "59");
    }
  } else {
    const startTimeValue = startTime && startTime !== "" ? startTime : "00:00";
    startAt = buildDateFromInput(startDate, startTimeValue);
    if (endDate && endDate !== "" && endTime && endTime !== "") {
      endAt = buildDateFromInput(endDate, endTime);
    }
  }

  return {
    title: title.trim(),
    description,
    startAt: startAt.toISOString(),
    endAt: endAt ? endAt.toISOString() : null,
    isAllDay,
    color,
  };
}

export function CalendarClient({
  coupleId,
  initialEvents,
  currentUserDisplayName,
}: CalendarClientProps) {
  const router = useRouter();
  const [optimisticEvents, dispatchOptimistic] = useOptimistic<
    CalendarEventViewModel[],
    OptimisticAction
  >(initialEvents, optimisticReducer);
  const serverSnapshotRef = useRef(initialEvents);

  useEffect(() => {
    serverSnapshotRef.current = initialEvents;
    startTransition(() => {
      dispatchOptimistic({ type: "replace", events: initialEvents });
    });
  }, [initialEvents, dispatchOptimistic]);

  const refreshAfterMutation = () => {
    router.refresh();
  };

  const revertToServerSnapshot = () => {
    dispatchOptimistic({ type: "replace", events: serverSnapshotRef.current });
  };

  const handleCreateEvent = async (formData: FormData) => {
    const coupleIdValue = getStringValue(formData, "coupleId");
    if (!coupleIdValue) {
      return;
    }

    const parsed = parseEventFields(formData);
    if (!parsed) {
      return;
    }

    const optimisticEvent: CalendarEventViewModel = {
      id: `temp-${crypto.randomUUID()}`,
      coupleId: coupleIdValue,
      title: parsed.title,
      description: parsed.description,
      startAt: parsed.startAt,
      endAt: parsed.endAt,
      isAllDay: parsed.isAllDay,
      color: parsed.color,
      createdBy: {
        displayName: currentUserDisplayName,
      },
      isOptimistic: true,
    };

    dispatchOptimistic({ type: "add", event: optimisticEvent });

    try {
      await createEventAction(formData);
      refreshAfterMutation();
    } catch (error) {
      console.error("イベントの作成に失敗しました", error);
      revertToServerSnapshot();
    }
  };

  const handleUpdateEvent = async (formData: FormData) => {
    const eventId = getStringValue(formData, "eventId");
    if (!eventId) {
      return;
    }

    const previousEvent = optimisticEvents.find(
      (event) => event.id === eventId,
    );
    if (!previousEvent) {
      return;
    }

    const parsed = parseEventFields(formData);
    if (!parsed) {
      return;
    }

    const updatedEvent: CalendarEventViewModel = {
      ...previousEvent,
      title: parsed.title,
      description: parsed.description,
      startAt: parsed.startAt,
      endAt: parsed.endAt,
      isAllDay: parsed.isAllDay,
      color: parsed.color,
      isOptimistic: true,
    };

    dispatchOptimistic({ type: "update", event: updatedEvent });

    try {
      await updateEventAction(formData);
      refreshAfterMutation();
    } catch (error) {
      console.error("イベントの更新に失敗しました", error);
      revertToServerSnapshot();
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    dispatchOptimistic({ type: "delete", eventId });

    try {
      await deleteEventAction(eventId);
      refreshAfterMutation();
    } catch (error) {
      console.error("イベントの削除に失敗しました", error);
      revertToServerSnapshot();
    }
  };

  return (
    <div className="relative flex h-full flex-1 flex-col">
      <CalendarView
        events={optimisticEvents}
        coupleId={coupleId}
        onCreateEvent={handleCreateEvent}
        onUpdateEvent={handleUpdateEvent}
        onDeleteEvent={handleDeleteEvent}
      />
    </div>
  );
}
