<template>
  <div class="vue3-virtual-list-container" ref="root" @scroll.passive="handleScroll">
    <div
      class="vue3-virtual-list-scroll"
      :style="`height: ${
        scrollHeight ? `${scrollHeight}px` : '100%'
      };padding-top: ${paddingTop}px`"
    >
      <el-table
        class="vue3-virtual-list-item-container"
        :data="pool"
        :row-key="dataKey"
        :style="`overflow: unset;`"
        :row-class-name="rowClassName"
        @cell-click="cellClick"
      >
        <slot></slot>
      </el-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, toRefs, onMounted, watch, defineProps, defineEmits,getCurrentInstance } from "vue";
const emit = defineEmits(["cellClick", "rowClassName"]);
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  dataKey: {
    type: String,
    default: () => "id",
  },
  itemSize: {
    type: Number,
    default: () => 40,
  },
  poolBuffer: {
    type: Number,
    default: () => 50,
  },
  fixedPaddingTop:{
    type: Number,
    default: () => 40,
  },
  rowClassName:{
    type: Function,
  }
});
const { data, poolBuffer, itemSize, fixedPaddingTop,rowClassName } = toRefs(props);
const root = ref<HTMLElement | null>(null);
const pool = ref<any[]>([]);
const scrollHeight = ref(data.value.length * itemSize.value + fixedPaddingTop.value);
let containerSize = 0;
const paddingTop = ref(0);
let isScrollBusy = false;
const handleScroll = () => {
  if (!root.value) return;
  if (isScrollBusy) return;
  isScrollBusy = true;
  requestAnimationFrame(() => {
    isScrollBusy = false;
    if (!root.value) return;
    const range: number[] = [];
    range[0] =
      Math.floor((root.value.scrollTop - fixedPaddingTop.value)/ itemSize.value) -
      Math.floor(poolBuffer.value / 2);
    range[0] = Math.max(range[0], 0);
    range[1] =
      range[0] + Math.floor((root.value.clientHeight - fixedPaddingTop.value) / itemSize.value) + poolBuffer.value;
    range[1] = Math.min(range[1], data.value.length);
    pool.value = data.value
      .slice(range[0], range[1])
      .map((v, i) => ({ ...v, _index: range[0] + i }));
    paddingTop.value = range[0] * itemSize.value + fixedPaddingTop.value;
  });
};
// const rowClassName = ({ row, rowIndex }) => {
//     //   if (row.type === "accept") {
//     //     return "accept-row";
//     //   } else if (row.type === "send") {
//     //     return "send-row";
//     //   }
//     //   return "";
//   let result = ''
//   emit("rowClassName", row, rowIndex , val => { result = val });
//   console.log(result)
//   return result
// };
const cellClick = (row, column, cell, event) => {
  emit("cellClick", row, column, cell, event);
};
watch(
  [() => data.value],
  (newValue, oldValue) => {
    scrollHeight.value = data.value.length * itemSize.value + fixedPaddingTop.value;
    handleScroll();
  },
  { deep: true }
);
onMounted(() => {
  if (!root.value) return;
  containerSize = root.value.clientHeight;
  const contentLines = Math.ceil((containerSize - fixedPaddingTop.value)/ itemSize.value);
  const totalLines = contentLines + poolBuffer.value;
  const range = [0, totalLines];
  pool.value = data.value
    .slice(range[0], range[0] + range[1])
    .map((v, i) => ({ ...v, _index: range[0] + i }));
});
</script>
<style lang="scss" scope>
.vue3-virtual-list-container {
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 100px;
  overflow: auto;
}
.vue3-virtual-list-scroll {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.vue3-virtual-list-item-container {
  width: 100%;
}
</style>
