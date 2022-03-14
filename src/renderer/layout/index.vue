<template>
  <div class="app-wrapper">
    <el-container>
      <!-- <el-header>Header</el-header> -->
      <el-container>
        <el-row>
          <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="3">
            <el-aside width="auto">
              <Sidebar class="sidebar-container" />
            </el-aside>
          </el-col>
          <el-col :xs="21" :sm="21" :md="21" :lg="21" :xl="21">
            <el-main>
              <AppMain />
            </el-main>
          </el-col>
        </el-row>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import Sidebar from "./components/sidebar";
import AppMain from "./components/appMain";
import { useAppStoreForSetup } from "../store/app";
import { onBeforeMount, getCurrentInstance } from "vue";
const appStoreForSetup = useAppStoreForSetup();
const { proxy }: any = getCurrentInstance();
const { setAppSize } = appStoreForSetup;
const initSizeListener = () => {
  proxy.$electron.onResizeEmit((message: string) => {
    let sizeObject = JSON.parse(message);
    if (sizeObject.width < 768) {
      setAppSize("xs");
    } else if (sizeObject.width >= 768 && sizeObject.width < 992) {
      setAppSize("sm");
    } else if (sizeObject.width >= 992 && sizeObject.width < 1200) {
      setAppSize("md");
    } else if (sizeObject.width >= 1200 && sizeObject.width < 1920) {
      setAppSize("lg");
    } else {
      setAppSize("xl");
    }
  });
  proxy.$electron.getRealSize();
};
onBeforeMount(() => {
  initSizeListener();
});
</script>

<style lang="scss" scoped>
.app-wrapper {
  height: 100%;
  .el-header {
    background-color: #b3c0d1;
  }
  .el-row {
    width: 100%;
  }
  .el-container,
  .el-main,
  .el-aside {
    width: 100%;
    height: 100%;
  }
  .el-main {
    padding: 0px;
  }
}
</style>
