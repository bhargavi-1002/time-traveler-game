# Chrono Drift

A stylized browser game where the player jumps through three fractured eras, recovers ancient relics, and restores the broken Chrono Engine.

## Features
- 3 time eras with unique colors and platforms
- Hazard-based platforming and relic collection
- Score, lives, and level progression
- Animated portal and futuristic UI
- No external dependencies required

## How to run

### Option 1: local server
From the project folder, run:

```bash
python3 -m http.server 8000
```

Then open your browser to:

```text
http://localhost:8000
```

### Option 2: open directly
You can also open `index.html` directly in a browser, though a local server is recommended for a smoother experience.

## Controls
- Move: A / D or Left / Right arrow keys
- Jump: W, Up arrow, or Space

## Goal
Collect every relic in each era and enter the glowing portal to advance. If you lose all lives, the mission resets.

## Files
- `index.html` – game shell and HUD
- `style.css` – visual design and interface styling
- `game.js` – gameplay logic and rendering
