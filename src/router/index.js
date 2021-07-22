import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/Home.vue";
import Main from "../views/Main.vue"

const routes = [
    {
        path: "/user",
        name: "UserPage",
        meta: {
            title: '信息门户'
        },
        component: Main
    },
    {
        path: '/admin',
        redirect: '/admin/dashboard'
    },
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: "/admin",
        name: "Admin",
        component: Home,
        children: [
            {
                path: "dashboard",
                name: "dashboard",
                meta: {
                    title: '系统首页'
                },
                component: () => import( /* webpackChunkName: "dashboard" */ "../views/Dashboard.vue")
            },
            {
                path: "fund",
                name: "fund",
                meta: {
                    title: '资金管理'
                },
                component: () => import("../views/Fund.vue")
            },
            {
                path: "asset",
                name: "asset",
                meta: {
                    title: '资产管理'
                },
                component: () => import("../views/Asset.vue")
            },
            {
                path: "resource",
                name: "resource",
                meta: {
                    title: '资源管理'
                },
                component: () => import("../views/Resource.vue")
            },
            {
                path: "project",
                name: "project",
                meta: {
                    title: '项目管理'
                },
                component: () => import("../views/Project.vue")
            },
            {
                path: "earning",
                name: "earning",
                meta: {
                    title: '收入管理'
                },
                component: () => import("../views/Earning.vue")
            },
            {
                path: "expenditure",
                name: "expenditure",
                meta: {
                    title: '支出管理'
                },
                component: () => import("../views/Expenditure.vue")
            },
            {
                path: "contract",
                name: "contract",
                meta: {
                    title: '合同管理',
                    permission: true
                },
                component: () => import("../views/Contract.vue")
            },
            {
                path: "hotspot",
                name: "hotspot",
                meta: {
                    title: '热点信息管理',
                    permission: true
                },
                component: () => import("../views/Hotspot.vue")
            },
            {
                path: '404',
                name: '404',
                meta: {
                    title: '找不到页面'
                },
                component: () => import(/* webpackChunkName: "404" */ '../views/404.vue')
            },
            {
                path: '403',
                name: '403',
                meta: {
                    title: '没有权限'
                },
                component: () => import(/* webpackChunkName: "403" */ '../views/403.vue')
            },
        ]
    },
    {
        path: "/login",
        name: "Login",
        meta: {
            title: '登录'
        },
        component: () => import( /* webpackChunkName: "login" */ "../views/Login.vue")
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title} | 示范区基层公开监督管理平台`;
    const userName = localStorage.getItem('ms_username');
    if (!userName) {
        if (to.path === '/login') {
            console.log("next()");
            next();
        }
        else {
            next("/login");
        }
    } else if (to.meta.permission) {
        // 如果是管理员权限则可进入，这里只是简单的模拟管理员权限而已
        const userRole = localStorage.getItem('ms_usertype');
        userRole === 'admin'
            ? next()
            : next('/403');
    } else {
        next();
    }
});

export default router;
