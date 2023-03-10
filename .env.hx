# just a flag
ENV = 'production'

################ 系统名称   ##########################################
VUE_APP_BASE_NAME = '审计系统'
####################################################################

# base api
VUE_APP_BASE_API = '/r1'
VUE_CLI_BABEL_TRANSPILE_MODULES = true

#############   WEBSOCKET       ####################################
# WS配置两中方式: client、config, 默认client，从浏览器访问路径获取
VUE_APP_WEBSOCKETTYPE='client'
# websocket
VUE_APP_ANALYSIS_WEB_SOCKET = 'ws://139.159.246.94:99/websocket?'
VUE_APP_GRAPHTOOL_WEB_SOCKET = 'ws://139.159.246.94:99/websocket?'
VUE_APP_BASE_WEB_SOCKET = 'ws://139.159.246.94:99/websocket?'
VUE_APP_INDICATOR_WEB_SOCKET = 'ws://139.159.246.94:99/websocket?'
####################################################################


################   换肤   ##########################################
# VUE_APP_BASE_SKIN = 'default'
# VUE_APP_BASE_SKIN = 'grail-blue'
VUE_APP_BASE_SKIN = 'update-blue'
# VUE_APP_BASE_SKIN = 'haian-blue'

################   TOKEN获取方式 login登录获取 redis无登录页，直接从库里获取  ###############
VUE_APP_TOKEN_GET_TYPE = 'login'
#VUE_APP_TOKEN_GET_TYPE = 'redis'
####################################################################

################   菜单   ##########################################
VUE_APP_BASE_MENU = 'withmenu'
#VUE_APP_BASE_MENU = 'withoutmenu'
####################################################################

#登录页配置 new-login 为右侧登录配标题文字 old-login 为中间登录 lh-login为龙华的登录页
VUE_APP_BASE_SKINCONTROL = 'old-login'
#VUE_APP_BASE_SKINCONTROL = 'new-login'

#首页配置 first旧版首页，first-show 96首页
VUE_APP_INDEX_PAGE = 'first'
#VUE_APP_INDEX_PAGE = 'first-show'
