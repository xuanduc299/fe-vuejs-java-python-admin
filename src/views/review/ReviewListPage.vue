<template>
  <a-page-header class="rounded-[5px]" style="border: 1px solid rgb(235, 237, 240); margin: 20px; background: white;">
    <template #title>
      <h3 class="text-2xl">Quản lý đánh giá sản phẩm</h3>
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

    <div class="my-[20px]">
      <a-space>
        <span class="w-[80px] block">Tìm kiếm: </span>
        <a-input-search :disabled="!product" v-model:value="searchVal" @search="onSearchReview"
          placeholder="Nhập từ khóa..." class="min-w-[250px]" />
      </a-space>
    </div>

    <a-table bordered :columns="tblConfig.columns" :dataSource="tblConfig.data" :pagination="tblConfig.pagination"
      :loading="tblConfig.loading" @change="tblConfig.onPageChange">
      <template #bodyCell="{ column, text, record }">
        <template v-if="column?.dataIndex === 'action'">
          <a-space v-if="!record.isHide">
            <a-button type="primary" @click="onClickHideReview(record)">Ẩn</a-button>
          </a-space>
        </template>
        <template v-else-if="column?.dataIndex === 'nguoiTao'">
          {{ record.nguoiTao?.name }}
        </template>
        <template v-else-if="column?.dataIndex === 'isHide'">
          <a-tag v-if="record.isHide" color="gray">
            Ẩn
          </a-tag>
          <a-tag v-else color="#5cb85c">
            Hiển thị
          </a-tag>
        </template>
        <template v-else-if="column?.dataIndex === 'ngayTao'">
          {{ dayjs(record.ngayTao).format("DD/MM/YYYY HH:mm") }}
        </template>
      </template>
    </a-table>
  </a-page-header>
</template>
  
<script setup lang="ts">
import { EditOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { inject, onMounted, reactive, ref, watch } from "vue";
import dayjs from "dayjs";
import ProductService from "@/views/product/services/ProductService";
import { notification, type PaginationProps } from "ant-design-vue";
import type {
  IProductStockType,
  IProductTypeRes,
} from "@/views/product/types/IProductType";
import type { IAxiosPageRes } from "@/commons/config/axios";
import type { AxiosResponse } from "axios";
import ReviewService from "./ReviewService";
import type IReviewRes from "./IReviewType";


const $debounce: Function = inject("debounce", () => { });
const tblConfig = reactive<{
  columns: any[];
  loading: boolean;
  data: IReviewRes[];
  pagination: PaginationProps;
  onPageChange: Function;
}>({
  columns: [{
    title: "STT",
    dataIndex: "stt",
    key: "stt",
    align: "center",
  },
  {
    title: "Đánh giá",
    dataIndex: "binhLuan",
    key: "binhLuan",
    align: "center",
  },
  {
    title: "Số sao",
    dataIndex: "soSao",
    key: "soSao",
    align: "center",
  },
  {
    title: "Người đánh giá",
    dataIndex: "nguoiTao",
    key: "nguoiTao",
    align: "center",
  },
  {
    title: "Trạng thái",
    dataIndex: "isHide",
    key: "isHide",
    align: "center",
  },
  {
    title: "Ngày tạo",
    dataIndex: "ngayTao",
    key: "ngayTao",
    align: "center",
  },

  {
    title: "Hành động",
    dataIndex: "action",
    key: "action",
    align: "center",
  },
  ],
  data: [],
  loading: false,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  onPageChange: (pagination: { current: number }) => {
    tblConfig.pagination.current = pagination.current;
    loadProductReviews();
  },
});

const onClickHideReview = (record: IReviewRes) => {

  if (tblConfig.loading) return;
  tblConfig.loading = true;
  ReviewService.hideReview(record.id)
    .then(() => {
      notification.success({
        message: "Ẩn thành công!"
      })
    })
    .catch(() => {
      notification.error({
        message: "Ẩn thất bại!"
      });
    })
    .finally(() => {
      tblConfig.loading = false;
      loadProductReviews();
    });
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
  q.value = "";
  searchVal.value = "";
  tblConfig.data = [];
  tblConfig.pagination.current = 1;
};
const searchVal = ref();
const onSearchReview = $debounce(() => {
  tblConfig.pagination.current = 1;
  loadProductReviews();
}, 500);

watch(product, () => {
  if (product)
    loadProductReviews();
});

const loadProductReviews = () => {
  if (product.value) {
    if (tblConfig.loading) return;
    tblConfig.loading = true;

    ReviewService.getAllReviewTheoSanPham(
      product.value.id,
      searchVal.value || undefined,
      tblConfig.pagination.current as number - 1,
      tblConfig.pagination.pageSize as number)
      .then((res: IAxiosPageRes<IReviewRes>) => {
        console.log("product review. tat ca review: ", res.data);
        tblConfig.data = res.data.content.map(
          (item: IReviewRes, index: number) =>
          ({
            stt: index + 1,
            ...item
          })
        );
        tblConfig.pagination.total = res.data.totalElements;
      })
      .catch((err) => {
        console.log("product review. tat ca review error", err);
        notification.error({
          message: "Lấy dữ liệu thất bại! Vui lòng thử lại sau.",
        });
      })
      .finally(() => (tblConfig.loading = false));
  }
};

const isSearchingProduct = ref<boolean>(false);
const onCallApi = (searchQ: string | undefined = undefined) => {
  if (isSearchingProduct.value) return;
  isSearchingProduct.value = true;

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
    .finally(() => (isSearchingProduct.value = false));
};

onMounted(() => {
  onCallApi();
});
</script>
  