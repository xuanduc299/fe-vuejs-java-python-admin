import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Antd, { message, notification } from "ant-design-vue";
import 'ant-design-vue/dist/reset.css';
import './assets/main.css'
import utils from './plugins/utils';


notification.config({
    duration: 2,
    maxCount: 3,
});
message.config({
    maxCount: 3,
    duration: 2
});


const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Antd)
app.use(utils);

app.mount('#app')
