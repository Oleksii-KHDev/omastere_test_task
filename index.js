import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { executablePath } from 'puppeteer';
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ executablePath: executablePath() });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
        {
            brands: [
                {
                    brand: "Chromium",
                    version: "110",
                },
                {
                    brand: "Not A(Brand",
                    version: "24",
                },
                {
                    brand: "Google Chrome",
                    version: "110",
                }
            ],
            platform: "Windows",
            platformVersion: "10.0.0",
            architecture: "x86",
            model: "x64",
            mobile: false,
        });

    await page.setRequestInterception(true);
    page.on('console', msg => console.log(msg.text()));
    page.on('request', async (request) => {
        let headers;
        if (request.url().endsWith('api.php')) {
            await page.setExtraHTTPHeaders({'referer': 'https://dev.amidstyle.com/'});
            headers = request.headers();
            headers["sec-fetch-dest"] = "empty";
            headers["sec-fetch-mode"] = "cors";
            headers["sec-fetch-site"] = "same-origin";
        }
        await request.continue({headers})
    });

    page.on('response', async (response) => {
        if (response.url().endsWith('/api.php')) {
            // Here I can retrieve content of the div#data using  await response.text();
            setTimeout(getElement, 1000);
        }
    });

    await page.goto('https://dev.amidstyle.com/', {waitUntil: 'load'});
    await page.evaluate(async () => {
        const newProto = navigator.__proto__;
        delete newProto.webdriver;
        navigator.__proto__ = newProto;
    });
    await page.screenshot({'path': 'admidstyle.png'})

    const getElement = async () => {
        let element = await page.$('div#data');
        let value = await page.evaluate(el => el.textContent, element);
        console.log(JSON.parse(value));
        await browser.close();
    }
})();
