# FindX Marketplace — Front-end demo

FindX is a responsive static marketplace prototype using HTML, CSS and vanilla JavaScript. It can be published on GitHub Pages for free.

## Included in this demo
- Product search, category chips, sorting, minimum/maximum price filters, favourites and cart
- Sample products shown when local demo storage is empty
- Add product form with image URL or camera/gallery file input
- Seller shop demo profile with a $10/month subscription label
- Optional seller WhatsApp and email contact links on listings
- Log-in/sign-up UI for demo-only account previews
- Local dashboard metrics for product views, checkout starts and demo transactions
- Admin demo activity view that avoids collecting passwords, full card details, CVV, crypto seed phrases or private keys
- Dark/light mode toggle and black, white, blue and red brand colours
- Currency selector for USD and NGN using an editable example rate in `app.js`
- Card/crypto checkout selection UI that clearly marks transactions as not paid

## Important limitations
This is **not yet a production marketplace**. GitHub Pages serves static files only; it cannot securely create user accounts, share seller listings across devices, process payments, validate payment status, run subscriptions, or protect an admin panel.

All demo data is stored in the visitor's browser using `localStorage`. It is not a central database. The USD→NGN example rate (`exchangeRateUSDNGN` in `app.js`) is not a live exchange rate and must be replaced by a trusted live FX service before being used for real pricing.

Before launch, connect a backend/database, a proper authentication provider, image storage, and payment providers with server-side verification/webhooks. Never store plaintext passwords, full card numbers, CVV, crypto seed phrases or private keys. The admin demo is for preview only and has no real access control.

## Editing products
The sample product list is near the top of `app.js` in `seedProducts`. You can edit the names, categories, prices, descriptions and emoji there. Products added through the demo form stay in the current browser only.

## Publish on GitHub Pages
Upload the contents of the `FindX-main` folder to the root of your existing repository (where `index.html`, `app.js`, `styles.css` and `logo.svg` already live). Do not upload only the enclosing folder as a nested directory. GitHub Pages should publish from the branch/folder configured in Settings → Pages.


## Product photos
The eight starter products use real product photography hosted by Unsplash. An internet connection is required to load those remote images. These are demonstration listings and prices, not live seller inventory.
