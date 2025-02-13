export interface Item {
    title: string,
    listings: Listing[]
};

export interface Listing {
    retailer: 'Target' | 'Best Buy'
    url: string
    id: string
}

export interface LocalNotificationAttributes {
  title: string,
  message: string,
  url: string
}

export enum Retailers {
  target = 'Target',
  bestBuy = 'Best Buy',
};

