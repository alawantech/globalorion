# Bright Orion — Global Orion Platform

**Developer Handover Document** · `https://github.com/alawantech/globalorion`

A complete multi-level-marketing (MLM) platform built for the Nigerian market: paid membership registration (sponsored + PIN-activated), a 6-level matrix commission engine, member dashboards, stockist operations, withdrawals, and a full admin panel — powered by **Next.js 14** and **Firebase**.

This document is written for the developer taking over the project. It explains **everything**: how to run it locally, how every part works, which accounts you need, what is finished, and what is still a stub.

---

## Table of Contents

1. [Domain](#1-domain)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [Repository Layout](#3-repository-layout)
4. [Getting Started (Local Setup)](#4-getting-started-local-setup)
5. [Environment Variables](#5-environment-variables)
6. [Accounts & Access (Firebase, Vercel, GitHub)](#6-accounts--access-firebase-vercel-github)
7. [How Authentication & Roles Work](#7-how-authentication--roles-work)
8. [Admin Panel](#8-admin-panel)
9. [Core Business Flows](#9-core-business-flows)
10. [Firestore Data Model](#10-firestore-data-model)
11. [Commission Structure](#11-commission-structure)
12. [Current State: What Works & Known Gaps](#12-current-state-what-works--known-gaps)
13. [Scripts & Deployment](#13-scripts--deployment)
14. [Security Checklist Before Going Live](#14-security-checklist-before-going-live)
15. [Credits](#15-credits)

---

## 1. Domain

**`brightorionglobal.com`** — the intended production domain.

- The domain **expired long ago** and is currently available to buy again.
- **Buy it on [Namecheap](https://www.namecheap.com) only.** On other registrars (Hostinger, GoDaddy, etc.) it will appear as *taken* because they do not show this expired domain; Namecheap does.
- Process: create a free Namecheap account → search `brightorionglobal.com` → it will show as available → purchase it.
- After buying: point **DNS** at your hosting (Vercel adds the domain to the project and gives you the nameservers/CNAME records to set in Namecheap).

---

## 2. Tech Stack & Architecture

| Layer | Technology |
|---|---|
| Framework | **Next.js 14.0.4** (App Router, TypeScript) |
| UI | React 18, Tailwind CSS + shadcn/ui, Framer Motion, Lucide icons, Recharts |
| Authentication | **Firebase Authentication** (email/password) |
| Database | **Cloud Firestore** (NoSQL) — there is **no SQL server** in this project |
| Forms / validation | react-hook-form + Zod |
| Payments | **Manual** (bank transfer / USSD instructions today; Paystack scaffolded but not active — see §12) |
| Email | **Mock only** (see §12) |
| Hosting | **Vercel** (production) · optional Firebase Hosting (`firebase.json`) |

### Request flow

```
Browser
  │
  ├── pages/components (React)  ──► Firebase client SDK ──► Firebase Auth + Firestore
  │                                  (runs in the browser, user session)
  │
  └── app/api/**  (Next.js API routes)
        ├── most routes call Firestore with the Firebase CLIENT SDK,
        │   i.e. they act like an unauthenticated client — no server DB
        ├── some routes verify a signed cookie JWT (lib/auth.ts) — see §12
        └── Firebase Admin SDK (lib/firebase-admin.ts) exists but is NOT wired up yet
```

> **Key idea:** there is no separate backend server. Next.js API routes and the browser both talk directly to Firebase. Data lives entirely in Firestore.

---

## 3. Repository Layout

```
globalorion/
├── app/                        # Next.js App Router — all pages & API routes
│   ├── page.tsx                # Landing page (hero, mechanics, testimonials)
│   ├── auth/login/             # Login page → POST /api/auth/login
│   ├── auth/register/          # Registration page → POST /api/auth/register  ◄ linked from landing
│   ├── register/               # Duplicate of the register flow (legacy copy)
│   ├── user/                   # Member area (post-login landing: /user)
│   ├── dashboard/              # Member dashboard (also used as fallback redirect)
│   ├── force-dashboard/        # Utility redirect helper
│   ├── team/                   # Team / downline view
│   ├── admin/                  # Admin panel
│   │   ├── page.tsx            #   admin home: stats, users, pins, withdrawals (role-gated client-side)
│   │   ├── dashboard/ users/ pins/ stockists/   # admin sub-pages
│   ├── stockist/               # Stockist register + dashboard
│   ├── shop/, payment/, locations/, about/, contact/
│   ├── setup/, test-users/, redirect-test/      # dev/utility pages (see §12)
│   └── api/                    # 43 API route files — 33 implemented, 10 empty stubs (§12)
├── components/                 # Shared UI (Navbar, HowItWorks, etc.)
├── lib/                        # Core logic
│   ├── firebase.ts             # Firebase client app (Auth + Firestore)
│   ├── firebase-admin.ts       # Admin SDK init — NOT imported anywhere yet (optional)
│   ├── auth.ts                 # JWT (jose) cookie verification for API routes
│   ├── firestore-collections.ts# TypeScript models for users, pins, packages, …
│   ├── firestore-utils.ts      # User/PIN helpers (lookup sponsor, generate IDs)
│   ├── matrix-calculator.ts    # 6-level matrix placement maths
│   ├── referral-system.ts      # Sponsor/upline referral chain helpers
│   ├── payment/paystack.ts     # Paystack API helpers — not used by live routes (§12)
│   ├── email-service.ts        # Email templates — SENDER IS A MOCK (§12)
│   ├── email.ts, email/        # Unused mail helpers (nodemailer never imported)
│   └── db/, db.ts              # Legacy Postgres/Drizzle — deprecated stubs
├── drizzle.config.ts           # Legacy (Postgres) — not used anymore
├── firestore.rules             # Firestore security rules (see caveat in §12)
├── firebase.json               # Firebase Hosting config (optional hosting path)
├── scripts/                    # Legacy helpers (JSON-file era) — not part of runtime
├── public/                     # Static assets incl. product screenshots
├── .env.example                # Safe template of environment variables
└── .env.local                  # ⚠️ real credentials — provided privately, never committed
```

---

## 4. Getting Started (Local Setup)

### Prerequisites

- **Node.js 18+** (recommended: 20 LTS) and npm — `node -v`
- **Git**
- A Google account with access to the Firebase project (see §6) — only needed for data/deployments, not for local UI work

### Steps

```bash
# 1. Clone
git clone https://github.com/alawantech/globalorion.git
cd globalorion

# 2. Install dependencies
npm install

# 3. Environment
#    - Take the .env.example template…
cp .env.example .env.local
#    …but get the REAL filled-in .env.local from the project owner privately.
#    It contains Firebase keys, admin credentials and account logins.

# 4. Run
npm run dev
```

Open **http://localhost:3000**.

> **Note:** a junk dependency (`"-"`) used to break `npm install` on fresh machines; it has been removed from `package.json`. If you forked an older copy, delete that line.

### What you should see

- Landing page at `/`
- Registration at `/auth/register`, login at `/auth/login`
- Admin panel at `/admin` (login first — see §8)
- Member area at `/user`

---

## 5. Environment Variables

Only **one** env file is used at runtime: **`.env.local`** (git-ignored).

`.env.example` is a commented, secret-free template. The owner sends you the filled-in `.env.local` **personally** — it is never pushed to GitHub.

| Variable | Used by | Purpose |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `lib/firebase.ts` | Firebase web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `lib/firebase.ts` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `lib/firebase.ts` | Firebase project id (`global-orion`) |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `lib/firebase.ts` | Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `lib/firebase.ts` | FCM sender id |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `lib/firebase.ts` | Firebase app id |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `lib/firebase.ts` | GA4 measurement id |
| `JWT_SECRET` | `lib/auth.ts` | Secret used to verify the `auth-token` cookie JWT (currently that cookie is never issued — see §12) |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | `lib/firebase-admin.ts` | *(optional, inactive)* service-account client email |
| `FIREBASE_ADMIN_PRIVATE_KEY` | `lib/firebase-admin.ts` | *(optional, inactive)* service-account private key |

**Deliberately not configured** (the code doesn't really use them in this version):

- `SMTP_*`, `FROM_EMAIL`, `EMAIL_API_KEY` — email sending is mocked (§12)
- `PAYSTACK_SECRET_KEY` — Paystack routes are empty stubs (§12)
- `DATABASE_URL` — no SQL database anymore

**Not code, but stored in `.env.local` for safekeeping** (reference credentials the developer needs):

- `PROJECT_GOOGLE_EMAIL` / `PROJECT_GOOGLE_PASSWORD` — owner Google account (Firebase + Vercel)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — working admin login (§8)

---

## 6. Accounts & Access (Firebase, Vercel, GitHub)

### 🔑 The one account that owns everything

| | |
|---|---|
| **Google account** | see `PROJECT_GOOGLE_EMAIL` in your `.env.local` |
| **Password** | *provided in your copy of `.env.local`* (`PROJECT_GOOGLE_PASSWORD`) |

This single Google account owns:

1. **Firebase project `global-orion`** (Auth, Firestore, everything)
2. **The Vercel team/project** the site is deployed from

> **How to receive the credentials:** the owner sends `.env.local` to you **personally** (e.g. directly on WhatsApp/Telegram, or via a password-protected file — send the file password in a *separate* message). It is **not** in GitHub, and it never should be.

### Firebase Console

1. Sign into **that Google account** (address + password are in `.env.local`: `PROJECT_GOOGLE_EMAIL` / `PROJECT_GOOGLE_PASSWORD`) in your browser (accounts.google.com → add account).
2. Go to **https://console.firebase.google.com** → pick the Google account if prompted.
3. Select project **`global-orion`**.

From there you can manage:

- **Authentication → Users** — every member/admin email & password lives here (Firebase Auth, not in the code)
- **Firestore Database → Data** — all collections (users, pins, commissions, withdrawals, …)
- **Firestore → Rules** — security rules
- **Project settings → Service accounts** — where you generate `FIREBASE_ADMIN_*` keys if ever needed

### Vercel

1. Make sure you are already signed into the project Google account (`PROJECT_GOOGLE_EMAIL` from `.env.local`) at **accounts.google.com** in the same browser.
2. Go to **https://vercel.com** → **Log in** → **“Continue with Google”** → choose that account.
3. You will land in the team that owns the project. Open the project → **Deployments** (history), **Settings → Environment Variables** (add every variable from `.env.local` — Vercel does **not** read `.env.local`, it uses its own env store), **Settings → Domains** (attach `brightorionglobal.com` after buying it).

> Tip for handover: instead of living on the owner's login forever, the owner can invite your own Google/Vercel account as a **Team Member** (Vercel → Team Settings → Members) and add you to the Firebase project (IAM). Then the shared owner password can be changed and access revoked.

### GitHub

Repository: **https://github.com/alawantech/globalorion** — push access is granted by the owner (invite as collaborator). Standard flow: `git pull` → branch → commit → push.

---

## 7. How Authentication & Roles Work

- **Login:** `/auth/login` → `POST /api/auth/login` → **Firebase Auth** `signInWithEmailAndPassword`.
  On success the API reads the user's Firestore profile `users/{firebaseUid}` and returns it (including `role`).
  The Firebase client SDK keeps the session in browser storage, so pages stay logged in.
  The login page redirects members to **`/user`**.
- **Roles** live in the Firestore user document: `role: "user" | "admin"` (stockist uses `status`/separate collection).
- **Route protection today is page-level, client-side:**
  - `/admin` re-checks on mount: `onAuthStateChanged` → Firestore profile → must be `role === "admin"` else redirected to `/dashboard`.
  - `middleware.ts` is **deliberately empty** (no server-side route guarding) — see §12.
- **Registration** creates BOTH: a Firebase Auth account (email/password) and a Firestore `users/{uid}` profile. Passwords are **only** stored in Firebase Auth — never in Firestore.

---

## 8. Admin Panel

### Logging in

Go to **`/auth/login`** and use the admin account (real credentials are in your `.env.local`):

```
ADMIN_EMAIL    →  (from your .env.local)
ADMIN_PASSWORD →  (from your .env.local)
```

After login you get redirected with the member flow; open **`/admin`** — the page verifies `role === "admin"` from Firestore and shows the panel (it will bounce non-admins to `/dashboard`).

> There are **no hardcoded admin credentials anywhere in this repository** — admin access = a Firebase Auth account + `role: "admin"` in its Firestore profile. The credentials above were created and verified for handover (2026-10-24) and live only in `.env.local`.

### What the admin can do

- **Dashboard** — platform stats, earnings, member counts (`/api/admin/stats`)
- **Users** — list/search members (`/api/admin/users`)
- **PINs** — generate registration PINs (8-char), mark as sent, assign (`/api/admin/generate-pins`, `generate-custom-pin`, `send-pin`, `mark-pin-sent`)
- **Commissions** — approve pending commissions (`/api/admin/approve-commission`)
- **Withdrawals** — review member withdrawal requests, approve/reject (`/api/admin/withdrawals`)
- **Stockists** — manage stockist accounts & stock requests (`/api/admin/stockists*`)

### Creating additional admins

1. **Firebase Console → Authentication → Add user** (email + password).
2. **Firestore → `users` → Add document** with the **document ID = that user's UID** (Authentication → user → UID) and at minimum:

```json
{
  "userId": "admin002",
  "userName": "admin002",
  "name": "Full Name",
  "email": "newadmin@example.com",
  "phone": "",
  "location": "",
  "role": "admin",
  "sponsorId": "",
  "uplineId": "",
  "status": "active",
  "currentLevel": 1,
  "totalEarnings": 0,
  "pendingEarnings": 0,
  "downlines": []
}
```

3. Log out, log in as that account → `/admin`.

(The repo's `app/api/test/create-admin` route shows the same structure in code, but it writes the wrong document id — do it manually as above.)

---

## 9. Core Business Flows

### 9.1 Member registration (paid, sponsored, PIN-activated)

`/auth/register` → `POST /api/auth/register`:

1. Validates **Sponsor ID** exists (`sponsorId` is mandatory — referral genealogy).
2. Validates the **registration PIN** against the `pins` collection (`status: unused | sent`).
3. Creates the **Firebase Auth** account (email + password).
4. Writes the Firestore **`users`** profile (auto-generated member `userId`, sponsor/upline, level, earnings = 0).
5. Marks the PIN used and writes referral/commission bookkeeping.

**Starter package:** *Bright Orion Starter Package — ₦36,000* (see `app/register`).

### 9.2 Payments (currently manual)

The in-app automated payment pipeline is **not active** (its API routes are empty stubs — §12). The `/payment` page presents the supported methods (card / **bank transfer** / **USSD**) as instructions; settlement is coordinated manually by the operator, after which a registration PIN is issued to the buyer (admin panel → PINs).

### 9.3 The 6-level matrix

When a member is activated, commissions are calculated along the upline — up to **6 levels** (see §11). Logic lives in `lib/matrix-calculator.ts` + `lib/referral-system.ts`; commission records are written to the `commissions` collection; admin approves pending ones (`approve-commission`).

### 9.4 Withdrawals

1. Member: **`POST /api/user/request-withdrawal`** (amount + bank details in profile).
2. Request stored in `withdrawals` (`pending`).
3. Admin: `/admin` → withdrawals → approve/reject (`PUT /api/admin/withdrawals/...`).

### 9.5 Stockists

`stockist/register`, `stockist/request-stock`, `stockist/sale`, `stockist/profile` — stockists request stock from the platform and record sales. (Partially implemented; `stockist/transactions` is an empty stub — §12.)

### 9.6 Member features

Dashboard (earnings/levels), team/downline tree, referral link with your member ID, notifications (`notifications` collection), bank details for payouts.

---

## 10. Firestore Data Model

Main collections (see `lib/firestore-collections.ts` for typed shapes):

| Collection | Contents |
|---|---|
| **`users`** | One doc per member. **Document ID = Firebase Auth UID.** Fields: `userId` (public member ID), `userName`, `name`, `email`, `phone`, `location`, `role` (`user`/`admin`), `sponsorId`, `uplineId`, `status` (`active/pending/suspended/banned`), `currentLevel`, `totalEarnings`, `pendingEarnings`, `downlines[]`, `createdAt`, `activationDate` (+ bank fields written by profile APIs) |
| **`pins`** | Registration PINs: `pin`/`code`, `status` (`unused/sent/used`), `assignedTo`, `usedBy`, `usedAt`, `createdAt` |
| **`commissions`** | Earned commissions per member per level, with approval state |
| **`referrals`** | Sponsor→referral links |
| **`withdrawals`** | Payout requests + status (pending/approved/rejected) |
| **`payments`** | Payment records |
| **`transactions`** | Ledger entries |
| **`matrix`** | Matrix node placements |
| **`notifications`** | Per-user notifications |
| **`bonuses`** | Bonus awards |
| **`stockists`**, **`stockistTransactions`** | Stockist accounts & stock movements |
| **`packages`** | Membership packages (`starter`, ₦36,000) — public read |
| **`settings`**, **`activity_logs`**, **`support_tickets`** | Platform settings, audit log, support |

**Security rules:** the repo contains `firestore.rules` (auth-required rules). ⚠️ The **currently deployed rules** on `global-orion` are more permissive than this file (verified: unauthenticated reads of `users` succeed today). Before a public launch, review and deploy proper rules — and remember most API routes rely on being able to read Firestore *without* a user session (see §12), so tighten rules **together with** migrating those routes to the Firebase Admin SDK.

---

## 11. Commission Structure

| Level | Reward (₦) | Type |
|-------|------------|------|
| Level 1 | 4,000 | Direct referral |
| Level 2 | 2,000 | Indirect |
| Level 3 | 2,000 | Indirect |
| Level 4 | 1,500 | Indirect |
| Level 5 | 1,500 | Indirect |
| Level 6 | 1,500 | Indirect |

**Total per completed path: ₦12,500.** Enforced in `lib/matrix-calculator.ts` (admin approval gate on top).

---

## 12. Current State: What Works & Known Gaps

This section is intentionally blunt — read it before touching anything.

### ✅ Working / real

- Landing, about, contact, locations, shop, team, payment-info pages
- Firebase Auth login + registration with sponsor & PIN validation
- Member area (`/user`, `/dashboard`) with Firestore-backed data
- Admin panel UI + stats/users/PIN generation/commission approval/withdrawals endpoints
- Withdrawal request → admin approval loop
- Stockist register/request-stock/sale/profile endpoints
- Firestore rules file for reference (see caveat in §10)

### ⚠️ Known gaps (documented, deliberately left as-is)

1. **10 API routes are empty files (0 bytes)** — these features do nothing:
   `api/init`, `api/auth/activate-pin`, `api/payment/process`, `api/payment/paystack/initialize`, `api/payment/whatsapp`, `api/create-test-users`, `api/admin/stockist-users`, `api/admin/stockists/update-status`, `api/stockist/transactions`, `api/withdrawals/request`.
   Consequence: **automated card/Paystack payments, PIN auto-activation, and the `setup`/`test-users` utility pages are non-functional.**
2. **`middleware.ts` is disabled** (empty function) — no server-side route protection. Admin gating happens client-side in `app/admin/page.tsx`.
3. **API authorization is inconsistent:**
   - `admin/users`, `admin/stockists`, `stockist/*` verify an `auth-token` cookie JWT via `lib/auth.ts` — but **no code ever sets that cookie**, so these endpoints currently always answer `403`.
   - Most other admin endpoints (`stats`, `generate-pins`, `withdrawals`, `approve-commission`, …) perform **no authentication check at all**.
   → Treat as top-priority hardening work (use Firebase Admin SDK ID-token verification).
4. **Email is mocked.** `lib/email-service.ts` `sendEmail()` just `console.log`s; `lib/email/production.ts` (nodemailer/SMTP) is never imported. Members/admins receive **no real emails** today.
5. **Paystack is scaffolding only** (`lib/payment/paystack.ts` never imported by a live route).
6. **Firebase Admin SDK unused** — `lib/firebase-admin.ts` is never imported; `FIREBASE_ADMIN_*` env vars optional.
7. **Legacy files** (safe to ignore/delete later): `drizzle.config.ts`, `lib/db/` + `lib/db.ts` (deprecated “moved to Firebase” stubs), `scripts/setup.js` + `scripts/add-collection-id-to-users.ts` (pre-Firebase JSON-file era — its “default admin/admin123” text is outdated), duplicate register page `app/register` (canonical is `app/auth/register`).
8. **`firestore.rules` in the repo ≠ deployed rules** (§10).

### Frontend quality notes

- Two register pages exist (`/auth/register` used by all links; `/register` is an older copy).
- After login members land on `/user`; `/dashboard` is an equivalent member view.
- Screenshots of each UI area live in `public/` (hero, commission structure, dashboards, register page).

---

## 13. Scripts & Deployment

### npm scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server → http://localhost:3000 |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

### Deploying to Vercel

1. Log in (§6) → import the `globalorion` repo (already linked if the project exists — check *Project → Settings → Git*).
2. **Settings → Environment Variables:** add every variable from your `.env.local` (Vercel ignores `.env.local` files).
3. Push to the deployed branch → automatic build/deploy.
4. **Domain:** *Settings → Domains* → add `brightorionglobal.com` (and `www`) after purchasing it on Namecheap; Vercel shows the DNS records to enter at Namecheap.

### Alternative: Firebase Hosting

`firebase.json` is configured for the Next.js framework build (`firebase hosting + frameworksBackend`, region `us-central1`) if you prefer `firebase deploy` — but **Vercel is the primary deployment target**.

---

## 14. Security Checklist Before Going Live

- [ ] Rotate/change the owner Google password after handover if it was shared insecurely; invite the developer via proper team invitations instead (§6).
- [ ] Change the admin password (`Firebase Console → Authentication`), or create a new admin per §8.
- [ ] Set **real** `firestore.rules` (the repo version) **after** migrating API routes to Firebase Admin SDK — tightening rules alone will break routes that read Firestore unauthenticated (§10, §12.3).
- [ ] Implement auth checks on all `/api/admin/**` routes (ID-token verification) and remove/replace the never-issued `auth-token` cookie flow (§12.3).
- [ ] Replace the mock email service before any flow depends on email delivery.
- [ ] Decide the payment story (activate Paystack properly or keep manual transfers documented).
- [ ] Verify `.env.local` is (and stays) git-ignored: `git check-ignore .env.local` → prints the path.

---

## 15. Credits

**Developed by Abubakar Lawan**

- 📧 [info@abubakardev.dev](mailto:info@abubakardev.dev)
- 📱 [+234 8100681294](tel:+2348100681294)
- 💻 [github.com/alawantech](https://github.com/alawantech)

**© 2026 Global Orion Platform. All rights reserved.**
