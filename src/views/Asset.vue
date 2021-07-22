<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i>资产管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <!-- 上方按钮区-->
            <!--搜索框-->
            <div class="handle-box">
                <el-select
                    v-model="searchOption"
                    @change="isAssetStateSelected = searchOption === 'state';searchContent=''"
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
                <el-select v-if="isAssetStateSelected" v-model="searchContent" placeholder="请选择状态">
                    <el-option
                        v-for="item in assetStates"
                        :label="item.assetState"
                        :value="item.assetState">
                    </el-option>
                </el-select>
                <el-input v-else v-model="searchContent" placeholder="输入搜索内容" class="handle-input mr10" @keyup.enter="handleSearch"></el-input>
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
                <el-table-column prop="assetId" label="资产编号" sortable></el-table-column>
                <el-table-column prop="type" label="资产类型"  sortable></el-table-column>
                <el-table-column prop="assetValue" label="资产价值" sortable></el-table-column>
                <el-table-column label="状态" >
                    <template #default="scope">
                        <el-tag :type="assetStates.find(item => item.assetState === scope.row.state).type">
                            {{scope.row.state}}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="建立时间" sortable>
                    <template #default="scope">{{scope.row.createTime}}</template>
                </el-table-column>
                <el-table-column prop="updateTime" label="更新时间" sortable>
                    <template #default="scope">{{scope.row.updateTime}}</template>
                </el-table-column>
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
        <el-dialog title="资产信息" v-model="editVisible" width="30%"
                   @closed="handleDialogClosed">
            <el-form label-width="90px" :model="form" :rules="formRules" ref="form">
                <el-form-item label="资产编号" prop="assetId">
                    <el-input v-model.number="form.assetId"></el-input>
                </el-form-item>
                <el-form-item label="资产类型" prop="type" >
                    <el-input v-model="form.type"></el-input>
                </el-form-item>
                <el-form-item label="资产价值" prop="assetValue">
                    <el-input v-model.number="form.assetValue">
                        <template #prepend>￥</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="资产状态" prop="state">
                    <template #default="scope">
                        <el-select v-model="form.state" :placeholder="form.state">
                            <el-option
                                v-for="item in assetStates"
                                :value="item.assetState">
                                {{item.assetState}}
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
import {reactive, ref} from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import service from "../utils/request";

export default {
    name: "asset-table",
    data() {
        return {
            //状态值
            assetStates: [
                {assetState: '状态1', type: 'success'},
                {assetState: '状态2', type: 'info'},
                {assetState: '状态3', type: 'warning'},
                {assetState: '状态4', type: 'danger'},
                {assetState: '状态5', type: ''},
            ],
            /**
             * 搜索选项，选择后value值会绑定到searchOption中
             * value值为数据库字段值,有空字段是为了全部查询用
             */
            searchOptions : [
                { value:"asset_id", label : "资产编号"},
                { value:"asset_value", label : "资产价值"},
                { value:"state", label : "状态"},
            ],
            //用户选择的搜索项目
            searchOption : "",
            //用户搜索输入框内容
            searchContent : "",
            //用户点击的表格行索引
            clickedIndex : -1,
            // 标明为插入操作
            isInsert : false,
            // 标明为更新操作
            isUpdate : false,
            // 表单是否可见
            editVisible : false,
            isProjectStateSelected : false,
            //表单数据
            form : {
                id:"",
                assetId:"",
                type:"",
                assetValue:"",
                state:"",
            },
            formRules : {
                assetId: [
                    { required: true, message: '资产编号不能为空', trigger: 'blur' },
                    { type: 'number', message: '资产编号只能为数字', trigger: 'change' },
                ],
                type: [
                    { required: true, message: '资产类型不能为空', trigger: 'blur' },
                ],
                assetValue: [
                    { required: true, message: '资产价值不能为空', trigger: 'blur' },
                    { type: 'number', message: '请输入数字', trigger: 'change' },
                ],
                state: [
                    { required: true, message: '请选择资产状态', trigger: 'blur' },
                ],
                startDate:[
                    { required:true, message:'请选择开始日期',trigger: 'blur'}
                ],
                deadLine:[
                    { required:true, message:'请选择结束日期',trigger: 'blur'}
                ],
            },
        }
    },
    setup(){
        /**
         * 数据区
         */
            // 查询时的数据
        const query = reactive({
                fieldName:"",
                fieldValue:"",
                pageIndex: 1,
                pageSize: 5,
            });
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
                url: "/asset/query",
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
    methods:{
        //搜索操作
        handleSearch(){
            let query = this.query
            query.fieldName = this.searchOption
            query.fieldValue = this.searchContent
            service({
                method : "post",
                url : "/asset/query",
                data : query
            }).then((response) => {
                if (response.code === 200) {
                    const data = response.data;
                    this.tableData = data.list
                    this.pageTotal = data.total
                }
            }).catch((error) =>{
                ElMessage.error("查询失败:"+error)
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
            const form = JSON.parse(JSON.stringify(this.form));
            ElMessageBox.confirm("确定要删除吗？", "提示", {
                type: "warning",
            }).then(() => {
                service({
                    method : "post",
                    url : "/asset/delete",
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
                        url:"/asset/update",
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
            this.form = {}
            this.isInsert = true
            this.editVisible = true
        },
        // 保存新增数据到后端
        saveInsert(formName){
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    this.isInsert = false
                    this.editVisible = false
                    service({
                        method: "post",
                        url: "/asset/insert",
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
