export function randomUserAgent(): string {
    // Array of random user agents
    const userAgents: string[] = [
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    ];

    // Get a random index based on the length of the user agents array 
    const randomUAIndex = Math.floor(Math.random() * userAgents.length);

    // Return a random user agent using the index above
    return userAgents[randomUAIndex];
}
