type IStorage = {
    general: {
        loop_interval: number,
        select_last: boolean,
    },
    listitem: {
        bidprice: number,
        buynowprice: number,
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
    }
}

export const storage = {
    get: (): Promise<IStorage> => chrome.storage.sync.get(defaultStorage) as Promise<IStorage>,
    set: (value: IStorage): Promise<void> => chrome.storage.sync.set(value),
};
