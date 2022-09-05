export const DataTypeRules = {
    // CHAR: {value: "CHAR", lengthRule: "^[0-9]{1,4000}$", checkMsg: "类型长度范围:1-4000之间数字"},
    // VARCHAR2: {value: "VARCHAR2", lengthRule: "^[1-9][0-9]{0,3}$", checkMsg: "类型长度范围:1-4000之间数字"},
    // VARCHAR: {value: "VARCHAR", lengthRule: "^[1-9][0-9]{0,3}$", checkMsg: "类型长度范围:1-4000之间数字"},
    // NVARCHAR: {value: "NVARCHAR", lengthRule: "^[1-9][0-9]{0,3}$", checkMsg: "类型长度范围:1-4000之间数字"},
    // NVARCHAR2: {value: "NVARCHAR2", lengthRule: "^[1-9][0-9]{0,3}$", checkMsg: "类型长度范围:1-4000之间数字"},
    // NUMBER: {value: "NUMBER", hasPrecision: true, lengthRule: "^[0-9]+[,][0-9]$", checkMsg: "类型长度范围:数字,数字(英文逗号)"},
    // NUMRIC: {value: "NUMRIC", hasPrecision: true, lengthRule: "^[0-9]+[,][0-9]$", checkMsg: "类型长度范围:数字,数字(英文逗号)"},
    // DECIMAL: {value: "DECIMAL", hasPrecision: true, lengthRule: "^[0-9]+[,][0-9]$", checkMsg: "类型长度范围:数字,数字(英文逗号)"},
    // TINYINT: {value: "TINYINT", lengthRule: "^[1-9][0-9]{0,2}$", checkMsg: "类型长度范围:最长3位长度数字"},
    // SMALLINT: {value: "SMALLINT", lengthRule: "^[1-9][0-9]{0,4}$", checkMsg: "类型长度范围:最长5位长度数字"},
    // BIGINT: {value: "BIGINT", lengthRule: "^[1-9][0-9]{0,19}$", checkMsg: "类型长度范围:最长20位长度数字"},
    DOUBLE: {value: "DOUBLE", enableDataLength: false},
    FLOAT: {value: "FLOAT", enableDataLength: false},
    TIMESTAMP: {value: "TIMESTAMP", enableDataLength: false},
    TIMESTMP: {value: "TIMESTMP", enableDataLength: false},
    DATETIME: {value: "DATETIME", enableDataLength: false},
    DATE: {value: "DATE", enableDataLength: false},
    TIME: {value: "TIME", enableDataLength: false},
    CLOB: {value: "CLOB", enableDataLength: false},
    BLOB: {value: "BLOB", enableDataLength: false},
    TEXT: {value: "TEXT", enableDataLength: false},
    //MYSQL库中不需要设置以下两种数据类型的长度（INTEGER,INT）
    INTEGER: {value: "INTEGER", enableDataLength: false},
    INT: {value: "INT", enableDataLength: false},
}

//数据资源目录的导入功能所需的数据规则
export const DataTypeRulesImport = {
    CHAR: {value: "CHAR", lengthRule: "^[0-9]{1,4000}$", checkMsg: "类型长度范围:1-4000之间数字"},
    VARCHAR2: {value: "VARCHAR2", lengthRule: "^[1-9][0-9]{0,3}$", checkMsg: "类型长度范围:1-4000之间数字"},
    VARCHAR: {value: "VARCHAR", lengthRule: "^[1-9][0-9]{0,3}$", checkMsg: "类型长度范围:1-4000之间数字"},
    NVARCHAR: {value: "NVARCHAR", lengthRule: "^[1-9][0-9]{0,3}$", checkMsg: "类型长度范围:1-4000之间数字"},
    NVARCHAR2: {value: "NVARCHAR2", lengthRule: "^[1-9][0-9]{0,3}$", checkMsg: "类型长度范围:1-4000之间数字"},
    NUMBER: {value: "NUMBER", hasPrecision: true, lengthRule: "^[0-9]+[,][0-9]$", checkMsg: "类型长度范围:数字,数字(英文逗号)"},
    NUMRIC: {value: "NUMRIC", hasPrecision: true, lengthRule: "^[0-9]+[,][0-9]$", checkMsg: "类型长度范围:数字,数字(英文逗号)"},
    DECIMAL: {value: "DECIMAL", hasPrecision: true, lengthRule: "^[0-9]+[,][0-9]$", checkMsg: "类型长度范围:数字,数字(英文逗号)"},
    TINYINT: {value: "TINYINT", lengthRule: "^[1-9][0-9]{0,2}$", checkMsg: "类型长度范围:最长3位长度数字"},
    SMALLINT: {value: "SMALLINT", lengthRule: "^[1-9][0-9]{0,4}$", checkMsg: "类型长度范围:最长5位长度数字"},
    BIGINT: {value: "BIGINT", lengthRule: "^[1-9][0-9]{0,19}$", checkMsg: "类型长度范围:最长20位长度数字"},
    DOUBLE: {value: "DOUBLE", enableDataLength: false},
    FLOAT: {value: "FLOAT", enableDataLength: false},
    TIMESTAMP: {value: "TIMESTAMP", enableDataLength: false},
    TIMESTMP: {value: "TIMESTMP", enableDataLength: false},
    DATETIME: {value: "DATETIME", enableDataLength: false},
    DATE: {value: "DATE", enableDataLength: false},
    TIME: {value: "TIME", enableDataLength: false},
    CLOB: {value: "CLOB", enableDataLength: false},
    BLOB: {value: "BLOB", enableDataLength: false},
    TEXT: {value: "TEXT", enableDataLength: false},
    //MYSQL库中不需要设置以下两种数据类型的长度（INTEGER,INT）
    INTEGER: {value: "INTEGER", enableDataLength: false},
    INT: {value: "INT", enableDataLength: false},
}

//"SAVE_TO_FOLDER", "FETCH_TABLE_DATA", "BASIC_PRIV", "PRIVS_INHERITED"
export const DataPrivAccessType = {
    // 向下继承
    PRIVS_INHERITED: {value:"PRIVS_INHERITED"},
    // 预览数据权限
    FETCH_TABLE_DATA:{value:"FETCH_TABLE_DATA"},
    // 文件夹的数据表保存权限，例如：模型结果保存可选的文件夹、复制表
    SAVE_TO_FOLDER :{value:"SAVE_TO_FOLDER"},
    // 能看到的权限，基础权限
    BASIC_PRIV :{value:"BASIC_PRIV"}
}

export function isUndefined(val) {
    return typeof val === "undefined";
}
export function isNotUndefined(val) {
    return !isUndefined(val)
}

// 空格不为空
export function isEmpty(val) {
    if (isUndefined(val) || val == null) {
        return true;
    }
    return val.length === 0
}
export function isNotEmpty(val) {
    return !isEmpty(val)
}

// 空格为空
export function isBlank(val) {
    if (isUndefined(val) || val == null) {
        return true;
    }
    if (isEmpty(val)) {
        return true
    } else {
        return val instanceof String ? val.trim().length == 0 : false
    }
}
export function isNotBlank(val) {
    return !isBlank(val)
}

export default {
    DataTypeRules,
    DataTypeRulesImport,
    DataPrivAccessType,
    isUndefined,
    isNotUndefined,
    isEmpty,
    isNotEmpty,
    isNotBlank,
    isBlank
}