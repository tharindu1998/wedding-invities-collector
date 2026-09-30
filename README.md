# Shenal & Christina's Wedding Invitation

A React invitation site for the wedding on 27 January 2027.

## Run locally

```sh
npm install
npm run dev
```

## RSVP endpoint

The form is ready to send a JSON `POST` to a web endpoint. Add the endpoint URL to `.env.local` as `VITE_RSVP_ENDPOINT`; the request body contains `name`, `attendance`, `guestCount`, `phone`, `message`, and `submittedAt`. The endpoint must accept browser requests from the deployed site and return a successful HTTP status. Until configured, the form directs guests to RSVP using the couple's contact numbers instead of implying that a response was saved.

Copy `.env.example` to `.env.local` when configuring the endpoint. A small Google Apps Script web app can later forward the posted fields to a Google Sheet.