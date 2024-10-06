<template>
  <a-form
    ref="formRef"
    class="max-w-[80%] mx-auto mt-10 p-10 rounded"
    style="border: 1px solid rgb(234, 228, 228)"
    :model="formState"
    :wrapper-col="{ span: 16 }"
    :label-col="{ span: 5 }"
    autocomplete="off"
    @finish="onFinish"
    @finishFailed="onFinishFailed"
  >
    <a-form-item
      label="Tên sản phẩm"
      name="name"
      :rules="[{ required: true, message: 'Vui lòng không bỏ trống!' }]"
    >
      <a-input
        v-model:value="formState.name"
        @change="
          formState.name = _removeSpecialChars(
            formState.name.replace(/^\s+/, '')
          )
        "
        :maxlength="255"
      />
    </a-form-item>

    <a-form-item
      label="Mã sản phẩm"
      name="productNumber"
      :rules="[{ required: true, message: 'Vui lòng không bỏ trống!' }]"
    >
      <a-input
        v-model:value.trim="formState.productNumber"
        @change="(e: any) => formState.productNumber =  e.target.value.replace(/[^a-zA-Z0-9@]/g, '').toUpperCase()"
        :maxlength="15"
      />
    </a-form-item>

    <a-form-item
      label="Danh mục"
      name="category"
      :rules="[{ required: true, message: 'Vui lòng chọn danh mục!' }]"
    >
      <a-select
        v-model:value="formState.category"
        placeholder="Chọn danh mục"
        show-search
        :options="categoryOptions"
        :filter-option="filterOption"
      >
        <a-select-option
          :key="item.value"
          :value="item.value"
          v-for="item in categoryOptions"
        >
          {{ item.label }}
        </a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item
      label="Thương hiệu"
      name="brand"
      :rules="[{ required: true, message: 'Vui lòng chọn thương hiệu!' }]"
    >
      <a-select
        v-model:value="formState.brand"
        placeholder="Chọn thương hiệu"
        show-search
        :options="brandOptions"
        :filter-option="filterOption"
      >
      </a-select>
    </a-form-item>

    <a-form-item label="Trạng thái hiển thị" name="isWebDisplay">
      <a-select
        placeholder="Chọn trạng thái"
        show-search
        v-model:value="formState.isWebDisplay"
      >
        <a-select-option :value="true">Hiển thị trên web</a-select-option>
        <a-select-option :value="false">Ẩn đi</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item
      label="Giá hiện tại"
      name="newPrice"
      :rules="[{ required: true, validator: newPriceValidator }]"
    >
      <a-input-number
        v-model:value="formState.newPrice"
        :max="100000000"
        class="w-full"
      >
        <template #addonAfter> vnd </template>
      </a-input-number>
    </a-form-item>

    <a-form-item v-if="formState.id != 0" label="Giá cũ" name="oldPrice">
      <a-input-number
        @change="onChangeOldPrice"
        v-model:value="formState.oldPrice"
        :max="100000000"
        class="w-full"
      >
        <template #addonAfter> vnd </template>
      </a-input-number>
    </a-form-item>

    <a-form-item
      label="Ảnh chính"
      name="mainImage"
      :rules="[{ required: true, message: 'Vui lòng chọn ảnh!' }]"
    >
      <div
        v-if="!productImages.mainImage"
        @click="onChooseMainImage"
        class="w-[103px] h-[110px] flex justify-center items-center hover:scale-[1.05] ease-in-out duration-150 cursor-pointer"
        style="border: 1px solid #d9d9d9"
      >
        <plus-outlined class="text-[20px]" />
      </div>

      <div
        v-else
        class="w-[103px] h-[110px] ease-in-out duration-150 relative"
        style="border: 1px solid #d9d9d9"
      >
        <delete-outlined
          @click="removeMainImg"
          class="right-0 top-0 absolute cursor-pointer hover:scale-[1.05] text-red-500 bg-white p-[3px]"
        />
        <img class="w-full h-full" :src="productImages.mainImage.url" />
      </div>
    </a-form-item>

    <a-form-item
      label="Ảnh phụ(tối đa 6 ảnh)"
      name="bgImages"
      :rules="[{ required: true, message: 'Vui lòng chọn ảnh!' }]"
    >
      <div class="flex flex-wrap gap-[10px]">
        <div
          v-key="index"
          v-for="(file, index) in productImages.bgImages"
          class="w-[103px] h-[110px] ease-in-out duration-150 relative"
          style="border: 1px solid #d9d9d9"
        >
          <delete-outlined
            @click="removeBgImg(file.id)"
            class="right-0 top-0 absolute cursor-pointer hover:scale-[1.05] text-red-500 bg-white p-[3px]"
          />
          <img class="w-full h-full" :src="file.url" />
        </div>

        <div
          v-if="productImages.bgImages.length < 6"
          @click="onChooseBgImage"
          class="w-[103px] h-[110px] flex justify-center items-center hover:scale-[1.05] ease-in-out duration-150 cursor-pointer"
          style="border: 1px solid #d9d9d9"
        >
          <plus-outlined class="text-[20px]" />
        </div>
      </div>
    </a-form-item>

    <a-form-item label="Giới tính của giày">
      <a-radio-group v-model:value="formState.sex">
        <a-radio value="MALE">Giày cho nam</a-radio>
        <a-radio value="FEMALE">Giày cho nữ</a-radio>
      </a-radio-group>
    </a-form-item>

    <a-form-item
      label="Chất liệu"
      name="chatLieu"
      :rules="[{ required: true, message: 'Vui lòng không bỏ trống!' }]"
    >
      <a-input
        v-model:value="formState.chatLieu"
        @change="
          formState.chatLieu = _removeSpecialChars(
            formState.chatLieu.replace(/^\s+/, '')
          )
        "
        :maxlength="255"
      ></a-input>
    </a-form-item>

    <a-form-item
      label="Trọng lượng"
      name="trongLuong"
      :rules="[{ required: true, message: 'Vui lòng không bỏ trống!' }]"
    >
      <a-input
        type="number"
        v-model:value="formState.trongLuong"
        :minLength="3"
        :maxlength="4"
        class="w-full"
      >
        <template #suffix> Gam </template>
      </a-input>
    </a-form-item>
    <a-form-item label="Công nghệ" name="congNghe">
      <a-input
        v-model:value="formState.congNghe"
        @change="
          formState.congNghe = _removeSpecialChars(
            formState.congNghe.replace(/^\s+/, '')
          )
        "
        :maxlength="255"
      ></a-input>
    </a-form-item>

    <a-form-item
      label="Tính năng nổi bật"
      name="tinhNang"
      :rules="[{ required: true, message: 'Vui lòng không bỏ trống!' }]"
    >
      <a-input
        v-model:value="formState.tinhNang"
        @change="
          formState.tinhNang = _removeSpecialChars(
            formState.tinhNang.replace(/^\s+/, '')
          )
        "
        :maxlength="255"
      ></a-input>
    </a-form-item>

    <a-form-item
      label="Nơi sản xuất"
      name="noiSanXuat"
      :rules="[{ required: true, message: 'Vui lòng không bỏ trống!' }]"
    >
      <a-input
        v-model:value="formState.noiSanXuat"
        @change="
          formState.noiSanXuat = _removeSpecialChars(
            formState.noiSanXuat.replace(/^\s+/, '')
          )
        "
        :maxlength="255"
      ></a-input>
    </a-form-item>

    <a-form-item
      label="Mô tả"
      name="desc"
      :rules="[{ required: true, message: 'Vui lòng không bỏ trống!' }]"
    >
      <a-textarea
        v-model:value="formState.desc"
        @change="
          formState.desc = _removeSpecialChars(
            formState.desc.replace(/^\s+/, '')
          )
        "
        :maxlength="255"
      ></a-textarea>
    </a-form-item>

    <div class="flex justify-center gap-[15px]">
      <a-button type="primary" html-type="button" @click="resetFormStep1"
        >Làm mới</a-button
      >
      <a-button type="primary" html-type="submit">Lưu</a-button>
    </div>
  </a-form>
</template>

<script lang="ts" setup>
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { onMounted, reactive, ref, inject } from "vue";
import type IFileModel from "@/commons/types/IFileModel";
import fileService from "@/commons/services/FileService";
import CategoryService from "@/views/product/services/CategoryService";
import BrandService from "@/views/product/services/BrandService";
import { notification } from "ant-design-vue";
import type IProductType from "../types/IProductType";
import type { FormExpose, FormInstance } from "ant-design-vue/es/form/Form";
import type { IAxiosPageRes, IAxiosRes } from "@/commons/config/axios";
import type ICategoryType from "../types/ICategoryType";
import type IBrandType from "../types/IBrandType";
import type { IProductTypeReq, IProductTypeRes } from "../types/IProductType";
import ProductService from "../services/ProductService";
import { useRoute } from "vue-router";
import type { AxiosResponse } from "axios";

const _removeSpecialChars = inject("removeSpecialChars", (val: string) => val);

const route = useRoute();
const emits = defineEmits(["updateProduct", "redirectStep"]);

const { productOrigin } = defineProps<{
  productOrigin: IProductType | undefined;
}>();
const formRef = ref<FormInstance>();

const formState = reactive<IProductType>({
  id: 0,
  name: "",
  productNumber: "",
  isWebDisplay: true,
  sex: "MALE",
  newPrice: 10000,
  oldPrice: 0,
  desc: "",
  category: undefined,
  brand: undefined,
  mainImage: undefined,
  bgImages: undefined,
  chatLieu: "",
  trongLuong: "",
  congNghe: "",
  tinhNang: "",
  noiSanXuat: "",
});

// custom validate
const newPriceValidator = (rule: any, value: string, callback: Function) => {
  console.log("validating");
  if (!value) return callback("Vui lòng không bỏ trống!");
  if (productOrigin && formState.oldPrice > 0)
    if (Number(formState.newPrice) >= Number(formState.oldPrice))
      return callback("Giá mới phải nhỏ hơn giá cũ!");
  return callback();
};

const onChangeOldPrice = () => {
  formRef.value?.validateFields("newPrice");
};

const resetFormStep1 = () => {
  formRef.value?.resetFields();
  productImages.bgImages = [];
  productImages.mainImage = undefined;
};

// for selectbox
const filterOption = (input: string, option: any) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

const categoryOptions = ref([]);

const brandOptions = ref([]);

// end selectbox

// for images
const productImages = reactive<{
  mainImage?: IFileModel;
  bgImages: IFileModel[];
}>({
  mainImage: undefined,
  bgImages: [],
});

let isUploadMainImg = false;
const onChooseMainImage = () => {
  if (isUploadMainImg) return;

  const inputTag = document.createElement("input");
  inputTag.accept = "image/png,image/jpg,image/jpeg";
  inputTag.type = "file";
  inputTag.multiple = false;
  inputTag.addEventListener("change", ({ target }: any) => {
    const { files } = target;

    const formData = new FormData();
    formData.append("file", files[0]);

    isUploadMainImg = true;
    fileService
      .uploadFile(formData)
      .then(({ data }: { data: IFileModel }) => {
        console.log("upload ok; ", data);
        productImages.mainImage = data;
        formState.mainImage = productImages.mainImage.id;
      })
      .catch((err) => {
        console.log("upload failed!", err);
      })
      .finally(() => (isUploadMainImg = false));
  });
  inputTag.click();
};
const removeMainImg = () => {
  productImages.mainImage = undefined;
  formState.mainImage = undefined;
};

let isUploadBgImg = false;
const onChooseBgImage = () => {
  if (productImages.bgImages.length === 6)
    notification.warn({
      message: "Tối đa chỉ được tảii lên 6 ảnhh!",
    });
  if (isUploadBgImg || productImages.bgImages.length === 6) return;

  const inputTag = document.createElement("input");
  inputTag.accept = "image/png,image/jpg,image/jpeg";
  inputTag.type = "file";
  inputTag.multiple = true;
  inputTag.addEventListener("change", ({ target }: any) => {
    const { files } = target;

    if (productImages.bgImages.length + files.length > 6) {
      notification.warn({
        message: "Tối đa chỉ được tải lên 6 ảnhh!",
      });
      return;
    }

    isUploadBgImg = true;

    Promise.all(
      [...files].map((file) => {
        const formData = new FormData();
        formData.append("file", file);
        return fileService.uploadFile(formData).then((res) => res.data);
      })
    )
      .then((res: IFileModel[]) => {
        productImages.bgImages = [...productImages.bgImages, ...res];
        formState.bgImages = productImages.bgImages.map((item) => item.id);
      })
      .catch((err) => {
        console.log("upload failed!", err);
      })
      .finally(() => (isUploadBgImg = false));
  });
  inputTag.click();
};
const removeBgImg = (fileId: number) => {
  productImages.bgImages = productImages.bgImages.filter(
    (file) => file.id != fileId
  );
  formState.bgImages = productImages.bgImages.map((item) => item.id);
};

const onFinish = (values: any) => {
  console.log("Success:", values);

  const payload: IProductTypeReq = {
    id: formState.id == 0 ? undefined : formState.id,
    tieuDe: formState.name,
    maSP: formState.productNumber,
    dmGiay: {
      id: formState.category as number,
    },
    thuongHieu: {
      id: formState.brand as number,
    },
    hienThiWeb: formState.isWebDisplay,
    gioiTinh: formState.sex,
    giaMoi: formState.newPrice,
    giaCu: formState.oldPrice,
    anhChinh: formState.mainImage as number,
    anhPhu: formState.bgImages as number[],
    moTa: formState.desc,
    chatLieu: formState.chatLieu,
    trongLuong: formState.trongLuong,
    congNghe: formState.congNghe,
    tinhNang: formState.tinhNang,
    noiSanXuat: formState.noiSanXuat,
  };

  console.log("product payload: ", payload);
  ProductService.addStep1(payload)
    .then((res: AxiosResponse<IProductTypeRes>) => {
      console.log("product. step1 data: ", res.data);
      notification.success({
        message: "Lưu thành công!",
      });
      formState.id = res.data.id;
      emits("updateProduct", {
        id: res.data.id,
        loaiBienThe: res.data.loaiBienThe,
      });

      emits("redirectStep", 1);
    })
    .catch((err) => {
      console.log("product. step1 err: ", err);
      notification.error({
        message: "Lưu sản phẩm thất bại!",
      });
    });
};

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};

onMounted(() => {
  console.log("form ref: ");

  CategoryService.filterCategory({
    page: 0,
    size: 999,
  })
    .then(({ data }: IAxiosRes<ICategoryType[]>) => {
      console.log("product. category data: ", data);
      categoryOptions.value = data.content.map((item) => ({
        label: item.tenDanhMuc,
        value: item.id,
      }));
    })
    .catch((err) => {
      console.log("product. get category failed: ", err);
      notification.error({
        message: "Lấy dữ liệu danh mục thất bại! Vui lòng thử lại.",
      });
    });

  BrandService.filterBrand({
    page: 0,
    size: 999,
  })
    .then(({ data }: IAxiosPageRes<IBrandType>) => {
      console.log("product. brand data: ", data);
      brandOptions.value = data.content.map((item) => ({
        label: item.tenThuongHieu,
        value: item.id,
      }));
    })
    .catch((err) => {
      console.log("product. get brand failed: ", err);
      notification.error({
        message: "Lấy dữ liệu thương hiệu thất bại! Vui lòng thử lại.",
      });
    });

  console.log(route);
  if (route.params.id) {
    console.log("product. edit id: ", route.params.id);
    ProductService.getChiTiet(Number(route.params.id))
      .then((res: AxiosResponse<IProductTypeRes>) => {
        console.log("product. get detail: ", res.data);

        const pss: IProductType = {
          id: res.data.id,
          name: res.data.tieuDe,
          productNumber: res.data.maSP,
          category: res.data.dmGiay.id,
          brand: res.data.thuongHieu.id,
          sex: res.data.gioiTinh,
          newPrice: res.data.giaMoi,
          oldPrice: res.data.giaCu,
          mainImage: res.data.anhChinh.id,
          bgImages: res.data.anhPhu.map((i) => i.id),
          desc: res.data.moTa,
          isWebDisplay: res.data.hienThiWeb || true,
          loaiBienThe: res.data.loaiBienThe,
          chatLieu: res.data.chatLieu,
          trongLuong: res.data.trongLuong,
          congNghe: res.data.congNghe,
          tinhNang: res.data.tinhNang,
          noiSanXuat: res.data.noiSanXuat,
        };
        productImages.bgImages = res.data.anhPhu;
        productImages.mainImage = res.data.anhChinh;

        emits("updateProduct", {
          id: res.data.id,
          loaiBienThe: res.data.loaiBienThe,
        });
        Object.keys(pss).forEach((k: string) => {
          // @ts-ignore
          formState[k] = pss[k];
        });
      })
      .catch((err) => {
        console.log("product. get detail error: ", err);
        notification.error({
          message: "Lấy dữ liệu thất bại! Vui lòng thử lại.",
        });
      });
  }
});
</script>
