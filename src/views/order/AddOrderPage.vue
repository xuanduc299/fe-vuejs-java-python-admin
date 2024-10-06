<template>
  <a-page-header class="rounded-[5px]" style="border: 1px solid rgb(235, 237, 240); margin: 20px; background: white;"
    @back="() => $router.go(-1)">
    <template #title>
      <h3 class="text-2xl m-0">Tạo mới đơn hàng</h3>
    </template>
    <template #tags>
      <a-button type="primary" @click="onClickSave" :loading="isSaving">Lưu
      </a-button>
    </template>
    <div class="flex gap-[15px]">
      <a-card class="w-2/3" title="Sản phẩm">
        <template #extra>
          <a-button type="primary" @click="chooseProductForOrderObj.visible = true">Chọn sản phẩm</a-button>
        </template>

        <div class="bg-gray-100 p-[15px] mt-[10px] relative" :key="index" v-for="(item, index) in choseProductList">
          <div class="absolute top-1 right-1 cursor-pointer">
            <DeleteOutlined class="text-red-400 hover:text-red-500" @click="removeProduct(item.product.id)" />
          </div>

          <a-space :size="20">
            <div class="w-[43px] h-[50px] ease-in-out duration-150 relative" style="border: 1px solid #d9d9d9">
              <img class="w-full h-full" :src="item?.product?.anhChinh?.url" />
            </div>

            <a-space direction="vertical">
              <span class="font-semibold"> {{ item?.product?.tieuDe }} </span>
              <div>
                <span>Giá: </span>
                <span>{{ _formatVnCurrency(item?.product?.giaMoi) }}</span>
              </div>
            </a-space>
          </a-space>

          <div class="flex gap-[10px] items-center justify-between w-full mt-[20px]">
            <p class="mb-0">Phân loại:</p>
            <p class="mb-0">Số lượng:</p>
          </div>
          <div class="flex justify-between mt-[10px]" :key="index" v-for="(variation, index) in item.variations">
            <div class="flex gap-[10px] items-center justify-between w-full">
              <p class="mb-0 w-[250px]">
                {{ variation.label }}
              </p>
              <a-space>
                <a-input-number size="small" class="w-[60px]" min="1" :max="variation.soLuong"
                  v-model:value="variation.quantity" />
              </a-space>
            </div>
          </div>

          <div class="flex gap-[10px] items-center justify-end w-full mt-[10px] font-semibold">
            <p>Tổng tiền:</p>
            <p>
              {{
                _formatVnCurrency(item?.product?.giaMoi *
                  item.variations.reduce((a1, a2) => a1 + a2.quantity, 0))
              }}
            </p>
          </div>

          <div v-show="item.isShowErr && hasClickSaveBtn" role="alert"
            class="css-dev-only-do-not-override-eq3tly ant-form-item-explain ant-form-item-explain-connected ant-form-show-help mt-[10px] text-red-500">
            <div class="ant-form-item-explain-error">
              Vui lòng chọn phân loại!
            </div>
          </div>
        </div>

        <div v-show="isShowVariationInfoErr" role="alert"
          class="css-dev-only-do-not-override-eq3tly ant-form-item-explain ant-form-item-explain-connected ant-form-show-help mt-[10px] text-red-500">
          <div class="ant-form-item-explain-error">Vui lòng chọn sản phẩm!</div>
        </div>
      </a-card>

      <div class="w-1/3 flex flex-col gap-[15px]">
        <a-card class="h-fit">
          <template #title>
            <div>
              <h3 class="mb-0">Thông tin khách hàng</h3>
              <a-select v-if="false" v-model:value="userSearchVal" show-search placeholder="Chọn tài khoản mua"
                style="width: 200px" @search="onSearchUser"></a-select>
            </div>
          </template>

          <a-space direction="vertical" class="w-full">
            <div class="w-full flex gap-[10px]">
              <a-space direction="vertical" class="w-[50%]">
                <span class="font-[500]"> Họ tên</span>
                <a-input v-model:value="orderInfo.hoTenNguoiNhan" @change="orderInfo.hoTenNguoiNhan = _removeSpecialChars(orderInfo.hoTenNguoiNhan).replace(/^\s+/, '')" class="w-full" placeholder="Họ tên người nhận">
                </a-input>
              </a-space>

              <a-space direction="vertical" class="w-[50%]">
                <span class="font-[500]">Số điện thoại</span>
                <a-input v-model:value="orderInfo.soDienThoaiNhanHang" :maxLength="10" @change="onTypingPhone" class="w-full"
                  placeholder="Số điện thoai">
                </a-input>
              </a-space>

            </div>

            <a-space direction="vertical" class="w-full">
              <span class="font-[500]">Ghi chú</span>
              <a-input v-model:value="orderInfo.ghiChu"  @change="orderInfo.ghiChu = _removeSpecialChars(orderInfo.ghiChu).replace(/^\s+/, '')" class="w-full" placeholder="Ghi chú">
              </a-input>
            </a-space>

            <div class="w-full flex flex-col gap-[10px] justify-between">
              <a-space direction="vertical" class="w-full">
                <label class="font-[500]">Tỉnh/TP</label>
                <a-select v-model:value="addressInfo.province" show-search placeholder="Chọn tỉnh/tp" class="w-full"
                  @change="onProvinceChange">
                  <a-select-option value="">Chọn tỉnh/tp</a-select-option>
                  <a-select-option v-for="(item, index) in provinceList" :key="index"
                :value="`${item.PROVINCE_ID}##${item.PROVINCE_NAME}`">
                {{ item.PROVINCE_NAME }}
              </a-select-option>
                </a-select>
              </a-space>

              <a-space direction="vertical" class="w-full">
                <label class="font-[500]">Quận/Huyện</label>
                <a-select v-model:value="addressInfo.district" show-search placeholder="Chọn quận/huyện"
                  style="width: 100%" @change="onDistrictChange">
                  <a-select-option value="">Chọn quận/huyện</a-select-option>
                  <a-select-option v-for="(item, index) in districtList" :key="index"
                :value="`${item.DISTRICT_ID}##${item.DISTRICT_NAME}`">
                {{ item.DISTRICT_NAME }}
              </a-select-option>
                </a-select>
              </a-space>

              <a-space direction="vertical" class="w-full">
                <label class="font-[500]">Xã/Phường</label>
                <a-select v-model:value="addressInfo.ward" show-search style="width: 100%">
                  <a-select-option value="">Chọn xã/phường</a-select-option>
                  <a-select-option v-for="(item, index) in wardList" :key="index"
                :value="`${item.WARDS_ID}##${item.WARDS_NAME}`">
                {{ item.WARDS_NAME }}
              </a-select-option>
                </a-select>
              </a-space>
            </div>

            <a-space direction="vertical" class="w-full">
              <span class="font-[500]">Số nhà</span>
              <a-input v-model:value="orderInfo.diaChiNhanHang" @change="orderInfo.diaChiNhanHang = _removeSpecialChars(orderInfo.diaChiNhanHang).replace(/^\s+/, '')" class="w-full" placeholder="Số nhà để giao hàng">
              </a-input>
            </a-space>
          </a-space>

          <div v-show="hasTypedPhone && phoneValidator()" role="alert"
            class="css-dev-only-do-not-override-eq3tly ant-form-item-explain ant-form-item-explain-connected ant-form-show-help mt-[10px] text-red-500">
            <div class="ant-form-item-explain-error" style="">
              <span>Số điện thoại không hợp lệ!</span>
            </div>
          </div>

          <div v-show="isShowCustomerInfoErr" role="alert"
            class="css-dev-only-do-not-override-eq3tly ant-form-item-explain ant-form-item-explain-connected ant-form-show-help mt-[10px] text-red-500">
            <div class="ant-form-item-explain-error" style="">
              Vui lòng điền các thông tin còn thiếu!
            </div>
          </div>
        </a-card>

        <a-card class="h-fit" title="Thông tin thanh toán">
          <a-space :size="10" direction="vertical" class="w-full">
            <a-space class="w-full justify-between ">
              <label>Tổng sản phẩm: </label>
              <span> x{{ countProduct }}</span>
            </a-space>
            <a-space class="w-full justify-between ">
              <label>Tổng tiền: </label>
              <span>{{ _formatVnCurrency(countProductPrice) }}</span>
            </a-space>

            <a-space class="w-full justify-between">
              <label>Phí ship: </label>
              <!-- <a-input disabled class="w-[120px]" v-model:value="orderInfo.shipFee" suffix="vnd" /> -->
              {{ _formatVnCurrency(orderInfo.shipFee) }}
            </a-space>

            <a-space class="w-full justify-between ">
              <label>Giảm giá: </label>
              <a-input-number class="w-[150px]" min="0" :max="countProductPrice+orderInfo.shipFee" v-model:value="orderInfo.discount" />
            </a-space>

            <a-space class="w-full justify-between">
              <label>Hình thức thanh toán: </label>
              <a-select v-model:value="orderInfo.phuongThucTT" class="min-w-[80px]"
                placeholder="Chọn hình thức thanh toán">
                <a-select-option value="COD">COD</a-select-option>
                <a-select-option value="VNPAY">VNPAY</a-select-option>
              </a-select>
            </a-space>

            <a-space class="w-full justify-between font-semibold">
              <label>Tổng Tiền thanh toán: </label>
              <span class="text-red-500"> {{ _formatVnCurrency(countTotalPrice) }}</span>
            </a-space>
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
import type { IAddOrderReq } from "./types/IAddOrderReq";
import OrderService from "./services/OrderService";
import { useRouter } from "vue-router";
import ChooseProductForORderModal, {
  type ChooseProductForORderModalType,
} from "./components/ChooseProductForORderModal.vue";

const _removeSpecialChars = inject("removeSpecialChars", (val: string) => val);
const _formatVnCurrency = inject("formatVnCurrency", (length: number) => {
  return -1;
});
const _debounce: Function = inject("debounce", () => { });
const _getProvinces = inject("getProvinces", (p: any) => []);
const _router = useRouter();

const choseProductList = ref<
  {
    product: IProductTypeRes;
    variations: {
      motaPhanLoai: string;
      quantity: number;
      variationId?: number;
      isShowErr: boolean;
      maxQuantity: number;
    }[];
  }[]
>([]);

const removeProduct = (productId: number) => {
  choseProductList.value = choseProductList.value.filter(
    (item) => item.product.id != productId
  );
};

const chooseProductForOrderObj = reactive<ChooseProductForORderModalType>({
  visible: false,
  onOk: (product: any) => {
    console.log("on ok: ", product);
    if (
      choseProductList.value.find(
        (item) => item.product.id == product.product.id
      )
    ) {
      choseProductList.value = choseProductList.value.map((item) => {
        item.variations.forEach((v) => {
          if (product.variations.find((s) => v.variationId == s.variationId)) {
            if (v.quantity != v.soLuong) v.quantity += 1;
          }
        });
        const newVariationLs = [];
        product.variations.forEach((v) => {
          if (!item.variations.find((s) => v.variationId == s.variationId)) {
            v.quantity = 1;
            newVariationLs.push(v);
          }
        });
        if (newVariationLs.length > 0)
          item.variations = [...item.variations, ...newVariationLs];

        console.log("new variation: ", item.variations);

        return item;
      });
    } else choseProductList.value = [...choseProductList.value, product];
    chooseProductForOrderObj.onCancel();
  },
  onCancel: () => {
    chooseProductForOrderObj.visible = false;
    chooseProductForOrderObj.productId = undefined;
  },
});

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
const onCallSearchUserApi = (val: string) => { };

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
  // province: "1##Thành phố Hà Nội",
  // district: "1##Quận Ba Đình",
  // ward: "1##Phường Phúc Xá",
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

const orderInfo = reactive<IAddOrderReq>({
  phanLoaidIds: [],
  diaChiNhanHang: "277 Duy Tân",
  hoTenNguoiNhan: "shiki orisu",
  soDienThoaiNhanHang: "0584843998",
  ghiChu: "",
  phuongThucTT: "COD",
  discount: 0,
  shipFee: 0,
  totalPay: 0,
});
const hasTypedPhone = ref<boolean>(false);
const onTypingPhone = () => (hasTypedPhone.value = true);
const phoneValidator = () =>
  !/(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/.test(
    orderInfo.soDienThoaiNhanHang
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
      (item) => addressInfo.district.split("##")[0] == item.DISTRICT_ID
    );
    wardList.value = district[0].wards;
    console.log("on district change: ", district[0]);
    calcShipFee();
  }
};

const isShowVariationInfoErr = computed(() => {
  let check = false;
  if (choseProductList.value.length == 0) check = true;
  return hasClickSaveBtn.value && check;
});

const isShowCustomerInfoErr = computed(() => {
  let check = false;
  if (
    !orderInfo.hoTenNguoiNhan ||
    !addressInfo.province ||
    !addressInfo.district ||
    !addressInfo.ward ||
    !orderInfo.soDienThoaiNhanHang
  )
    check = true;

  return hasClickSaveBtn.value && check;
});

const countProduct = computed<number>(() => {
  let total: number = 0;
  choseProductList.value.forEach((item) => {
    console.log('vari: ', item)
    item.variations.forEach(i => {
      total += i.quantity;
    })
  });
  console.log('total product: ', total)
  return total;
});
const countProductPrice = computed<number>(() => {
  let total: number = 0;
  choseProductList.value.forEach((item) => {
    item.variations.forEach(i => {
      total += i.quantity * item.product.giaMoi;
    })
  });
  return total;
});



const countTotalPrice = computed<number>(() => {
  let total: number = 0;
  choseProductList.value.forEach((item) => {
    item.variations.forEach(i => {
      total += i.quantity * item.product.giaMoi;
    })
  });
  total -= orderInfo.discount;
  total += orderInfo.shipFee;
  orderInfo.totalPay = total;
  return total;
});

const calcShipFee = () => {
  const DEFAULT_FEE = 6000;
  const payload = {
    SENDER_PROVINCE: 1,
    SENDER_DISTRICT: 1,
    RECEIVER_PROVINCE: Number(addressInfo.province.split("##")[0]),
    RECEIVER_DISTRICT: Number(addressInfo.district.split("##")[0]),
    PRODUCT_TYPE: "HH",
    PRODUCT_WEIGHT: countProduct.value * 400,
    PRODUCT_PRICE: 0,
    MONEY_COLLECTION: 0,
    TYPE: 1,
  };

  fetch("https://api.viettelpost.vn/api/tmdt/getPriceAll", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    redirect: "follow",
  })
    .then((response) => response.json())
    .then((result) => {
      result = result.sort((r1, r2) => r1.GIA_CUOC - r2.GIA_CUOC);
      console.log(result);

      if (result.length == 0) {
      } else {
        orderInfo.shipFee =
          Math.ceil((result[0].GIA_CUOC + DEFAULT_FEE) / 1000) * 1000;
      }
    })
    .catch((error) => {
      console.log("error", error);
      orderInfo.shipFee = 30000;
    });
};

const isSaving = ref<boolean>(false);
const onClickSave = () => {
  hasClickSaveBtn.value = true;
  if (isSaving.value) return;

  if (isShowCustomerInfoErr.value) {
    notification.warning({
      message: "Vui lòng kiểm tra lại thông tin còn thiếu!",
    });
    return;
  }
  console.log("is cus errirL ", isShowCustomerInfoErr.value);

  const payload: IAddOrderReq = {
    nguoiDat: undefined,
    diaChiNhanHang: `${orderInfo.diaChiNhanHang}__${addressInfo.ward}__${addressInfo.district}__${addressInfo.province}`,
    hoTenNguoiNhan: orderInfo.hoTenNguoiNhan,
    soDienThoaiNhanHang: orderInfo.soDienThoaiNhanHang,
    ghiChu: orderInfo.ghiChu,
    phuongThucTT: orderInfo.phuongThucTT,
    phanLoaidIds: [],
    discount: orderInfo.discount,
    shipFee: orderInfo.shipFee,
    totalPay: orderInfo.totalPay
  };

  const variationLs = [];
  choseProductList.value.forEach((item) => {
    variationLs.push(
      ...item.variations.map((j) => ({
        sanPhamBienThe: j.variationId as number,
        soLuong: j.quantity,
      }))
    );
  });

  payload.phanLoaidIds = variationLs;

  console.log("ppp", payload);

  OrderService.themMoiDonHang(payload)
    .then(() => {
      notification.success({
        message: "Thêm mới thành công!",
      });
      _router.push("/don-hang");
    })
    .catch((err: any) => {
      console.log("add new order failed: ", err);
      notification.error({
        message: "Thêm mới đơn hàng thất bại!",
      });
    });
};

onMounted(() => {
  provinceList.value = _getProvinces({
    p: undefined,
  });
  console.log("sss", _getProvinces);
});
</script>
