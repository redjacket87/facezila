export type VideoUniqalizationType = {
    data: string,
    name: string,
    count: number,
};

export type PrepareVideoOptionsType = {
    hash: string;
    name: string;
    count: number;
    data: ArrayBuffer | string;
};
