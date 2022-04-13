<template>
  <div class="equipment-list-component">
    <div class="equipment-list-component-top-bar">
      <div class="passageway-select-tip">当前应用:</div>
      <el-select
        v-model="passagewayActive"
        class="passageway-select"
        filterable
        placeholder="应用选择"
        popper-class="options-content"
      >
        <el-option
          v-for="item in passagewayList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
          <span style="margin-right: auto">{{ item.label }}</span>
          <el-button
            type="danger"
            :icon="Delete"
            size="small"
            circle
            @click="handledeletePassageway($event, item.id)"
          ></el-button>
        </el-option>
      </el-select>
      <el-tooltip
        effect="light"
        content="创建新的应用"
        :show-after="500"
        placement="bottom-start"
        popper-class="add-passageway-tooltip"
      >
        <el-button
          class="add-passageway-icon"
          type="text"
          @click="dialogVisible = true"
          plain
          :icon="Plus"
        ></el-button>
      </el-tooltip>
    </div>
    <div class="equipment-list-component-bottom">
      <el-table
        v-if="passagewayList.length > 0"
        row-key="id"
        :data="clientList"
        stripe
        style="width: 100%; flex-grow: 1; overflow: auto; height: 0; display: flex"
      >
        <el-table-column
          class-name="open-detail-box"
          type="expand"
          align="left"
          width="20"
        >
          <template #default="props">
            <div class="detail-box">
              <p>序列号: {{ props.row.id }}</p>
              <div class="control-box">
                <el-button
                  class="delete-machine-btn"
                  :icon="Delete"
                  @click="deleteMachine(props.row.id)"
                  size="small"
                  type="danger"
                  >删除设备</el-button
                >
                <el-button
                  @click="manufacturerHandle(props.row)"
                  :icon="props.row?.edit ? Check : Edit"
                  size="small"
                  :type="props.row?.edit ? 'success' : 'primary'"
                  >{{ props.row?.edit ? "完成" : "修改名称" }}</el-button
                >
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="manufacturer" label="设备">
          <template #default="props">
            <div class="manufacturer-box">
              <div v-if="!props.row?.edit">
                {{ props.row.identificationName || props.row.manufacturer }}
              </div>
              <input
                v-else
                class="edit-manufacturer-input"
                v-model="props.row.defaultName"
                placeholder="输入设备名称"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="right" width="60">
          <template #default="scope">
            <svg
              t="1646903397439"
              class="connectState"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="7559"
              width="200"
              height="200"
            >
              <path
                d="M969.586403 624.769747l-129.946199-130.564991c-34.911813-35.071501-77.458713-52.607251-127.401169-52.607251-50.830721 0-94.146121 18.30425-129.946199 55.172242l-54.912749-55.172242c36.568577-36.089513 54.912749-79.74425 54.912749-131.203743 0-50.172008-17.32616-92.678986-51.848733-127.361247L401.885195 53.246004C367.362622 17.795244 324.815721 0 274.484025 0c-49.942456 0-92.229864 17.406004-126.762417 52.098246l-91.850604 91.521247c-35.291072 34.682261-52.996491 77.179259-52.996492 127.351267 0 50.172008 17.455906 92.928499 52.357739 128l129.946199 130.684757c34.901832 35.071501 77.458713 52.617232 127.40117 52.617232 50.830721 0 94.156101-18.30425 129.946198-55.172242l54.912749 55.172242c-36.688343 36.089513-54.912749 79.74425-54.912749 131.203742 0 50.172008 17.32616 92.669006 51.858714 127.361248l128.538947 129.916257c34.522573 35.460741 76.949708 53.246004 127.40117 53.246004 49.942456 0 92.239844-17.406004 126.762417-52.227992l91.850604-91.521248c35.291072-34.692242 52.996491-77.179259 52.996492-127.361247 0.019961-50.042261-17.435945-92.798752-52.347759-128.119766zM460.790146 365.556023c-1.626823-1.337388-5.90846-5.938402-13.453723-13.813021-7.395556-7.575205-12.555478-12.924756-15.519688-15.599532-2.95423-2.525068-7.545263-6.237817-13.753139-10.838831-6.357583-4.601014-12.41575-7.724912-18.473918-9.511423-6.058168-1.77653-12.715166-2.664795-19.961014-2.664795-19.212476 0-35.620429 6.676959-49.223859 20.350253-13.603431 13.513606-20.250448 30.001404-20.250449 49.453412 0 7.28577 1.027992 13.97271 2.664796 20.050838 1.626823 5.938402 4.870487 12.325926 9.45154 18.563743 4.581053 6.237817 8.283821 10.998519 10.788928 13.813021 2.515088 2.824483 7.68499 8.024327 15.529668 15.589552 7.68499 7.575205 12.276023 12.026511 13.743158 13.513606-14.481715 15.010682-31.917661 22.585887-52.17809 22.585887-19.801326 0-36.069552-6.387524-49.223859-19.601715L110.145 315.952904C96.541569 302.429318 89.894551 285.951501 89.894551 266.489513c0-19.012865 6.647018-35.201248 20.250449-48.864562l106.591813-106.3423c14.042573-13.074464 30.300819-19.611696 49.223859-19.611696 19.222456 0 35.630409 6.68694 49.22386 20.350254l149.168655 150.755555c13.59345 13.513606 20.250448 30.001404 20.250448 49.463392-0.009981 20.350253-7.844678 38.165458-23.813489 53.315867z m455.849669 443.334113L809.62882 915.511891c-13.503626 12.824951-29.981442 19.082729-49.423469 19.082729-19.89115 0-36.209279-6.417466-49.42347-19.68156L561.034356 763.708382c-13.663314-13.573489-20.330292-30.12117-20.330292-49.653021 0-20.430097 8.014347-38.325146 24.043041-53.385731 1.626823 1.347368 6.078129 6.118051 13.503626 13.872904 7.425497 7.754854 12.615361 13.124366 15.589551 15.649435 2.964211 2.535049 7.565224 6.257778 13.793061 10.888733 6.387524 4.620975 12.475634 7.904561 18.553762 9.541364 6.088109 1.936218 12.765068 2.684756 20.040858 2.684757 19.29232 0 35.770136-6.716881 49.423469-20.430098 13.653333-13.573489 20.330292-30.12117 20.330293-49.653021 0-7.305731-1.037973-14.012632-2.674776-20.130683-1.626823-5.958363-4.900429-12.375828-9.501442-18.643586-4.601014-6.257778-8.164055-10.888733-10.838831-13.862924-2.525068-2.844444-7.714932-8.054269-15.579571-15.659415-7.714932-7.605146-12.315945-12.076413-13.803041-13.563509 14.541598-15.509708 32.057388-23.414269 52.397661-23.414269 19.29232 0 35.760156 6.716881 49.413489 20.430097l151.384328 152.102924c13.653333 13.563509 20.330292 30.111189 20.330292 49.653022 0.009981 19.082729-6.816686 35.490682-20.470019 48.754775z"
                p-id="7560"
                :fill="connectStateColor(scope.$index, scope.row)"
              ></path>
            </svg>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else>
        <el-button type="primary" @click="dialogVisible = true">新增应用</el-button>
      </el-empty>
      <div :class="`qrcode-box ${!showQRCode ? 'qrcode-box-close' : ''}`">
        <div
          class="qrcode-box-close-btn"
          @click="
            () => {
              showQRCode = false;
            }
          "
        >
          <close style="width: 1em; height: 1em" />
        </div>
        <span class="qrcode" id="qrcode"></span>
        <el-button type="primary" @click="copyText(socketServerUrl)">复制地址</el-button>
      </div>
      <div
        v-show="!showQRCode && passagewayActive !== ''"
        class="qrcode-show-btn"
        @click="
          () => {
            showQRCode = true;
          }
        "
      >
        <svg
          class="qr-code-svg"
          width="26px"
          height="26px"
          viewBox="0 0 26 26"
          version="1.1"
        >
          <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g
              transform="translate(1.000000, 1.000000)"
              fill="#1CC19E"
              fill-rule="nonzero"
            >
              <path
                d="M9.84615385,0 L0.984615392,0 C0.440827327,0 0,0.440827327 0,0.984615392 L0,9.84615385 C0,10.3899419 0.440827336,10.8307692 0.984615392,10.8307692 L9.84615385,10.8307692 C10.3899419,10.8307692 10.8307692,10.3899419 10.8307692,9.84615385 L10.8307692,0.984615392 C10.8307692,0.440827336 10.3899419,0 9.84615385,0 Z M8.86153846,8.86153846 L1.96923076,8.86153846 L1.96923076,1.96923076 L8.86153846,1.96923076 L8.86153846,8.86153846 Z M9.84615385,12.8 L0.984615392,12.8 C0.440827336,12.8 0,13.2408273 0,13.7846154 L0,22.6461538 C0,23.1899419 0.440827327,23.6307692 0.984615392,23.6307692 L9.84615385,23.6307692 C10.3899419,23.6307692 10.8307692,23.1899419 10.8307692,22.6461538 L10.8307692,13.7846154 C10.8307692,13.2408273 10.3899419,12.8 9.84615385,12.8 L9.84615385,12.8 Z M8.86153846,21.6615385 L1.96923076,21.6615385 L1.96923076,14.7692308 L8.86153846,14.7692308 L8.86153846,21.6615385 Z M22.6461538,0 L13.7846154,0 C13.2408273,0 12.8,0.440827336 12.8,0.984615392 L12.8,9.84615385 C12.8,10.3899419 13.2408273,10.8307692 13.7846154,10.8307692 L22.6461538,10.8307692 C23.1899419,10.8307692 23.6307692,10.3899419 23.6307692,9.84615385 L23.6307692,0.984615392 C23.6307692,0.440827327 23.1899419,0 22.6461538,0 Z M21.6615385,8.86153846 L14.7692308,8.86153846 L14.7692308,1.96923076 L21.6615385,1.96923076 L21.6615385,8.86153846 Z M3.93846155,3.93846155 L6.8923077,3.93846155 L6.8923077,6.8923077 L3.93846155,6.8923077 L3.93846155,3.93846155 Z M23.6307692,18.7076923 L23.6307692,23.6307692 L18.7076923,23.6307692 L18.7076923,20.6769231 L20.6769231,20.6769231 L20.6769231,18.7076923 L23.6307692,18.7076923 Z M15.7538462,20.6769231 L15.7538462,23.6307692 L12.8,23.6307692 L12.8,20.6769231 L15.7538462,20.6769231 Z M6.8923077,16.7384615 L6.8923077,19.6923077 L3.93846155,19.6923077 L3.93846155,16.7384615 L6.8923077,16.7384615 Z M23.6307692,12.8 L23.6307692,15.7538462 L20.6769231,15.7538462 L20.6769231,12.8 L23.6307692,12.8 Z M18.7076923,15.7538462 L18.7076923,20.6769231 L15.7538462,20.6769231 L15.7538462,15.7538462 L18.7076923,15.7538462 Z M15.7538462,12.8 L15.7538462,15.7538462 L12.8,15.7538462 L12.8,12.8 L15.7538462,12.8 Z M19.6923077,3.93846155 L19.6923077,6.8923077 L16.7384615,6.8923077 L16.7384615,3.93846155 L19.6923077,3.93846155 Z"
              ></path>
            </g>
          </g>
        </svg>
      </div>
    </div>
  </div>
  <el-dialog
    v-model="dialogVisible"
    title="新增应用"
    width="50%"
    :before-close="handleClose"
  >
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      label-width="120px"
      class="demo-ruleForm"
    >
      <el-form-item label="应用名称" prop="name">
        <el-input v-model="ruleForm.name"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitForm(ruleFormRef)">新增</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { Plus, ArrowDown, Delete, Check, Edit, Close } from "@element-plus/icons-vue";
import { ref, getCurrentInstance, onMounted, reactive, watch, computed } from "vue";
import { ElMessage, ElForm, ElMessageBox } from "element-plus";
import appStore from "../../../store";
import { storeToRefs } from "pinia";
import { copyText } from "../../../utils";
type FormInstance = InstanceType<typeof ElForm>;

const { proxy }: any = getCurrentInstance();
const { passagewayList, passagewayActive } = storeToRefs(appStore.socketPassageWay);
const { setPassagewayList, setPassagewayActive } = appStore.socketPassageWay;
const dialogVisible = ref(false);
const clientList = ref([]);
const connectingClientList = ref([]);
const showQRCode = ref(false);
const socketServerUrl = ref("");
const ruleFormRef = ref<FormInstance>();
const ruleForm = reactive({
  name: "",
});
const result = reactive({
  address: null,
  port: null,
});
const rules = reactive({
  name: [
    {
      required: true,
      message: "请输入应用名称",
      trigger: "blur",
    },
  ]
});
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      await addSocketServer();
      dialogVisible.value = false;
      ruleForm.name = "";
    } else {
      return false;
    }
  });
};
const initListener = () => {
  proxy.$electron.onMulticontrolEmit((message: any) => {
    let data = JSON.parse(message);
    if (data.passageway === passagewayName.value && data?.info) {
      data.info.sort((a, b) => {
        if (connectingClientList.value.indexOf(a?.id) >= 0) {
          return -1;
        } else {
          return 1;
        }
      });
      data.info.forEach((item) => {
        item.identificationName = item?.identificationName || "";
        item.defaultName = item?.identificationName || item?.manufacturer || "";
        item.edit = false;
      });
      clientList.value = data.info;
      console.log(clientList.value)
    }
  });
  proxy.$electron.onMulticontrolConnection((message: any) => {
    try {
      let data = JSON.parse(message);
      let index = null;
      switch (data.type) {
        case "ADD":
          connectingClientList.value.push(data.connectSerial);
          break;
        case "CLOSE":
          index = connectingClientList.value.indexOf(data.connectSerial);
          if (index > -1) {
            connectingClientList.value.splice(index, 1);
          }
          break;
      }
    } catch (error) {
      console.error(error);
    }
  });
};
const addSocketServer = async () => {
  try {
    // 发送同步消息
    const data = await addPassageway();
    if (data) {
      setPassagewayList([
        ...passagewayList.value,
        {
          value: `ws://${result.address}:${result.port}/proxy/multicontrol/${data.identification}`,
          label: ruleForm.name,
          id: data?.id,
        },
      ]);
      if (passagewayActive.value === "") {
        socketServerUrl.value = `ws://${result.address}:${result.port}/proxy/multicontrol/${data.identification}`;
        createQRCode(socketServerUrl.value);
        showQRCode.value = true;
        setPassagewayActive(socketServerUrl.value);
      }
    }
  } catch (error) {
    console.log(error);
  }
};
// 创建二维码
const createQRCode = (url: string) => {
  let $QR = document.querySelector("#qrcode") as HTMLElement;
  let QR = (window as any).qrcode(0, "L");
  $QR.setAttribute("href", url);
  QR.addData(url);
  QR.make();
  $QR.innerHTML = QR.createImgTag(6, 12);
};

const handleClose = (done: () => void) => {
  ElMessageBox.confirm("确定要关闭弹窗吗？")
    .then(() => {
      dialogVisible.value = false;
    })
    .catch(() => {});
};
// 获取通道列表
const getPassagewayList = async () => {
  try {
    let data = await proxy.$electron.getDataService({ name: "getPassagewayList" });
    if (data) {
      data = JSON.parse(data);
      data.forEach((item) => {
        setPassagewayList([
          ...passagewayList.value,
          {
            value: `ws://${result.address}:${result.port}/proxy/multicontrol/${item?.identification}`,
            label: item?.passagewayName,
            id: item.id,
          },
        ]);
      });
    }
  } catch (error) {
    console.log(error);
  }
};
// 获取socket信息
const getSocketServerInfo = async () => {
  try {
    let socketServerInfo = await proxy.$electron.getSocketServerInfo();
    if (socketServerInfo) {
      socketServerInfo = JSON.parse(socketServerInfo);
      result.address = socketServerInfo.address;
      result.port = socketServerInfo.port;
    }
  } catch (error) {
    console.log(error);
  }
};
// 添加通道
const addPassageway = async () => {
  try {
    let data = await proxy.$electron.getDataService({
      name: "addPassageway",
      data: {
        passagewayName: ruleForm.name,
      },
    });
    data = JSON.parse(data) || {};
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
// 删除通道
const deletePassageway = async (id: string) => {
  try {
    let data = await proxy.$electron.getDataService({
      name: "deletePassageway",
      data: {
        id,
      },
    });
    setPassagewayList([]);
    if (data) {
      ElMessage({
        message: "删除通道成功",
        type: "success",
      });
      data = JSON.parse(data) || {};
      data.forEach((item) => {
        setPassagewayList([
          ...passagewayList.value,
          {
            value: `ws://${result.address}:${result.port}/proxy/multicontrol/${item?.identification}`,
            label: item?.passagewayName,
            id: item.id,
          },
        ]);
      });
      if (passagewayList.value.length > 0) {
        setPassagewayActive(passagewayList.value[0].value);
      } else {
        setPassagewayActive("");
      }
    }
  } catch (error) {
    ElMessage.error("删除通道失败");
    console.log(error);
  }
};

// 删除设备
const deleteMachine = async (id: string) => {
  ElMessageBox.confirm("确定删除该设备吗？")
    .then(async () => {
      try {
        console.log(passagewayName.value, id);
        let data = await proxy.$electron.getDataService({
          name: "deleteMachine",
          data: {
            passageway: passagewayName.value,
            id,
          },
        });
        if (data) {
          ElMessage({
            message: "删除设备成功",
            type: "success",
          });
          getMulticontrolMachine();
        }
      } catch (error) {
        ElMessage.error("删除通道失败");
        console.error(error);
      }
    })
    .catch(() => {});
};

// 更新设备名称
const editMachineName = async (
  passageway: string,
  id: string,
  identificationName: string
) => {
  try {
    let data = await proxy.$electron.getDataService({
      name: "editMachineName",
      data: {
        passageway,
        id,
        identificationName,
      },
    });
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const handledeletePassageway = (e, id) => {
  e.stopPropagation();
  ElMessageBox.confirm("确定要关闭该通道吗？")
    .then(() => {
      deletePassageway(id);
    })
    .catch(() => {});
};

const manufacturerHandle = async (row) => {
  if (row.edit && row?.defaultName !== row?.identificationName) {
    let data = await editMachineName(passagewayName.value, row.id, row.defaultName);
    if (data) {
      data = JSON.parse(data);
      row.identificationName = data.identificationName;
    }
  } else {
    row.defaultName = row?.identificationName || row?.manufacturer || "";
  }
  row.edit = !row.edit;
};

// 获取机器
const getMulticontrolMachine = () => {
  proxy.$electron.getMulticontrolMachine(passagewayName.value);
};
const passagewayName = computed(() => {
  return passagewayActive.value.split("/")[passagewayActive.value.split("/").length - 1];
});

const connectStateColor = (index: number, row: any) => {
  if (connectingClientList.value.indexOf(row?.id) >= 0) {
    return "#1afa29";
  } else {
    return "#d81e06";
  }
};

onMounted(async () => {
  setPassagewayList([]);
  initListener();
  await getSocketServerInfo();
  await getPassagewayList();
  if (passagewayList.value.length > 0) {
    setPassagewayActive(passagewayList.value[0].value);
  }
  getMulticontrolMachine();
});

watch(
  () => passagewayActive.value,
  (newValue, oldValue) => {
    if (newValue !== "") {
      socketServerUrl.value = newValue;
      createQRCode(socketServerUrl.value);
      showQRCode.value = true;
    } else {
      showQRCode.value = false;
    }
    getMulticontrolMachine();
  }
);
watch(
  () => connectingClientList.value,
  (newValue, oldValue) => {
    clientList.value.sort((a, b) => {
      if (newValue.indexOf(a?.id) >= 0) {
        return -1;
      } else {
        return 1;
      }
    });
  },
  { deep: true }
);
</script>

<style lang="scss" scope>
.equipment-list-component {
  padding: 5px;
  border-right: 1px solid #eee;
  height: 100%;
  overflow: auto;
  .add-passageway-icon {
    color: #5e5e5e;
    width: 25px;
    height: 25px;
    border-radius: 0;
    &:hover {
      background-color: #d4d4d4;
      color: #050505;
    }

    &:focus {
      background-color: node;
      border-color: node;
    }
  }
  &-top-bar {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    .passageway-select {
      flex: 1;
      margin-left: 5px;
      margin-right: 5px;
    }
    .passageway-select-tip {
      font-size: 14px;
    }
  }
  &-bottom {
    display: flex;
    flex-direction: column;
    height: calc(100% - 40px);
    overflow: hidden;
    position: relative;
    .qrcode-box {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      overflow: hidden;
      height: 210px;
      transition: all 0.5s;
      transform: translate3d(0, 0, 0);
      .qrcode {
        img {
          width: 150px;
          height: 150px;
        }
      }
      .qrcode-box-close-btn {
        position: absolute;
        top: 4px;
        right: 10px;
        cursor: pointer;
        &:hover {
          color: #66b1ff;
        }
      }
    }
    .qrcode-box-close {
      width: 100%;
      transform: translate3d(0, 100%, 0);
      position: absolute;
      bottom: 0;
      z-index: 10;
      background: #fff;
    }
    .el-table__inner-wrapper {
      overflow: auto;
      display: flex;
      flex-direction: column;
      .el-table__body-wrapper {
        height: 100%;
        flex: 1;
      }
      .manufacturer-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .edit-manufacturer-input {
          flex: 1;
          width: 0px;
          margin-right: 4px;
        }
      }
      .open-detail-box {
        .cell {
          padding: 0px;
        }
      }
      .detail-box {
        display: flex;
        flex-direction: column;
        .control-box {
          display: flex;
          .delete-machine-btn {
            margin-left: auto;
          }
        }
      }
    }
    .connectState {
      width: 15px;
      height: 15px;
      margin-right: 7px;
    }
    .qrcode-show-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 3px;
    }
  }
}
.options-content {
  .el-select-dropdown__item {
    display: flex;
    align-items: center;
  }
}
</style>
