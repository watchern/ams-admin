<template>
  <div class="admin_right_main">
    <el-form ref="form"
             label-width="130px"
             label-position="top"
             :model="form"
             :inline="false">
      <div class="mb10">
        <el-row>
          <el-col :span="11">
            <el-form-item label="申请名称：">
              <el-input type="text"
                        v-model="form.applyName"
                        style="width: 100%;"
                        :rows="4"
                        disabled>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11"
                  :offset="2">
            <el-form-item label="申请人：">
              <el-input style="width: 100%;"
                        type="text"
                        placeholder="默认为当前登录人"
                        v-model="form.applyPerson"
                        :rows="4"
                        disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="11">
            <el-form-item label="操作类型：">
              <el-select v-model="form.operationType"
                         id="operationType"
                         name="operationType"
                         style="width: 100%;"
                         disabled>
                <el-option v-for="operationType in this.operationTypes"
                           :value="operationType.value"
                           :key="operationType.value"
                           :label="operationType.label"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="11"
                  :offset="2">
            <el-form-item v-if="form.operationType === '0'"
                          label="装载类型：">
              <el-input style="width: 100%;"
                        type="text"
                        v-model="form.loadType"
                        :rows="4"
                        disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>

      </div>
      <el-table v-if="form.operationType === '0'"
                :data="tableData"
                height="316px"
                border
                style="width: 100%">
        <el-table-column prop="fileName"
                         min-width="100px"
                         label="文件名"
                         show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="displayTableName"
                         min-width="100px"
                         label="表名称"
                         show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="fileType"
                         min-width="100px"
                         label="文件类型"
                         align="center"
                         show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="lineSeparator"
                         min-width="100px"
                         label="行分隔符"
                         align="center"
                         show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="columnSeparator"
                         label="列分隔符"
                         min-width="100px"
                         align="center"
                         show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="isHeaderLine"
                         label="首行是否为标题行"
                         align="center"
                         min-width="80px">
          <template slot-scope="scope">
            <el-checkbox v-model="scope.row.isHeaderLine"
                         :disabled="true"
                         true-label="true"
                         false-label="false">
            </el-checkbox>
          </template>
        </el-table-column>

      </el-table>
      <el-row v-if="form.operationType === '1'">
        <el-col :span="24">
          <el-table key="colMetaUuid"
                    border
                    fit
                    :data="tableDataOffline"
                    height="316px"
                    highlight-current-row
                    style="width: 100%;">
            <el-table-column label="序号"
                             width="60px"
                             align="center"
                             type="index" />
            <el-table-column label="表路径"
                             prop="tablePath"
                             min-width="150px"
                             show-overflow-tooltip>
            </el-table-column>
            <el-table-column label="归档方式"
                             min-width="200px"
                             align="center"
                             prop="archiveType"
                             show-overflow-tooltip>
              <template slot-scope="scope">
                <el-select v-model="scope.row.archiveType"
                           disabled>
                  <el-option v-for="(item, index) in options"
                             :label="item.label"
                             :value="item.value"
                             :key="index">
                  </el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="归档文件/表名称"
                             align="center"
                             min-width="200px"
                             prop="archiveFileTableName"
                             show-overflow-tooltip>
              <template slot-scope="scope">
                <el-input v-model="scope.row.archiveFileTableName"
                          id="filingFile"
                          disabled></el-input>
              </template>
            </el-table-column>
            <el-table-column label="下载文件"
                             align="center"
                             min-width="200px"
                             v-if="form.status === '办理完成'"
                             show-overflow-tooltip>
              <template slot-scope="scope">
                <el-button type="primary"
                           size="mini"
                           title="下载"
                           @click="downLoadFile(scope.row.filePath)">下载
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </el-form>
    <el-dialog v-if="dialogFileVisible"
               :close-on-click-modal="false"
               :visible.sync="dialogFileVisible"
               append-to-body
               title="文件内容"
               width="60%"
               heigth="60%">
      <el-input v-model="this.fileString"
                :rows="20"
                type="textarea"
                disabled="disabled"></el-input>
      <el-button @click="dialogFileVisible = false">关闭</el-button>
    </el-dialog>
  </div>

</template>

<script>
import {
  getById,//详情
  batchUpdateForFinishHandle,
  showFile, //文件查看
  download,//文件下载
} from "@/api/data/loadApply";
import axios from "axios";
import qs from "qs";

export default {
  props: {
    detailsUuid: '',
  },
  data () {
    return {
      tableData: [],
      tableDataOffline: [],
      fileString: '',
      form: {
        applyName: '',// 申请名称
        applyPerson: '',// 申请人
        applyPersonUuid: '',//申请人主键
        operationType: '0',//操作类型
        loadType: '',//装载类型
        currentLink: '',//当前环节
        status: '',//状态
        applyTime: '',//申请时间
        applyUuid: '',//单表主键
        startTime: '',//开始时间
        endTime: '',//结束时间
        lineSeparator: '',//行分隔符
        columnSeparator: '',//列分隔符
        isHeaderLine: '',//首行为标题行
        fileName: '',//文件名称
        filePath: '',//文件路径
        fileUuid: '',//文件编码
        filingMove: '',//归档方式
        filingFile: '',//归档文件
        fileType: '',
        displayTableName: '',//表名称
      },
      operationTypes: [
        {
          value: '0',
          label: '数据装载-一次性装载'
        },
        {
          value: '1',
          label: '数据下线'
        }
      ],
      options: [
        {
          value: '0',
          label: '归档到文件'
        }
      ],
      dialogFileVisible: false,
    }
  },
  mounted: function () {
    if (this.detailsUuid !== undefined) {
      this.queryByUuid(this.detailsUuid)
    }
    this.$emit("fromSon")
  },
  methods: {
    showFile (val) {
      showFile(val)
        .then((res) => {
          this.fileString = res.data
        })
      this.dialogFileVisible = true;
    },
    queryByUuid (value) {
      getById(value)
        .then((res) => {
          this.form = res.data
          if (this.form.operationType == 0) {
            this.tableData = res.data.fileList
          } else if (this.form.operationType == 1) {
            this.tableDataOffline = res.data.fileList
          }
        })
    },
    updateApplyStatus (value) {
      let loadDownApply = {
        applyUuid: value
      }
      let relParam = []
      relParam.push(loadDownApply)
      batchUpdateForFinishHandle(relParam)
    },
    //下载文件
    downLoadFile (value) {
      axios
        .post(
          `/data/loadDownApply/download`,
          qs.stringify({ filePath: value }),
          {
            responseType: "blob",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded", // 请求的数据类型为form data格式
            },
          }
        )
        .then((res) => {
          const filename = decodeURI(
            res.headers["content-disposition"].split(";")[1].split("=")[1]
          );
          const blob = new Blob([res.data], {
            type: "application/octet-stream",
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.style.display = "none";
          link.href = url;
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
        });
    },
  }
}
</script>

<style scoped>
.admin_right_main >>> .el-form-item {
  margin-bottom: 0 !important;
}
.admin_right_main >>> .el-textarea .el-textarea__inner {
  resize: none;
}
</style>
