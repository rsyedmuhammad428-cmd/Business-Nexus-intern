import React from 'react';
import { format } from 'date-fns';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import type { Meeting, User } from '../../types';
import { findUserById, getUserLabel } from '../../utils/userDirectory';

interface MeetingRequestsPanelProps {
  userId: string;
  currentUser?: User | null;
  pendingIncoming: Meeting[];
  pendingOutgoing: Meeting[];
  onAccept: (meetingId: string) => void;
  onReject: (meetingId: string) => void;
}

const formatRange = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  return `${format(s, 'MMM d, yyyy · h:mm a')} – ${format(e, 'h:mm a')}`;
};

const statusBadgeVariant = (status: Meeting['status']) => {
  if (status === 'pending') return 'accent' as const;
  if (status === 'accepted') return 'primary' as const;
  if (status === 'completed') return 'success' as const;
  return 'gray' as const;
};

export const MeetingRequestsPanel: React.FC<MeetingRequestsPanelProps> = ({
  userId,
  currentUser,
  pendingIncoming,
  pendingOutgoing,
  onAccept,
  onReject,
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-medium text-gray-900">Incoming requests</h2>
          <Badge variant="accent">{pendingIncoming.length} need response</Badge>
        </CardHeader>
        <CardBody className="space-y-4">
          {pendingIncoming.length === 0 ? (
            <p className="text-sm text-gray-600">No incoming requests.</p>
          ) : (
            pendingIncoming.map((m) => {
              const sender = findUserById(m.senderId, currentUser);
              const senderName = sender?.name ?? 'Unknown user';
              const senderAvatar = (sender as any)?.avatarUrl ?? '';
              return (
                <div
                  key={m.id}
                  className="flex flex-col gap-3 rounded-lg border border-gray-100 bg-gray-50/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex gap-3">
                    <Avatar
                      src={senderAvatar}
                      alt={senderName}
                      size="md"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{m.title}</p>
                      <p className="text-sm text-gray-600">
                        From {senderName}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">{formatRange(m.start, m.end)}</p>
                      {m.message && (
                        <p className="mt-2 text-sm text-gray-700 line-clamp-2">{m.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="outline" onClick={() => onReject(m.id)}>
                      Decline
                    </Button>
                    <Button size="sm" onClick={() => onAccept(m.id)}>
                      Accept
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-medium text-gray-900">Sent requests</h2>
          <Badge variant="primary">{pendingOutgoing.length} pending</Badge>
        </CardHeader>
        <CardBody className="space-y-3">
          {pendingOutgoing.length === 0 ? (
            <p className="text-sm text-gray-600">You have no pending sent requests.</p>
          ) : (
            pendingOutgoing.map((m) => {
              const receiver = findUserById(m.receiverId, currentUser);
              const receiverName = receiver?.name ?? 'Unknown user';
              const receiverAvatar = (receiver as any)?.avatarUrl ?? '';
              return (
                <div
                  key={m.id}
                  className="flex flex-col gap-1 rounded-lg border border-gray-100 p-3"
                >
                  <div className="flex gap-3 items-center">
                    <Avatar
                      src={receiverAvatar}
                      alt={receiverName}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">{m.title}</p>
                        <Badge variant={statusBadgeVariant(m.status)}>{m.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        To {receiverName} · {formatRange(m.start, m.end)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardBody>
      </Card>
    </div>
  );
};
