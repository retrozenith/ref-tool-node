# PDF Overlay System Documentation

This document describes the PDF overlay system that adds text to referee report templates using pdf-lib.

## Overview

The system uses pdf-lib to overlay text onto PDF templates for different age categories (U9, U11, U13, U15). Each age category has specific fields and coordinate mappings.

## Architecture

### Core Components

1. **PDFService** (`lib/pdf-service.ts`) - Main service for PDF generation
2. **API Route** (`app/api/generate-report/route.ts`) - Next.js API endpoint
3. **PDF Templates** (`public/reports/`) - Template files for each age category
4. **Font** (`public/fonts/Roboto-Medium.ttf`) - Required font for text overlays

## Age Category Rules

### U9 (Simplest)
- **Fields**: 5 text elements on Page 0
- **Date Format**: DD     MM (with spacing)
- **Required Fields**: referee_name_1, match_date, starting_hour, team_1, team_2
- **Special Features**: Combined team display as "team_1 - team_2"

### U11/U13 (Medium complexity)
- **Fields**: 7 text elements on Page 0
- **Date Format**: DD     MM (with spacing)
- **Required Fields**: referee_name_1, referee_name_2, match_date, starting_hour, team_1, team_2
- **Special Features**: Second referee name, combined team display as "team_1 - team_2"

### U15 (Most complex)
- **Fields**: 16 text elements total (13 on Page 0, 3 on other pages)
- **Date Format**: DD.MM.YYYY
- **Required Fields**: referee_name_1, match_date, starting_hour, team_1, team_2
- **Optional Fields**: assistant_referee_1, assistant_referee_2, fourth_official, competition, stadium_name, stadium_locality
- **Special Features**: 
  - Full referee crew section
  - Combined team display as "team_1 - team_2"
  - Multi-page overlays (pages 4, 5, 6)
  - 4 fixed "Ilfov" location texts at specific coordinates

## Key Implementation Details

### Date Formatting
The system now implements precise date formatting:
- **U9, U11, U13**: `DD     MM` format with 5 spaces between day and month
- **U15**: `DD.MM.YYYY` format with dots as separators

### Team Display Format  
All age categories now use a combined team display format:
- Format: `"team_1 - team_2"` (e.g., "FC Barcelona - Real Madrid")
- This appears in addition to individual team placements

### Multi-Page PDF Support
The U15 category implements the full multi-page overlay specification:
- **Page 0**: Main referee and match information (13 elements + 4 "Ilfov" texts)
- **Page 4**: Date only at precise coordinates (90, 78)  
- **Page 5**: Team 1 only at (150, 783)
- **Page 6**: Team 2 only at (160, 783)

### Coordinate Precision
All coordinates have been calibrated to work with the actual PDF templates:
- Origin point: Bottom-left (0,0)
- Units: Points (1/72 inch)
- Page dimensions: US Letter (612 x 792 points)
- Font: Roboto-Medium at 13pt

### Current Overlay Coordinates

The coordinates have been calibrated to work with the actual PDF template layouts:

#### U9 Coordinates (5 elements)
```typescript
{ text: referee_name_1, x: 101, y: 687, page: 0 }
{ text: formatted_date, x: 337, y: 686, page: 0 }
{ text: "team_1 - team_2", x: 101, y: 712, page: 0 }
{ text: team_1, x: 101, y: 636, page: 0 }
{ text: team_2, x: 355, y: 636, page: 0 }
```

#### U11/U13 Coordinates (7 elements)
```typescript
{ text: referee_name_1, x: 101, y: 687, page: 0 }
{ text: referee_name_2, x: 101, y: 662, page: 0 }
{ text: formatted_date, x: 346, y: 686, page: 0 }
{ text: starting_hour, x: 335, y: 660, page: 0 }
{ text: "team_1 - team_2", x: 101, y: 712, page: 0 }
{ text: team_1, x: 355, y: 636, page: 0 }
{ text: team_2, x: 101, y: 636, page: 0 }
```

#### U15 Coordinates (16 elements total)
```typescript
// Referee crew section
{ text: referee_name_1, x: 163, y: 353, page: 0 }
{ text: assistant_referee_1, x: 163, y: 338, page: 0 }
{ text: assistant_referee_2, x: 163, y: 321, page: 0 }
{ text: fourth_official, x: 163, y: 305, page: 0 }

// Match details section  
{ text: formatted_date, x: 390, y: 425, page: 0 }
{ text: starting_hour, x: 510, y: 425, page: 0 }
{ text: "team_1 - team_2", x: 110, y: 515, page: 0 }
{ text: competition, x: 110, y: 453, page: 0 }
{ text: stadium_name, x: 150, y: 399, page: 0 }
{ text: stadium_locality, x: 163, y: 426, page: 0 }

// Multi-page overlays
{ text: formatted_date, x: 90, y: 78, page: 4 }
{ text: team_1, x: 150, y: 783, page: 5 }
{ text: team_2, x: 160, y: 783, page: 6 }

// Fixed "Ilfov" location texts (4 elements)
{ text: "Ilfov", x: 490, y: 353, page: 0 }
{ text: "Ilfov", x: 490, y: 337, page: 0 }
{ text: "Ilfov", x: 490, y: 322, page: 0 }
{ text: "Ilfov", x: 490, y: 305, page: 0 }
```

## API Usage

### Endpoint
`POST /api/generate-report`

### Request Body
```json
{
  "referee_name_1": "string (required)",
  "referee_name_2": "string (required for U11/U13)",
  "match_date": "YYYY-MM-DD (required)",
  "starting_hour": "HH:MM (required)",
  "team_1": "string (required)",
  "team_2": "string (required)",
  "age_category": "U9|U11|U13|U15 (required)",
  "competition": "string (optional, U15 only)",
  "assistant_referee_1": "string (optional, U15 only)",
  "assistant_referee_2": "string (optional, U15 only)",
  "fourth_official": "string (optional, U15 only)",
  "stadium_name": "string (optional, U15 only)",
  "stadium_locality": "string (optional, U15 only)"
}
```

### Response
- **Success (200)**: PDF file download with appropriate filename
- **Error (400)**: Validation error with details
- **Error (500)**: Server error with error message

### Example Usage
```bash
curl -X POST http://localhost:3000/api/generate-report \
  -H "Content-Type: application/json" \
  -d '{
    "referee_name_1": "John Doe",
    "match_date": "2025-09-15",
    "starting_hour": "15:00",
    "team_1": "Team A",
    "team_2": "Team B", 
    "age_category": "U9"
  }' \
  --output referee_report.pdf
```

## Customization

### Adjusting Coordinates
The coordinates are now precisely calibrated for the actual PDF templates. If you need to make adjustments:

1. **For fine-tuning existing positions**:
   - Modify the x/y values in the overlay methods
   - Test with small increments (±5-10 points typically)
   
2. **For major layout changes**:
   - Use a PDF viewer to identify target coordinates
   - Remember: origin (0,0) is at bottom-left
   - Y-axis increases upward, X-axis increases rightward

3. **Current coordinate ranges in use**:
   - **X coordinates**: 90-510 (within page width of 612)
   - **Y coordinates**: 78-783 (within page height of 792)

Example coordinate adjustment:
```typescript
// Move text 10 points right and 5 points up
{ text: "Sample", x: 101 + 10, y: 687 + 5, page: 0 }
```

### Adding Multi-Page Support
The U15 category now includes multi-page overlays as specified in the original requirements:
```typescript
// These are already implemented in U15:
{ text: formatted_date, x: 90, y: 78, page: 4 }    // Page 4: Date only
{ text: team_1, x: 150, y: 783, page: 5 }          // Page 5: Team 1 only  
{ text: team_2, x: 160, y: 783, page: 6 }          // Page 6: Team 2 only
```

For other age categories, you can add similar multi-page overlays by uncommenting and adjusting the coordinates in the `getOverlays()` method.

### Font Changes
To use a different font:
1. Add the font file to `public/fonts/`
2. Update the font path in `applyOverlays()`
3. Optionally adjust `FONT_SIZE` constant

### Validation Rules
Custom validation can be added in the `validateFormData()` function in the API route.

## Troubleshooting

### Common Issues
1. **Page Index Error**: Ensure page numbers in overlays don't exceed PDF page count
2. **Font Loading Error**: Verify font file exists at specified path
3. **Missing Template**: Ensure PDF template exists for the age category
4. **Text Not Visible**: Check coordinates are within page boundaries (0-612 width, 0-792 height)

### Debugging
Enable debug logging by adding console.log statements in the `applyOverlays()` method to see:
- Number of pages in PDF
- Text being added and coordinates
- Any skipped pages

## File Structure
```
server/
├── app/
│   └── api/
│       └── generate-report/
│           └── route.ts          # API endpoint
├── lib/
│   └── pdf-service.ts           # Main PDF service
├── public/
│   ├── fonts/
│   │   └── Roboto-Medium.ttf    # Required font
│   └── reports/
│       ├── referee_template_u9.pdf
│       ├── referee_template_u11.pdf
│       ├── referee_template_u13.pdf
│       └── referee_template_u15.pdf
└── package.json                 # Contains pdf-lib dependency
```