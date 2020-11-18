// urlParams is null when used for embedding
window.urlParams = window.urlParams || {};

// Public global variables
window.MAX_REQUEST_SIZE = window.MAX_REQUEST_SIZE || 10485760;
window.MAX_AREA = window.MAX_AREA || 15000 * 15000;

// URLs for save and export
/*window.EXPORT_URL = window.EXPORT_URL || '/export';
window.SAVE_URL = window.SAVE_URL || '/save';
window.OPEN_URL = window.OPEN_URL || '/open';*/
window.RESOURCES_PATH = (window.PURL || "") + '../graphtool/resources';
window.RESOURCE_BASE = window.RESOURCE_BASE || window.RESOURCES_PATH + '/grapheditor';
window.STENCIL_PATH = window.STENCIL_PATH || 'framework/stencils';
window.IMAGE_PATH = window.IMAGE_PATH || '../graphtool/images';
window.STYLE_PATH = window.STYLE_PATH || '../graphtool/styles';
window.CSS_PATH = window.CSS_PATH || '../graphtool/styles';

// Sets the base path, the UI language via URL param and configures the
// supported languages to avoid 404s. The loading of all core language
// resources is disabled as all required resources are in grapheditor.
// properties. Note that in this example the loading of two resource
// files (the special bundle and the default bundle) is disabled to
// save a GET request. This requires that all resources be present in
// each properties file since only one file is loaded.
window.mxBasePath = window.mxBasePath || (window.PURL || "") + 'resources/src';
window.mxLanguage = window.mxLanguage || urlParams['lang'];
window.mxLanguages = window.mxLanguages || ['de'];


$.fn.extend({
	//ztree右键菜单
	ztreeRightMenu: function(treeNode, x, y) {
		if(treeNode == null || treeNode.isParent) {
			return;
		}
		var zMenuDiv = document.createElement("div");
		zMenuDiv.style.display = "inline";
		zMenuDiv.style.zIndex = "1006";
		zMenuDiv.className = "mxPopupMenu";
		zMenuDiv.style.left = x + "px";
		zMenuDiv.style.top = y + "px";
		
		var zMenuTable = document.createElement("table");
		zMenuTable.className = "mxPopupMenu";
		
		var zMenuTr = document.createElement("tr");
		zMenuTr.className = "mxPopupMenuItem";
		
		var zMenuTd = document.createElement("td");
		zMenuTd.className = "mxPopupMenuItem";
		zMenuTd.innerHTML = "查看";
		
		zMenuTr.appendChild(zMenuTd);
		zMenuTable.appendChild(zMenuTr);
		zMenuDiv.appendChild(zMenuTable);
		
		document.body.appendChild(zMenuDiv);
	}
});

