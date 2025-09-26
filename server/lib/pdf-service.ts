import { PDFDocument, rgb } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import fontkit from '@pdf-lib/fontkit';

export interface FormData {
  referee_name_1: string;
  referee_name_2?: string;
  match_date: string;
  starting_hour: string;
  team_1: string;
  team_2: string;
  competition?: string;
  assistant_referee_1?: string;
  assistant_referee_2?: string;
  fourth_official?: string;
  age_category: 'U9' | 'U11' | 'U13' | 'U15';
  stadium_name?: string;
  stadium_locality?: string;
}

interface TextOverlay {
  text: string;
  x: number;
  y: number;
  page: number;
}

export class PDFService {
  private static readonly FONT_SIZE = 13;
  private static readonly FONT_COLOR = rgb(0, 0, 0);

  /**
   * Generate a PDF report with text overlays based on age category
   */
  static async generateReport(formData: FormData): Promise<Buffer> {
    const templatePath = this.getTemplatePath(formData.age_category);
    const overlays = this.getOverlays(formData);
    
    return await this.applyOverlays(templatePath, overlays);
  }

  /**
   * Get the template file path for the specified age category
   */
  private static getTemplatePath(ageCategory: string): string {
    const filename = `referee_template_${ageCategory.toLowerCase()}.pdf`;
    return path.join(process.cwd(), 'public', 'reports', filename);
  }

  /**
   * Generate text overlays based on form data and age category
   */
  private static getOverlays(formData: FormData): TextOverlay[] {
    const overlays: TextOverlay[] = [];
    
    // For now, let's focus on Page 0 overlays only until we understand the PDF structure
    // Page-based overlays will be added once we confirm the PDF has multiple pages
    
    // Age-specific overlays for Page 0
    switch (formData.age_category) {
      case 'U9':
        overlays.push(...this.getU9Overlays(formData));
        break;
      case 'U11':
      case 'U13':
        overlays.push(...this.getU11U13Overlays(formData));
        break;
      case 'U15':
        overlays.push(...this.getU15Overlays(formData));
        break;
    }

    return overlays;
  }

  /**
   * Get U9 specific overlays (5 text elements on Page 0)
   */
  private static getU9Overlays(formData: FormData): TextOverlay[] {
    return [
      { text: formData.referee_name_1, x: 101, y: 687, page: 0 },
      { text: this.formatDate(formData.match_date, 'U9'), x: 337, y: 686, page: 0 },
      { text: formData.team_1 + " - " + formData.team_2, x: 101, y: 712, page: 0 },
      { text: formData.team_1, x: 101, y: 636, page: 0 },
      { text: formData.team_2, x: 355, y: 636, page: 0 }
    ];
  }

  /**
   * Get U11/U13 specific overlays (7 text elements on Page 0)
   */
  private static getU11U13Overlays(formData: FormData): TextOverlay[] {
    return [
      { text: formData.referee_name_1, x: 101, y: 687, page: 0 },
      { text: formData.referee_name_2 || '', x: 101, y: 662, page: 0 },
      { text: this.formatDate(formData.match_date, formData.age_category), x: 346, y: 686, page: 0 },
      { text: formData.starting_hour, x: 335, y: 660, page: 0 },
      { text: formData.team_1 + " - " + formData.team_2, x: 101, y: 712, page: 0 },
      { text: formData.team_1, x: 101, y: 636, page: 0 },
      { text: formData.team_2, x: 355, y: 636, page: 0 },
    ];
  }

  /**
   * Get U15 specific overlays (12 text elements on Page 0)
   */
  private static getU15Overlays(formData: FormData): TextOverlay[] {
    const overlays: TextOverlay[] = [
      { text: formData.referee_name_1, x: 163, y: 353, page: 0 },
      { text: formData.assistant_referee_1 || '', x: 163, y: 338, page: 0 },
      { text: formData.assistant_referee_2 || '', x: 163, y: 321, page: 0 },
      { text: formData.fourth_official || '', x: 163, y: 305, page: 0 },
      { text: this.formatDate(formData.match_date, 'U15'), x: 390, y: 425, page: 0 },
      { text: formData.starting_hour, x: 510, y: 425, page: 0 },
      { text: formData.team_1 + " - " + formData.team_2, x: 110, y: 515, page: 0 },
      { text: formData.competition || '', x: 110, y: 453, page: 0 },
      { text: formData.stadium_name || '', x: 150, y: 399, page: 0 },
      { text: formData.stadium_locality || '', x: 163, y: 426, page: 0 },
      { text: this.formatDate(formData.match_date , 'U15'), x: 90, y: 78, page: 4 },
      { text: formData.team_1, x:150, y: 783, page: 5 },
      { text: formData.team_2, x:160, y: 783, page: 6 }
    ];

    // Add 4 fixed "Ilfov" location texts for U15
    overlays.push(
      { text: 'Ilfov', x: 490, y: 353, page: 0 },
      { text: 'Ilfov', x: 490, y: 337, page: 0 },
      { text: 'Ilfov', x: 490, y: 322, page: 0 },
      { text: 'Ilfov', x: 490, y: 305, page: 0 }
    );

    return overlays;
  }

  /**
   * Format date based on age category requirements
   */
  private static formatDate(dateString: string, ageCategory: string): string {
    const date = new Date(dateString);
    
    if (ageCategory === 'U15') {
      // DD.MM.YYYY format for U15
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } else {
      // DD MM format for U9, U11, U13
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}     ${month}`;
    }
  }

  /**
   * Apply text overlays to the PDF template
   */
  private static async applyOverlays(templatePath: string, overlays: TextOverlay[]): Promise<Buffer> {
    // Read the template PDF
    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    // Register fontkit for custom font support
    pdfDoc.registerFontkit(fontkit);
    
    // Load the Roboto-Medium font
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Medium.ttf');
    const fontBytes = fs.readFileSync(fontPath);
    const customFont = await pdfDoc.embedFont(fontBytes);
    
    // Group overlays by page for efficient processing
    const overlaysByPage = this.groupOverlaysByPage(overlays);
    
    // Apply overlays to each page, but only if the page exists
    for (const [pageIndex, pageOverlays] of overlaysByPage.entries()) {
      if (pageIndex >= pdfDoc.getPageCount()) {
        console.warn(`Skipping page ${pageIndex} - PDF only has ${pdfDoc.getPageCount()} pages`);
        continue;
      }
      
      const page = pdfDoc.getPage(pageIndex);
      
      for (const overlay of pageOverlays) {
        if (overlay.text.trim()) { // Only add non-empty text
          page.drawText(overlay.text, {
            x: overlay.x,
            y: overlay.y,
            size: this.FONT_SIZE,
            font: customFont,
            color: this.FONT_COLOR,
          });
        }
      }
    }
    
    // Return the modified PDF as a buffer
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Group overlays by page number for efficient processing
   */
  private static groupOverlaysByPage(overlays: TextOverlay[]): Map<number, TextOverlay[]> {
    const grouped = new Map<number, TextOverlay[]>();
    
    for (const overlay of overlays) {
      if (!grouped.has(overlay.page)) {
        grouped.set(overlay.page, []);
      }
      grouped.get(overlay.page)!.push(overlay);
    }
    
    return grouped;
  }

  /**
   * Generate filename for the PDF based on form data
   */
  static generateFilename(formData: FormData): string {
    const dateStr = formData.match_date.replace(/[-\/]/g, '');
    const team1Clean = formData.team_1.replace(/[^a-zA-Z0-9]/g, '');
    const team2Clean = formData.team_2.replace(/[^a-zA-Z0-9]/g, '');
    
    return `referee_report_${formData.age_category}_${team1Clean}_vs_${team2Clean}_${dateStr}.pdf`;
  }
}