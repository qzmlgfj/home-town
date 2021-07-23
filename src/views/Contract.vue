<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="iconfont icon-contract"></i>合同管理
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
                                no-data-text="请选择">
                            <el-option
                                    v-for="item in searchOptions"
                                    :value="item.value"
                                    :label="item.label">
                            </el-option>
                        </el-select>
                    </template>
                </el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch" >搜索</el-button>
                <el-button type="primary" icon="el-icon-plus" @click="handleInsert">新增</el-button>
            </div>
            <!--表格区-->
            <el-table :data="tableData"
                      v-loading="isLoadingTableData"
                      element-loading-text="数据加载中"
                      class="table"
                      ref="multipleTable"
                      header-cell-class-name="table-header"
                      border highlight-current-row
                      @selection-change="handleTableSelectionChange"
            >
                <el-table-column prop="contractId" label="合同编号"  sortable></el-table-column>
                <el-table-column prop="partA" label="甲方" sortable></el-table-column>
                <el-table-column prop="partB" label="乙方" sortable></el-table-column>
                <el-table-column prop="contractName" label="合同名称"  sortable></el-table-column>
                <el-table-column prop="startDate" label="开始时间"  sortable></el-table-column>
                <el-table-column prop="deadLine" label="结束时间"  sortable></el-table-column>
                <el-table-column prop="createTime" label="建立时间" sortable></el-table-column>
                <el-table-column prop="updateTime" label="更新时间" sortable></el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button
                            size="mini"
                            @click="handleUpdate(scope.$index, scope.row)">编辑</el-button>
                        <el-button
                            size="mini"
                            type="danger"
                            @click="handleDelete(scope.$index, scope.row)">删除</el-button>
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
                    @size-change="handleSizeChange"></el-pagination>
            </div>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog title="合同信息" v-model="editVisible" width="30%"
                   @closed="handleDialogClosed">
            <el-form label-width="90px" :model="form" :rules="formRules" ref="form">
                <el-form-item label="合同编号" prop="contractId">
                    <el-input v-model.number="form.contractId"></el-input>
                </el-form-item>
                <el-form-item label="合同名称" prop="contractName">
                    <el-input v-model="form.contractName"></el-input>
                </el-form-item>
                <el-form-item label="甲方" prop="partA">
                    <el-input v-model="form.partA"></el-input>
                </el-form-item>
                <el-form-item label="乙方" prop="partB">
                    <el-input v-model="form.partB"></el-input>
                </el-form-item>
                <el-form-item label="开始日期" prop="startDate">
                    <el-date-picker
                        v-model="form.startDate"
                        type="date"
                        format="YYYY 年 MM 月 DD 日"
                        placeholder="请选择开始日期"
                        value-format="YYYY-MM-DD">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="结束日期" prop="deadLine">
                    <el-date-picker
                        v-model="form.deadLine"
                        type="date"
                        format="YYYY 年 MM 月 DD 日"
                        placeholder="请选择结束日期"
                        value-format="YYYY-MM-DD">
                    </el-date-picker>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="editVisible = false">取 消</el-button>
                    <el-button v-if="isUpdate" type="primary"  @click="saveUpdate('form')">确 定</el-button>
                    <el-button v-if="isInsert" type="primary"  @click="saveInsert('form')">确 定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { ref} from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import service from "../utils/request";

export default {
    name: "asset-table",
    data() {
        const checkStartDate = (rule, value, callback) => {
            if (value === ''){
                callback(new Error('请选择开始日期'));
            }
            const startDate = new Date(value);
            if (this.form.deadLine !== '') {
                const deadLine = new Date(this.form.deadLine);
                if(startDate.getTime() > deadLine.getTime()){
                    callback(new Error('开始日期须小于或等于结束日期'));
                }
            }
            callback()
        };
        const checkDeadLine = (rule, value, callback) => {
            if (value === ''){
                callback(new Error('请选择结束日期'));
            }
            const deadLine = new Date(value);
            if (this.form.startLine !== '') {
                const startDate = new Date(this.form.startDate);
                if(startDate.getTime() > deadLine.getTime()){
                    callback(new Error('结束日期须大于或等于开始日期'));
                }
            }
            callback()
        };
        return {
            /**
             * 搜索选项，选择后value值会绑定到searchOption中
             * value值为数据库字段值,有空字段是为了全部查询用
             */
            searchOptions : [
                { value:"contract_id", label : "合同编号"},
                { value:"contract_name", label : "合同名称"},
                { value:"part_a", label : "甲方"},
                { value:"part_b", label : "乙方"},
            ],
            //用户选择的搜索项目
            searchOption:"",
            //用户搜索输入框内容
            searchContent:"",
            //表单数据
            form:{
                id:"",
                contractId:"",
                contractName:"",
                partA:"",
                partB:"",
                startDate:"",
                deadLine:"",
            },
            formRules : {
                contractId: [
                    { required: true, message: '合同编号不能为空', trigger: 'blur' },
                    { type: 'number', message: '合同编号只能为数字', trigger: 'change' },
                ],
                contractName: [
                    { required: true, message: '合同名称不能为空', trigger: 'blur' },
                ],
                partA: [
                    { required: true, message: '请填写甲方名称', trigger: 'blur' },
                ],
                partB: [
                    { required: true, message: '请填写乙方名称', trigger: 'blur' },
                ],
                startDate: [
                    { required: true, validator: checkStartDate, trigger: 'blur' },
                    { required: true, validator: checkStartDate, trigger: 'change' }
                ],
                deadLine: [
                    { required: true, validator: checkDeadLine, trigger: 'blur' },
                    { required: true, validator: checkDeadLine, trigger: 'change' }
                ]
            },
            //用户点击的表格行索引
            clickedIndex : -1,
            // 标明为插入操作
            isInsert : false,
            // 标明为更新操作
            isUpdate :false,
            // 表单是否可见
            editVisible : false,
        }
    },
    setup(){
        /**
         * 数据区
         */
        // 查询时的数据
        let query = {
                fieldName:"",
                fieldValue:"",
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
        //获取表格数据
        const getTableData = () => {
                isLoadingTableData.value = true;
                service({
                    method : "post",
                    url: "/contract/query",
                    data : query
                }).then((response) => {
                    if (response.code === 200) {
                        const data = response.data;
                        tableData.value = data.list
                        pageTotal.value = data.total
                        isLoadingTableData.value = false;
                    }
                }).catch((error) => {
                    ElMessage.error("加载数据失败：" + error)
                })
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
        getTableData()
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
    methods:{
        //搜索操作
        handleSearch(){
            let query = this.query
            query.fieldName = this.searchOption
            query.fieldValue = this.searchContent
            service({
                method : "post",
                url : "/contract/query",
                data : query
            }).then((response) => {
                if (response.code === 200) {
                    const data = response.data;
                    this.tableData = data.list
                    this.pageTotal = data.total
                }
            })
        },
        //表格选择项目改变时
        handleTableSelectionChange(val){
            this.selections = val;
        },
        //弹出框关闭前的操作
        handleDialogClosed(){
            this.isUpdate = false
            this.isInsert = false
        },
        // 删除操作
        handleDelete(index, row){
            //填充表单数据
            const form = JSON.parse(JSON.stringify(this.tableData[index]));
            ElMessageBox.confirm("确定要删除吗？", "提示", {
                type: "warning",
            }).then(() => {
                service({
                    method : "post",
                    url : "/contract/delete",
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
        handleUpdate(index, row){
            this.clickedIndex = index;
            this.form = JSON.parse(JSON.stringify(this.tableData[index]));
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
                        url:"/contract/update",
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
        saveInsert(formName){
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    const form = JSON.parse(JSON.stringify(this.form));
                    this.isInsert = false
                    this.editVisible = false
                    service({
                        method: "post",
                        url: "/contract/insert",
                        data: form
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
    }
}
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

</style>
