import { google } from 'googleapis';

const jsonResponse = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
});

const textValue = (value) => typeof value === 'string' ? value.trim() : '';

export default async (request) => {
  if (request.method !== 'POST') {
    return jsonResponse(405, { ok: false, error: 'Method not allowed' });
  }

  let submission;
  try {
    submission = await request.json();
  } catch {
    return jsonResponse(400, { ok: false, error: 'Invalid JSON' });
  }

  if (!submission || typeof submission !== 'object' || Array.isArray(submission)) {
    return jsonResponse(400, { ok: false, error: 'Invalid RSVP data' });
  }

  const name = textValue(submission.name);
  const attendance = textValue(submission.attendance);
  const guestCount = Number(submission.guestCount);
  const phone = textValue(submission.phone);
  const message = textValue(submission.message);

  if (
    !name || name.length > 150 ||
    !['joyfully-accepts', 'regretfully-declines'].includes(attendance) ||
    !Number.isInteger(guestCount) || guestCount < 1 || guestCount > 6 ||
    !phone || phone.length > 40 ||
    message.length > 2000
  ) {
    return jsonResponse(400, { ok: false, error: 'Please check the RSVP fields' });
  }

  const spreadsheetId = process.env.RSVP_SHEET_ID;
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!spreadsheetId || !serviceAccountJson) {
    console.error('RSVP storage is missing its Netlify environment configuration');
    return jsonResponse(503, { ok: false, error: 'RSVP storage is not configured' });
  }

  try {
    const credentials = JSON.parse(serviceAccountJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetName = (process.env.RSVP_SHEET_NAME || 'RSVP Responses').replace(/'/g, "''");

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `'${sheetName}'!A:F`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[new Date().toISOString(), name, attendance, guestCount, phone, message]],
      },
    });

    return jsonResponse(200, { ok: true });
  } catch (error) {
    console.error('Unable to append RSVP to Google Sheets:', error.message);
    return jsonResponse(500, { ok: false, error: 'Unable to save RSVP' });
  }
};