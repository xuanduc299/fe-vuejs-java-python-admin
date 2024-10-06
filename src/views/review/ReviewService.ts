import { Axios } from "@/commons/config/axios";
import type { EProductVariation, IProductTypeReq, IProductVariationReqType, IProductFilterReq } from "../types/IProductType";

const baseUrl = "/danh-gia";

const getAllReviewTheoSanPham = (id: number, q?: string, page: number, size: number) => Axios.get(`${baseUrl}/public/lay-danh-gia/${id}`, { q, page, size });
const deleteReview = (id: number) => Axios.del(`${baseUrl}/xoa/${id}`);
const hideReview = (id: number) => Axios.patch(`${baseUrl}/an/${id}`);

const ReviewService = {
    getAllReviewTheoSanPham,
    deleteReview,
    hideReview
};
export default ReviewService;