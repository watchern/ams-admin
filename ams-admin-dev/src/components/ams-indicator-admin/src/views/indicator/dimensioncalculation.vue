<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>编辑维度计算</title>
    <script type="text/javascript" src="../../lib/jquery/jquery-3.3.1.js"></script>
    <script type="text/javascript" src="../../lib/js/commons.js"></script>
    <script type="text/javascript" src="../../lib/js/common_ext.js"></script>
    <script type="text/javascript" src="../../lib/js/indicatrixAnalysis/dimensionCalculation.js"></script>
    <script type="text/javascript" src="../../lib/layer/layer.js"></script>
    <link rel="stylesheet" href="../../lib/css/indicatrixAnalysiss">
    <link rel="stylesheet" href="../../lib/bootstrap/css/bootstrap.css">
    <link href="../../lib/codemirror-5.39.2/lib/codemirror.css" rel="stylesheet" type="text/css">
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
    <div class="col-sm-3">
        <div class="panel panel-default">
            <div class="panel-body">
                <ul id="colName" style="overflow-y:scroll;height: 507px;cursor:pointer">
                </ul>
            </div>
        </div>
    </div>
    <div class="col-sm-9">
        <div class="panel panel-default">
            <div class="panel-body">
                <form role="form">
                    <div class="form-group">
                        <label for="dimName" class="col-sm-2 control-label">维度名称</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="dimName" placeholder="请输入维度名称">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="tableName" class="col-sm-2 control-label">维度表</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="tableName" readonly="true">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="code" class="col-sm-2 control-label">维度公式</label>
                        <div class="col-sm-10">
                            <textarea id="code" name="code"></textarea>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="dimMemo" class="col-sm-2 control-label">维度说明</label>
                        <div class="col-sm-10">
                            <textarea id="dimMemo" class="form-control"></textarea>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div class="form-group" style="float: right">
            <input class="btn btn-primary" type="button" value="保存" onclick="dimensionCalculation.saveDimension()">
            <input class="btn btn-default" type="button" value="取消" onclick="dimensionCalculation.closeWinform();">
        </div>
    </div>
</div>


<script type="text/javascript">
    var dimensionCalculation = new DimensionCalculation();
</script>
</body>
</html>


