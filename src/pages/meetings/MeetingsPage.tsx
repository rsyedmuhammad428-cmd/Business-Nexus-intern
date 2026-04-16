import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import type { EventInput } from '@fullcalendar/core';
import { CalendarClock, Info, Plus, Trash2 } from 'lucide-react';
import { MeetingCalendar } from '../../components/meetings/MeetingCalendar';
import { MeetingRequestsPanel } from '../../components/meetings/MeetingRequestsPanel';
import { SendMeetingRequestModal } from '../../components/meetings/SendMeetingRequestModal';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useMeetings } from '../../context/MeetingsContext';
import type { Meeting } from '../../types';

function involvesUser(m: Meeting, userId: string): boolean {
  return m.senderId === userId || m.receiverId === userId;
}

export const MeetingsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    meetings,
    getSlotsForUser,
    getPendingIncoming,
    getPendingOutgoing,
    addAvailabilitySlot,
    removeAvailabilitySlot,
    sendMeetingRequest,
    acceptMeeting,
    rejectMeeting,
  } = useMeetings();

  const [availabilityMode, setAvailabilityMode] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);

  if (!user) return null;

  const mySlots = getSlotsForUser(user.id);
  const pendingIncoming = getPendingIncoming(user.id);
  const pendingOutgoing = getPendingOutgoing(user.id);

  const calendarEvents = useMemo<EventInput[]>(() => {
    const events: EventInput[] = [];

    for (const s of mySlots) {
      events.push({
        id: `avail-${s.id}`,
        title: s.label || 'Available',
        start: s.start,
        end: s.end,
        display: 'background',
        backgroundColor: '#DBEAFE',
      });
    }

    for (const m of meetings) {
      if (!involvesUser(m, user.id)) continue;
      if (m.status === 'rejected') continue;

      if (m.status === 'accepted') {
        events.push({
          id: `meet-${m.id}`,
          title: m.title,
          start: m.start,
          end: m.end,
          backgroundColor: '#2563EB',
          borderColor: '#1D4ED8',
          textColor: '#ffffff',
        });
        continue;
      }
      if (m.status === 'completed') {
        events.push({
          id: `meet-${m.id}`,
          title: `Completed: ${m.title}`,
          start: m.start,
          end: m.end,
          backgroundColor: '#10B981',
          borderColor: '#059669',
          textColor: '#ffffff',
        });
        continue;
      }

      const isSender = m.senderId === user.id;
      events.push({
        id: `req-${m.id}`,
        title: isSender ? `Pending: ${m.title}` : `Request: ${m.title}`,
        start: m.start,
        end: m.end,
        backgroundColor: '#FBBF24',
        borderColor: '#D97706',
        textColor: '#111827',
      });
    }

    return events;
  }, [mySlots, meetings, user.id]);

  const handleSelectRange = (start: Date, end: Date) => {
    if (!availabilityMode) return;
    addAvailabilitySlot(user.id, start.toISOString(), end.toISOString());
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Meetings</h1>
          <p className="mt-1 text-gray-600">
            Bidirectional meeting scheduling. Send, accept, or decline meeting requests on the platform.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={availabilityMode ? 'primary' : 'outline'}
            leftIcon={<CalendarClock size={18} />}
            onClick={() => setAvailabilityMode((v) => !v)}
          >
            {availabilityMode ? 'Done adding slots' : 'Add availability'}
          </Button>
          <Button leftIcon={<Plus size={18} />} onClick={() => setRequestOpen(true)}>
            Request meeting
          </Button>
        </div>
      </div>

      {availabilityMode && (
        <div className="flex gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-900">
          <Info className="mt-0.5 shrink-0" size={18} />
          <p>
            <span className="font-medium">Tip:</span> switch to <strong>Week</strong> or{' '}
            <strong>Day</strong> in the calendar toolbar, then drag to select a time range.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <MeetingCalendar
            events={calendarEvents}
            selectable={availabilityMode}
            onSelectRange={handleSelectRange}
            height={620}
          />

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Your availability</h2>
              <p className="text-sm text-gray-500">
                Optional blocks that appear on your calendar.
              </p>
            </CardHeader>
            <CardBody>
              {mySlots.length === 0 ? (
                <p className="text-sm text-gray-600">
                  No slots yet. Turn on <strong>Add availability</strong> and select a range on the
                  calendar.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {mySlots.map((s) => (
                    <li
                      key={s.id}
                      className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{s.label || 'Available'}</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(s.start), 'MMM d, yyyy · h:mm a')} –{' '}
                          {format(new Date(s.end), 'h:mm a')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="self-start sm:self-center"
                        leftIcon={<Trash2 size={16} />}
                        onClick={() => removeAvailabilitySlot(s.id, user.id)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <MeetingRequestsPanel
            userId={user.id}
            pendingIncoming={pendingIncoming}
            pendingOutgoing={pendingOutgoing}
            onAccept={(id) => acceptMeeting(id, user.id)}
            onReject={(id) => rejectMeeting(id, user.id)}
          />

          <Card className="border-dashed border-primary-200 bg-primary-50/40">
            <CardBody className="text-sm text-primary-900">
              <p className="font-medium">Dashboard</p>
              <p className="mt-1 text-primary-800/90">
                Pending, confirmed, and rejected lists update live for both roles.
              </p>
              <Link
                to={user.role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor'}
                className="mt-3 inline-flex text-sm font-semibold text-primary-700 hover:text-primary-800"
              >
                Go to dashboard →
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>

      <SendMeetingRequestModal
        open={requestOpen}
        userId={user.id}
        userRole={user.role}
        onClose={() => setRequestOpen(false)}
        onSubmit={(payload) =>
          sendMeetingRequest(user.id, payload.receiverId, user.role, {
            title: payload.title,
            start: payload.start,
            end: payload.end,
            message: payload.message,
          })
        }
      />
    </div>
  );
};
