import { isInStock } from "./target-bot";

interface TargetItem {
    title: string,
    url: string,
    id: string
};

// Time to wait before scraping again.
const refereshTimeout = 15000;

// TODO: Read this from a file instead.
const targetItems: TargetItem[] = [
    {
        // PE Surprise Box
        title: 'PE SurprisTe Box',
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
    }
];

async function main() {
    while(true) {
        // TODO: Instead of iterating over these can we just use a single browser with multiple pages to do it quicker?
        for (const targetItem of targetItems) {
            console.log(`Checking ${targetItem.title} at Target...`);

            const isInStockTarget = await isInStock(
                targetItem.url
            );

            console.log(`In stock? ${isInStockTarget}`);
        }

        await new Promise(resolve => setTimeout(resolve, refereshTimeout));
    }
};

main();
