<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i>资源管理
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
                    no-data-text="请选择">
                    <el-option
                        v-for="item in searchOptions"
                        :value="item.value"
                        :label="item.label">
                    </el-option>
                </el-select>
                <el-input  v-model="searchContent" placeholder="输入搜索内容" class="handle-input mr10" @keyup.enter="handleSearch"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch" >搜索</el-button>
                <el-button type="primary" icon="el-icon-plus" @click="handleInsert">新增</el-button>
            </div>
            <!--表格区-->
            <el-table :data="tableData"
                      class="table"
                      ref="multipleTable"
                      header-cell-class-name="table-header"
                      border highlight-current-row
                      @selection-change="handleTableSelectionChange"
            >
                <el-table-column prop="resourceId" label="资源编号"  sortable></el-table-column>
                <el-table-column prop="type" label="类型"  sortable></el-table-column>
                <el-table-column prop="resourceValue" label="价值" sortable></el-table-column>
                <el-table-column label="状态" >
                    <template #default="scope">
                        <el-tag :type="resourceStates.find(item => item.resourceState === scope.row.state).type">
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
        <el-dialog title="资源信息" v-model="editVisible" width="30%"
                   @closed="handleDialogClosed">
            <el-form label-width="70px">
                <el-form-item label="资源编号">
                    <el-input v-model="form.resourceId"></el-input>
                </el-form-item>
                <el-form-item label="类型">
                    <el-input v-model="form.type"></el-input>
                </el-form-item>
                <el-form-item label="价值">
                    <el-input v-model="form.resourceValue">
                        <template #prepend>￥</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="状态">
                    <template #default="scope">
                        <el-select v-model="form.state" :placeholder="form.state">
                            <el-option
                                v-for="item in resourceStates"
                                :value="item.resourceState">
                                {{item.resourceState}}
                            </el-option>
                        </el-select>
                    </template>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="editVisible = false">取 消</el-button>
                    <el-button v-if="isUpdate" type="primary"  @click="saveUpdate">确 定</el-button>
                    <el-button v-if="isInsert" type="primary"  @click="saveInsert">确 定</el-button>
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
    name: "resource",
    data() {
        return {
            //状态值
            resourceStates: [
                {resourceState: '状态1', type: 'success'},
                {resourceState: '状态2', type: 'info'},
                {resourceState: '状态3', type: 'warning'},
                {resourceState: '状态4', type: 'danger'},
                {resourceState: '状态5', type: ''},
            ],
            /**
             * 搜索选项，选择后value值会绑定到searchOption中
             * value值为数据库字段值,有空字段是为了全部查询用
             */
            searchOptions : [
                { value:"resource_id", label : "资源编号"},
                { value:"resource_value", label : "价值"},
            ],
            //用户选择的搜索项目
            searchOption:"",
            //用户搜索输入框内容
            searchContent:"",
            //表单数据
            form:{
                id:"",
                resourceId:"",
                resourceValue:"",
                type:"",
                state:"",
            },
            //用户点击的表格行索引
            idx : -1,
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
        /**
         * 方法区
         */
            // 从后端获取表格数据
        const getData = () => {
                service({
                    method : "post",
                    url: "/resource/query",
                    data : query
                }).then((response) => {
                    if (response.code === 200) {
                        var data = response.data
                        tableData.value = data.list
                        pageTotal.value = data.total
                    }
                }).catch((error) => {
                    ElMessage.error("加载数据失败：" + error)
                })
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
        /**
         * 执行区，初始化时执行的方法
         */
        getData()
        return {
            query,
            tableData,
            pageTotal,
            getData,
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
                url : "/resource/query",
                data : query
            }).then((response) => {
                if (response.code === 200) {
                    var data = response.data
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
            let form = this.form
            ElMessageBox.confirm("确定要删除吗？", "提示", {
                type: "warning",
            }).then(() => {
                //填充表单数据
                form = this.tableData[index];
                service({
                    method : "post",
                    url : "/resource/delete",
                    data : form
                }).then((response) => {
                    if (response.code === 200) {
                        ElMessage.success("删除成功");
                        //此处处理表格变化
                        this.tableData.splice(index,1)
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
        handleUpdate(index, row){
            this.idx = index;
            this.form = this.tableData[index];
            this.isUpdate = true
            this.editVisible = true
        },
        //保存更改到后端
        saveUpdate(){
            //必须先保存用户点击的索引
            const idx = this.idx
            const form = this.form
            this.isUpdate = false
            this.editVisible = false
            service({
                method : "post",
                url:"/resource/update",
                data : form,
            }).then((response) => {
                if (response.code === 200) {
                    //刷新表格
                    this.tableData[idx] = response.data.list;
                    ElMessage.success(`编辑成功`);
                } else {
                    ElMessage.error(`编辑失败：` + response.message);
                }
            }).catch((error) => {
                ElMessage.error(`编辑失败：` + error);
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
        saveInsert() {
            let form = this.form
            this.isInsert = false
            this.editVisible = false
            service({
                method : "post",
                url : "/resource/insert",
                data : form
            }).then((response) => {
                if (response.code === 200) {
                    ElMessage.success(`插入成功`);
                    this.getData()
                }else {
                    ElMessage.error(`插入失败：` + response.message);
                }
            }).catch(error => {
                ElMessage.error(`插入失败：` + error);
            })
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
</style>
