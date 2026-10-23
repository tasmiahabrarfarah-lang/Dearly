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

## Diary sharing setup

Diary entries are stored in Supabase for signed-in users so row-level security can protect private entries and explicit friend shares. Before using sharing, apply [`supabase/migrations/20261020000100_diary_sharing.sql`](supabase/migrations/20261020000100_diary_sharing.sql) to the connected Supabase project. It expects the existing `public.friendships` table with `requester_id`, `addressee_id`, and `status` columns, where accepted friendships use `status = 'accepted'`.

On the first signed-in load after the migration, existing browser diary entries are imported to that account and the browser-wide local copy is cleared. New and edited entries then use the account-backed table. The local-only fallback remains for development without Supabase and does not provide multi-user sharing.

The pgTAP authorization checks are in [`supabase/tests/diary_sharing.test.sql`](supabase/tests/diary_sharing.test.sql) and can be run with `supabase test db` against a local Supabase database after installing the Supabase CLI, initializing its local project configuration, and applying migrations.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
