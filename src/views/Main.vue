<template>
    <el-scrollbar style="height: 100%">
        <div class="whole">
            <el-container>
                <div class="head">
                    <div class="header-left">
                        <div class="left-icon">
                            <el-avatar
                                :size="50"
                                src="https://pic.qzmlgfj.ml/images/2021/07/20/favicon.png"
                            ></el-avatar>
                        </div>
                        <div class="left-text">
                            <h1>示范区基层公开监督管理平台</h1>
                        </div>
                    </div>
                    <div class="header-right">
                        <el-descriptions :title="userName">
                            <el-descriptions-item label="手机号：">{{
                                phoneNumber
                            }}</el-descriptions-item>
                            <el-descriptions-item label="备注：">
                                <el-tag size="small"> {{userType}} </el-tag>
                            </el-descriptions-item>
                            <el-descriptions-item>
                                <el-button type="text" @click="logout"
                                    >退出登录</el-button
                                >
                            </el-descriptions-item>
                        </el-descriptions>
                    </div>
                </div>

                <el-divider></el-divider>

                <el-container>
                    <el-main>
                        <el-carousel :interval="4000" height="250px" autoplay>
                            <el-carousel-item
                                v-for="item in imgbox"
                                :key="item.id"
                            >
                                <el-image
                                    style="width: 100%; height: 250px"
                                    :fit="fit"
                                    :src="item.src"
                                ></el-image>
                            </el-carousel-item>
                        </el-carousel>
                    </el-main>
                </el-container>

                <br />
                <el-divider></el-divider>
                <br />

                <el-container>
                    <el-aside class="navi">
                        <el-menu
                            default-active="1"
                            class="el-menu-vertical-demo"
                        >
                            <el-menu-item index="1" @click="showAffair">
                                <i class="el-icon-folder-opened"></i>
                                <template #title>三务公开</template>
                            </el-menu-item>

                            <el-menu-item index="2" @click="showHotspot">
                                <i class="el-icon-document"></i>
                                <template #title>热点搜集公开</template>
                            </el-menu-item>

                            <el-menu-item index="3" @click="showPolicy">
                                <i class="el-icon-s-promotion"></i>
                                <template #title>廉政宣传</template>
                            </el-menu-item>
                        </el-menu>
                    </el-aside>

                    <el-main>
                        <el-row :gutter="10">
                            <el-col :span="20">
                                <el-card shadow="hover">
                                    <template #header>
                                        <div class="card-header">
                                            <h5>{{ mainpart }}</h5>
                                        </div>
                                    </template>

                                    <div v-for="item in items" :key="item">
                                        <div class="left-title">
                                            <el-button
                                                type="text"
                                                @click="showArticle(item)"
                                            >
                                                {{ item.title }}
                                            </el-button>
                                        </div>
                                        <el-divider
                                            direction="vertical"
                                        ></el-divider>
                                        <div class="right-time">
                                            {{ item.releaseDate }}
                                        </div>
                                        <el-divider></el-divider>
                                    </div>

                                    <div class="block">
                                        <el-pagination
                                            @current-change="
                                                handleCurrentChange
                                            "
                                            :currentPage="query.pageIndex"
                                            :page-size="query.pageSize"
                                            layout="prev, pager, next"
                                            :total="totalNum"
                                        >
                                        </el-pagination>
                                    </div>
                                </el-card>
                            </el-col>
                        </el-row>
                    </el-main>
                </el-container>
                <br />
                <el-divider></el-divider>
                <br />

                <el-footer>
                    <el-row :gutter="20">
                        <el-col :span="10"
                            ><div class="grid-content bg-purple"></div
                        ></el-col>
                        <el-col :span="11">
                            <div class="grid-content bg-purple">
                                coypright@Group 7
                            </div>
                        </el-col>
                        <el-col :span="3">
                            <el-affix position="bottom" :offset="30">
                                <el-button
                                    type="primary"
                                    icon="el-icon-edit"
                                    @click="dialogVisible = true"
                                    >满意度评价</el-button
                                >
                            </el-affix>
                        </el-col>
                    </el-row>

                    <el-dialog title="满意度评价" v-model="dialogVisible">
                        <el-form
                            ref="formref"
                            :model="form"
                            :rules="thisrule"
                            label-position="right"
                            label-width="100px"
                        >
                            <el-form-item label="姓名">
                                <el-input
                                    v-model="form.name"
                                    autocomplete="off"
                                    placeholder="请填写姓名"
                                ></el-input>
                            </el-form-item>
                            <el-form-item label="手机号">
                                <el-input
                                    v-model="form.tel"
                                    autocomplete="off"
                                    placeholder="请填写手机号码"
                                ></el-input>
                            </el-form-item>
                            <el-form-item label="实时性评价">
                                <div class="form-rate">
                                    <el-rate
                                        v-model="form.comment1"
                                        allow-half
                                    />
                                </div>
                            </el-form-item>
                            <el-form-item label="公开度评价">
                                <div class="form-rate">
                                    <el-rate
                                        v-model="form.comment2"
                                        allow-half
                                    />
                                </div>
                            </el-form-item>
                            <el-form-item label="真实性评价">
                                <div class="form-rate">
                                    <el-rate
                                        v-model="form.comment3"
                                        allow-half
                                    />
                                </div>
                            </el-form-item>
                            <el-form-item label="其他建议">
                                <el-input
                                    type="textarea"
                                    v-model="form.extra"
                                    placeholder="如有其他建议，请在此处填写"
                                ></el-input>
                            </el-form-item>
                        </el-form>

                        <template #footer>
                            <div class="dialog-footer" align="center">
                                <el-button
                                    @click="dialogVisible = false"
                                    size="medium"
                                    >取消</el-button
                                >
                                <el-button type="primary" @click="submitForm"
                                    >提交</el-button
                                >
                            </div>
                        </template>
                    </el-dialog>
                </el-footer>
            </el-container>
        </div>
    </el-scrollbar>

    <el-dialog title="查看文章" v-model="articleDialogVisible" width="70%">
        <div class="markdown-body">
            <Markdown :source="articleContent" :breaks="true" />
        </div>
    </el-dialog>
</template>

<script>
import { ElButton } from "element-plus";
import { ref } from "vue";
import { ElMessage } from "element-plus";
import service from "../utils/request";
import Markdown from "vue3-markdown-it";
import { useRouter } from "vue-router";

export default {
    name: "Main",
    setup() {
        let items = ref([]);
        let totalNum = ref(0);
        let mainpart = ref("三务公开");
        const userName = ref("欢迎您，" + localStorage.getItem("ms_username"));
        const phoneNumber = ref(localStorage.getItem("ms_userphone"));
        const userType = ref(
            localStorage.getItem("ms_usertype") === "admin"
                ? "管理员"
                : "普通用户"
        );
        const router = useRouter();
        const query = {
            pageIndex: 1,
            pageSize: 7,
            fieldName: "",
            fieldValue: "",
        };

        const getData = (mainpartValue, url) => {
            if (mainpart.value != mainpartValue) {
                query.pageIndex = 1;
                mainpart.value = mainpartValue;
            }
            service({
                method: "post",
                url: url,
                data: query,
            }).then((Response) => {
                if (Response.code === 200) {
                    console.log(Response);
                    items.value = Response.data.list;
                    totalNum.value = Response.data.total;
                }
            });
        };
        const showAffair = () => {
            getData("三务公开", "/transaction/query");
        };
        const showHotspot = () => {
            getData("热点搜集公开", "/hotspot/query");
        };
        const showPolicy = () => {
            getData("廉政公开", "/publicity/query");
        };
        const logout = () => {
            localStorage.removeItem("ms_username");
            router.replace("/login");
        };

        showAffair();
        return {
            items,
            totalNum,
            mainpart,
            query,
            userName,
            phoneNumber,
            userType,
            getData,
            showAffair,
            showHotspot,
            showPolicy,
            logout,
        };
    },
    data() {
        return {
            imgbox: [
                {
                    id: 0,
                    src: "https://pic.qzmlgfj.ml/images/2021/07/23/QQ20210723091950.jpg",
                },
                {
                    id: 1,
                    src: "https://pic.qzmlgfj.ml/images/2021/07/23/QQ20210723092934.png",
                },
                {
                    id: 2,
                    src: "https://pic.qzmlgfj.ml/images/2021/07/23/QQ20210723092940.png",
                },
            ],
            dialogVisible: false,
            articleDialogVisible: false,
            articleContent: "# Test \n Hello!",
            form: {
                name: "",
                tel: "",
                extra: "",
            },
            comment1: null,
            comment2: null,
            comment3: null,
            thisrule: {
                name: [
                    { required: true, message: "请输入姓名", trigger: "blur" },
                ],
                tel: [
                    {
                        required: true,
                        message: "请输入电话号码",
                        trigger: "blur",
                    },
                ],
            },
        };
    },
    components: {
        ElButton,
        Markdown,
    },

    methods: {
        login() {
            this.$router.push("/login");
        },
        handleCurrentChange(val) {
            this.query.pageIndex = val;
            if (this.mainpart === "三务公开") this.showAffair();
            else if (this.mainpart === "热点搜集公开") this.showHotspot();
            else this.showPolicy();
        },
        submitForm() {
            let date = new Date();
            console.log(this.form);
            let formdata = {
                evaluationId: this.form.tel,
                evaluator: this.form.name,
                satisfaction:
                    this.form.comment1 +
                    this.form.comment2 +
                    this.form.comment3,
                comment: this.form.extra,
            };
            service({
                method: "post",
                url: "/evaluation/insert",
                data: formdata,
            }).then((Response) => {
                if (Response.code === 200) {
                    this.dialogVisible = false;
                    ElMessage({
                        showClose: true,
                        message: "提交成功",
                        type: "success",
                    });
                }
            });
        },
        getText(url, itemEntity) {
            service({
                method: "post",
                url: url,
                data: itemEntity,
            }).then((Response) => {
                console.log(Response);
                this.articleContent = Response.data.list.link;
            });
        },
        showArticle(item) {
            this.articleDialogVisible = true;
            if (this.mainpart === "三务公开")
                this.getText("/transaction/queryone", item);
            else if (this.mainpart === "热点搜集公开")
                this.getText("/hotspot/queryone", item);
            else this.getText("/publicity/queryone", item);
        },
    },
};
</script>

<style scoped>
@import "github-markdown-css";

.header-left {
    background-color: rgb(252, 253, 253);
    height: 70px;
    width: 48%;
    margin-top: 2%;
    margin-left: 10%;
    border-bottom-color: rgba(107, 82, 56, 0);
    float: left;
}
.header-right {
    float: right;
    height: 70px;
    width: 40%;
    margin-top: 1%;
    background-color: rgb(252, 253, 253);
    border-bottom-color: rgba(107, 82, 56, 0);
}
.head {
    width: 100%;
    height: 80px;
    background-color: rgb(255, 255, 255);
    border-bottom-color: rgb(25, 66, 25);
}
.left-icon {
    width: 10%;
    float: left;
}
.left-text {
    float: right;
    width: 90%;
    line-height: 50px;
    color: rgb(175, 175, 231);
}
.dialog-footer {
    align-content: center;
    margin-bottom: 10%;
}
.navi {
    width: 15%;
    margin-left: 30px;
    margin-top: 2%;
    height: 300px;
}
.right-time {
    float: right;
    width: 15%;
    color: #909399;
    font-size: 12px;
    line-height: 1.7;
}
.left-title {
    float: left;
    width: 75%;
    font-size: 16px;
}

.card-header {
    height: 3%;
}
.whole {
    overflow: auto;
}
.form-rate {
    line-height: 1.7;
    margin-top: 2%;
    margin-left: 3%;
}
</style>
