# River Insights

Premium environmental intelligence platform for **River Islands, California**.

Not just weather — actionable outdoor intelligence powered by environmental data science.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Recharts** for data visualization
- **Leaflet** for interactive maps
- **Zustand** for client state

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/dashboard`.

## Pages

| Route | Description |
|-------|-------------|
| `/dashboard` | Command center — comfort score, best time outdoors, 7-day forecast |
| `/activity` | Activity intelligence scores for 8 outdoor activities |
| `/forecast` | Hourly + 7-day forecast, heat risk, AQI correlation |
| `/air-quality` | AQI analytics with 7/30-day history |
| `/parks` | Local park conditions + interactive map |
| `/community` | Civic reporting system with map pins |

## Data Layer

Mock JSON data in `/data` — designed for easy swap to real APIs:

- `weather.json` → OpenWeather API
- `air-quality.json` → AirNow API
- `activity-scores.json` → computed from weather inputs
- `parks.json` → local GIS / park services
- `community-reports.json` → backend database

Scoring utilities in `/src/utils`:

- `calcComfortScore.ts` — Outdoor Comfort Score (0–100)
- `calcActivityScore.ts` — Per-activity weighted scoring

## Design

Dark-mode-first premium SaaS aesthetic with glassmorphism panels, animated counters, and responsive mobile bottom navigation.

## License

Private — River Islands Environmental Intelligence Platform.
