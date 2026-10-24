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

## In-app notifications

Apply [`supabase/migrations/20261023000300_notifications.sql`](supabase/migrations/20261023000300_notifications.sql) after the Little Notes migration. Database triggers create private notifications for received friend requests, accepted requests, and new Little Notes on the diary owner's entries. Notification rows contain event references only; note contents and diary text are not copied. Users can manage friend-activity and Little Notes preferences in the notification panel. Row-level security limits reads and updates to the signed-in recipient, and clients can update only `read_at`.

The inbox refreshes when opened, when the page regains focus, and every minute while visible. It does not use a real-time service. The app does not currently generate system announcements, so there is no system-notification category. The pgTAP checks are in [`supabase/tests/notifications.test.sql`](supabase/tests/notifications.test.sql); run them with `supabase test db` in a configured local Supabase project.

## Profile and diary customization

Apply [`supabase/migrations/20261025000100_profile_and_diary_customization.sql`](supabase/migrations/20261025000100_profile_and_diary_customization.sql) to enable unique usernames, profile titles, avatar accessories, first-visit personalization, and owner-only diary appearance settings. Username checks run through a server action and are backed by a case-normalized unique database index; the existing Dearly ID remains the stable relationship identifier. Diary colors, patterns, bookmark choices, and decorations are restricted to supported values and stored in `user_diary_designs` under the authenticated user's ID with row-level security enabled. New accounts are prompted to choose an avatar and diary preset the first time they enter `/world`; existing profiles are marked as already personalized during migration. Users can update these choices later from My Profile and Settings.

## Auth email delivery

Sign-up confirmation is sent by Supabase Auth, not by the Next.js app. The built-in Supabase mailer is for testing: it restricts recipients to project team addresses and is limited to two emails per hour. For public sign-ups, configure a custom SMTP provider in Supabase Dashboard → Authentication → SMTP Settings. Also set `NEXT_PUBLIC_SITE_URL` to the real HTTPS app origin in the deployment environment, set the same Site URL in Supabase Auth URL Configuration, and allow the `/auth/callback` redirect there. Local development may use `http://localhost:3000`. The registration screen supports requesting a resend and displays Auth errors such as delivery or rate-limit failures.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
