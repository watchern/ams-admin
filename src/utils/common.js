export const DataTypeRules = {
    CHAR: {value: "CHAR", lengthRule: "^[0-9]{1,4000}$", checkMsg: "类型长度范围:1-4000之间数字"},
    VARCHAR2: {value: "VARCHAR2", lengthRule: "^[0-9]{1,4000}$", checkMsg: "类型长度范围:1-4000之间数字"},
    VARCHAR: {value: "VARCHAR", lengthRule: "^[0-9]{1,4000}$", checkMsg: "类型长度范围:1-4000之间数字"},
    NVARCHAR: {value: "NVARCHAR", lengthRule: "^[0-9]{1,4000}$", checkMsg: "类型长度范围:1-4000之间数字"},
    NVARCHAR2: {value: "NVARCHAR2", lengthRule: "^[0-9]{1,4000}$", checkMsg: "类型长度范围:1-4000之间数字"},
    NUMBER: {value: "NUMBER", hasPrecision: true, lengthRule: "^[0-9]+[,][0-9]$", checkMsg: "类型长度范围:数字,数字(英文逗号)"},
    NUMRIC: {value: "NUMRIC", hasPrecision: true, lengthRule: "^[0-9]+[,][0-9]$", checkMsg: "类型长度范围:数字,数字(英文逗号)"},
    DECIMAL: {value: "DECIMAL", hasPrecision: true, lengthRule: "^[0-9]+[,][0-9]$", checkMsg: "类型长度范围:数字,数字(英文逗号)"},
    INTEGER: {value: "INTEGER", lengthRule: "^[0-9]{1,11}$", checkMsg: "类型长度范围:最长11位长度数字"},
    INT: {value: "INT", lengthRule: "^[0-9]{1,11}$", checkMsg: "类型长度范围:最长11位长度数字"},
    TINYINT: {value: "TINYINT", lengthRule: "^[0-9]{1,3}$", checkMsg: "类型长度范围:最长3位长度数字"},
    SMALLINT: {value: "SMALLINT", lengthRule: "^[0-9]{1,5}$", checkMsg: "类型长度范围:最长5位长度数字"},
    BIGINT: {value: "SMALLINT", lengthRule: "^[0-9]{1,20}$", checkMsg: "类型长度范围:最长5位长度数字"},
    DOUBLE: {value: "DOUBLE", enableDataLength: false},
    FLOAT: {value: "FLOAT", enableDataLength: false},
    TIMESTAMP: {value: "TIMESTAMP", enableDataLength: false},
    DATE: {value: "DATE", enableDataLength: false},
    TIME: {value: "TIME", enableDataLength: false},
    CLOB: {value: "CLOB", enableDataLength: false},
    BLOB: {value: "BLOB", enableDataLength: false},
    TEXT: {value: "TEXT", enableDataLength: false}
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
    isUndefined,
    isNotUndefined,
    isEmpty,
    isNotEmpty,
    isNotBlank,
    isBlank
}