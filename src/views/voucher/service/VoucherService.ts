import { Axios } from "@/commons/config/axios";


const basePath = "/voucher";

const findByVoucherCode = code => Axios.get(`${basePath}/find-by-code`);
const addNewVoucher = payload => Axios.post(`${basePath}`, payload);
const updateVoucher = payload => Axios.put(`${basePath}/${payload.id}`, payload);
const deleteBulkVoucher = ids => Axios.del(`${basePath}/bulk?ids=${ids}`);
const filter = (payload, page = 0) => Axios.post(`${basePath}/filter?page=${page}&size=30&sort=id,desc`, payload);

const VoucherService = {
    findByVoucherCode,
    addNewVoucher,
    updateVoucher,
    deleteBulkVoucher,
    filter,
}
export default VoucherService;