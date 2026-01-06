# /chess3d/ - 3D Chess

3D chess with classic imageboard aesthetics. pieces explode. no refunds.

## Features

- **3D Board & Pieces**: Glitchy Staunton-style pieces built from Three.js primitives
- **Full Chess Rules**: All standard moves, en passant, castling, random promotion
- **Three Themes**: Yotsuba (pink), Yotsuba B (blue), Futaba (green)
- **Three AI Modes**:
  - "I eat crayons" - Easy (random moves)
  - "I enjoy suffering" - Hard (minimax with alpha-beta)
  - "Chaotic Bullshittery" - Rules degrade, bot wins eventually
- **Capture Effects**: Particle explosions when pieces are captured
- **Procedural Audio**: Glitch sounds via Web Audio API
- **Move Log**: Standard algebraic notation

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

The production build outputs to `dist/` folder.

**IMPORTANT**: This project is configured to be deployed at `/chess3d/` subdirectory.

The `vite.config.js` has `base: '/chess3d/'` set so that asset URLs resolve correctly when deployed to:
```
https://guyintheloop.com/chess3d/
```

If deploying to a different path, update the `base` option in `vite.config.js`.

### Deploy Steps

1. Run `npm run build`
2. Copy contents of `dist/` to your server's `/chess3d/` directory
3. Ensure `index.html` and `assets/` folder are both present

## Project Structure

```
chess3d/
├── src/
│   ├── chess/          # Pure game logic (no DOM, no Three.js)
│   │   ├── engine.js   # Board state, moves, rules
│   │   ├── san.js      # Algebraic notation
│   │   └── ai.js       # AI move selection
│   ├── render/         # Three.js visuals only
│   │   ├── scene.js    # Camera, lighting, board
│   │   ├── pieces.js   # Piece geometries
│   │   └── particles.js# Capture effects
│   ├── audio/
│   │   └── sfx.js      # Web Audio procedural sounds
│   ├── ui/
│   │   └── hud.js      # Imageboard UI, themes
│   └── main.js         # Integration layer
├── index.html
├── vite.config.js
└── package.json
```

## Architecture

The codebase enforces strict separation:

1. **Chess Logic** (`/src/chess/`): Pure JavaScript, no dependencies on DOM or Three.js. Handles all rules, move validation, game state.

2. **Renderer** (`/src/render/`): Three.js only. Never decides move legality - only visualizes what the engine returns.

3. **Audio** (`/src/audio/`): Web Audio API. Procedural sound generation.

4. **UI** (`/src/ui/`): DOM manipulation for HUD, theme switching, status messages.

5. **Main** (`/src/main.js`): The only file that connects all layers. Requests moves from engine, applies them, instructs renderer/audio/ui what to display.

## Credits

- Built with [Three.js](https://threejs.org/) and [GSAP](https://greensock.com/gsap/)
- Imageboard aesthetic inspired by classic 4chan themes
- Made for [guyintheloop.com](https://guyintheloop.com/)


