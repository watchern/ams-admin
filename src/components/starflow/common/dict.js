export default {
  /**
     * 定义toName()
     * paramId:传入id
     * value:传入的值
     */
  toName(paramId, value) {
    switch (paramId) {
      case 'whetherTag':
        return this.whetherTagFun(value);
      case 'auditStatus':
          return this.auditStatusFun(value);
    }
  },
    //审核状态0=待提交；1=审核中；2=审核通过；3=退回；4=收回
    auditStatusFun: (value) => {
      var name = ""
      if (value == "0") {
          name = "待提交";
      } else if (value == "1") {
          name = "审核中";
      } else if (value == "2") {
          name = "审核通过";
      } else if (value == "3") {
          name = "审核退回";
      } else if (value == "4") {
          name = "收回";
      }else if (value == "5") {
          name = "终止";
      } else {
          name = "";
      }
      return name;
  },
  // 是否
  whetherTagFun: (value) => {
    var name = "";
    if (value == "0") {
      name = "否";
    } else if (value == "1") {
      name = "是";
    } else {
      name = "";
    }
    return name;
  },
      // 审批流程通过类型获取流程值
      flowValueFun: (key) => {
        var value = ""
        //年度计划流程
        if (key == "yearPlan") {
            value = "cn_com_boe_as_yearPlan";
            //计划项目-非kpi
        } else if (value == "prjPlan_notKPI") {
            value = "prjPlan_notKPI";
            //计划项目-kpi
        } else if (value == "prjPlan_isKPI") {
            value = "prjPlan_isKPI";
        } else if (value == "prjApproval") {
            value = "cn_com_boe_as_prjApproval";
        }else if (key == "prjApproval_fr") {
            value = "cn_com_boe_as_prjApproval_fr";
        }else if (key == "prjAdjustment_fr") {
            value = "cn_com_boe_as_prjAdjustment_fr";
        }
        return value;
    },
}