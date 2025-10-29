This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## .env file

The .env file is currently not being shared to the git repo,
but in order to access login and signup functionality create a .env file in the root with the following public contents

```bash
NEXT_PUBLIC_SUPABASE_URL=https://vetwwtmxcdiotjxhdeza.supabase.co/
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZldHd3dG14Y2Rpb3RqeGhkZXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NTczMjIsImV4cCI6MjA2OTQzMzMyMn0.0FvdBUM6K3rMWtT-b-4xz-w1ILsbHxXuyY9GGq7LoyA
NEXT_PUBLIC_API_BASE_URL=http://localhost:5225
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# NEWS API KEY
NEXT_PUBLIC_NEWS_API_KEY=
GEMINI_API_KEY=
````

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment on Vercel

In addition to the local instances an online vercel deployement of the frontend is available from the following link

[Live Demo](https://previe-ten.vercel.app/)
