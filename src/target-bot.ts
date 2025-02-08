import puppeteer from "puppeteer";

import { randomUserAgent } from "./browser-utils";

/**
 * Checks if an item is in stock at Target.
 *
 * @param itemUrl - The Target URL of the item.
 * @returns {Promise<boolean>} - True if the item is in stock, false otherwise.
 */
export async function isInStock(itemUrl: string): Promise<boolean> {
    // TODO: Get this working in headless mode.
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--window-size=1920,1080',  
        ],
        defaultViewport: null
    });
    
    const page = await browser.newPage();
    // page.setUserAgent(randomUserAgent());
    page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');

    try {
        await page.goto(itemUrl, { waitUntil: 'networkidle0' });

        const shipButton = await page.waitForSelector('button[data-test="fulfillment-cell-shipping"]', { visible: true });
        await shipButton?.click();
        
        const shipMessage = await shipButton?.$eval(
            '.fulfillment-message', 
            (span) => span.textContent?.trim() || ''
        );
        
        // Naive check. If in stock this button typically says something about when the item will arrive.
        // I'd prefer we check the Add to Cart button here but finding that isn't reliable.
        return shipMessage !== 'Not available';
    } catch (error) {
        console.error('Error checking button:', error);
        throw error;
    } finally {
        await browser.close();
    }
}
