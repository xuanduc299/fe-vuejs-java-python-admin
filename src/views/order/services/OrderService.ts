import { Axios } from "@/commons/config/axios";
import type { ETrangThaiDonHang, IDonHangFilterReq } from "../types/IDonHangFilterReq";
import type { IAddOrderReq } from "../types/IAddOrderReq";

const baseUrl = "/don-hang";

const filter = (payload: IDonHangFilterReq, page: number = 0, size: number = 10) => Axios.post(`${baseUrl}/filter?page=${page}&size=${size}`, payload);

const chiTietOrder = (id: number) => Axios.get(`${baseUrl}/chi-tiet/${id}`);
const capNhatTrangThai = (id: number, trangThai: ETrangThaiDonHang) => Axios.patch(`${baseUrl}/cap-nhat-trang-thai/${id}?trangThai=${trangThai}`);

const themMoiDonHang = (payload: IAddOrderReq) => Axios.post(`${baseUrl}`, payload);
const capNhatDonHang = (id: number, payload: IAddOrderReq) => Axios.put(`${baseUrl}/cap-nhat/${id}`, payload);

const OrderService = {
    filter,
    chiTietOrder,
    capNhatTrangThai,
    themMoiDonHang,
    capNhatDonHang,
}
export default OrderService;