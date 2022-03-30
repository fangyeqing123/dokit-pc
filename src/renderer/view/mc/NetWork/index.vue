<template>
  <div class="network-list-box">
    <div class="network-filter-box">
      <div>搜索:</div>
      <el-input
        class="filter-network-input"
        v-model="filterNetworkText"
        placeholder="请输入搜索"
      />
      <el-button type="danger" @click="clearNetworkList">清空</el-button>
    </div>
    <div class="network-list-content">
      <el-table
        :data="filtersNetworkList"
        stripe
        @cell-click="openDetails"
        :row-class-name="networkListRowClassName"
        style="width: 100%; flex-grow: 1; overflow: auto; height: 0; display: flex"
      >
        <el-table-column
          class-name="network-list-content-message"
          prop="message"
          label="url"
        >
          <template #default="scope">
            <!-- <span style="margin-left: 10px">{{ scope.row.message }}</span> -->
            <span v-if="switchMessage(scope.row.message).request">{{
              switchMessage(scope.row.message).request.url
            }}</span>
            <span v-else>
              {{ switchMessage(switchMessage(scope.row.message).data).url }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="message" width="80" label="status">
          <template #default="scope">
            <!-- <span style="margin-left: 10px">{{ scope.row.message }}</span> -->
            <span v-if="switchMessage(scope.row.message).response">{{
              switchMessage(scope.row.message).response.responseCode
            }}</span>
            <span v-else-if="switchMessage(scope.row.message).request"> pending </span>
            <span v-else>
              {{ switchMessage(scope.row.message).code }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="message" width="100" label="image">
          <template #default="scope">
            <span v-if="switchMessage(scope.row.message).response">{{
              switchMessage(scope.row.message).response.image ? "true" : "false"
            }}</span>
            <span v-else>Unknown</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-drawer
      v-model="drawer"
      modal-class="network-message-detail"
      style="position: absolute"
      :modal="false"
      direction="btt"
    >
      <template #title>
        <div class="moveBtn" v-move="'network-message-detail'"></div>
        <div class="title">接口详情</div>
      </template>
      <el-tabs
        v-model="activeName"
        v-if="successRequest()"
        class="demo-tabs"
        @tab-click="handleClick"
      >
        <el-tab-pane label="Request" name="request"></el-tab-pane>
        <el-tab-pane label="Response" name="response"></el-tab-pane>
        <el-tab-pane label="Query" name="query"></el-tab-pane>
      </el-tabs>
      <json-viewer
        :value="networkDetail"
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
import { ref, getCurrentInstance, onMounted, watch, computed } from "vue";
import appStore from "../../../store";
import { storeToRefs } from "pinia";
import { canJsonParse } from "../../../utils";
const { passagewayActive } = storeToRefs(appStore.socketPassageWay);
const { proxy }: any = getCurrentInstance();
const activeName = ref("request");
const activeNetworkInfo = ref("");
const filterNetworkText = ref("");
const filtersNetworkList = ref([]);
const networkList = ref({});
const drawer = ref(false);
const networkDetail = ref("");
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
const clearNetworkList = () => {
  networkList.value[passagewayName.value] = [];
};
const passagewayName = computed(() => {
  return `/proxy/multicontrol/${
    passagewayActive.value.split("/")[passagewayActive.value.split("/").length - 1]
  }`;
});
const initListener = () => {
  proxy.$electron.onMulticontrolNetWork(async (info: any) => {
    try {
      let jsonInfo = JSON.parse(info);
      let mergeRequest = false;
      let mergeRequestIndex = -1;
      networkList.value[jsonInfo.clientInfo.requestPath] ||
        (networkList.value[jsonInfo.clientInfo.requestPath] = []);
      let dataContentType = JSON.parse(jsonInfo.message)?.contentType;
      let dataDid = JSON.parse(JSON.parse(jsonInfo.message)?.data)?.did;
      let machineName = await queryMachineName(jsonInfo.clientInfo.connectSerial);
      if (dataContentType === "response" || dataContentType === "queryResponse") {
        networkList.value[jsonInfo.clientInfo.requestPath].some((item, index) => {
          if (dataDid && JSON.parse(item.message)?.request?.did === dataDid) {
            mergeRequest = true;
            mergeRequestIndex = index;
            return true;
          }
        });
      }
      let responseMessage = JSON.parse(jsonInfo.message),
        requestMessage,
        requestData;
      if (responseMessage.code === 404) {
        console.log(responseMessage);
        networkList.value[jsonInfo.clientInfo.requestPath].push(jsonInfo);
        return;
      }
      if (mergeRequest) {
        if (dataContentType === "response") {
          requestMessage = JSON.parse(
            networkList.value[jsonInfo.clientInfo.requestPath][mergeRequestIndex].message
          );
          requestMessage.response = JSON.parse(responseMessage.data);
          console.log("response:", requestMessage.response);
          networkList.value[jsonInfo.clientInfo.requestPath][
            mergeRequestIndex
          ].message = JSON.stringify(requestMessage);
        } else if (dataContentType === "queryResponse") {
          console.log("queryResponse", responseMessage);
          requestMessage = JSON.parse(
            networkList.value[jsonInfo.clientInfo.requestPath][mergeRequestIndex].message
          );
          console.log("requestMessage", requestMessage,jsonInfo.clientInfo.connectSerial);
          requestMessage.query||(requestMessage.query = {});
          console.log('machineName:',machineName)
          requestMessage.query[`${machineName}(${jsonInfo.clientInfo.connectSerial})`] = JSON.parse(
            responseMessage.data
          );
          networkList.value[jsonInfo.clientInfo.requestPath][
            mergeRequestIndex
          ].message = JSON.stringify(requestMessage);
        }
      } else if (dataContentType !== "query" && dataContentType !== "queryResponse") {
        requestMessage = JSON.parse(jsonInfo.message);
        requestData = JSON.parse(requestMessage.data);
        let newMessage = {
          request: {
            ...requestData,
          },
        };
        jsonInfo.message = JSON.stringify(newMessage);
        networkList.value[jsonInfo.clientInfo.requestPath].push(jsonInfo);
      }
    } catch (error) {
      console.error(error);
    }
  });
};
const openDetails = (row, column, cell, event) => {
  try {
    drawer.value = true;
    activeNetworkInfo.value = JSON.parse(row.message);
    let activeInfo = activeNetworkInfo.value[activeName.value];
    if (!activeNetworkInfo.value.request) {
      activeNetworkInfo.value.data = JSON.parse(activeNetworkInfo.value.data);
      activeInfo = activeNetworkInfo.value;
    }
    for (const key in activeInfo) {
      if (Object.prototype.hasOwnProperty.call(activeInfo, key)) {
        if (canJsonParse(activeInfo[key])) {
          activeInfo[key] = JSON.parse(activeInfo[key]);
        }
      }
    }
    networkDetail.value = activeInfo;
  } catch (error) {
    console.error(error);
  }
};
const successRequest = () => {
  if (activeNetworkInfo.value.code === 404) {
    return false;
  } else {
    return true;
  }
};
const networkListRowClassName = ({ row, rowIndex }) => {
  if (switchMessage(row.message).code === 404) {
    return "network-error";
  } else if (switchMessage(row.message).response) {
    return "network-success";
  } else if (switchMessage(row.message).request) {
    return "network-pending";
  }
  return "";
};
const queryMachineName = async (id) => {
  try {
    let data = await proxy.$electron.getDataService({
      name: "queryMachineName",
      data: {
        passageway: passagewayName.value.split("/")[
          passagewayName.value.split("/").length - 1
        ],
        id,
      },
    });
    if (data) {
      let info = JSON.parse(data)
      return info.identificationName||info.manufacturer
    }else{
      return ''
    }
  } catch (error) {
    console.log(error);
  }
};
watch(
  [() => networkList.value, () => passagewayName.value, () => filterNetworkText.value],
  (newValue, oldValue) => {
    let list = networkList.value[passagewayName.value];
    if (filterNetworkText.value.trim() !== "") {
      list = list.filter((item) => item.message.indexOf(filterNetworkText.value) >= 0);
    }
    if (list?.length > 500) {
      filtersNetworkList.value = list.slice(-500);
    } else {
      filtersNetworkList.value = list;
    }
  },
  { deep: true }
);
watch(
  [() => activeName.value],
  (newValue, oldValue) => {
    let activeInfo = activeNetworkInfo.value[activeName.value];
    for (const key in activeInfo) {
      if (Object.prototype.hasOwnProperty.call(activeInfo, key)) {
        if (canJsonParse(activeInfo[key])) {
          activeInfo[key] = JSON.parse(activeInfo[key]);
        }
      }
    }
    networkDetail.value = activeInfo;
  },
  { deep: true }
);

onMounted(async () => {
  initListener();
});
</script>
<style lang="scss" scope>
.network-list-box {
  height: 100%;
  display: flex;
  flex-direction: column;
  .network-filter-box {
    display: flex;
    align-items: center;
    padding: 15px 15px 0 15px;
  }
  .filter-network-input {
    width: 400px;
    margin-left: 10px;
    margin-right: auto;
  }
  .network-list-content {
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
    .el-table .network-error {
      .el-table__cell {
        background-color: red;
        color: #fff;
      }
    }
    .network-list-content-message {
      .cell {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
  .network-message-detail {
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
      .title {
        margin-right: auto;
        font-size: 16px;
      }
    }
  }
}
</style>
