<template>
  <div class="bg-white pb-5">
    <a-steps
      class="w-full mx-auto"
      v-model:current="currentStep"
      type="navigation"
      :items="[
        {
          title: 'Điền thông tin giày',
          disabled: true,
        },
        { title: 'Phân loại giày', disabled: true },
      ]"
    ></a-steps>

    <div v-if="currentStep == 0">
      <add-edit-form-step1
        :productOrigin="productOrigin"
        @updateProduct="updateProductOrigin"
        @redirectStep="redirectStep"
      />
    </div>
    <div v-else>
      <add-edit-form-step2 :productOrigin="productOrigin" />
    </div>

    <div class="step-actions mt-10 mx-auto w-fit flex gap-[10px]">
      <a-button type="primary" v-if="currentStep > 0" @click="redirectStep(0)"
        >Quay lại</a-button
      >

      <a-button type="primary" @click="redirectStep(1)">
        {{ currentStep == 0 ? "Bước tiếp theo" : "Hoàn tất" }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import type IProductType from "../types/IProductType";
import AddEditFormStep1 from "./AddEditFormStep1.vue";
import AddEditFormStep2 from "./AddEditFormStep2.vue";
import { onMounted, ref } from "vue";
import { notification } from "ant-design-vue";
import ProductService from "../services/ProductService";
import type { AxiosResponse } from "axios";
import type { IProductTypeRes } from "../types/IProductType";

const route = useRoute();
const router = useRouter();
const currentStep = ref<number>(0);
let productOrigin: IProductType | undefined = undefined;

// productOrigin = {
//   id: 7,
//   loaiBienThe: 'BOTH'
// }
const updateProductOrigin = (val: IProductType) => {
  console.log("need update: ", val);
  productOrigin = val;
};

const redirectStep = (step: number) => {
  if (!productOrigin) {
    notification.warn({
      message: "Vui lòng lưu lại thông tin sản phẩm trước!"
    });
    return;
  }
  if (currentStep.value == 1 && step == 1) router.back();
  currentStep.value = step;
};

onMounted(() => {
  
});
</script>
