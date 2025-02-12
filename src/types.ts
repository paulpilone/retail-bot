export interface Item {
    title: string,
    listings: Listing[]
};

export interface Listing {
    retailer: 'target' | 'bestbuy'
    url: string
    id: string
}

export interface LocalNotificationAttributes {
  title: string,
  message: string,
  url: string
}

