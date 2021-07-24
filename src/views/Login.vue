<template>
    <div class="login-wrap">
        <div class="ms-login">
            <div class="ms-title">示范区基层公开监督管理平台</div>
            <el-form :model="loginForm" :rules="loginFormRules" ref="loginForm"
                label-width="0px" class="ms-content">
                <el-form-item prop="phoneNumber">
                    <el-input
                        v-model="loginForm.phoneNumber"
                        placeholder="手机号码"
                        prefix-icon="el-icon-phone"
                    >
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" placeholder="账户密码" prefix-icon="el-icon-lock" show-password
                        v-model="loginForm.password" @keyup.enter="handleLogin('loginForm')">
                    </el-input>
                </el-form-item>
                <div class="login-btn">
                    <el-button type="primary" @click="handleLogin('loginForm')">登录</el-button>
                    <el-button type="primary" @click="dialogVisible = true">注册</el-button>
                </div>
            </el-form>
        </div>
        <el-dialog title="新用户注册" v-model="dialogVisible" width="30%">
            <el-form :model="registerForm" :rules="registerFormRules" ref="registerForm"
                label-width="0px" class="ms-content">
                <el-form-item prop="username">
                    <el-input v-model="registerForm.username" placeholder="用户姓名" prefix-icon="el-icon-user">
                    </el-input>
                </el-form-item>
                <el-form-item prop="phoneNumber">
                    <el-input v-model.number="registerForm.phoneNumber" placeholder="手机号码" prefix-icon="el-icon-phone">
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" placeholder="账户密码" prefix-icon="el-icon-lock" show-password
                        v-model="registerForm.password" @keyup.enter="handleRegister('registerForm')">
                    </el-input>
                </el-form-item>
                <div class="register-btn">
                    <el-button type="primary" @click="handleRegister('registerForm')">注册</el-button>
                    <el-button type="primary" @click="dialogVisible = false">返回</el-button>
                </div>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import { reactive } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { ElMessage, ElDialog } from "element-plus";
import service from "../utils/request";

export default {
    setup() {
        const router = useRouter();
        //登录表单
        const store = useStore();
        store.commit("clearTags");
        return {
            router,
            store,
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
    data(){
        const checkPhoneNumber = (rule, value, callback) => {
            const phoneNumberRegex = /^[1][1,2,3,4,5,6,7,8,9][0-9]{9}$/;
            if (value === '' || !phoneNumberRegex.test(value)){
                callback(new Error("请输入11位有效的手机号码"));
            }
            callback();
        };
        return{
            loginForm:reactive({
                phoneNumber: "19982006581",
                password: "123",
            }),
            //注册表单
            registerForm:reactive({
                username: "",
                phoneNumber: "",
                password: "",
            }),
            loginFormRules:reactive({
                username: [
                    {required: true, message: "请输入用户名", trigger: "blur",},
                ],
                password: [
                    { required: true, message: "请输入密码", trigger: "blur" },
                ],
            }),
            registerFormRules:reactive({
                phoneNumber: [
                    { type : 'number', validator: checkPhoneNumber , trigger: ['blur', 'change']},
                ],
                username: [
                    {required: true, message: "请输入用户名", trigger: "blur"},
                ],
                password: [
                    { required: true, message: "请输入密码", trigger: "blur" },
                ],
            }),
        };
    },
    methods:{
        handleLogin(formName){
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    service({
                        method: "post",
                        url: "/sys/login",
                        data: this.loginForm,
                    }).then((response) => {
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
                                    this.loginForm.phoneNumber
                                );
                                localStorage.setItem("ms_usertype", "user");
                                this.router.push("/user");
                                break;
                            case 5003:
                                ElMessage.info("欢迎，管理员" + response.data);
                                localStorage.setItem(
                                    "ms_username",
                                    response.data
                                );
                                localStorage.setItem(
                                    "ms_userphone",
                                    this.loginForm.phoneNumber
                                );
                                localStorage.setItem("ms_usertype", "admin");
                                this.router.push("/admin");
                                break;
                            default:
                                break;
                        }
                    }).catch((error) => {
                        ElMessage.error("登录失败："+error);
                    })
                } else {
                    ElMessage.error("登录失败");
                    return false;
                }
            })
        },
        handleRegister(formName){
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    service({
                        method: "post",
                        url: "/sys/register",
                        data: this.registerForm
                    }).then((response) => {
                        switch (response.code) {
                            case 5004:
                                ElMessage.info("注册成功");
                                this.store.commit("closeRegisterDialog");
                                break;
                            case 5005:
                                ElMessage.error("用户已存在");
                                break;
                            default:
                                break;
                        }
                    }).catch((error) => {
                        ElMessage.error("注册失败："+error);
                    })
                } else {
                    ElMessage.error("注册失败");
                    return false;
                }
            })
        },
    }
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
    color: rgb(17, 81, 110);
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
.register-btn {
    text-align: center;
}
.register-btn button {
    width: 45%;
    height: 36px;
    margin-bottom: 10px;
}
</style>
