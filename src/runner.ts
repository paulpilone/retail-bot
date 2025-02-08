import commandLineArgs from 'command-line-args';
import colors from 'colors';
import notifier from 'node-notifier';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import { isInStock } from "./target-bot";

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
        sound: true
    });
}

async function main() {
    // Configure Puppeteer to be stealthy
    puppeteer.use(StealthPlugin())

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
            // TODO: Instead of iterating over these can we just use a single browser with multiple pages to do it quicker?
            for (const targetItem of targetItems) {
                console.log(`Checking ${targetItem.title} at Target...`);

                const isInStockTarget = await isInStock(
                    browser,
                    targetItem.url
                );

                if (isInStockTarget) {
                    const message = `Hurry! ${targetItem.title} is in stock at Target!\n`;
                    console.log(colors.green(message));
                    if (options.notify) {
                        notify({ ...targetItem, message });
                    }
                } else {
                    console.log(colors.red(`No rush. ${targetItem.title} is still out of stock.\n`));
                }
            }

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
