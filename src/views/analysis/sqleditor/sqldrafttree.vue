<template>
    <div class="app-container">
        <el-input v-model="filterText" placeholder="输入关键字进行过滤" class="tree-search" />
        <MyElTree
        ref="tree"
        :data="data"
        :props="defaultProps"
        :filter-node-method="filterNode"
        :expand-on-click-node="false"
        node-key="id"
        check-strictly
        @node-click="handleNodeClick"
>
      <span slot-scope="{ node, data }" class="custom-tree-node">
        <span> <i :class="data.icon" />{{ node.label }} </span>
<!--          管理员可以操作公共和个人的文件夹，非管理员可以操作个人文件夹-->
        <span v-if="data.type == 'folder' && (isManager == true || isManager == false && data.sceneInstUuid == dataUserId)">
          <el-button
                  title="添加SQL草稿文件夹"
                  type="text"
                  size="mini"
                  class="tree-line-btn"
                  @click.stop="() => setSelectTreeNode(node, data, 1)"
          >
            <svg-icon icon-class="icon-add-1" />
          </el-button>
          <el-button
                  title="修改SQL草稿文件夹"
                  type="text"
                  size="mini"
                  class="tree-line-btn"
                  @click.stop="() => setSelectTreeNode(node, data, 2)"
                  v-if="data.pid != 'root'"
          >
            <svg-icon icon-class="icon-edit-1" />
          </el-button>
          <el-button
                  title="删除SQL草稿文件夹"
                  type="text"
                  size="mini"
                  class="tree-line-btn"
                  @click.stop="() => deleteFolder(node, data)"
                  v-if="data.pid != 'root'"
          >
            <svg-icon icon-class="icon-delete-1" />
          </el-button>
        </span>
      </span>
</MyElTree>
        <el-dialog
                append-to-body
                v-if="dialogFormVisible"
                title="请填写文件夹信息"
                :visible.sync="dialogFormVisible"
                :close-on-click-modal="false"
        >
            <el-form :model="form" class="detail-form">
                <el-form-item label="文件夹名称">
                    <el-input v-model="form.folderName" autocomplete="off" />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="enterBtn">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import MyElTree from '@/components/public/tree/src/tree.vue';
import {getDraftTree} from "@/api/analysis/sqleditor/sqleditor";
import {addDraftFolder, getDraftFolderById, updateDraftFolder, removeDraftFolder} from "@/api/analysis/sqleditor/sqldraftfolder";
import {isAdmin} from "@/api/user";
export default {
    name: 'SqlDraftTree',
    components: { MyElTree },
    props: ["isShowDraft", "openType"],
    data() {
        return {
            defaultProps: {
                children: "children",
                label: "label",
            },
            selectTreeNode: {},
            filterText: "",
            data: [],
            // 是否为管理员身份
            isManager: false,
            dataUserId: "",
            // 操作类型 1、添加；2、修改
            operationType: 0,
            // 弹窗状态
            dialogFormVisible: false,
            form:{
                sqlDraftFolderUuid: "",
                folderName: "",
                parentUuid: "",
                sceneInstUuid: "",
                path: "",
            }
        }
    },
    computed: {},
    created() {
        this.dataUserId = this.$store.getters.datauserid;
        // 校验用户权限
        isAdmin().then((res) => {
            // 是管理员
            if (res.data) {
                this.isManager = true
            } else {
                // 不是管理员
                this.isManager = false
            }
        })
        this.getTree();
    },
    watch: {
        filterText(val) {
            // 搜索树
            this.$refs.tree.filter(val);
        },
    },
    methods: {
        deleteFolder(node, data){
            console.log(data);
            //删除草稿文件夹时判断下面有没有子节点，有子节点不可以删除
            if(data.children!=null && data.children.length == 0){
                this.$confirm('此操作将永久删除, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    removeDraftFolder(data.id).then(res => {
                        if (res != null && res.code === 0) {
                            this.$message({type: "info", message: "删除SQL草稿文件夹成功"})
                            this.refreshTree();
                        } else {
                            this.$message({type: "error", message: res.msg})
                        }
                    })
                });
            }else{
                this.$message({type: "info", message: "当前文件夹下存在子节点,请先删除子节点"})
            }
            
        },
    /**
     * 生成UUID
     * @returns {string} 返回生成的UUID
     */
    getGuuid() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";
        var uuid = s.join("");
        return uuid;
    },
        /**
         * 修改文件夹
         */
        updateFolder() {
            var pNode = this.selectTreeNode;
            // 再次校验非管理员不能操作公共文件夹
            if(!this.isManager && pNode.sceneInstUuid == null){
                this.$message({type:"info",message:"非管理员不能操作公共文件夹!"});
                return;
            }
            getDraftFolderById(pNode.id).then(res =>{
                var draftFolder =  res.data;
                draftFolder.folderName = this.form.folderName;
                updateDraftFolder(draftFolder).then(resp =>{
                    if (resp != null && resp.code === 0) {
                        this.form.folderName = null
                        this.$message({type:"info",message:"修改SQL草稿文件夹成功！"})
                        this.dialogFormVisible = false;
                        this.refreshTree();
                    } else {
                        this.$message({type:"error",message:resp.msg})
                    }
                })
            })

        },
        /**
         * 添加文件夹
         */
        addFolder() {
            var pNode = this.selectTreeNode;
            // 再次校验非管理员不能操作公共文件夹
            if(!this.isManager && pNode.sceneInstUuid == null){
                this.$message({type:"info",message:"非管理员不能操作公共文件夹!"});
                return;
            }
            this.form.sqlDraftFolderUuid = this.getGuuid();
            this.form.parentUuid = pNode.id;
            var rootPath = pNode.path.split("/")[0];
            this.form.sceneInstUuid = rootPath == '0' ? null : this.dataUserId;
            this.form.path = pNode.path + "/" + this.form.sqlDraftFolderUuid;

            addDraftFolder(this.form).then((result) => {
                if (result != null && result.code === 0) {
                    const newChild = {
                        id: this.form.sqlDraftFolderUuid,
                        label: this.form.folderName,
                        children: [],
                        pid: this.selectTreeNode.id,
                        icon: "el-icon-folder",
                        type: "folder",
                        path:  this.form.path,
                    };
                    if (!this.selectTreeNode.children) {
                        this.$set(this.selectTreeNode, "children", []);
                    }
                    this.selectTreeNode.children.push(newChild);
                    this.form.folderName = null
                    this.$message({type:"info",message:"新增SQL草稿文件夹成功！"})
                    this.dialogFormVisible = false;
                } else {
                    this.$message({type:"error",message:result.msg})
                }
            });
        },
        /**
         * 表单确定按钮
         */
        enterBtn() {
            if (this.operationType === 1) {
                this.addFolder();
            } else {
                this.updateFolder();
            }
        },
        /**
         * 树过滤
         * @param value 过滤值
         * @param data 数据
         * @returns {boolean}
         */
        filterNode(value, data) {
            if (!value) return true;
            return data.label.indexOf(value) !== -1;
        },
        /**
         * 树的点击事件
         * @param data 树的对象数据 包括子节点
         */
        handleNodeClick(data) {
            this.selectTreeNode = data;
            if(this.openType == "show"){
                this.$emit("refreshDraftList", data);
            }

        },
        /**
         *获取草稿树(true：文件夹+草稿，false：文件夹)
         */
        getTree(){
            getDraftTree(this.isShowDraft).then(res =>{
                this.data = res.data;
            })
        },
        /**
         * 设置选中的节点
         * @param node 整个节点数据
         * @param data 数据 要设置的节点数据
         * @param operationType 1、添加；2、修改
         */
        setSelectTreeNode(node, data, operationType) {
            this.form.folderName = "";
                this.operationType = operationType;
            this.selectTreeNode = data;
            if (operationType === 2) {
                this.form.folderName = this.selectTreeNode.label;
            }
            this.dialogFormVisible = true;
        },
        refreshTree(){
            this.getTree();
        }
    }
}
</script>