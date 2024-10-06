function setCookie(name: string, value: string, timeIn: number) {
    var expires = "";
    if (timeIn) {
        var date = new Date();
        date.setTime(date.getTime() + (timeIn * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name: string) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function eraseCookie(name: string) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function hasAnyAuths(names: string[]) {
    var auths = JSON.parse(localStorage.getItem("auths") || '[]');
    if (auths) {
        for(var i = 0; i < names.length; i++) {
            if (auths.includes(names[i])) {
                return true;
            }
        }
        return false;
    }
    return false;
}



const readFileBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

const debounce = (func: Function, delay = 500) => {
    let debounceTimer: number;
    return function () {
        // @ts-ignore
        const context = this;
        // eslint-disable-next-line prefer-rest-params
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
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

export { setCookie, getCookie, eraseCookie, hasAnyAuths, readFileBase64, debounce, color };
