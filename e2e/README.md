# CommitQ E2E Tests

This directory contains end-to-end tests for the CommitQ application using Playwright.

## Test Setup

The tests use Playwright with the following configuration:
- **Browsers**: Chromium, Firefox, and WebKit
- **Base URL**: http://localhost:3000
- **Reporter**: HTML (configurable)
- **Parallel execution**: Enabled for faster test runs

## Running Tests

### All E2E Tests
```bash
npm run test:e2e
```

### Team Selector Tests Only
```bash
npm run test:team-selector
```

### With UI Mode (Interactive)
```bash
npm run test:e2e:ui
npm run test:team-selector:ui
```

### Debug Mode
```bash
npm run test:e2e:debug
```

## Test Coverage

### Team Selection Functionality (`team-selector.spec.ts`)

This comprehensive test suite covers all aspects of the team selection functionality:

#### ✅ Basic Functionality
- **Team selector dropdown visibility**: Verifies dropdown is visible and clickable
- **Dropdown open/close behavior**: Tests clicking to open/close and backdrop clicking
- **Team switching**: Tests switching between "bma-training" and "caffeine" teams

#### ✅ Data Persistence
- **localStorage persistence**: Verifies selected team persists across page refreshes
- **Custom event triggering**: Tests that team changes emit proper custom events

#### ✅ UI Updates
- **Queue page title updates**: Verifies queue titles update when switching teams
- **Action items page title updates**: Verifies action items section titles update
- **Team-specific content display**: Tests that UI shows correct team context

#### ✅ Data Isolation
- **Queue data isolation**: Tests that queue items are separate between teams
- **Action items data isolation**: Verifies action items are team-specific
- **Independent team states**: Confirms teams maintain separate data states

#### ✅ Accessibility
- **ARIA attributes**: Verifies proper aria-expanded, aria-haspopup, and role attributes
- **Screen reader support**: Tests proper labeling for assistive technologies

#### ✅ User Experience
- **Keyboard navigation**: Tests current keyboard interaction patterns
- **Mobile responsiveness**: Verifies functionality on mobile viewports (375x667)
- **Visual feedback**: Tests hover states, selection indicators, and animations

#### ✅ Error Scenarios
- **Click outside to close**: Tests that dropdown closes when clicking elsewhere
- **State consistency**: Verifies UI remains consistent during team switches

### Basic Application Tests (`example.spec.ts`)

Simple smoke tests to verify basic application functionality:
- **Homepage loading**: Verifies main application components load correctly
- **Action items page loading**: Tests action items page renders properly
- **Page navigation**: Basic navigation between pages

## Test Implementation Notes

### Data State Handling
The tests are designed to work with the application's existing data state:
- Queue tests work with existing queue items
- Action items tests verify team separation using existing data
- Tests don't assume empty state, making them robust for real-world usage

### Team Switching Logic
Tests verify the complete team switching flow:
1. UI updates (dropdown selection, page titles)
2. Data persistence (localStorage)
3. Event emission (custom events)
4. Data isolation (separate team data)

### Browser Coverage
All tests run across three browsers:
- **Chromium**: Primary development browser
- **Firefox**: Alternative rendering engine testing
- **WebKit**: Safari compatibility testing

## Debugging Failed Tests

### Screenshot Capture
Failed tests automatically capture screenshots saved to `test-results/`

### Debug Mode
Use debug mode for step-by-step test execution:
```bash
npm run test:e2e:debug
```

### Viewing Test Reports
HTML reports are generated after test runs:
```bash
npx playwright show-report
```

## Test Quality Features

### Comprehensive Error Detection
- **Timing issues**: Proper waits for UI updates
- **Element visibility**: Robust element selection and state verification
- **Cross-browser consistency**: Tests pass across all supported browsers

### Maintainable Test Structure
- **Page Object Model**: Tests use locators for maintainable element selection
- **Descriptive naming**: Clear test names describing exactly what's being tested
- **Modular design**: Tests can be run individually or as a suite

### Performance Optimized
- **Parallel execution**: Tests run in parallel for faster feedback
- **Efficient selectors**: Uses efficient CSS selectors for reliable element finding
- **Minimal timeouts**: Only uses waits where necessary for stability

This test suite provides comprehensive coverage of the team selection functionality and serves as a regression safety net for future development.