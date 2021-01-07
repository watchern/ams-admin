<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>筛选器</title>
    <script type="text/javascript" src="../../lib/jquery/jquery-3.3.1.js"></script>
    <script type="text/javascript" src="../../lib/jquery/jquery.form.js"></script>
    <script type="text/javascript" src="../../lib/bootstrap/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="../../lib/layer/layer.js"></script>
    <script type="text/javascript" src="../../lib/js/framework/queryBulider/js/jQuery.extendext.min.js"></script>
    <script type="text/javascript" src="../../lib/js/framework/queryBulider/js/doT.js"></script>
    <script type="text/javascript" src="../../lib/js/framework/queryBulider/js/sql-parser.min.js"></script>
    <script type="text/javascript" src="../../lib/js/framework/queryBulider/js/query-builder.js"></script>
    <script type="text/javascript" src="../../lib/js/framework/queryBulider/js/moment-with-locales.js"></script>
    <script type="text/javascript" src="../../lib/js/framework/queryBulider/js/moment.js"></script>
    <script type="text/javascript" src="../../lib/js/framework/queryBulider/js/query-builder.js"></script>
    <script type="text/javascript" src="../../lib/js/framework/queryBulider/js/query-builder.zh-CN.js"></script>
    <script type="text/javascript" src="../../lib/bootstrap-datepicker-1.6.4/js/bootstrap-datepicker.js"></script>
    <script type="text/javascript" src="../../lib/bootstrap-datepicker-1.6.4/locales/bootstrap-datepicker.zh-CN.min.js"></script>
    <script type="text/javascript" src="../../lib/bootstrap-select/js/bootstrap-select.js"></script>
    <script type="text/javascript" src="../../lib/bootstrap-select/js/i18n/defaults-zh_CN.js"></script>
    <script type="text/javascript" src="../../lib/sweetalert/sweetalert.min.js"></script>
    <script type="text/javascript" src="../../lib/js/commons.js"></script>
    <script type="text/javascript" src="../../lib/js/common_ext.js"></script>
    <script type="text/javascript" src="../../lib/selectize.js-master/js/standalone/selectize.js"></script>
    <script type="text/javascript" src="../../lib/selectize.js-master/js/standalone/selectize.min.js"></script>
    <script type="text/javascript" src="../../lib/js/indicatrixAnalysis/inMeasureFilter.js"></script>

    <link rel="stylesheet" href="../../lib/bootstrap/css/bootstrap.min.css"/>
    <link rel="stylesheet" href="../../lib/css/bootstrap-select/css/bootstrap-select.css">
    <link rel="stylesheet" href="../../lib/js/framework/queryBulider/css/query-builder.default.css"/>
    <link rel="stylesheet" href="../../lib/css/components.css">
    <link rel="stylesheet" href="../../lib/css/common.css">
    <link rel="stylesheet" href="../../lib/bootstrap/css/bootstrap.css">
    <link rel="stylesheet" href="../../lib/bootstrap-datepicker-1.6.4/css/bootstrap-datepicker.css">
    <link rel="stylesheet" href="../../lib/bootstrap-datepicker-1.6.4/css/bootstrap-datepicker.standalone.css">
    <link rel="stylesheet" href="../../lib/selectize.js-master/css/selectize.bootstrap3.css">
</head>
<style>
    .query-builder .rules-group-header .group-conditions .btn.readonly:not(.active), .query-builder .rules-group-header .group-conditions input[name$='_cond'] {
        width: auto;
        height: auto;
        position: static;
        margin: auto;
        white-space: unset;
    }
</style>
<body>
<div class="col-sm-12">
    <ul id="resultTab" class="nav nav-tabs">
        <li><a href="#convention" onclick="inMeasureFilter.setFilterPage('convention')" id="cg" tabindex="-1" data-toggle="tab">常规</a></li>
        <li><a href="#filter" onclick="inMeasureFilter.setFilterPage('filter')" id="tj" tabindex="-1" data-toggle="tab">条件</a></li>
<!--        <li><a href="#senior" onclick="inMeasureFilter.setFilterPage('senior')" id="seniors" tabindex="-1" data-toggle="tab">高级</a></li>-->
    </ul>
    <div id="" class="tab-content">
        <div class="tab-pane fade in active" style="height: 650px;" id="convention">
            <div class="form-group">
                <input type="text" class="form-control" onkeyup="inMeasureFilter.searchOnChange()" id="search" placeholder="请输入搜索条件">
            </div>
            <div style="height: 600px;overflow-y:auto;cursor:pointer">
                <div style="height: 600px">
                    <table id="colData">
                    </table>
                </div>
            </div>
            <button class="btn btn-primary" type="button" onclick="inMeasureFilter.allElection()">全选</button>
            <button class="btn btn-default" type="button" onclick="inMeasureFilter.reverseElection()">取消全选</button>
        </div>
        <div class="tab-pane fade " id="filter">
            <div class="main-view">
                <div id="builder"></div>
            </div>
        </div>
        <div class="tab-pane fade " id="senior">
            <div class="form-group">
                <label for="formula" class="col-sm-2 control-label">请输入公式：</label>
                <textarea style="height: 300px;" class="form-control" id="formula" placeholder="请输入公式，例如：like '%某某银行%'"></textarea>
            </div>
        </div>
    </div>
</div>
<div class="panel-body">
    <div style="float: right">
        <button class="btn btn-primary" type="button" onclick="inMeasureFilter.enter()">确定</button>
        <button class="btn btn-default" type="button" onclick="inMeasureFilter.closeForm()">取消</button>
    </div>
</div>
<script type="text/javascript">
    var inMeasureFilter = new InMeasureFilter();
    var filterJson = decodeURI(getParams().filterJson);
    if (filterJson != "" && filterJson != "1" && filterJson != "2" && filterJson != "3") {
        $("#tj").click();
    }
    if (filterJson == "1") {
        $("#cg").click();
    }
    if (filterJson == "2") {
        $("#seniors").click();
    }
</script>
</body>
</html>


