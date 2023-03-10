# ams-admin

## npm源设置
````
npm config set registry http://139.159.246.94:1057/repository/npm-group/
````

## 前端依赖下载
```
npm install
npx -p npm@6 npm i --legacy-peer-deps(npm install执行失败可执行)
```

###启动命令，注：.env.development文件不在git中，可从bak.env.development中获取
```
npm run dev
```

### 打包命令
```
npm run hx
```

### 后端使用分支
```
hx_etl
无hx_etl分支的统一用dev2
```
### 前端使用分支(hx)
### 系统名称配置（启动打包需指定）
```
VUE_APP_BASE_NAME = '审计管理系统'
```
### 登录页配置(启动打包需指定)
```
VUE_APP_BASE_SKINCONTROL = 'old-login'
```
### 皮肤配置(启动打包需指定)
```
VUE_APP_BASE_SKIN = 'update-blue'
```
#首页配置 first旧版首页
```
VUE_APP_INDEX_PAGE = 'first'
```

# 获取token配置 login和redis两种方式
```
VUE_APP_TOKEN_GET_TYPE = 'login'
```
