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
        path: "/admin",
        name: "Admin",
        component: Home,
        children: [
            {
                path: "/admin/dashboard",
                name: "dashboard",
                meta: {
                    title: '系统首页'
                },
                component: () => import( /* webpackChunkName: "dashboard" */ "../views/Dashboard.vue")
            },
            {
                path: "/admin/table",
                name: "basetable",
                meta: {
                    title: '表格'
                },
                component: () => import( /* webpackChunkName: "table" */ "../views/BaseTable.vue")
            },
            {
                path: "/admin/charts",
                name: "basecharts",
                meta: {
                    title: '图表'
                },
                component: () => import( /* webpackChunkName: "charts" */ "../views/BaseCharts.vue")
            },
            {
                path: "/admin/form",
                name: "baseform",
                meta: {
                    title: '表单'
                },
                component: () => import( /* webpackChunkName: "form" */ "../views/BaseForm.vue")
            },
            {
                path: "/admin/tabs",
                name: "tabs",
                meta: {
                    title: 'tab标签'
                },
                component: () => import( /* webpackChunkName: "tabs" */ "../views/Tabs.vue")
            },
            {
                path: "/admin/donate",
                name: "donate",
                meta: {
                    title: '鼓励作者'
                },
                component: () => import( /* webpackChunkName: "donate" */ "../views/Donate.vue")
            },
            {
                path: "/admin/permission",
                name: "permission",
                meta: {
                    title: '权限管理',
                    permission: true
                },
                component: () => import( /* webpackChunkName: "permission" */ "../views/Permission.vue")
            },
            {
                path: "/admin/i18n",
                name: "i18n",
                meta: {
                    title: '国际化语言'
                },
                component: () => import( /* webpackChunkName: "i18n" */ "../views/I18n.vue")
            },
            {
                path: "/admin/upload",
                name: "upload",
                meta: {
                    title: '上传插件'
                },
                component: () => import( /* webpackChunkName: "upload" */ "../views/Upload.vue")
            },
            {
                path: "/admin/icon",
                name: "icon",
                meta: {
                    title: '自定义图标'
                },
                component: () => import( /* webpackChunkName: "icon" */ "../views/Icon.vue")
            },
            {
                path: '/admin/404',
                name: '404',
                meta: {
                    title: '找不到页面'
                },
                component: () => import(/* webpackChunkName: "404" */ '../views/404.vue')
            },
            {
                path: '/admin/403',
                name: '403',
                meta: {
                    title: '没有权限'
                },
                component: () => import(/* webpackChunkName: "403" */ '../views/403.vue')
            },
            {
                path: '/admin/profile',
                name: 'user',
                meta: {
                    title: '个人中心'
                },
                component: () => import(/* webpackChunkName: "user" */ '../views/User.vue')
            },
            {
                path: '/admin/editor',
                name: 'editor',
                meta: {
                    title: '富文本编辑器'
                },
                component: () => import(/* webpackChunkName: "editor" */ '../views/Editor.vue')
            }
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