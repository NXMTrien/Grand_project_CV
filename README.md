# GrandJob Web

The Web application is a Next.js project at the repository root.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:4010](http://localhost:4010).

## Production

```bash
npm run build
npm start
```

## Deploy

Vercel is the simplest deployment option. Connect the repository, keep the project root at the repository root, and configure `MONGODB_URI`, `JWT_SECRET`, `MAIL_HOST`, `MAIL_PORT`, `EMAIL_USER`, and `EMAIL_PASS` as production environment variables. Set `NEXT_PUBLIC_APP_URL` to the public Web origin if password recovery links should point to it.

Render or Railway can run the app as a Node.js service using `npm run build` and `npm start`. This app uses server-rendered pages and API routes, so do not use static export.
