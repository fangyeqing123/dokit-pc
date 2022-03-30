<template>
  <div class="socket-message-list-box">
    <div class="message-type-box">
      <div>type:</div>
      <el-select
        v-model="messageTypeActive"
        class="message-type-select"
        filterable
        placeholder="消息类型筛选"
        popper-class="message-type-select-content"
      >
        <el-option
          v-for="item in messageTypeList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
      <div>搜索:</div>
      <el-input
        class="filter-message-input"
        v-model="filterMessageText"
        placeholder="请输入搜索"
      />
      <el-button type="danger" @click="clearMessageList">清空</el-button>
    </div>
    <div class="message-list-content">
      <el-table
        :data="filtersMessageList"
        stripe
        @cell-click="openDetails"
        style="width: 100%; flex-grow: 1; overflow: auto; height: 0; display: flex"
        :row-class-name="messageListRowClassName">
        <el-table-column
          class-name="message-list-content-message"
          prop="message"
          label="数据">
          <template #default="scope">
            <svg
              v-if="messageState(scope.$index, scope.row)"
              t="1646992150554"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="4913"
              width="200"
              height="200"
            >
              <path
                d="M771.512499 514.290159 511.614214 64.132646 251.715929 514.290159 414.441057 514.290159 414.441057 959.653483 608.786347 959.653483 608.786347 514.290159Z"
                p-id="4914"
                fill="#1296db"
              ></path>
            </svg>
            <svg
              v-else
              t="1646992479245"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="1412"
              width="200"
              height="200"
            >
              <path
                d="M771.512499 509.49597 511.614214 959.653483 251.715929 509.49597 414.441057 509.49597 414.441057 64.132646 608.786347 64.132646 608.786347 509.49597Z"
                p-id="1413"
                fill="#d81e06"
              ></path>
            </svg>
            <span
              style="margin-left: 10px"
              v-if="switchMessage(scope.row.message).type !== 'DATA'"
              >{{ scope.row.message }}</span
            >
            <template v-else>
              <span style="margin-left: 10px"
                >type：{{ switchMessage(scope.row.message).type }}</span
              >
              <span
                style="margin-left: 10px"
                v-if="switchMessage(scope.row.message).contentType"
                >contentType：{{ switchMessage(scope.row.message).contentType }}</span
              >
              <span
                style="margin-left: 10px"
                v-if="switchMessage(switchMessage(scope.row.message).data).url"
                >{{ switchMessage(switchMessage(scope.row.message).data).url }}</span
              >
            </template>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="time" label="时间"></el-table-column> -->
      </el-table>
    </div>
    <el-drawer
      v-model="drawer"
      modal-class="socketMessageDetail"
      style="position: absolute"
      :modal="false"
      direction="btt"
    >
      <template #title>
        <div class="moveBtn" v-move="'socketMessageDetail'"></div>
        <div class="title">消息详情</div>
      </template>
      <json-viewer :value="messageDetail" copyable boxed sort />
    </el-drawer>
  </div>
</template>
<script lang="ts" setup>
import "vue3-json-viewer/dist/index.css";
import { ref, getCurrentInstance, onMounted, watch, computed } from "vue";
import appStore from "../../../store";
import { storeToRefs } from "pinia";
import { canJsonParse } from "../../../utils";
const { proxy }: any = getCurrentInstance();
const { passagewayActive } = storeToRefs(appStore.socketPassageWay);
const messageTypeList = ref([
  {
    value: "ALL",
    label: "ALL",
  },
  {
    value: "LOGIN",
    label: "LOGIN",
  },
  {
    value: "BROADCAST",
    label: "BROADCAST",
  },
  {
    value: "DATA",
    label: "DATA",
  },
  {
    value: "HEART_BEAT",
    label: "HEART_BEAT",
  },
]);
const messageTypeActive = ref("ALL");
const messageList = ref({});
const filtersMessageList = ref([]);
const messageDetail = ref("");
const drawer = ref(false);
const filterMessageText = ref("");
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
const messageListRowClassName = ({ row, rowIndex }) => {
  if (row.type === "accept") {
    return "accept-row";
  } else if (row.type === "send") {
    return "send-row";
  }
  return "";
};
const initListener = () => {
  proxy.$electron.onMulticontrolMessage((message: any) => {
    try {
      let data = JSON.parse(message);
      let mergeRequest = false;
      let mergeRequestIndex = -1;
      messageList.value[data.clientInfo.requestPath] ||
        (messageList.value[data.clientInfo.requestPath] = []);
      let dataContentType = JSON.parse(data.message)?.contentType;
      let dataDid = JSON.parse(JSON.parse(data.message)?.data)?.did;
      if (dataContentType === "response") {
        messageList.value[data.clientInfo.requestPath].some((item, index) => {
          if (dataDid && JSON.parse(JSON.parse(item.message)?.data)?.did === dataDid) {
            mergeRequest = true;
            mergeRequestIndex = index;
            return true;
          }
        });
      }
      if (mergeRequest) {
        let newData = JSON.parse(data.message);
        let messageData = JSON.parse(newData.data);
        messageData.url = JSON.parse(
          JSON.parse(
            messageList.value[data.clientInfo.requestPath][mergeRequestIndex].message
          ).data
        ).url;
        newData.data = JSON.stringify(messageData);
        data.message = JSON.stringify(newData);
      }
      messageList.value[data.clientInfo.requestPath].push(data);
    } catch (error) {
      console.error(error);
    }
  });
};
const messageState = (index: number, row: any) => {
  if (row?.type === "send") {
    return true;
  } else {
    return false;
  }
};
const clearMessageList = () => {
  messageList.value[passagewayName.value] = [];
};
const filtersMessageListWatch = () => {
  try {
    if (messageTypeActive.value === "ALL") {
      return messageList.value[passagewayName.value] || [];
    }
    return (messageList.value[passagewayName.value] || []).filter((item) => {
      return JSON.parse(item.message).type === messageTypeActive.value;
    });
  } catch (error) {
    console.error(error);
    return messageList.value[passagewayName.value] || [];
  }
};
const passagewayName = computed(() => {
  return `/proxy/multicontrol/${
    passagewayActive.value.split("/")[passagewayActive.value.split("/").length - 1]
  }`;
});
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
    messageDetail.value = value;
  } catch (error) {
    console.error(error);
  }
};
watch(
  [
    () => messageList.value,
    () => passagewayName.value,
    () => messageTypeActive.value,
    () => filterMessageText.value,
  ],
  (newValue, oldValue) => {
    let list = filtersMessageListWatch();
    if (filterMessageText.value.trim() !== "") {
      list = list.filter((item) => item.message.indexOf(filterMessageText.value) >= 0);
    }
    if (list?.length > 500) {
      filtersMessageList.value = list.slice(-500);
    } else {
      filtersMessageList.value = list;
    }
  },
  { deep: true }
);
onMounted(async () => {
  initListener();
});
</script>
<style lang="scss" scope>
.socket-message-list-box {
  height: 100%;
  display: flex;
  flex-direction: column;
  .message-type-box {
    display: flex;
    align-items: center;
    padding: 15px 15px 0 15px;
    .message-type-select {
      margin-left: 10px;
      margin-right: 10px;
    }
    .filter-message-input {
      width: 400px;
      margin-left: 10px;
      margin-right: auto;
    }
  }
  .message-list-content {
    display: flex;
    flex-direction: column;
    flex: 1;
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
    .el-table .send-row {
      .el-table__cell {
        background-color: #7fff00;
      }
    }
    .message-list-content-message {
      .icon {
        height: 15px;
        width: 15px;
      }
      .cell {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
  .socketMessageDetail {
    position: relative !important;
    height: 30%;
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
      .title{
        margin-right: auto;
        font-size: 16px;
      }
    }
  }
}
</style>
