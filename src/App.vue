<template>
  <a-config-provider :locale="locale">
    <router-view/>
  </a-config-provider>
</template>

<script setup lang="ts">
import locale from 'ant-design-vue/es/date-picker/locale/vi_VN';
import 'dayjs/locale/vi';
import dayjs from 'dayjs';

dayjs.locale("vi");

</script>