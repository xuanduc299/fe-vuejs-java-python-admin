<template>
  <a-page-header class="rounded-[5px]" style="border: 1px solid rgb(235, 237, 240); margin: 20px;; height: 100%; background: white;">
    <template #title>
      <h3 class="text-2xl">Quản lý sản phẩm</h3>
    </template>

    <template #tags>
      <router-link to="/danh-sach-san-pham/them-moi">
        <a-button> Thêm mới </a-button>
      </router-link>
    </template>

    <div class="mb-[30px] w-full bg-white rounded p-[20px] grid justify-center">
      <a-space class="w-fit mx-auto" align="baseline">
        <a-space direction="vertical" class="w-1/2">
          <a-space class="w-full">
            <span class="w-[130px] block font-[600]">Danh mục: </span>

            <a-select v-model:value="filterModel.dmGiay" placeholder="Chọn danh mục" class="min-w-[300px]"
              :options="categoryOpts">
            </a-select>
          </a-space>

          <a-space>
            <span class="w-[130px] block font-[600]">Thương hiệu: </span>
            <a-select v-model:value="filterModel.thuongHieu" placeholder="Chọn thương hiệu" class="min-w-[300px]"
              :options="brandOpts">
            </a-select>
          </a-space>

          <a-space>
            <span class="w-[130px] block font-[600]">Tìm kiếm: </span>
            <a-input v-model:value="filterModel.q" placeholder="Từ khóa..." class="min-w-[150px]">
            </a-input>

            <a-select class="w-[140px]" v-model:value="filterModel.searchKey">
              <a-select-option value="tieuDe">Tên sản phẩm</a-select-option>
              <a-select-option value="maSP">Mã sản phẩm</a-select-option>
            </a-select>
          </a-space>
        </a-space>

        <a-space direction="vertical" class="w-1/2">
          <a-space>
            <span class="w-[130px] block font-[600]">Trạng thái hiển thị:
            </span>
            <a-select v-model:value="filterModel.hienThiWeb" placeholder="Chọn trạng thái hiển thị" class="min-w-[300px]">
              <a-select-option :value="true">Hiển thị trên web</a-select-option>
              <a-select-option :value="false">Ẩn</a-select-option>
            </a-select>
          </a-space>

          <a-space>
            <span class="w-[130px] block font-[600]">Thời gian tạo: </span>
            <a-range-picker v-model:value="filterModel.createdAtRange" class="w-[300px]" />
          </a-space>

          <a-space>
            <span class="w-[130px] block font-[600]">Tình trạng kho: </span>
            <a-select v-model:value="filterModel.tinhTrangKho" placeholder="Chọn trạng thái hiển thị"
              class="min-w-[300px]">
              <a-select-option :value="'AVAIL'">Còn</a-select-option>
              <a-select-option value="EMPTY">Tạm hết</a-select-option>
            </a-select>
          </a-space>
        </a-space>
      </a-space>

      <a-space align="center" class="w-full justify-center mt-[20px]">
        <a-button type="primary" @click="resetFilter">Làm mới</a-button>
        <a-button type="primary" @click="onCallApi">Lọc</a-button>
      </a-space>
    </div>

    <a-table bordered :columns="tblConfig.columns" :dataSource="tblConfig.data" :pagination="tblConfig.pagination"
      :loading="tblConfig.loading" @change="tblConfig.onPageChange" :scroll="{ x: 1300 }">
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'anhChinh'">
          <img :src="text.url" class="h-[110px] w-[103px] mx-auto" />
        </template>

        <template v-else-if="column.dataIndex === 'price'">
          <span class="text-red-500">
            {{ _formatVnCurrency(record.giaMoi) }}
          </span>
          <br />
          <span v-if="record.giaCu && record.giaCu > 0">
            <del>{{ _formatVnCurrency(record.giaCu) }}</del>
          </span>
        </template>

        <template v-else-if="column.dataIndex === 'nguoiTao'">
          {{ text?.name }}
        </template>
        <template v-else-if="column.dataIndex === 'tongSp'">
          <span v-if="Number(text || 0) == 0"> Tạm hết </span>
          <span v-else> {{ text }} sản phẩm </span>
        </template>

        <template v-else-if="column.dataIndex === 'dmGiay'">
          {{ text.tenDanhMuc }}
        </template>

        <template v-else-if="column.dataIndex === 'thuongHieu'">
          {{ text.tenThuongHieu }}
        </template>

        <template v-else-if="column.dataIndex === 'ngayTao'">
          {{ dayjs(text).format("HH:MM:ss DD/MM/YYYY") }}
        </template>

        <template v-else-if="column.dataIndex === 'action'">
          <div class="flex gap-[10px] items-center justify-center">
            <router-link :to="`/danh-sach-san-pham/sua/${record.id}`">
              <a-tooltip>
                <template #title> Sửa sản phẩm </template>
                <edit-outlined />
              </a-tooltip>
            </router-link>

            <a-popconfirm title="Bạn chắc chắn?" @confirm="onClickDelelteProduct(record.id)">
              <a-tooltip>
                <template #title> Xóa sản phẩm </template>
                <delete-outlined class="text-red-500" />
              </a-tooltip>
            </a-popconfirm>
          </div>
        </template>
      </template>
    </a-table>
  </a-page-header>
</template>

<script setup lang="ts">
import { EditOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { onMounted, reactive, ref, inject } from "vue";
import dayjs, { Dayjs } from "dayjs";
import ProductService from "./services/ProductService";
import { notification, type PaginationProps } from "ant-design-vue";
import type { IProductFilterReq, IProductTypeRes } from "./types/IProductType";
import type { AxiosResponse } from "axios";
import type { IAxiosPageRes, IAxiosRes } from "@/commons/config/axios";
import CategoryService from "./services/CategoryService";
import BrandService from "./services/BrandService";
import type ICategoryType from "./types/ICategoryType";
import type IBrandType from "./types/IBrandType";

const _formatVnCurrency = inject("formatVnCurrency", (p: number) => 0);

const tblConfig = reactive<{
  columns: any[];
  loading: boolean;
  data: IProductTypeRes[];
  pagination: PaginationProps;
  onPageChange: Function;
}>({
  columns: [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      align: "center",
      width: '70px'
    },
    {
      title: "Ảnh",
      dataIndex: "anhChinh",
      key: "anhChinh",
      align: "center",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tieuDe",
      key: "tieuDe",
      align: "center",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      align: "center",
    },
    {
      title: "Số lượng trong kho",
      dataIndex: "tongSp",
      key: "tongSp",
      align: "center",
    },
    {
      title: "Danh mục",
      dataIndex: "dmGiay",
      key: "dmGiay",
      align: "center",
    },
    {
      title: "Thương hiệu",
      dataIndex: "thuongHieu",
      key: "thuongHieu",
      align: "center",
    },
    {
      title: "Ngày tạo",
      dataIndex: "ngayTao",
      key: "ngayTao",
      align: "center",
    },
    {
      title: "Người tạo",
      dataIndex: "nguoiTao",
      key: "nguoiTao",
      align: "center",
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      width: 100,
      fixed: "right",
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
    onCallApi();
  },
});

const onClickDelelteProduct = (id: number) => {
  if (tblConfig.loading) return;
  tblConfig.loading = true;
  ProductService.xoaSP(id)
    .then(() => {
      notification.success({
        message: "Xoá thành công!"
      });
      tblConfig.data = tblConfig.data.filter(i => i.id != id).map((i, index) => ({ ...i, stt: index + 1 }));
    })
    .catch(() => {
      notification.error({
        message: "Xoá thất bại!"
      });
    })
    .finally(() => tblConfig.loading = false)
}
const onCallApi = () => {
  if (tblConfig.loading) return;
  tblConfig.loading = true;

  const payloadFilter: IProductFilterReq = {
    dmGiay: filterModel.dmGiay,
    thuongHieu: filterModel.thuongHieu,
    hienThiWeb: filterModel.hienThiWeb
      ? Boolean(filterModel.hienThiWeb)
      : undefined,
    tinhTrangKho: filterModel.tinhTrangKho,
  };
  if (filterModel.createdAtRange) {
    payloadFilter.createdAtRange = filterModel?.createdAtRange?.map(
      (item: Dayjs) => item.format("YYYY-MM-DDT00:00:00")
    );
  }
  if (filterModel.q) {
    // @ts-ignore
    payloadFilter[`${filterModel.searchKey}`] = filterModel.q;
  }
  console.log("payload filter: ", payloadFilter);

  ProductService.locSP(
    payloadFilter,
    (tblConfig.pagination.current as number) - 1,
    tblConfig.pagination.pageSize
  )
    .then((res: IAxiosPageRes<IProductTypeRes>) => {
      tblConfig.data = res.data.content.map(
        (item: IProductTypeRes, index: number) => ({
          ...item,
          stt: index + 1,
        })
      );
      tblConfig.pagination.total = res.data.totalElements;
      console.log("product. list data: ", res.data);
    })
    .catch((err) => {
      console.log("product. list failed: ", err);
      notification.error({
        message: "Lấy dữ liệu thất bại!",
      });
    })
    .finally(() => (tblConfig.loading = false));
};

const brandOpts = ref();
const categoryOpts = ref();
const filterModel = reactive<{
  tieuDe?: string;
  maSp?: string;
  dmGiay?: number;
  thuongHieu?: number;
  hienThiWeb?: string;
  tinhTrangKho?: "AVAIL" | "EMPTY";
  createdAtRange?: any[];
  q?: string;
  searchKey?: string;
}>({
  searchKey: "tieuDe",
});
const resetFilter = () => {
  filterModel.tieuDe = undefined;
  filterModel.maSp = undefined;
  filterModel.dmGiay = undefined;
  filterModel.thuongHieu = undefined;
  filterModel.hienThiWeb = undefined;
  filterModel.createdAtRange = undefined;
  filterModel.q = undefined;
  filterModel.searchKey = "tieuDe";
  onCallApi();
};

onMounted(() => {
  onCallApi();

  CategoryService.filter({
    page: 0,
    size: 999,
  })
    .then(({ data }: IAxiosRes<ICategoryType[]>) => {
      console.log("product. category data: ", data);
      categoryOpts.value = data.map((item) => ({
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
      brandOpts.value = data.content.map((item) => ({
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
});
</script>
