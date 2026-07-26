# Such A Good Clock

[![Live demo](https://img.shields.io/badge/live%20demo-online-brightgreen?logo=googlechrome&logoColor=white)](https://nazmiefearmutcu.github.io/such-a-good-clock/)
[![Release](https://img.shields.io/github/v/release/nazmiefearmutcu/such-a-good-clock?label=release&color=blue)](https://github.com/nazmiefearmutcu/such-a-good-clock/releases)
[![License: MIT](https://img.shields.io/github/license/nazmiefearmutcu/such-a-good-clock?color=blue)](LICENSE)
[![Desktop builds](https://img.shields.io/github/actions/workflow/status/nazmiefearmutcu/such-a-good-clock/desktop-build.yml?label=desktop%20builds)](https://github.com/nazmiefearmutcu/such-a-good-clock/actions/workflows/desktop-build.yml)
[![Stars](https://img.shields.io/github/stars/nazmiefearmutcu/such-a-good-clock?style=flat&logo=github)](https://github.com/nazmiefearmutcu/such-a-good-clock/stargazers)

**A clock you'd actually want fullscreen on a spare monitor.** Eleven cinematic themes, three clock faces (digital, analog, flip), alarms, countdown timers, a Pomodoro mode, a stopwatch with laps and CSV export, a multi-timezone world clock, ambient soundscapes, and full keyboard control. Runs as a browser PWA (offline-capable) or as a native macOS / Windows / Linux desktop app.

## Download

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

After dragging Such A Good Clock to your `/Applications` folder, the first
launch shows a one-time *"downloaded from the internet"* prompt — that's
macOS Gatekeeper. The app is unsigned (every byte of source is right here
on GitHub), so right-click → **Open** the first time to confirm. Subsequent
launches behave like any other app.

<details>
<summary>Linux + alternate downloads</summary>

| Platform | File |
| --- | --- |
| Linux AppImage | [`Such.A.Good.Clock-2.0.1.AppImage`](https://github.com/nazmiefearmutcu/such-a-good-clock/releases/latest/download/Such.A.Good.Clock-2.0.1.AppImage) |
| Linux Debian/Ubuntu | [`such-a-good-clock_2.0.1_amd64.deb`](https://github.com/nazmiefearmutcu/such-a-good-clock/releases/latest/download/such-a-good-clock_2.0.1_amd64.deb) |
| Linux tarball | [`such-a-good-clock-2.0.1.tar.gz`](https://github.com/nazmiefearmutcu/such-a-good-clock/releases/latest/download/such-a-good-clock-2.0.1.tar.gz) |
| Apple Silicon Mac (zip) | [`Such.A.Good.Clock-2.0.1-arm64-mac.zip`](https://github.com/nazmiefearmutcu/such-a-good-clock/releases/latest/download/Such.A.Good.Clock-2.0.1-arm64-mac.zip) |
| Windows portable | [`Such.A.Good.Clock.2.0.1.exe`](https://github.com/nazmiefearmutcu/such-a-good-clock/releases/latest/download/Such.A.Good.Clock.2.0.1.exe) |

Or browse [all releases](https://github.com/nazmiefearmutcu/such-a-good-clock/releases).

</details>

## Preview

> Live demo: **[nazmiefearmutcu.github.io/such-a-good-clock](https://nazmiefearmutcu.github.io/such-a-good-clock/)**

![Such A Good Clock — Matrix theme, phosphor green CRT digits with a rotating quote](docs/screenshots/theme-matrix.png)

### Cinematic themes

#### Matrix
![Matrix theme — phosphor green CRT, digital rain, monospace digits with a rotating Matrix quote](docs/screenshots/theme-matrix.png)

#### 2049 (Blade Runner)
![Blade Runner 2049 theme — amber serif digits over a warm dust haze](docs/screenshots/theme-bladerunner.png)

#### Interstellar
![Interstellar theme — thin elegant white-gold digits with a calm warm glow over a deep star field](docs/screenshots/theme-interstellar.png)

#### Cyberpunk
![Cyberpunk theme — neon cyan/magenta digits over a glowing grid and data rain](docs/screenshots/theme-cyberpunk.png)

#### Synthwave
![Synthwave theme — retro 80s neon sunset with a moving perspective grid](docs/screenshots/theme-synthwave.png)

#### Dune
![Dune theme — warm desert sand drift with golden light digits](docs/screenshots/theme-dune.png)

#### Mandalorian
![Mandalorian theme — beskar silver digits over a quiet star field](docs/screenshots/theme-mandalorian.png)

#### Trinity (Oppenheimer)
![Trinity theme — stark white digits with a sepia burn over a quiet dark field](docs/screenshots/theme-oppenheimer.png)

#### Alien (Nostromo amber CRT)
![Alien theme — amber phosphor CRT digits with a hard inner glow, Nostromo aesthetic](docs/screenshots/theme-alien.png)

#### Pinkie
![Pinkie theme — bubblegum pink digits with confetti](docs/screenshots/theme-pinkie.png)

#### Rainbow
![Rainbow theme — rainbow gradient digits over a sky with speed streaks](docs/screenshots/theme-rainbow.png)

### Clock faces

Pick **Digital**, **Analog** (SVG hands), or **Flip** for any theme.

![Analog clock face on the Interstellar theme — SVG hour, minute, and second hands](docs/screenshots/clock-face-analog.png)

![Flip clock face on the Synthwave theme — split-flap style digits](docs/screenshots/clock-face-flip.png)

### Functional surfaces

#### Theme studio
![Settings page with live theme previews, layout and clock-face selectors, custom color palette, and accent swatches](docs/screenshots/settings-theme-picker.png)

#### Timer & Pomodoro
![Countdown timer with a circular progress ring, hour/minute/second inputs, presets, and a Pomodoro toggle](docs/screenshots/timer.png)

#### Stopwatch
![Stopwatch with hundredths display, lap list, and CSV export](docs/screenshots/stopwatch.png)

#### World Clock
![World clock grid showing live times across New York, Los Angeles, London, Istanbul, Tokyo, and Sydney](docs/screenshots/world-clock.png)

#### Alarms
![Alarms page with a time + label + sound + repeat form, quick +1m / +10m / +30m / +5s test buttons, and saved alarms](docs/screenshots/alarms.png)

Such A Good Clock opens directly into a polished Matrix-inspired clock by default: split layout, live seconds, steady colon, full-volume Web Audio, auto-hiding top tabs, animated background effects, and CRT scanlines. From there, switch between eleven cinematic themes, choose a digital, analog, or flip face, tune the clock with a three-color palette, set alarms, run countdown timers or a Pomodoro cycle, time things with the stopwatch, track multiple timezones, and layer in ambient sound — in the browser or as a native desktop app.

## Features

- Three clock faces — **digital**, **analog** (SVG hands), and **flip** — switchable per theme.
- Clock, Alarms, Timer, Stopwatch, World, and Settings pages.
- Eleven visual themes: Matrix, 2049, Alien, Interstellar, Cyberpunk, Dune, Synthwave, Mandalorian, Trinity (Oppenheimer), Pinkie, and Rainbow.
- Theme cards with live previews and cinematic animated backgrounds.
- Three layouts (split, stack, minimal), four font scales (S/M/L/XL), accent swatches, and a custom three-stop clock color palette (top, middle, bottom).
- Display toggles: 12/24-hour, show seconds, blinking colon, and four date formats (long / short / ISO / hidden).
- Animated background effects, CRT scanlines, optional film-grain overlay, and an auto-hide top bar.
- Personal greeting controls: time-based greeting + quote, just-name, custom motto, or no greeting.
- Daily, weekday, weekend, and one-time alarms, plus quick +1 min / +10 min / +30 min and +5 second test buttons; the alarm popup follows you across pages with stop and 5-minute snooze.
- Countdown timer with a circular progress ring, hour/minute/second inputs, presets, and a 3-second test flow.
- **Pomodoro mode**: configurable work, short-break, long-break, and rounds, with session dots and auto-advancing phases.
- **Stopwatch** with hundredths precision, laps that highlight best and worst splits, and one-click **CSV export** of laps.
- **World clock**: add any IANA timezone with an optional label and watch the time update live across a grid.
- Six Web Audio alert sounds (Strong bell, Soft pulse, Triple chime, Digital beep, Cosmic tone, Gentle rise) with volume, mute, and per-alarm/per-timer defaults.
- **Ambient soundscapes**: Rain, Space, Fan, Café, or Forest, with an independent ambient volume.
- **Keyboard shortcuts** and a one-tap fullscreen toggle.
-localStorage persistence for alarms, world clocks, Pomodoro config, and all settings.
- Installable app shortcut support through a web app manifest and service worker.
- Modern modular ES6 architecture compiled and bundled with **Vite** for optimum performance.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Space` | Start / pause timer or stopwatch |
| `R` | Reset timer or stopwatch |
| `L` | Lap (stopwatch) |
| `F` | Toggle fullscreen |
| `1`–`6` | Switch tabs (Clock, Alarms, Timer, Stopwatch, World, Settings) |
| `←` / `→` | Previous / next theme |
| `Esc` | Stop ring / close dialog |
| `?` | Show the shortcuts panel |

## Open

Use the live app:

```text
https://nazmiefearmutcu.github.io/such-a-good-clock/
```

On supported desktop and mobile browsers, use the browser's install option to add Such A Good Clock as an app shortcut.

## Native Apps

The repository includes an Electron desktop shell that packages the same Such A Good Clock web app as a native desktop application.

Open the installed macOS app:

```bash
open "/Applications/Such A Good Clock.app"
```

Run the native app locally:

```bash
npm run desktop:run
```

Build desktop packages:

```bash
npm run desktop:build:mac
npm run desktop:build:win
npm run desktop:build:linux
```

Each build writes installers or archives to `dist-native/`. The GitHub Actions workflow builds macOS, Windows, and Linux artifacts on their matching runners and attaches them to tagged releases.

## Run

Run the local development server:

```bash
npm run dev
```

Then open the output address (usually `http://localhost:5173`).

To build the static production files and preview them:

```bash
npm run build
npm run serve
```

## Test

```bash
npm install
npm run test:e2e
```

The automated end-to-end smoke test builds the project using Vite, boots the app, verifies the live digital clock renders and ticks, checks corrupt-storage recovery, validates the PWA manifest and offline service-worker load, and confirms an alarm and a timer both fire Web Audio events. 

The test scenarios are modularized into independent test modules under `scripts/tests/` and screenshots are saved to `dist/test-results/such-a-good-clock-e2e.png`.

Current manual and automated coverage is tracked in `TEST_PLAN.md`.

