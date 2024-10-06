<template>
  <a-page-header @back="() => $router.go(-1)" class="rounded-[5px]" style="border: 1px solid rgb(235, 237, 240); margin: 20px; background: white;">
    <template #title>
      <h3 class="text-2xl mb-0">
        {{ $route.params?.id ? "Cập nhật sản phẩm" : "Thêm mới sản phẩm" }}
      </h3>
    </template>

    <AddEditProductForm />
  </a-page-header>
</template>

<script setup lang="ts">
import AddEditProductForm from "./components/AddEditProductForm.vue";
</script>
