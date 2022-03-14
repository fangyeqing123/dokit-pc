// import { createPinia } from 'pinia'

// const store = createPinia()

// export default store
// src/store/index.ts
import { useRoutesStoreForSetup } from './routes';
import { useAppStoreForSetup } from './app';
import { useSocketPassageWayStoreForSetup } from './socketPassageWay'
const appStore: any = {};

/**
 * 注册app状态库
 */
export const registerStore = () => {
  appStore.routes = useRoutesStoreForSetup();
  appStore.app = useAppStoreForSetup();
  appStore.socketPassageWay = useSocketPassageWayStoreForSetup();
};

export default appStore;
