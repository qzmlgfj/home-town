<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/" separator-class="el-icon-arrow-right">
                <el-breadcrumb-item>
                    <i class="iconfont icon-money"></i>三资管理
                </el-breadcrumb-item>
                <el-breadcrumb-item>
                    <i class="iconfont icon-fund"></i>资金管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <!-- 上方按钮区-->
            <!--搜索框-->
            <div class="handle-box">
                <el-input v-model="searchContent" placeholder="输入搜索内容"
                    class="handle-input mr10" @keyup.enter="handleSearch">
                    <template #prepend>
                        <el-select
                                v-model="searchOption"
                                class="handle-select mr10"
                                placeholder="请选择"
                                filterable
                                loading-text="数据加载中"
                                no-match-text="未找到匹配数据"
                                no-data-text="请选择"
                        >
                            <el-option
                                    v-for="item in searchOptions"
                                    :value="item.value"
                                    :label="item.label"
                            >
                            </el-option>
                        </el-select>
                    </template>
                </el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button type="primary" icon="el-icon-plus" @click="handleInsert">新增</el-button>
                <el-button icon="el-icon-data-analysis" @click="initChart" type="success">统计分析</el-button>
            </div>
            <!--表格区-->
            <el-table
                :data="tableData"
                v-loading="isLoadingTableData"
                element-loading-text="数据加载中"
                class="table"
                ref="multipleTable"
                header-cell-class-name="table-header"
                border
                highlight-current-row
                @selection-change="handleTableSelectionChange"
            >
                <el-table-column prop="fundId" label="资金编号" sortable></el-table-column>
                <el-table-column prop="type" label="资金类型" sortable></el-table-column>
                <el-table-column prop="fundValue" label="金额" sortable></el-table-column>
                <el-table-column prop="createTime" label="建立时间" sortable>
                    <template #default="scope">{{scope.row.createTime }}</template>
                </el-table-column>
                <el-table-column prop="updateTime" label="更新时间" sortable>
                    <template #default="scope">{{scope.row.updateTime }}</template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button
                            size="mini"
                            @click="handleUpdate(scope.$index, scope.row)"
                            >编辑</el-button
                        >
                        <el-button
                            size="mini"
                            type="danger"
                            @click="handleDelete(scope.$index, scope.row)"
                            >删除</el-button
                        >
                    </template>
                </el-table-column>
            </el-table>
            <!--分页组件-->
            <div class="pagination">
                <el-pagination
                    background
                    layout="total, prev, pager, next, sizes"
                    :current-page="query.pageIndex"
                    :page-size="query.pageSize"
                    :total="pageTotal"
                    :page-sizes="[5, 10, 15, 20]"
                    @current-change="handlePageChange"
                    @size-change="handleSizeChange"
                ></el-pagination>
            </div>
        </div>

        <el-drawer
            title="资金相关图表"
            v-model="isDrawerVisible"
            :direction="rtl"
            size="40%"
            :before-close="handleDrawerClose" destroy-on-close>
            <div class="queryMonth">
                <span style="margin: 10px">选择月份</span>
                <el-input-number
                    v-model="queryChartData.month"
                    controls-position="right"
                    :min="1"
                    :max="12"
                    @change="getChartData"
                ></el-input-number>
            </div>
            <el-card v-loading ="isLoadingChartData"
                     element-loading-text="图表加载中">
                <schart
                    class="schart"
                    canvasId="canvas"
                    :options="chartData"
                    :key="chartKey"
                />
            </el-card>
        </el-drawer>

        <!-- 编辑弹出框 -->
        <el-dialog
            title="资金信息"
            v-model="editVisible"
            width="30%"
            @closed="handleDialogClosed"
        >
            <el-form label-width="90px" :model="form" :rules="formRules" ref="form">
                <el-form-item label="资金编号" prop="fundId">
                    <el-input v-model.number="form.fundId"></el-input>
                </el-form-item>
                <el-form-item label="资金类型" prop="type">
                    <el-input v-model.trim="form.type"></el-input>
                </el-form-item>
                <el-form-item label="金额" prop="fundValue">
                    <el-input v-model.number="form.fundValue">
                        <template #prepend>￥</template>
                    </el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="editVisible = false">取 消</el-button>
                    <el-button v-if="isUpdate" type="primary" @click="saveUpdate('form')">确 定</el-button>
                    <el-button v-if="isInsert" type="primary" @click="saveInsert('form')">确 定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import service from "../utils/request";
import Schart from "vue-schart";

export default {
    name: "fund-table",
    components: {
        Schart,
    },
    data() {
        return {
            /**
             * 搜索选项，选择后value值会绑定到searchOption中
             * value值为数据库字段值,有空字段是为了全部查询用
             */
            searchOptions: [
                { value: "fund_id", label: "资金编号" },
                { value: "fund_value", label: "金额" },
            ],
            //用户选择的搜索项目
            searchOption: "",
            //用户搜索输入框内容
            searchContent: "",
            //表单数据
            form: {
                id: "",
                fundId: "",
                fundValue: "",
                type: "",
            },
            formRules : {
                fundId: [
                    { required: true, message: '资金编号不能为空', trigger: 'blur' },
                    { type: 'number', message: '资金编号只能为数字', trigger: 'change' },
                ],
                type: [
                    { required: true, message: '资金类型不能为空', trigger: 'blur' },
                ],
                fundValue: [
                    { required: true, message: '金额不能为空', trigger: 'blur' },
                    { type: 'number', message: '请输入数字', trigger: 'change' },
                ],
            },
            //用户点击的表格行索引
            clickedIndex: -1,
            // 标明为插入操作
            isInsert: false,
            // 标明为更新操作
            isUpdate: false,
            // 表单是否可见
            editVisible: false,
            //
            isDrawerVisible:false,
            // 是否正在加载图表数据
            isLoadingChartData:true,
            // 强制图表重新渲染
            chartKey:ref(0),
            // 图表查询数据
            queryChartData:reactive({
                year: 1,
                month: 1,
            }),
            //图表显示数据
            chartData : reactive({
                type: "pie",
                title: {
                    text: "资金类型分布饼状图",
                },
                legend: {
                    position: "left",
                },
                bgColor: "#fbfbfb",
                labels: [
                ],
                datasets: [
                    {
                        data: [],
                    },
                ],
            }),
        };
    },
    setup() {
        /**
         * 数据区
         */
        // 查询时的数据
        let query = {
            fieldName: "",
            fieldValue: "",
            pageIndex: 1,
            pageSize: 5,
        };
        // 表格当前页数据
        const tableData = ref([]);
        // 表格数据总条目数
        const pageTotal = ref(0);
        const isLoadingTableData = ref(true);
        /**
         * 方法区
         */
        // 获取表格数据
        const getTableData = () => {
            isLoadingTableData.value = true;
            service({
                method: "post",
                url: "/fund/query",
                data: query,
            }).then((response) => {
                if (response.code === 200) {
                    const data = response.data;
                    tableData.value = data.list;
                    pageTotal.value = data.total;
                    isLoadingTableData.value = false;
                }
            }).catch((error) => {
                ElMessage.error("加载数据失败：" + error);
            });
        };
        // 分页导航
        const handlePageChange = (val) => {
            query.pageIndex = val;
            getTableData();
        };
        // 页面大小改变操作
        const handleSizeChange = (val) => {
            query.pageSize = val;
            getTableData();
        };

        /**
         * 执行区，初始化时执行的方法
         */
        getTableData();
        return {
            query,
            tableData,
            pageTotal,
            isLoadingTableData,
            getTableData,
            handleSizeChange,
            handlePageChange,
        };
    },
    methods: {
        // 获取当前年月
        getYearAndMonth(){
            const date = new Date();
            this.queryChartData.month = date.getMonth() + 1;
            this.queryChartData.year = date.getFullYear();
        },
        // 更新图表数据
        getChartData(){
            this.isLoadingChartData = true;
            service({
                method: "post",
                url: "/fund/querychart",
                data: this.queryChartData,
            }).then((response) => {
                this.chartData.labels = response.data.list.labels;
                this.chartData.datasets[0].data = response.data.list.data;
                this.chartKey++;
                this.isLoadingChartData = false;
            }).catch((error) => {
                ElMessage.error("加载图表失败：" + error);
            });
        },
        //搜索操作
        handleSearch() {
            let query = this.query;
            query.fieldName = this.searchOption;
            query.fieldValue = this.searchContent;
            service({
                method: "post",
                url: "/fund/query",
                data: query,
            }).then((response) => {
                if (response.code === 200) {
                    const data = response.data;
                    this.tableData = data.list;
                    this.pageTotal = data.total;
                }
            }).catch((error) => {
                ElMessage("查询失败" + error);
            });
        },
        //表格选择项目改变时
        handleTableSelectionChange(val) {
            this.selections = val;
        },
        //弹出框关闭前的操作
        handleDialogClosed() {
            this.isUpdate = false;
            this.isInsert = false;
        },
        handleDrawerClose(done){
            done();
            this.isLoadingChartData = false;
        },
        //图表数据初始化
        initChart(){
            this.isLoadingChartData = true
            this.isDrawerVisible = true;
            this.getYearAndMonth();
            this.getChartData();
            this.isLoadingChartData = false;
        },
        // 删除操作
        handleDelete(index, row) {
            const form = JSON.parse(JSON.stringify(this.tableData[index]));
            ElMessageBox.confirm("确定要删除吗？", "提示", {
                type: "warning",
            }).then(() => {
                service({
                    method : "post",
                    url : "/fund/delete",
                    data : form
                }).then((response) => {
                    if (response.code === 200) {
                        ElMessage.success("删除成功");
                        //此处处理表格变化
                        this.tableData.splice(index,1)
                        this.getTableData();
                    } else {
                        ElMessage.error(`删除失败，错误信息:` + response.message);
                    }
                }).catch((error) => {
                    ElMessage.error(`删除失败：` + error);
                })
            })
        },
        //处理保存动作
        handleUpdate(index, row) {
            this.clickedIndex = index;
            this.form=JSON.parse(JSON.stringify(this.tableData[index]));
            this.isUpdate = true
            this.editVisible = true
        },
        //保存更改到后端
        saveUpdate(formName){
            this.$refs[formName].validate((valid) => {
                if(valid){
                    const form = JSON.parse(JSON.stringify(this.form));
                    let idx = this.clickedIndex
                    this.isUpdate = false
                    this.editVisible = false
                    service({
                        method : "post",
                        url:"/fund/update",
                        data : form,
                    }).then((response) => {
                        if (response.code === 200) {
                            ElMessage.success(`编辑成功`);
                            //刷新表格
                            this.tableData[idx] = response.data.list;
                        } else {
                            ElMessage.error(`编辑失败：` + response.message);
                        }
                    }).catch((error) => {
                        ElMessage.error(`编辑失败：` + error);
                    })
                }
            })

        },
        //处理新增操作
        handleInsert(){
            //清空表单
            this.form = {};
            this.isInsert = true
            this.editVisible = true
        },
        // 保存新增数据到后端
        saveInsert(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    this.isInsert = false
                    this.editVisible = false
                    service({
                        method: "post",
                        url: "/fund/insert",
                        data: this.form
                    }).then((response) => {
                        if (response.code === 200) {
                            ElMessage.success(`插入成功`);
                            this.getTableData()
                        } else {
                            ElMessage.error(`插入失败：` + response.message);
                        }
                    }).catch(error => {
                        ElMessage.error(`插入失败：` + error);
                    })
                }
            });

        },
    },
};
</script>

<style scoped>
.handle-box {
    margin-bottom: 20px;
}

.handle-select {
    width: 120px;
}

.handle-input {
    width: 500px;
}
.table {
    width: 100%;
    font-size: 14px;
}

.mr10 {
    margin-right: 10px;
}

.schart {
    width: 100%;
    height: 300px;
    margin-top: 20px;
}

.queryMonth {
    display: flex; /**/
    justify-content: center; /*水平居中*/
    align-items: Center; /*垂直居中*/
}
</style>
