<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i>收支管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <!-- 上方按钮区-->
            <!--搜索框-->
            <div class="handle-box">
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
                <el-input
                    v-model="searchContent"
                    placeholder="输入搜索内容"
                    class="handle-input mr10"
                    @keyup.enter="handleSearch"
                ></el-input>
                <el-button
                    type="primary"
                    icon="el-icon-search"
                    @click="handleSearch"
                    >搜索</el-button
                >
                <el-button
                    type="primary"
                    icon="el-icon-plus"
                    @click="handleInsert"
                    >新增</el-button
                >
            </div>
            <!--表格区-->
            <el-table
                :data="tableData"
                class="table"
                ref="multipleTable"
                header-cell-class-name="table-header"
                border
                highlight-current-row
                @selection-change="handleTableSelectionChange"
            >
                <el-table-column prop="itemId" label="编号"  sortable></el-table-column>
                <el-table-column prop="type" label="类型" sortable></el-table-column>
                <el-table-column prop="itemName" label="收入名称" sortable></el-table-column>
                <el-table-column prop="money" label="金额" sortable></el-table-column>
                <el-table-column prop="itemDate" label="时间" sortable></el-table-column>
                    <el-table-column prop="description" label="备注" sortable>
                    <template #default="scope">{{scope.row.description}}</template>
                </el-table-column>
                <el-table-column prop="createTime" label="建立时间" sortable>
                    <template #default="scope">{{
                        scope.row.createTime
                    }}</template>
                </el-table-column>
                <el-table-column prop="updateTime" label="更新时间" sortable>
                    <template #default="scope">{{
                        scope.row.updateTime
                    }}</template>
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

        <el-row :gutter="20">
            <el-col :span="10">
                <el-card shadow="hover">
                    <div class="queryMonth">
                        <span style="margin: 10px">选择月份</span>
                        <el-input-number
                            v-model="queryChartData.month"
                            controls-position="right"
                            :min="1"
                            :max="12"
                            @change="updateChart"
                        ></el-input-number>
                    </div>
                    <schart
                        class="schart"
                        canvasId="canvas"
                        :options="chartData"
                        :key="chartKey"
                    />
                </el-card>
            </el-col>
        </el-row>

        <!-- 编辑弹出框 -->
        <el-dialog
            title="收入信息"
            v-model="editVisible"
            width="30%"
            @closed="handleDialogClosed"
        >
            <el-form label-width="70px">
                <el-form-item label="编号">
                    <el-input v-model="form.itemId"></el-input>
                </el-form-item>
                <el-form-item label="收入类型">
                    <el-input v-model="form.type"></el-input>
                </el-form-item>
                <el-form-item label="名称">
                    <el-input v-model="form.itemName"></el-input>
                </el-form-item>
                <el-form-item label="金额">
                    <el-input v-model="form.money">
                        <template #prepend>￥</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="时间">
                    <el-date-picker
                        v-model="form.itemDate"
                        type="date"
                        format="YYYY 年 MM 月 DD 日"
                        placeholder="请选择时间"
                        value-format="YYYY-MM-DD">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="form.description"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="editVisible = false">取 消</el-button>
                    <el-button
                        v-if="isUpdate"
                        type="primary"
                        @click="saveUpdate"
                        >确 定</el-button
                    >
                    <el-button
                        v-if="isInsert"
                        type="primary"
                        @click="saveInsert"
                        >确 定</el-button
                    >
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import service from "../utils/request";
import Schart from "vue-schart";
export default {
    name: "earning-table",
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
                { value: "item_id", label: "编号" },
                { value: "item_name", label: "名称" },
                { value: "money", label: "金额" },
                { value: "description", label: "备注" },
            ],
            //用户选择的搜索项目
            searchOption: "",
            //用户搜索输入框内容
            searchContent: "",
            //表单数据
            form: {
                id: "",
                itemId: "",
                itemName: "",
                money: "",
                itemDate: "",
                type: "",
                description: "",
            },
            //用户点击的表格行索引
            idx: -1,
            // 标明为插入操作
            isInsert: false,
            // 标明为更新操作
            isUpdate: false,
            // 表单是否可见
            editVisible: false,
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
        // 强制图表重新渲染
        const chartKey = ref(0);
        // 图表查询数据
        const queryChartData = reactive({
            year: 1,
            month: 1,
        });
        //图表显示数据
        const chartData = reactive({
            type: "pie",
            title: {
                text: "收入类型饼状图",
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
        });
        /**
         * 方法区
         */
        // 从后端获取表格数据
        const getData = () => {
            service({
                method: "post",
                url: "/earning/query",
                data: query,
            })
                .then((response) => {
                    if (response.code === 200) {
                        var data = response.data
                        tableData.value = data.list
                        pageTotal.value = data.total
                    }
                })
                .catch((error) => {
                    ElMessage.error("加载数据失败：" + error);
                });
        };
        // 分页导航
        const handlePageChange = (val) => {
            query.pageIndex = val;
            getData();
        };
        // 页面大小改变操作
        const handleSizeChange = (val) => {
            query.pageSize = val;
            getData();
        };
        //获取当前年月
        const getYearMonth = () => {
            var d = new Date();
            queryChartData.month = d.getMonth() + 1;
            queryChartData.year = d.getFullYear();
        };
        //更新图表数据
        const updateChart = () => {
            service({
                method: "post",
                url: "/earning/querychart",
                data: queryChartData,
            })
                .then((response) => {
                    chartData.labels = response.data.list.labels;
                    chartData.datasets[0].data = response.data.list.data;
                    chartKey.value++;
                })
                .catch((error) => {
                    ElMessage.error("加载数据失败：" + error);
                });
        };
        /**
         * 执行区，初始化时执行的方法
         */
        getData();
        getYearMonth();
        updateChart();
        return {
            query,
            tableData,
            pageTotal,
            queryChartData,
            chartData,
            chartKey,
            getData,
            handleSizeChange,
            handlePageChange,
            updateChart,
        };
    },
    methods: {
        //搜索操作
        handleSearch() {
            let query = this.query;
            query.fieldName = this.searchOption;
            query.fieldValue = this.searchContent;
            service({
                method: "post",
                url: "/earning/query",
                data: query,
            }).then((response) => {
                if (response.code === 200) {
                    var data = response.data;
                    this.tableData = data.list;
                    this.pageTotal = data.total;
                }
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
        // 删除操作
        handleDelete(index, row){
            let idx = index;
            let form = this.form
            ElMessageBox.confirm("确定要删除吗？", "提示", {
                type: "warning",
            }).then(() => {
                //填充表单数据
                form = this.tableData[idx];
                service({
                    method : "post",
                    url : "/earning/delete",
                    data : form
                }).then((response) => {
                    if (response.code === 200) {
                        ElMessage.success("删除成功");
                        this.getData();
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
            this.idx = index;
            this.form = this.tableData[index];
            this.isUpdate = true
            this.editVisible = true
        },
        //保存更改到后端
        saveUpdate() {
            let form = this.form;
            let idx = this.idx;
            this.isUpdate = false;
            this.editVisible = false;
            service({
                method : "post",
                url:"/earning/update",
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
                .then((response) => {
                    if (response.code === 200) {
                        ElMessage.success(`编辑成功`);
                        const data = response.data.list;
                        //刷新表格
                        Object.keys(data).forEach((item) => {
                            this.tableData[idx][item] = data[item];
                        });
                    } else {
                        ElMessage.error(`编辑失败：` + response.message);
                    }
                })
                .catch((error) => {
                    ElMessage.error(`编辑失败：` + error);
                });
        },
        //处理新增操作
        handleInsert(){
            //清空表单
            this.form = {};
            this.isInsert = true
            this.editVisible = true
        },
        // 保存新增数据到后端
        saveInsert() {
            let form = this.form;
            this.isInsert = false;
            this.editVisible = false;
            service({
                method: "post",
                url: "/earning/insert",
                data: form,
            })
                .then((response) => {
                    if (response.code === 200) {
                        ElMessage.success(`插入成功`);
                        this.getData();
                    } else {
                        ElMessage.error(`插入失败：` + response.message);
                    }
                })
                .catch((error) => {
                    ElMessage.error(`插入失败：` + error);
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
    width: 300px;
    display: inline-block;
}
.table {
    width: 100%;
    font-size: 14px;
}
.red {
    color: #ff0000;
}
.mr10 {
    margin-right: 10px;
}
.table-td-thumb {
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
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
