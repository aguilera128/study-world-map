# Study World Map

**English** · [Español](README.es.md)

An interactive world map for **learning the countries of the world by playing**: a 3D globe that
unrolls into a flat 2D map, quizzes with instant feedback, and a review system that keeps asking
what you have not learned yet.

Live at <https://www.studyworldmap.com>. Free software under the [AGPL-3.0](LICENSE).

Almost everything runs in the browser and there are no accounts: progress is stored on the device.
Only if you create a code to continue on another device is it also stored in a database (a Vercel
function, `api/sync.ts`). Three more functions serve the leaderboards, the current weather and the
satellite orbits.

The code, its comments and the contributor docs ([AGENTS.md](AGENTS.md), [DESIGN.md](DESIGN.md),
`docs/`) are written in Spanish. The interface is available in ten languages. The
[Spanish README](README.es.md) is the long version of this one: how the map engine works, how to add
a country or a language, and every decision about the data.

## What it includes

- **Two views of the same map.** A 3D globe and a flat map (Natural Earth projection), with an
  animated transition between them. Countries are vector geometry, sharp at any zoom.
- **Quizzes**, each with its own progress: locate a country, name it, continents, capitals, flags
  and climates. Answers by clicking the map, multiple choice or typing.
- **Countries from the inside.** Spain by provinces, the US by states, and about thirty more
  countries by their regions, counties or districts, with their capitals.
- **Daily challenge.** The same ten questions for everyone each day (derived from the date, no
  server), with a streak and a share button. Optional top-ten leaderboards.
- **Study lists.** Pick exactly the countries that are in an exam and share the list with a link.
- **Physical geography.** Rivers, mountains, seas, deserts, ocean currents, tectonic plates and
  volcanoes, plus the inside of the Earth and the layers of the atmosphere.
- **Live layers.** Day and night, Sun and Moon, the real night sky, current temperature, clouds,
  rain and wind (NOAA GFS, NASA IMERG), and satellites in their current position (CelesTrak, SGP4).
- **Spaced repetition.** Each country sits in a Leitner box per quiz: what you miss comes back sooner.
- **Accessible and offline.** Light and dark themes, keyboard control, reduced motion, installable
  as an app and usable offline after the first visit.
- **Privacy.** No accounts, no ads. The browser talks to no third party unless the visitor accepts
  analytics, and analytics is off unless you configure it.

## Getting started

You need **Node 24** and [pnpm](https://pnpm.io) (the version in `packageManager` in `package.json`).
No account and no environment variable is required to run it locally.

```bash
pnpm install
pnpm dev        # builds the atlas and the static pages, then serves http://localhost:5173
```

Other commands:

```bash
pnpm build      # atlas + static pages + type check + production build into dist/
pnpm preview    # serves dist/ locally
pnpm test       # tests (vitest)
pnpm typecheck
```

In development the map, the quizzes and the weather and satellite layers all work. Sync by code and
the leaderboards need the database (see below).

## Environment variables

All of them are optional locally. Copy `.env.example` to `.env.local` and fill in what you need;
with no value, whatever depends on a variable is switched off. `.env.local` is not committed.

| Variable | What it is for | Without it |
| --- | --- | --- |
| `VITE_SITE_URL` | Public URL (canonical, hreflang, sitemap, robots.txt) | `http://localhost:5173` |
| `VITE_CONTACT_EMAIL` | Contact address and the "report a bug" links | Those links are hidden |
| `VITE_DONATE_URL` | Donation link | No donation page or button |
| `VITE_GTM_ID` | Google Tag Manager container | No analytics and no cookie banner |
| `VITE_TILE_STORE` | Store with the detail tiles (satellite image, night lights) | Only the overview image |
| `TITULAR_NOMBRE`, `TITULAR_NIF`, `TITULAR_DOMICILIO` | Site owner's name, tax ID and address for the legal notice | Shown as "PENDIENTE"; the Vercel build fails |
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | PostgreSQL (Neon): sync and leaderboards | Those two functions do not respond |
| `BLOB_READ_WRITE_TOKEN` | Uploading tiles to Vercel Blob (`scripts/upload-tiles.mjs`) | Tiles cannot be uploaded |

`VITE_*` variables end up in the HTML and JavaScript sent to the browser: never put a secret behind
that prefix. The database tables are created with `node scripts/db-init.mjs`.

## Deploying to Vercel

The project is a static site (Vite) plus four functions under `api/`. `vercel.json` already sets the
build command, the output folder, the cache headers and the Content-Security-Policy, so importing
the repository in Vercel and defining the variables above is enough.

If you deploy your own copy:

- Set the site owner's details: without them the build fails on purpose, so a half-filled legal
  notice is never published.
- **Review the legal texts** (`scripts/data/legales.mjs`). They are the ones of studyworldmap.com,
  written in Spanish for Spanish law, and they describe its services (Vercel, Neon, Google Analytics).
- The AGPL requires you to offer the source code of your version to everyone who uses it over the network.
- If your tile store is not a Vercel Blob, add its domain to `connect-src` in `vercel.json`.

## How it is built

- **Vite, React 19 and strict TypeScript**, state with **Zustand**, styles with **Tailwind CSS 4**,
  interface transitions with **Motion**, tests with **Vitest**.
- **three.js** with custom GLSL shaders. Each vertex stores only (longitude, latitude, country); the
  shader places it with a single function that morphs between a sphere and the flat map, which is
  why the globe "unrolls". Finding the country under the cursor is analytic (ray–sphere or ray–plane
  plus point-in-polygon), with no pixel readback.
- The atlas is generated at build time from Natural Earth (`scripts/build-atlas.mjs`) and
  triangulated in the browser in a worker.

```
api/        Vercel functions: sync, leaderboards, current weather, satellites
scripts/    data and static page generators (run by hand or during the build)
public/     static assets and generated data
src/atlas/  atlas loading and triangulation (no React or three.js, tested)
src/game/   pure logic: quizzes, sessions, progress (tested)
src/engine/ map engine: camera, shaders, palettes, labels
src/app/    state, sync, image export
src/ui/     React components
src/i18n/   one dictionary per language; the Spanish text is the key
docs/       dated plans, proposals and audits
```

## Languages

Spanish at the root and, each under its own prefix, English (`/en/`), French, German, Italian,
Brazilian Portuguese, Valencian/Catalan, Galician, Basque and Simplified Chinese. The translations
were written by a language model and have not been reviewed by native speakers: corrections are
very welcome. The legal texts exist only in Spanish.

## Contributing

Proposals and reports of mistakes (a name, a capital, a border, a translation) are welcome in the
[issues](https://github.com/aguilera128/study-world-map/issues), in English or Spanish.

- Read [AGENTS.md](AGENTS.md) first: it collects the rules you cannot see in the code.
- Every piece of data a student sees must be real and have a source.
- Before opening a pull request, run `pnpm typecheck`, `pnpm test` and `pnpm build`.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/), in Spanish.
- Do not add dependencies without discussing it in an issue first.

By contributing you agree that your contribution is published under the same license.

## Security

Please do not open a public issue for a security problem. Use GitHub's private vulnerability
reporting instead: the repository's **Security → Report a vulnerability** tab
([direct link](https://github.com/aguilera128/study-world-map/security/advisories/new)).

## Credits

Cartography from [Natural Earth](https://www.naturalearthdata.com) (public domain); names from
[Wikidata](https://www.wikidata.org) (CC0); imagery and live data from NASA and NOAA; orbital
elements from [CelesTrak](https://celestrak.org/); flags from
[flag-icons](https://github.com/lipis/flag-icons) (MIT); fonts Besley and Atkinson Hyperlegible Next
(SIL OFL). The full list, with every source and its license, is in the
[Spanish README](README.es.md#créditos) and in the table of [AGENTS.md](AGENTS.md).

## License

The code is free software under the [GNU Affero General Public License v3.0](LICENSE). If you run a
modified version on a website, you must offer its source code to the people who use it.

Third-party data (cartography, NASA and NOAA imagery, star catalogues, flags, fonts…) keeps its own
license: see "Credits". The name "Study World Map", the domain and the icon are not covered by the
license. The illustrations in `public/toon/` are original AI-generated designs.
