<template>
    <div class="sidebar">
        <el-menu class="sidebar-el-menu" :default-active="onRoutes" :collapse="collapse" background-color="#324157"
            text-color="#bfcbd9" active-text-color="#20a0ff" unique-opened router>
            <template v-for="item in items">
                <template v-if="item">
                    <el-menu-item :index="item.index" :key="item.index">
                        <i :class="item.icon"></i>
                        <template #title>{{ item.title }}</template>
                    </el-menu-item>
                </template>
            </template>
        </el-menu>
    </div>
</template>

<script>
import { computed, watch } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
export default {
    setup() {
        const items = [
            {
                icon: "el-icon-lx-home",
                index: "/admin/dashboard",
                title: "系统首页",
            },
            {
                icon: "el-icon-money",
                index: "/admin/fund",
                title: "资金管理",
            },
            {
                icon: "el-icon-coin",
                index: "/admin/asset",
                title: "资产管理",
            },
            {
                icon: "el-icon-pie-chart",
                index: "/admin/resource",
                title: "资源管理"
            },
            {
                icon: "el-icon-data-board",
                index: "/admin/project",
                title: "项目管理",
            },
            {
                icon: "el-icon-tickets",
                index: "/admin/earning",
                title: "收支管理",
            },
            {
                icon: "el-icon-collection",
                index: "/admin/contract",
                title: "合同管理",
            }
        ];

        const route = useRoute();

        const onRoutes = computed(() => {
            return route.path;
        });

        const store = useStore();
        const collapse = computed(() => store.state.collapse);

        return {
            items,
            onRoutes,
            collapse,
        };
    },
};
</script>

<style scoped>
.sidebar {
    display: block;
    position: absolute;
    left: 0;
    top: 70px;
    bottom: 0;
    overflow-y: scroll;
}
.sidebar::-webkit-scrollbar {
    width: 0;
}
.sidebar-el-menu:not(.el-menu--collapse) {
    width: 250px;
}
.sidebar > ul {
    height: 100%;
}
</style>
