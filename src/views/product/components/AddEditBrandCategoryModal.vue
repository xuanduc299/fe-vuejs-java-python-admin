<template>
  <a-modal
    :open="model.visible"
    :footer="null"
    :title="model.title"
    @cancel="model.onCancel"
  >
    <a-form
      ref="formRef"
      :model="formState"
      class="mt-[25px]"
      layout="vertical"
      autocomplete="off"
    >
      <a-form-item
        label="Tên danh mục"
        name="name"
        :rules="[{ required: true, message: 'Vui lòng không bỏ trống!' }]"
      >
        <a-input v-model:value="formState.name" @change="formState.name = _removeSpecialChars(formState.name).replace(/^\s+/, '')" />
      </a-form-item>

      <div class="flex gap-[15px] justify-center">
        <a-button type="primary" html-type="button" @click="onResetValue"
          >Làm mới</a-button
        >
        <a-button type="primary" html-type="button" @click="onSubmitForm"
          >Lưu</a-button
        >
      </div>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch,inject } from "vue";
import type IAddEditBrandCategoryModalProps from "../types/IAddEditBrandCategoryModalProps";
import type { FormExpose } from "ant-design-vue/es/form/Form";
import { notification } from "ant-design-vue";

const _removeSpecialChars = inject("removeSpecialChars", (val: string) => val);

const formRef = ref<FormExpose>();
const { model } = defineProps<{
  model: IAddEditBrandCategoryModalProps;
}>();

const formState = reactive({
  name: "",
});

const onResetValue = () => {
  formRef.value?.clearValidate("name");
  formRef.value?.resetFields("name");
  formState.name = "";
};

const onSubmitForm = () => {
  if (formState.name) {
    model.onSubmitOK(formState.name);
    return;
  }
  formRef.value?.validateFields()
  .catch(() => {
    notification.warning({
      message: "Vui lòng kiểm tra lại!",
    });
  });
};

onMounted(() => {
  console.log(formRef?.value);
});

watch(model, () => {
  if (model.visible) formRef.value?.resetFields();
  if (model.value) formState.name = model.value.name;
});
</script>
