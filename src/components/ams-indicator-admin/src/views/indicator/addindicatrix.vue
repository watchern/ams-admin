<template>
    <el-container>
        <el-main>
            <el-form>
                <el-form-item label="指标名称">
                    <el-input id="inName" v-model="form.inName"></el-input>
                </el-form-item>
                <el-form-item label="来源表">
                    <el-input id="tableName" v-model="form.tableName" readonly="readonly"></el-input>
                </el-form-item>
                <el-form-item label="指标列">
                    <el-input id="colName" v-model="form.colName" readonly="readonly"></el-input>
                </el-form-item>
                <el-form-item label="聚合方式">
                    <el-select id="group" v-model="form.group" readonly="readonly">
                        <el-option value="sum" label="总计"></el-option>
                        <el-option value="count" label="计数"></el-option>
                        <el-option value="avg" label="平均值"></el-option>
                        <el-option value="max" label="最大值"></el-option>
                        <el-option value="min" label="最小值"></el-option>
                        <el-option value="distinct" label="差异计数"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="所属分类">
                    <el-select v-model="form.folderName" placeholder="请选择所属分类" style="width: 100%" ref="folderName">
                        <el-option :value="form.folderName" :label="form.folderName" style="width: 100%;height:200px;overflow: auto;background-color:#fff">
                            <publictree :setFolderIdAndName="setFolderIdAndName" :type="2"></publictree>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="指标说明">
                    <el-input type="textarea" id="inMemo" v-model="form.inMemo"></el-input>
                </el-form-item>
            </el-form>
        </el-main>
        <el-footer>
            <div style="float: right">
                <el-button type="primary" @click="saveIndicatrix">保存</el-button>
                <el-button type="primary" @click="closeDialog">取消</el-button>
            </div>
        </el-footer>
    </el-container>
</template>
<script>
import request from '@/utils/request'
import $ from 'jquery'
import { Loading } from 'element-ui'
export default {
  name: 'addIndicatrix',
  props: ['tableId','tableName','columnId','columnName','inUUID'],
  components: {
    publictree: resolve => require(["../../views/indicator/publictree.vue"], resolve)
  },
  data() {
    return {
        form: {
          inName: '',
          tableName: '',
          colName: '',
          folderName: '',
          group: '',
          inMemo: ''
        },
        /**
         * 编辑指标时存储指标的反显数据
         * @type {null}
         */
        editData:  null,

        /**
         * 点击树节点的节点编号
         * @type {string}
         */
        clickTreeId:  "",

        /**
         * 选择的分类路径
         * @type {string}
         */
        treePath:  "",
        /**
         * 验证按钮
         * @type {string}
         */
        verButton:  "",

        /**
         * 1代表全行 2代表机构 3代表审计师(个人)
         * @type {number}
         */
        auditorOrauditorgan:  0,

        /**
         * 作用域编号
         * @type {string}
         */
        pbScopeUuid:  ""
    }
  },
  mounted() {
      this.initData();
  },
  created() {

  },
  methods: {
          /**
     * 初始化数据
     */
    initData() {
        if (this.inUUID == null) {//判断该id是否为空 如果为空则是新增  反之编辑
            this.form.tableName = this.tableName
            this.form.colName = this.columnName
        }
        else {
            this.antiDisplayIndicatrixData(this.inUUID);
        }
    },

    /**
     * 保存指标
     */
    saveIndicatrix() {
        if (this.inUUID == null) {
            this.addIn();
        }
        else {
            this.editIn();
        }
    },


    /**
     * 根据指标编号反显指标数据  用于编辑指标
     * @param id 指标编号
     */
    antiDisplayIndicatrixData(id) {
        var that = this;
        var url = this.contextUrl + "/InMeasure/getInMeasure";
        $.post(url, {inMeasureUuid: id}, function (res) {
            that.editData = res;
            that.pbScopeUuid = that.editData.pbScopeUuid;
            that.treePath = that.editData.measurePath;
            that.form.inName = res.measureName
            that.form.tableName = res.tableName
            that.form.colName = res.columnName
            that.form.group = res.measureGroup
            that.form.folderName = res.folderName
            that.form.inMemo = res.measureMemo
        }, "json")
    },

    /**
     * 添加指标
     */
    addIn() {
        var that = this;
        if (this.form.inName === "" || this.form.inName === null || this.form.inName === undefined) {
            this.$message("请输入指标名称。");
            return;
        }
        if (this.form.inName.length > 50) {
            this.$message("指标名称不能大于50个字符！");
            return;
        }
        if (this.form.inMemo.length > 2000) {
            this.$message("指标描述不能大于2000个字符！");
            return;
        }
        if (this.form.group === "") {
          this.$message("请选择聚合方式！");
          return;
        }
        if (this.verButton === 1 || this.verButton === 2 || this.verButton === 3) {
            this.$message("根目录下不允许创建指标。");
            return;
        }
        if (this.clickTreeId === "" || this.clickTreeId == null || this.clickTreeId === undefined) {
            this.$message("请选择文件夹！");
            return;
        }
        var data = {
            inMeasureUuid: "",
            measureName: this.form.inName,
            measureType: 1,
            inFolderUuid: this.clickTreeId,
            measureMemo: this.form.inMemo,
            measureGroup: this.form.group,
            measureFormula: "",
            tableUuid: this.tableId,
            isDelete: 0,
            createTime: "",
            updateTime: "",
            createPersonUuid: "",
            createPersonName: "",
            measurePath: this.treePath,
            measureAlias: this.form.inName,
            belongOrg: '',
            belongType: this.auditorOrauditorgan,
            pbScopeUuid: this.pbScopeUuid
        };
        var relData = {
            inColumnrelationUuid: "",
            inMeasureUuid: "",
            columnUuid: this.columnId
        };
        var urlVerInName = this.contextUrl + "/InMeasure/verMeasureName";
        $.post(urlVerInName, {measureName: this.form.inName, pbScopeUuid: this.pbScopeUuid}, function (res) {
            if (res.state == false) {
                this.$message(res.message);
                return;
            }
            if (res.state == false) {
                this.$message(res.message);
                return;
            }
            var url = that.contextUrl + "/InMeasure/insertSelective";
            $.post(url, {inMeasure: JSON.stringify(data), inColumnRelation: JSON.stringify(relData)}, function (res) {
                if (res.state == true) {
                    that.$emit('getAllColumn',that.tableId)
                    that.$emit('addInTable',that.tableId)
                    that.$emit('getAllIndicatrix',that.tableId)
                    var info = "新增了原生指标:'{0}'，文件夹路径:'{1}'".format(that.form.inName,that.form.folderName);
                    that.addOperLogByParam(that.log_module,that.log_add,that.log_info);
                    that.closeDialog();
                }
                else {
                    that.$message(res.message);
                }
            }, "json");
        }, "json")
    },

    /**
     * 修改指标
     */
    editIn() {
        var that = this;
        if (this.form.inName == "" || this.form.inName == null || this.form.inName == undefined) {
            this.$message("请输入指标名称。");
            return;
        }
        if (this.form.inName.length > 50) {
            this.$message("指标名称不能大于50个字符！");
            return;
        }
        if (this.form.inMemo != undefined && this.form.inMemo.length > 2000) {
            this.$message("指标描述不能大于2000个字符！");
            return;
        }
        if (this.editData.measureName != this.form.inName) {
            var urlVer = this.contextUrl + "/InMeasure/verMeasureName";
            $.post(urlVer, {measureName: this.form.inName, pbScopeUuid: this.pbScopeUuid}, function (res) {
                if (res.state == true) {
                    that.update();
                }
                else {
                    that.$message(res.message);
                    return;
                }
            }, "json")
        }
        else {
            that.update();
        }
    },

    /**
     * 修改指标
     */
    update() {
        var that = this;
        this.editData.measureName = this.form.inName;
        this.editData.measureMemo = this.form.inMemo;
        this.editData.measureAlias = this.form.inName;
        this.editData.measureGroup = this.form.group;
        this.editData.measurePath = this.treePath;
      //因时间报错所以注销时间（时间格式为格林威治时间）
//        this.editData.createTime = new Date(this.editData.createTime);
//        this.editData.updateTime = new Date(this.editData.updateTime);
        if (this.clickTreeId != "") {
            this.editData.inFolderUuid = this.clickTreeId;
        }
        if (this.pbScopeUuid != "") {
            this.editData.pbScopeUuid = this.pbScopeUuid;
        }
        this.editData.belongType = this.auditorOrauditorgan;
        var url = this.contextUrl + "/InMeasure/updateByPrimaryKeySelective";
        $.post(url, {inMeasure: JSON.stringify(this.editData)}, function (res) {
            if (res.state == true) {
                that.$emit('getAllIndicatrix',that.tableId)
                that.$emit('getAllColumn',that.tableId)
                that.closeDialog();
            }
            else {
                that.$message(res.message);
            }
        }, "json")
    },

    /**
     * 关闭当前窗体
     */
    closeDialog() {
        this.$emit('closeAddIndicatrix')
    },


    /**
     * 设置文件夹的路径以及id和名称
     */
    setFolderIdAndName(treeId, treeName, path, pathName,pbScopeUuids) {
        this.form.folderName = pathName
        this.clickTreeId = treeId
        this.pbScopeUuid = pbScopeUuids
        this.treePath = path
    },
  }
}
</script>
