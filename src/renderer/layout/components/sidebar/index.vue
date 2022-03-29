<template>
  <div class="sidebar-wrapper">
    <!-- <div class="sidebar-wrapper-logo-box">
      <img src="../../../assets/logo.png" class="sidebar-wrapper-logo" />
    </div> -->
    <el-scrollbar wrap-class="sidebar-wrapper-scrollbar">
      <el-menu
        :unique-opened="true"
        :default-active="activeMenu"
        background-color="#152d3d"
        text-color="rgb(167, 177, 194)"
        active-text-color="#fff"
        mode="vertical"
      >
        <SidebarItem
          v-for="routeItem in routes"
          :key="routeItem.path"
          :item="routeItem"
          :base-path="routeItem.path"
          :is-collapse="isCollapse"
        ></SidebarItem>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import SidebarItem from "./sidebar-item.vue";
import { useRoute } from "vue-router";
import appStore from "../../../store";
import { storeToRefs } from "pinia";
const route = useRoute();
const { routes } = storeToRefs(appStore.routes);
const { appSize } = storeToRefs(appStore.app);
const activeMenu = computed(() => {
  const { meta, path } = route;
  if (meta !== null || meta !== undefined) {
    if (meta.activeMenu) {
      return meta.activeMenu;
    }
  }
  return path;
});
const isCollapse = computed(() => {
  return appSize.value !== "lg" && appSize.value !== "xl";
});
</script>
<style lang="scss">
.sidebar-wrapper {
  // 重置当前页面的 element-plus css, ，注意，虽然没有加 scoped 标识，但是被该页面的 sidebar-container 类名包裹，所以不会影响其他页面
  .horizontal-collapse-transition {
    transition: 0s width ease-in-out, 0s padding-left ease-in-out,
      0s padding-right ease-in-out;
  }

  &-scrollbar {
    overflow-x: hidden !important;
  }

  .el-scrollbar__view {
    height: 100%;
  }

  .el-scrollbar__bar {
    &.is-vertical {
      right: 0;
    }

    &.is-horizontal {
      display: none;
    }
  }
}
</style>

<style lang="scss" scoped>
.sidebar-wrapper {
  // transition: width 0.28s;
  height: 100%;
  overflow: hidden;
  position:relative;
  &-scrollbar {
    height: calc(100% - 84px);
    overflow-x: hidden !important;
  }
  &-logo-box {
    position: relative;
    background: #0c202b;
    text-align: center;
    overflow: hidden;
    .sidebar-wrapper-logo {
      width: 32px;
      height: 32px;
      vertical-align: middle;
      margin-right: 0;
      display: inline-block;
    }
  }
  .el-menu {
    border: none;
    height: 100%;
    width: 100% !important;
  }
}
</style>
