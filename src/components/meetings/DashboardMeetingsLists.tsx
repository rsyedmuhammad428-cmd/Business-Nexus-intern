import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowRight, Video } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { Meeting, UserRole } from '../../types';
import { useMeetings } from '../../context/MeetingsContext';
import { findUserById, getUserLabel } from '../../utils/userDirectory';

interface DashboardMeetingsListsProps {
  userId: string;
  role: UserRole;
}

const formatRange = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  return `${format(s, 'MMM d, yyyy · h:mm a')} – ${format(e, 'h:mm a')}`;
};

export const DashboardMeetingsLists: React.FC<DashboardMeetingsListsProps> = ({
  userId,
  role,
}) => {
  const navigate = useNavigate();
  const {
    getPendingIncoming,
    getPendingOutgoing,
    getConfirmedMeetingsForUser,
    getRejectedMeetingsForUser,
    acceptMeeting,
    rejectMeeting,
  } = useMeetings();

  const pendingIncoming = useMemo(
    () => getPendingIncoming(userId),
    [userId, getPendingIncoming]
  );

  const pendingOutgoing = useMemo(
    () => getPendingOutgoing(userId),
    [userId, getPendingOutgoing]
  );

  const confirmed = useMemo(
    () => getConfirmedMeetingsForUser(userId),
    [userId, getConfirmedMeetingsForUser]
  );

  const rejected = useMemo(
    () => getRejectedMeetingsForUser(userId),
    [userId, getRejectedMeetingsForUser]
  );

  const otherPartyId = (m: Meeting) =>
    m.senderId === userId ? m.receiverId : m.senderId;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      {/* Incoming Requests */}
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h2 className="text-lg font-medium text-gray-900">Incoming requests</h2>
          <Badge variant="accent">{pendingIncoming.length}</Badge>
        </CardHeader>
        <CardBody className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {pendingIncoming.length === 0 ? (
            <p className="text-sm text-gray-600">No incoming requests.</p>
          ) : (
            pendingIncoming.map((m) => (
              <div
                key={m.id}
                className="rounded-lg border border-gray-100 bg-gray-50/60 p-3 text-sm"
              >
                <p className="font-medium text-gray-900">{m.title}</p>
                <p className="text-gray-600">From {getUserLabel(m.senderId)}</p>
                <p className="mt-1 text-xs text-gray-500">{formatRange(m.start, m.end)}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => rejectMeeting(m.id, userId)}>
                    Decline
                  </Button>
                  <Button size="sm" onClick={() => acceptMeeting(m.id, userId)}>
                    Accept
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      {/* Sent Requests */}
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h2 className="text-lg font-medium text-gray-900">Sent requests</h2>
          <Badge variant="primary">{pendingOutgoing.length}</Badge>
        </CardHeader>
        <CardBody className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {pendingOutgoing.length === 0 ? (
            <p className="text-sm text-gray-600">No sent requests.</p>
          ) : (
            pendingOutgoing.map((m) => (
              <div
                key={m.id}
                className="rounded-lg border border-primary-100 bg-primary-50/40 p-3 text-sm"
              >
                <p className="font-medium text-gray-900">{m.title}</p>
                <p className="text-gray-600">To {getUserLabel(m.receiverId)}</p>
                <p className="mt-1 text-xs text-gray-500">{formatRange(m.start, m.end)}</p>
                <Badge variant="gray" className="mt-2">Pending</Badge>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h2 className="text-lg font-medium text-gray-900">Confirmed meetings</h2>
          <Badge variant="primary">{confirmed.length}</Badge>
        </CardHeader>
        <CardBody className="space-y-3">
          {confirmed.length === 0 ? (
            <p className="text-sm text-gray-600">No confirmed meetings yet.</p>
          ) : (
            confirmed.slice(0, 6).map((m) => {
              const other = findUserById(otherPartyId(m));
              return (
                <div key={m.id} className="flex flex-col gap-3 rounded-lg border border-primary-100 bg-primary-50/40 p-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{m.title}</p>
                    <p className="text-gray-600">{other?.name ?? getUserLabel(otherPartyId(m))}</p>
                    <p className="mt-1 text-xs text-gray-500">{formatRange(m.start, m.end)}</p>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    leftIcon={<Video size={16} />}
                    onClick={() => navigate(`/video-call/${m.id}`)}
                  >
                    Join Video Call
                  </Button>
                </div>
              );
            })
          )}
        </CardBody>
      </Card>

      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h2 className="text-lg font-medium text-gray-900">Rejected</h2>
          <Badge variant="gray">{rejected.length}</Badge>
        </CardHeader>
        <CardBody className="space-y-3">
          {rejected.length === 0 ? (
            <p className="text-sm text-gray-600">No rejected meetings.</p>
          ) : (
            rejected.slice(0, 5).map((m) => (
              <div key={m.id} className="rounded-lg border border-gray-100 p-3 text-sm text-gray-600">
                <p className="font-medium text-gray-800">{m.title}</p>
                <p>{getUserLabel(otherPartyId(m))}</p>
                <p className="mt-1 text-xs text-gray-500">{formatRange(m.start, m.end)}</p>
              </div>
            ))
          )}
          <Link
            to="/meetings"
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            Full calendar
            <ArrowRight size={14} />
          </Link>
        </CardBody>
      </Card>
    </div>
  );
};
