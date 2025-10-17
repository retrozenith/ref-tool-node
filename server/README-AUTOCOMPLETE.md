# Team Autocomplete Feature

## Overview
This feature provides an intelligent autocomplete dropdown for team name selection in the referee report generator.

## Files Created

### 1. `lib/teams-data.ts`
Contains the official list of AJF Ilfov teams and a filtering function.

**Features:**
- Complete list of 90+ teams from AJF Ilfov
- Organized by team prefix (A.S., ACS, CS, FC, etc.)
- Case-insensitive search/filtering
- Easy to maintain and update

**Usage:**
```typescript
import { TEAMS_LIST, filterTeams } from '@/lib/teams-data';

// Get all teams
const allTeams = TEAMS_LIST;

// Filter teams by query
const filtered = filterTeams('VOLUNTARI'); // Returns FC VOLUNTARI, FC VOLUNTARI 2, etc.
```

### 2. `app/components/TeamAutocomplete.tsx`
Reusable autocomplete input component for team selection.

**Features:**
- Real-time search and filtering
- Keyboard navigation (Arrow Up/Down, Enter, Escape)
- Auto-scroll to highlighted items
- Mobile-friendly
- Dark mode compatible
- Supports custom team names (not limited to the list)
- Shows helpful message when no matches found

**Props:**
- `id`: Input element ID
- `name`: Input field name for form handling
- `value`: Current input value
- `onChange`: Change handler
- `required`: Whether the field is required
- `placeholder`: Placeholder text
- `label`: Field label text

## How It Works

1. **Type to Search**: As you type, the dropdown filters teams matching your input
2. **Keyboard Navigation**: Use arrow keys to navigate suggestions, Enter to select
3. **Click to Select**: Click on any suggestion to auto-fill the field
4. **Custom Names**: You can still type custom team names not in the list
5. **Responsive**: Shows up to 10 suggestions at a time with smooth scrolling

## User Experience

- **Instant Feedback**: Suggestions appear immediately as you type
- **Forgiving Search**: Case-insensitive matching works with partial names
- **Visual Feedback**: Highlighted selection shows clearly
- **Accessible**: Full keyboard support for users who prefer keyboard navigation
- **Non-Intrusive**: Dropdown closes automatically when you click outside

## Maintenance

To add or update teams:

1. Open `server/lib/teams-data.ts`
2. Add the team name to the `TEAMS_LIST` array in ALL CAPS
3. Keep teams organized by prefix for easy maintenance
4. Alphabetically sort new entries within their section

## Example Updates

```typescript
// Adding a new team
export const TEAMS_LIST: string[] = [
  // ... existing teams ...
  "ACS NEW TEAM NAME",
  // ... rest of teams ...
];
```

## Styling

The component uses Tailwind CSS classes that respect the theme context:
- Adapts to light/dark mode automatically
- Uses theme colors (primary, border, muted, etc.)
- Responsive design works on all screen sizes
- Smooth transitions for better UX

## Testing

Test the autocomplete by:
1. Typing partial team names (e.g., "VOLUNT" should show FC VOLUNTARI teams)
2. Using arrow keys to navigate
3. Pressing Enter or clicking to select
4. Testing with team names not in the list
5. Verifying it works in both light and dark modes
