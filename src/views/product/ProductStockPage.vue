<template>
  <a-page-header class="rounded-[5px]" style="border: 1px solid rgb(235, 237, 240); margin: 20px; background: white;">
    <template #title>
      <h3 class="text-2xl">Quản lý số lượng sản phẩm</h3>
    </template>

    <section class="mb-[10px]">
      <a-select v-model:value="q" class="w-full" show-search placeholder="Nhập tên | mã sản phẩm" allowClear
        :show-arrow="false" :filter-option="false" @search="onSearchProduct" @change="onChooseProduct">
        <a-select-option :key="item.id" :value="item.id" v-for="item in searchOpts">
          <a-space :size="20">
            <div v-if="item.anhChinh" class="w-[43px] h-[50px] ease-in-out duration-150 relative"
              style="border: 1px solid #d9d9d9">
              <img class="w-full h-full" :src="item.anhChinh?.url" />
            </div>

            <div class="grid">
              <span class="text-xl font-semibold">
                {{ item.tieuDe }}
              </span>
              <span class="text-[13px]"> Mã: {{ item.maSP }}</span>
            </div>
          </a-space>
        </a-select-option>
      </a-select>

      <a-descriptions v-if="product" class="mt-[10px] bg-white p-2 rounded" bordered title="Thông tin sản phẩm">
        <a-descriptions-item>
          <div class="flex justify-center">
            <a-image :width="100" :src="product.anhChinh.url" />
          </div>
        </a-descriptions-item>
        <a-descriptions-item>
          <template #label>
            <h3>Tên sản phẩm</h3>
            <h3>Mã</h3>
          </template>
          <p>{{ product.tieuDe }}</p>
          <p>{{ product.maSP }}</p>
        </a-descriptions-item>
      </a-descriptions>
    </section>

    <h3>Danh sách phân loại:</h3>
    <a-table bordered :columns="tblConfig.columns" :dataSource="tblConfig.data" :pagination="false"
      :loading="tblConfig.loading" @change="tblConfig.onPageChange">
      <template #bodyCell="{ column, text, record }">
        <template v-if="column?.dataIndex === 'anh'">
          <a-image :width="100" :src="record?.anh" />
        </template>

        <template v-else-if="column?.dataIndex === 'remainQuantity'">
          <div class="w-[200px] mx-auto">
            <a-space v-if="record.isEdit">
              <a-input-number v-model:value="record.remainQuantity" min="0" max="99999" />
              <a-button type="primary" @click="saveChangedVal(record)">Lưu</a-button>
              <a-button danger @click="cancelEditStock(record)">Hủy</a-button>
            </a-space>

            <a-space v-if="!record.isEdit">
              <span>{{ text || 0 }}</span>
              <a-button type="primary" @click="showEdit(record)">Sửa</a-button>
            </a-space>
          </div>
        </template>
      </template>
    </a-table>
  </a-page-header>
</template>

<script setup lang="ts">
import { EditOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { inject, onMounted, reactive, ref, watch } from "vue";
import dayjs from "dayjs";
import ProductService from "./services/ProductService";
import { notification, type PaginationProps } from "ant-design-vue";
import type {
  IProductStockType,
  IProductTypeRes,
  IProductVariation,
} from "./types/IProductType";
import type { IAxiosPageRes } from "@/commons/config/axios";
import type IProductType from "./types/IProductType";
import type { AxiosResponse } from "axios";


const $debounce: Function = inject("debounce", () => { });
const tblConfig = reactive<{
  columns: any[];
  loading: boolean;
  data: IProductStockType[];
  pagination: PaginationProps;
  onPageChange: Function;
}>({
  columns: [],
  data: [],
  loading: false,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  onPageChange: (pagination: { current: number }) => {
    tblConfig.pagination.current = pagination.current;
    onCallApi();
  },
});

const saveChangedVal = (record: IProductStockType) => {
  if (tblConfig.loading) return;
  tblConfig.loading = true;
  ProductService.luuSoLuongChoPhanLoaiSp(record.id, record.remainQuantity)
    .then(() => {
      tblConfig.data = tblConfig.data.map((item) => {
        if (item.id == record.id) item.isEdit = false;
        return item;
      });
      notification.success({
        message: "Lưu  thànhh công!",
      });
    })
    .catch((err) => {
      console.log("product stock. save quantity error: ", err);
      notification.error({
        message: "Lưu  thất bại!",
      });
    })
    .finally(() => (tblConfig.loading = false));
};

const cancelEditStock = (record: IProductStockType) => {
  tblConfig.data = tblConfig.data.map((item) => {
    if (item.id == record.id) item.isEdit = false;
    return item;
  });
};

const showEdit = (record: IProductStockType) => {
  tblConfig.data = tblConfig.data.map((item) => {
    if (item.id == record.id) item.isEdit = true;
    return item;
  });
};

const onRegenerateTblCol = () => {
  let tblCol: any = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      align: "center",
    },
    {
      title: "Ảnh",
      dataIndex: "anh",
      key: "anh",
      align: "center",
      width: "100",
    },
  ];

  if (product.value?.loaiBienThe == "COLOR")
    tblCol.push({
      title: "Màu",
      dataIndex: "giatri1",
      key: "giatri1",
      align: "center",
    });
  else if (product.value?.loaiBienThe == "SIZE")
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
  tblCol.push({
    title: "Số lượng còn lại",
    dataIndex: "remainQuantity",
    key: "remainQuantity",
    align: "center",
  });

  tblConfig.columns = tblCol;
};

const product = ref<IProductTypeRes | undefined>();
const q = ref<string | undefined>();
const searchOpts = ref<IProductTypeRes[]>([]);
const onSearchProduct = $debounce((val: string) => {
  onCallApi(val);
}, 500);
const onChooseProduct = (val: string) => {
  console.log("product stock: ", val);

  product.value = searchOpts.value.find((item) => item.id == Number(val));
  onRegenerateTblCol();
  q.value = "";
};

watch(product, () => {
  if (product) {
    console.log("ookss");
    loadProductVaritation();
  }
});

const loadProductVaritation = () => {
  if (product.value) {
    if (tblConfig.loading) return;
    tblConfig.loading = true;
    ProductService.getAllPhanLoaiTheoSanPham(product.value.id)
      .then((res: AxiosResponse<IProductVariation[]>) => {
        console.log("product stock. tat ca phan loai: ", res.data);
        tblConfig.data = res.data.map(
          (item: IProductVariation, index: number) =>
          ({
            stt: index + 1,
            id: item.id,
            isEdit: false,
            remainQuantity: item.soLuong,
            giatri1: item.giaTriObj1?.giaTri,
            giatri2: item.giaTriObj2?.giaTri,
            anh: item.anh?.url,
          } as IProductStockType)
        );
      })
      .catch((err) => {
        console.log("product stock. tat ca phan loai error", err);
        notification.error({
          message: "Lấy dữ liệu thất bại! Vui lòng thử lại sau.",
        });
      })
      .finally(() => (tblConfig.loading = false));
  }
};
const onCallApi = (searchQ: string | undefined = undefined) => {
  if (tblConfig.loading) return;
  tblConfig.loading = true;

  ProductService.locSP(
    {
      q: searchQ,
    },
    0,
    10
  )
    .then((res: IAxiosPageRes<IProductTypeRes>) => {
      console.log("product. list data: ", res.data);
      searchOpts.value = res.data.content;
    })
    .catch((err) => {
      console.log("product. list failed: ", err);
      notification.error({
        message: "Lấy dữ liệu thất bại!",
      });
    })
    .finally(() => (tblConfig.loading = false));
};

onMounted(() => {
  onCallApi();
  onRegenerateTblCol();
});
</script>
