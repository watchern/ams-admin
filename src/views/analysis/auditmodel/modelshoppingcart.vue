<template>
  <div id="drag">
    <div class="title">
      <h2>已选择模型</h2>
      <div>
        <a
          style="display: none"
          class="min el-icon-minus"
          href="javascript:"
          title="最小化"
        ></a>
        <a
          style="display: none"
          class="max"
          href="javascript:"
          title="最大化"
        ></a>
        <a
          style="display: none"
          class="revert"
          href="javascript:"
          title="还原"
        ></a>
        <a class="close el-icon-close" href="javascript:" title="关闭"></a>
      </div>
    </div>
    <div class="resizeL"></div>
    <div class="resizeT"></div>
    <div class="resizeR"></div>
    <div class="resizeB"></div>
    <div class="resizeLT"></div>
    <div class="resizeTR"></div>
    <div class="resizeBR"></div>
    <div class="resizeLB"></div>
    <div class="content">
      <el-link class="label-tip" @click="selectData" type="primary">{{
        memoValue
      }}</el-link>
      <div class="btn-div">
        <el-button type="primary" @click="runImmediately" plain
          >立即运行</el-button
        >
        <el-button type="primary" plain @click="timingExecution"
          >定时执行</el-button
        >
      </div>
      <el-button class="select-btn" type="primary" plain @click="selectData"
        >查看已选模型</el-button
      >
    </div>
    <el-dialog
      title="当前已选模型"
      v-if="dialogFormVisible"
      :visible.sync="dialogFormVisible"
      :append-to-body="true"
    >
      <el-table
        ref="modelListTable"
        :data="currentData"
        border
        fit
        highlight-current-row
      >
        <el-table-column type="selection" width="55" />
        <el-table-column
          label="模型名称"
          width="100px"
          align="center"
          prop="modelName"
        />
        <el-table-column
          label="平均运行时间"
          width="150px"
          align="center"
          prop="runTime"
        />
        <el-table-column label="审计事项" prop="auditItemName" />
        <el-table-column
          label="风险等级"
          prop="riskLevelUuid"
          :formatter="riskLevelFormatter"
        />
        <el-table-column
          label="模型类型"
          prop="modelType"
          :formatter="modelTypeFormatter"
        />
        <el-table-column
          label="创建时间"
          width="180px"
          prop="createTime"
          :formatter="dateFormatter"
        />
      </el-table>
    </el-dialog>
    <el-dialog
      title="模型运行设置-立即"
      :visible.sync="runimmediatelyIsSee"
      width="60%"
      :append-to-body="true"
    >
      <runimmediatelycon
        @changeFlag="changeFlag"
        ref="modelsetting"
        :timing="false"
        v-if="runimmediatelyIsSee"
        :models="this.currentData"
      ></runimmediatelycon>
      <span slot="footer" class="dialog-footer">
        <el-button @click="runimmediatelyIsSee = false">取 消</el-button>
        <el-button type="primary" @click="modelRunSetting">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="模型运行设置-定时"
      :visible.sync="timingExecutionIsSee"
      width="60%"
      :append-to-body="true"
    >
      <runimmediatelycon
        ref="modelsetting"
        :timing="true"
        v-if="timingExecutionIsSee"
        :models="this.currentData"
      ></runimmediatelycon>
      <span slot="footer" class="dialog-footer">
        <el-button @click="timingExecutionIsSee = false">取 消</el-button>
        <el-button type="primary" @click="modelRunSetting">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getOneDict } from "@/utils";
import runimmediatelycon from "@/views/analysis/auditmodel/runimmediatelycon";
import { uuid2, addRunTaskAndRunTaskRel } from "@/api/analysis/auditmodel";
export default {
  components: {
    runimmediatelycon,
  },
  data() {
    return {
      dragMinWidth: 250,
      dragMinHeight: 124,
      memoValue: "",
      currentData: [],
      dialogFormVisible: false,
      list: [],
      runimmediatelyIsSee: false,
      addRunTaskRelBatchResult: null,
      addRunTaskResult: null,
      models: [],
      replacedInfo: [],
      timingExecutionIsSee: false,
      flag: "",
    };
  },
  mounted() {
    this.initEvent();
  },
  watch: {
    flag(value) {
      this.$nextTick(function () {
        if (value == true) {
          this.modelRunSetting()
          this.flag = ''
        }
      });
    },
  },
  methods: {
    initEvent() {
      var oDrag = document.getElementById("drag");
      var oTitle = this.byClass("title", oDrag)[0];
      var oL = this.byClass("resizeL", oDrag)[0];
      var oT = this.byClass("resizeT", oDrag)[0];
      var oR = this.byClass("resizeR", oDrag)[0];
      var oB = this.byClass("resizeB", oDrag)[0];
      var oLT = this.byClass("resizeLT", oDrag)[0];
      var oTR = this.byClass("resizeTR", oDrag)[0];
      var oBR = this.byClass("resizeBR", oDrag)[0];
      var oLB = this.byClass("resizeLB", oDrag)[0];
      this.drag(oDrag, oTitle);
      //四角
      this.resize(oDrag, oLT, true, true, false, false);
      this.resize(oDrag, oTR, false, true, false, false);
      this.resize(oDrag, oBR, false, false, false, false);
      this.resize(oDrag, oLB, true, false, false, false);
      //四边
      this.resize(oDrag, oL, true, false, false, true);
      this.resize(oDrag, oT, false, true, true, false);
      this.resize(oDrag, oR, false, false, false, true);
      this.resize(oDrag, oB, false, false, true, false);
      oDrag.style.left =
        (document.documentElement.clientWidth - oDrag.offsetWidth) / 2 + "px";
      oDrag.style.top =
        (document.documentElement.clientHeight - oDrag.offsetHeight) / 2 + "px";
    },
    drag(oDrag, handle) {
      var disY = 0;
      var disX = 0;
      var oMin = this.byClass("min", oDrag)[0];
      var oMax = this.byClass("max", oDrag)[0];
      var oRevert = this.byClass("revert", oDrag)[0];
      var oClose = this.byClass("close", oDrag)[0];
      handle = handle || oDrag;
      handle.style.cursor = "move";
      handle.onmousedown = function (event) {
        var event = event || window.event;
        disX = event.clientX - oDrag.offsetLeft;
        disY = event.clientY - oDrag.offsetTop;
        document.onmousemove = function (event) {
          var event = event || window.event;
          var iL = event.clientX - disX;
          var iT = event.clientY - disY;
          var maxL = document.documentElement.clientWidth - oDrag.offsetWidth;
          var maxT = document.documentElement.clientHeight - oDrag.offsetHeight;
          iL <= 0 && (iL = 0);
          iT <= 0 && (iT = 0);
          iL >= maxL && (iL = maxL);
          iT >= maxT && (iT = maxT);
          oDrag.style.left = iL + "px";
          oDrag.style.top = iT + "px";
          return false;
        };
        document.onmouseup = function () {
          document.onmousemove = null;
          document.onmouseup = null;
          this.releaseCapture && this.releaseCapture();
        };
        this.setCapture && this.setCapture();
        return false;
      };
      //最大化按钮
      oMax.onclick = function () {
        oDrag.style.top = oDrag.style.left = 0;
        oDrag.style.width = document.documentElement.clientWidth - 2 + "px";
        oDrag.style.height = document.documentElement.clientHeight - 2 + "px";
        this.style.display = "none";
        oRevert.style.display = "block";
      };
      //还原按钮
      oRevert.onclick = function () {
        oDrag.style.width = this.dragMinWidth + "px";
        oDrag.style.height = this.dragMinHeight + "px";
        oDrag.style.left =
          (document.documentElement.clientWidth - oDrag.offsetWidth) / 2 + "px";
        oDrag.style.top =
          (document.documentElement.clientHeight - oDrag.offsetHeight) / 2 +
          "px";
        this.style.display = "none";
        oMax.style.display = "block";
      };
      //最小化按钮
      oMin.onclick = oClose.onclick = function () {
        oDrag.style.display = "none";
        var oA = document.createElement("a");
        oA.className = "open";
        oA.href = "javascript:;";
        oA.title = "还原";
        document.body.appendChild(oA);
        oA.onclick = function () {
          oDrag.style.display = "block";
          document.body.removeChild(this);
          this.onclick = null;
        };
      };
      //阻止冒泡
      oMin.onmousedown = oMax.onmousedown = oClose.onmousedown = function (
        event
      ) {
        this.onfocus = function () {
          this.blur();
        };
        (event || window.event).cancelBubble = true;
      };
    },
    resize(oParent, handle, isLeft, isTop, lockX, lockY) {
      handle.onmousedown = function (event) {
        var event = event || window.event;
        var disX = event.clientX - handle.offsetLeft;
        var disY = event.clientY - handle.offsetTop;
        var iParentTop = oParent.offsetTop;
        var iParentLeft = oParent.offsetLeft;
        var iParentWidth = oParent.offsetWidth;
        var iParentHeight = oParent.offsetHeight;
        document.onmousemove = function (event) {
          var event = event || window.event;
          var iL = event.clientX - disX;
          var iT = event.clientY - disY;
          var maxW =
            document.documentElement.clientWidth - oParent.offsetLeft - 2;
          var maxH =
            document.documentElement.clientHeight - oParent.offsetTop - 2;
          var iW = isLeft ? iParentWidth - iL : handle.offsetWidth + iL;
          var iH = isTop ? iParentHeight - iT : handle.offsetHeight + iT;
          isLeft && (oParent.style.left = iParentLeft + iL + "px");
          isTop && (oParent.style.top = iParentTop + iT + "px");
          iW < this.dragMinWidth && (iW = this.dragMinWidth);
          iW > maxW && (iW = maxW);
          lockX || (oParent.style.width = iW + "px");
          iH < this.dragMinHeight && (iH = this.dragMinHeight);
          iH > maxH && (iH = maxH);
          lockY || (oParent.style.height = iH + "px");
          if (
            (isLeft && iW == this.dragMinWidth) ||
            (isTop && iH == this.dragMinHeight)
          )
            document.onmousemove = null;
          return false;
        };
        document.onmouseup = function () {
          document.onmousemove = null;
          document.onmouseup = null;
        };
        return false;
      };
    },
    setMemo(obj) {
      this.memoValue = obj.length + "个";
      this.currentData = obj;
    },
    selectData() {
      this.dialogFormVisible = true;
    },
    /**
     * 格式化时间字符串
     * @param row 格式化行
     * @param column 格式化列
     * @returns {返回格式化后的时间字符串}
     */
    dateFormatter(row, column) {
      const datetime = row.createTime;
      if (datetime) {
        var dateMat = new Date(datetime);
        var year = dateMat.getFullYear();
        var month = dateMat.getMonth() + 1;
        var day = dateMat.getDate();
        var hh = dateMat.getHours();
        var mm = dateMat.getMinutes();
        var ss = dateMat.getSeconds();
        var timeFormat =
          year + "-" + month + "-" + day + " " + hh + ":" + mm + ":" + ss;
        return timeFormat;
      }
      return "";
    },
    /**
     * 格式化模型类型
     * @param row 格式化行
     * @param column 格式化列
     * @returns {返回格式化后的字符串}
     */
    modelTypeFormatter(row, column) {
      const modelType = row.modelType;
      let dicObj = getOneDict(modelType);
      let value = "";
      if (dicObj.length == 0) {
        return "";
      }
      value = dicObj[0].codeName;
      return value;
    },
    /**
     * 格式化风险等级
     * @param row 格式化行
     * @param column 格式化列
     * @returns {返回格式化后的字符串}
     */
    riskLevelFormatter(row, column) {
      let riskLevel = row.riskLevelUuid;
      let value = "";
      let dicObj = getOneDict(riskLevel);
      if (dicObj.length == 0) {
        return "";
      }
      value = dicObj[0].codeName;
      return value;
    },
    byId: function (id) {
      return typeof id === "string" ? document.getElementById(id) : id;
    },
    byClass: function (sClass, oParent) {
      var aClass = [];
      var reClass = new RegExp("(^| )" + sClass + "( |$)");
      var aElem = this.byTagName("*", oParent);
      for (var i = 0; i < aElem.length; i++)
        reClass.test(aElem[i].className) && aClass.push(aElem[i]);
      return aClass;
    },
    byTagName: function (elem, obj) {
      return (obj || document).getElementsByTagName(elem);
    },
    runImmediately() {
      this.runimmediatelyIsSee = true;
    },
    timingExecution() {
      this.timingExecutionIsSee = true;
    },
    /**
     * 添加运行任务和运行任务关联表
     */
    modelRunSetting() {
      var results = this.$refs.modelsetting.replaceParams();
      this.models = results.models;
      this.replacedInfo = results.replaceInfo;
      var dateTime = results.dateTime;
      var time1 = Date.parse(dateTime.toString());
      var time2 = Date.parse(new Date().toString());
      var differTime = (time1 - time2) / (1000 * 60);
      // if (differTime < 5) {
      //   this.$message({
      //     type: "info",
      //     message: "定时运行时间距当前时间要大于5分钟",
      //   });
      // } else {
        var runTaskUuid = uuid2();
        var batchUuid = uuid2();
        var runTaskRels = [];
        for (var i = 0; i < this.models.length; i++) {
          var runTaskRelUuid = uuid2();
          var settingInfo = {
            sql: this.replacedInfo[i].sql,
            paramsArr: this.replacedInfo[i].paramsArr,
          };
          var runTaskRel = {
            runTaskRelUuid: runTaskRelUuid,
            runTaskUuid: runTaskUuid,
            sourceUuid: this.models[i].modelUuid,
            settingInfo: JSON.stringify(settingInfo),
            modelVersion: this.models[i].modelVersion,
            runRecourceType: 1,
            isDeleted: 0,
            runStatus: 1,
          };
          runTaskRels.push(runTaskRel);
        }
        let runType = 3;
        if (this.timingExecutionIsSee) {
          runType = 2;
        }
        if (this.runimmediatelyIsSee) {
          runType = 3;
        }
        var runTask = {
          runTaskUuid: runTaskUuid,
          batchUuid: batchUuid,
          runTaskName: "系统添加",
          runType: runType,
          timingExecute: dateTime,
          runTaskRels: runTaskRels,
        };
        addRunTaskAndRunTaskRel(runTask).then((resp) => {
          if (resp.data == true) {
            this.$notify({
              title: "提示",
              message: "已经将模型添加到后台自动执行，请去'模型结果'查看",
              type: "success",
              duration: 2000,
              position: "bottom-right",
            });
          } else {
            this.$message({ type: "info", message: "执行运行任务失败" });
          }
        });
      // }
      this.runimmediatelyIsSee = false;
      this.timingExecutionIsSee = false;
    },
    changeFlag(flag){
        this.flag = flag
    }
  },
};
</script>
<style type="text/css" scoped>
body,
div,
h2 {
  margin: 0;
  padding: 0;
}

body {
  font: 12px/1.5 \5fae\8f6f\96c5\9ed1;
  color: #333;
}

#drag {
  position: absolute;
  z-index: 1000;
  top: 100px;
  left: 400px;
  width: 300px;
  height: 200px;
  background: #ffffff;
  border-radius: 5px;
  box-shadow: 0px 3px 8px 7px #d4d4d4;
}

#drag .title {
  position: relative;
  height: 27px;
  margin: 5px;
}

#drag .title h2 {
  font-size: 14px;
  height: 27px;
  line-height: 24px;
  border-bottom: 1px solid #a1b4b0;
}

#drag .title div {
  position: absolute;
  height: 19px;
  top: 2px;
  right: 0;
}

#drag .title a,
a.open {
  float: left;
  width: 21px;
  height: 19px;
  display: block;
  margin-left: 5px;
}

a.open {
  position: absolute;
  top: 10px;
  left: 50%;
  margin-left: -10px;
  background-position: 0 0;
}

a.open:hover {
  background-position: 0 -29px;
}

#drag .title a.min {
  background-position: -29px 0;
}

#drag .title a.min:hover {
  background-position: -29px -29px;
}

#drag .title a.max {
  background-position: -60px 0;
}

#drag .title a.max:hover {
  background-position: -60px -29px;
}

#drag .title a.revert {
  background-position: -149px 0;
  display: none;
}

#drag .title a.revert:hover {
  background-position: -149px -29px;
}

#drag .title a.close {
  background-position: -89px 0;
}

#drag .title a.close:hover {
  background-position: -89px -29px;
}

#drag .content {
  overflow: auto;
  margin: 0 5px;
}

#drag .resizeBR {
  position: absolute;
  width: 14px;
  height: 14px;
  right: 0;
  bottom: 0;
  overflow: hidden;
  cursor: nw-resize;
}

#drag .resizeL,
#drag .resizeT,
#drag .resizeR,
#drag .resizeB,
#drag .resizeLT,
#drag .resizeTR,
#drag .resizeLB {
  position: absolute;
  background: #000;
  overflow: hidden;
  opacity: 0;
  filter: alpha(opacity=0);
}

#drag .resizeL,
#drag .resizeR {
  top: 0;
  width: 5px;
  height: 100%;
  cursor: w-resize;
}

#drag .resizeR {
  right: 0;
}

#drag .resizeT,
#drag .resizeB {
  width: 100%;
  height: 5px;
  cursor: n-resize;
}

#drag .resizeT {
  top: 0;
}

#drag .resizeB {
  bottom: 0;
}

#drag .resizeLT,
#drag .resizeTR,
#drag .resizeLB {
  width: 8px;
  height: 8px;
  background: #ff0;
}

#drag .resizeLT {
  top: 0;
  left: 0;
  cursor: nw-resize;
}

#drag .resizeTR {
  top: 0;
  right: 0;
  cursor: ne-resize;
}

#drag .resizeLB {
  left: 0;
  bottom: 0;
  cursor: ne-resize;
}

.btn-div {
  padding-top: 20px;
  padding-left: 43px;
}
.label-tip {
  margin-left: 130px;
  margin-top: 20px;
}
.select-btn {
  margin-top: 8px;
  margin-left: 42px;
  width: 208px;
}
</style>
