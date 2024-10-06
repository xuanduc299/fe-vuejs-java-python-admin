<template>
  <a-modal :open="model.visible" :closable="false"
    :title="(model.type === 'add' ? 'Thêm mới' : 'Cập nhật') + ' người dùng'" @cancel="model.cancel" @ok="model.ok"
    okText="Lưu" cancelText="Hủy" width="800px">
    <a-form ref="formRef" :model="model.userModel" autocomplete="off" label-align="left" :label-col="{ span: 9 }">
      <div class="lg:flex gap-[20px]">
        <div class="lg:w-1/2">
          <a-form-item label="Tên đăng nhập" name="userId"
            :rules="[{ required: true, message: 'Vui lòng không được bỏ trống!' }]">
            <a-input placeholder="..."  :disabled="model.type === 'edit'" 
            v-model:value.trim="model.userModel.userId"
            @change="model.userModel.userId = model.userModel.userId.replace(/[^a-zA-Z0-9@]/g, '').toLowerCase()" />
          </a-form-item>

          <a-form-item label="Họ và tên" name="name"
            :rules="[{ required: true, message: 'Vui lòng không được bỏ trống!' }]">
            <a-input placeholder="..." v-model:value="model.userModel.name"
              @change="model.userModel.name = _removeSpecialChars(model.userModel.name.replace(/^\s+/, ''))" />
          </a-form-item>

          <a-form-item label="Mật khẩu" name="password"
            :rules="model.type === 'add' ? [{ required: true, message: 'Vui lòng không được bỏ trống!' }, { min: 6, message: 'Mật khẩu cần phải tối thiểu 6 ký tự!' }] : [model.userModel.password ? { min: 6, message: 'Mật khẩu cần phải tối thiểu 6 ký tự!' } : {}]">
            <a-input-password placeholder="..." v-model:value="model.userModel.password" @change="model.userModel.password = model.userModel?.password?.toLowerCase()" />
          </a-form-item>

          <a-form-item label="Số điện thoại" name="phone"
            :rules="[{ required: true, validator: handleValidateTypePhone }]">
            <a-input placeholder="..." v-model:value="model.userModel.phone"
              @change="model.userModel.phone = model.userModel.phone.replace(/[^0-9@]/g, '')" :maxLength="10" />
          </a-form-item>
        </div>

        <div class="lg:w-1/2">
          <a-form-item label="Email" name="email" :rules="[{ validator: handleValidateTypeEmail }]">
            <a-input placeholder="..." v-model:value.trim="model.userModel.email" :maxLength="255"
              @change="model.userModel.email = model.userModel.email.replace(/^\s+/, '')" />
          </a-form-item>

          <a-form-item label="Ngày sinh" name="birthDate">
            <a-date-picker v-model:value="model.userModel.birthDate" :showToday="false"
              :disabledDate="(val: any) => val.year() > 2013" mode="date" />
          </a-form-item>

          <a-form-item name="sex">
            <template #label>
              <span class="text-sm font-semibold text-[#685f78]">Giới tính</span>
            </template>
            <a-radio-group v-model:value="model.userModel.sex">
              <a-radio value="MALE">Nam</a-radio>
              <a-radio value="FEMALE">Nữ</a-radio>
            </a-radio-group>
          </a-form-item>

        </div>
      </div>
    </a-form>

  </a-modal>
</template>
  
<script setup lang="ts">
import { onMounted, reactive, ref, inject } from "vue";

const _removeSpecialChars = inject("removeSpecialChars", (val: string) => val);


const formRef = ref();
const { model } = defineProps({
  model: {
    type: Object,
    required: true
  }
});

const handleValidateTypePhone = (rule, value) => {
  if (!value) return Promise.reject('Vui lòng không bỏ trống!');
  if (value && !/((09|03|07|08|05)+([0-9]{8})\b)/g.test(value)) {
    return Promise.reject('Số điện thoại không đúng!');
  }
  return Promise.resolve();
};

const handleValidateTypeEmail = (rule, value) => {
  if (value && !/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/g.test(value)) {
    return Promise.reject('Email không hợp lệ!');
  }
  return Promise.resolve();
};

onMounted(() => {

  console.log('form ref: ', model)
  model.ready(formRef);

})

</script>