<template>
    <div class="page-container-first">
        <div class="top-container">
            <!--      查询-->
            <div class="query-top-img">
                <img :src="dataSearchImg"/>
            </div>
            <div style="width: 600px; margin: 0 auto; padding: 5px">
                <query-tags
                        :dropDownData="dropDownData"
                        @change="onChange"
                ></query-tags>
            </div>
        </div>
        <div class="under-container">
            <div class="left-container">
                <div class="categorical-index">
                    <div class="theme-index">
                        <div class="classify-them-left">业务主题</div>
                        <div class="classify-right-out">
                            <div
                                    class="classify-right"
                                    v-for="(topic, index) in BusinessTopics"
                                    :key="index"
                                    :class="isActiveTopic === index ? 'active' : ''"
                                    @click="setActiveTab(index, 'isActiveTopic')"
                            >
                                {{ topic.title }}
                            </div>
                        </div>
                    </div>

                    <div class="theme-index">
                        <div class="classify-them-left">业务系统</div>
                        <div class="classify-right-out">
                            <div
                                    class="classify-right"
                                    v-for="(system, index) in BusSystems"
                                    :key="index"
                                    :class="isActiveSystem === index ? 'active' : ''"
                                    @click="setActiveTab(index, 'isActiveSystem')"
                            >
                                {{ system.title }}
                            </div>
                        </div>
                    </div>
                    <div class="theme-index">
                        <div class="classify-them-left">分层</div>
                        <div class="classify-right-out">
                            <div
                                    class="classify-right"
                                    v-for="(layered, index) in layereds"
                                    :class="isActiveLayered === index ? 'active' : ''"
                                    @click="setActiveTab(index, 'isActiveLayered')"
                                    :key="index"
                            >
                                {{ layered.title }}
                            </div>
                        </div>
                    </div>
                    <div class="theme-index">
                        <div class="classify-them-left">接入时间</div>
                        <div class="classify-right-out">
                            <div
                                    class="classify-right"
                                    v-for="(time, index) in accessTime"
                                    :class="isActiveTime === index ? 'active' : ''"
                                    @click="setActiveTab(index, 'isActiveTime')"
                                    :key="index"
                            >
                                {{ time.title }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="data-list">
                    <dataBrowsingDetails></dataBrowsingDetails>
                </div>
            </div>
            <!--      右侧-->
            <div class="right-container">
                <el-card class="query-card">
                    <div slot="header" class="card-clearfix">
                        <span style="font-weight: bold">大家都在查></span>
                        <el-button class="query-card-change"
                                type="text"
                                icon="el-icon-refresh-right"
                        >
                            换一换
                        </el-button>
                    </div>
                    <div v-for="(searchItem,index) in searchItems" :key="index" class="query-card-text">
                        <div v-if="index === 0">
                            <div class="hot-number top">
                                <li class="el-icon-top" style="color: #cc0000"></li>
                            </div>
                            <div class="hot-text">{{searchItem.message}}</div>
                        </div>
                        <div v-if="index === 1">
                            <div class="hot-number one">{{index}}</div>
                            <div class="hot-text">{{searchItem.message}}</div>
                        </div>
                        <div v-if="index === 2">
                            <div class="hot-number two">{{index}}</div>
                            <div class="hot-text">{{searchItem.message}}</div>
                        </div>
                        <div v-if="index === 3">
                            <div class="hot-number three">{{index}}</div>
                            <div class="hot-text">{{searchItem.message}}</div>
                        </div>
                        <div v-if="index > 3 ">
                            <div class="hot-number other-number">{{index}}</div>
                            <div class="hot-text">{{searchItem.message}}</div>
                        </div>
                    </div>

                </el-card>
            </div>
        </div>
    </div>
</template>

<script>
    import queryTags from "@/components/queryTags";
    import dataBrowsingDetails from "./dataBrowsingDetails.vue";

    export default {
        name: "dataBrowsing",
        components: {
            queryTags,
            dataBrowsingDetails,
        },
        props: [],
        data() {
            return {
                dataSearchImg: require("@/assets/img/search_logo.png"),
                dropDownData: ["测试", "测试11111"],
                //业务主题
                BusinessTopics: [
                    {
                        title: "基金主题",
                    },
                    {
                        title: "理财主题",
                    },
                    {
                        title: "客户主题",
                    },
                    {
                        title: "电子渠道",
                    },
                    {
                        title: "财务主题",
                    },
                ],
                //业务系统
                BusSystems: [
                    {
                        title: "信贷系统",
                    },
                    {
                        title: "信贷",
                    },
                    {
                        title: "企业客户",
                    },
                    {
                        title: "总账系统",
                    },
                    {
                        title: "理财系统",
                    },
                    {
                        title: "卡系统",
                    },
                    {
                        title: "基金",
                    },
                    {
                        title: "网银",
                    },
                    {
                        title: "商户管理",
                    },
                    {
                        title: "票据系统",
                    },
                    {
                        title: "资金系统",
                    },
                    {
                        title: "国结",
                    },
                    {
                        title: "信用卡",
                    },
                    {
                        title: "抵质押系",
                    },
                    {
                        title: "托管系统",
                    },
                    {
                        title: "资产托管",
                    },
                    {
                        title: "外部数据",
                    },
                    {
                        title: "金融基础数据",
                    },
                ],
                //分层
                layereds: [
                    {
                        title: "审计标准数据",
                    },
                    {
                        title: "业务原始数据",
                    },
                    {
                        title: "审计中间数据",
                    },
                ],
                //接入时间
                accessTime: [
                    {
                        title: "近一月",
                    },
                    {
                        title: "近三月",
                    },
                    {
                        title: "近半年",
                    },
                    {
                        title: "近一年",
                    },
                ],
                //分类类型
                isActiveTopic: "",
                isActiveSystem: "",
                isActiveLayered: "",
                isActiveTime: "",

                //右侧搜索循环数组
                searchItems: [{
                    message: "查询条件",
                }, {
                    message: "查询条件",
                }, {
                    message: "查询条件",
                }, {
                    message: "查询条件",
                }, {
                    message: "查询条件",
                }, {
                    message: "查询条件",
                }, {
                    message: "查询条件",
                }, {
                    message: "查询条件",
                }, {
                    message: "查询条件",
                }, {
                    message: "查询条件",
                }],
            };
        },
        computed: {},
        watch: {},
        mounted() {
            console.log(this.dataSearchImg);
        },
        methods: {
            onChange(data) {
                console.log(data, "data");
            },
            setActiveTab(value, type) {
                if (type === "isActiveTopic") {
                    this.isActiveTopic = value;
                }
                if (type === "isActiveSystem") {
                    this.isActiveSystem = value;
                }
                if (type === "isActiveLayered") {
                    this.isActiveLayered = value;
                }
                if (type === "isActiveTime") {
                    this.isActiveTime = value;
                }
            },
        },
    };
</script>

<style lang="scss" scoped>
    .page-container-first {
        min-width: 1300px;
        display: flex;
        padding: 0px !important;
        flex-direction: column;
    }

    /*搜索部分*/
    .top-container {
        width: 100%;
    }

    /*下部页面*/
    .under-container {
        display: flex;
        justify-content: space-evenly;
    }

    /*左侧容器*/
    .left-container {
        width: 80%;
        height: 100%;
        flex-direction: column;
    }

    /*分类*/
    .categorical-index {
        width: 100%;
        background: white;
        margin-bottom: 10px;
    }

    /*分类主题部分*/
    .theme-index {
        width: 100%;
        height: 100%;
        display: flex;
        padding: 10px;
        border-bottom: 1px solid #ededed;
    }

    /*分类主题*/
    .classify-them-left {
        display: inline-block;
        font-weight: bold;
        width: 6%;
        margin-right: 8px;
        text-align: right;
        justify-content: flex-start;
        padding-left: 10px;
    }

    .classify-right-out {
        width: 90%;
    }

    /*右侧分类部分*/
    .classify-right {
        display: inline-block;
        margin-right: 20px;
    }

    /*分层之后 左侧展示数据的div*/
    .data-list {
        flex-direction: column;
        background: white;
        height: calc(100vh - 400px);
        overflow: auto;
    }

    /*右侧*/
    .right-container {
        flex: 1;
        padding-left: 20px;
        padding-right: 20px;
    }

    /*查询*/
    .query-top-img {
        background: white;
        text-align: center;
        width: 100%;
    }

    /*右侧查询卡片*/
    .query-card {
        width: 300px;
        max-height: 400px;
    }

    /*右侧查询信息文本样式*/
    .query-card-text {
        font-size: 16px;
        line-height: 20px;
        color: blue;
        height: 30px;
    }

    .card-clearfix:before,
    .card-clearfix:after {
        display: table;
        content: "";
    }

    .card-clearfix:after {
        clear: both;
    }

    .active {
        color: #677ccd;
        background: #e7ecff;
    }

    .query-card-change {
        float: right;
        padding: 1px;
        color: gray;
        font-weight: normal;
    }
    /*数字*/
    .hot-number {
        display: inline-block;
        width: 22px;
        height: 18px;
        padding-left: 3px;
    }

    .top {
        width: 22px;
        height: 18px;
        padding-left: 0 !important;
    }

    .one {
        color: #FE2D46;
    }

    .two {
        color: #F60;
    }

    .three {
        color: #FAA90E;
    }

    .other-number {
        color: #9195A3;
    }
    /*文本*/
    .hot-text {
        display: inline-block;
        cursor: pointer;
        width: 230px;
    }

    /*鼠标滑过加下划线*/
    .hot-text:hover {
        text-decoration: underline;
    }

</style>
