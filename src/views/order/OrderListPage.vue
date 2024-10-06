<template>
  <a-page-header class="rounded-[5px]" style="border: 1px solid rgb(235, 237, 240); margin: 20px; background: white;">
    <template #title>
      <h3 class="text-2xl mb-0">Danh sách đơn hàng</h3>
    </template>

    <template #tags>
      <a-button> 
        <router-link to="/don-hang/them-moi">Thêm mới</router-link>
      </a-button>
    </template>

    <a-space direction="vertical" class="bg-white mb-[15px] w-full px-[10px]">
      <a-segmented :value="orderFilter.status" @change="onchangeOrderStatus" :options="orderStatuses">
        <template #label="{ label }">
          <div>{{ label }}</div>
        </template>
      </a-segmented>

      <div class="flex mb-[20px] items-center gap-[20px] justify-start mt-[15px]">
        <div class="flex items-center">
          <a-input v-model:value="orderFilter.searchVal" placeholder="Từ khóa..." />
          <a-select v-model:value="orderFilter.searchKey" style="width: 150px">
            <a-select-option value="maDonHang">Mã đơn hàng</a-select-option>
            <a-select-option value="tenNguoiNhan">Người nhận</a-select-option>
            <a-select-option value="tenSanPham">Tên sản phẩm</a-select-option>
          </a-select>
        </div>

        <div class="flex gap-[10px] items-center">
          <span>HT Thanh Toán: </span>
          <a-select v-model:value="orderFilter.phuongThucTT" style="width: 150px" placeholder="Tất cả">
            <a-select-option value="COD">COD</a-select-option>
            <a-select-option value="VNPAY">VNPAY</a-select-option>
          </a-select>
        </div>

        <div class="flex gap-[10px] items-center">
          <span>Thời gian đặt: </span>
          <a-range-picker v-model:value="orderFilter.orderDate" :locale="locale"/>
        </div>
      </div>

      <div class="w-fit mx-auto flex gap-[15px] mb-[25px]">
        <a-button type="primary" @click="resetFilter">Làm mới</a-button>
        <a-button type="primary" @click="onCallApi">Lọc</a-button>
      </div>
    </a-space>

    <a-table bordered :columns="tblConfig.columns" :loading="tblLoading" :dataSource="tblData" :pagination="tblPagination"
      @change="onTblChange">
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'maDonHang'">
          #{{ text }}
        </template>

        <template v-else-if="column.dataIndex === 'tenNguoiNhan'">
          {{ record.diaChi?.tenNguoiNhan }}
        </template>
        <template v-else-if="column.dataIndex === 'ngayTao'">
          {{ dayjs(text).format("HH:MM:ss DD/MM/YYYY") }}
        </template>

        <template v-else-if="column.dataIndex === 'tongTienGiamGia'">
          {{ _formatVnCurrency(text) }}
        </template>
        <template v-else-if="column.dataIndex === 'tongGiaCuoiCung'">
          {{ _formatVnCurrency(text) }}
        </template>
        <template v-else-if="column.dataIndex === 'trangThai'">
           <a-tag :color="getOrderStatusColor(record.trangThai)"> {{ getLabelOrderStatusByValue(record.trangThai) }}</a-tag>
        </template>

        <template v-else-if="column.dataIndex === 'action'">
          <div class="flex gap-[10px] items-center justify-center">
            <router-link :to="`/don-hang/chi-tiet/${record.id}`">
              <a-tooltip>
                <template #title> Xem chi tiết </template>
                <eye-outlined />
              </a-tooltip>
            </router-link>
            <router-link v-if="record.trangThai == 'WAITING_CONFIRM'" :to="`/don-hang/chinh-sua/${record.id}`">
              <a-tooltip>
                <template #title> Sửa đơn hàng </template>
                <edit-outlined />
              </a-tooltip>
            </router-link>
            <a-tooltip v-if="record.trangThai == 'WAITING_CONFIRM'">
              <template #title> Huỷ đơn hàng </template>
              <CloseOutlined class="text-red-500" />
            </a-tooltip>
          </div>
        </template>
      </template>
    </a-table>
  </a-page-header>
</template>

<script setup lang="ts">
import { EditOutlined, EyeOutlined, CloseOutlined } from "@ant-design/icons-vue";
import { onMounted, ref, reactive, inject } from "vue";
import dayjs, { Dayjs } from "dayjs";
import OrderService from "./services/OrderService";
import type {
  EPhuongThucTT,
  ETrangThaiDonHang,
  IDonHangFilterReq,
} from "./types/IDonHangFilterReq";
import { getLabelOrderStatusByValue, getOrderStatusColor } from './types/IOrderDetailRes'
import { useRoute } from "vue-router";
import locale from 'ant-design-vue/es/date-picker/locale/vi_VN';


const _formatVnCurrency = inject("formatVnCurrency", (length: number) => {
  return -1;
});
const _route = useRoute();

const orderStatuses = reactive([
  {
    label: "Tất cả",
    value: "ALL",
  },
  {
    label: "Chờ Xác Nhận",
    value: "WAITING_CONFIRM",
  },
  {
    label: "Đã Thanh Toán",
    value: "VNPAY_PAID",
  },
  {
    label: "Đang vận chuyển",
    value: "DELIVERING",
  },
  {
    label: "Hoàn tất",
    value: "COMPLETED",
  },
  {
    label: "Hoàn trả(Không nghe máy)",
    value: "PHONE_RETURNED",
  },
  {
    label: "Hoàn trả(Giao sai)",
    value: "WRONG_SP_RETURNED",
  },
  {
    label: "Huỷ",
    value: "CANCELLED",
  },
]);
const onchangeOrderStatus = (val: ETrangThaiDonHang) => {
  orderFilter.status = val;
  console.log("change", val);
  onCallApi();
};
const orderFilter = reactive<{
  status: ETrangThaiDonHang;
  searchVal: "";
  searchKey: string;
  phuongThucTT?: EPhuongThucTT;
  orderDate?: Dayjs[];
}>({
  status: "ALL",
  searchVal: "",
  searchKey: "maDonHang",
  phuongThucTT: undefined,
});

const resetFilter = () => {
  orderFilter.status = "ALL";
  orderFilter.searchVal = "";
  orderFilter.searchKey = "maDonHang";
  orderFilter.phuongThucTT = undefined;
  orderFilter.orderDate = undefined;
  onCallApi();
};

const addNewCategory = () => { };

const tblConfig = {
  columns: [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      align: "center",
      width: "50px",
    },
    {
      title: "Mã Đơn Hàng",
      dataIndex: "maDonHang",
      key: "maDonHang",
      align: "center",
    },
    {
      title: "Người Mua",
      dataIndex: "tenNguoiNhan",
      key: "tenNguoiNhan",
      align: "center",
    },
    {
      title: "Giảm giá",
      dataIndex: "tongTienGiamGia",
      key: "tongTienGiamGia",
      align: "center",
    },
    {
      title: "Tổng tiền",
      dataIndex: "tongGiaCuoiCung",
      key: "tongGiaCuoiCung",
      align: "center",
    },
    {
      title: "HT Thanh toán",
      dataIndex: "phuongThucTT",
      key: "phuongThucTT",
      align: "center",
    },
    {
      title: "Ghi Chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
      align: "center",
      width: '100px'
    },
    {
      title: "Trạng Thái",
      dataIndex: "trangThai",
      key: "trangThai",
      align: "center",
    },
    {
      title: "Ngày Đặt",
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
};

const tblData = ref([]);

const tblPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});
const onTblChange = ({ current }: { current: number }) => {
  tblPagination.current = current;
  onCallApi();
};

const tblLoading = ref<boolean>(false);
const onCallApi = () => {
  if (tblLoading.value) return;
  tblLoading.value = true;
  const payload: IDonHangFilterReq = {};

  if (orderFilter.status != "ALL") payload.trangThai = orderFilter.status;
  if (orderFilter.searchVal)
    // @ts-ignore
    payload[orderFilter.searchKey] = orderFilter.searchVal;
  if (orderFilter.phuongThucTT) payload.phuongThucTT = orderFilter.phuongThucTT;
  if (orderFilter.orderDate) {
    payload.startOrderDate = orderFilter.orderDate[0]
      .format("YYYY-MM-DDT00:00:00")
      .toString();
    payload.endOrderDate = orderFilter.orderDate[1]
      .format("YYYY-MM-DDT23:59:59")
      .toString();
  }
  OrderService.filter(
    payload,
    tblPagination.current - 1,
    tblPagination.pageSize
  )
    .then((res) => {
      console.log("order data", res.data);
      tblData.value = res.data.content.map((item: any, index: number) => ({
        ...item,
        stt: index + 1,
      }));
      tblPagination.total = res.data.totalElements;
    })
    .catch((err) => {
      console.log("order. get list failed: ", err);
    })
    .finally(() => (tblLoading.value = false));
};

onMounted(() => {
  if(_route.query.status)
    orderFilter.status = _route.query.status as ETrangThaiDonHang;
  onCallApi();
});
</script>

<style>
label.ant-segmented-item.ant-segmented-item-selected {
  background-color: #d9d9d9;
}
</style>
