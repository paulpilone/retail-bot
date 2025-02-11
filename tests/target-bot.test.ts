import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import { isInStock } from '../src/target-bot';

puppeteer.use(StealthPlugin());

describe('target-bot', () => {
    describe('isInStock', () => {
        let browser;
        
        beforeAll(async () => {
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    `--no-sandbox`,
                    `--disable-setuid-sandbox`,
                    '--window-size=1920,1080',  
                    '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                ],
                defaultViewport: null,
            });
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
                    title: 'Paper towels',
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
                    title: 'PE Surprise Box',
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
                    title: 'Preorder Unavailable',
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
                    title: 'Preorder Available',
                    url: 'https://www.target.com/p/hello-kitty-island-adventure-deluxe-edition-nintendo-switch/-/A-94582238',
                    id: '94582238',
                },
            );
    
            expect(result).toBe(true);
        })
    });
});

