import React, { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import type { DateSelectArg, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';

interface MeetingCalendarProps {
  events: EventInput[];
  initialView?: CalendarView;
  height?: number | 'auto';
  selectable?: boolean;
  selectMirror?: boolean;
  onSelectRange?: (start: Date, end: Date) => void;
  onEventClick?: (arg: EventClickArg) => void;
}

export const MeetingCalendar: React.FC<MeetingCalendarProps> = ({
  events,
  initialView = 'dayGridMonth',
  height = 640,
  selectable = false,
  selectMirror = true,
  onSelectRange,
  onEventClick,
}) => {
  const plugins = useMemo(() => [dayGridPlugin, timeGridPlugin, interactionPlugin], []);

  const handleSelect = (info: DateSelectArg) => {
    onSelectRange?.(info.start, info.end);
    info.view.calendar.unselect();
  };

  return (
    <div className="fc-theme-nexus rounded-xl border border-gray-200 bg-white p-2 shadow-sm md:p-4">
      <FullCalendar
        plugins={plugins}
        initialView={initialView}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        height={height}
        editable={false}
        selectable={selectable}
        selectMirror={selectMirror}
        dayMaxEvents={3}
        weekends
        events={events}
        select={handleSelect}
        eventClick={onEventClick}
        slotMinTime="07:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        nowIndicator
        buttonText={{
          today: 'Today',
          month: 'Month',
          week: 'Week',
          day: 'Day',
        }}
      />
    </div>
  );
};
