import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { addDays, addHours, setHours, setMinutes, startOfDay } from 'date-fns';
import toast from 'react-hot-toast';
import type {
  AvailabilitySlot,
  Meeting,
  MeetingsContextType,
  UserRole,
} from '../types';
import { findUserById } from '../utils/userDirectory';

const STORAGE_KEY_V2 = 'nexus_meetings_state_v3';

interface PersistedState {
  availabilitySlots: AvailabilitySlot[];
  meetings: Meeting[];
}

const MeetingsContext = createContext<MeetingsContextType | undefined>(undefined);

function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function buildDemoSeed(): PersistedState {
  const base = startOfDay(new Date());
  const day = (offset: number) => addDays(base, offset);
  const at = (d: Date, h: number, m: number) =>
    setMinutes(setHours(d, h), m).toISOString();

  const availabilitySlots: AvailabilitySlot[] = [
    {
      id: newId(),
      userId: 'e1',
      start: at(day(2), 10, 0),
      end: at(day(2), 11, 30),
      label: 'Open office',
    },
  ];

  const meetings: Meeting[] = [
    {
      id: newId(),
      senderId: 'i1',
      receiverId: 'e1',
      senderRole: 'investor',
      title: 'Intro — TechWave AI',
      start: at(day(5), 11, 0),
      end: at(day(5), 11, 45),
      message: 'Would love a short intro to learn more about your round.',
      status: 'pending',
      createdAt: addHours(new Date(), -26).toISOString(),
    },
    {
      id: newId(),
      senderId: 'i2',
      receiverId: 'e2',
      senderRole: 'investor',
      title: 'Follow-up — GreenLife',
      start: at(day(1), 15, 0),
      end: at(day(1), 15, 45),
      status: 'accepted',
      createdAt: addDays(new Date(), -2).toISOString(),
      respondedAt: addDays(new Date(), -3).toISOString(),
    },
  ];

  return { availabilitySlots, meetings };
}

function loadState(): PersistedState {
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY_V2);
    if (rawV2) {
      const parsed = JSON.parse(rawV2) as PersistedState;
      if (Array.isArray(parsed.meetings) && Array.isArray(parsed.availabilitySlots)) {
        return parsed;
      }
    }
  } catch {
    // fall through
  }
  return buildDemoSeed();
}

function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function involvesUser(m: Meeting, userId: string): boolean {
  return m.senderId === userId || m.receiverId === userId;
}

export const MeetingsProvider: React.FC<{ children: React.ReactNode; currentUser?: any }> = ({ children, currentUser }) => {
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [lastUserId, setLastUserId] = useState<string | null>(null);

  useEffect(() => {
    const s = loadState();
    setAvailabilitySlots(s.availabilitySlots);
    setMeetings(s.meetings);
    setHydrated(true);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_V2 && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as PersistedState;
          if (Array.isArray(parsed.meetings)) setMeetings(parsed.meetings);
          if (Array.isArray(parsed.availabilitySlots)) setAvailabilitySlots(parsed.availabilitySlots);
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Clear meetings when user changes (account switch)
  useEffect(() => {
    if (currentUser?.id && lastUserId && lastUserId !== currentUser.id) {
      // User has switched, clear demo data
      setAvailabilitySlots([]);
      setMeetings([]);
      localStorage.removeItem(STORAGE_KEY_V2);
    }
    if (currentUser?.id) {
      setLastUserId(currentUser.id);
    }
  }, [currentUser?.id, lastUserId]);

  useEffect(() => {
    if (!hydrated) return;
    saveState({ availabilitySlots, meetings });
  }, [availabilitySlots, meetings, hydrated]);

  const getSlotsForUser = useCallback((userId: string) => {
    return availabilitySlots.filter((s) => s.userId === userId);
  }, [availabilitySlots]);

  const getPendingIncoming = useCallback(
    (userId: string) =>
      meetings.filter(
        (m) => m.receiverId === userId && m.status === 'pending'
      ),
    [meetings]
  );

  const getPendingOutgoing = useCallback(
    (userId: string) =>
      meetings.filter((m) => m.senderId === userId && m.status === 'pending'),
    [meetings]
  );

  const getConfirmedMeetingsForUser = useCallback(
    (userId: string) =>
      meetings
        .filter((m) => involvesUser(m, userId) && m.status === 'accepted')
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [meetings]
  );

  const getRejectedMeetingsForUser = useCallback(
    (userId: string) =>
      meetings
        .filter((m) => involvesUser(m, userId) && m.status === 'rejected')
        .sort((a, b) => new Date(b.respondedAt ?? b.createdAt).getTime() - new Date(a.respondedAt ?? a.createdAt).getTime()),
    [meetings]
  );

  const getUpcomingAcceptedForUser = useCallback(
    (userId: string, opts?: { limit?: number; from?: Date }) => {
      const from = opts?.from ?? new Date();
      const limit = opts?.limit ?? 50;
      return getConfirmedMeetingsForUser(userId)
        .filter((m) => new Date(m.end) >= from)
        .slice(0, limit);
    },
    [getConfirmedMeetingsForUser]
  );

  const getPendingDashboardCount = useCallback(
    (userId: string) => {
      return meetings.filter(
        (m) => m.receiverId === userId && m.status === 'pending'
      ).length;
    },
    [meetings]
  );

  const sendMeetingRequest = useCallback(
    (
      senderId: string,
      receiverId: string,
      senderRole: UserRole,
      payload: { title: string; start: string; end: string; message?: string }
    ) => {
      // Check that sender and receiver are different
      if (senderId === receiverId) {
        toast.error('You cannot send a meeting request to yourself');
        return;
      }

      // Validate time range
      if (new Date(payload.end) <= new Date(payload.start)) {
        toast.error('End time must be after start time');
        return;
      }

      // Get sender info (should be the current user)
      const sender = findUserById(senderId, currentUser);
      if (!sender) {
        toast.error('Invalid sender');
        return;
      }

      // Receiver can be either a demo user or another API user
      // We're lenient here since we're in hybrid demo/API mode
      if (!receiverId || receiverId.trim().length === 0) {
        toast.error('Invalid receiver');
        return;
      }

      const meeting: Meeting = {
        id: newId(),
        senderId,
        receiverId,
        senderRole,
        title: payload.title.trim() || 'Meeting',
        start: payload.start,
        end: payload.end,
        message: payload.message?.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      setMeetings((prev) => [...prev, meeting]);
      toast.success('Meeting request sent');
    },
    [currentUser]
  );

  const acceptMeeting = useCallback((meetingId: string, userId: string) => {
    setMeetings((prev) => {
      const m = prev.find((x) => x.id === meetingId);
      if (!m) {
        toast.error('Meeting not found');
        return prev;
      }
      if (m.receiverId !== userId) {
        toast.error('Only the receiver can accept this request');
        return prev;
      }
      if (m.status !== 'pending') {
        toast.error('This meeting is no longer pending');
        return prev;
      }
      toast.success('Meeting accepted — moved to confirmed');
      const now = new Date().toISOString();
      return prev.map((x) =>
        x.id === meetingId
          ? { ...x, status: 'accepted' as const, respondedAt: now }
          : x
      );
    });
  }, []);

  const rejectMeeting = useCallback((meetingId: string, userId: string) => {
    setMeetings((prev) => {
      const m = prev.find((x) => x.id === meetingId);
      if (!m) {
        toast.error('Meeting not found');
        return prev;
      }
      if (m.receiverId !== userId) {
        toast.error('Only the receiver can decline this request');
        return prev;
      }
      if (m.status !== 'pending') {
        toast.error('This meeting is no longer pending');
        return prev;
      }
      toast.success('Meeting declined');
      const now = new Date().toISOString();
      return prev.map((x) =>
        x.id === meetingId
          ? { ...x, status: 'rejected' as const, respondedAt: now }
          : x
      );
    });
  }, []);

  const markAsCompleted = useCallback((meetingId: string) => {
    setMeetings((prev) => {
      const m = prev.find((x) => x.id === meetingId);
      if (!m) {
        toast.error('Meeting not found');
        return prev;
      }
      if (m.status !== 'accepted') {
        toast.error('Only accepted meetings can be completed');
        return prev;
      }
      toast.success('Meeting completed');
      return prev.map((x) =>
        x.id === meetingId
          ? { ...x, status: 'completed' as const }
          : x
      );
    });
  }, []);

  const addAvailabilitySlot = useCallback(
    (userId: string, start: string, end: string, label?: string) => {
      if (new Date(end) <= new Date(start)) {
        toast.error('End time must be after start time');
        return;
      }
      const slot: AvailabilitySlot = {
        id: newId(),
        userId,
        start,
        end,
        label,
      };
      setAvailabilitySlots((prev) => [...prev, slot]);
      toast.success('Availability saved');
    },
    []
  );

  const removeAvailabilitySlot = useCallback((id: string, userId: string) => {
    setAvailabilitySlots((prev) => prev.filter((s) => !(s.id === id && s.userId === userId)));
    toast.success('Slot removed');
  }, []);

  const updateAvailabilitySlot = useCallback(
    (id: string, userId: string, updates: Partial<Pick<AvailabilitySlot, 'start' | 'end' | 'label'>>) => {
      setAvailabilitySlots((prev) =>
        prev.map((s) => {
          if (s.id !== id || s.userId !== userId) return s;
          const next = { ...s, ...updates };
          if (new Date(next.end) <= new Date(next.start)) {
            toast.error('End time must be after start time');
            return s;
          }
          return next;
        })
      );
      toast.success('Slot updated');
    },
    []
  );

  const value = useMemo<MeetingsContextType>(
    () => ({
      meetings,
      availabilitySlots,
      getSlotsForUser,
      getPendingIncoming,
      getPendingOutgoing,
      getConfirmedMeetingsForUser,
      getRejectedMeetingsForUser,
      getUpcomingAcceptedForUser,
      getPendingDashboardCount,
      sendMeetingRequest,
      acceptMeeting,
      rejectMeeting,
      markAsCompleted,
      addAvailabilitySlot,
      removeAvailabilitySlot,
      updateAvailabilitySlot,
    }),
    [
      meetings,
      availabilitySlots,
      getSlotsForUser,
      getPendingIncoming,
      getPendingOutgoing,
      getConfirmedMeetingsForUser,
      getRejectedMeetingsForUser,
      getUpcomingAcceptedForUser,
      getPendingDashboardCount,
      sendMeetingRequest,
      acceptMeeting,
      rejectMeeting,
      markAsCompleted,
      addAvailabilitySlot,
      removeAvailabilitySlot,
      updateAvailabilitySlot,
    ]
  );

  return (
    <MeetingsContext.Provider value={value}>{children}</MeetingsContext.Provider>
  );
};

export function useMeetings(): MeetingsContextType {
  const ctx = useContext(MeetingsContext);
  if (!ctx) {
    throw new Error('useMeetings must be used within a MeetingsProvider');
  }
  return ctx;
}
