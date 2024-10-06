import { Axios } from "@/commons/config/axios";
import type {IBrandRequestType} from "@/views/product/types/IBrandType";

const baseUrl = "/thuong-hieu";

const filter = (payload: {
    tenThuongHieu?: string,
    slug?: string,
    page: number,
    size: number,
    sort?: string
}) => Axios.get(`${baseUrl}/search`, payload);

const filterBrand = (payload: {
    tenThuongHieu?: string,
    slug?: string,
    page: number,
    size: number,
    sort?: string
}) => Axios.get(`${baseUrl}/loc-thuong-hieu`, payload);

const addBrand = (payload: IBrandRequestType) => Axios.post(`${baseUrl}/add`, payload);

const updateBrand = (payload: IBrandRequestType) => Axios.put(`${baseUrl}/update/${payload.id}`, payload);

const deleteBrand = (id: number) => Axios.del(`${baseUrl}/delete/${id}`);

const brandService = {
    filter,
    filterBrand,
    addBrand,
    updateBrand,
    deleteBrand
};
export default brandService;