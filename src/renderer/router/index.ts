import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
const Layout = () => import('../layout/index.vue')

// 常驻路由
export const constantRoutes: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: Layout,
        redirect: '/mc',
        children: [
          {
            path: 'mc',
            component: () => import('../view/mc/index.vue'),
            name: 'MC',
            meta: {
              title: '一机多控',
              icon: 'https://pt-starimg.didistatic.com/static/starimg/img/yTuclEwP6J1646376356382.png',
            }
          }
        ]
      }
]


const router = createRouter({
    history: createWebHashHistory(),
    routes: constantRoutes
})

export function resetRouter() {
    // 重置路由
    // 注意：所有动态路由路由必须带有 name 属性，否则可能会不能完全重置干净
    try {
        router.getRoutes().forEach((route: any) => {
            const { name, meta } = route
            if (name && meta.roles?.length) {
                router.hasRoute(name) && router.removeRoute(name)
            }
        })
    } catch (error) {
        // 强制刷新浏览器，不过体验不是很好
        window.location.reload()
    }
}

export default router