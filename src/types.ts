export interface Item {
    title: string,
    listings: Listing[]
};

export enum Retailers {
  target = 'Target',
  bestBuy = 'Best Buy',
  walmart = 'Walmart',
};

export interface Listing {
    retailer: Retailers.target | Retailers.bestBuy | Retailers.walmart
    url: string
    id: string
}

export interface NotificationAttributes {
  title: string
  message: string
  url: string
  retailer: Retailers.target | Retailers.bestBuy | Retailers.walmart
}

export enum NotificationType {
  local = 'local',
  sns = 'sns',
}
