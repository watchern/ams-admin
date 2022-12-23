import axios from "axios";
import $ from "jquery";
import { Notification, Loading } from "element-ui";

//定义loading变量
let loading;
export default {
  /**
   * 将数据字典的中value转换成name
   * param_url:数据字典id，param_field:数据字典的value值
   * #已废弃
   */
  toName: (param_url, param_field, params) => {
    var url = "/starflow/dict/data/v1/" + param_url + "";
    var name;
    var value;
    var returnName;
    $.ajax({
      url: url,
      cache: false,
      type: "get",
      data: params,
      dataType: "json",
      async: false,
      success: function(data) {
        data = data.data;
        for (var i = 0; i < data.length; i++) {
          name = data[i].name;
          value = data[i].value;
          value = $.trim(value);
          param_field = $.trim(param_field);
          if (param_field == value) {
            returnName = name;
            break;
          }
        }
      }
    });
    return returnName;
  },
  /**
   * 加载数据字典到本地数组 数据字典url，默认值，参数
   * 渲染下拉框
   */
  setJsonSelectValue: (id, dictParam) => {
    // alert(1)
    if (typeof dictParam == "undefined") {
      dictParam = new Object();
    }
    var url = "/starflow/dict/data/v1/dicts?paramId=" + id;
    var dataArr = [];
    $.ajax({
      url: url,
      cache: false,
      type: "post",
      data: JSON.stringify(dictParam),
      contentType: "application/json",
      dataType: "json",
      async: false,
      success: function(data) {
        data = data.data;
        //alert(JSON.stringify(data))
        for (var i = 0; i < data.length; i++) {
          var data1 = { label: data[i].name, value: data[i].value };
          dataArr.push(data1);
        }
      }
    });
    return dataArr;
  },
  /**
   * 根据value取得name
   */
  //下拉选中-解决直接保存无需处理
  /**
   * 获得所有月份的数组
   */
  /**
   * 下载附件
   * pbFileUuid：附件主键
   */
  pubDownload: pbFileUuid => {
    // var pbFile = {pbFileUuid:pbFileUuid}
    var url = "/ams-clue/fileInfos/pa/pbFile/download?fileUuid=" + pbFileUuid;
    window.location.href = url;
  },

  pubDownloadURL: pbFileUuid => {
    // var pbFile = {pbFileUuid:pbFileUuid}
    var url = "/ams-clue/fileInfos/pa/pbFile/download?fileUuid=" + pbFileUuid;
    return url;
  },
  /**
   * 删除附件
   * pbFileUuid :附件主键Uuid
   * callback():删除附件页面回调函数
   */
  removeFile: pbFileUuid => {
    var pbFile = { pbFileUuid: pbFileUuid };
    axios.post("/starflow/pbFile/pa/pbFile/delete", pbFile).then(() => {});
  },
  /**
   * 提示框
   * tag:1/成功，2/警告，3/消息，4/失败
   * msg：你需要提示的信息
   */
  alertMsg: (tag, msg) => {
    if (1 == tag) {
      Notification({
        title: "成功",
        type: "success",
        message: msg,
        duration: 2000,
        position: "bottom-right"
      });
    } else if (2 == tag) {
      Notification({
        title: "警告",
        type: "warning",
        message: msg,
        duration: 2000,
        position: "bottom-right"
      });
    } else if (3 == tag) {
      Notification.info({
        title: "消息",
        message: msg,
        duration: 2000,
        position: "bottom-right"
      });
    } else {
      Notification.error({
        title: "失败",
        message: msg,
        duration: 2000,
        position: "bottom-right"
      });
    }
  },

  /**
   * 处理字符串，长度大于8用...代替
   */
  substr: string => {
    var returnStr = "";
    if (string.length > 8) {
      returnStr = string.substr(0, 8) + "...";
    } else {
      returnStr = string;
    }
    return returnStr;
  },
  /**
   * 项目所属人员角色
   */
  personRole: roleCode => {
    var roleName = "";
    if (roleCode == "exePrjMainLeader") {
      roleName = "组长";
    } else if (roleCode == "exePrjChiefAudit") {
      roleName = "主审";
    } else if (roleCode == "secondExePrjMainLeader") {
      roleName = "副组长";
    } else {
      roleName = "组员";
    }
    return roleName;
  },
  /**
   * 页面加载（遮蔽页面）
   */
  startLoading: () => {
    //使用Element loading-start 方法
    loading = Loading.service({
      lock: true,
      text: "加载中……"
    });
  },
  /**
   *页面加载（取消遮蔽页面）
   */
  endLoading: () => {
    //使用Element loading-close 方法
    loading.close();
  },
  /**
   * 自选分页
   */
  changePageArr: total => {
    let pageArr = [];
    if (total <= 10) {
      pageArr = [total];
    } else if (total <= 20) {
      pageArr = [10, total];
    } else if (total <= 30) {
      pageArr = [10, 20, total];
    } else if (total <= 100) {
      if (total <= 50) {
        pageArr = [10, 20, total];
      } else {
        pageArr = [10, 20, 50, total];
      }
    } else {
      pageArr = [10, 20, 50, 100, total];
    }
    return pageArr;
  },

  /**
   * 自动生成N位Uuid
   */
  randomString4Len: len => {
    //var len = 64 * 1
    len = len || 32;
    var $chars =
        "ABCDEFGHILJKMNOPQRSTUVWXYZabcdefghijklmnoprstuvwxyz1234567890";
    var maxLen = $chars.length;
    var str = "";
    for (var i = 0; i < len; i++) {
      str += $chars.charAt(Math.floor(Math.random() * maxLen));
    }
    return str;
  },
  /**
   * 当前系统登录日期
   * 格式：Y-m-d
   */
  getNowFormatDay: () => {
    var date = new Date();
    var seperator1 = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    var currentdate = year + seperator1 + month + seperator1 + strDate;
    return currentdate;
  },
};