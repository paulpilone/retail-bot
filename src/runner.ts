import commandLineArgs from 'command-line-args';
import colors from 'colors';
import notifier from 'node-notifier';
import pMap from 'p-map';
import { Browser } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import { isInStock } from "./target-bot.js";

const optionDefinitions = [
    { name: 'notify', alias: 'n', type: Boolean, defaultOption: false },
];
const options = commandLineArgs(optionDefinitions)

interface TargetItem {
    title: string,
    url: string,
    id: string
};

// TODO: Read this from a file instead.
const targetItems: TargetItem[] = [
    {
        // PE Surprise Box
        title: 'PE Surprise Box',
        url: 'https://www.target.com/p/2025-pokemon-scarlet-violet-s8-5-prismatic-evolutions-surprise-box/-/A-94336414',
        id: '94336414',
    },
    {
        // PE ETB
        title: 'PE ETB',
        url: 'https://www.target.com/p/2024-pok-scarlet-violet-s8-5-elite-trainer-box/-/A-93954435',
        id: '93954435',
    },
    {
        // PE Binder Collection
        title: 'PE Binder Collection',
        url: 'https://www.target.com/p/2025-pokemon-prismatic-evolutions-binder-collection/-/A-94300066',
        id: '94300066',
    },
    // {
    //     // Test paper towels hoping they're in stock
    //     title: 'Paper towels',
    //     url: 'https://www.target.com/p/make-a-size-paper-towels-150-sheets-up-up/-/A-79762915?preselect=79727133',
    //     id: '79762915',
    // },
];

interface NotificationAttributes {
    title: string,
    message: string,
    url: string
}

/**
 * 
 * @param attrs 
 */
function notify(attrs: NotificationAttributes) {
    notifier.notify({
        title: `${attrs.title}`,
        message: attrs.message,
        open: attrs.url,
        sound: true,
        timeout: 30
    });
}

async function checkInStockTarget(
    browser: Browser, 
    item: TargetItem
): Promise<boolean> {
    console.log(`Checking ${item.title} at Target...`);
    return await isInStock(
        browser,
        item.url
    );
}

async function main() {
    // Configure Puppeteer to be stealthy
    // @ts-expect-error There are some weird import things going on with puppeteer extra and ESM
    puppeteer.use(StealthPlugin())

    // @ts-expect-error There are some weird import things going on with puppeteer extra and ESM
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--window-size=1920,1080',  
            '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        ],
        defaultViewport: null,
    });

    try {
        while(true) {
            const targetResults: boolean[] = await pMap(
                targetItems,
                async (item: TargetItem) => {
                    return await checkInStockTarget(browser, item)
                },
                { concurrency: 3 }
            );
            
            targetResults.forEach((isInStock, idx) => {
                const item = targetItems[idx];
                if (isInStock) {
                    const message = `Hurry! ${item.title} is in stock at Target!`;
                    console.log(colors.green(message));
                    if (options.notify) {
                        notify({ ...item, message });
                    }
                } else {
                    console.log(colors.red(`No rush. ${item.title} is still out of stock.`));
                }
            });
        
            await new Promise(resolve => setTimeout(
                resolve, 
                Math.floor(Math.random() * (15000 - 8000 + 1)) + 8000
            ));
        }
    } catch (err) {
        console.log(`Got an error: ${err}`);
    } finally {
        await browser.close();
    }
};

main();
