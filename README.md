# GrandJob

The Web application is a Next.js project at the repository root. The separate Expo Mobile application is in `mobile/`.

## Run locally

Install Web dependencies and start the Web application:

```bash
npm install
npm run dev
```

Open [http://localhost:4010](http://localhost:4010).

Run the Mobile application separately with:

```bash
npm --prefix mobile install
npm run start:mobile
```

Set `EXPO_PUBLIC_API_URL` in `mobile/.env` to the backend origin before starting the Mobile app. `npm run dev:all` starts both applications for local development.

## Production Web

```bash
npm run build
npm start
```

## Deploy the Web application

Vercel is the simplest deployment option. Set the project root to the repository root and use the Next.js framework preset. Configure `MONGODB_URI`, `JWT_SECRET`, `MAIL_HOST`, `MAIL_PORT`, `EMAIL_USER`, and `EMAIL_PASS` as production environment variables. Set `NEXT_PUBLIC_APP_URL` to the public Web origin so invitation links use the deployed site. This app uses server-rendered pages and API routes, so do not use static export.

The Vercel project deploys the Web application only. Mobile builds and releases are managed separately with Expo/EAS.
