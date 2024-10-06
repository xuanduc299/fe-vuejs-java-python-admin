<template>
  <div id="emp_account">
    <a-page-header class="rounded-[5px]" style="
        border: 1px solid rgb(235, 237, 240);
        margin: 20px;
        background: white;
      " title="Danh sách người dùng">
      <template #tags>
        <a-space>
          <a-button type="primary" @click="addEditUserModalInstance.visible = true">Thêm mới</a-button>
        </a-space>
      </template>

      <div class="mb-[30px] w-full bg-white rounded p-[20px]">
        <a-space>
          <span class="w-[100px] block text-lg font-[500]">Tìm kiếm: </span>
          <a-select class="w-[140px]" v-model:value="filterModel.searchKey">
            <a-select-option value="userId">Tên đăng nhập</a-select-option>
            <a-select-option value="name">Tên người dùng</a-select-option>
            <a-select-option value="email">Email</a-select-option>
            <a-select-option value="phone">Số điện thoại</a-select-option>
          </a-select>
          <a-input-search v-model:value="filterModel.q" @search="searchUser" placeholder="Từ khóa..."
            class="min-w-[150px]" />
        </a-space>
      </div>

      <a-table class="mt-[20px]" :columns="tblConfig.columns" :data-source="tblConfig.data" :loading="tblConfig.loading"
        :bordered="true" :pagination="tblConfig.pagination" :scroll="{ x: 800 }" @change="tblConfig.onChange">
        <template #emptyText>
          <span>Không có dữ liệu</span>
        </template>
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.key === 'username'">
            <p class="m-0">{{ text }}</p>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-popconfirm v-if="text == true" title="Bạn muốn khóa tài khoản này?" ok-text="Có" cancel-text="Không">
              <a-tag color="green" class="cursor-pointer">Đang hoạt động</a-tag>
            </a-popconfirm>
            <a-popconfirm v-else title="Bạn muốn khóa tài khoản này?" ok-text="Có" cancel-text="Không">
              <a-tag color="red">Không hoạt động</a-tag>
            </a-popconfirm>
          </template>

          <template v-else-if="column.key === 'sex'">
            <template v-if="!text"> - </template>
            <template v-else>
              {{ text === "MALE" ? "Nam" : "Nữ" }}
            </template>
          </template>

          <template v-else-if="column.key === 'birthDate'">
            {{ text || "-" }}
          </template>
          <template v-else-if="column.key === 'email'">
            {{ text || "-" }}
          </template>

          <template v-else-if="column.key === 'phone'">
            {{ text || "-" }}
          </template>

          <template v-else-if="column.key === 'action'">
            <div class="flex gap-[10px] items-center justify-center">
              <a-tooltip>
                <template #title> Sửa </template>
                <edit-outlined @click="addEditUserModalInstance.showEditUserModal(record)" />
              </a-tooltip>

              <a-tooltip>
                <template #title> Xóa </template>
                <delete-outlined @click="deleteUser(record.id)" class="text-red-500" />
              </a-tooltip>
            </div>
          </template>
        </template>
      </a-table>

      <add-edit-user :model="addEditUserModalInstance" />
    </a-page-header>
  </div>
</template>

<script setup lang="ts">
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";
import { onMounted, reactive, ref, inject } from "vue";
import AddEditUser from "./components/AddEditUserModal.vue";
import UserService from "./services/UserService";
import { message, notification } from "ant-design-vue";
import dayjs from "dayjs";

const _debounce = inject("debounce", (func: Function, delay: number) => {
  return {};
});

const addEditUserModalInstance = reactive({
  visible: false,
  type: "add",
  formRef: null,
  loading: false,
  userModel: {
    id: null,
    userId: "",
    name: "",
    password: "",
    roleCd: "",
    email: "",
    phone: "",
    sex: "MALE",
  },
  roleList: [],
  authorityData: [],
  ready: (formRef) => {
    addEditUserModalInstance.formRef = formRef;
  },
  showEditUserModal: (record) => {
    addEditUserModalInstance.userModel = {
      id: record.id,
      userId: record.userId,
      name: record.name,
      roleCd: record.roleCd,
      email: record.email,
      phone: record.phone,
      sex: record.sex,
    };
    if (record?.birthDate && record?.birthDate.length > 0)
      addEditUserModalInstance.userModel.birthDate = dayjs(record.birthDate);
    addEditUserModalInstance.visible = true;
    addEditUserModalInstance.type = "edit";
  },
  cancel: () => {
    addEditUserModalInstance?.formRef?.resetFields();
    addEditUserModalInstance.visible = false;
    addEditUserModalInstance.type = "add";
    addEditUserModalInstance.userModel = {
      id: null,
      userId: "",
      name: "",
      password: "",
      roleCd: "",
      email: "",
      phone: "",
      sex: "MALE",
    };
  },
  ok: () => {
    addEditUserModalInstance.formRef
      .validateFields()
      .then((values) => {
        console.log("on ok edit: ", addEditUserModalInstance.userModel);
        addEditUserModalInstance.loading = true;
        values.birthDate = values.birthDate
          ? values.birthDate.format("YYYY-MM-DD")
          : null;
        if (addEditUserModalInstance.type === "add")
          UserService.addUser({ ...values, role: "ROLE_USER" })
            .then((res) => {
              console.log("res", res.data);
              tblConfig.data = [res.data, ...tblConfig.data];
              addEditUserModalInstance.cancel();
              notification.success({
                message: "Thêm thành công!",
              });
              tblConfig.pagination.current = 1;
              callUserSearchService();
            })
            .catch((err) => {
              console.log("err", err);
              if (err?.response?.data?.code == 21)
                notification.error({
                  message: "Tài khoản này đã được đăng ký."
                });
              else if (err?.response?.data?.code == 22)
                notification.error({
                  message: "Email này đã được đăng ký."
                });
              else if (err?.response?.data?.code == 23)
                notification.error({
                  message: "Số điện thoại này đã được đăng ký."
                });
              else
                notification.error({
                  message: "Thêm mới thất bại!",
                });
            })
            .finally(() => {
              addEditUserModalInstance.loading = false;
            });
        else
          UserService.updateUser(
            addEditUserModalInstance.userModel.id as unknown as number,
            { ...values }
          )
            .then((res) => {
              console.log("res", res);

              tblConfig.data = tblConfig.data.map((item) => {
                if (item.id === addEditUserModalInstance.userModel.id)
                  return res.data;
                return item;
              });

              addEditUserModalInstance.cancel();
              notification.success({
                message: "Cập nhật thành công!",
              });
              tblConfig.pagination.current = 1;
              callUserSearchService();
            })
            .catch((err) => {
              console.log("err", err);
              if (err?.response?.data?.code == 21)
                notification.error({
                  message: "Tài khoản này đã được đăng ký."
                });
              else if (err?.response?.data?.code == 22)
                notification.error({
                  message: "Email này đã được đăng ký."
                });
              else if (err?.response?.data?.code == 23)
                notification.error({
                  message: "Số điện thoại này đã được đăng ký."
                });
              else
                notification.error({
                  message: "Cập nhật thất bại!",
                });
            })
            .finally(() => {
              addEditUserModalInstance.loading = false;
            });
      })
      .catch((err) => {
        console.log("err: ", err);

        message.error("Vui lòng kiểm tra lại thông tin!");
      });
  },
});

const filterModel = reactive<{
  q: string;
  searchKey: string;
}>({
  q: "",
  searchKey: "userId",
});
const tblConfig = reactive({
  columns: [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      align: "center",
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "userId",
      key: "username",
      align: "center",
    },
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "fullName",
      align: "center",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      align: "center",
    },
    {
      title: "Ngày sinh",
      key: "birthDate",
      dataIndex: "birthDate",
      align: "center",
    },
    {
      title: "Giới tính",
      key: "sex",
      dataIndex: "sex",
      align: "center",
    },
    {
      title: "Hành động",
      key: "action",
      dataIndex: "action",
      align: "center",
    },
  ],
  data: [],
  loading: false,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 100,
    showSizeChanger: false,
  },
  onChange: (pagination) => {
    tblConfig.pagination.current = pagination.current;
    callUserSearchService();
  },
});

const searchUser = _debounce(() => {
  console.log("search: ", filterModel.q);

  if (filterModel.q === "") tblConfig.pagination.current = 1;
  callUserSearchService();
}, 500);

const callUserSearchService = () => {
  tblConfig.loading = true;
  const payload: any = {
    page: tblConfig.pagination.current - 1,
    size: tblConfig.pagination.pageSize,
  };
  if (filterModel.q) payload[filterModel.searchKey] = filterModel.q;
  UserService.filterUser(payload)
    .then((res) => {
      console.log("search res", res);
      tblConfig.data = res.data.content.map((item: any, index: number) => ({
        ...item,
        stt: index + 1,
      }));
      tblConfig.pagination.total = res.data.totalElements;
    })
    .catch((err) => {
      console.log("err", err);
      message.error("Lấy dữ liệu thất bại!");
    })
    .finally(() => {
      tblConfig.loading = false;
    });
};

const deleteUser = (id) => {
  tblConfig.loading = true;
  UserService.deleteUser(id)
    .then(() => {
      tblConfig.pagination.current = 1;
      callUserSearchService();
      notification.success({
        message: "Xóa thành công!",
      });
    })
    .catch((err) => {
      console.log("delete user failed!");
      notification.error({
        message: "Xóa thất bại!",
      });
    })
    .finally(() => (tblConfig.loading = false));
};
onMounted(() => {
  callUserSearchService();

  // UserService.getALLRoles()
  //     .then(res => {
  //         addEditUserModalInstance.roleList = res.data;
  //     })
  //     .catch(err => {
  //         console.log(err.response.data);
  //     });

  //     UserService.getAllAuthorities()
  //     .then(({ data }) => {
  //         addEditUserModalInstance.authorityData = data.map(e => ({
  //             label: e.authorityName,
  //             value: e.id
  //         }));
  //     });
});
</script>
