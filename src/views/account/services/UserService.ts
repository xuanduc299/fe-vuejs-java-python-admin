import { Axios } from '@/commons/config/axios';


const baseUrl = "/user";

const filterUser = (payload: {
    userId?: string;
    name?: string;
    phone?: string;
    email?: string;
    page: number;
    size: number;
}) => Axios.get(`${baseUrl}/list/user`, payload);

const filterStaff = (payload: {
    userId?: string;
    name?: string;
    phone?: string;
    email?: string;
    page: number;
    size: number;
}) => Axios.get(`${baseUrl}/list/staff`, payload);

const updateUser = (id: number, payload: {
    name: string;
    phone: string;
    email?: string;
    password?: string;
    sex?: string;
    birthDate?: string;
    role?: string;
}) => Axios.put(`${baseUrl}/${id}`, payload);

const addUser  = (payload: {
    name: string;
    phone: string;
    email?: string;
    password?: string;
    sex?: string;
    birthDate?: string
}) => Axios.post(`${baseUrl}/add-new`, payload);

const deleteUser = (id: number) => Axios.del(`${baseUrl}/${id}`);
const UserService = {
    filterStaff,
    filterUser,
    addUser,
    updateUser,
    deleteUser
};
export default UserService;