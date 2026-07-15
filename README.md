# Factory Management - Frontend

Next.js frontend for the Rice Factory Management System.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand
- **Server State:** React Query (TanStack Query)
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios
- **i18n:** next-intl
- **Charts:** Recharts
- **Icons:** Lucide React

## Setup

```bash
npm install

cp .env.local.example .env.local
# Edit .env.local with your API URL

npm run dev
```

The app will be available at `http://localhost:3000`.

## Available Scripts

| Command           | Description              |
|-------------------|--------------------------|
| `npm run dev`     | Start development server |
| `npm run build`   | Production build         |
| `npm start`       | Start production server  |
| `npm run lint`    | Run ESLint               |

## Project Structure

```
src/
├── app/                # Next.js App Router pages
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Main dashboard
│   └── login/          # Login page
├── components/         # Reusable UI components
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utilities, API client, helpers
└── types/              # TypeScript type definitions
```
