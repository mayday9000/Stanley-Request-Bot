# Stanley-Request-Bot
StanleyBot — Automated Add-to-Cart and Checkout (Puppeteer + Stealth)
This project uses Puppeteer with the puppeteer-extra Stealth plugin to open a Stanley product page, add the item to cart with a crafted POST, navigate to checkout, autofill shipping details, and enter payment fields embedded in iframes. 

Important: Only run automation against properties you control or have explicit permission to test. The current script targets a live retail site and includes hard-coded personal and payment data that you must replace or remove before any real use. 

Project contents
• index.js — main automation script (launches browser, crafts add-to-cart request, proceeds to checkout, fills shipping and card iframes). 

• package.json — declares entry point index.js, start script node index, and dependencies. 

• package-lock.json — locks dependency versions; Puppeteer’s toolchain in this lock requires Node 18+. 
 

What the script does (flow)

Launches Chromium with Stealth and opens the fixed product URL. Headless is currently disabled. 

Collects hidden form values (section-id, product-id, id) from the product page. 

Builds a multipart/form-data POST to /cart/add using page context fetch, including cookies from the current session. 

Fetches /cart.js, extracts the checkout token, and navigates to the checkout “information” step. 

Fills hard-coded shipping fields (email, name, address, phone) and proceeds. 

Locates payment iframes and types card number, expiry, and CVC, then submits. 

Orchestrates the steps in run(): open page → add to cart → shipping → payment. 

Requirements
• Node.js 18 or newer (due to Puppeteer’s browser manager requirements in the lockfile). 

• Dependencies: puppeteer, puppeteer-extra, puppeteer-extra-plugin-stealth, node-fetch. 

How to run (basic)
• Install dependencies with your preferred Node package manager.
• Start the script using the defined start command “node index”. 

Security, safety, and compliance notes
• Do not use live personal data or real card details. The script contains hard-coded email, address, phone, and card values that must be removed or replaced with safe test data before any use. 

• Interacting with third-party sites via automation may violate Terms of Service. Obtain written permission and use non-production environments when possible.

Recommended changes before publishing
• Parameterize sensitive data (email, name, address, phone, card) via environment variables or a config file; never commit secrets. 

• Make headless mode configurable (it is currently hard-coded to visible browsing). 

• Add a .gitignore that excludes node_modules and any local .env you introduce.
• Consider moving network calls out of page.evaluate and using page.setExtraHTTPHeaders/page.request where appropriate to simplify debugging. 

• Add error handling and explicit waits (selectors and navigation) to make the flow less brittle. 

Scripts and entry points
• Start script: “node index” (runs index.js). 

License
• ISC (declared in package.json).
