<template>
  <div class="mc-content">
    <el-row>
      <el-col :xs="5" :sm="5" :md="5" :lg="6" :xl="6">
        <EquipmentList></EquipmentList>
      </el-col>
      <el-col :xs="19" :sm="19" :md="19" :lg="18" :xl="18">
        <el-tabs type="border-card" class="messageContent">
        <el-tab-pane label="Action">
            <Action></Action>
          </el-tab-pane>
          <el-tab-pane label="NetWork">
            <NetWork></NetWork>
          </el-tab-pane>
          <el-tab-pane label="SocketMessage">
            <SocketMessageList></SocketMessageList>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import EquipmentList from "./EquipmentList";
import SocketMessageList from "./SocketMessageList";
import NetWork from "./NetWork";
import Action from "./Action";
</script>

<style lang="scss" scope>
.mc-content {
  height: 100%;
  .el-row {
    height: 100%;
  }
  .el-col {
    height: 100%;
  }
  .networkContent,
  .messageContent {
    height: 100%;
    display: flex;
    flex-direction: column;
    .el-tabs__content {
      height: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 0px;
      .el-tab-pane {
        display: flex;
        flex-direction: column;
        flex: 1;
      }
    }
  }
}
</style>
