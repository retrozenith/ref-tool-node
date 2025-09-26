import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export type AgeCategory = 'U9' | 'U11' | 'U13' | 'U15';

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
  age_category: AgeCategory;
  stadium_name?: string;
  stadium_locality?: string;
}

interface TextOverlay {
  text: string;
  x: number;
  y: number;
  page: number;
}

const FONT_SIZE = 13;
const FONT_COLOR = rgb(0, 0, 0);

export async function generateReportClient(formData: FormData): Promise<{ blob: Blob; filename: string }> {
  const templatePath = getTemplatePath(formData.age_category);
  const fromCacheFirst = async (url: string): Promise<ArrayBuffer> => {
    // Try Cache Storage first (service worker), then network
    try {
      const cache = await caches.open('reports-cache');
      const cached = await cache.match(url);
      if (cached) return await cached.arrayBuffer();
    } catch { /* ignore */ }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    return await res.arrayBuffer();
  };
  const [templateBytes, fontBytes] = await Promise.all([
    fromCacheFirst(templatePath),
    fromCacheFirst('/fonts/Roboto-Medium.ttf'),
  ]);

  const pdfDoc = await PDFDocument.load(templateBytes);
  // Register fontkit to embed custom TrueType fonts in the browser
  pdfDoc.registerFontkit(fontkit);
  const customFont = await pdfDoc.embedFont(fontBytes);

  const overlays = getOverlays(formData);
  const grouped = groupOverlaysByPage(overlays);

  for (const [pageIndex, pageOverlays] of grouped.entries()) {
    if (pageIndex >= pdfDoc.getPageCount()) continue;
    const page = pdfDoc.getPage(pageIndex);
    for (const overlay of pageOverlays) {
      if (!overlay.text.trim()) continue;
      page.drawText(overlay.text, {
        x: overlay.x,
        y: overlay.y,
        size: FONT_SIZE,
        font: customFont,
        color: FONT_COLOR,
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  // Copy into a new ArrayBuffer for strict typing and compatibility
  const u8 = new Uint8Array(pdfBytes);
  const ab = new ArrayBuffer(u8.byteLength);
  new Uint8Array(ab).set(u8);
  const filename = generateFilename(formData);
  return { blob: new Blob([ab], { type: 'application/pdf' }), filename };
}

function getTemplatePath(age: string): string {
  const filename = `referee_template_${age.toLowerCase()}.pdf`;
  return `/reports/${filename}`;
}

function getOverlays(formData: FormData): TextOverlay[] {
  switch (formData.age_category) {
    case 'U9':
      return [
        { text: formData.referee_name_1, x: 101, y: 687, page: 0 },
        { text: formatDate(formData.match_date, 'U9'), x: 337, y: 686, page: 0 },
        { text: `${formData.team_1} - ${formData.team_2}`, x: 101, y: 712, page: 0 },
        { text: formData.team_1, x: 101, y: 636, page: 0 },
        { text: formData.team_2, x: 355, y: 636, page: 0 }
      ];
    case 'U11':
    case 'U13':
      return [
        { text: formData.referee_name_1, x: 101, y: 687, page: 0 },
        { text: formData.referee_name_2 || '', x: 101, y: 662, page: 0 },
        { text: formatDate(formData.match_date, formData.age_category), x: 346, y: 686, page: 0 },
        { text: formData.starting_hour, x: 335, y: 660, page: 0 },
        { text: `${formData.team_1} - ${formData.team_2}`, x: 101, y: 712, page: 0 },
        { text: formData.team_1, x: 101, y: 636, page: 0 },
        { text: formData.team_2, x: 355, y: 636, page: 0 },
      ];
    case 'U15': {
      const arr: TextOverlay[] = [
        { text: formData.referee_name_1, x: 163, y: 353, page: 0 },
        { text: formData.assistant_referee_1 || '', x: 163, y: 338, page: 0 },
        { text: formData.assistant_referee_2 || '', x: 163, y: 321, page: 0 },
        { text: formData.fourth_official || '', x: 163, y: 305, page: 0 },
        { text: formatDate(formData.match_date, 'U15'), x: 390, y: 425, page: 0 },
        { text: formData.starting_hour, x: 510, y: 425, page: 0 },
        { text: `${formData.team_1} - ${formData.team_2}`, x: 110, y: 515, page: 0 },
        { text: formData.competition || '', x: 110, y: 453, page: 0 },
        { text: formData.stadium_name || '', x: 150, y: 399, page: 0 },
        { text: formData.stadium_locality || '', x: 163, y: 426, page: 0 },
        { text: formatDate(formData.match_date , 'U15'), x: 90, y: 78, page: 4 },
        { text: formData.team_1, x:150, y: 783, page: 5 },
        { text: formData.team_2, x:160, y: 783, page: 6 }
      ];
      arr.push(
        { text: 'Ilfov', x: 490, y: 353, page: 0 },
        { text: 'Ilfov', x: 490, y: 337, page: 0 },
        { text: 'Ilfov', x: 490, y: 322, page: 0 },
        { text: 'Ilfov', x: 490, y: 305, page: 0 }
      );
      return arr;
    }
  }
}

function formatDate(dateString: string, age: string): string {
  const date = new Date(dateString);
  if (age === 'U15') {
    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${day}     ${month}`;
}

function groupOverlaysByPage(overlays: TextOverlay[]): Map<number, TextOverlay[]> {
  const grouped = new Map<number, TextOverlay[]>();
  for (const o of overlays) {
    if (!grouped.has(o.page)) grouped.set(o.page, []);
    grouped.get(o.page)!.push(o);
  }
  return grouped;
}

function generateFilename(formData: FormData): string {
  const dateStr = formData.match_date.replace(/[-\/]/g, '');
  const team1Clean = formData.team_1.replace(/[^a-zA-Z0-9]/g, '');
  const team2Clean = formData.team_2.replace(/[^a-zA-Z0-9]/g, '');
  return `referee_report_${formData.age_category}_${team1Clean}_vs_${team2Clean}_${dateStr}.pdf`;
}
