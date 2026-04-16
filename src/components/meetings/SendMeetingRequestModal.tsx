import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { entrepreneurs, investors } from '../../data/users';
import { getUserLabel } from '../../utils/userDirectory';
import type { UserRole } from '../../types';

interface SendMeetingRequestModalProps {
  open: boolean;
  userId: string;
  userRole: UserRole;
  onClose: () => void;
  onSubmit: (payload: {
    receiverId: string;
    title: string;
    start: string;
    end: string;
    message?: string;
  }) => void;
}

function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const SendMeetingRequestModal: React.FC<SendMeetingRequestModalProps> = ({
  open,
  userId,
  userRole,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('Intro call');
  const [receiverId, setReceiverId] = useState('');
  const [message, setMessage] = useState('');
  const [startLocal, setStartLocal] = useState(() =>
    toLocalInputValue(new Date(Date.now() + 86400000).toISOString())
  );
  const [endLocal, setEndLocal] = useState(() =>
    toLocalInputValue(new Date(Date.now() + 86400000 + 45 * 60000).toISOString())
  );

  const recipients = useMemo(
    () => {
      const pool = userRole === 'entrepreneur' ? investors : entrepreneurs;
      return pool.filter((u) => u.id !== userId);
    },
    [userRole, userId]
  );

  const firstRecipientId = recipients[0]?.id ?? '';

  useEffect(() => {
    if (open) {
      setReceiverId(''); // Clear receiverId on open to force selection
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(startLocal).toISOString();
    const end = new Date(endLocal).toISOString();
    if (!receiverId) return;
    onSubmit({
      receiverId,
      title: title.trim() || 'Meeting',
      start,
      end,
      message: message.trim() || undefined,
    });
    onClose();
  };

  const recipientLabel = userRole === 'entrepreneur' ? 'Investor' : 'Entrepreneur';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="meeting-request-title"
    >
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 id="meeting-request-title" className="text-lg font-semibold text-gray-900">
            Request a meeting with {userRole === 'entrepreneur' ? 'an investor' : 'a founder'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{recipientLabel}</label>
            <select
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              required
            >
              <option value="" disabled>
                -- Select a {recipientLabel.toLowerCase()} --
              </option>
              {recipients.map((u) => (
                <option key={u.id} value={u.id}>
                  {getUserLabel(u.id)}
                </option>
              ))}
            </select>
            {recipients.length === 0 && (
              <p className="mt-1 text-sm text-amber-700">No {recipientLabel.toLowerCase()}s available.</p>
            )}
          </div>

          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Meeting title"
            fullWidth
            required
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Starts</label>
              <input
                type="datetime-local"
                value={startLocal}
                onChange={(e) => setStartLocal(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Ends</label>
              <input
                type="datetime-local"
                value={endLocal}
                onChange={(e) => setEndLocal(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Context for the invite…"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!recipients.length}>
              Send request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
