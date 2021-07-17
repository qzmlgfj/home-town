<template>
    <h1>迫真首页</h1>
    <el-button @click="login">登录</el-button>
</template>

<script>
import { ElButton } from "element-plus";
export default {
    name: "Main",
    components: {
        ElButton,
    },
    methods: {
        login() {
            this.$router.push("/login");
        },
    },
};
</script>
