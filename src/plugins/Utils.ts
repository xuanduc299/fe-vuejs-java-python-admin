import { type App } from "vue";
import address from '../data/address_vn.json'
import { createFromIconfontCN } from '@ant-design/icons-vue';


const readFileBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

const debounce = (func: Function, delay = 500) => {
    let debounceTimer: NodeJS.Timeout;
    return function () {
        // @ts-ignore
        const context = this;
        // eslint-disable-next-line prefer-rest-params
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
};

function formatVnCurrency(value: number){
    return Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(value);
};

const color =
    [
        "orange",
        "pink",
        "green",
        "cyan",
        "blue",
        "purple",
        "#108ee9",
        "#f50",
        "#2db7f5",
        "#87d068",
        "default",
    ];

    const getProvinces = (payload: { p: number }) => {
        const { p } = payload;
        let dataResponse: any[] = [];
        let hasP = false;
    
        console.log('address: ', address)
        if (p) {
            if (!isNaN(p)) {
                hasP = true;
                dataResponse = address.filter((item) => item.PROVINCE_ID == p);
            }
        }
        if (!hasP)
            dataResponse = address.map(
                item =>
                ({
                    PROVINCE_ID: item.PROVINCE_ID,
                    PROVINCE_NAME: item.PROVINCE_NAME
                })
            );
    
        return dataResponse;
    }

function genRandomString(length: number) {
    let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let charLength = chars.length;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * charLength));
    }
    return result;
}

const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/c/font_4315596_v7yxil5b4fm.js',
});
export default {
    install: (app: App) => {
        app.provide("readFileBase64", readFileBase64);
        app.provide("debounce", debounce);
        app.provide("getRandomColor", () => color[Math.floor(Math.random() * color.length)]);
        app.provide("getProvinces", getProvinces);
        app.provide("genRandomString", genRandomString);
        app.provide("formatVnCurrency", formatVnCurrency);
        app.component("icon-font", IconFont);
        app.provide("removeSpecialChars", (val: string) => val.replace(/[^\w\sÀàÁáÂâÃãÈèÉéÊêÌìÍíÒòÓóÔôÕõÙùÚúĂăĐđĨĩŨũƠơƯưẠạẢảẤấẦầẨẩẪẫẬậẮắẰằẲẳẴẵẶặẸẹẺẻẼẽẾếỀềỂểỄễỆệỈỊịỌọỎỏỐốỒồỔổỖỗỘộỚớỜờỞởỠỡỢợỤụỦủỨứỪừỬửỮữỰựỲỳỴỵỶỷỸỹ]/g, "").replace(/\s{2,}$/, ' '));
    },
};