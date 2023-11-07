type IStats = {
    total: {
        snipedCards: number,
        failedSnipes: number,
        searches: number,
        coinsSpent: number,
    },
    currentSession: {
        snipedCards: number,
        failedSnipes: number,
        searches: number,
        coinsSpent: number,
    }
}

export const defaultStats: IStats = {
    total: {
        snipedCards: 0,
        failedSnipes: 0,
        searches: 0,
        coinsSpent: 0,
    },
    currentSession: {
        snipedCards: 0,
        failedSnipes: 0,
        searches: 0,
        coinsSpent: 0,
    }
}

export const stats = {
    get: (): Promise<IStats> => chrome.storage.sync.get(defaultStats) as Promise<IStats>,
    set: (value: IStats): Promise<void> => chrome.storage.sync.set(value),
};
