# Styling Changes Documentation

## Overview
This document outlines the comprehensive styling changes made to the CommitQ project, including the implementation of custom fonts and a new color scheme.

## Color Scheme
The project now uses a cohesive color palette based on the following primary colors:

### Primary Colors
- **Primary**: `#416c6d` - Main brand color used for headings, buttons, and key UI elements
- **Secondary**: `#9ab5b5` - Supporting color for secondary actions and highlights
- **Accent**: `#d4e0e0` - Light accent color for backgrounds and subtle highlights

### Derived Colors
- **Primary Dark**: `#355758` - Darker variant for hover states
- **Primary Light**: `#5a8384` - Lighter variant for gradients
- **Secondary Dark**: `#7a9595` - Darker secondary for text and borders
- **Secondary Light**: `#bac8c8` - Lighter secondary for backgrounds
- **Accent Dark**: `#bfd0d0` - Darker accent for borders
- **Accent Light**: `#e9f0f0` - Lightest accent for subtle backgrounds

### Semantic Colors
- **Success**: `#4a7c59` - Green variant matching the color scheme
- **Warning**: `#8b7355` - Orange variant in the color palette
- **Error**: `#8b5a5a` - Red variant consistent with the theme
- **Info**: Uses primary color

## Typography
The project now uses custom fonts located in `src/assets/`:

### Font Families
1. **Sao Chingcha** (Primary Font)
   - `sao_chingcha_light.otf` (Weight: 300)
   - `sao_chingcha_regular.otf` (Weight: 400)
   - `sao_chingcha_bold.otf` (Weight: 700)
   - Used for: Body text, form inputs, general UI text

2. **BKK Draft** (Secondary Font)
   - `BKKDraft5 Regular.otf` (Weight: normal)
   - Used for: Headings, titles, emphasis text

### Font Loading
- Fonts are loaded via `@font-face` declarations in `src/styles/globals.css`
- `font-display: swap` is used for optimal loading performance
- Fallback fonts include system fonts for better compatibility

## File Structure Changes

### New Files Created
```
src/
├── styles/
│   └── globals.css              # Global styles with fonts and color scheme
├── components/
│   ├── Header.tsx               # Reusable header component
│   ├── AddQueueForm.tsx         # Queue addition form component
│   └── QueueItem.tsx            # Individual queue item component
```

### Modified Files
- `src/pages/_app.tsx` - Added global CSS import
- `src/pages/index.tsx` - Refactored to use new components and styling
- `next.config.js` - Added webpack configuration for font file handling

## CSS Architecture

### CSS Custom Properties
All colors and fonts are defined as CSS custom properties (variables) in `:root`:
```css
:root {
  --color-primary: #416c6d;
  --color-secondary: #9ab5b5;
  --color-accent: #d4e0e0;
  --font-primary: 'Sao Chingcha', ...;
  --font-secondary: 'BKK Draft', ...;
}
```

### Component Structure
- **Global Styles**: Base typography, form elements, utility classes
- **Component Styles**: Styled-jsx for component-specific styling
- **Responsive Design**: Mobile-first approach with breakpoints at 768px and 480px

## Key Features

### Enhanced UI Components
1. **Header Component**
   - Gradient background using primary colors
   - Real-time connection status indicator
   - Responsive design with mobile optimization

2. **Add Queue Form**
   - Modern card-based design
   - Timer duration presets (30s, 1m, 2m, 5m)
   - Enhanced input styling with focus states

3. **Queue Items**
   - Improved visual hierarchy
   - Timer progress bars with gradient fills
   - Hover effects and animations
   - Status-based styling (first item, currently serving)

### Animation and Interactions
- Fade-in animations for new elements
- Hover effects with subtle transforms
- Smooth transitions for state changes
- Progress bars with animated fills

### Accessibility Features
- High contrast color combinations
- Focus indicators for keyboard navigation
- Semantic HTML structure
- Screen reader friendly text

## Browser Compatibility
- Modern browsers with CSS custom properties support
- Fallback fonts for older browsers
- Progressive enhancement approach

## Performance Considerations
- `font-display: swap` for optimal font loading
- Efficient CSS with minimal specificity
- Component-based architecture for better code splitting
- Optimized color palette with consistent reuse

## Responsive Breakpoints
- **Desktop**: 769px and above
- **Tablet**: 768px and below
- **Mobile**: 480px and below

Each breakpoint includes appropriate typography scaling and layout adjustments.

## Future Enhancements
- Dark mode support using CSS custom properties
- Additional font weights if needed
- Theme customization system
- Animation preferences for accessibility