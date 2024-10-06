import type { EPhuongThucTT, ETrangThaiDonHang } from './IDonHangFilterReq'

export default interface IOrderDetailRes {
  id: number;
  maDonHang: string;
  tongSp: number;
  phuongThucTT: EPhuongThucTT;
  tongTienGiamGia: number;
  tongGiaTien: number;
  tongTienSp: number;
  phiShip: number;
  tongGiaCuoiCung: number;
  nguoiMuaId: number;
  trangThai: ETrangThaiDonHang;
  ngayTao: string;
  ghiChu: string;
  diaChi: DiaChiDto;
  chiTietDonHang: IChiTietDonHangDto[]
};

export interface IChiTietDonHangDto {
  id: number;
  sanPham: {
    id: number;
    tieuDe: string;
    anhChinh: {
      url: string
    }
  };
  soLuong: number;
  giaTien: number;
  motaPhanLoai: string
}

export interface DiaChiDto {
  id: number;
  tenNguoiNhan: string;
  sdt: string;
  email?: string;
  diaChi: string;
};

type IOrderStatusList = {
  label: string;
  value: ETrangThaiDonHang,
  order: number
}
export const ORDER_STATUS_LIST: IOrderStatusList[] = [
  { label: "Chờ xác nhận", value: "WAITING_CONFIRM", order: 2 },
  { label: "VNPAY đã thanh toán", value: "VNPAY_PAID", order: 3 },
  { label: "Đang giao hàng", value: "DELIVERING", order: 4 },
  { label: "Hoàn Tất", value: "COMPLETED", order: 5 },
  { label: "(Hoàn trả) Không nghe máy", value: "PHONE_RETURNED", order: 6 },
  { label: "(Hoàn trả) Sản phẩm sai", value: "WRONG_SP_RETURNED", order: 7 },
  { label: "Hủy bỏ", value: "CANCELLED", order: 8 },
];
export function getOrderStatusByValueAndOrderGreater(value: ETrangThaiDonHang): IOrderStatusList[] {
  const foundStatus = ORDER_STATUS_LIST.find((status) => status.value === value);
  return foundStatus ? ORDER_STATUS_LIST.filter(i => i.order > foundStatus.order) : [];
}

export const getOrderStatusColor = (val: string) => {
  switch (val) {
    case "WAITING_CONFIRM":
      return "gray";
    case "VNPAY_PAID":
      return "#54A0FF";
    case "DELIVERING":
      return "#5bc0de";
    case "PHONE_RETURNED":
      return "#B33771";
    case "WRONG_SP_RETURNED":
      return "#B33771";
    case "COMPLETED":
      return "#5cb85c";
    case "CANCELLED":
      return "red";
    default:
      return "gray";
  }
};
export function getLabelOrderStatusByValue(value: ETrangThaiDonHang) {
  const foundStatus = ORDER_STATUS_LIST.find((status) => status.value === value);
  return foundStatus ? foundStatus.label : "Không tìm thấy";
}