<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="iconfont icon-project"></i> 项目管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <!-- 上方按钮区-->
            <!--搜索框-->
            <div class="handle-box">
                <el-select
                    v-model="searchOption"
                    @change="isProjectStateSelected = searchOption === 'state';searchContent=''"
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
                <el-select  v-if="isProjectStateSelected" v-model="searchContent" placeholder="请选择状态">
                    <el-option
                        v-for="item in projectStates"
                        :label="item.projectState"
                        :value="item.projectState">
                    </el-option>
                </el-select>
                <el-input  v-else v-model="searchContent" placeholder="输入搜索内容" class="handle-input mr10" @keyup.enter="handleSearch"></el-input>
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
                <el-table-column prop="projectId" label="项目编号"  sortable></el-table-column>
                <el-table-column prop="projectName" label="项目名称" sortable></el-table-column>
                <el-table-column prop="principal" label="负责人" sortable></el-table-column>
                <el-table-column label="状态" >
                    <template #default="scope">
                        <el-tag :type="projectStates.find(item => item.projectState === scope.row.state).type">
                            {{scope.row.state}}
                        </el-tag>
                    </template>
                </el-table-column>
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
        <el-dialog title="项目信息" v-model="editVisible" width="30%"
                   @closed="handleDialogClosed">
            <el-form label-width="90px" :model="form" :rules="formRules" ref="form">
                <el-form-item label="项目编号" prop="projectId">
                    <el-input v-model.number="form.projectId" ></el-input>
                </el-form-item>
                <el-form-item label="项目名称" prop="projectName">
                    <el-input v-model="form.projectName" ></el-input>
                </el-form-item>
                <el-form-item label="项目负责人" prop="projectLeader">
                    <el-input v-model="form.principal" ></el-input>
                </el-form-item>
                <el-form-item label="状态" prop="state">
                    <template #default="scope">
                        <el-select v-model="form.state" :placeholder="form.state">
                            <el-option
                                v-for="item in projectStates"
                                :value="item.projectState">
                                {{item.projectState}}
                            </el-option>
                        </el-select>
                    </template>
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
    name: "project",
    data() {
        return {
            //状态值
            projectStates: [
                {projectState: '已完成', type: 'success'},
                {projectState: '审核中', type: 'warning'},
                {projectState: '审核失败', type: 'danger'},
                {projectState: '立项中', type: ''},
                {projectState: '实施中', type: ''},
            ],
            /**
             * 搜索选项，选择后value值会绑定到searchOption中
             * value值为数据库字段值,有空字段是为了全部查询用
             */
            searchOptions : [
                { value:"project_id", label : "项目编号"},
                { value:"project_name", label : "项目名称"},
                { value:"principal", label : "负责人"},
                { value:"state", label : "状态"},
            ],
            //用户选择的搜索项目
            searchOption:"",
            //用户搜索输入框内容
            searchContent:"",
            //表单数据
            form:{
                id:"",
                projectId:"",
                projectName:"",
                principal:"",
                state:"",
            },
            formRules : {
                projectId: [
                    { required: true, message: '项目编号不能为空', trigger: 'blur' },
                    { type: 'number', message: '项目编号只能为数字', trigger: 'change' },
                ],
                projectName: [
                    { required: true, message: '项目名称不能为空', trigger: 'blur' },
                ],
                principal: [
                    { required: true, message: '请输入项目负责人', trigger: 'blur' },
                ],
                state: [
                    { required: true, message: '项目状态不能为空', trigger: 'blur' },
                ],
            },
            //用户点击的表格行索引
            clickedIndex : -1,
            // 标明为插入操作
            isInsert : false,
            // 标明为更新操作
            isUpdate :false,
            // 表单是否可见
            editVisible : false,
            isProjectStateSelected:false,
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
            // 从后端获取表格数据
        const getTableData = () => {
                isLoadingTableData.value = true;
                service({
                    method : "post",
                    url : "/project/query",
                    data: query
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
                url : "/project/query",
                data : query
            }).then((response) => {
                if (response.code === 200) {
                    var data = response.data
                    this.tableData = data.list
                    this.pageTotal = data.total
                }
            }).catch((error) => {
                ElMessage("查询失败"+error)
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
            const form = JSON.parse(JSON.stringify(this.tableData[index]));
            ElMessageBox.confirm("确定要删除吗？", "提示", {
                type: "warning",
            }).then(() => {
                service({
                    method : "post",
                    url : "/project/delete",
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
                        url:"/project/update",
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
            this.form = {}
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
                        url: "/project/insert",
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
        }
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
    width: 300px;
    display: inline-block;
}
.table {
    width: 100%;
    font-size: 14px;
}

.mr10 {
    margin-right: 10px;
}
</style>
