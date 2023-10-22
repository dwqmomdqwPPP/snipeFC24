type IStorage = {
    general: {
        loop_interval: number,
        select_last: boolean,
    },
    listitem: {
        bidprice: number,
        buynowprice: number,
    },
    autosniping: {
        wait1: number,
        wait2: number,
        bidlow: number,
        bidhigh: number,
        enabled: boolean,
    }
}

export const defaultStorage: IStorage = {
    general: {
        loop_interval: 10,
        select_last: true,
    },
    listitem: {
        bidprice: 500,
        buynowprice: 10000,
    },
    autosniping: {
        wait1: 500,
        wait2: 1000,
        bidlow: 150,
        bidhigh: 850,
        enabled: false,
    },
}

export const storage = {
    get: (): Promise<IStorage> => chrome.storage.sync.get(defaultStorage) as Promise<IStorage>,
    set: (value: IStorage): Promise<void> => chrome.storage.sync.set(value),
};
