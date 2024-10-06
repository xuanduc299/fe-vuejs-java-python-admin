
import { Axios } from "@/commons/config/axios";

const basePath = "/auth";


const login = (payload: {
    username: string;
    password: string;
    rememberMe: boolean;
}) => Axios.post(`${basePath}/sign-in`, payload);

const forgotPasswd = (email: string) => Axios.post(`/user/find-pw?email=${email}`);
const AuthService = {
    login,
    forgotPasswd
};
export default AuthService;

