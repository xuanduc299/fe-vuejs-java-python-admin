
export default interface IReviewRes{
    id: number;
    binhLuan: string;
    soSao: number;
    nguoiTao: {
        id: number;
        username: string;
        name: string;
    };
    ngayTao: Date
}