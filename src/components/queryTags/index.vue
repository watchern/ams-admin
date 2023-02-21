<template>
  <div class="padding10 _width">

    <el-row :gutter="20">
      <el-col :span="12"
              :offset="6">
        <div class="search_conter">

          <!-- 父盒子 -->
          <div class="father_box"
               @click="onclick">
            <!-- 生成的标签 -->
            <div v-for="(item, index) in TagsAll"
                 :key="index"
                 class="spanbox">
              <span class="tagspan">{{ item.name }}{{ item.value }}</span>
              <i class="span_close"
                 @click="removeTag(index, item)"></i>
            </div>

            <!-- 输入框 -->
            <!-- @keyup.enter="addTags" -->
            <el-input placeholder="请输入查询的内容然后选择查询的类别"
                      v-model="currentval"
                      @keyup.delete="deleteTags"
                      :style="inputStyle"
                      class="inputTag"
                      ref="inputTag"
                      :class="TagsAll !== []?'is_margin_top':''"
                      type="text" />

            <i class="el-icon-search searchbtn"
               @click="search()"></i>
            <i class="el-icon-close clear_search"
               @click="clear_search()"></i>

          </div>

          <div v-if="currentval && dropDown.length > 0"
               class="dropDownBox">
            <div v-for="(item, index) in dropDown"
                 :key="index"
                 class="dropDownItem"
                 @click="addTags(item)">
              <div class="dropDownTitel">{{ item.name }}:</div>
              {{ currentval }}
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

  </div>
</template>

<script>
export default {
  name: "queryTags",
  props: {
    parentArr: {
      type: Array,
      default () {
        return [];
      },
    },
    limit: {
      // 最多生成标签数，这里可以设置最多生成的标签数量
      type: Number,
    },
    // dropDownData: {
    //   type: Array,
    //   default () {
    //     return [];
    //   },
    // },
  },
  data () {
    return {
      currentval: "",
      TagsAll: [],
      inputLength: "",
      serachParams: {},
      dropDown: [
        // "表名", "表中文名", "系统", "主题", "分层", "字段",
        {
          code: 'tableName',
          name: '表名',
          value: []
        },
        {
          code: 'tableCnName',
          name: '表中文名',
          value: []
        },
        // {
        //   code: 'businessName',
        //   name: '系统'
        // },
        // {
        //   code: 'themeName',
        //   name: '主题'
        // },
        // {
        //   code: 'layeredName',
        //   name: '分层'
        // },
        {
          code: 'columnName',
          name: '字段',
          value: []
        },
      ],
    };
  },
  watch: {
    TagsAll () {
      this.$emit("change", this.serachParams);
    },
    currentval (val) {
      // 
      // 实时改变input输入框宽度，防止输入内容超出input默认宽度显示不全
      this.inputLength = this.$refs.inputTag.value.length * 12 + 50;
    },
    parentArr () {
      this.TagsAll = this.parentArr.length ? this.parentArr : [];
    },
  },
  computed: {
    inputStyle () {
      let style = {};
      style.width = `${this.inputLength}px`;
      return style;
    },
    //将生成的数据拼接成字符串，因为我们公司后台需要这种格式的数据。
    finall () {
      return this.TagsAll.join(",");
    },
  },
  mounted () {
    this.TagsAll = this.parentArr;
    // this.dropDown = this.dropDownData;
  },
  methods: {
    // 查询
    search () {
      // this.$emit("search", this.serachParams);
      this.$emit("search", this.TagsAll);

    },
    // 重置
    clear_search () {
      this.TagsAll = [];
      this.serachParams = {}
      this.$emit("clearSearch", this.TagsAll, this.serachParams);

    },

    //回车-- 增加tag
    addTags (val) {
      //新增函数中可以加一些你所需要的校验规则。比如只能是数子，或者不能输入‘，’等
      if (val) {
        if (this.currentval) {
          var obj = {};
          let arrarys = []
          if (typeof val === "string") {
            val = val + ": ";
            obj = { name: val, value: this.currentval };
          } else {
            obj = { name: val.name + ": ", value: this.currentval, code: val.code };
          }
          this.TagsAll.push(obj);
          for (let i = 0; i < this.dropDown.length; i++) {
            if (this.dropDown[i].code == obj.code) {

              for (let t = 0; t < this.TagsAll.length; t++) {

                if (this.dropDown[i].code === this.TagsAll[t].code) {
                  arrarys.push(this.TagsAll[t].value)
                  this.serachParams[this.dropDown[i].code] = arrarys.join(',')
                }
              }
            }
          }
          this.currentval = "";//清空输入的值
        }
      } else {
        this.$message({ type: "warning", message: "请选择一条类型" });
      }

    },
    // 点击删除
    removeTag (index, item) {

      this.TagsAll.splice(index, 1);
      this.serachParams = {}
      let arrs = []

      for (let a = 0; a < this.TagsAll.length; a++) {
        for (let b = 0; b < this.dropDown.length; b++) {
          if (this.TagsAll[a].code == this.dropDown[b].code) {
            // let removedArr = this.dropDown[a].value.filter((x) => x !== item.value);
            // 
            arrs.push(this.TagsAll[a].value)
            this.serachParams[this.TagsAll[a].code] = arrs.join(',')
          }
        }
      }
    },

    //键盘删除键删除tag
    deleteTags () {
      if (this.currentval === "") {
        this.TagsAll.pop();
        this.serachParams = {}
        let arr = []
        for (let a = 0; a < this.dropDown.length; a++) {
          for (let b = 0; b < this.TagsAll.length; b++) {
            if (this.dropDown[a].code == this.TagsAll[b].code) {
              arr.push(this.TagsAll[b].value)
              this.serachParams[this.TagsAll[b].code] = arr.join(',')
            }
          }
        }

      }
    },
    onclick () {
      this.$nextTick(() => {
        this.$refs.inputTag.focus();
      });
    },
  },
};
</script>

<style scoped>
.search_conter {
  position: relative;
}
/* 外层div */
.father_box {
  /* width: 300px; */
  box-sizing: border-box;
  background-color: white;
  border: 1px solid #dcdee2;
  border-radius: 4px;
  font-size: 12px;
  text-align: left;
  word-wrap: break-word;
  overflow: hidden;
  padding: 4px 110px 2px 10px;
  box-sizing: border-box;
  border-radius: 25px;
}
/* 标签 */
.spanbox {
  display: inline-block;
  font-size: 14px;
  margin: 0px 4px 2px 0;
  background-color: rgb(229, 229, 229);
  border: 1px solid #e8eaec;
  border-radius: 25px;
}
.tagspan {
  height: 36px;
  line-height: 36px;
  max-width: 99%;
  position: relative;
  display: inline-block;
  padding-left: 8px;
  color: #495060;
  font-size: 14px;
  cursor: pointer;
  opacity: 1;
  vertical-align: middle;
  overflow: hidden;
  color: #666;
  font-weight: 400;
  transition: all 0.3s;
}
.spanbox:hover {
  border: 1px solid #999;
}
.span_close {
  padding: 0 5px 0 4px;
  opacity: 1;
  -webkit-filter: none;
  filter: none;
  color: rgb(26, 26, 26);
  font-weight: 600;
}
.span_close:after {
  content: "\00D7";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* line-height: 27px; */
  transition: 0.3s, color 0s;
}
/* input */
.inputTag {
  font-size: 16px;
  border: none;
  box-shadow: none;
  outline: none;
  background-color: transparent;
  padding: 0;
  width: auto;
  min-width: 350px;
  vertical-align: top;
  height: 36px;
  color: #495060;
  line-height: 32px;
}
.inputTag >>> .el-input__inner {
  border: none !important;
}
.dropDownBox {
  /* min-height: 50px; */
  width: 100%;
  max-height: 200px;
  /* background-color: white; */
  border: 1px solid rgba(255, 255, 255, 1);
  backdrop-filter: saturate(200%) blur(60px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 10px 10px 0 rgb(0 0 0 / 10%);
  overflow: auto;
  position: absolute;
  z-index: 99;
  border-radius: 15px;
}
.dropDownItem {
  height: 30px;
  line-height: 30px;
  /* margin-left: 10px; */
  color: #666 !important;
}
.dropDownItem:hover {
  cursor: pointer;
  color: #2c81fd !important;
  background: rgba(44, 129, 253, 0.2) !important;
}
.dropDownTitel {
  display: inline-block;
  width: 80px;
  text-align: right;
  margin-right: 20px;
}
.searchbtn {
  position: absolute;
  right: 3px;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  /* border: 1px solid; */
  border-radius: 27px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: rgb(0 0 0 / 30%);
  transition: all 0.3s;
  cursor: pointer;
}
.clear_search {
  position: absolute;
  right: 42px;
  top: 50%;
  transform: translate(-50%, -50%);
  border-right: 1px solid rgb(0 0 0 / 30%);
  width: 40px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: rgb(0 0 0 / 30%);
  transition: all 0.3s;
  cursor: pointer;
}
.searchbtn:hover,
.clear_search:hover {
  color: rgb(0 0 0 / 50%) !important;
}

.inputTag >>> .el-input__inner {
  border-radius: 25px;
  padding: 0 !important;
}
.is_margin_top {
  margin-top: 2px !important;
}
</style>
