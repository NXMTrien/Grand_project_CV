GrandJob's Web application is a Next.js project at the repository root. The Expo Mobile app lives in [`mobile/`](./mobile/README.md) with its own dependencies; it is separate from the Web build and deployment.

## Run the applications

Run the Web development server:

```bash
npm run dev
```

Open [http://localhost:4010](http://localhost:4010) to use the Web application.

When the separate Mobile project is available locally, use `npm start` to start it or `npm run dev:all` to start Web and Mobile together. Running `npm run` without a script name only lists available scripts.

To run the production Web server locally, use:

```bash
npm run build
npm run start:web
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy the Web application

**Vercel is the simplest option** for deploying the Web application: connect the repository, keep the project root at the repository root, and configure `MONGODB_URI`, `JWT_SECRET`, `MAIL_HOST`, `MAIL_PORT`, `EMAIL_USER`, and `EMAIL_PASS` as production environment variables. Set `NEXT_PUBLIC_APP_URL` to the public Web origin if password recovery links should point to it. Next.js's Node.js deployment supports the server-rendered pages and API routes used by this project; do not use static export for this app.

Render or Railway can also run the root app as a Node.js service using `npm run build` and `npm run start:web`. Deploying Web does not require installing or building the separate Mobile app.
