import { useState, useEffect } from "react";

export interface NoteEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  desc?: string;
  allDay?: boolean;
  completed?: boolean;
}

export const useCalendarEvents = (
  options: { persist: boolean } = { persist: true }
) => {
  const [events, setEvents] = useState<NoteEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    if (!options.persist) return;
    if (typeof window !== "undefined") {
      const savedEvents = localStorage.getItem("calendar-notes");
      if (savedEvents) {
        try {
          const parsed = JSON.parse(savedEvents).map(
            (e: Omit<NoteEvent, "start" | "end"> & { start: string; end: string }) => ({
              ...e,
              start: new Date(e.start),
              end: new Date(e.end),
            })
          );
          setEvents(parsed);
        } catch (e) {
          console.error("Failed to parse calendar notes", e);
        }
      }
      setIsLoaded(true);
    }
  }, [options.persist]);

  // Save to local storage
  useEffect(() => {
    if (!options.persist) return;
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("calendar-notes", JSON.stringify(events));
    }
  }, [events, isLoaded, options.persist]);

  const addEvent = (event: NoteEvent) => {
    setEvents((prev) => [...prev, event]);
  };

  const updateEvent = (event: NoteEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)));
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const toggleComplete = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e))
    );
  };

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleComplete,
    setEvents,
  };
};
