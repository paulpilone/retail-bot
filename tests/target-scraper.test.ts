import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import { isInStock } from '../src/target-scraper';
import { Retailers } from '../src/types';
import { launchTestBrowser } from './test-utils';

puppeteer.use(StealthPlugin());

describe('target-bot', () => {
    describe('isInStock', () => {
        let browser;

        beforeAll(async () => {
            browser = launchTestBrowser();
        });

        afterAll(async () => {
            await browser.close();
        });

        test('it should respond true for an in stock item', async () => {
            // Paper towels we hope are always in stock.
            const result = await isInStock(
                browser,
                {
                    // Test paper towels hoping they're in stock
                    // title: 'Paper towels',
                    retailer: Retailers.target,
                    url: 'https://www.target.com/p/make-a-size-paper-towels-150-sheets-up-up/-/A-79762915?preselect=79727133',
                    id: '79762915',
                },
            );

            expect(result).toBe(true);
        });

        test('it should respond false for an out of stock item', async () => {
            // Pokemon PE Surprise box that's never going to be in stock.
            const result = await isInStock(
                browser,
                {
                    // PE Surprise Box
                    // title: 'PE Surprise Box',
                    retailer: Retailers.target,
                    url: 'https://www.target.com/p/2025-pokemon-scarlet-violet-s8-5-prismatic-evolutions-surprise-box/-/A-94336414',
                    id: '94336414',
                }
            );

            expect(result).toBe(false);
        });

        test('it should respond false for an out of stock preorder item', async () => {
            const result = await isInStock(
                browser,
                {
                    // title: 'Preorder Unavailable',
                    retailer: Retailers.target,
                    url: 'https://www.target.com/p/pok-233-mon-trading-card-game-scarlet-38-violet-prismatic-evolutions-booster-bundle/-/A-93954446',
                    id: '93954446'
                }
            );

            expect(result).toBe(false);
        });

        test('it should respond true for an in stock preorder item', async () => {
            const result = await isInStock(
                browser,
                {
                    // title: 'Preorder Available',
                    retailer: Retailers.target,
                    url: 'https://www.target.com/p/hello-kitty-island-adventure-deluxe-edition-nintendo-switch/-/A-94582238',
                    id: '94582238',
                },
            );

            expect(result).toBe(true);
        });

        test('it should respond false for an out of stock Find Alternative item', async () => {
            const result = await isInStock(
                browser,
                {
                    // title: 'Out of Stock Find Alternative',
                    retailer: Retailers.target,
                    url: 'https://www.target.com/p/pokemon-tcg-scarlet-violet-prismatic-evolutions-mini-tin-display-8ct-display/-/A-1001559212',
                    id: '1001559212',
                },
            );

            expect(result).toBe(false);
        });
    });
});

