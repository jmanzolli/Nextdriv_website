# Nextdriv Website

Static marketing site for [nextdriv.ca](https://www.nextdriv.ca), hosted for free on **GitHub Pages** (replacing the previous Wix Studio site).

## Structure

```
index.html          Home (EN)
solutions.html      Solutions (EN)
about.html          About Us (EN)
contact.html        Contact (EN)
fr/                 French versions of the same four pages
thanks.html         Form submission confirmation (also used as 404)
assets/css/         Stylesheet
assets/js/          Nav toggle + scroll-reveal
assets/img/         Logos, photos, publication images
CNAME               Custom domain for GitHub Pages
```

No build step — plain HTML/CSS/JS. Edit a page, commit, push; GitHub Pages redeploys automatically.

## Forms

The contact form and newsletter use [FormSubmit](https://formsubmit.co) (free, no account) and deliver to `jonatas.manzolli@nextdriv.com`. The **first submission** sends a one-time activation email to that address — click the link once and all forms work from then on.

## Deployment (one-time setup)

1. Push to `main`.
2. On GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / root**.
3. In the same Pages settings, set custom domain `www.nextdriv.ca` and enable **Enforce HTTPS** (available after DNS propagates).
4. At the domain registrar, point DNS at GitHub Pages:
   - `www` → `CNAME` record → `jmanzolli.github.io`
   - Apex `nextdriv.ca` → `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
5. Remove/disconnect the domain from Wix so it stops pointing there.
