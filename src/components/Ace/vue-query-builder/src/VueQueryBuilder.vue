<template>
    <div class="vue-query-builder">
        <slot v-bind="vqbProps">
            <query-builder-group
                    v-bind="vqbProps"
                    :query.sync="query"
            />
        </slot>
    </div>
</template>

<script>
    /* eslint-disable vue/require-default-prop */
    import QueryBuilderGroup from './layouts/Bootstrap/BootstrapGroup.vue';
    import deepClone from './utilities.js';
    var defaultLabels = {
        matchType: "关系符",
        matchTypes: [
            {"id": "or", "label": "or"},
            {"id": "and", "label": "and"},
        ],
        addRule: "添加条件",
        removeRule: "&times;",
        addGroup: "添加条件组",
        removeGroup: "&times;",
        textInputPlaceholder: "value",
    };

    export default {
        name: 'VueQueryBuilder',

        components: {
            QueryBuilderGroup
        },

        props: {
            rules: Array,
            labels: {
                type: Object,
                default() {
                    return defaultLabels;
                }
            },
            maxDepth: {
                type: Number,
                default: 3,
                validator: function (value) {
                    return value >= 1
                }
            },
            value: Object
        },

        data() {
            return {
                query: {
                    logicalOperator: this.labels.matchTypes[0].id,
                    children: []
                },
                ruleTypes: {
                    "text": {
                        operators: ['equals', 'does not equal', 'contains', 'does not contain', 'is empty', 'is not empty', 'begins with', 'ends with'],
                        inputType: "text",
                        id: "text-field"
                    },
                    "numeric": {
                        operators: ['=', '<>', '<', '<=', '>', '>='],
                        inputType: "number",
                        id: "number-field"
                    },
                    "custom": {
                        operators: [],
                        inputType: "text",
                        id: "custom-field"
                    },
                    "radio": {
                        operators: ['='],
                        choices: [],
                        inputType: "radio",
                        id: "radio-field"
                    },
                    "checkbox": {
                        operators: [],
                        choices: [],
                        inputType: "checkbox",
                        id: "checkbox-field"
                    },
                    "select": {
                        operators: [],
                        choices: [],
                        inputType: "select",
                        id: "select-field"
                    },
                    "multi-select": {
                        operators: ['='],
                        choices: [],
                        inputType: "select",
                        id: "multi-select-field"
                    },
                },
                sql: ''
            }
        },

        computed: {
            mergedLabels() {
                return Object.assign({}, defaultLabels, this.labels);
            },

            mergedRules() {
                var mergedRules = [];
                var vm = this;

                vm.rules.forEach(function (rule) {
                    if (typeof vm.ruleTypes[rule.type] !== "undefined") {
                        mergedRules.push(Object.assign({}, vm.ruleTypes[rule.type], rule));
                    } else {
                        mergedRules.push(rule);
                    }
                });

                return mergedRules;
            },

            vqbProps() {
                return {
                    index: 0,
                    depth: 1,
                    maxDepth: this.maxDepth,
                    ruleTypes: this.ruleTypes,
                    rules: this.mergedRules,
                    labels: this.mergedLabels
                }
            }
        },

        mounted() {
            this.$watch(
                'query',
                newQuery => {
                    if (JSON.stringify(newQuery) !== JSON.stringify(this.value)) {
                        this.$emit('input', deepClone(newQuery));
                        //2020年9月29日 10:32:58  ZhangSiWeiG
                        this.$emit('sql', this.queryToSql(newQuery));
                    }
                }, {
                    deep: true
                });

            this.$watch(
                'value',
                newValue => {
                    if (JSON.stringify(newValue) !== JSON.stringify(this.query)) {
                        this.query = deepClone(newValue);
                    }
                }, {
                    deep: true
                });

            if (typeof this.$options.propsData.value !== "undefined") {
                this.query = Object.assign(this.query, this.$options.propsData.value);
            }
        },
      //2020年9月29日 10:32:58  ZhangSiWeiG
        methods: {
            queryToSql(query) {
                var sql = [];
                var that = this;
                var logicalOperator = query.logicalOperator;
                var children = query.children;
                children.forEach((child) => {
                    var type = child.type;
                    if (type === 'query-builder-rule') {
                        sql.push(child.query.rule);
                        sql.push(child.query.operator);
                        sql.push(child.query.value);
                    } else {
                        sql.push('(');
                        sql.push(that.queryToSql(child.query));
                        sql.push(')');
                    }
                    sql.push(logicalOperator);
                })
                sql.splice(sql.length - 1, sql.length);
                return sql.join(' ');
            }
        }
    }
</script>
