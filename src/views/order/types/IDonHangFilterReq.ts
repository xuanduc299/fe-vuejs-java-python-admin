

export interface IDonHangFilterReq{
    tenNguoiNhan?: string;
    maDonHang?: string;
    tenSanPham?: string;
    trangThai?: ETrangThaiDonHang;
    phuongThucTT?: EPhuongThucTT;
    startOrderDate?: string;
    endOrderDate?: string;
}

export type ETrangThaiDonHang = 'ALL'| 'WAITING_CONFIRM'| 'VNPAY_PAID'| 'DELIVERING'| 'COMPLETED'| 'PHONE_RETURNED'| 'WRONG_SP_RETURNED' | 'CANCELLED';
export type EPhuongThucTT = 'COD'| 'VNPAY';
