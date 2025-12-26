"use client";

import { useState, useEffect } from "react";
// import {
//   // Calendar,
//   dateFnsLocalizer,
//   SlotInfo,
//   ToolbarProps,
// } from "react-big-calendar";
import { format } from "date-fns";
// import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

// const locales = {
//   "en-US": enUS,
// };

// const localizer = dateFnsLocalizer({
//   format,
//   parse,
//   startOfWeek,
//   getDay,
//   locales,
// });

// const CustomToolbar = (toolbar: ToolbarProps) => {
//   const goToBack = () => {
//     toolbar.onNavigate("PREV");
//   };

//   const goToNext = () => {
//     toolbar.onNavigate("NEXT");
//   };

//   const goToCurrent = () => {
//     toolbar.onNavigate("TODAY");
//   };

//   const label = () => {
//     const date = format(toolbar.date, "MMMM yyyy");
//     return <span className="text-lg font-semibold">{date}</span>;
//   };

//   return (
//     <div className="flex items-center justify-between mb-4">
//       <div className="flex gap-2">
//         <Button variant="outline" size="sm" onClick={goToBack}>
//           Back
//         </Button>
//         <Button variant="outline" size="sm" onClick={goToCurrent}>
//           Today
//         </Button>
//         <Button variant="outline" size="sm" onClick={goToNext}>
//           Next
//         </Button>
//       </div>
//       <div className="text-center">{label()}</div>
//       <div className="flex gap-2">
//         {/* View buttons can go here if needed */}
//       </div>
//     </div>
//   );
// };

interface NoteEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  desc?: string;
  allDay?: boolean;
}

export function CalendarNotes() {
  const [events, setEvents] = useState<NoteEvent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<NoteEvent>>({});

  // Load from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEvents = localStorage.getItem("calendar-notes");
      if (savedEvents) {
        try {
          const parsed = JSON.parse(savedEvents).map(
            (e: NoteEvent & { start: string; end: string }) => ({
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
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (typeof window !== "undefined" && events.length > 0) {
      localStorage.setItem("calendar-notes", JSON.stringify(events));
    }
  }, [events]);

  // const handleSelectSlot = (slotInfo: SlotInfo) => {
  //   setCurrentEvent({
  //     start: slotInfo.start,
  //     end: slotInfo.end,
  //     allDay: slotInfo.slots.length === 1,
  //   });
  //   setIsDialogOpen(true);
  // };

  // const handleSelectEvent = (event: NoteEvent) => {
  //   setCurrentEvent(event);
  //   setIsDialogOpen(true);
  // };

  const handleSave = () => {
    if (!currentEvent.title) return;

    if (currentEvent.id) {
      // Update existing
      setEvents((prev) =>
        prev.map((e) =>
          e.id === currentEvent.id
            ? ({ ...e, ...currentEvent } as NoteEvent)
            : e
        )
      );
    } else {
      // Create new
      const newEvent: NoteEvent = {
        id: crypto.randomUUID(),
        title: currentEvent.title,
        start: currentEvent.start!,
        end: currentEvent.end!,
        desc: currentEvent.desc,
        allDay: currentEvent.allDay,
      };
      setEvents((prev) => [...prev, newEvent]);
    }
    setIsDialogOpen(false);
    setCurrentEvent({});
  };

  const handleDelete = () => {
    if (currentEvent.id) {
      setEvents((prev) => prev.filter((e) => e.id !== currentEvent.id));
      setIsDialogOpen(false);
      setCurrentEvent({});
    }
  };

  return (
    <Card className=" border-none shadow-sm bg-card/50">
      <CardContent className="h-[600px] p-2 relative">
        <style jsx global>{`
          .rbc-calendar {
            color: hsl(var(--foreground));
          }
          .rbc-header {
            border-bottom: 1px solid hsl(var(--border)) !important;
            padding: 8px 0;
            font-weight: 600;
          }
          .rbc-month-view {
            border: 1px solid hsl(var(--border)) !important;
            border-radius: var(--radius);
          }
          .rbc-day-bg + .rbc-day-bg {
            border-left: 1px solid hsl(var(--border)) !important;
          }
          .rbc-month-row + .rbc-month-row {
            border-top: 1px solid hsl(var(--border)) !important;
          }
          .rbc-off-range-bg {
            background-color: hsl(var(--muted) / 0.3) !important;
          }
          .rbc-today {
            background-color: hsl(var(--accent) / 0.5) !important;
          }
          .rbc-event {
            background-color: hsl(var(--primary)) !important;
            color: hsl(var(--primary-foreground)) !important;
            border-radius: 4px;
          }
          .rbc-toolbar button {
            color: hsl(var(--foreground)) !important;
            border-color: hsl(var(--border)) !important;
          }
          .rbc-toolbar button:hover {
            background-color: hsl(var(--accent)) !important;
          }
          .rbc-toolbar button.rbc-active {
            background-color: hsl(var(--primary)) !important;
            color: hsl(var(--primary-foreground)) !important;
            box-shadow: none !important;
          }
          .rbc-show-more {
            color: hsl(var(--foreground)) !important;
            background-color: transparent !important;
          }
        `}</style>
        {/* <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          components={{
            toolbar: CustomToolbar,
          }}
          views={["month", "week", "day", "agenda"]}
          defaultView="month"
          className="rounded-md"
        /> */}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentEvent.id ? "Edit Note" : "Add Note"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={currentEvent.title || ""}
                onChange={(e) =>
                  setCurrentEvent({ ...currentEvent, title: e.target.value })
                }
                placeholder="Meeting with..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                value={currentEvent.desc || ""}
                onChange={(e) =>
                  setCurrentEvent({ ...currentEvent, desc: e.target.value })
                }
                placeholder="Details..."
              />
            </div>
            <div className="grid gap-2">
              <div className="text-sm text-muted-foreground">
                {currentEvent.start && format(currentEvent.start, "PP p")} -{" "}
                {currentEvent.end && format(currentEvent.end, "PP p")}
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            {currentEvent.id ? (
              <Button
                variant="destructive"
                onClick={handleDelete}
                type="button"
                size="icon"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
