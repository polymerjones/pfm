# Paul Fisher Media (pfm)

Modern static landing page link hub built with Next.js (App Router), Tailwind CSS, Framer Motion, and Formspree. Deploy-ready for Vercel.

## 1) Local development

```bash
cd /Users/paulfisher/pfm
npm install
npm run dev
```

Open `http://localhost:3000`.

## 2) Add assets

Put your logo video here:

- `/Users/paulfisher/pfm/public/logo.mp4`

(Provided source file in this workspace: `/Users/paulfisher/Desktop/pfmweblogo.mp4`.)

## 3) Formspree setup + env var

1. Create a form in [Formspree](https://formspree.io/).
2. Copy the Form ID from your endpoint (`https://formspree.io/f/<FORM_ID>`).
3. Create `.env.local` in `/Users/paulfisher/pfm`:

```bash
NEXT_PUBLIC_FORMSPREE_ID=your_form_id_here
```

4. Restart dev server after adding env vars.
5. In Formspree settings, set destination email to `paul.t.fisher03@gmail.com` and enable email notifications.

## 4) Git/GitHub push steps

Repo target: `https://github.com/polymerjones/pfm.git`

```bash
cd /Users/paulfisher/pfm
git init
git branch -M main
git remote add origin https://github.com/polymerjones/pfm.git
git add .
git commit -m "Initial Paul Fisher Media landing page"
git push -u origin main
```

If remote already exists:

```bash
git remote set-url origin https://github.com/polymerjones/pfm.git
```

## 5) Vercel import + env var + deploy

1. In Vercel, click **Add New Project** and import `polymerjones/pfm`.
2. Framework preset: **Next.js** (auto-detected).
3. Add environment variable:
   - `NEXT_PUBLIC_FORMSPREE_ID` = your Formspree ID
4. Deploy.
5. For future updates, push to `main`; Vercel auto-deploys.

## 6) Domain setup for `paulfishermedia.com`

In your DNS provider:

- `A` record
  - Host: `@`
  - Value: `76.76.21.21`
- `CNAME` record
  - Host: `www`
  - Value: `cname.vercel-dns.com`

Then in Vercel Project Settings -> Domains:

1. Add `paulfishermedia.com`
2. Add `www.paulfishermedia.com`
3. Set primary domain as desired.

## Notes

- Site is mobile-first and responsive.
- Logo video autoplays once (muted, inline), then freezes on final frame.
- Replay overlay appears after video ends; tap overlay appears if autoplay is blocked.
- Link buttons are thumb-friendly and full-width on mobile.
- Contact form posts directly to Formspree without a backend.
