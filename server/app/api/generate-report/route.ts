import { NextRequest, NextResponse } from 'next/server';
import { PDFService, FormData } from '@/lib/pdf-service';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const formData: FormData = await request.json();
    
    // Validate required fields
    const validationError = validateFormData(formData);
    if (validationError) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationError },
        { status: 400 }
      );
    }
    
    // Generate the PDF
    const pdfBuffer = await PDFService.generateReport(formData);
    const filename = PDFService.generateFilename(formData);
    
    // Return the PDF as a response
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Validate form data based on age category requirements
 */
function validateFormData(formData: FormData): string | null {
  const required = ['referee_name_1', 'match_date', 'starting_hour', 'team_1', 'team_2', 'age_category'];
  
  // Check basic required fields
  for (const field of required) {
    if (!formData[field as keyof FormData] || formData[field as keyof FormData]?.toString().trim() === '') {
      return `Missing required field: ${field}`;
    }
  }
  
  // Validate age category
  if (!['U9', 'U11', 'U13', 'U15'].includes(formData.age_category)) {
    return 'Invalid age category. Must be U9, U11, U13, or U15';
  }
  
  // Age-specific validation
  if ((formData.age_category === 'U11' || formData.age_category === 'U13') && 
      (!formData.referee_name_2 || formData.referee_name_2.trim() === '')) {
    return 'referee_name_2 is required for U11 and U13 categories';
  }
  
  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(formData.match_date)) {
    return 'match_date must be in YYYY-MM-DD format';
  }
  
  // Validate time format
  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(formData.starting_hour)) {
    return 'starting_hour must be in HH:MM format';
  }
  
  return null;
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'PDF Generator API',
      endpoint: 'POST /api/generate-report',
      supported_categories: ['U9', 'U11', 'U13', 'U15']
    }
  );
}