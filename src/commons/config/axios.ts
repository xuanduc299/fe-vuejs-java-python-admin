import { getCookie } from "@/commons/utils/Utils";
import axios, { type AxiosInstance } from "axios";

let axiosInstance: AxiosInstance | null = null;
function getInstance(): AxiosInstance {
    if (axiosInstance != null) {
        return axiosInstance
    }
    axiosInstance = axios.create({
        // baseURL: "https://shoes.orisu.lol/v1",
        baseURL: "http://localhost:8082/v1",

        // baseURL: "https://shoes.orisu.lol/v1", 
        // baseURL: "http://localhost:8082/v1",
        headers: {
        },
    });

    //hook interceptor cài ở đây
    axiosInstance.interceptors.request.use((config) => {
        const token: string | null = localStorage.getItem('loggedUser');
        if (token) 
            config.headers.set("x-api-token", token);
        return config;
    })

    axiosInstance.interceptors.response.use((response: any) => {
        return response;
    },
        async (error: { response: { data: { code: string; }, status: number }; }) => {
            // if (error.response.status === 401) {
            //     localStorage.removeItem('token');
            //     window.location.href = '/signin';
            // }

            // if (error.response.data)
            //     if (error.response.data.code === "code-4") {
            //         window.location.href =
            //             "/login?redirectTo=" + window.location.pathname;
            //     }
            return Promise.reject(error);
        }
    );

    return axiosInstance;
}

function get(endpointApiUrl: string, payload = {}, opts = {}) {
    return getInstance().get(endpointApiUrl, {
        params: payload,
        ...opts
    });
}

function post(endpointApiUrl: string, payload = {}, opts = {}) {
    return getInstance().post(endpointApiUrl, payload, opts);
}

function put(endpointApiUrl: string, payload = {}, opts = {}) {
    return getInstance().put(endpointApiUrl, payload, opts);
}
function patch(endpointApiUrl: string, payload = {}, opts = {}) {
    return getInstance().patch(endpointApiUrl, payload, opts);
}

function del(endpointApiUrl: string, opts = {}) {
    return getInstance().delete(endpointApiUrl, opts);
}

export interface IAxiosRes<T> {
    data: T
};

export interface IAxiosPageRes<T> {
    data: {
        content: T[],
        number: number,
        totalElements: number,
        numberOfElements: number,
    }
};

export const Axios = {
    axiosInstance,
    get,
    post,
    put,
    patch,
    del,
};