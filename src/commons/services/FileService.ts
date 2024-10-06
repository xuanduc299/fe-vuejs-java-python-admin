import { Axios } from "../config/axios";

const baseUrl = "/etc/upload";

const uploadFile = (payload: FormData, path: string = "") => Axios.post(`${baseUrl}?path=${path}`, payload);

const fileService = {
    uploadFile
};
export default fileService;