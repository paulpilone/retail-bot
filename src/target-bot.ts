import { Browser } from "puppeteer";

import { TargetItem } from './types.js';
import { waitForHTMLRendered } from "./browser-utils.js";

/**
 * Checks if an item is in stock at Target.
 *
 * @param itemUrl - The Target URL of the item.
 * @returns {Promise<boolean>} - True if the item is in stock, false otherwise.
 */
export async function isInStock(browser: Browser, item: TargetItem): Promise<boolean> {
    const page = await browser.newPage();
    page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36')
    
    // Rejecting images seems to cause Target pages to hang...
    // await page.setRequestInterception(true);
    // page.on('request', request => {
    //   if (request.resourceType() === 'image') {
    //     request.abort();
    //   } else {
    //     request.continue();
    //   }
    // });

    try {
        await page.goto(item.url, { waitUntil: 'networkidle0' });
        await waitForHTMLRendered(page);
        
        try {
            const shipButton = await page.waitForSelector(
                'button[data-test="fulfillment-cell-shipping"]', 
                { visible: true, timeout: 3000 }
            );
            await shipButton?.click();
        } catch {
            // Couldn't find the Ship button. Happens if this is a preorder page.
            console.log("Couldn't find the Ship button... maybe it's a preorder?");
        }
        
        // Check if the Add To Cart (Preorder) button is enabled.
        return await page.$eval(
            'button[id^="addToCartButtonOrTextIdFor"], button[id*=" addToCartButtonOrTextIdFor"]', 
            (btn) => {
                return !btn.hasAttribute('disabled');
            }
        );     
    } catch (error) {
        // TODO: DEBUG screenshot.
        // Take a screenshot if in debug mode.
        await page.screenshot({ path: `tests/screenshots/${item.id}.png`})

        throw error;
    } finally {
        page.close();
    }
}
