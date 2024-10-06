<script setup lang="ts">
import { LineChart, BarChart } from "vue-chart-3";
import BarchartComponent from "./components/BarchartComponent.vue";
import { Chart, registerables } from "chart.js";
import { onMounted, reactive, ref, inject, computed } from "vue";
import dayjs, { Dayjs } from "dayjs";
import locale from "ant-design-vue/es/date-picker/locale/vi_VN";
import StatsService from "./services/StatsService";
import { notification } from "ant-design-vue";

const _formatVnCurrency = inject("formatVnCurrency", (p: number) => 0);

Chart.register(...registerables);

const dataInput = reactive({
  isOpen: false,
  selectedOption: null,
  isOpenBarChar: false,
  selectedOptionBarChar: null,
  selectedOptionBarCharIndex: null,
  fakeRole: "systemAdmin",
  changeTimeSale: 1, // 1 -day, 2-month, 3-year
  changeTimeStore: 1, // 1 -day, 2-month, 3-year
  changeTimeBarChar: 1, // 1 -day, 2-month, 3-year
});
const revenueTabbars = ref([
  { id: 1, name: "Hôm nay" },
  { id: 2, name: "7 ngày qua" },
  { id: 3, name: "30 ngày qua" },
]);

const changeTimeSale = (value: number) => {
  dataInput.changeTimeSale = value;
  onCallApiRevenue();
  datePickerVal.value = [];
  isOpenDatepicker.value = false;
};
//line chart1
const lineChartData = reactive({
  labels: ["11"],
  datasets: [
    {
      label: "ss/9/2023",
      data: [130],
      borderColor: "#E87019",
      fill: {
        target: "origin",
        above: "rgba(255, 241, 237, 0.3)", // Màu nền ở trên
        below: "#FFF1ED", // Màu nền ở dưới
      },
    },
  ],
});
const lineChartOptions = {
  scales: {
    x: {
      beginAtZero: true,
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      border: {
        color: "red",
        display: false,
      },
      grid: {
        display: true,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
      position: "top", // Change position to 'top', 'left', 'right', or 'chartArea'
      labels: {
        color: "#333", // Change label color
        usePointStyle: true, // Use point-style for legend icon
      },
    },
    tooltip: {
      usePointStyle: true,
      bodyAlign: "center", // căn chỉnh chữ ở giữa ghi chú
      callbacks: {
        title: function (tooltipItems: any, data: any) {
          return tooltipItems[0].dataset.label + tooltipItems[0].label;
        },
        label: function (context: any) {
          const value = context.parsed.y;
          return `${_formatVnCurrency(value)}`;
        },
        labelTextColor: function (context: any) {
          return "#FFFFFF";
        },
        labelPointStyle: function (context: any) {
          return {
            pointStyle: false,
            rotation: 0,
          };
        },
        labelColor: function (context: any) {
          return {
            borderColor: "#FF7B1C",
            backgroundColor: "#FF7B1C",
            borderWidth: 1,
            borderDash: [2, 2],
            borderRadius: 4,
          };
        },
      },
      backgroundColor: "black",
    },
  },
  elements: {
    line: {
      borderWidth: 1, // Độ rộng của đường line
    },
  },
};

// Bar Chart Data
const barChartData = reactive({
  labels: [],
  datasets: [
    {
      label: '',
      data: [
      ],
      backgroundColor: '#FFC297',
      borderColor: '#FFC297',
      borderWidth: 1,
    }
  ]
});

const barChartOptions = {
  scales: {
    x: {
      beginAtZero: true,
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      border: {
        color: "red",
        display: false,
      },
      grid: {
        display: true,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
      position: "top", // Change position to 'top', 'left', 'right', or 'chartArea'
      labels: {
        color: "#333", // Change label color
        usePointStyle: true, // Use point-style for legend icon
      },
    },
    tooltip: {
      usePointStyle: true,
      bodyAlign: "center", // căn chỉnh chữ ở giữa ghi chú
      callbacks: {
        title: function (tooltipItems: any, data: any) {
          return tooltipItems[0].label;
        },
        label: function (context: any) {
          const value = context.parsed.y;
          return `Doanh thu ${_formatVnCurrency(value)} - Đã bán ${context.raw.z}`;
        },
        labelTextColor: function (context: any) {
          return "#FFFFFF";
        },
        labelPointStyle: function (context: any) {
          return {
            pointStyle: false,
            rotation: 0,
          };
        },
        labelColor: function (context: any) {
          return {
            borderColor: "#FF7B1C",
            backgroundColor: "#FF7B1C",
            borderWidth: 1,
            borderDash: [2, 2],
            borderRadius: 4,
          };
        },
      },
      backgroundColor: "black",
    },
  },
  elements: {
    line: {
      borderWidth: 1, // Độ rộng của đường line
    },
  },

};


// Store Data
const topRevenueProducts = ref<
  {
    tieuDe: string;
    soLuong: number;
    total: number;
  }[]
>([]);

const isOpenDatepicker = ref<boolean>(false);
const datePickerVal = ref<any[]>([dayjs(), dayjs()]);
const dateLabel = ref<string>("");

const onClickOpenDatepicker = () => {
  isOpenDatepicker.value = true;
};
const onCompleteChooseDate = () => {
  dataInput.changeTimeSale = 0;
  isOpenDatepicker.value = false;
  onCallApiRevenue();
};

const onCallApiRevenue = () => {
  console.log("on call API: ", datePickerVal.value);
  let startDate = "";
  let endDate = "";

  productRevenueTblConfig.pagination.current = 1;
  if (dataInput.changeTimeSale == 1) {
    // today
    startDate = dayjs().format("YYYY-MM-DDT00:00:00");
    endDate = dayjs().format("YYYY-MM-DDT23:59:59");
    getRevenueToday(startDate, endDate);
  } else if (dataInput.changeTimeSale == 2) {
    // last 7 day
    startDate = dayjs().subtract(6, "day").format("YYYY-MM-DDT00:00:00");
    endDate = dayjs().format("YYYY-MM-DDT23:59:59");
    getRevenueByRange(startDate, endDate);
  } else if (dataInput.changeTimeSale == 3) {
    // last 30 day
    startDate = dayjs().subtract(29, "day").format("YYYY-MM-DDT00:00:00");
    endDate = dayjs().format("YYYY-MM-DDT23:59:59");
    getRevenueByRange(startDate, endDate);
  } else {
    startDate = datePickerVal.value[0].format("YYYY-MM-DDT00:00:00");
    endDate = datePickerVal.value[1].format("YYYY-MM-DDT23:59:59");

    const today = dayjs().format("YYYY-MM-DD");
    if ((startDate.startsWith(today) && endDate.startsWith(today)) || (startDate.slice(0, 10) == endDate.slice(0, 10)))
      getRevenueToday(startDate, endDate);
    getRevenueByRange(startDate, endDate);
  }
};

let startDateF = "";
let endDateF = "";
const onCallApiProductRevenue = () => {
  productRevenueTblConfig.loading = true;
  StatsService.getProductRevenueByTime(
    startDateF,
    endDateF,
    productRevenueTblConfig.pagination.current - 1,
    productRevenueTblConfig.pagination.pageSize
  )
    .then((res) => {
      console.log("product revenue: ", res);
      topRevenueProducts.value = res.data.content.map(
        (item: any, index: number) => ({ ...item, stt: index + 1 })
      );
      productRevenueTblConfig.pagination.total = res.data.totalElements;

      const data = res.data.content.map((item: any) => ({
        x: item.tieuDe,
        y: item.total,
        z: item.soLuong
      }));
      console.log("data bar: ", data)

      barChartData.labels = res.data.content.map((item: any) => item.tieuDe)
      barChartData.datasets = [
        {
          label: '',
          data,
          backgroundColor: '#FFC297',
          borderColor: '#FFC297',
          borderWidth: 1,
        }
      ]
    }
    )
    .catch((err) => {
      console.log("get revenue failed!", err);
      notification.error({
        message: "Lấy dữ liệu thất bại!",
      });
    })
    .finally(() => (productRevenueTblConfig.loading = false));
};
const getRevenueToday = (startDate: string, endDate: string) => {
  dateLabel.value = dayjs().format("DD/MM/YYYY");
  startDateF = startDate;
  endDateF = endDate;
  onCallApiProductRevenue();
  StatsService.getRevenueToDay(startDate, endDate)
    .then((res) => {
      console.log("revenue data: ", res.data);

      const chartMap = new Map<
        number,
        {
          total: number;
          returned: number;
        }
      >();
      for (let i = 0; i < 24; ++i) {
        chartMap.set(i, {
          total: 0,
          returned: 0,
        });
      }
      res.data.forEach((item: any) => {
        if (chartMap.has(Number(item.time)))
          chartMap.set(Number(item.time), {
            total: item.total,
            returned: item.returned,
          });
      });

      console.log("chart:");
      const labels: any = [];
      const data: any = [];
      const data1: any = [];

      chartMap.forEach((v, k) => {
        labels.push(`${k}h`);
        data.push(v.total);
        data1.push(v.returned);
      });
      setLineChart(labels, data, data1);
    })
    .catch((err) => {
      console.log("get revenue failed!", err);
      notification.error({
        message: "Lấy dữ liệu thất bại!",
      });
    });
};
const getRevenueByRange = (startDate: string, endDate: string) => {
  dateLabel.value = `Từ ${dayjs(startDate).format("DD/MM/YYYY")} - ${dayjs(
    endDate
  ).format("DD/MM/YYYY")}`;

  startDateF = startDate;
  endDateF = endDate;
  onCallApiProductRevenue();
  StatsService.getRevenueByTime(startDate, endDate)
    .then((res) => {
      console.log("revenue data: ", res.data);

      const end = dayjs(endDate);
      const dateMap = new Map<
        string,
        {
          total: number;
          returned: number;
        }
      >();

      // Initialize map with 0 for each day between start and end dates
      let currentDate = dayjs(startDate);
      while (currentDate.isBefore(end)) {
        const dateString = currentDate.format("YYYY-MM-DD"); // Get YYYY-MM-DD format
        dateMap.set(dateString, {
          total: 0,
          returned: 0,
        });
        currentDate = currentDate.add(1, "day");
      }

      // Update map with actual data
      // (Assuming you have data similar to the structure in your previous example)
      res.data.forEach((item: any) => {
        const itemDate = dayjs(item.time).format(`YYYY-MM-DD`); // Assuming date is in YYYY-MM-DD format
        if (dateMap.has(itemDate)) {
          console.log("hasss00", item);

          dateMap.delete(itemDate);
          dateMap.set(itemDate, {
            total: item.total,
            returned: item.returned,
          });
        }
      });
      console.log("data map range: ", dateMap);

      const labels: any = [];
      const data: any = [];
      const data1: any = [];
      dateMap.forEach((v, k) => {
        labels.push(dayjs(k).format("DD/MM"));
        data.push(v.total);
        data1.push(v.returned);
      });

      setLineChart(labels, data, data1);

      // if (dateMap.size > 40) {
      //     const entries = [...dateMap.entries()];
      //     for (let i = 0; i < entries.length - 24 + 1; i++) {
      //         const window = entries.slice(i, i + 24);
      //         const average = window.reduce((sum, [, value]) => sum + value, 0) / 24;
      //         const date = window[23][0]; // Take the date from the last entry in the window

      //         labels.push(date);
      //         data.push(average);
      //     }
      // }
      // else
    })
    .catch((err) => {
      console.log("get revenue failed!", err);
      notification.error({
        message: "Lấy dữ liệu thất bại!",
      });
    });
};

const setLineChart = (labels: string[], data: number[], data1: number[]) => {
  lineChartData.labels = labels;
  lineChartData.datasets = [
    {
      label: "Doanh thu ",
      data: data,
      borderColor: "#E87019",
      fill: {
        target: "origin",
        above: "rgba(255, 241, 237, 0.3)", // Màu nền ở trên
        below: "#FFF1ED", // Màu nền ở dưới
      },
    },
    // {
    //   label: "Hoàn trả ",
    //   data: data1,
    //   borderColor: "#A5A5A5",
    //   fill: {
    //     target: "origin",
    //     above: "gray", // Màu nền ở trên
    //     below: "gray", // Màu nền ở dưới
    //   },
    // },
  ];
};

const disabledDate = (current: Dayjs) => {
  if (!datePickerVal.value || (datePickerVal.value as any).length === 0) {
    return false;
  }
  //   const tooLate = datePickerVal.value[0] && dayjs().diff(datePickerVal.value[0], 'days') > 0;
  return false;
};

const productRevenueTblConfig = reactive({
  loading: false,
  columns: [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      align: "center",
      width: "70px",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tieuDe",
      key: "tieuDe",
      width: "300px",
    },
    {
      title: "Số lượng bán",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    {
      title: "Doanh thu",
      dataIndex: "total",
      key: "total",
      align: "center",
    },
  ],
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  onPageChange: (pagination: { current: number }) => {
    productRevenueTblConfig.pagination.current = pagination.current;
    onCallApiProductRevenue();
  },
});
onMounted(() => {
  console.log("open date picker: ");
  onCallApiRevenue();
});
</script>

<template>
  <a-page-header @back="() => $router.go(-1)" class="rounded-[5px]" style="
      border: 1px solid rgb(235, 237, 240);
      margin: 20px;
      background: white;
    ">
    <template #title>
      <h3 class="text-2xl mb-0">Thống kê</h3>
    </template>
    <a-space direction="vertical">
      <div class="inline-flex items-center gap-[8px]">
        <div v-for="(item, index) in revenueTabbars"
          class="flex justify-center items-center gap-[10px] rounded-[4px] cursor-pointer relative" :class="dataInput.changeTimeSale == index + 1
            ? 'bg-[#FF7B1C] text-[#FFFFFF]'
            : 'bg-[#F4F4F4] text-[#6E6E6E]'
            " @click="changeTimeSale(index + 1)">
          <span class="text-[14px] font-[400] leading-[18px] py-[2px] px-[12px]">{{ item.name }}</span>
        </div>

        <div class="inline-flex items-center gap-[29px]">
          <div class="grid">
            <a-button class="w-fit" size="small" @click="onClickOpenDatepicker">
              Chọn thời gian
            </a-button>
            <a-range-picker v-model:value="datePickerVal" :disabled-date="disabledDate" :open="isOpenDatepicker"
              @change="onCompleteChooseDate" :locale="locale" class="absolute" style="visibility: hidden" size="small" />
          </div>
          <div class="flex gap-[4px] items-center">
            <span class="align-middle font-[400] leading-[148%] text-[#555555]">
              {{ dateLabel }}
            </span>
          </div>
        </div>
      </div>
    </a-space>

    <div class="">
      <div class="pb-[24px] bg-white">
        <div class="flex items-center gap-[16px] justify-start py-[24px]">
          <span class="text-[20px] font-[500] leading-[28px] text-[#242424]">Doanh thu</span>
        </div>

        <div class="flex flex-col items-start gap-[26px]">
          <div class="w-full">
            <div
              class="hidden flex items-center h-[16px] w-[72px] text-[#A5A5A5] text-[12px] font-[400] leading-[136%] gap-[8px] mb-[20px]">
              <i class="fa-solid fa-circle text-[3px]"></i>
              <span>Đơn vị : triệu đồng</span>
            </div>
            <LineChart :chartData="lineChartData" :options="lineChartOptions" class="w-full" />
            <div class="flex items-center justify-center gap-[29px] w-full mt-[20px]">
              <div class="flex gap-[4px] items-center">
                <div class="h-[5px] w-[5px] rounded-full bg-[#FF7B1C]" />
                <span class="align-middle text-[12px] font-[400] leading-[148%] text-[#555555]">Doanh thu</span>
              </div>
              <div class="flex gap-[4px] items-center hidden">
                <div class="h-[5px] w-[5px] rounded-full bg-gray-500" />
                <span class="align-middle text-[12px] font-[400] leading-[148%] text-[#555555]">Hoàn trả</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a-card style="padding: 0">
        <div class="bg-white rounded-[4px] flex flex-col items-start gap-[20px]">
          <span class="text-[20px] font-[500] leading-[28px] text-[#242424]">Top 10 sản phẩm bán chạy</span>
          <!-- <BarchartComponent /> -->
          <BarChart :chartData="barChartData" :options="barChartOptions" class="w-full" />
          <div class="flex items-center justify-center gap-[29px] w-full mt-[20px]">
            <div class="flex gap-[4px] items-center">
              <div class="h-[5px] w-[5px] rounded-full bg-[#FF7B1C]" />
              <span class="align-middle text-[12px] font-[400] leading-[148%] text-[#555555]">Doanh thu top 10 sản
                phẩm</span>
            </div>
          </div>
          <!-- <a-table class="w-full" :columns="productRevenueTblConfig.columns" :dataSource="topRevenueProducts"
                        :pagination="productRevenueTblConfig.pagination" :loading="productRevenueTblConfig.loading"
                        @change="productRevenueTblConfig.onPageChange">
                        <template #bodyCell="{ column, text, record }">
                            <template v-if="column.dataIndex === 'total'">
                                {{ _formatVnCurrency(record.total) }}
                            </template>
                            <template v-else-if="column.dataIndex === 'tieuDe'">
                                <div class="flex items-center gap-[8px]">
                                    <img class="h-[50px] w-[40px] rounded-[2px]" :src="record.anhChinh">
                                    <span>{{ text }}</span>
                                </div>
                            </template>
                        </template>
                    </a-table> -->
        </div>
      </a-card>

      <div class="flex justify-between gap-[24px] mt-[20px] mb-[60px] hidden">
        <a-card style="padding: 0; display: none">
          <div class="bg-white rounded-[4px] flex flex-col gap-[36px] items-start w-full h-[432px]">
            <div class="flex gap-[16px] justify-start items-center">
              <span class="text-[20px] font-[500] leading-[28px] text-[#242424]">5 sản phẩm có doanh thu cao nhất</span>
            </div>
            <div class="relative w-full min-h-[287px]">
              <!-- <BarchartComponent /> -->
            </div>
          </div>
        </a-card>

        <a-card style="padding: 0">
          <div class="bg-white rounded-[4px] flex flex-col items-start gap-[20px]">
            <span class="text-[20px] font-[500] leading-[28px] text-[#242424]">5 sản phẩm có doanh thu cao nhất</span>
            <table class="w-full">
              <thead>
                <tr class="flex w-[388px] pb-[12px] items-start justify-between gap-[88px]">
                  <th class="text-[#8A8A8A] text-[12px] font-[400] leading-[16px]">
                    Tên sản phẩm
                  </th>
                  <th class="text-[#8A8A8A] text-[12px] font-[400] leading-[16px]">
                    Số lượng
                  </th>
                  <th class="text-[#8A8A8A] text-[12px] font-[400] leading-[16px]">
                    Doanh thu
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in topRevenueProducts" :key="index"
                  class="flex items-center gap-[88px] self-stretch justify-between h-[53px]">
                  <td>
                    <span class="text-[#000000] text-[14px] font-[500] leading-[16px]">{{ item.tieuDe }}</span>
                  </td>
                  <td>
                    <span class="text-[#000000] text-[14px] font-[500] leading-[16px]">{{ item.soLuong }}</span>
                  </td>
                  <td>
                    <span class="text-[#000000] text-[14px] font-[500] leading-[16px]">{{ item.total }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </a-card>
      </div>
    </div>
  </a-page-header>
</template>
