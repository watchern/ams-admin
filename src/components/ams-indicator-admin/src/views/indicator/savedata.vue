<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>保存数据</title>
    <script type="text/javascript" src="../../lib/jquery/jquery-3.3.1.js"></script>
    <script type="text/javascript" src="../../lib/layer/layer.js"></script>
    <script type="text/javascript" src="../../lib/Script/Plugin/Ztree/ext/fuzzysearch.js"></script>
        <script type="text/javascript" src="../../lib/js/common_ext.js"></script>
    <link rel="stylesheet" href="../../lib/css/components.css">
    <link rel="stylesheet" href="../../lib/css/common.css">
    <link rel="stylesheet" href="../../lib/bootstrap/css/bootstrap.css">
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
    <div class="col-sm-8" style="float:left">
        <div class="panel panel-default">
            <div class="panel-body">
                <form role="form">
                    <div class="form-group">
                        <label for="tableName" class="col-sm-2 control-label">表名称</label>
                        <div class="col-sm-6">
                            <input type="text" class="form-control" id="tableName" placeholder="请输入名称">
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div style="float: right">
            <input class="btn btn-primary" type="button" value="保存" onclick="save()">
            <input class="btn btn-default" type="button" value="取消" onclick="closeForm()">
        </div>
    </div>
</div>

<script type="text/javascript">

    /**
     * 获取父界面传过来的参数方法
     * @type {string|*}
     */
    var param = getParams();
    /**
     * 保存
     */
    function save() {
        var uuid = decodeURI(param.id);
        var name = decodeURI(param.name);
        var tableName = $("#tableName").val();
        top.pageLoading("正在保存，请稍候");
		setTimeout(function() {
			window.parent.indicatrixAnalysis.saveData(uuid,name,tableName);
	        top.closeLoading();
	        closeForm();
		}, 500);
    }
    function closeForm() {
        var index = parent.layer.getFrameIndex(window.name); //获取窗口索引
        parent.layer.close(index);
    }
</script>
</body>
</html>


