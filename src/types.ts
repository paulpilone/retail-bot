export interface Item {
    title: string,
    listings: Listing[]
};

export enum Retailers {
  target = 'Target',
  bestBuy = 'Best Buy',
};

export interface Listing {
    retailer: Retailers.target | Retailers.bestBuy
    url: string
    id: string
}

export interface NotificationAttributes {
  title: string
  message: string
  url: string
  retailer: Retailers.target | Retailers.bestBuy
}

export enum NotificationType {
  local = 'local',
  sns = 'sns',
}
