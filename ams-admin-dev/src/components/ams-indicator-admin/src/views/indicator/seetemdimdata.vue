<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>关联已有维度</title>
    <script type="text/javascript" src="../../lib/jquery/jquery-3.3.1.js"></script>
    <script type="text/javascript" src="../../lib/js/commons.js"></script>
    <script type="text/javascript" src="../../lib/js/common_ext.js"></script>
    <script type="text/javascript" src="../../lib/layer/layer.js"></script>
    <script type="text/javascript" src="../../lib/layui/layui.js"></script>
    <script type="text/javascript"  src="../../lib/bootstrap-select/js/bootstrap-select.js"></script>
    <script type="text/javascript"  src="../../lib/bootstrap-select/js/i18n/defaults-zh_CN.js"></script>
    <script type="text/javascript" src="../../lib/jqgrid/js/jquery.jqGrid.min.js"></script>
    <script type="text/javascript" src="../../lib/jqgrid/js/i18n/grid.locale-cn.js"></script>
    <script type="text/javascript"  src="../../lib/datetimepicker/bootstrap-datetimepicker.js"></script>
    <script type="text/javascript"  src="../../lib/datetimepicker/locales/bootstrap-datetimepicker.zh-CN.js"></script>
    <script type="text/javascript"  src="../../lib/bootstrap/js/bootstrap.min.js"></script>
    <script type="text/javascript"  src="../../lib/bootstrap-select/js/bootstrap-select.js"></script>
    <script type="text/javascript"  src="../../lib/bootstrap-select/js/i18n/defaults-zh_CN.js"></script>
    <script type="text/javascript"  src="../../lib/sweetalert/sweetalert.min.js"></script>
    <script type="text/javascript" src="../../lib/jquery/jquery.form.js"></script>
    <script type="text/javascript" src="../../lib/js/common_jqgird.js"></script>
    <link rel="stylesheet" href="../../lib/css/common.css">
    <link rel="stylesheet" href="../../lib/bootstrap/css/bootstrap.css">
    <link rel="stylesheet" href="../../lib/css/components.css">
    <link rel="stylesheet" href="../../lib/css/common.css">
    <link rel="stylesheet" href="../../lib/css/auditWorkbench.css">
    <link rel="stylesheet" href="../../lib/css/form.css">
    <link rel="stylesheet" href="../../lib/datetimepicker/bootstrap-datetimepicker.css">
    <link rel="stylesheet" href="../../lib/bootstrap-select/css/bootstrap-select.css">
    <link rel="stylesheet" href="../../lib/css/common.css">
    <link rel="stylesheet" href="../../lib/jqgrid/css/jquery-ui.css">
    <link rel="stylesheet" href="../../lib/layui/css/layui.css"/>
    <link rel="stylesheet" href="../../lib/jqgrid/css/ui.jqgrid.css">
</head>
<body>
<div class="col-sm-12" style="float:left">
    <div class="panel panel-default">
        <div class="panel-body">
            <form role="form">
                <div class="form-group">
                    <div class="table-view m-b-20">
                        <table class="table table-striped" id="gridTableDim"></table>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
<script type="text/javascript">
    $("#gridTableDim").html("");
    var colModel = [
        {name: '数据', lable: '数据', align: 'center'}
    ];
    var dom = "<thead><tr id='colDim'></tr></thead>";
    var tbody = "<tbody id='colTb'></tbody>";
    $("#gridTableDim").append(dom);
    $("#gridTableDim").append(tbody);
    $.each(colModel, function (num, value) {
        var domTd = "<th>" + value.lable + "</th>";
        $("#colDim").append(domTd);
    });
    var data = JSON.parse(sessionStorage.getItem("temDimResult"));
    $.each(data,function (num,value) {
        var uuid = getuuid();
        var domTr = "<tr id='" + uuid + "'></tr>";
        $("#colTb").append(domTr);
        var domTd = "<td title='"+ value +"'>" + value + "</td>";
        $("#" + uuid).append(domTd);
    })
</script>
</body>
</html>