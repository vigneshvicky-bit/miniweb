# Mini Web Solutions Backend

This backend provides a simple Express API and MongoDB storage for the contact form in `index.HTML`.

## Setup

1. Install dependencies:

   npm install

2. Create environment file:

   cp .env.example .env

3. Edit `.env` and set your MongoDB connection string:

   MONGO_URI=mongodb://127.0.0.1:27017/miniweb
   PORT=4000

4. Start the server:

   npm start

## API

- `POST /api/contact`
  - body: `{ name, phone, date, service, message }`
  - saves the enquiry to MongoDB

- `GET /api/health`
  - returns `{ status: 'ok' }`

## Notes

- The Express server also serves the static site from the parent folder, so you can open the website at `http://localhost:4000`.
- If you prefer, you can host the frontend separately and point the fetch request to the backend's `/api/contact` endpoint.
