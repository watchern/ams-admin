<!DOCTYPE html>
<html style="overflow:auto">
<head>
    <meta charset="UTF-8">
    <title>编辑指标计算</title>
    <script type="text/javascript" src="../../lib/jquery/jquery-3.3.1.js"></script>
    <script type="text/javascript" src="../../lib/js/commons.js"></script>
    <script type="text/javascript" src="../../lib/js/common_ext.js"></script>
    <script type="text/javascript" src="../../lib/js/indicatrixAnalysis/indicatrixCalculation.js"></script>
    <script type="text/javascript" src="../../lib/layer/layer.js"></script>
    <link rel="stylesheet" href="../../lib/css/zTreeStyle/zTreeStyle.css" type="text/css">
    <script type="text/javascript" src="../../lib/js/Ztree/jquery.ztree.core.js"></script>
    <script type="text/javascript" src="../../lib/js/Ztree/jquery.ztree.excheck.js"></script>
    <script type="text/javascript" src="../../lib/js/Ztree/jquery.ztree.exedit.js"></script>
    <script type="text/javascript" src="../../lib/js/Ztree/jquery.ztree.exhide.js"></script>
    <link rel="stylesheet" href="../../lib/vendor/zTree/css/zTreeStyle/zTreeStyle.css">
    <link rel="stylesheet" href="../../lib/css/components.css">
    <link rel="stylesheet" href="../../lib/css/common.css">
    <link rel="stylesheet" href="../../lib/css/auditWorkbench.css">
    <link rel="stylesheet" href="../../lib/css/form.css">
    <link rel="stylesheet" href="../../lib/bootstrap/css/bootstrap.css">
    <link rel="stylesheet" href="../../lib/css/indicatrixAnalysis.css">
    <link rel="stylesheet" href="../../lib/iconfonts/iconfont.css">

    <link href="../../lib/codemirror-5.39.2/lib/codemirror.css" rel="stylesheet" type="text/css">
    <link href="../../lib/codemirror-5.39.2/theme/monokai.css" rel="stylesheet" type="text/css">
    <link href="../../lib/codemirror-5.39.2/addon/display/fullscreen.css" rel="stylesheet" type="text/css">
    <!-- 引入CodeMirror核心文件 -->
    <script type="text/javascript" src="../../lib/codemirror-5.39.2/lib/codemirror.js"></script>
    <!-- CodeMirror支持不同语言，根据需要引入JS文件 -->
    <!-- 因为HTML混合语言依赖Javascript、XML、CSS语言支持，所以都要引入 -->
    <script type="text/javascript" src="../../lib/codemirror-5.39.2/mode/javascript/javascript.js"></script>
    <script type="text/javascript" src="../../lib/codemirror-5.39.2/mode/xml/xml.js"></script>
    <script type="text/javascript" src="../../lib/codemirror-5.39.2/mode/css/css.js"></script>
    <script type="text/javascript" src="../../lib/codemirror-5.39.2/mode/htmlmixed/htmlmixed.js"></script>
    <!-- 下面分别为显示行数、括号匹配和全屏插件 -->
    <script type="text/javascript" src="../../lib/codemirror-5.39.2/addon/selection/active-line.js"></script>
    <script type="text/javascript" src="../../lib/codemirror-5.39.2/addon/edit/matchbrackets.js"></script>
    <script type="text/javascript" src="../../lib/codemirror-5.39.2/addon/display/fullscreen.js"></script>
</head>
<style>
    label {
        display: inline-block;
        width: 100px;
        text-align: right;
    }
    .selected{background-color: #3d80c4;padding: 3px;color: #FFF;border: 1px solid #FFF;}
    ul li{
        list-style: none;margin：0:auto;
    }
</style>
<body>
<div class="content_wrap">
    <div class="col-sm-2">
        <div class="panel panel-default">
            <div class="panel-body" style="height: 700px">
                <ul id="tree" class="ztree"></ul>
            </div>
        </div>
    </div>
    <div class="col-sm-2">
        <div class="panel panel-default">
            <div class="panel-body" style="height: 700px;cursor:pointer;overflow-y:scroll">
                <ul id="colName" >
                </ul>
            </div>
        </div>
    </div>
    <div class="col-sm-8">
        <div class="panel panel-default">
            <div class="panel-body">
                <form role="form">
                    <div class="form-group">
                        <label for="inName" class="col-sm-2 control-label">指标名称</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control" id="inName" placeholder="请输入指标名称">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="measureAlias" class="col-sm-2 control-label">指标别名</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control" id="measureAlias" placeholder="请输入指标别名">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="tableName" class="col-sm-2 control-label">指标表名</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control" id="tableName" readonly="true">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="folderName" class="col-sm-2 control-label">所属分类</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control" id="folderName" readonly="true">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="folderName" class="col-sm-2 control-label">运算符</label>
                        <div class="col-sm-9">
                            <input class="btn btn-default btn-sm" type="button" value="sum" onclick="indicatrixCalculation.appendText('sum')">
                            <input class="btn btn-default btn-sm" type="button" value="count" onclick="indicatrixCalculation.appendText('count')">
                            <input class="btn btn-default btn-sm" type="button" value="max" onclick="indicatrixCalculation.appendText('max')">
                            <input class="btn btn-default btn-sm" type="button" value="min" onclick="indicatrixCalculation.appendText('min')">
                            <input class="btn btn-default btn-sm" type="button" value="avg" onclick="indicatrixCalculation.appendText('avg')">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="code" class="col-sm-2 control-label">指标公式</label>
                        <div class="col-sm-9">
                            <textarea id="code" name="code" ></textarea>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="inMemo" class="col-sm-2 control-label">指标说明</label>
                        <div class="col-sm-9">
                            <textarea id="inMemo" class="form-control"></textarea>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div class="form-group" style="float: right">
            <input class="btn btn-primary" type="button" value="保存" onclick="indicatrixCalculation.saveDimension()">
            <input class="btn btn-default" type="button" value="取消" onclick="indicatrixCalculation.closeWinform();">
        </div>
    </div>
</div>
<script type="text/javascript">
        var indicatrixCalculation = new IndicatrixCalculation();
</script>
</body>
</html>


