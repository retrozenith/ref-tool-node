# Referee Report Generator

A professional PDF-powered web application for generating referee reports across different youth football age categories (U9, U11, U13, U15).

## Features

- **Complete PDF Overlay System** using pdf-lib for precise text placement
- **Multi-Age Category Support** with category-specific field requirements
- **Precise Coordinate Mapping** calibrated for official referee templates
- **Professional Font Integration** using Roboto-Medium at 13pt
- **Smart Date Formatting** based on age category requirements
- **Form Validation** with comprehensive error handling
- **Responsive Design** built with Tailwind CSS
- **Type-Safe Development** with TypeScript throughout

## Age Category Support

### U9 (Youth)
- 5 text elements on main page
- Date format: `DD     MM` (with spacing)
- Required: Referee name, date, start time, teams
- Combined team display format

### U11/U13 (Intermediate)
- 7 text elements on main page
- Date format: `DD     MM` (with spacing)
- Required: Two referee names, date, start time, teams
- Enhanced referee crew support

### U15 (Advanced)
- 16 total text elements (13 on main page + 3 multi-page)
- Date format: `DD.MM.YYYY`
- Full referee crew (referee, assistants, fourth official)
- Stadium and competition information
- Multi-page PDF overlays (pages 4, 5, 6)
- Fixed location markers ("Ilfov" text placements)

## Tech Stack

- **Framework**: Next.js 15.5.3 with TypeScript
- **PDF Processing**: pdf-lib with @pdf-lib/fontkit
- **Styling**: Tailwind CSS
- **Font**: Roboto-Medium (included)
- **Validation**: Custom form validation with error handling
- **API**: RESTful Next.js API routes

## Getting Started

### Prerequisites

- Node.js 18+ or compatible runtime
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/retrozenith/ref-tool-node.git
   cd ref-tool-node
   ```

2. **Navigate to server directory**
   ```bash
   cd server
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

4. **Start development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Web Interface

1. **Select Age Category** (U9, U11, U13, or U15)
2. **Fill Required Fields** based on category
3. **Complete Optional Fields** (U15 only)
4. **Generate Report** - PDF downloads automatically
5. **Professional Filename** generated based on match details

### API Usage

**Endpoint:** `POST /api/generate-report`

**Example Request:**
```json
{
  "referee_name_1": "John Doe",
  "match_date": "2025-09-15",
  "starting_hour": "15:00",
  "team_1": "FC Barcelona",
  "team_2": "Real Madrid",
  "age_category": "U9"
}
```

**Response:** PDF file with appropriate headers for download

### Field Requirements by Category

| Field | U9 | U11 | U13 | U15 |
|-------|----|----|----|----|
| Referee Name 1 | ✅ | ✅ | ✅ | ✅ |
| Referee Name 2 | ❌ | ✅ | ✅ | ❌ |
| Assistant Referee 1 | ❌ | ❌ | ❌ | ⭕ |
| Assistant Referee 2 | ❌ | ❌ | ❌ | ⭕ |
| Fourth Official | ❌ | ❌ | ❌ | ⭕ |
| Match Date | ✅ | ✅ | ✅ | ✅ |
| Start Time | ✅ | ✅ | ✅ | ✅ |
| Team 1 | ✅ | ✅ | ✅ | ✅ |
| Team 2 | ✅ | ✅ | ✅ | ✅ |
| Competition | ❌ | ❌ | ❌ | ⭕ |
| Stadium Name | ❌ | ❌ | ❌ | ⭕ |
| Stadium Locality | ❌ | ❌ | ❌ | ⭕ |

✅ = Required, ⭕ = Optional, ❌ = Not applicable

## Project Structure

```
ref-tool-node/
├── server/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate-report/
│   │   │       └── route.ts          # PDF generation API
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # App layout
│   │   └── page.tsx                  # Main form interface
│   ├── lib/
│   │   ├── pdf-service.ts            # Core PDF overlay service
│   │   └── utils.ts                  # Utility functions
│   ├── public/
│   │   ├── fonts/
│   │   │   └── Roboto-Medium.ttf     # Required font
│   │   └── reports/
│   │       ├── referee_template_u9.pdf
│   │       ├── referee_template_u11.pdf
│   │       ├── referee_template_u13.pdf
│   │       └── referee_template_u15.pdf
│   ├── package.json
│   └── README-PDF-OVERLAY.md         # Technical documentation
└── README.md                         # This file
```

## Development

### Building for Production

```bash
pnpm build
pnpm start
```

### Linting

```bash
pnpm lint
```

### Adding New Age Categories

1. Add PDF template to `public/reports/`
2. Create overlay function in `pdf-service.ts`
3. Update validation in API route
4. Add category to form interface

### Customizing Coordinates

See `README-PDF-OVERLAY.md` for detailed coordinate mapping and customization guide.

## PDF Templates

The application expects PDF templates in the following format:
- **Location**: `public/reports/referee_template_{category}.pdf`
- **Categories**: u9, u11, u13, u15
- **Font Compatibility**: Must support Roboto-Medium overlays
- **Coordinate System**: Origin at bottom-left, points as units

## API Reference

### Generate Report

- **URL**: `/api/generate-report`
- **Method**: `POST`
- **Content-Type**: `application/json`

**Success Response:**
- **Code**: 200
- **Content-Type**: `application/pdf`
- **Headers**: Includes `Content-Disposition` with generated filename

**Error Responses:**
- **400**: Validation error with details
- **500**: Server error with error message

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on GitHub or contact the development team.

## Acknowledgments

- pdf-lib library for robust PDF manipulation
- Next.js team for the excellent framework
- Tailwind CSS for utility-first styling
- FontKit for advanced font handling