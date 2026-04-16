# 🚀 Business Nexus — Investor & Entrepreneur Collaboration Platform

Business Nexus is a full-stack-ready React web application that bridges the gap between entrepreneurs and investors. It provides a professional workspace for collaboration requests, meetings, document sharing, real-time messaging, payments, and more.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Features](#features)
- [Pages & Routes](#pages--routes)
- [User Roles](#user-roles)
- [Demo Accounts](#demo-accounts)
- [🔧 Header Alignment Guide](#-header-alignment-guide)
- [Responsive Breakpoints](#responsive-breakpoints)
- [Authentication Flow](#authentication-flow)
- [Customization](#customization)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **React Router v6** | Client-side routing |
| **TailwindCSS v3** | Utility-first styling |
| **Lucide React** | Icon library |
| **React Hot Toast** | Notifications |
| **React Joyride** | Guided walkthrough |
| **React Signature Canvas** | E-signature support |
| **FullCalendar** | Calendar/meetings view |
| **React Dropzone** | File uploads |

---

## 📁 Project Structure

```
Nexus-main/
├── public/
│   ├── logo.svg
│   └── login-bg.png            # Background image for login page
├── src/
│   ├── components/
│   │   ├── auth/               # ProtectedRoute guard
│   │   ├── collaboration/      # Collaboration request cards
│   │   ├── entrepreneur/       # Entrepreneur-specific cards
│   │   ├── investor/           # Investor-specific cards
│   │   ├── layout/
│   │   │   ├── Navbar.tsx      # ⭐ Main header/navigation
│   │   │   ├── Sidebar.tsx     # Left sidebar
│   │   │   └── DashboardLayout.tsx
│   │   ├── meetings/           # Meeting request modals and lists
│   │   ├── payments/           # Transfer modals, transaction tables
│   │   ├── ui/                 # Reusable UI: Button, Card, Avatar, Input...
│   │   └── walkthrough/        # Guided onboarding tour (React Joyride)
│   ├── context/
│   │   ├── AuthContext.tsx     # Authentication state
│   │   ├── MeetingsContext.tsx # Meeting data state
│   │   ├── DocumentsContext.tsx
│   │   └── PaymentsContext.tsx
│   ├── data/                   # Mock data (users, meetings, etc.)
│   ├── pages/
│   │   ├── auth/               # Login, Register
│   │   ├── dashboard/          # Entrepreneur & Investor dashboards
│   │   ├── meetings/           # Meetings page & video call
│   │   ├── documents/          # Document Chamber
│   │   ├── payments/           # Payments & wallet
│   │   ├── messages/           # Messaging
│   │   ├── notifications/      # Notifications
│   │   ├── profile/            # Profile pages
│   │   ├── investors/          # Investor browsing
│   │   ├── entrepreneurs/      # Entrepreneur browsing
│   │   ├── deals/              # Deals (investors only)
│   │   ├── settings/           # Account settings
│   │   └── help/               # Help & support
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Utility functions
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd Nexus-main

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**

### Build for Production

```bash
npm run build
npm run preview
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Two-Factor Auth** | OTP verification step on login |
| 🏠 **Role-based Dashboards** | Separate views for Entrepreneurs and Investors |
| 🤝 **Collaboration Requests** | Send and receive collaboration requests |
| 📅 **Meetings** | Schedule, accept, reject, and join video meetings |
| 💬 **Messaging** | Real-time-style chat between users |
| 📄 **Document Chamber** | Upload, view, and e-sign documents |
| 💳 **Payments & Wallet** | Deposit, transfer, and track transactions |
| 🔔 **Notifications** | Activity notifications |
| 🗺️ **Guided Walkthrough** | First-time onboarding tour using React Joyride |
| 📱 **Fully Responsive** | Works on desktop, tablet, and mobile |
| 🎨 **Professional UI** | Glassmorphism, gradients, and micro-animations |

---

## 🗺️ Pages & Routes

| Route | Page | Access |
|---|---|---|
| `/login` | Login Page | Public |
| `/register` | Register Page | Public |
| `/dashboard/entrepreneur` | Entrepreneur Dashboard | Entrepreneur only |
| `/dashboard/investor` | Investor Dashboard | Investor only |
| `/profile/entrepreneur/:id` | Entrepreneur Profile | Protected |
| `/profile/investor/:id` | Investor Profile | Protected |
| `/investors` | Browse Investors | Entrepreneur only |
| `/entrepreneurs` | Browse Entrepreneurs | Investor only |
| `/meetings` | Meetings Page | Protected |
| `/video-call/:meetingId` | Video Call Room | Protected |
| `/messages` | Messages | Protected |
| `/notifications` | Notifications | Protected |
| `/documents` | Document Chamber | Protected |
| `/payments` | Payments & Wallet | Protected |
| `/deals` | Deals | Investor only |
| `/settings` | Settings | Protected |
| `/help` | Help & Support | Protected |
| `/chat/:userId?` | Chat | Protected |

---

## 👥 User Roles

The platform supports two roles:

- **Entrepreneur**: Can list their startup, find investors, send collaboration requests, share documents, and manage meetings.
- **Investor**: Can browse startups, send collaboration requests, manage deals, and initiate investment transfers.

---

## 🎭 Demo Accounts

Use these credentials on the Login page or click the demo buttons:

| Role | Email | Password |
|---|---|---|
| Entrepreneur | `sarah@techwave.io` | `password123` |
| Investor | `michael@vcinnovate.com` | `password123` |

> A "Quick Account Switcher" dropdown is also available in the header (desktop) and mobile menu for fast switching between demo accounts during development.

---

## 🔧 Header Alignment Guide

The header (`src/components/layout/Navbar.tsx`) uses a carefully tuned set of Tailwind CSS responsive classes to ensure proper alignment and prevent overflow across all screen sizes. Below is a precise explanation of every control point.

### Layout Architecture

```
<nav sticky full-width>
  <div w-full px>           ← Full width container (NO max-w constraint)
    <div flex h-16>         ← Main flex row
      [Logo]                ← Left section
      [Nav Links + Actions] ← Right section (desktop)
      [Hamburger button]    ← Mobile only
    </div>
  </div>
</nav>
```

---

### 🔑 Key Classes Explained

#### 1. The Nav Container — Outer Padding
```tsx
<div className="w-full px-4 sm:px-6 lg:px-8">
```
| Class | Effect |
|---|---|
| `w-full` | Stretches the header across the full browser viewport. Removes the `max-w-7xl mx-auto` centering that was causing the logo to be misaligned with the sidebar. |
| `px-4` | 16px padding on mobile (< 640px) |
| `sm:px-6` | 24px padding on tablet (≥ 640px) |
| `lg:px-8` | 32px padding on desktop (≥ 1024px) |

> ⚠️ **Important**: Do NOT add `max-w-*` or `mx-auto` here. This would re-center the header and break its alignment with the sidebar.

---

#### 2. Navigation Links Group — Responsive Spacing
```tsx
<div className="flex items-center space-x-0.5 lg:space-x-1 border-r border-gray-100 pr-2 mr-2">
```
| Class | Effect |
|---|---|
| `space-x-0.5` | Very tight 2px gap between links on medium screens |
| `lg:space-x-1` | 4px gap between links on large screens (≥ 1024px) |
| `border-r border-gray-100` | Subtle vertical line separator between links and right actions |
| `pr-2 mr-2` | Spacing between the separator line and right-side icons |

---

#### 3. Nav Link Text — Responsive Visibility
```tsx
<span className="ml-2 hidden xl:block whitespace-nowrap">{link.text}</span>
```
| Class | Effect |
|---|---|
| `hidden` | Text is **hidden by default** on md/lg screens (only icons show) |
| `xl:block` | Text becomes visible only on XL screens (≥ 1280px) |
| `whitespace-nowrap` | Prevents text from wrapping onto a second line |

> **To show link text on smaller screens**: Change `xl:block` to `lg:block`. To always hide, keep `hidden` without a `block` counterpart.

---

#### 4. Account Switcher Dropdown — Width Control
```tsx
className="... w-[110px] xl:w-[150px] ..."
```
| Class | Effect |
|---|---|
| `w-[110px]` | Fixed width on lg/standard screens to save space |
| `xl:w-[150px]` | Slightly wider on XL screens |

> **To make the switcher wider**: Increase these pixel values, e.g., `w-[140px] xl:w-[200px]`.

---

#### 5. Logout Button — Icon vs Text
```tsx
<LogOut size={16} className="2xl:mr-2" />
<span className="hidden 2xl:block text-xs">Logout</span>
```
| Class | Effect |
|---|---|
| `hidden 2xl:block` | "Logout" text only shows on 2XL screens (≥ 1536px). Below that, only the icon is shown. |
| `2xl:mr-2` | Adds spacing between icon and text only when text is visible |

> **To show "Logout" text on smaller screens**: Change `2xl:block` to `xl:block`.

---

#### 6. Profile Avatar — Always Visible
```tsx
<div className="flex-shrink-0">
  <Avatar ... />
</div>
```
| Class | Effect |
|---|---|
| `flex-shrink-0` | **Critical**: Prevents the avatar from being squished or hidden when space is tight. Without this, the image gets clipped. |

---

#### 7. Profile Name — Widest Screens Only
```tsx
<div className="hidden 2xl:block text-left flex-shrink-0">
  <p>{user.name}</p>
  <p>{user.role}</p>
</div>
```
| Class | Effect |
|---|---|
| `hidden 2xl:block` | Name and role only appear on very wide (≥ 1536px) screens |
| `flex-shrink-0` | Prevents the text block from compressing |

> **To show name on standard desktop**: Change `2xl:block` to `xl:block`.

---

### 📐 Screen Breakpoint Summary for the Header

| Breakpoint | Screen Width | Logo | Nav Text | Switcher | Logout Text | User Name |
|---|---|---|---|---|---|---|
| `md` | ≥ 768px | ✅ | ❌ | ❌ | ❌ | ❌ |
| `lg` | ≥ 1024px | ✅ | ❌ | ✅ | ❌ | ❌ |
| `xl` | ≥ 1280px | ✅ | ✅ | ✅ | ❌ | ❌ |
| `2xl` | ≥ 1536px | ✅ | ✅ | ✅ | ✅ | ✅ |

---

### 🛠️ Quick Adjustment Cheat Sheet

**Want to show user name on standard (1920x1080) screens?**
```tsx
// Change in Navbar.tsx line ~166
<div className="hidden xl:block text-left flex-shrink-0">
```

**Want nav link text on standard laptops?**
```tsx
// Change in Navbar.tsx line ~111
<span className="ml-2 hidden lg:block whitespace-nowrap">{link.text}</span>
```

**Want a wider account switcher?**
```tsx
// Change in Navbar.tsx line ~121
className="... w-[150px] xl:w-[200px] ..."
```

**Want "Logout" label on standard screens?**
```tsx
// Change in Navbar.tsx line ~153-154
<LogOut size={16} className="xl:mr-2" />
<span className="hidden xl:block text-xs">Logout</span>
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Prefix | Min Width |
|---|---|---|
| Mobile | *(default)* | 0px |
| Small tablet | `sm:` | 640px |
| Tablet | `md:` | 768px |
| Desktop | `lg:` | 1024px |
| Large desktop | `xl:` | 1280px |
| Ultra-wide | `2xl:` | 1536px |

---

## 🔐 Authentication Flow

1. User selects role (Entrepreneur / Investor) on Login page
2. Enters email and password
3. System simulates credential validation → moves to OTP step
4. User enters 4-digit OTP code
5. `AuthContext.login()` is called → user is stored in state
6. React Router redirects to the appropriate dashboard based on role
7. **First-time users** see the Guided Walkthrough tour (powered by React Joyride)
8. Walkthrough completion is tracked per-user in `localStorage`

---

## 🎨 Customization

### Colors
The primary color scheme is defined in `tailwind.config.js`. The default palette uses `primary-600` as the brand blue.

### Fonts
The app uses the default system font stack. To change the font, update the `fontFamily` in `tailwind.config.js` and import from Google Fonts in `index.html`.

### Login Background
Replace `public/login-bg.png` with any high-resolution image to update the login page hero background.

---

## 📄 License

This project is for educational and demonstration purposes.

---

*Built with ❤️ using React, TypeScript, and TailwindCSS.*
