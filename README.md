# F1 Manager Setup Calculator

A web tool that works out the optimal car setup in **F1 Manager** from the in‑game
practice feedback. Enter the feedback the game gives you for a setup, hit **Find
Setup**, and it computes the setups that satisfy every piece of feedback — ranked
by how close they are to your current car.

🌐 **Live:** https://f1setup.it
📱 Also on the [App Store](https://redirect.badasstemple.eu/f1mcios) and [Google Play](https://redirect.badasstemple.eu/f1mcandroid)

---

## How it works

In F1 Manager each car setup (Front Wing, Rear Wing, Anti‑Roll, Tyre Camber,
Toe‑Out) maps to five performance **biases** (Oversteer, Braking, Cornering,
Traction, Straights). During practice the game rates each bias as *optimal /
great / good / bad*. Those ratings constrain how far each bias can be from the
hidden ideal.

The calculator:

1. Lets you record the feedback for the setup you ran.
2. Searches the full grid of ~1,000,000 valid setups, keeping only those whose
   biases are consistent with **all** the feedback you've given.
3. Returns the closest matching setups so you can converge on the perfect car in
   a few practice runs.

The search (`libs/setup.js`) prunes aggressively: each bias is validated at the
earliest loop depth at which it is fully determined (Straights after the wings,
Oversteer/Traction before Toe‑Out, Braking/Cornering last), and branches are
abandoned as soon as their running rule‑break count exceeds the best found.

## Features

- **Feedback‑driven solver** — find all setups matching your practice feedback.
- **Click‑to‑cycle feedback** — tap a bias to step through optimal → great → good
  → bad; colour‑coded, with an optional bad+/bad− mode.
- **Bias history markers** — every recorded feedback is shown as a coloured mark
  on the bias slider (and as value badges in the run history).
- **Multiple slots** — keep several cars/drivers side by side.
- **Track presets** — per‑track starting setups and "perfect range" hints, plus a
  one‑click **Next Track** that logs the current setup as optimal and advances.
- **Cloud sync** — optional Discord sign‑in saves your slots to the cloud
  (falls back to local storage when signed out).
- **Game versions** — supports the 2022 / 2023 / 2024 track calendars.

## Tech stack

- [Next.js 16](https://nextjs.org/) (Pages Router) + React 18
- [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
  primitives + [lucide‑react](https://lucide.dev/) icons
- [Redux Toolkit](https://redux-toolkit.js.org/) + redux‑persist for state
- [NextAuth](https://next-auth.js.org/) (Discord) with a MongoDB adapter for cloud sync
- [bun](https://bun.sh/) as the package manager / runtime

## Getting started

```bash
# install dependencies
bun install

# run the dev server (http://localhost:3000)
bun run dev

# production build / start
bun run build
bun run start
```

The core calculator runs entirely client‑side, so it works without any of the
environment variables below — those are only needed for Discord sign‑in and
cloud sync.

### Environment variables

Create a `.env.local` in the project root:

```bash
MONGODB_URI=          # MongoDB connection string (cloud sync storage)
AUTH_DATABASE_NAME=   # database name for the NextAuth adapter
DISCORD_CLIENT_ID=    # Discord OAuth app client id
DISCORD_CLIENT_SECRET=# Discord OAuth app client secret
NEXTAUTH_SECRET=      # random string used to encrypt sessions
```

## Project structure

```
components/        React components
  ui/              Tailwind + Radix UI kit (Button, Select, Slider, Dialog, …)
  Calculator/      the calculator (solver UI, feedback cycle, history markers)
consts/            track data, setup/bias parameters, validators
libs/              setup solver (setup.js), redux reducers, cloud storage
pages/             Next.js pages + API routes (auth, cloud storage)
public/            static assets, incl. the flags.svg sprite
scripts/           gen-flag-sprite.cjs — rebuilds the flag sprite
```

### Flags

All country/track flags are bundled into a single namespaced SVG sprite at
`public/flags.svg` (rendered via `components/ui/FlagIcon`). To regenerate it from
the source SVGs in `assets/flags/`:

```bash
node scripts/gen-flag-sprite.cjs
```

## Disclaimer

This project is unofficial and is not associated in any way with the Formula 1
companies. F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND
PRIX and related marks are trademarks of Formula One Licensing B.V.

## License

[MIT](LICENSE) © ieb · GitHub: [iebb/F1Manager-Calc](https://github.com/iebb/F1Manager-Calc) · Contact: [@CyberHono](https://twitter.com/CyberHono)
