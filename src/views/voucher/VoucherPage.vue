<script setup lang="ts">
import { EditOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { onMounted, reactive, inject } from "vue";
// import AddEditCouponModal from "../../components/admin/coupon/AddEditCouponModal";
import { message, notification } from "ant-design-vue";
import dayjs from "dayjs";
import VoucherService from "./service/VoucherService";
import AddEditVoucherModal from "./components/AddEditVoucherModal.vue";

const _genRandomString = inject("genRandomString", (length: number) => {
  return "";
});
const _formatVnCurrency = inject("formatVnCurrency", (length: number) => {
  return -1;
});

const tblConfig = reactive({
  columns: [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      align: "center",
      width: 70,
    },
    {
      title: "Mã",
      dataIndex: "maGiamGia",
      key: "maGiamGia",
      align: "center",
    },
    {
      title: "Mô tả",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
    },
    {
      title: "Giá trị giảm",
      dataIndex: "value",
      key: "value",
      align: "center",
    },
    {
      title: "Số lượt đã dùng",
      dataIndex: "soLuotDaDung",
      key: "soLuotDaDung",
      align: "center",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "ngayBatDau",
      key: "ngayBatDau",
      align: "center",
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "ngayKetThuc",
      key: "ngayKetThuc",
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
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
    showSizeChanger: false,
    onChange: (page) => (tblConfig.pagination.current = page.current),
  },
});
const modalModel = reactive({
  visible: false,
  confirmLoading: false,
  couponModel: {
    id: null,
    maGiamGia: "",
    moTa: "",
    giaGiam: "10000",
    phanTramGiam: 10,
    giamGiaTheo: "DIRECTLY",
    dateRange: [],
    loaiGiamGia: "ALL",
    danhMucList: [],
  },
  title: "Thêm mới mã giảm giá",
  okText: "Thêm",
  onOk: (formVals) => {
    console.log("form values: ", modalModel.couponModel);

    modalModel.confirmLoading = true;
    const payload = {
      ...formVals,
      id: modalModel.couponModel.id,
      ngayBatDau: formVals.dateRange[0].format("YYYY-MM-DD"),
      ngayKetThuc: formVals.dateRange[1].format("YYYY-MM-DD"),
    };
    delete payload.dateRange;

    if (modalModel.couponModel.giamGiaTheo == "DIRECTLY")
      payload.phanTramGiam = undefined;
    else payload.giaGiam = undefined;

    if (modalModel.couponModel.loaiGiamGia != "ALL")
      payload.danhMucList = modalModel.couponModel.danhMucList;

    console.log("payload bes: ", payload);
    if (!payload.id) {
      // for add new
      VoucherService.addNewVoucher(payload)
        .then(({ data }) => {
          console.log("add new coupom: ", data);
          message.success("Thêm mới thành công!");
          callFilterCouponService();
          modalModel.onCancel();
        })
        .catch((err) => {
          if (err.data) message.error(t(err.data.code));
          else
            notification.error({
              message: "Thêm mới thất bại!",
            });
        })
        .finally(() => (modalModel.confirmLoading = false));
    } else {
      //for edit
      VoucherService.updateVoucher(payload)
        .then(({ data }) => {
          console.log("update coupom: ", data);
          tblConfig.data = tblConfig.data.map((e) => {
            if (e.id === payload.id) return { ...data, index: e.index };
            return e;
          });
          modalModel.onCancel();
          message.success("Cập nhật thành công!");
        })
        .catch((err) => {
          if (err.data) message.error(t(err.data.code));
          else message.error("Cập nhật thất bại!");
        })
        .finally(() => (modalModel.confirmLoading = false));
    }
  },
  onCancel: () => {
    modalModel.couponModel = {
      id: null,
      maGiamGia: "",
      moTa: "",
      giaGiam: "10000",
      phanTramGiam: "",
      giamGiaTheo: "DIRECTLY",
      dateRange: [],
      loaiGiamGia: "ALL",
      danhMucList: [],
    };
    modalModel.okText = "Thêm";
    modalModel.title = "Thêm mới mã giảm giá";
    modalModel.visible = false;
  },
  showEdit: (record: any) => {
    modalModel.visible = true;
    modalModel.title = "Cập nhật mã giảm giá";
    modalModel.okText = "Lưu";
    modalModel.couponModel = record;
    modalModel.couponModel.dateRange = [
      dayjs(record.ngayBatDau),
      dayjs(record.ngayKetThuc),
    ];
    try {
      modalModel.couponModel.danhMucList = record.danhMucList
        ? record.danhMucList.split(",")
        : [];
    } catch (err) {
      modalModel.couponModel.danhMucList = [];
    }
    console.log("editing record: ", modalModel.couponModel);
  },
});
const filterModel = reactive({
  status: "ALL",
  q: "",
});

const changeStatus = (status) => {
  filterModel.status = status;
  callFilterCouponService();
};

const deleteCoupon = (id) => {
  tblConfig.loading = true;
  VoucherService.deleteBulkVoucher([id])
    .then(() => {
      notification.success({
        message: "Xóa thành công!",
      });
      const arr = tblConfig.data.filter((e) => e.id !== id);
      tblConfig.data = arr;
    })
    .catch((err) => {
      console.log("delte coupon: ", err);
      message.error("Xóa thất bại!");
    })
    .finally(() => (tblConfig.loading = false));
};

const callFilterCouponService = () => {
  tblConfig.loading = true;
  VoucherService.filter(
    {
      status: filterModel.status === "ALL" ? null : filterModel.status,
    },
    tblConfig.pagination.current - 1
  )
    .then(({ data }) => {
      console.log("filter coupon: ", data);
      tblConfig.data = data.content.map((i, index: number) => ({
        ...i,
        index: index + 1,
      }));
      tblConfig.pagination.total = data.totalElements;
    })
    .catch((err) => {
      console.log("filter coupon failed: ", err);
    })
    .finally(() => (tblConfig.loading = false));
};

onMounted(() => {
  callFilterCouponService();
});
</script>

<template>
  <div id="coupon_management">
    <a-page-header class="rounded-[5px]" style="border: 1px solid rgb(235, 237, 240); margin: 20px; background: white;">
      <template #title>
        <h3 class="text-2xl mb-0">Danh sách mã giảm giá</h3>
      </template>
      <template #tags>
        <a-button @click="
          modalModel.couponModel.maGiamGia =
          _genRandomString(6).toLocaleUpperCase();
        modalModel.visible = true;
        ">
          Thêm mới
        </a-button>
      </template>

      <!--       for filter -->
      <div class="grid gap-y-[10px] sm:flex items-center justify-between mb-[10px] bg-white p-[10px] rounded mt-[20px]">
        <a-space class="flex gap-x-[5px]" size="5" align="center">
          <span class="cursor-pointer block h-full p-[5px] hover:bg-gray-200 rounded duration-300 ease-in-out"
            :class="filterModel.status === 'ALL' ? 'bg-gray-200' : ''" @click="changeStatus('ALL')">Tất cả</span>
          <span class="cursor-pointer block h-full p-[5px] hover:bg-gray-200 rounded duration-300 ease-in-out"
            :class="filterModel.status === 'EXPIRED' ? 'bg-gray-200' : ''" @click="changeStatus('EXPIRED')">Đã hết
            hạn</span>
          <span class="cursor-pointer block h-full p-[5px] hover:bg-gray-200 rounded duration-300 ease-in-out"
            :class="filterModel.status === 'USING' ? 'bg-gray-200' : ''" @click="changeStatus('USING')">Đang hoạt
            động</span>
          <span class="cursor-pointer block h-full p-[5px] hover:bg-gray-200 rounded duration-300 ease-in-out"
            :class="filterModel.status === 'COMING' ? 'bg-gray-200' : ''" @click="changeStatus('COMING')">Sắp hoạt
            động</span>
        </a-space>
      </div>

      <a-table bordered :columns="tblConfig.columns" :data-source="tblConfig.data" :loading="tblConfig.loading"
        :pagination="tblConfig.pagination" @change="tblConfig.pagination.onChange" :scroll="{ x: 1300 }">
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <span class="cursor-pointer" @click="modalModel.showEdit(record)"><edit-outlined /></span>
              <a-popconfirm title="Bạn chắc chắn muốn xóa?" ok-text="Có" cancel-text="Không"
                @confirm="deleteCoupon(record.id)" placement="bottomLeft">
                <span class="cursor-pointer"><delete-outlined /></span>
              </a-popconfirm>
            </a-space>
          </template>

          <template v-else-if="column.key === 'value'">
            <template v-if="record.giamGiaTheo == 'DIRECTLY'">
              {{ _formatVnCurrency(record.giaGiam) }}
            </template>
            <template v-else> {{ record.phanTramGiam }} % </template>
          </template>

          <template v-else-if="column.key === 'soLuotDaDung'">
            {{ record.soLuotDaDung || 0 }}
          </template>

          <template v-else-if="column.key === 'createdDate'">
            {{ dayjs(text).format("HH:MM:ss DD/MM/YYYY") }}
          </template>
          <template v-else-if="column.key === 'status'">
            <template v-if="new Date(record.ngayKetThuc) < new Date()">
              <a-tag color="red"> Đã hết hạn </a-tag>
            </template>
            <template v-else-if="new Date(record.ngayBatDau) > new Date()">
              <a-tag color="blue"> Sắp hoạt động </a-tag>
            </template>
            <template v-else>
              <a-tag color="green"> Đang hoạt động </a-tag>
            </template>
          </template>
        </template>
      </a-table>

      <AddEditVoucherModal :model="modalModel" />
    </a-page-header>
  </div>
</template>
