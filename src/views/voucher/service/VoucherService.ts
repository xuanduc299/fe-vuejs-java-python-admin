import { Axios } from "@/commons/config/axios";


const basePath = "/voucher";

const findByVoucherCode = (code: any) => Axios.get(`${basePath}/find-by-code`);
const addNewVoucher = (payload: any) => Axios.post(`${basePath}`, payload);
const updateVoucher = (payload: any) => Axios.put(`${basePath}/${payload.id}`, payload);
const deleteBulkVoucher = (ids: any) => Axios.del(`${basePath}/bulk?ids=${ids}`);
const filter = (payload: any, page = 0) => Axios.post(`${basePath}/filter?page=${page}&size=30&sort=id,desc`, payload);

const VoucherService = {
    findByVoucherCode,
    addNewVoucher,
    updateVoucher,
    deleteBulkVoucher,
    filter,
}
export default VoucherService;