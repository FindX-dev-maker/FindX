# FindX Marketplace — starter project

FindX is a responsive **front-end marketplace prototype** with a custom logo, product search, category filters, sorting, favourites, a cart, product details, seller onboarding UI, product listing forms, and light/dark themes.

## Run it locally

1. Unzip the project.
2. Open `index.html` in a modern browser, or use a local static server.
3. Edit the demo product list near the top of `app.js` (`seedProducts`) to change the starter products.
4. Use **Add a product** in the site to test creating a listing.

## Important limitations — read before launch

This is a static demo, **not a complete eBay replacement or a production-ready online store**.

- Listings, cart, favourites, theme, and the demo seller profile are saved in the current browser's `localStorage`. Other visitors/devices will not share them.
- The seller sign-up shows the intended **$10 fee**, but it does not charge anyone or verify seller identity.
- Checkout is deliberately a preview. **No card details are collected and no payments are processed.**
- There is no server, database, user authentication, shipping, refunds, moderation, dispute handling, seller payouts, fraud detection, or admin panel yet.
- Never put payment secret keys in `app.js` or any code shipped to the browser.

## Publishing free on GitHub Pages

You can use a free GitHub Pages address such as `https://YOUR-USERNAME.github.io/` or a project address such as `https://YOUR-USERNAME.github.io/findx-marketplace/`. This is a GitHub-hosted subdomain, not a custom domain you own. GitHub Pages can host this static front end for free within GitHub Pages' current limits, but **it cannot run the server-side payment verification or marketplace backend** required for real transactions.

1. Create/sign in to a GitHub account.
2. Create a repository named `findx-marketplace` (or use `YOUR-USERNAME.github.io` for a user site).
3. Upload `index.html`, `styles.css`, `app.js`, `logo.svg`, and `README.md` to the repository root.
4. In repository **Settings → Pages**, choose deployment from the `main` branch and the root folder, then save.
5. Wait for GitHub Pages to publish the URL shown in Settings → Pages.

## What is needed for a real launch

1. **Backend + database:** accounts, products, inventory, orders, seller status, roles and permissions. Examples: Supabase/PostgreSQL or another secure database/backend.
2. **Authentication:** secure sign-up/login, password reset, email verification, account protection and seller approval.
3. **Payments:** choose a supported provider for your business/country (for example Paystack or Stripe where eligible). Create payment sessions server-side and verify signed webhooks/server-side transaction status before unlocking seller tools or marking orders paid.
4. **Seller fee:** define the terms, taxes/currency, refund policy and what the $10 fee covers. Only activate seller status after the server confirms successful payment.
5. **Marketplace operations:** shipping, order status, returns, buyer/seller messaging, ratings/reviews, reports, prohibited items, customer support, privacy policy and terms.
6. **Security/testing:** server-side validation, rate limits, abuse prevention, accessibility and mobile/browser testing.

## Editing products manually

In `app.js`, find `const seedProducts = [...]`. Add an object with fields like:

```js
{
  id: 'fx109',
  name: 'Example product',
  category: 'Electronics',
  price: 29.99,
  emoji: '🎧',
  tone: 'lavender',
  tag: 'New find',
  description: 'A short product description.',
  seller: 'Example Shop'
}
```

Available `tone` names: `lavender`, `peach`, `mint`, `blue`, `yellow`, `rose`. For a product photo, provide an `image` URL. The image URL must be publicly accessible and you must have rights to use it.

## Before accepting real customers

Do not advertise this prototype as having live card payment or a working $10 seller fee. Finish and test the backend, payment integration, policies, and operational flows first.
