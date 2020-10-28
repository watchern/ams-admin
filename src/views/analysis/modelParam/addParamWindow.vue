<template>
<div>
<iframe src="http://192.168.80.185:8080/AuditAnalysis/param/toParamManagerList?result=login&LTPAToken=d2VibWFzdGVyKjEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQqMSpTdHJpbmcqOTQ0OGIyMDM1YTdmNDIxZTAxNWE3ZjZkYzcxMzAwNTA=&maxInerval=14400">
    IE：你们都看我干吗，我现在也是支持的
</iframe>
</div>
  <!-- <div>
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="参数名称">
        <el-input v-model="form.paramName"></el-input>
      </el-form-item>
      <el-form-item label="数据类型">
        <el-select
          v-model="form.dataType"
          placeholder="请输入"
          @change="changeInputSelect"
        >
          <el-option
            v-for="(item, key) in dataTypeSelect"
            :key="key"
            :label="item.codeName"
            :value="item.codeValue"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="输入方式">
        <el-select v-model="form.inputType" placeholder="请输入">
          <el-option
            v-for="(item, key) in inputTypeSelect"
            :key="key"
            :label="item.codeName"
            :value="item.codeValue"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="示例">
        <el-input v-model="form.example"></el-input>
      </el-form-item>
      <el-form-item label="允许为空">
        <el-radio-group v-model="form.allowNull">
          <el-radio label="是"></el-radio>
          <el-radio label="否"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="形式类型">
        <el-radio-group v-model="form.shapeType">
          <el-radio label="单选"></el-radio>
          <el-radio label="多选"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="参数值长度">
        <el-input v-model="form.dataLength"></el-input>
      </el-form-item>
      <el-form-item label="备选值设置">
        <el-tabs v-model="activeName">
          <el-tab-pane label="自定义静态" name="first">
            <el-row>
              <el-button
                type="primary"
                icon="el-icon-plus"
                circle
                style="float: right"
                @click="plusButton"
              ></el-button>
            </el-row>
            <div v-for="(item, key) in customStatic" :key="key">
              <div>
                <el-input
                  v-model="form.names[key]"
                  style="width: 40%"
                  placeholder="key"
                ></el-input>
                <el-input
                  v-model="form.vals[key]"
                  style="width: 40%"
                  placeholder="value"
                ></el-input>
                <el-button
                  type="primary"
                  icon="el-icon-minus"
                  circle
                  @click="remove(key)"
                ></el-button>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="SQL动态" name="second">
            <el-input
              type="textarea"
              v-model="form.sql"
              placeholder="请输入SQL"
            ></el-input>
            <el-row>
              <el-button type="primary" @click="openSQLRule">查看SQL规则</el-button>
			  <el-button type="primary">预览</el-button>
            </el-row>
          </el-tab-pane>
        </el-tabs>
        <el-tabs v-model="activeName">
          </el-tabs>
      </el-form-item>
      <el-form-item label="说明">
        <el-input
          type="textarea"
          v-model="form.desc"
          placeholder="说明"
        ></el-input>
      </el-form-item>
    </el-form>
 </div> -->
 
</template>
<script>
import { setSelectValue } from "@/api/analysis/auditParam";
import { getDictSonList } from "@/utils/index";
export default {
  created() {
    this.setSelectValue();
  },
  data() {
    return {
      form: {
        paramName: "",
        dataType: "",
        inputType: "",
        example: "",
        allowNull: "",
        dataLength: "",
        shapeType: "",
        names: [],
        vals: [],
        sql: "",
      },
      dataTypeSelect: [], //存放数据类型输入框数据
      inputTypeSelect: [], //存放输入类型输入框数据
      timeUnitSelect: [], //存放时间间隔单位输入框数据
      map_data_input: {
        "002001003001": {
          //数字
          type: [
            "002001002001", //文本
            "002001002004", //列表
            "002001002002", //树
          ],
        },
        "002001003003": {
          type: [
            "002001002001", //文本
            "002001002004", //列表
            "002001002002", //树
          ],
        },
        "002001003002": {
          //时间
          type: [
            "002001002003", //时间
          ],
        },
      },
      activeName: "first",
      customStatic: [],
      url:'www.baidu.com'
    };
  },
  methods: {
    //初始化下拉框    http://localhost:9527/#/base/baseCodeTree/
    setSelectValue() {
      //时间间隔
      getDictSonList("002001001").then((data) => {
        this.timeUnitSelect = data;
      });
      //数据类型
      getDictSonList("002001003").then((data) => {
        this.dataTypeSelect = data;
      });
    },
    changeInputSelect() {
      this.inputTypeSelect = [];
      this.form.inputType = "";
      //根据数据类型联动输入类型
      console.log(this.form.dataType);
      getDictSonList("002001002").then((data) => {
        var str = this.map_data_input[this.form.dataType].type;
        for (var i = 0; i < data.length; i++) {
          if (str.indexOf(data[i].codeValue) > -1) {
            console.log(data[i].codeValue);
            this.inputTypeSelect.push(data[i]);
          }
        }
      });
    },
    plusButton() {
      this.customStatic.push(1);
    },
    remove(key) {
      console.log(key);
      this.form.names.splice(key, 1);
      this.form.vals.splice(key, 1);
      this.customStatic.splice(key, 1);
      console.log(this.form.names);
      console.log(this.form.vals);
	},
	  openSQLRule() {
        this.$alert(`1、SQL语句的格式为：SELECT A,B FROM C 

                     2、其中【A】字段为真实值，【B】字段为显示值，若字段过多（或者存在【*】），则默认只使用前两列进行真实值与显示值的匹配`, '标题名称', {
          confirmButtonText: '关闭'
        });
      }
  },
};
</script>

1、SQL语句的格式为：SELECT A,B FROM C

2、其中【A】字段为真实值，【B】字段为显示值，若字段过多（或者存在【*】），则默认只使用前两列进行真实值与显示值的匹配