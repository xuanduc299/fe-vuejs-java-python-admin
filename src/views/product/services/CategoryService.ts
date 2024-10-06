import { Axios } from "@/commons/config/axios";
import type {ICategoryRequestType} from "@/views/product/types/ICategoryType";

const baseUrl = "/danh-muc-giay";

const filter = (payload: {
    tenDanhMuc?: string,
    slug?: string,
    page: number,
    size: number,
    sort?: string
}) => Axios.get(`${baseUrl}/search`, payload);

const filterCategory = (payload: {
    tenDanhMuc?: string,
    slug?: string,
    page: number,
    size: number,
    sort?: string
}) => Axios.get(`${baseUrl}/loc-danh-muc`, payload);

const addCategory = (payload: ICategoryRequestType) => Axios.post(`${baseUrl}/add`, payload);

const updateCategory = (payload: ICategoryRequestType) => Axios.put(`${baseUrl}/update/${payload.id}`, payload);

const deleteCategory = (id: number) => Axios.del(`${baseUrl}/delete/${id}`);

const categoryService = {
    filter,
    filterCategory,
    addCategory,
    updateCategory,
    deleteCategory
};
export default categoryService;