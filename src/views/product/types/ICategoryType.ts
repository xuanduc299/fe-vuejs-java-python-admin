
export default interface ICategoryType {
    stt: number;
    id: number;
    tenDanhMuc: string;
    slug?: string;
    soSp: number;
    ngayTao: Date;
    createdBy?: {
        name: string
    }
};

export interface ICategoryRequestType {
    id?: number;
    tenDanhMuc: string;
}

