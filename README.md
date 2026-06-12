# Calora AI — Client

Telegram Mini App frontend for the Calora AI nutrition tracker.
Photograph your food, scan barcodes, track macros, water, weight, and get AI-powered tips — all inside Telegram.

## Features

- 📸 **AI food scanner** — take a photo → Gemini analyzes dishes & macros
- 📊 **Barcode scanner** — scan product barcodes via Open Food Facts database
- 🏠 **Home dashboard** — daily КБЖУ progress arcs, food log, water tracking
- 📈 **Analytics page** — stats & progress visualization
- 🤖 **AI page** — daily tips & quests powered by Gemini
- 👤 **Profile page** — edit biometrics, goals, and preferences
- 🎨 **Telegram theming** — adapts to Telegram's light/dark/custom themes
- 🌍 **i18n** — English, Russian, Ukrainian (auto-detected from Telegram language)
- 📱 **PWA-ready** — web app manifest, favicons, safe area handling

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build | [Vite](https://vite.dev/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Routing | [React Router 7](https://reactrouter.com/) (lazy-loaded pages) |
| State | [React Query 3](https://tanstack.com/query/v3) + React Context |
| Telegram SDK | [@telegram-apps/sdk-react](https://docs.telegram-mini-apps.com/) |
| Barcode | [@zxing/browser](https://github.com/niclas-niclas/zxing-js/browser) |
| Icons | [Lucide React](https://lucide.dev/) |
| i18n | [i18next](https://www.i18next.com/) + react-i18next |
| Hosting | [Firebase Hosting](https://firebase.google.com/products/hosting) |

## Project Structure

```
├── index.html
├── firebase.json             # Firebase Hosting config (SPA rewrites)
├── vite.config.ts            # Vite + React + Tailwind plugins
├── package.json
│
└── src/
    ├── main.tsx              # Entry: QueryClient, TelegramProvider, ThemeProvider, Router
    ├── App.tsx               # Layout: auth gate, onboarding redirect, nav bar
    ├── router.tsx            # Routes: /, /onboarding, /analytics, /scanner, /ai, /profile
    ├── i18n.ts               # i18next setup (en, ru, ua)
    ├── index.css             # Tailwind imports & global styles
    │
    ├── api/
    │   ├── request.ts        # Axios wrapper — injects initData header automatically
    │   ├── food.ts           # Food analyze, log, list, delete
    │   ├── onboarding.ts     # Onboarding progress, save step, complete
    │   ├── openfoodfacts.ts  # Barcode → product data from Open Food Facts API
    │   └── stats.ts          # Daily stats & active dates for calendar
    │
    ├── pages/
    │   ├── HomePage.tsx       # Dashboard: progress arcs, food log, water tracker
    │   ├── OnboardingPage.tsx # 10-step wizard (gender → medical)
    │   ├── ScannerPage.tsx    # Camera + barcode scanner
    │   ├── AnalyticsPage.tsx  # Stats & charts
    │   ├── AIPage.tsx         # Tips & quests
    │   └── ProfilePage.tsx    # User settings
    │
    ├── components/
    │   ├── NavigationBar/     # Bottom tab bar (Home, Analytics, Scanner, AI, Profile)
    │   ├── DateStrip/         # Horizontal date carousel with active-date highlighting
    │   ├── onboarding/        # Step shell, progress bar, option cards, 10 step components
    │   ├── loading/           # LoadingScreen, ErrorScreen, ErrorBoundary
    │   ├── CameraView.tsx     # Camera stream with capture button
    │   ├── FoodResultModal.tsx      # AI analysis results modal
    │   ├── BarcodeResultModal.tsx   # Barcode scan results modal
    │   ├── NutritionTable.tsx       # Macros display table
    │   ├── ProgressArc.tsx          # Circular progress indicator (SVG)
    │   ├── ModalWindow.tsx          # Reusable bottom sheet modal
    │   ├── Section.tsx / SectionItem.tsx  # Card-style layout blocks
    │   └── Skeleton.tsx             # Loading skeleton placeholder
    │
    ├── hooks/
    │   ├── useTelegram.ts          # Telegram WebApp ready state & safe areas
    │   ├── useTelegramInit.ts      # SDK initialization
    │   ├── useTelegramLanguage.ts  # Auto-detect language from TG
    │   ├── useTelegramLayout.ts    # Expand viewport, header color
    │   ├── useUserSession.ts       # Auth + load user data on mount
    │   ├── useBackButton.ts        # Telegram back button integration
    │   ├── useMainButton.ts        # Telegram main button integration
    │   ├── useCamera.ts            # Camera stream management
    │   ├── useScanner.ts           # Barcode detection loop
    │   ├── useScannerCapture.ts    # Photo capture from scanner view
    │   ├── useFoodAnalysis.ts      # AI analysis state management
    │   ├── useDateStrip.ts         # Date carousel state
    │   └── useDebugReset.ts        # Dev: reset onboarding
    │
    ├── providers/
    │   ├── TelegramRootProvider.tsx # Telegram SDK init wrapper
    │   ├── ThemeProvider.tsx        # Theme context (Telegram / auto / light / dark)
    │   └── ScannerProvider.tsx      # Scanner capture coordination
    │
    ├── context/
    │   ├── TelegramContext.ts  # Telegram ready state
    │   ├── ThemeContext.ts     # Theme colors
    │   ├── UserContext.ts      # User data
    │   └── ScannerContext.ts   # Scanner capture
    │
    ├── interfaces/             # TypeScript types
    │   ├── User.ts, UserData.ts, Profile.ts, Goal.ts
    │   ├── FoodData.ts, Onboarding.ts, Theme.ts
    │   ├── MainButtonOptions.ts, ScannerContextValue.ts
    │   └── ...
    │
    ├── locales/
    │   ├── en/ (common, main, onboarding)
    │   ├── ru/ (common, main, onboarding)
    │   └── ua/ (common, main, onboarding)
    │
    ├── utils/
    │   ├── date.ts           # Date formatting helpers
    │   ├── nutrition.ts      # Nutrition calculation utilities
    │   ├── colors.ts         # Theme color utilities
    │   ├── language.ts       # Language detection & mapping
    │   ├── device.ts         # Device detection
    │   ├── isIOSDevice.ts    # iOS-specific checks
    │   ├── decodeBarcode.ts  # Barcode decoding helpers
    │   └── getValidTheme.ts  # Theme validation
    │
    └── types/
        ├── productData.ts    # Open Food Facts product types
        └── i18next.d.ts      # i18next type augmentation
```

## Setup

### Prerequisites
- Node.js ≥ 18
- npm (or pnpm/yarn)
- Firebase CLI (for deployment)

### 1. Clone & install

```bash
git clone https://github.com/dudha369/calora-ai-client.git
cd calora-ai-client
npm install
```

### 2. Configure environment

Create `.env` in the project root:

```env
VITE_SERVER_API_URL=http://localhost:8080/api
```

For development without Telegram, you can also set:

```env
VITE_DEBUG_INIT_DATA=your-test-init-data-string
```

### 3. Start dev server

```bash
npm run dev
```

Opens at `http://localhost:5173`.

### 4. Build for production

```bash
npm run build
```

Output goes to `dist/`.

### 5. Deploy to Firebase

```bash
firebase deploy --only hosting
```

## Telegram Mini App Setup

1. Create a bot via [@BotFather](https://t.me/BotFather)
2. Set the Mini App URL: `/setmenubutton` → Web App URL → your Firebase hosting URL
3. The client sends the `initData` header on every API request for authentication
4. The server validates the signature using the bot token

## Related

- **[calora-ai-server](https://github.com/dudha369/calora-ai-server)** — FastAPI backend with Gemini AI, Telegram bot, and PostgreSQL

## License

Private — all rights reserved.
