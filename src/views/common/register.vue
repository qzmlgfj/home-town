<template>
    <div class="site-wrapper site-page--login">
        <div class="site-content__wrapper">
            <div class="site-content">
                <div class="brand-info">
                    <h2 class="brand-info__text">欢迎使用</h2>
                    <p class="brand-info__intro">
                        台下何人，状告本官？
                    </p>
                </div>
                <div class="login-main">
                    <h3 class="login-title">新用户注册</h3>
                    <el-form
                        :model="dataForm"
                        :rules="dataRule"
                        ref="dataForm"
                        @keyup.enter.native="dataFormSubmit()"
                        status-icon
                    >
                        <el-form-item prop="userName">
                            <el-input
                                v-model="dataForm.userName"
                                placeholder="姓名"
                            ></el-input>
                        </el-form-item>
                        <el-form-item prop="password">
                            <el-input
                                v-model="dataForm.password"
                                type="password"
                                placeholder="密码"
                            ></el-input>
                        </el-form-item>
                        <el-form-item prop="phoneNumber">
                            <el-input
                                v-model="dataForm.phoneNumber"
                                placeholder="手机号码"
                            ></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button
                                class="back-login-btn"
                                type="primary"
                                @click="backToLogin()"
                                >返回</el-button
                            >
                            <!--TODO 注册手段-->
                            <el-button
                                class="sign-up-btn"
                                type="primary"
                                @click="dataFormSubmit()"
                                >注册</el-button
                            >
                        </el-form-item>
                    </el-form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            dataForm: {
                userName: "",
                password: "",
                phoneNumber: "",
                captcha: "",
            },
            dataRule: {
                userName: [
                    {
                        required: true,
                        message: "用户姓名不能为空",
                        trigger: "blur",
                    },
                ],
                password: [
                    {
                        required: true,
                        message: "密码不能为空",
                        trigger: "blur",
                    },
                ],
                phoneNumber: [
                    {
                        required: true,
                        message: "手机号码不能为空",
                        trigger: "blur",
                    },
                ]
            },
            captchaPath: "",
        };
    },
    methods: {
        // 提交表单
        dataFormSubmit() {
            this.$refs["dataForm"].validate((valid) => {
                if (valid) {
                    this.$http({
                        url: this.$http.adornUrl("/sys/login"),
                        method: "post",
                        data: this.$http.adornData({
                            username: this.dataForm.userName,
                            password: this.dataForm.password,
                            uuid: this.dataForm.uuid,
                            captcha: this.dataForm.captcha,
                        }),
                    }).then(({ data }) => {
                        if (data && data.code === 0) {
                            this.$cookie.set("token", data.token);
                            this.$router.replace({ name: "home" });
                        } else {
                            this.getCaptcha();
                            this.$message.error(data.msg);
                        }
                    });
                }
            });
        },
        backToLogin() {
            this.$router.replace({ name: "login" });
        },
    },
};
</script>

<style lang="scss" scope>
.site-wrapper.site-page--login {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(38, 50, 56, 0.6);
    overflow: hidden;
    &:before {
        position: fixed;
        top: 0;
        left: 0;
        z-index: -1;
        width: 100%;
        height: 100%;
        content: "";
        background-image: url(~@/assets/img/login_bg.jpg);
        background-size: cover;
    }
    .site-content__wrapper {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        padding: 0;
        margin: 0;
        overflow-x: hidden;
        overflow-y: auto;
        background-color: transparent;
    }
    .site-content {
        min-height: 100%;
        padding: 30px 500px 30px 30px;
    }
    .brand-info {
        margin: 220px 100px 0 90px;
        color: #fff;
    }
    .brand-info__text {
        margin: 0 0 22px 0;
        font-size: 48px;
        font-weight: 400;
        text-transform: uppercase;
    }
    .brand-info__intro {
        margin: 10px 0;
        font-size: 16px;
        line-height: 1.58;
        opacity: 0.6;
    }
    .login-main {
        position: absolute;
        top: 0;
        right: 0;
        padding: 150px 60px 180px;
        width: 470px;
        min-height: 100%;
        background-color: #fff;
    }
    .login-title {
        font-size: 16px;
    }
    .login-captcha {
        overflow: hidden;
        > img {
            width: 100%;
            cursor: pointer;
        }
    }
    .back-login-btn {
        width: 45%;
        margin-top: 38px;
    }
    .sign-up-btn {
        width: 45%;
        margin-top: 38px;
        background-color: rgb(28, 120, 224);
    }
}
</style>
