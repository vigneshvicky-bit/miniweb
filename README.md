# Mini Web Solutions

This repository contains a static frontend website and a Node.js + Express + MongoDB backend for handling contact form submissions.

## Project structure

- `index.html` - main landing page
- `basic-website.html`, `business-website.html`, `premium-solutions.html` - service pages
- `miniweb-backend/` - backend server project
  - `server.js` - Express API and static file server
  - `package.json` - backend dependencies
  - `.env.example` - example environment variables
  - `README.md` - backend usage details

## What to replace before deploying live

### 1. Update your domain and social metadata

In `index.html` and the other pages if you want them consistent, update the following values to your real live domain:

- `link rel="canonical"` URL
- `meta property="og:url"` URL
- `meta property="og:image"` URL if using an absolute image path
- `meta name="twitter:image"` URL if using an absolute image path
- `meta name="twitter:creator"` if you have a real Twitter handle

Example replacements:

- `https://www.miniwebsolutions.com/` → your actual live domain
- `https://www.miniwebsolutions.com/og-image.png` → your real hosted social image
- `@MiniWebSolutions` → your real Twitter handle or remove if none

### 2. Set your actual contact details

In `index.html`, update any placeholder phone numbers or WhatsApp links if they are not your final business contact:

- `+91 83672 15722`
- `+91 80088 57243`
- WhatsApp URL `https://wa.me/918367215722`

Also update any contact links in footer or page buttons if needed.

### 3. Configure the backend environment

In `miniweb-backend/.env` configure your real MongoDB connection:

```env
MONGO_URI=mongodb://127.0.0.1:27017/miniweb
PORT=4000
```

Replace the `MONGO_URI` value with your hosted MongoDB URI for production.

### 4. Confirm frontend API endpoint

The frontend currently sends form submissions to:

- `/api/contact`

If the backend and frontend are served from the same domain, no change is needed.
If the backend is hosted on a different domain, update the path in `index.html` to the full backend URL, for example:

```js
const response = await fetch('https://api.yourdomain.com/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, phone, date, service, message: msg })
});
```

### 5. Confirm static asset paths

If you host the site from a subfolder or different domain, verify that these asset links are correct:

- `favicon.ico`
- any image URLs in the page or metadata

If you are using relative paths and serving from the same folder, no change is required.

## Deployment steps

### Backend

1. Open terminal in `miniweb-backend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` from the example:
   ```bash
   copy .env.example .env
   ```
4. Edit `.env` and set a production MongoDB URI.
5. Start the backend:
   ```bash
   npm start
   ```

### Frontend

If you host the frontend together with the backend, the backend server already serves the static site from the parent folder.

If you host the frontend separately, you can publish the HTML files to any static host and point the contact form fetch call to the backend URL.

## Notes

- `miniweb-backend` serves the static frontend from the parent folder by default.
- If you host frontend and backend separately, adjust the `fetch('/api/contact')` endpoint.
- If your live domain is not `www.miniwebsolutions.com`, update all domain references in metadata and JSON-LD if needed.

## Live deployment checklist

- [ ] Real domain replaced in canonical and social tags
- [ ] Real hosted OG/Twitter image URLs configured
- [ ] Actual contact phone numbers and WhatsApp links verified
- [ ] `.env` set with production `MONGO_URI`
- [ ] Backend started successfully and `/api/contact` works
- [ ] Static assets available at the live host

If you want, I can also add a production `server.js` section for deployment on Heroku / Render / Railway. }