<template>
    <div class="login-wrap">
        <div class="ms-login">
            <div class="ms-title">后台管理系统</div>
            <el-form
                :model="param"
                :rules="rules"
                ref="login"
                label-width="0px"
                class="ms-content"
            >
                <el-form-item prop="phonenumber">
                    <el-input
                        v-model="param.phonenumber"
                        placeholder="手机号码"
                    >
                        <template #prepend>
                            <el-button icon="el-icon-phone"></el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                        type="password"
                        placeholder="账户密码"
                        v-model="param.password"
                        @keyup.enter="loginHandle"
                    >
                        <template #prepend>
                            <el-button icon="el-icon-lock"></el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <div class="login-btn">
                    <el-button type="primary" @click="loginHandle"
                        >登录</el-button
                    >
                    <el-button type="primary" @click="dialogVisible = true"
                        >注册</el-button
                    >
                </div>
                <p class="login-tips">Tips : 用户名和密码随便填。</p>
            </el-form>
        </div>
        <el-dialog title="新用户注册" v-model="dialogVisible" width="30%">
            <el-form
                :model="param"
                :rules="rules"
                ref="login"
                label-width="0px"
                class="ms-content"
            >
                <el-form-item prop="username">
                    <el-input v-model="param.username" placeholder="用户姓名">
                        <template #prepend>
                            <el-button icon="el-icon-user"></el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="phonenumber">
                    <el-input
                        v-model="param.phonenumber"
                        placeholder="手机号码"
                    >
                        <template #prepend>
                            <el-button icon="el-icon-phone"></el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                        type="password"
                        placeholder="账户密码"
                        v-model="param.password"
                        @keyup.enter="regisiterHandle"
                    >
                        <template #prepend>
                            <el-button icon="el-icon-lock"></el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <div class="login-btn">
                    <el-button type="primary" @click="regisiterHandle"
                        >注册</el-button
                    >
                    <el-button type="primary" @click="dialogVisible = false"
                        >返回</el-button
                    >
                </div>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import { ref, reactive } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { ElMessage, ElDialog } from "element-plus";
import service from "../utils/request";

export default {
    setup() {
        const router = useRouter();
        const param = reactive({
            username: "",
            phonenumber: "19982006582",
            password: "123",
        });

        const rules = {
            username: [
                {
                    required: true,
                    message: "请输入用户名",
                    trigger: "blur",
                },
            ],
            password: [
                { required: true, message: "请输入密码", trigger: "blur" },
            ],
        };
        const login = ref(null);

        const loginHandle = () => {
            login.value.validate((valid) => {
                if (valid) {
                    service({
                        method: "post",
                        url: "/sys/login",
                        data: {
                            phone_number: param.phonenumber,
                            password: param.password,
                        },
                    }).then((response) => {
                        console.log(response);
                        switch (response.code) {
                            case 5001:
                                ElMessage.error("用户不存在");
                                return false;
                            case 5002:
                                ElMessage.info(
                                    "欢迎，普通用户" + response.data
                                );
                                localStorage.setItem(
                                    "ms_username",
                                    response.data
                                );
                                localStorage.setItem(
                                    "ms_userphone",
                                    param.phonenumber
                                );
                                localStorage.setItem("ms_usertype", "user");
                                break;
                            case 5003:
                                ElMessage.info("欢迎，管理员" + response.data);
                                localStorage.setItem(
                                    "ms_username",
                                    response.data
                                );
                                localStorage.setItem(
                                    "ms_userphone",
                                    param.phonenumber
                                );
                                localStorage.setItem("ms_usertype", "admin");
                                break;
                            default:
                                break;
                        }
                        router.push("/");
                    });
                } else {
                    ElMessage.error("登录失败");
                    return false;
                }
            });
        };

        const regisiterHandle = () => {
            login.value.validate((valid) => {
                if (valid) {
                    service({
                        method: "post",
                        url: "/sys/register",
                        data: {
                            user_name: param.username,
                            phone_number: param.phonenumber,
                            password: param.password,
                        },
                    }).then((response) => {
                        switch (response.code) {
                            case 5004:
                                ElMessage.info("注册成功");
                                store.commit("closeRegisterDialog");
                                break;
                            case 5005:
                                ElMessage.error("用户已存在");
                                break;
                            default:
                                break;
                        }
                    });
                } else {
                    ElMessage.error("注册失败");
                    return false;
                }
            });
        };

        const store = useStore();
        store.commit("clearTags");

        return {
            param,
            rules,
            login,
            loginHandle,
            regisiterHandle,
        };
    },
    computed: {
        dialogVisible: {
            get() {
                return this.$store.state.registerDialogVisible;
            },
            set(value) {
                this.$store.commit("setRegisterDialog", value);
            },
        },
    },
};
</script>

<style scoped>
.login-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    background-image: url(../assets/img/login-bg.jpg);
    background-size: 100%;
}
.ms-title {
    width: 100%;
    line-height: 50px;
    text-align: center;
    font-size: 20px;
    color: #fff;
    border-bottom: 1px solid #ddd;
}
.ms-login {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 350px;
    margin: -190px 0 0 -175px;
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.3);
    overflow: hidden;
}
.ms-content {
    padding: 30px 30px;
}
.login-btn {
    text-align: center;
}
.login-btn button {
    width: 45%;
    height: 36px;
    margin-bottom: 10px;
}
.login-tips {
    font-size: 12px;
    line-height: 30px;
    color: #fff;
}
.rsgisiter-btn {
    text-align: center;
}
.rsgisiter-btn button {
    width: 45%;
    height: 36px;
    margin-bottom: 10px;
}
</style>