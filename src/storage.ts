type IStorage = {
    buynow: {
        buynow_delay: number,
        instabuy_delay: number,
    },
    listitem: {
        bidprice: number,
        buynowprice: number,
    }
}

export const defaultStorage: IStorage = {
    buynow: {
        buynow_delay: 0,
        instabuy_delay: 1000,
    },
    listitem: {
        bidprice: 500,
        buynowprice: 10000,
    }
}

export const storage = {
    get: (): Promise<IStorage> => chrome.storage.sync.get(defaultStorage) as Promise<IStorage>,
    set: (value: IStorage): Promise<void> => chrome.storage.sync.set(value),
};
