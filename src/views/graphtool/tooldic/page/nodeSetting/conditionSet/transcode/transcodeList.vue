<template>
  <div>
    <form id="query" class="form-horizontal">
      <div id="wrapper" class="clearfix content_zp">
        <div class="row">
          <div class="col-sm-3">
            <div class="form-group">
              <label class="col-sm-4 control-label">规则名称</label>
              <div class="col-sm-6">
                <input id="transcodeName" name="transcodeName" type="text" class="form-control" autocomplete="off" placeholder="规则名称">
              </div>
            </div>
          </div>
          <div class="col-sm-2">
            <div class="form-group">
              <label class="col-sm-4 control-label">转码方式</label>
              <div class="col-sm-8">
                <select id="transcodeType" name="transcodeType" class="selectpicker">
                  <option value="">请选择</option>
                  <option value="1">SQL语句</option>
                  <option value="2">手动添加</option>
                </select>
              </div>
            </div>
          </div>
          <div class="col-sm-2">
            <button class="btn btn-primary pull-right" type="button" onclick="search()">按条件查询</button>
          </div>
        </div>
      </div>
    </form>
    <input id="isChange" type="hidden">
    <div id="operateBtn" class="table-view-caption clearfix m-b-10" style="display:none;">
      <div class="caption-header">查询结果 <span class="table-row-span" /> 条</div>
    </div>
    <div id="tableArea" class="table-view m-b-20" style="padding-left:10px;">
      <table id="gridTable" class="table table-striped" />
      <div id="pagger" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'TranscodeList',
  data() {
    return {
      tableGridObj: new TableGrid()
    }
  },
  mounted() {
    this.pageInit()
  },
  methods: {
    pageInit(param) {
      $('#gridTable').jqGrid('clearGridData')
      var setting = {
        tableId: 'gridTable',
        tableUrl: '/checkSource/getTranscodeList',
        queryFormId: 'query',
        pageId: 'pagger',
        params: param,
        rownumbers: true,
        multiselect: true, // 多选框
        divId: 'tableArea',
        colModel: [
          { label: '规则名称', name: 'transcodeName', align: 'left', formatter: function(cellValue, options, rowObject, action) {
            return '<a href="javascript:void(0);" style="text-decoration: underline;" onclick="transcode.detailDialog(\'' + rowObject.transcodeId + '\');">' + cellValue + '</a>'
          } },
          { label: '转码方式', name: 'transcodeType', align: 'center', formatter: function(cellValue, options, rowObject, action) {
            if (rowObject.transcodeType === '1') {
              return 'SQL语句'
            } else {
              return '手动添加'
            }
          } },
          { label: '规则描述', name: 'transcodeDesc', align: 'left' },
          { label: 'ID', name: 'transcodeId', align: 'center', hidden: true }
        ]
      }
      tableGridObj.initGridData(setting)
    },
    search() {
      var transcodeName = $('#transcodeName').val()
      var transcodeType = $('#transcodeType').val()
      var param = {
        'transcodeName': transcodeName,
        'transcodeType': transcodeType
      }
      transcode.pageInit(param)
    },
    detailDialog(id) {
      layer.open({
        id: 'detailDialog',
        type: 2,
        title: '转码详情',
        content: 'detailTranscode.jsp?id=' + id,
        area: ['80%', '90%'],
        skin: 'layui-layer-lan',
        resize: false,
        scrollbar: false
      })
    },
    returnData() {
      var ids = $('#gridTable').jqGrid('getGridParam', 'selarrrow')
      if (ids.length > 1) {
        alertMsg('提示', '请选择单条数据操作！', 'warning')
        return ''
      }
      var id = $('#gridTable').jqGrid('getGridParam', 'selrow')
      if (id == null || id == '') {
        alertMsg('提示', '请选择更改条目！', 'warning')
        return ''
      }
      var rowData = $('#gridTable').jqGrid('getRowData', id)
      var obj = {
        'transcodeId': rowData.transcodeId,
        'transcodeName': rowData.transcodeName
      }
      return obj
    }
  }
}

var transcode = new Transcode()
var isManager = getParams().isManager
if (isManager == 1) {
  $('#operateBtn').show()
}
$(function() {
  transcode.pageInit()
})
function search() {
  var transcodeName = $('#transcodeName').val()
  var transcodeType = $('#transcodeType').val()
  var param = {
    'transcodeName': transcodeName,
    'transcodeType': transcodeType
  }
  transcode.pageInit(param)
}

function returnData() {
  return transcode.returnData()
}
</script>
