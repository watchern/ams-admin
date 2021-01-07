<template>
    <tree :nodes="pubInTreeNodes" :setting="pubInTreeSetting" @onCreated="pubInTreeCreate"/>
</template>
<script>
import request from '@/utils/request'
import $ from 'jquery'
import { Loading } from 'element-ui';

export default {
  name: 'index',
  props: ['type','setFolderIdAndName'],
  components: {
    tree: resolve => require(["../../lib/ztree/ztree.vue"], resolve)
  },
  data() {
    return {
        contextUrl: '/indicator',
        pubInTree:null,
        pubInTreeNodes: null,
        pubInTreeSetting: null,
        isOrgManager: sessionStorage.getItem('isOrgManager'),
        isInManager: sessionStorage.getItem('isInManager')
    }
  },
  mounted() {
    this.initZtree()
  },
  created() {
  },
  methods: {
    pubInTreeCreate(pubInTree){
        this.pubInTree = pubInTree
        this.pubInTree.expandAll(true)
        this.auditorHideNodes()

    },
    /**
     * 初始化指标树
     */
    initZtree() {
        var urlOne = this.contextUrl + "/InFolder/getIndicatrixTree";
        var that = this;
        $.post(urlOne, {}, function (res) {
            var zNodes = res;
            var setting = {
                data: {
                    key: {
                        name: "name",
                        title: "title"
                    },
                    simpleData: {
                        enable: true,
                        idKey: "id",
                        pIdKey: "pid"
                    }
                },
                async: {
                    enable: false
                },
                callback: {
                    onClick: that.enter
                },
                view: {
                    selectedMulti: false,
                    showLine: false
                }
            };
            //初始化树
            // var zTree = $.fn.zTree.init($("#tree"), setting, zNodes);
            that.pubInTreeNodes = res;
            that.pubInTreeSetting = setting;
            //TODO
            // that.fuzzySearch('tree','#search',null,false); //初始化模糊搜索方法
            //openFirstTreenode();
        }, "json");
    },

    /**
     * 确定按钮
     */
    enter(e, treeId, treeNode) {
        var treePathArr = this.getzTreePath(treeNode,"","");
        var treePathId = treePathArr[0];
        var treePathName = treePathArr[1];
        treePathId = treePathId.substring(0,treePathId.length - 1);
        treePathName = treePathName.substring(0,treePathName.length - 1);
        if(treeNode.level == 0){
            this.$message("不能添加在首级！");
            return;
        }
        if(this.type == 1){
            this.setFolderIdAndName(treeNode.id, treeNode.name, treePathId, treePathName, treeNode.pbScopeUuid);
        }
        if(this.type == 2){
            this.setFolderIdAndName(treeNode.id, treeNode.name, treePathId, treePathName, treeNode.pbScopeUuid,treeNode.auditorOrauditorgan);
        }
    },

    /**
     *递归获取zTree选中节点的所有父级节点
     * @param treeNode
     * @returns {string}
     */
    getzTreePath(treeNode,treePathId,treePathName) {
        var pNode = this.pubInTree.getNodesByParam("id", treeNode.pid, null);
        treePathName += treeNode.name + "/";
        treePathId += treeNode.id + ",";
        if (pNode.length != 0) {
            this.getzTreePath(pNode);
        }
        return [treePathId,treePathName];
    },
    auditorHideNodes(){
        if(this.isInManager != "true"){
            var node1 = this.pubInTree.getNodesByParam('auditorOrauditorgan','1')
            if(node1.length>0){
                this.hideNodes(node1[0])
            }
        }
        if(this.isInManager != "true" && this.isOrgManager != "true"){
            var node2 = this.pubInTree.getNodesByParam('auditorOrauditorgan','2')
            if(node2.length>0){
                this.hideNodes(node2[0])
            }
        }
    },
    hideNodes(treeNode){
        console.log(treeNode);
        this.pubInTree.removeChildNodes(treeNode)
    }
  }
}
</script>
