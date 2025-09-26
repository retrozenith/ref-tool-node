import { PDFService, FormData } from '../pdf-service';
import * as path from 'path';

// Interface to access private static methods for testing
interface PDFServicePrivate {
  formatDate(dateString: string, ageCategory: string): string;
  getTemplatePath(ageCategory: string): string;
  getOverlays(formData: FormData): Array<{ text: string; x: number; y: number; page: number }>;
}

describe('PDFService', () => {
  // Test suite for generateFilename
  describe('generateFilename', () => {
    it('should generate a correctly formatted filename', () => {
      const formData: FormData = {
        referee_name_1: 'John Doe',
        match_date: '2023-10-27',
        starting_hour: '10:00',
        team_1: 'Team A',
        team_2: 'Team B',
        age_category: 'U11',
      };

      const expectedFilename = 'referee_report_U11_TeamA_vs_TeamB_20231027.pdf';
      const actualFilename = PDFService.generateFilename(formData);

      expect(actualFilename).toBe(expectedFilename);
    });

    it('should handle special characters in team names', () => {
      const formData: FormData = {
        referee_name_1: 'John Doe',
        match_date: '2023-10-27',
        starting_hour: '10:00',
        team_1: 'Team A!',
        team_2: 'Team@B',
        age_category: 'U13',
      };

      const expectedFilename = 'referee_report_U13_TeamA_vs_TeamB_20231027.pdf';
      const actualFilename = PDFService.generateFilename(formData);

      expect(actualFilename).toBe(expectedFilename);
    });
  });

  // Test suite for formatDate
  describe('formatDate', () => {
    it('should format date as DD.MM.YYYY for U15', () => {
      const date = '2023-10-27';
      const formattedDate = (PDFService as unknown as PDFServicePrivate).formatDate(date, 'U15');
      expect(formattedDate).toBe('27.10.2023');
    });

    it('should format date as DD     MM for non-U15 categories', () => {
      const date = '2023-05-01';
      const formattedDateU9 = (PDFService as unknown as PDFServicePrivate).formatDate(date, 'U9');
      const formattedDateU11 = (PDFService as unknown as PDFServicePrivate).formatDate(date, 'U11');
      const formattedDateU13 = (PDFService as unknown as PDFServicePrivate).formatDate(date, 'U13');

      expect(formattedDateU9).toBe('01     05');
      expect(formattedDateU11).toBe('01     05');
      expect(formattedDateU13).toBe('01     05');
    });
  });

  // Test suite for getTemplatePath
  describe('getTemplatePath', () => {
    it('should return the correct template path for each age category', () => {
      const basePath = process.cwd();

      const u9Path = (PDFService as unknown as PDFServicePrivate).getTemplatePath('U9');
      expect(u9Path).toBe(path.join(basePath, 'public', 'reports', 'referee_template_u9.pdf'));

      const u11Path = (PDFService as unknown as PDFServicePrivate).getTemplatePath('U11');
      expect(u11Path).toBe(path.join(basePath, 'public', 'reports', 'referee_template_u11.pdf'));

      const u13Path = (PDFService as unknown as PDFServicePrivate).getTemplatePath('U13');
      expect(u13Path).toBe(path.join(basePath, 'public', 'reports', 'referee_template_u13.pdf'));

      const u15Path = (PDFService as unknown as PDFServicePrivate).getTemplatePath('U15');
      expect(u15Path).toBe(path.join(basePath, 'public', 'reports', 'referee_template_u15.pdf'));
    });
  });

  // Test suite for getOverlays
  describe('getOverlays', () => {
    const baseFormData: FormData = {
      referee_name_1: 'John Doe',
      match_date: '2023-10-27',
      starting_hour: '10:00',
      team_1: 'Team A',
      team_2: 'Team B',
      age_category: 'U9', // This will be overridden in each test
    };

    it('should return correct overlays for U9', () => {
      const formData = { ...baseFormData, age_category: 'U9' as const };
      const overlays = (PDFService as unknown as PDFServicePrivate).getOverlays(formData);

      expect(overlays).toHaveLength(5);
      expect(overlays).toEqual(expect.arrayContaining([
        { text: 'John Doe', x: 101, y: 687, page: 0 },
        { text: '27     10', x: 337, y: 686, page: 0 },
        { text: 'Team A - Team B', x: 101, y: 712, page: 0 },
        { text: 'Team A', x: 101, y: 636, page: 0 },
        { text: 'Team B', x: 355, y: 636, page: 0 },
      ]));
    });

    it('should return correct overlays for U11/U13', () => {
      const formData = { ...baseFormData, age_category: 'U11' as const, referee_name_2: 'Jane Smith' };
      const overlays = (PDFService as unknown as PDFServicePrivate).getOverlays(formData);

      expect(overlays).toHaveLength(7);
      expect(overlays).toEqual(expect.arrayContaining([
        { text: 'John Doe', x: 101, y: 687, page: 0 },
        { text: 'Jane Smith', x: 101, y: 662, page: 0 },
        { text: '27     10', x: 346, y: 686, page: 0 },
        { text: '10:00', x: 335, y: 660, page: 0 },
        { text: 'Team A - Team B', x: 101, y: 712, page: 0 },
        { text: 'Team A', x: 101, y: 636, page: 0 },
        { text: 'Team B', x: 355, y: 636, page: 0 },
      ]));
    });

    it('should return correct overlays for U15', () => {
      const formData: FormData = {
        ...baseFormData,
        age_category: 'U15' as const,
        assistant_referee_1: 'AR1',
        assistant_referee_2: 'AR2',
        fourth_official: '4th Off',
        competition: 'Cup',
        stadium_name: 'Main Stadium',
        stadium_locality: 'City',
      };
      const overlays = (PDFService as unknown as PDFServicePrivate).getOverlays(formData);

      expect(overlays).toHaveLength(17); // 13 from data + 4 fixed 'Ilfov'
      expect(overlays).toEqual(expect.arrayContaining([
        { text: 'John Doe', x: 163, y: 353, page: 0 },
        { text: 'AR1', x: 163, y: 338, page: 0 },
        { text: '27.10.2023', x: 390, y: 425, page: 0 },
        { text: 'Ilfov', x: 490, y: 353, page: 0 },
        { text: '27.10.2023', x: 90, y: 78, page: 4 },
        { text: 'Team A', x:150, y: 783, page: 5 },
        { text: 'Team B', x:160, y: 783, page: 6 }
      ]));
    });
  });
});