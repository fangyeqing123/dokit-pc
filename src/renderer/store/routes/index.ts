import { ref } from 'vue';
import { defineStore } from 'pinia';
import { RouteRecordRaw } from 'vue-router'
import { constantRoutes } from '../../router'

export const useRoutesStoreForSetup = defineStore('counterForSetup', () => {
    const routes = ref<RouteRecordRaw[]>(constantRoutes);
    return { routes};
});
