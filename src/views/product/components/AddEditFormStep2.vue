<template>
  <a-form
    class="max-w-[80%] mx-auto mt-10 p-10 rounded"
    style="border: 1px solid rgb(234, 228, 228)"
  >
    <a-form-item
      label="Phân loại cho sản phẩm"
      :rules="[{ required: true, message: 'Vui lòng chọn!' }]"
    >
      <a-radio-group
        v-model:value="productVariantType"
        @change="changeVariantType($event.target.value)"
      >
        <a-radio value="COLOR">Chỉ Màu</a-radio>
        <a-radio value="SIZE">Chỉ Size</a-radio>
        <a-radio value="BOTH">Cả 2 loại</a-radio>
      </a-radio-group>
    </a-form-item>

    <a-form
      ref="formRef"
      :model="tblConfig"
      @finish="onFinish"
      @finishFailed="onFinishFailed"
    >
      <a-table
        :columns="tblColumns"
        :dataSource="tblConfig.data"
        bordered
        :emptyText="'Hiện chưa có phân loại nào!'"
        :pagination="false"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column?.dataIndex == 'stt'">
            {{ text }}
          </template>

          <a-form-item
            class="mb-0"
            :name="['data', record.stt - 1, 'giatri1']"
            v-else-if="column?.dataIndex == 'giatri1'"
            :rules="{
              required: true,
              message: 'Vui lòng chọn màu!',
            }"
          >
            <a-select
              v-if="productVariantType != 'BOTH'"
              show-search
              v-model:value="record.giatri1"
              :options="getBientheOpts(record.giatri1)"
              :filter-option="filterOption"
              placeholder="Chọn màu"
            >
              <a-select-option value="">Chọn Màu</a-select-option>
            </a-select>

            <a-select
              v-else
              show-search
              v-model:value="record.giatri1"
              :options="getBientheOpts(record.giatri1, record.giatri2, 'COLOR')"
              :filter-option="filterOption"
              placeholder="Chọn màu"
            >
              <a-select-option value="">Chọn Màu</a-select-option>
            </a-select>
          </a-form-item>

          <!-- size choose -->
          <a-form-item
            class="mb-0"
            :name="['data', record.stt - 1, 'giatri2']"
            v-else-if="column?.dataIndex == 'giatri2'"
            :rules="{
              required: true,
              message: 'Vui lòng chọn size!',
            }"
          >
            <a-select
              v-if="productVariantType != 'BOTH'"
              show-search
              v-model:value="record.giatri2"
              :options="getBientheOpts(record.giatri2)"
              :filter-option="filterOption"
              placeholder="Chọn size"
            >
              <a-select-option value="">Chọn Size</a-select-option>
            </a-select>

            <a-select
              v-else
              :disabled="!record.giatri1"
              show-search
              v-model:value="record.giatri2"
              :filter-option="filterOption"
              placeholder="Chọn size"
            >
              <a-select-option value="">Chọn Size</a-select-option>
              <a-select-option
                :value="item.value"
                :key="index"
                v-for="(item, index) in getAvailSizeOpts(
                  record.giatri1,
                  record.giatri2
                )"
              >
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item
            class="mb-0"
            v-else-if="column?.dataIndex === 'anh'"
            :name="['data', record.stt - 1, 'anh']"
          >
            <a-button v-if="!record.anh?.id" @click="onChooseMainImage(record)">
              Chọn ảnh
            </a-button>

            <div v-else>
              <span> {{ record?.anh?.name.slice(0, 30) }} </span> <br />
              <img v-show="false" :src="record.anh?.url" />
              <a-space>
                <EyeOutlined
                  class="hover:scale-[1.05]"
                  @click="imagePreview.setVisible(true, record.anh?.url)"
                />
                <delete-outlined
                  @click="removeMainImg(record)"
                  class="cursor-pointer hover:scale-[1.05] text-red-500 bg-white"
                />
              </a-space>
            </div>
          </a-form-item>

          <template v-if="column?.dataIndex == 'action'">
            <a-button danger @click="removePhanLoai(record)"> Xoá </a-button>
          </template>
        </template>
      </a-table>

      <a-image
        v-if="imagePreview.url"
        :width="'100%'"
        :style="{ display: 'none' }"
        :preview="{
          visible: imagePreview.visible,
          onVisibleChange: () => imagePreview.setVisible(false),
        }"
        :src="imagePreview.url"
      />

      <p class="text-center text-gray-500 mt-[15px]">
        Hiện chưa có phân loại nào!
      </p>

      <div class="flex justify-center mt-[15px] gap-[15px]">
        <a-button @click="addNewVariant">Thêm phân loại</a-button>
        <a-button type="primary" @click="resetForm()">Làm mới</a-button>
        <a-button type="primary" html-type="submit">Lưu</a-button>
      </div>
    </a-form>
  </a-form>
</template>

<script lang="ts" setup>
import fileService from "@/commons/services/FileService";
import type IFileModel from "@/commons/types/IFileModel";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import type { FormExpose } from "ant-design-vue/es/form/Form";
import { computed, onMounted, reactive, ref, watch } from "vue";
import type {
  EProductVariation,
  IProductVariation,
  IProductVariationReqType,
} from "../types/IProductType";
import ProductService from "../services/ProductService";
import { notification } from "ant-design-vue";
import type { AxiosResponse } from "axios";
import type IProductType from "../types/IProductType";

const { productOrigin } = defineProps<{
  productOrigin: IProductType | undefined;
}>();

const formRef = ref<FormExpose>();

const tblConfig = reactive<{
  cols: any[];
  data: IProductVariation[];
}>({
  cols: [],
  data: [],
});
const tblColumns = ref([]);

const resetForm = () => {
  formRef.value?.resetFields();
};

const onFinish = () => {
  if (!tblConfig.data.length) {
    notification.warn({
      message: "Vui lòng thêm phân loại!",
    });
    return;
  }
  if (!productOrigin?.id) return;
  console.log("Success:", tblConfig.data);

  ProductService.thayDoiPhanLoaiSanPham(
    productOrigin?.id as number,
    productVariantType.value
  )
    .then(() => {
      const reqs: Promise<any>[] = tblConfig.data.map(
        (item: IProductVariation) => {
          const payload: IProductVariationReqType = {
            id: item.id,
            sanPham: productOrigin?.id as number,
            bienThe1:
              productVariantType.value == "COLOR"
                ? 1
                : productVariantType.value == "BOTH"
                ? 1
                : undefined,
            bienThe2:
              productVariantType.value == "SIZE"
                ? 2
                : productVariantType.value == "BOTH"
                ? 2
                : undefined,
            bienTheGiaTri1: item.giatri1,
            bienTheGiaTri2: item.giatri2,
            anh: item?.anh?.id as number,
          };

          return ProductService.saveStep2(payload).then(
            (
              res: AxiosResponse<{
                id: number;
              }>
            ) => {
              item.id = res.data.id;
              return res.data;
            }
          );
        }
      );
      Promise.all(reqs)
        .then((res) => {
          console.log("product. data step2: ", res);
          notification.success({
            message: "Lưu thành công!",
          });
        })
        .catch((err) => {
          console.log("product. err step2: ", err);

          notification.error({
            message: "Lưu thất bại!",
          });
        });
    })
    .catch((err) => {
      console.log("product. thay doi bien the step2: ", err);
      notification.error({
        message: "Lưu thất bại!",
      });
    });
};

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};

const removePhanLoai = async (record: IProductVariation) => {
  if (record.id) {
    ProductService.xoaPhanLoai(record.id)
      .then(() => {
        notification.success({
          message: "Xoá thành công!",
        });
        tblConfig.data = tblConfig.data.filter(
          (item: IProductVariation) => item.stt != record.stt
        );
      })
      .catch((err) => {
        console.log("product. xoa phan loai err: ", err);
        notification.error({
          message: "Xoá thất bại!",
        });
      });
  } else {
    tblConfig.data = tblConfig.data.filter(
      (item: IProductVariation) => item.stt != record.stt
    );
    notification.success({
      message: "Xoá thành công!",
    });
  }
};

const onChangeProductVariantType = () => {
  console.log("variation: ", productVariantType.value);
  tblConfig.cols = [];
  let tblCol: any = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      align: "center",
    },
  ];

  if (productVariantType.value == "COLOR")
    tblCol.push({
      title: "Màu",
      dataIndex: "giatri1",
      key: "giatri1",
      align: "center",
    });
  else if (productVariantType.value == "SIZE")
    tblCol.push({
      title: "Size",
      dataIndex: "giatri2",
      key: "giatri2",
      align: "center",
    });
  else
    tblCol.push(
      {
        title: "Màu",
        dataIndex: "giatri1",
        key: "giatri1",
        align: "center",
      },
      {
        title: "Size",
        dataIndex: "giatri2",
        key: "giatri2",
        align: "center",
      }
    );
  tblCol.push(
    {
      title: "Ảnh",
      dataIndex: "anh",
      key: "anh",
      align: "center",
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      align: "center",
    }
  );
  tblColumns.value = tblCol;

  console.log("change header: ", tblColumns.value);
};
const productVariantType = ref<EProductVariation>("BOTH");

const changeVariantType = (val: EProductVariation) => {
  console.log("change val");
  productVariantType.value = val;
  onChangeProductVariantType();
  if (val == "COLOR") {
    tblConfig.data = tblConfig.data.map((item) => {
      item.giatri2 = undefined;
      return item;
    });
  } else if (val == "SIZE") {
    tblConfig.data = tblConfig.data.map((item) => {
      item.giatri1 = undefined;
      return item;
    });
  }
};

let isUploadMainImg = false;
const onChooseMainImage = (record: IProductVariation) => {
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
        record.anh = data;
        tblConfig.data = tblConfig.data.map((item: IProductVariation) => {
          if (item.stt == record.stt) item.anh = data;
          return item;
        });
      })
      .catch((err) => {
        console.log("upload failed!", err);
      })
      .finally(() => (isUploadMainImg = false));
  });
  inputTag.click();
};

const removeMainImg = (record: IProductVariation) => {
  tblConfig.data = tblConfig.data.map((item: IProductVariation) =>
    item.anh?.id == record.anh?.id ? { ...item, anh: undefined } : item
  );
};

const imagePreview = reactive<{
  url?: string;
  visible: boolean;
  setVisible: Function;
}>({
  visible: false,
  setVisible: (val: boolean, url: string | undefined = undefined) => {
    imagePreview.visible = val;
    imagePreview.url = url;
  },
});

let bienthe1OptsOriginal: any = [];
let bienthe2OptsOriginal: any = [];
const bienthe1Opts = ref([
  {
    value: 1,
    label: "red",
  },
  {
    value: 1,
    label: "blue",
  },
]);
const bienthe2Opts = ref([
  {
    value: 1,
    label: "42",
  },
  {
    value: 1,
    label: "43",
  },
]);
const filterOption = (input: string, option: any) => {
  console.log("filter opts: ", input, option);
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

const addNewVariant = () => {
  tblConfig.data = [
    ...tblConfig.data,
    {
      stt: tblConfig.data.length + 1,
      giatri1: undefined,
      giatri2: undefined,
      motaPhanLoai: "",
    },
  ];
};

const loadProductVaritation = () => {
  ProductService.getAllPhanLoaiTheoSanPham(productOrigin?.id as number)
    .then((res: AxiosResponse<IProductVariation[]>) => {
      console.log("product. tat ca phan loai: ", res.data);
      tblConfig.data = res.data.map(
        (item: IProductVariation, index: number) => ({
          ...item,
          stt: index + 1,
        })
      );
    })
    .catch((err) => {
      console.log("product. tat ca phan loai error", err);
      notification.error({
        message: "Lấy dữ liệu thất bại! Vui lòng thử lại sau.",
      });
    });
};

const fullColorOpts = new Set();
const getBientheOpts = computed(
  () =>
    (value: number, value2: number = 0, variationType: any = "") => {
      if (productVariantType.value == "COLOR") {
        const variation1List = tblConfig.data
          .map((item) => item.giatri1)
          .filter((item) => item != value);
        return bienthe1OptsOriginal.filter((item: any) =>
          !variation1List.includes(item.value) ? true : false
        );
      } else if (productVariantType.value == "SIZE") {
        const variation2List = tblConfig.data
          .map((item) => item.giatri2)
          .filter((item) => item != value);
        return bienthe2OptsOriginal.filter((item: any) =>
          !variation2List.includes(item.value) ? true : false
        );
      } else {
        if (variationType == "COLOR") {
          console.log("data both: ", value, value2);

          const variation2Size: number = bienthe2OptsOriginal.length;
          const newArr: any[] = [];
          bienthe1OptsOriginal.forEach((item: any) => {
            let checkSize: number = 0;
            // check if this color is full
            tblConfig.data.forEach((variation) => {
              if (variation.giatri1 == item.value && variation.giatri2)
                checkSize++;
            });

            // if (checkSize < variation2Size ) newArr.push(item);
            // else if(checkSize == variation2Size) newArr.push(item);
            if (checkSize == variation2Size) {
              newArr.push(item); // color has chose all
              fullColorOpts.add(item.value);
            } else if (!fullColorOpts.has(item.value)) {
              // color hasn't chose all
              console.log("item: ", item, fullColorOpts);
              newArr.push(item);
            }
          });

          console.log("new array: ", newArr);
          return newArr;
        }
      }
    }
);

const getAvailColorOpts = computed(() => (giatri1: number, giatri2: number) => {
  console.log("Color: ", giatri1, giatri2);

  const variation2Size: number = bienthe2OptsOriginal.length;
  let checkSize: number = 0;
  const newArr: any[] = [];
  bienthe1OptsOriginal.forEach((item: any) => {
    // check if this color is full
    tblConfig.data.forEach((variation) => {
      if (variation.giatri1 == item.value && variation.giatri2) checkSize++;
    });
    if (checkSize <= variation2Size) newArr.push(item);
  });
  return newArr;
});

const getAvailSizeOpts = computed(() => (giatri1: number, giatri2: number) => {
  console.log("size: ", giatri1, giatri2);
  const selectedBt2: number[] = [];
  const newArr: any[] = [];
  bienthe1OptsOriginal.forEach((item: any) => {
    // check if this color is full
    tblConfig.data.forEach((variation) => {
      let gt2 = variation.giatri2;
      if (
        variation.giatri1 == item.value &&
        giatri1 == variation.giatri1 &&
        gt2
      ) {
        selectedBt2.push(gt2);
      }
    });
  });

  console.log("selectedBt2: ", selectedBt2);
  bienthe2OptsOriginal.forEach((item: any) => {
    if (!selectedBt2.includes(item.value)) newArr.push(item);
  });
  return newArr;
});

onMounted(() => {
  ProductService.getAllBienTheGiaTri(1)
    .then((res) => {
      bienthe1OptsOriginal = res.data.map((item: any) => ({
        value: item.id,
        label: item.giaTri,
      }));
      bienthe1Opts.value = bienthe1OptsOriginal;
    })
    .catch((err) => {
      console.log("product. step2 error", err);
      notification.error({
        message: "Lấy dữ liệu thất bại! Vui lòng thử lại sau.",
      });
    });

  ProductService.getAllBienTheGiaTri(2)
    .then((res) => {
      bienthe2OptsOriginal = res.data.map((item: any) => ({
        value: item.id,
        label: item.giaTri,
      }));

      bienthe2Opts.value = bienthe2OptsOriginal;
    })
    .catch((err) => {
      console.log("product. step2 error", err);
      notification.error({
        message: "Lấy dữ liệu thất bại! Vui lòng thử lại sau.",
      });
    });
  if (productOrigin?.id) {
    loadProductVaritation();
    if (productOrigin?.loaiBienThe)
      productVariantType.value = productOrigin.loaiBienThe;
    onChangeProductVariantType();
  } else onChangeProductVariantType();
});
</script>
