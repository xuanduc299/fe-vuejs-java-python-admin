<script setup lang="ts">
import { EyeOutlined } from "@ant-design/icons-vue";
import { onMounted, ref, inject, reactive } from "vue";
import OrderService from "../order/services/OrderService";
import type { IDonHangFilterReq } from "../order/types/IDonHangFilterReq";
import dayjs from "dayjs";
import {
  getLabelOrderStatusByValue,
  getOrderStatusColor,
} from "@/views/order/types/IOrderDetailRes";
import StatsService from "../stats/services/StatsService";
import { notification } from "ant-design-vue";

const _formatVnCurrency = inject("formatVnCurrency", (length: number) => {
  return -1;
});

const topbarData = reactive({
  waiting: 0,
  delivering: 0,
  completed: 0,
  revenue: 0,
});

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
const tblLoading = ref<boolean>(false);
const onCallApi = () => {
  if (tblLoading.value) return;
  tblLoading.value = true;
  const payload: IDonHangFilterReq = {
    trangThai: "WAITING_CONFIRM",
  };

  OrderService.filter(payload, 0, 10)
    .then((res) => {
      console.log("order data", res.data);
      tblData.value = res.data.content.map((item: any, index: number) => ({
        ...item,
        stt: index + 1,
      }));
    })
    .catch((err) => {
      console.log("order. get list failed: ", err);
    })
    .finally(() => (tblLoading.value = false));
};

onMounted(() => {
  onCallApi();

  StatsService.dashboard(
    dayjs().format("YYYY-MM-01T00:00:00"),
    dayjs().endOf("month").format("YYYY-MM-DDT23:59:59")
  )
    .then((res) => {
      console.log("dashboard: ", res);
      topbarData.waiting = res.data["WAITING_CONFIRM"] || 0;
      topbarData.delivering = res.data["DELIVERING"] || 0;
      topbarData.completed = res.data["COMPLETED"] || 0;
      topbarData.revenue = res.data.total;
    })
    .catch((err) => {
      notification.error({
        message: "Không thể lấy dữ liệu!",
      });
      console.log("failed to get dashboard", err);
    });
});
</script>

<template>
  <div class="p-[20px]">
    <div class="bg-white p-[20px] grid gap-[20px] mb-[20px]">
      <h3 class="text-xl">Tháng này {{ dayjs().format("MM/YYYY") }}</h3>
      <div class="grid grid-cols-4 gap-[20px] px-[5px]">
        <a-card
          @click="$router.push('/don-hang?status=WAITING_CONFIRM')"
          class="cursor-pointer hover:scale-[1.05] duration-200 easy-in-out"
        >
          <a-statistic :value="topbarData.waiting">
            <template #title>
              <h3 class="text-black text-center">Chờ xác nhận</h3>
            </template>

            <template #suffix>
              <eye-outlined />
            </template>
          </a-statistic>
        </a-card>

        <a-card
          @click="$router.push('/don-hang?status=DELIVERING')"
          class="cursor-pointer hover:scale-[1.05] duration-200 easy-in-out"
        >
          <a-statistic :value="topbarData.delivering">
            <template #title>
              <h3 class="text-black text-center">Đang giao</h3>
            </template>
            <template #suffix>
              <eye-outlined />
            </template>
          </a-statistic>
        </a-card>

        <a-card
          @click="$router.push('/don-hang?status=COMPLETED')"
          class="cursor-pointer hover:scale-[1.05] duration-200 easy-in-out"
        >
          <a-statistic :value="topbarData.completed">
            <template #title>
              <h3 class="text-black text-center">Hoàn tất</h3>
            </template>
            <template #suffix>
              <eye-outlined />
            </template>
          </a-statistic>
        </a-card>

        <a-card>
          <a-statistic :value="_formatVnCurrency(topbarData.revenue)">
            <template #title>
              <h3 class="text-black text-center">Doanh thu</h3>
            </template>
          </a-statistic>
        </a-card>
      </div>
    </div>

    <a-card>
      <template #title>
        <h3 class="text-xl pt-[8px]">Đơn hàng mới</h3>
      </template>
      <a-table
        bordered
        :columns="tblConfig.columns"
        :dataSource="tblData"
        :pagination="false"
      >
        <template #emptyText>
          <span>Không có dữ liệu</span>
        </template>
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
            <a-tag :color="getOrderStatusColor(text)">
              {{ getLabelOrderStatusByValue(record.trangThai) }}
            </a-tag>
          </template>

          <template v-else-if="column.dataIndex === 'action'">
            <router-link :to="`/don-hang/chi-tiet/${record.id}`">
              <a-tooltip>
                <template #title> Xem chi tiết </template>
                <eye-outlined />
              </a-tooltip>
            </router-link>
          </template>
        </template>

        <template #footer v-if="tblData.length > 10">
          <div class="flex justify-center">
            <router-link to="/don-hang?status=WAITING_CONFIRM"
              >Xem thêm</router-link
            >
          </div>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<style>
.ant-statistic-content {
  display: flex;
  justify-content: center;
}
</style>
