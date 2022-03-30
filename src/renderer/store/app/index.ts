import { ref } from 'vue';
import { defineStore } from 'pinia';


export const useAppStoreForSetup = defineStore('appForSetup', () => {
    const appSize = ref<string>('lg');
    function setAppSize(size: string) {
        appSize.value !== size && (appSize.value = size);
    }
    return { appSize, setAppSize };
});
