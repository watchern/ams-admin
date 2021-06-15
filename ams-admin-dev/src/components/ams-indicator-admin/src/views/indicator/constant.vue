<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>关联已有维度</title>
    <script type="text/javascript" src="../../lib/jquery/jquery-3.3.1.js"></script>
    <script type="text/javascript" src="../../lib/layer/layer.js"></script>
    <script type="text/javascript" src="../../lib/layui/layui.js"></script>
    <script type="text/javascript"  src="../../lib/bootstrap/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="../../lib/js/commons.js"></script>
    <script type="text/javascript" src="../../lib/js/common_ext.js"></script>
    <script type="text/javascript" src="../../lib/js/indicatrixAnalysis/constant.js"></script>
    <script type="text/javascript" src="../../lib/js/indicatrixAnalysis/indicatrixAnalysis.js"></script>
    <script type="text/javascript" src="../../lib/jquery/jquery.form.js"></script>

    <link rel="stylesheet" href="../../lib/css/components.css">
    <link rel="stylesheet" href="../../lib/css/common.css">
    <link rel="stylesheet" href="../../lib/css/auditWorkbench.css">
    <link rel="stylesheet" href="../../lib/css/form.css">
    <link rel="stylesheet" href="../../lib/bootstrap/css/bootstrap.css">
    <link rel="stylesheet" href="../../lib/css/common.css">
    <link rel="stylesheet" href="../../lib/layui/css/layui.css"/>

</head>
<body>
<div class="col-sm-12" style="float:left">
    <div class="col-sm-6">
        <div class="panel panel-default">
            <div class="panel-body">
                <form role="form">
   <!--                 <div class="form-group">
                        <lable for="conValue" id="conValue" class="col-sm-2 control-label"></lable>
                    </div>-->
                    <div class="form-group" id="folderGroup">
                        <lable for="conValue"  class="col-sm-2 control-label">常量值</lable>
                        <div class="col-sm-10">
                            <input class="form-control" id="conValue" type="text" placeholder="请输入常量值">
                        </div>
                    </div>
                    <div class="form-group">
                        <input id="max" class="btn btn-default btn-sm" type="button" value="最大值" onclick="constant.addCon('max')">
                        <input id="min" class="btn btn-default btn-sm" type="button" value="最小值" onclick="constant.addCon('min');">
                        <input id="avg" class="btn btn-default btn-sm" type="button" value="平均值" onclick="constant.addCon('avg')">
                        <input id="sum" class="btn btn-default btn-sm" type="button" value="合计" onclick="constant.addCon('sum');">
                        <input id="count" class="btn btn-default btn-sm" type="button" value="计数" onclick="constant.addCon('count')">
                    </div>
                </form>
            </div>
        </div>
    </div>
    <div style="float: right">

        <input class="btn btn-primary" type="button" value="确定" onclick="constant.enter()">
        <input class="btn btn-default" type="button" value="取消" onclick="constant.close();">
    </div>
</div>
<script type="text/javascript">
    var constant = new Constant();
</script>
</body>
</html>