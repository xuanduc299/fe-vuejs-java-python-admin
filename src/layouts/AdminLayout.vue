<script setup lang="ts">
import {
  HomeOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  ApartmentOutlined,
  FormOutlined,
  AppstoreAddOutlined,
  UnorderedListOutlined,
  PhoneOutlined
} from "@ant-design/icons-vue";
import { onBeforeMount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { inject } from "vue";
import { notification } from "ant-design-vue";

const router = useRouter();
const route = useRoute();
const selectedKeys = ref(["1"]);
const collapsed = ref(false);
const openedSubMenu = ref(["dashboard"]);
const baseAdminUrl = "/";

const loggedUser = {
  avatar: null,
  fullName: null,
  userName: localStorage.getItem("loggedUserName"),
  role: localStorage.getItem("loggedUserRole")
};

// for methods
const onMenuClick = ({ key }: any) => {
  console.log("onMenuClick", key);
  selectedKeys.value = [key];

  if (key === "dashboard" || key === "") router.push(baseAdminUrl);
  else router.push(baseAdminUrl + key);
};

const onSubMenuClicked = (e: any, key: any) => {
  selectedKeys.value = [key];

  router.push(baseAdminUrl + key);
};

const refreshOpenedSubMenu = () => {
  // for opened sub menu
  let path = route.path.replace(baseAdminUrl, "");

  const slashIndex = path.indexOf("/");

  if (slashIndex !== -1) path = path.substring(0, slashIndex);

  selectedKeys.value = [path];
  openedSubMenu.value = [path];
};

const onSignOut = () => {
  localStorage.removeItem("loggedUser");
  localStorage.removeItem("loggedUserRole");
  notification.success({
    message: "Đăng xuất thành công!",
  });
  router.push("/dang-nhap");
};

onBeforeMount(() => { });

onMounted(() => {
  refreshOpenedSubMenu();
  if (route.path === "/admin") {
    selectedKeys.value = ["dashboard"];
  }
  if (!localStorage.getItem("loggedUser")) {
    notification.warning({
      message: "Vui lòng đăng nhập!"
    });
    router.push("/dang-nhap");
  }
}); 
</script>

<template>
  <a-layout id="admin_layout" style="min-height: 800px; display: flex">
    <a-layout-sider class="bordered border-[#dcdcdc66] border-r-[1px]" theme="light" width="240"
      v-model:collapsed="collapsed" :trigger="null" collapsible>
      <div class="logo p-[16px] flex flex-col justify-center items-center max-w-[200px]">
        <router-link to="/" class="w-full h-[32px] flex gap-[5px] items-center">
          <h1 v-if="!collapsed" class="w-full text-center text-[#1890ff] font-medium text-[18px] m-0">
            Trang quản trị
          </h1>
        </router-link>
        <span>Xin chào, {{ loggedUser.userName }}</span>
      </div>

      <a-menu :selectedKeys="selectedKeys" theme="light" mode="inline" :openKeys="openedSubMenu" @click="onMenuClick">
        <a-menu-item key="dashboard">
          <span class="flex items-center">
            <apartment-outlined />
            <span>Tổng quan</span>
          </span>
        </a-menu-item>

        <a-sub-menu key="product_management">
          <template #icon>
            <icon-font type="icon-product" />
          </template>
          <template #title>Quản lý sản phẩm</template>
          <a-menu-item key="danh-sach-san-pham">
            <template #icon>
              <icon-font type="icon-list" />
            </template>
            Danh sách sản phẩm</a-menu-item>
          <a-menu-item key="danh-sach-san-pham/so-luong">
            <template #icon>
              <icon-font type="icon-management" />
            </template>
            Quản lý số lượng SP</a-menu-item>
          <a-menu-item key="danh-sach-san-pham/danh-muc">
            <template #icon>
              <icon-font type="icon-management" />
            </template>
            Quản lý danh mục</a-menu-item>
          <a-menu-item key="danh-sach-san-pham/thuong-hieu">
            <template #icon>
              <icon-font type="icon-management" />
            </template>
            Quản lý thương hiệu</a-menu-item>
        </a-sub-menu>


        <a-sub-menu key="order_management">
          <template #icon>
            <icon-font type="icon-order" />
          </template>
          <template #title>Quản lý đơn hàng</template>
          <a-menu-item key="don-hang">
            <template #icon>
              <icon-font type="icon-list" />
            </template>
            Danh sách đơn hàng
          </a-menu-item>

          <a-menu-item key="don-hang/them-moi">
            <template #icon>
              <icon-font type="icon-add" />
            </template>
            Thêm mới đơn hàng
          </a-menu-item>
        </a-sub-menu>

        <a-menu-item key="quan-ly-danh-gia">
          <span class="flex items-center">
            <icon-font type="icon-listreview" />
            <span>Quản lý đánh giá</span>
          </span>
        </a-menu-item>

        <a-menu-item key="ma-giam-gia">
          <span class="flex items-center">
            <icon-font type="icon-COUPON" />
            <span>Quản lý mã giảm giá</span>
          </span>
        </a-menu-item>

        <a-menu-item key="thong-ke" v-if="loggedUser.role  && loggedUser.role == 'ROLE_ADMIN'">
          <span class="flex items-center">
            <icon-font type="icon-charts-line" />
            <span>Thống kê</span>
          </span>
        </a-menu-item>

        <a-sub-menu key="account_management">
          <template #icon>
            <icon-font type="icon-customer-group" />
          </template>
          <template #title>Quản lý tài khoản</template>
          <a-menu-item key="danh-sach-tai-khoan-nhan-vien" v-if="loggedUser.role  && loggedUser.role == 'ROLE_ADMIN'">D/S tài khoản hệ thống</a-menu-item>
          <a-menu-item key="danh-sach-tai-khoan-nguoi-dung">D/S tài khoản người dùng</a-menu-item>
        </a-sub-menu>
      </a-menu>

      <!-- loggout -->
      <div class="flex justify-center items-center mt-[20px]">
        <a-button @click="onSignOut" type="primary" danger class="w-[80%] flex justify-center items-center">
          <logout-outlined />
          <span>Đăng xuất</span>
        </a-button>
      </div>
    </a-layout-sider>

    <a-layout class="admin_layout_content">
      <a-layout-header class="flex justify-between" style="background: #f9fafe; padding: 0">
        <div class="close_open_nav ml-[15px]">
          <menu-unfold-outlined v-if="collapsed" class="trigger" @click="() => (collapsed = !collapsed)" />
          <menu-fold-outlined v-else class="trigger" @click="() => (collapsed = !collapsed)" />
        </div>

        <a-dropdown class="hidden" placement="bottomRight">
          <span class="flex items-center gap-[10px] mr-[20px] cursor-pointer hover:bg-gray-100 p-[20px]">
            <img loading="lazy" :src="loggedUser?.avatar ||
              'https://cdn.iconscout.com/icon/free/png-256/avatar-370-456322.png'
            " class="block h-[20px] w-[20px]" />
            {{ loggedUser?.fullName || loggedUser?.userName }}
          </span>
          <template #overlay>
            <a-menu>
              <a-menu-item>
                <router-link to="/admin/nguoi-dung/thong-tin-ca-nhan">Thông tin cá nhân
                </router-link>
              </a-menu-item>
              <a-menu-item>
                <span>Đăng xuất</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </a-layout-header>

      <a-layout-content :style="{
        background: '#ececec',
        minHeight: '850px',
        borderTop: '1px solid #ebebeb',
      }">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style>
.admin_layout_content {
  height: 100%;
  width: 100%;
}

.ant-page-header {
  height: 100%;
  background-color: unset;
}

.ant-skeleton-element .ant-skeleton-image {
  width: 100%;
  height: 100%;
}
</style>
