<template>
  <div class="action-list-box">
    <div class="action-filter-box">
      <div style="white-space: nowrap">搜索:</div>
      <el-input
        class="filter-action-input"
        v-model="filterActionText"
        placeholder="请输入搜索"
      />
      <el-button type="danger" @click="clearActionList">清空</el-button>
    </div>
    <div class="action-list-content">
      <VirtualTable :data="filtersActionList" dataKey="messageId" @cellClick="openDetails" :itemSize="40">
        <el-table-column prop="message" width="170" label="dateTime">
          <template #default="scope">
            <div class="text-ellipsis">{{switchMessage(switchMessage(scope.row.message).data).dateTime}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="message" width="150" label="actionName">
          <template #default="scope">
            <div class="text-ellipsis">{{switchMessage(switchMessage(scope.row.message).data).viewC12c.actionName}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="message" width="200" label="eventType">
          <template #default="scope">
            <div class="text-ellipsis">{{switchMessage(switchMessage(scope.row.message).data).eventType}}</div>
          </template>
        </el-table-column>
        <el-table-column
          class-name="action-list-content-message"
          prop="message"
          width="150"
          label="text">
          <template #default="scope">
            <div class="text-ellipsis">{{switchMessage(switchMessage(scope.row.message).data).viewC12c.text}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="message" width="350" label="viewPath">
          <template #default="scope">
            <div class="text-ellipsis">{{switchMessage(switchMessage(scope.row.message).data).viewC12c.viewPath}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="message" width="150" label="inputValue">
          <template #default="scope">
            <div class="text-ellipsis">{{switchMessage(switchMessage(scope.row.message).data).viewC12c.inputValue}}</div>
          </template>
        </el-table-column>
      </VirtualTable>
    </div>
    <el-drawer
      v-model="drawer"
      modal-class="action-message-detail"
      style="position: absolute"
      :modal="false"
      direction="btt">
      <template #title>
        <div class="moveBtn" v-move="'action-message-detail'"></div>
        <div class="title">动作详情</div>
      </template>
      <json-viewer
        :value="actionDetail"
        :expand-depth="5"
        boxed
        copyable
        sort
        expanded
      />
    </el-drawer>
  </div>
</template>
<script lang="ts" setup>
import "vue3-json-viewer/dist/index.css";
import VirtualTable from "../../../components/VirtualTable";
import { ref, getCurrentInstance, onMounted, watch, computed } from "vue";
import appStore from "../../../store";
import { storeToRefs } from "pinia";
import { canJsonParse } from "../../../utils";
const { passagewayActive, passagewayName } = storeToRefs(appStore.socketPassageWay);
const { proxy }: any = getCurrentInstance();
const activeActionInfo = ref("");
const filterActionText = ref("");
const filtersActionList = ref([]);
const actionList = ref({});
const drawer = ref(false);
const actionDetail = ref("");
const switchMessage = (val) => {
  try {
    let messageObject = {};
    val && (messageObject = JSON.parse(val));
    return messageObject;
  } catch (error) {
    console.error(error);
    return {};
  }
};
const clearActionList = () => {
  actionList.value[passagewayName.value] = [];
};
const initListener = () => {
  let messageId = 0;
  proxy.$electron.onMulticontrolAction(async (info: any) => {
    try {
      messageId++;  
      let jsonInfo = JSON.parse(info);
      jsonInfo.messageId = messageId
      actionList.value[jsonInfo.clientInfo.requestPath] ||
        (actionList.value[jsonInfo.clientInfo.requestPath] = []);
      actionList.value[jsonInfo.clientInfo.requestPath].push(jsonInfo);
    } catch (error) {
      console.error(error);
    }
  });
};
const openDetails = (row, column, cell, event) => {
  try {
    drawer.value = true;
    let value = JSON.parse(row.message);
    value.data = JSON.parse(value.data);
    for (const key in value.data) {
      if (Object.prototype.hasOwnProperty.call(value.data, key)) {
        if (canJsonParse(value.data[key])) {
          value.data[key] = JSON.parse(value.data[key]);
        }
      }
    }
    actionDetail.value = value.data;
  } catch (error) {
    console.error(error);
  }
};
watch(
  [() => actionList.value, () => passagewayName.value, () => filterActionText.value],
  (newValue, oldValue) => {
    let list = actionList.value[passagewayName.value];
    if (filterActionText.value.trim() !== "") {
      list = list.filter((item) => item.message.indexOf(filterActionText.value) >= 0);
    }
    filtersActionList.value = list;
  },
  { deep: true }
);
onMounted(async () => {
  initListener();
});
</script>
<style lang="scss" scope>
.action-list-box {
  height: 100%;
  display: flex;
  flex-direction: column;
  .action-filter-box {
    display: flex;
    align-items: center;
    padding: 15px 15px 0 15px;
    .filter-action-input {
      margin-left: 10px;
      margin-right: 10px;
    }
  }
  .action-list-content {
    display: flex;
    flex-direction: column;
    height: 0px;
    flex-grow: 1;
    padding: 0 15px 0 15px;
    .el-table__inner-wrapper {
      overflow: auto;
      display: flex;
      flex-direction: column;
      .el-table__body-wrapper {
        height: 100%;
        flex: 1;
      }
    }
    .cell {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
  }
  .action-message-detail {
    position: relative !important;
    height: 40%;
    .el-drawer {
      height: 100% !important;
      .el-drawer__header {
        margin-bottom: 0;
      }
    }
    #el-drawer__title {
      .moveBtn {
        width: 100%;
        height: 3px;
        /* opacity: 0; */
        position: absolute;
        left: 0px;
        top: 0;
        cursor: ns-resize;
      }
      .title {
        margin-right: auto;
        font-size: 16px;
      }
    }
  }
}
</style>
