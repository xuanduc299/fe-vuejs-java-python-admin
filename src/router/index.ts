import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'admin_layout',
      component: () => import('../layouts/AdminLayout.vue'),
      children: [
        {
          path: '/',
          name: 'admin_dashboard',
          component: () => import('../views/dashboard/DashboardView.vue'),
        },
        {
          path: '/danh-sach-san-pham',
          name: 'list_product',
          component: () => import('../views/product/ProductListPage.vue'),
        },
        {
          path: '/danh-sach-san-pham/them-moi',
          name: 'add_product',
          component: () => import('../views/product/AddProductPage.vue'),
        },
        {
          path: '/danh-sach-san-pham/sua/:id',
          name: 'edit_product',
          component: () => import('../views/product/AddProductPage.vue'),
        },
        {
          path: '/danh-sach-san-pham/so-luong',
          name: 'product-stock',
          component: () => import('../views/product/ProductStockPage.vue'),
        },
        {
          path: '/danh-sach-san-pham/danh-muc',
          name: 'product_category',
          component: () => import('../views/product/ProductCategoryPage.vue'),
        },
        {
          path: '/danh-sach-san-pham/thuong-hieu',
          name: 'product_brand',
          component: () => import('../views/product/ProductBrandPage.vue'),
        },
        {
          path: '/don-hang',
          name: 'order_list',
          component: () => import('../views/order/OrderListPage.vue'),
        },
        {
          path: '/don-hang/chi-tiet/:id',
          name: 'order_detail',
          component: () => import('../views/order/OrderDetailPage.vue'),
        },
        {
          path: '/don-hang/doi-tra-sp/:id',
          name: 'exchange_product_order',
          component: () => import('../views/order/ExchangeProductPage.vue'),
        },
        {
          path: '/don-hang/them-moi',
          name: 'add_new_order',
          component: () => import('../views/order/AddOrderPage.vue'),
        },
        {
          path: '/don-hang/chinh-sua/:id',
          name: 'edit_order',
          component: () => import('../views/order/EditOrderPage.vue'),
        },
        {
          path: '/quan-ly-danh-gia',
          name: 'review_management',
          component: () => import('../views/review/reviewListPage.vue'),
        },
        {
          path: '/ma-giam-gia',
          name: 'voucher_management',
          component: () => import('../views/voucher/VoucherPage.vue'),
        },
        {
          path: '/danh-sach-tai-khoan-nhan-vien',
          name: 'emp_account',
          component: () => import('../views/account/EmpAccountView.vue'),
        },
        {
          path: '/danh-sach-tai-khoan-nguoi-dung',
          name: 'user_account',
          component: () => import('../views/account/UserAccountView.vue'),
        },

        {
          path: '/thong-ke',
          name: 'stats',
          component: () => import('../views/stats/index.vue'),
        },
      ],
    },
    {
      path: '/dang-nhap',
      name: 'dang_nhap',
      component: () => import('../views/auth/SigninPage.vue')
    }
  ],
});

export default router;
