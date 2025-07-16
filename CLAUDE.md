# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Korean ladder game (사다리타기) web application - a fun random selection game that helps users make decisions by connecting participants to random results through a ladder structure. The app is built as a static single-page application with vanilla JavaScript and includes Google AdSense integration.

## Development Commands

```bash
# Testing
npm test                    # Run Playwright tests
npm run test:headed         # Run tests with browser UI
npm run test:ui            # Run tests with Playwright UI

# Building
npm run build              # Build optimized production version to dist/
npm run build:clean        # Clean dist directory and rebuild
npm run build:test         # Build and test the deployment

# Development Server
npm run serve:dev          # Serve development files on port 8080
npm run serve              # Serve built files from dist/ on port 8080

# Deployment Testing
npm run deploy:test        # Test deployment configuration
```

## Architecture Overview

### Core Structure
- **Static SPA**: Single HTML file with modular JavaScript and CSS
- **No Framework**: Pure vanilla JavaScript with class-based architecture
- **Modular Design**: Separate modules for game logic, UI components, storage, and error handling

### Key JavaScript Modules
- `app.js`: Main application controller with Google Ads integration
- `ladder-game.js`: Core game logic and state management  
- `ui-components.js`: Reusable UI components (SlotInput, LadderRenderer)
- `storage.js`: StorageManager for localStorage operations
- `error-handler.js`: Browser compatibility and error handling
- `saved-games-manager.js`: Saved games functionality

### CSS Architecture
- `main.css`: Base styles and layout
- `responsive.css`: Mobile-first responsive design
- `ladder.css`: Game-specific styling with animations

## Key Features & Game Flow

### 1. Game Setup
- User inputs participant count (2-20) with validation
- Dynamic slot generation for top and bottom positions
- Error handling for invalid inputs

### 2. Slot Input System
- Highlighted current slot with Enter key progression
- Click-to-edit functionality for filled slots
- Navigation buttons for previous/next slot movement
- Visual feedback for slot states (empty, filled, active)

### 3. Ladder Generation & Results
- Random connection algorithm between top and bottom slots
- Canvas-based animated ladder drawing
- Individual path revelation on top slot click
- "한번에 열기" button for all connections

### 4. Save/Load System
- localStorage-based game configuration storage
- Saved games list with load/delete options
- Randomize feature for new connections with same slots

### 5. Google AdSense Integration
- Responsive ad containers (header, sidebar, footer)
- Asynchronous loading to prevent game performance impact
- Mobile-optimized ad placement strategy

## Kiro Specifications

This project follows specifications in `.kiro/specs/ladder-game/`:

### Requirements (requirements.md)
- **Requirement 1**: Responsive design with collapsible menu
- **Requirement 2**: Customizable slot count (2-20)
- **Requirement 3**: Easy slot input with highlighting
- **Requirement 4**: Slot navigation and editing
- **Requirement 5**: Visual ladder results with animations
- **Requirement 6**: Save/load configurations
- **Requirement 7**: Static deployment without backend
- **Requirement 8**: Attractive and intuitive design

### Implementation Status (tasks.md)
Most tasks are completed (✓) including:
- Project structure and responsive layout
- Collapsible menu system
- Slot input system with navigation
- Ladder generation and rendering
- Result revelation system
- localStorage save/load functionality
- Google Ads integration
- Error handling and deployment setup

### Design Architecture (design.md)
- **Frontend**: HTML/CSS/JS with modular class structure
- **Components**: App, LadderGame, StorageManager, SlotInput, LadderRenderer
- **Data Models**: Game configuration, ladder connections, UI state
- **Responsive**: Mobile-first with breakpoints at 768px, 1024px, 1440px
- **Performance**: Code splitting, asset optimization, caching strategy

## Testing

Uses Playwright for end-to-end testing:
- Tests in `tests/` directory focusing on slot input system
- Configuration in `playwright.config.js`
- Test scenarios cover game flow, UI interactions, and error handling

## Build & Deployment

- **Build System**: Node.js script (`deploy/build.js`) with Terser and CleanCSS
- **Static Deployment**: Nginx configuration for file serving and caching
- **Optimization**: Minification, compression, and CDN-ready structure
- **No Backend**: Fully client-side application

## Error Handling

- Input validation with user-friendly messages
- localStorage quota exceeded scenarios
- Browser compatibility checks with graceful degradation
- Canvas fallback for unsupported environments