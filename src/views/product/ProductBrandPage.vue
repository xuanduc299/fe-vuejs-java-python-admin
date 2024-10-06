<template>
  <a-page-header class="rounded-[5px]" style="border: 1px solid rgb(235, 237, 240); margin: 20px; background: white;">
    <template #title>
      <h3 class="text-2xl m-0">Quản lý thương hiệu</h3>
    </template>

    <template #tags>
      <a-button @click="addNewBrand"> Thêm mới </a-button>
    </template>

    <div class="flex justify-start items-center mb-[10px]">
      <div>
        <a-input-search v-model:value.trim="q" @search="onCallApi" placeholder="Từ khóa..." style="max-width: 200px" />
      </div>
    </div>

    <a-table bordered :columns="tblCols" :dataSource="tblData" :pagination="tblPagination" :loading="tblLoading"
      @change="onTblChange">
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'soSp'">
          {{ text }} sản phẩm <br />
          <!-- <a href="#"> Chi tiết</a> -->
        </template>


        <template v-else-if="column.dataIndex === 'ngayTao'">
          {{ dayjs(text).format("HH:MM:ss DD/MM/YYYY").toString() }}
        </template>

        <template v-else-if="column.dataIndex === 'action'">
          <div class="flex gap-[10px] items-center justify-center">
            <a-tooltip v-if="record.id != 1">
              <template #title> Sửa thương hiệu </template>
              <edit-outlined @click="editBrand(record)" />
            </a-tooltip>

            <a-popconfirm v-if="record.id != 1" title="Bạn chắc chắn?" @confirm="deleteBrand(record)">
              <a-tooltip>
                <template #title> Xóa thương hiệu </template>
                <delete-outlined class="text-red-500" />
              </a-tooltip>
            </a-popconfirm>
          </div>
        </template>
      </template>
    </a-table>

    <AddEditBrandBrandModal :model="props" />
  </a-page-header>
</template>

<script setup lang="ts">
import { EditOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { onMounted, ref, reactive } from "vue";
import dayjs from "dayjs";
import AddEditBrandBrandModal from "./components/AddEditBrandCategoryModal.vue";
import type IAddEditBrandBrandModalProps from "./types/IAddEditBrandCategoryModalProps";
import type IBrandType from "./types/IBrandType";
import BrandService from "./services/BrandService";
import type { IAxiosPageRes } from "@/commons/config/axios";
import { notification } from "ant-design-vue";

const props = reactive<IAddEditBrandBrandModalProps>({
  title: "Thêm mới danh mục",
  visible: false,
  onSubmitOK: (val: string) => {
    if (props.value) { // for update
      console.log("category. update new: ", val)
      BrandService.updateBrand({
        id: props.value.id,
        tenThuongHieu: val
      })
        .then((res: IAxiosPageRes<IBrandType>) => {
          console.log("category. data: ", res.data);
          notification.success({
            message: "Thêm mới thành công!"
          });
          props.onCancel();
          onCallApi();
        })
        .catch((err) => {
          console.log("category. get data failed: ", err);
          notification.error({
            message: "Không thể lấy dữ liệu! Vui lòng thử lại sau.",
          });
        })
        .finally(() => (tblLoading.value = false));
    }
    else { // for add new
      console.log("category. add new: ", val)
      BrandService.addBrand({
        tenThuongHieu: val
      })
        .then((res: IAxiosPageRes<IBrandType>) => {
          console.log("category. data: ", res.data);
          notification.success({
            message: "Thêm mới thành công!"
          });
          props.onCancel();
          tblPagination.current = 1;
          onCallApi();
        })
        .catch((err) => {
          console.log("category. get data failed: ", err);
          notification.error({
            message: "Không thể lấy dữ liệu! Vui lòng thử lại sau.",
          });
        })
        .finally(() => (tblLoading.value = false));
    }
  },
  onCancel: () => {
    props.visible = false;
    props.title = "Thêm mới danh mục";
    props.value = undefined;
  },
});

const addNewBrand = () => {
  props.visible = true;
  props.title = "Thêm mới danh mục";
  props.value = undefined;
};

const editBrand = (record: IBrandType) => {
  console.log("category. edit: ", record);
  props.visible = true;
  props.title = "Sửa danh mục";
  props.value = {
    id: record.id,
    name: record.tenThuongHieu
  };
};

const deleteBrand = (record: IBrandType) => {
  console.log("category. delete: ", record);
  BrandService.deleteBrand(record.id)
    .then((res: IAxiosPageRes<IBrandType>) => {
      console.log("category. data: ", res.data);
      notification.success({
        message: "Xóa thành công!"
      });
      onCallApi();
    })
    .catch((err) => {
      console.log("category. get data failed: ", err);
      notification.error({
        message: "Không thể lấy dữ liệu! Vui lòng thử lại sau.",
      });
    })
    .finally(() => (tblLoading.value = false));
}

const q = ref<string>();

const tblCols = [
  {
    title: "STT",
    dataIndex: "stt",
    key: "stt",
    align: "center",
    width: '50px'
  },
  {
    title: "Tên thương hiệu",
    dataIndex: "tenThuongHieu",
    key: "tenThuongHieu",
    align: "center",
  },
  {
    title: "Số sản phẩm",
    dataIndex: "soSp",
    key: "soSp",
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
];
const tblPagination = reactive({
  current: 1,
  pageSize: 3,
  total: 0,
});
const onTblChange = ({ current }: { current: number }) => {
  tblPagination.current = current;
  onCallApi();
};
const tblLoading = ref<boolean>(false);
const tblData = ref<IBrandType[]>([
  {
    stt: 1,
    id: 0,
    tenThuongHieu: "Giày name",
    soSp: 12,
    ngayTao: new Date(),
    createdBy: {
      name: "Admin",
    },
  },
]);

const onCallApi = () => {
  if (tblLoading.value) return;

  tblLoading.value = true;
  BrandService.filterBrand({
    tenThuongHieu: q.value,
    page: tblPagination.current - 1,
    size: tblPagination.pageSize,
  })
    .then((res: IAxiosPageRes<IBrandType>) => {
      console.log("brand. data: ", res.data);
      tblData.value = res.data.content.map((item, index) => ({ ...item, stt: index + 1 }));
      tblPagination.total = res.data.totalElements;
    })
    .catch((err) => {
      console.log("brand. get data failed: ", err);
      notification.error({
        message: "Không thể lấy dữ liệu! Vui lòng thử lại sau.",
      });
    })
    .finally(() => (tblLoading.value = false));
};
onMounted(() => {
  onCallApi();
});
</script>
