import { Axios } from "@/commons/config/axios";

const baseUrl = "/stats";

const dashboard = (startDate: string, endDate: string) => Axios.get(`${baseUrl}/dashboard?startDate=${startDate}&endDate=${endDate}`);
const getProductRevenueByTime = (startDate: string, endDate: string, page: number, size: number) => Axios.get(`${baseUrl}/doanh-thu-tung-san-pham?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`);
const getRevenueByTime = (startDate: string, endDate: string) => Axios.get(`${baseUrl}/doanh-thu-theo-thoi-gian?startDate=${startDate}&endDate=${endDate}`);
const getRevenueToDay = (startDate: string, endDate: string) => Axios.get(`${baseUrl}/doanh-thu-hom-nay?startDate=${startDate}&endDate=${endDate}`);

const statsService = {
    dashboard,
    getProductRevenueByTime,
    getRevenueByTime,
    getRevenueToDay,
};
export default statsService;