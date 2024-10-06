<template>
  <a-page-header style="border: 1px solid rgb(235, 237, 240)" @back="() => $router.go(-1)" >
    <template #title>
      <h3 class="text-2xl mb-0">Tạo đơn đổi trả sản phẩm</h3>
    </template>
    <template #tags>
      <a-space>
        <a-button type="primary" @click="onClickSave" :loading="isSaving"
          >Lưu
        </a-button>
        <a-tag :color="`green`">đổi trả sản phẩm cho đơn hàng: #778887 </a-tag>
      </a-space>
    </template>
    <div class="grid gap-[15px]">
      <a-card class="w-full" title="Chọn sản phẩm đổi trả">
        <a-space class="justify-between">
          <div>
            san pham cu
            <a-button type="primary" @click="onChooseAnotherProduct">
              Đổi</a-button
            >
          </div>
          <div>
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
              class="bg-gray-200 p-[15px] mt-[10px] relative"
              :key="index"
              v-for="(item, index) in choseProductList"
            >
              <div class="absolute top-1 right-1 cursor-pointer">
                <DeleteOutlined
                  class="text-red-400 hover:text-red-500"
                  @click="removeProduct(item.product.id)"
                />
              </div>

              <a-space :size="20">
                <div
                  class="w-[43px] h-[50px] ease-in-out duration-150 relative"
                  style="border: 1px solid #d9d9d9"
                >
                  <img
                    class="w-full h-full"
                    :src="item?.product?.anhChinh?.url"
                  />
                </div>

                <span class="font-semibold"> {{ item?.product?.tieuDe }} </span>
              </a-space>

              <div class="flex justify-between mt-[10px]">
                <a-select
                  class="min-w-[200px]"
                  v-model:value="item.variationId"
                  show-search
                  placeholder="Chọn biến thể"
                  :options="item.variations"
                ></a-select>

                <div class="flex gap-[10px] items-center">
                  <span>{{ item?.product?.giaMoi }} vnd x</span>
                  <a-input-number
                    size="small"
                    class="w-[60px]"
                    min="1"
                    max="500"
                    v-model:value="item.quantity"
                  />
                  <span>= {{ item?.product?.giaMoi * item.quantity }} vnd</span>
                </div>
              </div>

              <div
                v-show="item.isShowErr && hasClickSaveBtn"
                role="alert"
                class="css-dev-only-do-not-override-eq3tly ant-form-item-explain ant-form-item-explain-connected ant-form-show-help mt-[10px] text-red-500"
              >
                <div class="ant-form-item-explain-error">
                  Vui lòng chọn phân loại!
                </div>
              </div>
            </div>
            <div
              v-show="isShowVariationInfoErr"
              role="alert"
              class="css-dev-only-do-not-override-eq3tly ant-form-item-explain ant-form-item-explain-connected ant-form-show-help mt-[10px] text-red-500"
            >
              <div class="ant-form-item-explain-error">
                Vui lòng chọn sản phẩm!
              </div>
            </div>
          </div>
        </a-space>
      </a-card>

      <div class="w-full flex flex-col gap-[15px]">
        <a-card class="h-fit" title="Thông tin đặt hàng">
          <template #extra>
            <a-select
              v-model:value="userSearchVal"
              show-search
              placeholder="Chọn tài khoản đặt mua"
              style="width: 200px"
              @search="onSearchUser"
            ></a-select>
          </template>

          <a-space direction="vertical" class="w-full">
            <div class="w-full flex gap-[10px]">
              <a-input
                v-model:value="orderInfo.hoTenNguoiNhan"
                class="w-[50%]"
                placeholder="Họ tên người nhận"
              >
              </a-input>

              <a-input
                v-model:value="orderInfo.soDienThoaiNhanHang"
                @change="onTypingPhone"
                class="w-[50%]"
                placeholder="Số điện thoai"
              >
              </a-input>
            </div>
            <a-input
              v-model:value="orderInfo.diaChiNhanHang"
              class="w-full"
              placeholder="Số nhà"
            >
            </a-input>

            <div class="w-full flex gap-[10px] justify-between">
              <a-select
                v-model:value="addressInfo.province"
                show-search
                placeholder="Chọn tỉnh/tp"
                style="width: 31%"
                @change="onProvinceChange"
              >
                <a-select-option value="">Chọn tỉnh/tp</a-select-option>
                <a-select-option
                  v-for="(item, index) in provinceList"
                  :key="index"
                  :value="`${item.code}##${item.name}`"
                >
                  {{ item.name }}
                </a-select-option>
              </a-select>

              <a-select
                v-model:value="addressInfo.district"
                show-search
                placeholder="Chọn quận/huyện"
                style="width: 31%"
                @change="onDistrictChange"
              >
                <a-select-option value="">Chọn quận/huyện</a-select-option>
                <a-select-option
                  v-for="(item, index) in districtList"
                  :key="index"
                  :value="`${item.code}##${item.name}`"
                >
                  {{ item.name }}
                </a-select-option>
              </a-select>

              <a-select
                v-model:value="addressInfo.ward"
                show-search
                style="width: 31%"
              >
                <a-select-option value="">Chọn xã/phường</a-select-option>
                <a-select-option
                  v-for="(item, index) in wardList"
                  :key="index"
                  :value="`${item.code}##${item.name}`"
                >
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </div>
          </a-space>

          <div
            v-show="hasTypedPhone && phoneValidator()"
            role="alert"
            class="css-dev-only-do-not-override-eq3tly ant-form-item-explain ant-form-item-explain-connected ant-form-show-help mt-[10px] text-red-500"
          >
            <div class="ant-form-item-explain-error" style="">
              <span>Số điện thoại không hợp lệ!</span>
            </div>
          </div>

          <div
            v-show="isShowCustomerInfoErr"
            role="alert"
            class="css-dev-only-do-not-override-eq3tly ant-form-item-explain ant-form-item-explain-connected ant-form-show-help mt-[10px] text-red-500"
          >
            <div class="ant-form-item-explain-error" style="">
              Vui lòng điền các thông tin còn thiếu!
            </div>
          </div>
        </a-card>

        <a-card class="h-fit" title="Thông tin thanh toán">
          <a-space class="w-full justify-between">
            <label>Hình thức thanh toán: </label>
            <a-select
              v-model:value="orderInfo.phuongThucTT"
              class="min-w-[150px]"
              placeholder="Chọn hình thức thanh toán"
            >
              <a-select-option value="COD">COD</a-select-option>
              <a-select-option value="VNPAY">VNPAY</a-select-option>
            </a-select>
          </a-space>
          <a-space class="w-full justify-between pr-[20px]">
            <label>Tổng sản phẩm: </label>
            <span> x{{ countProduct }}</span>
          </a-space>

          <a-space class="w-full justify-between pr-[20px]">
            <label>Tổng tiền: </label>
            <span>{{ countTotalPrice }} vnd</span>
          </a-space>

          <a-space class="w-full justify-between pr-[20px]">
            <label>Giảm giá: </label>
            <span> 0</span>
          </a-space>

          <a-space class="w-full justify-between pr-[20px]">
            <label>Phí ship: </label>
            <span> {{ countTotalPrice > 500000 ? "30000 vnd" : 0 }}</span>
          </a-space>

          <a-space class="w-full justify-between pr-[20px] font-semibold">
            <label>Tổng Tiền thanh toán: </label>
            <span> {{ countTotalPrice }}</span>
          </a-space>
        </a-card>
      </div>
    </div>

    <ChooseProductForORderModal :model="chooseProductForOrderObj" />
  </a-page-header>
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
import ChooseProductForORderModal, {
  type ChooseProductForORderModalType,
} from "./components/ChooseProductForORderModal.vue";

const _debounce: Function = inject("debounce", () => {});
const _getProvinces = inject("getProvinces", (p: any) => []);

const searchProduct = ref();

interface ProductOptType extends IProductTypeRes {
  value: number;
}
const searchProductOpts = ref<ProductOptType[]>([]);
const choseProductList = ref<
  {
    product: IProductTypeRes;
    variations: {
      label: string;
      value: string;
      soLuong: number;
      disabled: boolean;
    }[];
    quantity: number;
    variationId?: number;
    isShowErr: boolean;
  }[]
>([]);

const onChooseProduct = (val: number) => {
  searchProduct.value = "";
  const product = searchProductOpts.value.find((item) => item.id == val);
  console.log("product chose: ", product);
  if (product) {
    if (choseProductList.value.find((item) => item.product.id == val)) return;
    const originalList = choseProductList.value;
    originalList.push({
      product,
      quantity: 1,
      variations: [],
      isShowErr: false,
    });
    choseProductList.value = originalList;

    ProductService.getAllPhanLoaiTheoSanPham(product.id)
      .then((res: AxiosResponse<IProductVariation[]>) => {
        console.log("product stock. tat ca phan loai: ", res.data);
        choseProductList.value = choseProductList.value.map((item) => {
          if (item.product.id == val)
            item.variations = res.data.map((item) => ({
              label: `${item.motaPhanLoai} x ${item.soLuong}`,
              value: item.id as any as string,
              soLuong: (item.soLuong as number) || 0,
              disabled: Number(item.soLuong || 0) == 0,
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
const removeProduct = (productId: number) => {
  choseProductList.value = choseProductList.value.filter(
    (item) => item.product.id != productId
  );
};

const onSearchProduct = _debounce((val: string) => {
  onCallSearchProductApi(val);
}, 500);

const onCallSearchProductApi = (val: string) => {
  ProductService.locSP(
    {
      q: val,
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

// for user order

const userSearchVal = ref();
const userOptions = ref<
  {
    label: string;
    value: string;
    userInfo: object;
  }[]
>([]);
const onSearchUser = _debounce((val: string) => {
  userSearchVal.value = "";
  console.log("search user: ", val);
  onCallSearchUserApi(val);
}, 500);
const onCallSearchUserApi = (val: string) => {};

// end for user order

const hasClickSaveBtn = ref<boolean>(false);
const addressInfo = reactive<{
  province: string;
  district: string;
  ward: string;
}>({
  province: "",
  district: "",
  ward: "",
});

type AddressProvinceType = {
  code: string;
  name: string;
  district?: AddressDistrictType[];
};
type AddressDistrictType = {
  code: string;
  name: string;
  wards?: AddressWardType[];
};
type AddressWardType = {
  code: string;
  name: string;
};

const provinceList = ref<AddressProvinceType[]>([]);
const districtList = ref<AddressDistrictType[]>([]);
const wardList = ref<AddressWardType[]>([]);

const orderInfo = ref<IAddOrderReq>({
  phanLoaidIds: [],
  diaChiNhanHang: "",
  hoTenNguoiNhan: "",
  soDienThoaiNhanHang: "",
  ghiChu: "",
  phuongThucTT: "COD",
});
const hasTypedPhone = ref<boolean>(false);
const onTypingPhone = () => (hasTypedPhone.value = true);
const phoneValidator = () =>
  !/(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/.test(
    orderInfo.value.soDienThoaiNhanHang
  );

const onProvinceChange = () => {
  districtList.value = [];
  wardList.value = [];
  addressInfo.district = "";
  addressInfo.ward = "";
  if (addressInfo.province.split("##").length == 2) {
    const province = _getProvinces({
      p: addressInfo.province.split("##")[0],
    });
    // @ts-ignore
    districtList.value = province[0].districts;
    console.log("on province change: ", province[0]);
  }
};
const onDistrictChange = () => {
  wardList.value = [];
  addressInfo.ward = "";
  if (addressInfo.district.split("##").length == 2) {
    const district: AddressDistrictType[] = districtList.value.filter(
      (item) => addressInfo.district.split("##")[0] == item.code
    );
    wardList.value = district[0].wards;
    console.log("on district change: ", district[0]);
  }
};

const isShowVariationInfoErr = computed(() => {
  let check = false;
  if (choseProductList.value.length == 0) check = true;
  return hasClickSaveBtn.value && check;
});

watch(hasClickSaveBtn, () => {
  if (hasClickSaveBtn.value)
    choseProductList.value.map((item) => {
      if (item.quantity == 0) item.isShowErr = true;
    });
});

const isShowCustomerInfoErr = computed(() => {
  let check = false;
  if (
    !orderInfo.value.hoTenNguoiNhan ||
    !addressInfo.province ||
    !addressInfo.district ||
    !addressInfo.ward ||
    !orderInfo.value.soDienThoaiNhanHang
  )
    check = true;

  return hasClickSaveBtn.value && check;
});

const countProduct = computed<number>(() => {
  let total: number = 0;
  choseProductList.value.forEach((item) => {
    total += item.quantity;
  });
  return total;
});
const countTotalPrice = computed<number>(() => {
  let total: number = 0;
  choseProductList.value.forEach((item) => {
    total += item.quantity * item.product.giaMoi;
  });
  return total;
});

const isSaving = ref<boolean>(false);
const onClickSave = () => {
  if (isSaving.value) return;
  hasClickSaveBtn.value = true;
};

const chooseProductForOrderObj = reactive<ChooseProductForORderModalType>({
  visible: true,
  onOk: () => {},
  onCancel: () => {
    chooseProductForOrderObj.visible = false;
    chooseProductForOrderObj.productId = undefined;
  },
});

const onChooseAnotherProduct = (product: IProductTypeRes) => {
  chooseProductForOrderObj.visible = true;
};

onMounted(() => {
  onCallSearchProductApi("");
  provinceList.value = _getProvinces({
    p: undefined,
  });
  console.log("sss", _getProvinces);
});
</script>
