/**
 * Created by Chuang on 2018-12-5.
 */
//var fnZtree = $.fn.zTree;
function initRMenu(menuData, event, treeId, treeNode){
    var rMenu = $('<div id="rMenu" class="rMenu"></div>');
    var ul = $("<ul></ul>");
    rMenu.append(ul);
    $(menuData).each(function(){
        var callback = this.callback;
        var id = this.id;
        var text = this.text;
        var li = $('<li id="'+id+'">'+text+'</li>');
        li.click(function(){
            hideRMenu(rMenu);
            callback(event, treeId, treeNode);

        });
        ul.append(li);
    });
    return rMenu;
}

function OnRightClick(event, treeId, treeNode, menuData,zTreeObj) {
//    if(!$.fn.zTree){
//        zTree = fnZtree;
//    }else{
//        zTree = regedTableTree;
//    }
    rMenu = initRMenu(menuData, event, treeId, treeNode);
    if (!treeNode && event.target.tagName.toLowerCase() != "button" && $(event.target).parents("a").length == 0) {
    	zTreeObj.cancelSelectedNode();
        showRMenu(rMenu, event.clientX, event.clientY);
    } else if (treeNode && !treeNode.noR) {
    	zTreeObj.selectNode(treeNode);
        showRMenu(rMenu, event.clientX, event.clientY);
    }
}

function showRMenu(rMenu, x, y) {
    y += document.body.scrollTop;
    x += document.body.scrollLeft;
    $("body").append(rMenu);
    rMenu.css({"top":y+"px", "left":x+"px", visibility: "visible"});
    $("body").bind("mousedown", onBodyMouseDown);
}
function hideRMenu(rMenu) {
    rMenu.remove();
    $("body").unbind("mousedown", onBodyMouseDown);
}
function onBodyMouseDown(event){
    if (!(event.target.id == "rMenu" || $(event.target).parents("#rMenu").length>0)) {
        $("#rMenu").remove();
    }else{
        return true;
    }
    $("body").unbind("mousedown", onBodyMouseDown);
}