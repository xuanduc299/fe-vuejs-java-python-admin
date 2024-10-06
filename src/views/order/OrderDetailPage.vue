<template>
  <a-page-header @back="() => $router.go(-1)" class="rounded-[5px]" style="
      border: 1px solid rgb(235, 237, 240);
      margin: 20px;
      background: white;
    " v-if="orderDetail">
    <template #title>
      <h3 class="text-2xl m-0">
        Chi tiết đơn hàng #{{ orderDetail.maDonHang }}
      </h3>
    </template>

    <template #tags>
      <div class="flex gap-[10px] items-center">
        <a-tag :color="getOrderStatusColor(orderDetail.trangThai)">
          {{ getLabelOrderStatusByValue(orderDetail.trangThai) }}</a-tag>
        <span>|</span>
        <span>
          Tạo lúc:
          {{ dayjs(orderDetail.ngayTao).format("DD/MM/YYYY HH:mm:ss") }}
        </span>
      </div>
    </template>

    <template #extra>
      <a-dropdown :trigger="['click']" v-if="![
          'CANCELLED',
          'COMPLETED',
          'PHONE_RETURNED',
          'WRONG_SP_RETURNED',
        ].includes(orderDetail.trangThai)
        ">
        <a-button key="1" type="primary" size="small" :loading="isChangingOrderStatus">Cập nhật trạng thái
          <DownOutlined />
        </a-button>
        <template #overlay>
          <a-menu @click="onChangeOrderStatus">
            <a-menu-item :key="item.value" v-for="item in getOrderStatusByValueAndOrderGreater(
              orderDetail.trangThai
            )">
              {{ item.label }}
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </template>

    <div class="flex gap-[15px] justify-between">
      <div class="w-[70%] grid gap-[15px]">
        <a-card>
          <div class="w-full text-center grid justify-between" :key="index"
            v-for="(item, index) in orderDetail.chiTietDonHang">
            <div class="flex gap-[10px]">
              <img class="w-[103px] h-[110px]" :src="item.sanPham?.anhChinh?.url" />
              <div class="text-start">
                <h3 class="mb-0">{{ item.sanPham.tieuDe }}</h3>

                <p class="mb-0">Phân loại: {{ item.motaPhanLoai }}</p>
                <p class="mb-0">
                  Giá: {{ _formatVnCurrency(item.giaTien) }} vnd
                </p>
                <p class="mb-0">Số Lượng: {{ item.soLuong }}</p>
              </div>
            </div>
            <a-divider />
          </div>
        </a-card>

        <!-- summary -->
        <a-card>
          <div class="w-full text-center grid grid-cols-3 justify-between">
            <div class="flex gap-[10px]">
              Tổng tiền sản phẩm({{ orderDetail.tongSp }} đôi)
            </div>
            <p></p>
            <p>{{ _formatVnCurrency(orderDetail.tongGiaTien) }}</p>
          </div>

          <div class="w-full text-center grid grid-cols-3 justify-between">
            <div class="flex gap-[10px]">Giảm giá</div>
            <p></p>
            <p>{{ _formatVnCurrency(orderDetail.tongTienGiamGia) }}</p>
          </div>

          <div class="w-full text-center grid grid-cols-3 justify-between">
            <div class="flex gap-[10px]">Phí ship</div>
            <p></p>
            <p>{{ _formatVnCurrency(orderDetail.phiShip) }}</p>
          </div>

          <div class="w-full text-center grid grid-cols-3 justify-between">
            <div class="flex gap-[10px]">Phương thức thanh toán</div>
            <p></p>
            <p>{{ orderDetail.phuongThucTT }}</p>
          </div>

          <div class="w-full text-center grid grid-cols-3 justify-between font-bold">
            <div class="flex gap-[10px]">Tổng tiền thanh toán</div>
            <p></p>
            <p>{{ _formatVnCurrency(orderDetail.tongGiaCuoiCung) }}</p>
          </div>
        </a-card>
      </div>

      <a-card class="w-[30%]">
        <div>
          <p class="text-[16px] font-bold">Tên người nhận</p>

          <p>{{ orderDetail.diaChi.tenNguoiNhan }}</p>

          <a-divider />

          <p class="text-[16px] font-bold">Thông tin liên hệ</p>

          <p>SDT: {{ orderDetail.diaChi.sdt }}</p>
          <p>Email: {{ orderDetail.diaChi.email || "-" }}</p>

          <a-divider />

          <p class="text-[16px] font-bold">Địa chỉ giao hàng</p>

          <p>
            {{ orderDetail.diaChi.diaChi.replaceAll(/__[0-9]+##/g, ", ") }}
          </p>

          <p class="text-[16px] font-bold">Ghi chú của khách hàng</p>
          <p>{{ orderDetail.ghiChu || "-" }}</p>
          <!-- <a-badge status="processing" text="Running" /> -->

          <template v-if="orderDetail?.nguoiMua">
            <p class="text-[16px] font-bold">Tài khoản đặt hàng</p>
            <p>{{ orderDetail?.nguoiMua?.username }}</p>
          </template>

        </div>
      </a-card>
    </div>
  </a-page-header>
</template>

<script setup lang="ts">
import { DownOutlined } from "@ant-design/icons-vue";

import dayjs from "dayjs";
import { onMounted, ref, inject } from "vue";
import { useRoute } from "vue-router";
import OrderService from "./services/OrderService";
import type { AxiosResponse } from "axios";
import type IOrderDetailRes from "./types/IOrderDetailRes";
import {
  getOrderStatusByValueAndOrderGreater,
  getLabelOrderStatusByValue,
  getOrderStatusColor,
} from "./types/IOrderDetailRes";
import type { ETrangThaiDonHang } from "./types/IDonHangFilterReq";
import { notification } from "ant-design-vue";

const _formatVnCurrency = inject("formatVnCurrency", (length: number) => {
  return -1;
});
const _route = useRoute();

const orderDetail = ref<IOrderDetailRes>();

const isChangingOrderStatus = ref<boolean>(false);

const onChangeOrderStatus = ({ key }: { key: ETrangThaiDonHang }) => {
  if (orderDetail.value) {
    if (isChangingOrderStatus.value) return;
    isChangingOrderStatus.value = true;
    OrderService.capNhatTrangThai(orderDetail.value.id, key)
      .then(() => {
        notification.success({
          message: "Cập nhật thành công!",
        });
        // const newObj:IOrderDetailRes = orderDetail.value as IOrderDetailRes;
        // newObj.trangThai = key;
        if (orderDetail.value) orderDetail.value.trangThai = key;
      })
      .catch((err) => {
        console.log("failed to update order status", err);
        notification.error({
          message: "Cập nhật thất bại!",
        });
      })
      .finally(() => (isChangingOrderStatus.value = false));
  }
};

onMounted(() => {
  if (_route.params.id)
    OrderService.chiTietOrder(_route.params.id as unknown as number)
      .then((res: AxiosResponse<IOrderDetailRes>) => {
        console.log("order. detail: ", res.data);
        orderDetail.value = res.data;
      })
      .catch((err) => {
        console.log("order: detail failed", err);
      });
});
</script>
