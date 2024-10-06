<template>
  <a-modal
    :open="model.visible"
    @ok="model.onOk"
    @cancel="model.onCancel"
    title="Chọn sản phẩm"
    :footer="null"
  >
    <a-card class="w-full">
      <a-auto-complete
        v-model:value="searchProduct"
        :options="searchProductOpts"
        @search="onSearchProduct"
        @change="onChooseProduct"
        style="width: 100%"
        placeholder="Nhập tên hoặc mã sản phẩm"
      >
        <template #option="item">
          <a-space :size="20">
            <div
              class="w-[43px] h-[50px] ease-in-out duration-150 relative"
              style="border: 1px solid #d9d9d9"
            >
              <img class="w-full h-full" :src="item.anhChinh?.url" />
            </div>

            <a-space direction="vertical">
              <span class="font-semibold">
                {{ item.tieuDe }}
              </span>
              <span>#{{ item.maSP }}</span>
            </a-space>
          </a-space>
        </template>
      </a-auto-complete>

      <div
        class="p-[15px] mt-[10px] relative"
        :key="index"
        v-for="(item, index) in choseProductList"
      >
        <a-space :size="20">
          <div
            class="w-[43px] h-[50px] ease-in-out duration-150 relative"
            style="border: 1px solid #d9d9d9"
          >
            <img class="w-full h-full" :src="item?.product?.anhChinh?.url" />
          </div>

          <span class="font-semibold">
            {{ item?.product?.tieuDe }} <br />
            <span class="text-[unset]"
              >Giá: {{ _formatVnCurrency(item?.product?.giaMoi) }}</span
            >
          </span>
        </a-space>

        <div class="grid mt-[10px]">
          <div
            class="flex gap-[15px]"
            :key="index"
            v-for="(item, index) in item.variations"
          >
            <a-checkbox
              :disabled="item.disabled"
              v-model:checked="item.checked"
            ></a-checkbox>
            <span> {{ item.label }} - Còn {{ item.soLuong }} sản phẩm </span>
          </div>
        </div>
      </div>
    </a-card>

    <a-space class="w-full items-center justify-center mt-[15px]">
      <a-button type="primary" @click="resetModal"> Làm mới </a-button>

      <a-button type="primary" @click="onCompletedChooseProduct">
        Chọn
      </a-button>
    </a-space>
  </a-modal>
</template>

<script setup lang="ts">
import { DeleteOutlined } from "@ant-design/icons-vue";
import type { IAxiosPageRes } from "@/commons/config/axios";
import ProductService from "@/views/product/services/ProductService";
import type {
  EProductVariation,
  IProductTypeRes,
  IProductVariation,
} from "@/views/product/types/IProductType";
import { notification } from "ant-design-vue";
import { inject, onMounted, ref, reactive, computed, watch } from "vue";
import type IFileModel from "@/commons/types/IFileModel";
import type IBrandType from "@/views/product/types/IBrandType";
import type ICategoryType from "@/views/product/types/ICategoryType";
import type { AxiosResponse } from "axios";
import type { IAddOrderReq } from "../types/IAddOrderReq";
import OrderService from "../services/OrderService";
import { useRouter } from "vue-router";

const _formatVnCurrency = inject("formatVnCurrency", (length: number) => {
  return -1;
});
const _debounce: Function = inject("debounce", () => {});
const _getProvinces = inject("getProvinces", (p: any) => []);
const _router = useRouter();

const searchProduct = ref<string>("");
interface ProductOptType extends IProductTypeRes {
  value: number;
}
const searchProductOpts = ref<ProductOptType[]>([]);
const choseProductList = ref<
  {
    product: IProductTypeRes;
    variations: {
      variationId: number;
      label: string;
      value: string;
      soLuong: number;
      disabled: boolean;
      checked: boolean;
      quantity?: number;
    }[];
  }[]
>([]);

const onChooseProduct = (val: number) => {
  // searchProduct.value = "";
  const product = searchProductOpts.value.find((item) => item.id == val);
  console.log("product chose: ", product);
  if (product) {
    if (choseProductList.value.find((item) => item.product.id == val)) return;
    const originalList = [];
    originalList.push({
      product,
      variations: [],
    });
    choseProductList.value = originalList;

    ProductService.getAllPhanLoaiTheoSanPham(product.id)
      .then((res: AxiosResponse<IProductVariation[]>) => {
        console.log("product stock. tat ca phan loai: ", res.data);
        choseProductList.value = choseProductList.value.map((item) => {
          if (item.product.id == val)
            item.variations = res.data.map((item) => ({
              variationId: item.id,
              label: `${item.motaPhanLoai}`,
              value: item.id as any as string,
              soLuong: (item.soLuong as number) || 0,
              disabled: Number(item.soLuong || 0) == 0,
              checked: false,
            }));
          return item;
        });
      })
      .catch((err: any) => {
        console.log("product stock. tat ca phan loai error", err);
        notification.error({
          message: "Lấy dữ liệu thất bại! Vui lòng thử lại sau.",
        });
      });
  }
};

const onSearchProduct = _debounce((val: string) => {
  searchProduct.value = "";
  onCallSearchProductApi(val);
}, 500);

const onCallSearchProductApi = (val: string) => {
  ProductService.locSP(
    {
      q: val,
      tinhTrangKho: "AVAIL",
    },
    0,
    10
  )
    .then((res: IAxiosPageRes<ProductOptType>) => {
      console.log("product. list data: ", res.data);
      searchProductOpts.value = res.data.content.map((item) => ({
        ...item,
        value: item.id,
      }));
    })
    .catch((err) => {
      console.log("product. list failed: ", err);
      notification.error({
        message: "Lấy dữ liệu thất bại!",
      });
    })
    .finally(() => {});
};

export type ChooseProductForORderModalType = {
  visible: boolean;
  onOk: Function;
  onCancel: Function;
  productId?: number;
};

const { model } = defineProps<{
  model: ChooseProductForORderModalType;
}>();

const resetModal = () => {
  onCallSearchProductApi("");
  searchProduct.value = "";
  choseProductList.value = [];
};

const onCompletedChooseProduct = () => {
  console.log("on choose: ", choseProductList.value);
  if (choseProductList.value.length == 0) {
    notification.warning({
      message: "Vui lòng chọn sản phẩm!",
    });
    return;
  }

  // check if check one variation
  let hasSelected = 0;
  choseProductList.value[0].variations.forEach((item) => {
    if (item.checked) hasSelected = 1;
  });

  if (hasSelected == 0)
    notification.warning({
      message: "Vui lòng chọn 1 phân loại!",
    });
  else {
    const checkedVariations = choseProductList.value[0].variations.filter(
      (item) => item.checked
    );
    console.log("checked variation; ", checkedVariations);

    model.onOk({
      product: choseProductList.value[0].product,
      variations: checkedVariations.map((item) => ({ ...item, quantity: 1 })),
    });
  }
};

watch(model, () => {
  if (model.visible) resetModal();
});
</script>
