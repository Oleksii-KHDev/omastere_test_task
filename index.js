// import puppeteer from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import querystring from 'node:querystring';
import { executablePath } from 'puppeteer';
puppeteer.use(StealthPlugin());

(async () => {
    // const browser = await puppeteer.launch({ headless: true, executablePath: executablePath() } );
    const browser = await puppeteer.launch({ executablePath: executablePath() });
    const page = await browser.newPage();
    // await page.emulate(iPhone);
    // await page.setViewport({ width: 1200, height: 800 });
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
    // await page.setExtraHTTPHeaders({'referer': 'https://dev.amidstyle.com/'});
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

            console.log('>>', request.method(), request.url());
            console.log('>> Headers:\n', headers);
            let postData = querystring.parse(request.postData());
            console.log('>> Body:\n', request.postData());
            // let jsCode = `base97encode('${postData.formHash}')`;
            // console.log(jsCode)
            // const jsHash = await page.evaluate(`${jsCode}`);
            // console.log(jsHash);
        }
        await request.continue({headers})
    });

    page.on('response', async (response) => {
        // if (response.url().includes('recaptcha/api2/reload')) {
        //     let body = await response.text();
        //     console.log(body);
        // }
        if (response.url().endsWith('/api.php')) {
            console.log('<< ', response.status(), response.url());
            console.log('<< Headers:\n', response.headers());
            let body = await response.text();
            console.log('<< Body:\n', body);
        }
    });

    await page.goto('https://dev.amidstyle.com/', {waitUntil: 'load'});
    await page.evaluate(async () => {
        const newProto = navigator.__proto__;
        delete newProto.webdriver;
        navigator.__proto__ = newProto;
    });
    await page.screenshot({'path': 'admidstyle.png'})

    // const getElement = async () => {
    //     let element = await page.$('body script');
    //     let value = await page.evaluate(el => el.textContent, element);
    //     console.log(value);
    //     await browser.close();
    // }

    // const resp = await page.waitForResponse(response =>
    //     response.url().endsWith('api.php'));
    //
    // console.log(await resp.text());

    // await page.waitForSelector("body script");
    //
    // let element = await page.$('body script');
    // let value = await page.evaluate(el => el.textContent, element);
    // console.log(value);
    // const n = await page.$("#data");
    // const value = await element.evaluate(el => JSON.stringify(el.textContent));
    // await page.waitForSelector('body div div#data');
    // let element = await page.$('body div > div#data');
    // let value = await element.evaluate(el => el.textContent);
    // console.log(n);

    // await browser.close();
})();
