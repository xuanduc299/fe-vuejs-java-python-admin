<template>
  <div
    class="fixed top-0 left-0 w-full h-full bg-gray-50 flex justify-center items-center"
  >
    <div class="w-[600px] mx-auto">
      <a-card>
        <h3 class="font-[700] text-center text-2xl">Đăng nhập hệ thống</h3>

        <a-form
          class="mt-[30px]"
          :model="formState"
          name="basic"
          :label-col="{ span: 4 }"
          @finish="onFinish"
          @finishFailed="onFinishFailed"
        >
          <a-form-item
            label="Tài khoản"
            name="username"
            :rules="[{ required: true, message: 'Vui lòng nhập tài khoản!' }]"
          >
            <a-input v-model:value="formState.username" />
          </a-form-item>

          <a-form-item
            label="Mật khẩu"
            name="password"
            :rules="[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]"
          >
            <a-input-password v-model:value="formState.password" />
          </a-form-item>

          <a-form-item name="rememberMe" :wrapper-col="{ offset: 4 }">
            <div class="flex justify-between items-center">
              <a-checkbox v-model:checked="formState.rememberMe"
                >Nhớ</a-checkbox
              >
              <span
                @click="onShowForgot"
                class="cursor-pointer hover:text-[#4096ff] duration-150 ease-in-out"
                >Quên mật khẩu</span
              >
            </div>
          </a-form-item>

          <div class="flex justify-center">
            <a-button type="primary" html-type="submit">Đăng nhập</a-button>
          </div>
        </a-form>
      </a-card>
    </div>

    <a-modal
      :open="isShowForgotPasswd"
      @ok="onOkForgot"
      @cancel="onCancelForgot"
      :confirm-loading="isCallingApi"
      okText="Gửi"
      cancelText="Hủy"
    >
      <template #title>
        <h3 class="text-xl">Quên mật khẩu</h3>
      </template>

      <span class="font-[500] text-base block mb-[10px] mt-[30px]">
        Nhập email của bạn:
      </span>
      <a-input v-model:value="forgotInputVal" type="email" />
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref, onMounted } from "vue";
import AuthService from "./service/AuthService";
import { notification } from "ant-design-vue";
import { useRouter } from "vue-router";

const _router = useRouter();
interface FormState {
  username: string;
  password: string;
  rememberMe: boolean;
}

const formState = reactive<FormState>({
  username: "",
  password: "",
  rememberMe: true,
});
const isLogging = ref<boolean>(false);

const onFinish = (values: any) => {
  console.log("Success:", values);
  if (isLogging.value) return;
  isLogging.value = true;
  AuthService.login(values)
    .then((res) => {
      console.log("login: ", res.data);
      if (res.data.roles[0] === "ROLE_USER") {
        notification.error({
          message: "Bạn không có quyền truy cập!",
        });
        formState.username = "";
        formState.password = "";
        formState.rememberMe = false;
        return;
      }
      localStorage.setItem("loggedUserName", res.data.userName);
      localStorage.setItem("loggedUser", res.data.accessToken);
      localStorage.setItem("loggedUserRole", res.data.roles[0]);
      notification.success({
        message: "Đăng nhập thành công!",
      });
      _router.push("/");
    })
    .catch((err) => {
      console.log(err);

      notification.error({
        message: "Tài khoản hoặc mật khẩu không chính xác!",
      });
    })
    .finally(() => (isLogging.value = false));
};

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};

const isShowForgotPasswd = ref<boolean>(false);
const isCallingApi = ref<boolean>(false);
const forgotInputVal = ref<string>("");
const onOkForgot = () => {
  if (!forgotInputVal.value)
    notification.warning({
      message: "Vui lòng nhập email!",
    });
  else {
    if (
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(forgotInputVal.value)
    ) {
      isCallingApi.value == true;
      AuthService.forgotPasswd(forgotInputVal.value)
        .then(() => {
          notification.success({
            message: "Vui lòng kiểm tra email và làm theo hướng dẫn!",
          });
          onCancelForgot();
        })
        .catch((err) => {
          console.log("err: ", err.response.data);
          let errMss = "Lỗi server!";
          if (err?.response?.data?.code) errMss = err?.response?.data?.message;
          notification.error({
            message: errMss,
          });
        })
        .finally(() => (isCallingApi.value = false));
    } else
      notification.warning({
        message: "Email không hợp lệ!",
      });
  }

  // onCancelForgot()
};

const onShowForgot = () => {
  isShowForgotPasswd.value = true;
};
const onCancelForgot = () => {
  forgotInputVal.value = "";
  isShowForgotPasswd.value = false;
};


onMounted(() => {});
</script>
