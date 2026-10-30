# Such A Good Clock

A fullscreen clock for a spare monitor, a desk or a focused work session. Use it in the browser or install the Electron desktop app on macOS, Windows or Linux.

[![Live demo](https://img.shields.io/badge/live%20demo-online-brightgreen?logo=googlechrome&logoColor=white)](https://nazmiefearmutcu.github.io/such-a-good-clock/)
[![Release](https://img.shields.io/github/v/release/nazmiefearmutcu/such-a-good-clock?label=release&color=blue)](https://github.com/nazmiefearmutcu/such-a-good-clock/releases)
[![License: MIT](https://img.shields.io/github/license/nazmiefearmutcu/such-a-good-clock?color=blue)](LICENSE)
[![Desktop builds](https://img.shields.io/github/actions/workflow/status/nazmiefearmutcu/such-a-good-clock/desktop-build.yml?label=desktop%20builds)](https://github.com/nazmiefearmutcu/such-a-good-clock/actions/workflows/desktop-build.yml)
[![Stars](https://img.shields.io/github/stars/nazmiefearmutcu/such-a-good-clock?style=flat&logo=github)](https://github.com/nazmiefearmutcu/such-a-good-clock/stargazers)

![Such A Good Clock — Matrix theme, phosphor green CRT digits with a rotating quote](docs/screenshots/theme-matrix.png)

## Open or download

<p align="left">
  <a href="https://github.com/nazmiefearmutcu/such-a-good-clock/releases/latest/download/Such.A.Good.Clock-2.0.1-arm64.dmg">
    <img alt="Download for macOS (Apple Silicon, .dmg)" src="https://img.shields.io/badge/macOS_Apple_Silicon-Download_.dmg-1d1d1f?logo=apple&logoColor=white&style=for-the-badge" />
  </a>
  &nbsp;
  <a href="https://github.com/nazmiefearmutcu/such-a-good-clock/releases/latest/download/Such.A.Good.Clock.Setup.2.0.1.exe">
    <img alt="Download for Windows (.exe installer)" src="https://img.shields.io/badge/Windows-Download_.exe-0078d6?logo=windows&logoColor=white&style=for-the-badge" />
  </a>
  &nbsp;
  <a href="https://nazmiefearmutcu.github.io/such-a-good-clock/">
    <img alt="Open the browser version, no install needed" src="https://img.shields.io/badge/Browser-No_install-2ea043?style=for-the-badge&logo=googlechrome&logoColor=white" />
  </a>
</p>

Linux packages, Windows portable builds and alternative archives are available on the [releases page](https://github.com/nazmiefearmutcu/such-a-good-clock/releases/latest). The macOS build is unsigned; macOS may require an explicit Open action on first launch.

## What it does

| Tool | Controls |
| --- | --- |
| Clock | Digital, analog or flip face; 12/24-hour time, date formats, fullscreen and world clocks using IANA timezones. |
| Alarms | Daily, weekday, weekend or one-time schedules, labels, six alert sounds and five-minute snooze. |
| Timer | Countdown presets and a Pomodoro cycle with configurable work sessions, breaks and rounds. |
| Stopwatch | Laps, split comparisons and CSV export. |
| Appearance | Eleven themes, three layouts, font scales, accent colors, animated backgrounds and optional CRT or grain effects. |
| Audio | Synthesized alerts and rain, space, fan, café or forest ambience with separate volume controls. |

Settings, alarms, world clocks and Pomodoro configuration are saved in the browser's localStorage. The app has no account system or application backend.

## Run from source

Use **Node.js 24** and npm, matching the desktop build workflow.

```bash
git clone https://github.com/nazmiefearmutcu/such-a-good-clock.git
cd such-a-good-clock
npm ci
npm run dev
```

Vite prints the local development URL, usually `http://localhost:5173`. Build and preview the static app with:

```bash
npm run build
npm run serve
```

The production bundle is written to `dist/`. In a supported browser, the web manifest enables installation and the service worker caches the app shell for subsequent offline use. The initial load needs a connection; Google Fonts may be unavailable offline until cached.

## Architecture

The browser and desktop editions share one UI and one state model:

```text
index.html → src/app.js → UI + state + audio + effects
                      ↓
              Vite bundle in dist/
                      ↓
          browser/PWA or Electron window
```

| Module | Responsibility |
| --- | --- |
| `src/app.js` | Initializes the app, starts the clock loop and registers the service worker. |
| `src/ui.js` / `src/dom.js` | Renders tools, binds controls and keyboard events, and checks alarm/timer deadlines. |
| `src/state.js` | Validates settings and persists them in localStorage. |
| `src/audio.js` / `src/fx.js` | Generates Web Audio sounds and Canvas background effects. |
| `public/sw.js` | Caches the web app shell and handles offline fallback. |
| `desktop/main.cjs` | Loads the compiled app in an Electron window with sandboxing and context isolation. |

Audio starts after browser permission or a user gesture. Alarms and timers run inside the open app; closing it or suspending the device interrupts scheduling. A saved countdown reloads paused. World clocks use the device clock and timezone data.

## Keyboard controls

| Key | Action |
| --- | --- |
| `Space` | Start or pause the timer/stopwatch |
| `R` / `L` | Reset / record a stopwatch lap |
| `F` | Toggle fullscreen |
| `1`–`6` | Switch tools |
| `←` / `→` | Switch themes |
| `Esc` | Stop an alert or close a dialog |
| `?` | Open the shortcut panel |

## Desktop builds

```bash
npm run desktop:run
npm run desktop:build:mac
npm run desktop:build:win
npm run desktop:build:linux
```

Run the matching build on its target operating system. Packages are written to `dist-native/`; [GitHub Actions](.github/workflows/desktop-build.yml) builds all three platforms and attaches artifacts to tagged releases.

## Screenshots

<details>
<summary>All themes, clock faces and tools</summary>

![Matrix theme — phosphor green CRT, digital rain, monospace digits with a rotating Matrix quote](docs/screenshots/theme-matrix.png)

![Blade Runner 2049 theme — amber serif digits over a warm dust haze](docs/screenshots/theme-bladerunner.png)

![Interstellar theme — thin elegant white-gold digits with a calm warm glow over a deep star field](docs/screenshots/theme-interstellar.png)

![Cyberpunk theme — neon cyan/magenta digits over a glowing grid and data rain](docs/screenshots/theme-cyberpunk.png)

![Synthwave theme — retro 80s neon sunset with a moving perspective grid](docs/screenshots/theme-synthwave.png)

![Dune theme — warm desert sand drift with golden light digits](docs/screenshots/theme-dune.png)

![Mandalorian theme — beskar silver digits over a quiet star field](docs/screenshots/theme-mandalorian.png)

![Trinity theme — stark white digits with a sepia burn over a quiet dark field](docs/screenshots/theme-oppenheimer.png)

![Alien theme — amber phosphor CRT digits with a hard inner glow, Nostromo aesthetic](docs/screenshots/theme-alien.png)

![Pinkie theme — bubblegum pink digits with confetti](docs/screenshots/theme-pinkie.png)

![Rainbow theme — rainbow gradient digits over a sky with speed streaks](docs/screenshots/theme-rainbow.png)

![Analog clock face on the Interstellar theme — SVG hour, minute, and second hands](docs/screenshots/clock-face-analog.png)

![Flip clock face on the Synthwave theme — split-flap style digits](docs/screenshots/clock-face-flip.png)

![Settings page with live theme previews, layout and clock-face selectors, custom color palette, and accent swatches](docs/screenshots/settings-theme-picker.png)

![Countdown timer with a circular progress ring, hour/minute/second inputs, presets, and a Pomodoro toggle](docs/screenshots/timer.png)

![Stopwatch with hundredths display, lap list, and CSV export](docs/screenshots/stopwatch.png)

![World clock grid showing live times across New York, Los Angeles, London, Istanbul, Tokyo, and Sydney](docs/screenshots/world-clock.png)

![Alarms page with a time + label + sound + repeat form, quick +1m / +10m / +30m / +5s test buttons, and saved alarms](docs/screenshots/alarms.png)

</details>

## Development

The [Playwright smoke harness](scripts/e2e.mjs) covers the ticking clock, storage recovery, PWA/offline behavior, alarms and timer audio. On macOS/Linux:

```bash
npx playwright install chromium
npm run test:e2e
```

On PowerShell, build first and set the test root explicitly:

```powershell
npm run build
npx playwright install chromium
$env:ROOT = 'dist'
node scripts/e2e.mjs
```

See [TEST_PLAN.md](TEST_PLAN.md), [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md) for further guidance.

## License

[MIT](LICENSE).

Created By Nazmi Efe Armutcu (Aylin)
