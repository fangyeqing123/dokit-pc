import { ref, reactive } from 'vue';
import { defineStore } from 'pinia';


export const useSocketPassageWayStoreForSetup = defineStore('socketPassageWayForSetup', () => {
    const passagewayActive = ref<string>("");
    const passagewayList = ref<Array<object>>([]);
    const serverInfo = reactive({
        address: null,
        port: null
    })
    function setPassagewayList(size: Array<object>) {
        passagewayList.value !== size && (passagewayList.value = size);
    }
    function setPassagewayActive(size: string) {
        passagewayActive.value !== size && (passagewayActive.value = size);
    }
    function setServerInfo(info: any) {
        serverInfo.address = info.address
        serverInfo.port = info.port
    }
    return { passagewayActive, passagewayList, serverInfo, setPassagewayList, setPassagewayActive, setServerInfo };
});
