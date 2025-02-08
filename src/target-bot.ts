import { Browser } from "puppeteer";

/**
 * Checks if an item is in stock at Target.
 *
 * @param itemUrl - The Target URL of the item.
 * @returns {Promise<boolean>} - True if the item is in stock, false otherwise.
 */
export async function isInStock(browser: Browser, itemUrl: string): Promise<boolean> {
    const page = await browser.newPage();
    
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
        page.close();
    }
}
