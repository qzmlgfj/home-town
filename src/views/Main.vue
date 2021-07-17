<template>
    <h1>迫真首页</h1>
    <el-button @click="login">注销</el-button>
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
            localStorage.removeItem("ms_username");
            this.$router.push("/login");
        },
    },
};
</script>
