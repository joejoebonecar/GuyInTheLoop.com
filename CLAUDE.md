# CLAUDE.md - AI Assistant Guide for /gitl/

## Project Overview

**Project Name:** `/gitl/` - Guy in the Loop
**Repository:** joejoebonecar/gitl
**Type:** Static website / Interactive web portfolio
**Purpose:** A personal portfolio and entertainment website featuring interactive games, creative content, and distinctive imageboard-style aesthetics.

## Technology Stack

### Core Technologies
- **HTML5** - Pure HTML with embedded styles and scripts
- **Vanilla JavaScript** - No frameworks, pure ES6+ JavaScript
- **CSS3** - Inline styles with CSS variables and responsive design
- **Canvas API** - For fireworks animation
- **Three.js (r128)** - 3D rendering (chess3d, mancala)
- **GSAP (v3.12.5)** - Animation library (mancala game)
- **Web Audio API** - Sound effects (fireworks)

### Build & Deployment
- **No build system** - This is intentionally a pure static website
- **No package.json** - No npm, webpack, vite, or bundlers
- **No dependencies to install** - External libraries loaded via CDN
- **Deployment** - GitHub Pages compatible (direct file serving)

### Analytics
- **GoatCounter** - Privacy-friendly analytics at `https://guyintheloop.goatcounter.com/count`
- Integrated on most pages via script tag

## Directory Structure

```
/home/user/gitl/
├── index.html              # NEW: Modern landing page with featured content
├── index-old.html          # Previous imageboard-style homepage
├── index.html.backup       # Backup of old version
├── claude.html             # "Work wife" AI relationship page
├── sinks.html              # Satirical sink thread (imageboard parody)
├── world-desserts.html     # Educational desserts gallery
├── fireworks.html          # Interactive fireworks display
├── fireworks-view.html     # Alternative fireworks view
├── fireworks.js            # Fireworks canvas animation logic (ONLY standalone .js file)
├── blackjack/
│   └── index.html          # Blackjack game with AI/2-player/chaos modes
├── chess/
│   ├── index.html          # 2D chess game
│   └── pieces/             # SVG chess piece assets (12 files)
├── chess3d/
│   ├── index.html          # 3D chess with particle effects
│   └── assets/
│       └── index-*.js      # Bundled Three.js application
├── mancala/
│   └── index.html          # 3D mancala with "chaos mode"
├── dessert-images/         # Images for desserts page (7 files)
├── assetsfireworks/        # Fireworks background images (5 PNG files)
└── *.jfif, *.png           # Various image assets
```

## Git Workflow

### Branch Strategy
- **Main branch:** `main` (or default branch name)
- **Feature branches:** Use pattern `claude/descriptive-name-sessionid` for AI-assisted work
  - Example: `claude/claude-md-mkrupoo1kabsf9lh-EkK9F`
  - Branch names MUST start with `claude/` for push access
  - Session ID at end is critical for authentication
- **Pull Request workflow:** Create PRs from feature branches to main

### Git Remote
- **Origin:** Uses local proxy at `http://local_proxy@127.0.0.1:43292/git/joejoebonecar/gitl`
- **Push command:** Always use `git push -u origin <branch-name>`
- **Retry logic:** Network failures should retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s)

### Commit Message Style
Based on recent commits, follow these conventions:
- Use imperative mood: "Add", "Update", "Implement", "Fix"
- Be descriptive but concise
- Examples:
  - "Add GoatCounter analytics tracking to all pages"
  - "Implement new landing page with featured pages"
  - "Add comprehensive mobile responsive design across all pages"
  - "Add epic blackjack game with AI, 2-player, and chaos modes"

## Code Conventions & Patterns

### File Organization
- **Self-contained pages** - Each HTML page is complete and standalone
- **Embedded architecture** - CSS and JavaScript inline in HTML (except fireworks.js)
- **Directory per game** - Each game lives in its own directory with index.html
- **Assets in subdirectories** - Game-specific assets in same directory

### Naming Conventions
- **Files/directories:** Lowercase with hyphens (`world-desserts.html`, `chess3d/`)
- **Classes/IDs:** Lowercase with hyphens (`page-card`, `game-container`)
- **JavaScript:** camelCase for variables and functions

### HTML Structure Pattern
Every page follows this general structure:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Page Name] - /gitl/</title>
    <style>
        /* All CSS inline here */
    </style>
</head>
<body>
    <!-- Content -->

    <!-- GoatCounter analytics (add to most pages) -->
    <script data-goatcounter="https://guyintheloop.goatcounter.com/count"
            async src="//gc.zgo.at/count.js"></script>

    <!-- Game logic inline here (if applicable) -->
</body>
</html>
```

### CSS Conventions

#### Imageboard Color Palette (Yotsuba B)
Most games use this consistent color scheme:
```css
--bg: #f0e0d6;          /* Yotsuba beige background */
--fg: #800000;          /* Maroon text */
--post-bg: #f0e0d6;     /* Post background */
--post-highlight: #d6bad0;  /* Pink highlight */
--border: #d9bfb7;      /* Soft border */
--link: #34345c;        /* Dark blue links */
--quote: #789922;       /* Greentext */
```

#### Mobile Responsive Design
- **Mobile-first approach** - Always include responsive breakpoints
- **Key breakpoints:**
  ```css
  @media (max-width: 768px) { /* tablets and smaller */ }
  @media (max-width: 480px) { /* phones */ }
  ```
- **Test all pages on mobile** - This is a priority

#### Typography
- **Monospace fonts** - Terminal/code aesthetic throughout games
- **Font sizes:** 13px base for games, larger for landing page
- **Letter spacing** - Used for titles to create impact

### JavaScript Patterns

#### Game Architecture
Common pattern across all games:
```javascript
const gameState = {
    // Game state variables
};

// Initialize game
function initGame() {
    // Setup
}

// Event listeners
element.addEventListener('click', handleEvent);

// Animation loop (if needed)
function gameLoop() {
    // Update game
    requestAnimationFrame(gameLoop);
}

// AI logic (if applicable)
function calculateAIMove() {
    // AI decision making
}
```

#### State Management
- **No external state libraries** - Use plain JavaScript objects
- **localStorage** - For persisting user settings (see fireworks.html)
- **In-memory only** - Most games don't persist state between sessions

#### Code Style
- **No semicolons** - Some files omit semicolons (especially games)
- **Compact code** - Inline and concise where possible
- **Functional approach** - Prefer pure functions where applicable
- **Comments** - Minimal in code, but extensive in "imageboard commentary" sections

## Design Principles

### Core Aesthetic
1. **Imageboard style** - 4chan/Yotsuba B aesthetic for games
2. **Humorous tone** - Self-deprecating, ironic commentary
3. **Low-tech intentionality** - No build tools by design, not limitation
4. **Visual consistency** - Color palette maintained across games
5. **Personality** - Each page has character and humor

### Game Design
All games feature:
- Multiple game modes (AI, 2-player, chaos/troll modes)
- Imageboard-style comment sections with fake posts
- Mobile responsiveness
- Visual polish despite retro aesthetic
- Self-aware humor about the game or developer

### Chaos Modes
A recurring theme - games include "chaos" or "troll" modes:
- Chess3D: CHAOS CHESS with random piece movements
- Blackjack: Chaos dealer mode
- Mancala: Rebellious stones that refuse to cooperate
- These should be absurd, humorous, and self-aware

## Development Workflows

### Adding a New Page

1. **Create HTML file** in root or new directory
2. **Follow structure pattern** (see HTML Structure Pattern above)
3. **Use imageboard colors** for consistency (if a game)
4. **Add mobile responsive** CSS from the start
5. **Include GoatCounter** analytics script
6. **Add navigation** - Link from index.html or other pages
7. **Test on mobile** - Critical step
8. **Commit with descriptive message**
9. **Create PR** if on feature branch

### Adding a New Game

1. **Create directory** with game name (lowercase-with-hyphens)
2. **Create index.html** with full game code
3. **Include:**
   - Imageboard aesthetic (Yotsuba B colors)
   - Multiple game modes (AI, 2-player, chaos)
   - Imageboard comment section with fake posts
   - Mobile responsive design
   - GoatCounter analytics
   - Link back to main site
4. **Add assets** in same directory if needed
5. **Link from main** index.html
6. **Test thoroughly** on desktop and mobile

### Updating Existing Pages

1. **Read the file first** - Understand existing structure
2. **Preserve style** - Match existing code patterns
3. **Don't over-engineer** - Keep solutions simple
4. **Test responsive** - Check mobile after changes
5. **Maintain humor** - Keep the personality intact

### Adding Images

1. **Optimize first** - Keep file sizes reasonable
2. **Use descriptive names** - `dragonsbeard.jfif`, not `image1.jfif`
3. **Organize in directories** - Game assets in game directory
4. **Prefer modern formats** - WebP, PNG, JPEG
5. **Consider SVG** - For icons and simple graphics (see chess pieces)

## Common Tasks

### Add Analytics to a Page
```html
<!-- Before closing </body> tag -->
<script data-goatcounter="https://guyintheloop.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>
```

### Link to Main Site
```html
<!-- In header or navigation -->
<a href="../index.html" class="back-link">← back to /gitl/</a>
```

### Create Mobile Responsive Layout
```css
/* Desktop first, then add breakpoints */
@media (max-width: 768px) {
    .container {
        padding: 10px;
    }

    h1 {
        font-size: 24px; /* Reduce size */
    }

    .grid {
        grid-template-columns: 1fr; /* Single column */
    }
}
```

### Add Imageboard Comment Section
```html
<!-- Fake 4chan-style posts explaining features -->
<div class="posts">
    <div class="post">
        <div class="post-info">
            <span class="name">Anonymous</span>
            <span class="date">01/24/26(Fri)12:34:56 No.123456789</span>
        </div>
        <div class="post-content">
            This game is actually pretty fun ngl
        </div>
    </div>
    <!-- More posts -->
</div>
```

## Key Files to Understand

### index.html
- **NEW landing page** - Modern card-based design
- Links to featured pages (Sinks, World Desserts)
- Link to classic imageboard layout
- This is the entry point - keep it updated with best content

### index.html.backup (formerly index-old.html)
- Original imageboard-style homepage
- Links to all games and pages
- Maintains classic aesthetic
- Reference for imageboard styling

### fireworks.js
- **Only standalone JavaScript file** in project
- Canvas-based particle system
- Audio synthesis with Web Audio API
- localStorage for settings
- Good reference for advanced JS patterns

### Game Files
- **blackjack/index.html** - Card game with betting, AI dealer
- **chess/index.html** - Drag-and-drop 2D chess
- **chess3d/index.html** - Three.js 3D chess with particles
- **mancala/index.html** - 3D mancala with GSAP animations

Each game is a complete reference for:
- Game state management
- AI opponent logic
- Imageboard aesthetics
- Mobile responsive design

## Important Notes for AI Assistants

### Do's ✓
- **Read files before editing** - Always understand existing code
- **Preserve aesthetic** - Maintain imageboard style and humor
- **Test responsively** - Check mobile layout
- **Keep it simple** - No build tools, no frameworks
- **Add analytics** - Include GoatCounter on new pages
- **Be consistent** - Follow established patterns
- **Self-contained** - Keep CSS/JS inline (except special cases)
- **Commit descriptively** - Clear commit messages
- **Use feature branches** - claude/* naming pattern

### Don'ts ✗
- **Don't add build tools** - No webpack, npm, etc.
- **Don't use frameworks** - No React, Vue, etc.
- **Don't over-engineer** - Simple solutions preferred
- **Don't break mobile** - Always responsive
- **Don't lose humor** - Personality is important
- **Don't create separate CSS/JS** - Keep inline (except special cases)
- **Don't skip analytics** - GoatCounter on most pages
- **Don't forget backups** - Keep old versions when redesigning

### When Making Changes
1. **Understand context** - Read related files first
2. **Match style** - Code should look like existing code
3. **Preserve comments** - Keep imageboard commentary
4. **Test interactivity** - Games must work properly
5. **Check all modes** - AI, 2-player, chaos modes
6. **Mobile test** - Critical for this project
7. **Commit atomically** - One logical change per commit

### Special Considerations

#### Imageboard Aesthetic
This is NOT just a visual choice - it's core to the project identity:
- Represents internet culture and nostalgia
- Creates cohesive experience across games
- Intentionally low-tech and unpretentious
- Humor and personality through fake forum posts

#### No Build System Philosophy
The lack of build tools is **intentional**:
- Simplicity and accessibility
- Easy to understand for learners
- No dependency hell
- Fast deployment (just push files)
- Demonstrates vanilla JS skills
- DON'T suggest adding build tools

#### Performance Considerations
- **File sizes** - Keep HTML files reasonable (most are <50KB)
- **Image optimization** - Compress images before adding
- **No lazy loading needed** - Files are small enough
- **CDN for libraries** - Three.js, GSAP from CDN
- **Minimal HTTP requests** - Inline CSS/JS helps

## Testing Checklist

Before committing changes to games or pages:

- [ ] Page loads without errors
- [ ] All game modes work (AI, 2-player, chaos)
- [ ] Mobile responsive on phone-sized screen
- [ ] Mobile responsive on tablet-sized screen
- [ ] GoatCounter analytics script present
- [ ] Links back to main site work
- [ ] Images load correctly
- [ ] Colors match imageboard palette (for games)
- [ ] No console errors
- [ ] Interactive elements respond properly
- [ ] Text is readable on all screen sizes

## Recent Changes & Project Evolution

### Recent Major Updates
1. **New landing page** (PR #33) - Modern card-based index.html
2. **GoatCounter analytics** (PR #32) - Privacy-friendly tracking added
3. **Mobile responsive** (PR #31) - Comprehensive mobile support
4. **Chaos modes** (PR #28) - Troll modes added to all games
5. **Blackjack game** (PR #28) - Full card game with AI

### Project Direction
- Moving toward featured content approach (new index.html)
- Maintaining backward compatibility (old layout still accessible)
- Emphasis on mobile experience
- Adding more creative/humorous content
- Games remain imageboard-styled
- Analytics for understanding traffic

## Useful Commands

### Git Operations
```bash
# Create and switch to feature branch
git checkout -b claude/feature-description-sessionid

# Stage and commit changes
git add .
git commit -m "Descriptive commit message"

# Push to remote (with retry logic)
git push -u origin claude/feature-description-sessionid

# View recent commits
git log --oneline -10

# Check current status
git status
```

### Testing Locally
Since this is static HTML:
1. Open files directly in browser, OR
2. Use simple HTTP server:
   ```bash
   python3 -m http.server 8000
   # Then visit http://localhost:8000
   ```

### Finding Code
```bash
# Find files by name pattern
find . -name "*.html" -type f

# Search for text in files
grep -r "text to find" --include="*.html"

# Count lines in HTML files
find . -name "*.html" -exec wc -l {} +
```

## Resources & References

### External Libraries (CDN)
- **Three.js r128:** `https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js`
- **GSAP 3.12.5:** `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`
- **GoatCounter:** `//gc.zgo.at/count.js`

### Color Reference
Main palette from Yotsuba B theme (Futaba Channel):
- Background: `#f0e0d6` / `#eef2ff`
- Text: `#800000`
- Links: `#34345c`
- Borders: `#d9bfb7`
- Highlights: `#d6bad0`

### Inspiration & Style
- 4chan aesthetics (particularly /b/ and /g/)
- Retro web design (early 2000s)
- Terminal/hacker aesthetic (monospace fonts)
- Self-aware internet humor

## Contact & Contribution

This is a personal project by the repository owner. When working as an AI assistant:
- Follow the conventions in this document
- Preserve the project's personality and humor
- Ask before making major architectural changes
- Test thoroughly before committing
- Keep changes focused and atomic

## Version History

- **2026-01-24** - Initial CLAUDE.md created
  - Documented current state of project
  - Codified conventions and patterns
  - Added comprehensive guide for AI assistants

---

**Remember:** This project celebrates simplicity, personality, and vanilla web development. Keep it fun, keep it simple, and maintain the imageboard aesthetic! 🎮
