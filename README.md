# 🛡️ QuestLog: Gamified Hobby & Life Tracker

A robust, cross-platform (iOS, Android, and Web) application designed to turn daily habits, coding projects, and physical hobbies into an RPG experience. Whether you are building a 2D game in Unity, whittling wood, or doing hardware teardowns, this app tracks your focused time, calculates Experience Points (XP), levels up your skills, and builds a "Strava-style" visual journal of your progress.

## ✨ Core Features

* **🎮 RPG Quest System:** Create custom projects ("Quests"), assign custom icons, and set difficulty multipliers (e.g., x1.5 XP for hard tasks).
* **⏱️ Focus Sessions:** Full-screen live timers with randomized, aesthetic background images to keep you in the zone.
* **📈 Dynamic Leveling & XP:** Advanced math engine that converts active session minutes and difficulty multipliers into XP, visually represented by progress bars.
* **📸 Evidence & Field Notes:** After ending a session, upload a "Proof" photo and write a Captain's Log of what you accomplished.
* **📜 The Journal (Strava-Vibe Feed):** A scrolling, responsive feed of all your past sessions, showing time spent, XP earned, and photos.
* **💻 Fully Responsive Design:** Built with Tamagui to automatically adapt from a compact mobile UI to a wide-screen desktop layout (including a sticky Player Profile sidebar on the web).

## 🛠️ Tech Stack

* **Frontend Framework:** React Native / Expo
* **Routing:** Expo Router (File-based routing & Bottom Tabs)
* **UI & Styling:** Tamagui (Component-driven, atomic CSS, responsive breakpoints)
* **Backend & Database:** Supabase (PostgreSQL)
* **Storage:** Supabase Storage Buckets (for image & GIF hosting)
* **Native Modules:** `expo-image-picker`

## 📂 Project Architecture

The app follows a strict Component-Driven Architecture for maintainability and scalability.

```text
/
├── app/                      # Expo Router File-Based Routing
│   ├── _layout.tsx           # Root layout & Theme Injector
│   ├── login.tsx             # Supabase Auth screen
│   ├── add-quest.tsx         # Quest creation & icon upload form
│   ├── session/
│   │   └── [id].tsx          # Dynamic Focus Session & Logging screen
│   └── (tabs)/               # Bottom Tab Navigator
│       ├── _layout.tsx       # Tab bar configuration
│       ├── index.tsx         # Dashboard (Active Quests Grid)
│       └── journal.tsx       # The Strava-style history feed
│
├── components/               # Reusable UI Components
│   ├── QuestCard.tsx         # Responsive grid card with XP progress bar
│   ├── LiveTimer.tsx         # Isolated high-speed ticking clock
│   └── LogCard.tsx           # Feed post component (Image, Notes, Stats)
│
├── lib/
│   └── supabase.ts           # Supabase client initialization
│
└── tamagui.config.ts         # Design system & responsive breakpoints

```

## 🗄️ Database Schema (Supabase)

The backend relies on a relational PostgreSQL database with the following core tables:

**1. `projects` (Your Quests)**

* `id` (uuid, primary key)
* `user_id` (uuid, foreign key)
* `name` (text)
* `xp_multiplier` (numeric)
* `current_xp` (integer, default 0)
* `current_level` (integer, default 1)
* `color_hex` (text)
* `icon_url` (text)

**2. `active_timers` (State Management)**

* `project_id` (uuid, primary key, foreign key)
* `user_id` (uuid, foreign key)
* `start_time` (timestamptz)

**3. `logs` (The Journal/History)**

* `id` (uuid, primary key)
* `user_id` (uuid, foreign key)
* `project_id` (uuid, foreign key to `projects`)
* `start_time` (timestamptz)
* `end_time` (timestamptz)
* `duration_seconds` (integer)
* `xp_earned` (integer)
* `note` (text, optional)
* `image_url` (text, optional)

**4. `backgrounds` (Session Aesthetics)**

* `id` (uuid, primary key)
* `url` (text) - *Pool of randomized URLs for the Focus screen.*

## 🚀 Getting Started

### Prerequisites

* Node.js installed
* An active Supabase project
* Expo CLI installed

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/questlog.git
cd questlog

```


2. **Install dependencies:**
```bash
npm install

```


3. **Setup Supabase Environment:**
* Create a `.env` file in the root directory.
* Add your Supabase URL and Anon Key:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

```


* Ensure your Supabase Storage has a public bucket named `quest-images` with RLS policies allowing uploads.


4. **Run the app:**
```bash
npx expo start -c

```


*Press `w` to open in a web browser, or scan the QR code with the Expo Go app on your phone.*

## 🔮 Future Roadmap

* [ ] **Juice & Gamification:** Add haptic feedback, sound effects, and confetti animations on level-up.
* [ ] **Offline-First Mode:** Local caching to allow starting and logging sessions without an active internet connection.