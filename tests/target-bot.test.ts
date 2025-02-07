import { isInStock } from '../src/target-bot';

describe('isInStock', () => {
    test('it should respond true for an in stock item', async () => {
        const result = await isInStock(
            'https://www.target.com/p/make-a-size-paper-towels-150-sheets-up-up/-/A-79762915?preselect=79727133',
        );

        expect(result).toBe(true);
    });

    test('it should respond false for an out of stock item', async () => {
        const result = await isInStock(
            'https://www.target.com/p/2025-pokemon-scarlet-violet-s8-5-prismatic-evolutions-surprise-box/-/A-94336414'
        );

        expect(result).toBe(false);
    });
});
