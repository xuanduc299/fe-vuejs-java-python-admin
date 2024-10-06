import type {EPhuongThucTT} from './IDonHangFilterReq';

export interface IAddOrderReq {
    phanLoaidIds: {
        sanPhamBienThe: number;
        soLuong: number;
    }[];
    nguoiDat?: number;
    diaChiNhanHang: string;
    hoTenNguoiNhan: string;
    soDienThoaiNhanHang: string;
    ghiChu: string;
    phuongThucTT: EPhuongThucTT;
    discount: number;
    shipFee: number;
    totalPay: number;
}