const fetch = require('node-fetch')
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin())

const prodURL = "https://www.stanley1913.com/products/clean-slate-quencher-h20-flowstate-tumbler-30-oz-soft-rain?variant=44559841656959";
const prodURLInfo = prodURL.split(".com")[1];
const addToCartURL = "https://www.stanley1913.com/cart/add";
const checkoutURL = "https://www.stanley1913.com/checkouts/cn/";// + token + "/information";

async function parseCookies(page) {
    const cookies = await page.cookies();
    let cookieList = "";
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        let cookieString = cookie.name + "=" + cookie.value;
        if (i != (cookies.length - 1)) {
            cookieString = cookieString + "; ";;
        }
        cookieList = cookieList + cookieString;
    }
    return cookieList;
}

async function givePage(url) {
    const browser = await puppeteer.launch({ headless: false });
    const prodPage = await browser.newPage();
    await prodPage.goto(url);

    return prodPage;
}
async function addToCart(page) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const sectionID = await page.evaluate(() => {
        return document.querySelector("input[name='section-id']").getAttribute("value");
    })
    const prodID = await page.evaluate(() => {
        return document.querySelector("input[name='product-id']").getAttribute("value");
    })
    const ID = await page.evaluate(() => {
        return document.querySelector("input[name='id']").getAttribute("value");
    })
    const cookies = await parseCookies(page);
    const webBoundary = "----XXX";

    const postRequestContent = {
        "method": "POST",
        "headers": {
            "accept": "application/javascript",
            "accept-language": "en-US,en;q=0.9",
            "content-type": `multipart/form-data; boundary=${webBoundary}`,
            "priority": "u=1, i",
            "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Microsoft Edge\";v=\"132\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            "cookie": cookies,
            "Referer": prodURL,
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": `--${webBoundary}\r\nContent-Disposition: form-data; name=\"form_type\"\r\n\r\nproduct\r\n--${webBoundary}\r\nContent-Disposition: form-data; name=\"utf8\"\r\n\r\n✓\r\n--${webBoundary}\r\nContent-Disposition: form-data; name=\"id\"\r\n\r\n${ID}\r\n--${webBoundary}\r\nContent-Disposition: form-data; name=\"properties[Shipping]\"\r\n\r\n\r\n--${webBoundary}\r\nContent-Disposition: form-data; name=\"product-id\"\r\n\r\n${prodID}\r\n--${webBoundary}\r\nContent-Disposition: form-data; name=\"section-id\"\r\n\r\n${sectionID}\r\n--${webBoundary}\r\nContent-Disposition: form-data; name=\"quantity\"\r\n\r\n1\r\n--${webBoundary}\r\nContent-Disposition: form-data; name=\"sections\"\r\n\r\ncart-notification-product,cart-notification-button,cart-icon-bubble\r\n--${webBoundary}\r\nContent-Disposition: form-data; name=\"sections_url\"\r\n\r\n${prodURLInfo}\r\n--${webBoundary}--\r\n`
    };

    const requestResponse = await page.evaluate(async (addToCartURL, postRequestContent) => {
        let response = await fetch(addToCartURL, postRequestContent);
        const body = await response.text();
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log(body);
        return body;
    }, addToCartURL, postRequestContent);

    console.log("added to cart");
    console.log(`Request response: ${requestResponse}`);

    const getRequestContent = {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "priority": "u=1, i",
            "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "cookie": cookies,
            "Referer": prodURL,
            "Referrer-Policy": "strict-origin-when-cross-origin"
        }
        ,
        "body": null,
        "method": "GET"
    };
    const getRequestResponse = await page.evaluate(async (getRequestContent) => {
        let response = await fetch("https://www.stanley1913.com/cart.js", getRequestContent); 
        const body = await response.json();
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      console.log(body);
      return body;
    }, getRequestContent);
    
    console.log(`Token: ${getRequestResponse.token.split('?')[0]}`);

    await page.goto(`${checkoutURL}${getRequestResponse.token.split('?')[0]}/information`);
    console.log("Navigated to checkout page.");
}
async function shippingInfo(page) {

    
    await new Promise(resolve => setTimeout(resolve, 4000));
    await page.type("input[id='email']", "MasonDavis1230402@gmail.com");
    await page.type("input[id='TextField0']", "Mason");
    await page.type("input[id='TextField1']", "Davis");
    await page.type("input[id='shipping-address1']", "1204 Sand Pine Dr.");
    await page.type("input[id='TextField4']", "Cary");
    await page.type("input[id='TextField5']", "27519");
    await page.type("input[id='TextField6']", "9192443451");

    await new Promise(resolve => setTimeout(resolve, 4000));
    await page.click("button[type='submit']")
    await new Promise(resolve => setTimeout(resolve, 4000));
    await page.evaluate(() => {
        document.querySelector("button[type='submit']").click();
    });

    console.log("Shipping info complete");
}
async function ccInfo(page) {
    await page.waitForSelector("iframe[title='Field container for: Card number']");
    let iframeCard = await page.$("iframe[title='Field container for: Card number']");
    let iframeCardContent = await iframeCard.contentFrame();
    await iframeCardContent.type("input[id='number']", "4485736073208881");

    iframeCard = await page.$("iframe[title='Field container for: Expiration date (MM / YY)']");
    iframeCardContent = await iframeCard.contentFrame();
    await iframeCardContent.type("input[id='expiry']", "1/2026");

    iframeCard = await page.$("iframe[title='Field container for: Security code']");
    iframeCardContent = await iframeCard.contentFrame();
    await iframeCardContent.type("input[id='verification_value']", "524");

    await page.evaluate(() => {
        document.querySelector("input[id='RememberMe-RememberMeCheckbox']").click();
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.evaluate(() => {
        document.querySelector("button[type='submit']").click();
    });
    console.log("ccinfo complete.");
}
async function run() {
    let page = await givePage(prodURL);
    await addToCart(page);
    await shippingInfo(page);
    await ccInfo(page);
}

run();