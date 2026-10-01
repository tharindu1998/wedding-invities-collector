# Shenal & Christina's Wedding Invitation

A React invitation site for the wedding on 27 January 2027.

## Run locally

```sh
npm install
npm run dev
```

The RSVP function runs with Netlify Dev rather than Vite's development server:

```sh
npx netlify-cli dev
```

## Connect Google Sheets

The RSVP function appends rows to the `RSVP Responses` tab in the spreadsheet configured by `RSVP_SHEET_ID`. Create that tab if needed and put these headers in row 1, in order: `Submitted At`, `Name / Family`, `RSVP`, `Guests Attending`, `Contact Number`, and `Message`.

1. In Google Cloud, enable the Google Sheets API and create a service account with a JSON key.
2. Share the spreadsheet with the service account's `client_email` and give it Editor access. Keep the sheet private otherwise.
3. In Netlify site environment variables, available to Functions, add `RSVP_SHEET_ID` using the ID from the spreadsheet URL and `GOOGLE_SERVICE_ACCOUNT_JSON` using the full contents of the service account JSON key. You can set `RSVP_SHEET_NAME` to a different tab name if needed.
4. Redeploy the site after setting the variables. Do not put the service account JSON in a `VITE_` variable, commit it, or share it in chat.

Copy `.env.example` to `.env` for local Netlify Dev. Add `GOOGLE_SERVICE_ACCOUNT_JSON` only to your local `.env` file, which must remain untracked. The form reports success only after the function confirms the row was appended.