export type UserRole = 'entrepreneur' | 'investor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  bio: string;
  isOnline?: boolean;
  createdAt: string;
}

export interface Entrepreneur extends User {
  role: 'entrepreneur';
  startupName: string;
  pitchSummary: string;
  fundingNeeded: string;
  industry: string;
  location: string;
  foundedYear: number;
  teamSize: number;
}

export interface Investor extends User {
  role: 'investor';
  investmentInterests: string[];
  investmentStage: string[];
  portfolioCompanies: string[];
  totalInvestments: number;
  minimumInvestment: string;
  maximumInvestment: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface CollaborationRequest {
  id: string;
  investorId: string;
  entrepreneurId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface ChamberDocument {
  id: string;
  title: string;
  fileName: string;
  fileData?: string;
  fileType?: string;
  uploadedBy: string;
  status: 'draft' | 'in_review' | 'signed';
  signature?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (userId: string, updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/** Time window when a user is available for meetings */
export interface AvailabilitySlot {
  id: string;
  userId: string;
  start: string;
  end: string;
  label?: string;
}

export type MeetingStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface Meeting {
  id: string;
  senderId: string;
  receiverId: string;
  senderRole: UserRole;
  title: string;
  /** ISO start / end (date & time) */
  start: string;
  end: string;
  message?: string;
  status: MeetingStatus;
  createdAt: string;
  respondedAt?: string;
}

export interface MeetingsContextType {
  meetings: Meeting[];
  availabilitySlots: AvailabilitySlot[];
  getSlotsForUser: (userId: string) => AvailabilitySlot[];
  getPendingIncoming: (userId: string) => Meeting[];
  getPendingOutgoing: (userId: string) => Meeting[];
  getConfirmedMeetingsForUser: (userId: string) => Meeting[];
  getRejectedMeetingsForUser: (userId: string) => Meeting[];
  getUpcomingAcceptedForUser: (userId: string, opts?: { limit?: number; from?: Date }) => Meeting[];
  getPendingDashboardCount: (userId: string) => number;
  sendMeetingRequest: (
    senderId: string,
    receiverId: string,
    senderRole: UserRole,
    payload: { title: string; start: string; end: string; message?: string }
  ) => void;
  acceptMeeting: (meetingId: string, userId: string) => void;
  rejectMeeting: (meetingId: string, userId: string) => void;
  markAsCompleted: (meetingId: string) => void;
  addAvailabilitySlot: (
    userId: string,
    start: string,
    end: string,
    label?: string
  ) => void;
  removeAvailabilitySlot: (id: string, userId: string) => void;
  updateAvailabilitySlot: (
    id: string,
    userId: string,
    updates: Partial<Pick<AvailabilitySlot, 'start' | 'end' | 'label'>>
  ) => void;
}

export type TransactionType = 'deposit' | 'withdraw' | 'transfer';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Transaction {
  id: string;
  senderId?: string;
  receiverId?: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  date: string;
}

export interface Wallet {
  userId: string;
  balance: number;
}

export interface PaymentsContextType {
  wallets: Record<string, Wallet>;
  transactions: Transaction[];
  getBalance: (userId: string) => number;
  getTransactionsForUser: (userId: string) => Transaction[];
  deposit: (userId: string, amount: number) => Promise<void>;
  withdraw: (userId: string, amount: number) => Promise<void>;
  transfer: (senderId: string, receiverId: string, amount: number) => Promise<void>;
  isLoading: boolean;
}