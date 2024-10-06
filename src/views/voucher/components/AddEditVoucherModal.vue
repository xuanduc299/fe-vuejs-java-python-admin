<script setup lang="ts">
import { message, notification, FormInstance } from "ant-design-vue";
import { onMounted, reactive, ref, inject } from "vue";
import VoucherService from "../service/VoucherService";
import brandService from "@/views/product/services/BrandService";
import categoryService from "@/views/product/services/CategoryService";
import locale from 'ant-design-vue/es/date-picker/locale/vi_VN';


const _removeSpecialChars = inject("removeSpecialChars", (val: string) => val);

const { model } = defineProps({
  model: {
    type: Object,
    required: true,
  },
});
const formRef = ref<FormInstance>();
const handleCouponValueChange = (rule, value) => {
  if (value === "") return Promise.reject("Vui lòng không bỏ trống!");
  else if (value < 1) return Promise.reject("Vui lòng nhập giá trị lớn hơn 0!");
  else if (value > 100 && model.couponModel.giamGiaTheo !== "DIRECTLY")
    return Promise.reject("Vui lòng nhập giá trị nhỏ hơn 100!");
  return Promise.resolve();
};
const okModal = () => {
  formRef.value
    .validateFields()
    .then((payload) => {
      model.onOk(payload);
    })
    .catch((err) => {
      console.log("err: ", err);
      notification.warning({
        message: "Vui lòng kiểm tra lại thông tin!",
      });
    });
};

const modalApplyModel = reactive({
  visible: false,
  confirmLoading: false,
  onOk: () => {
    modalApplyModel.onCancel();
  },
  onCancel: () => {
    modalApplyModel.visible = false;
  },
});
const categoryList = ref([]);
const onClickApplyFor = (e, id) => {
  if (!e.checked)
    model.couponModel.danhMucList = model.couponModel.danhMucList.filter(
      (i) => i !== id
    );
  else model.couponModel.danhMucList.push(id);
};

onMounted(() => {
  categoryService
    .filterCategory({
      page: 0,
      size: 999,
    })
    .then((res) => {
      console.log("get all category: ", res.data.content);
      categoryList.value = res.data.content;
    })
    .catch((err) => {
      console.log("get all category failed", err);
      notification.error({
        message: "Không thể lấy dữ liệu danh mục sản phẩm!",
      });
    });
});
</script>

<template>
  <a-modal
    :open="model.visible"
    :title="model.title"
    :ok-text="model.okText"
    cancel-text="Hủy"
    :closable="null"
    @ok="okModal"
    @cancel="model.onCancel"
    :confirm-loading="model.confirmLoading"
  >
    <a-form
      ref="formRef"
      class="max-h-[560px] overflow-y-auto mt-[30px]"
      :model="model.couponModel"
      name="basic"
      :label-col="{ span: 8 }"
      label-align="left"
      autocomplete="off"
    >
      <a-form-item
        label="Mã coupon"
        name="maGiamGia"
        :rules="[{ required: true, message: 'Vui lòng không được bỏ trống!' }]"
      >
        <a-input
          :disabled="model.couponModel.id"
          v-model:value.trim="model.couponModel.maGiamGia"
          @change="(e: any) => model.couponModel.maGiamGia =  e.target.value.replace(/[^a-zA-Z0-9@]/g, '').toUpperCase()"
          :maxlength="50"
          allowClear
          placeholder="..."
        >
          <template #title v-if="!model.couponModel.id">
            <a-button> Kiểm tra</a-button>
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        label=" Mô tả"
        name="moTa"
        :rules="[{ required: true, message: 'Vui lòng không được bỏ trống!' }]"
      >
        <a-textarea
          v-model:value="model.couponModel.moTa"
          @change="model.couponModel.moTa = _removeSpecialChars(model.couponModel.moTa.replace(/^\s+/, ''))"
          allowClear
          placeholder="..."
        />
      </a-form-item>

      <a-form-item
        label="Giảm giá theo"
        name="giamGiaTheo"
        :rules="[{ required: true, message: 'Vui lòng không được bỏ trống!' }]"
      >
        <a-select
          v-model:value="model.couponModel.giamGiaTheo"
          @change="
            model.couponModel.giaGiam = '0';
            model.couponModel.phanTramGiam = '10';
          "
        >
          <a-select-option value="DIRECTLY">Giảm trực tiếp</a-select-option>
          <a-select-option value="PERCENT">Giảm theo phần trăm</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item
        label="Nhập giá trị giảm"
        :name="
          model.couponModel.giamGiaTheo === 'DIRECTLY'
            ? 'giaGiam'
            : 'phanTramGiam'
        "
        :rules="[{ validator: handleCouponValueChange, required: true }]"
      >
        <a-input
          v-if="model.couponModel.giamGiaTheo === 'DIRECTLY'"
          v-model:value.number="model.couponModel.giaGiam"
          @change="
            model.couponModel.giaGiam = Number(
              $event.target.value.replace(/\D/g, '').slice(0, 9)
            )
          "
          suffix="vnd"
          allowClear
        />
        <a-input
          v-else
          type="number"
          v-model:value.number="model.couponModel.phanTramGiam"
          maxlength="100"
          min="1"
          suffix="%"
          allowClear
        />
      </a-form-item>

      <a-form-item
        label="Thời gian áp dụng"
        name="dateRange"
        :rules="[{ required: true, message: 'Vui lòng chọn ngày!' }]"
      >
        <a-range-picker
          class="w-full"
          v-model:value="model.couponModel.dateRange"
          format="DD/MM/YYYY"
          :locale="locale"
          allowClear
        />
      </a-form-item>

      <a-form-item
        label="Áp dụng cho"
        name="loaiGiamGia"
        :rules="[
          {
            required: model.couponModel.loaiGiamGia !== 'ALL',
            message: 'Vui lòng chọn ảnh!',
          },
        ]"
      >
        <div class="flex gap-[10px]">
          <a-select
            v-model:value="model.couponModel.loaiGiamGia"
            @change="model.couponModel.danhMucList = []"
          >
            <a-select-option value="ALL">Tất cả</a-select-option>
            <a-select-option value="BY_CATEGORY">Theo danh mục</a-select-option>
          </a-select>

          <a-button
            type="primary"
            v-if="model.couponModel.loaiGiamGia !== 'ALL'"
            @click="modalApplyModel.visible = true"
          >
            Chọn
          </a-button>
          <template v-if="modalApplyModel.visible">
            <a-modal
              :visible="modalApplyModel.visible"
              title="Chọn danh mục áp dụng"
              ok-text="Lưu"
              cancel-text="Hủy"
              @ok="modalApplyModel.onOk"
              @cancel="modalApplyModel.onCancel"
              :closable="null"
            >
              <div class="flex gap-[10px] flex-wrap mt-[30px]">
                <div
                  v-for="e in categoryList"
                  :key="e.id"
                  class="border border-gray-300 flex items-center justify-between gap-[20px] px-[10px] py-[20px] rounded shadow"
                >
                  <h4 class="m-0 max-w-[140px]">{{ e.tenDanhMuc }}</h4>
                  <input
                    :checked="
                      model.couponModel.danhMucList.indexOf(e.id) !== -1
                    "
                    type="checkbox"
                    @click="onClickApplyFor($event.target, e.id)"
                  />
                </div>
              </div>
            </a-modal>
          </template>
        </div>
        <div
          class="mt-1"
          v-if="
            model.couponModel.danhMucList &&
            model.couponModel.danhMucList.length > 0
          "
        >
          Danh mục áp dụng: 
          <span v-for="(e, index) in categoryList" :key="index">
            {{ e.tenDanhMuc }} {{ categoryList.length == index + 1 ? "" : "," }}
          </span>
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
