import request from '@/utils/request'


const baseURL = '/base'

export function login(data) {
  return request({
    baseURL: baseURL,
    url: '/login',
    method: 'post',
    data
  })
}
export function repass(data) {
  return request({
    baseURL: baseURL,
    url: '/updatePassword',
    method: 'post',
    data
  })
}
export function getInfo() {
  return request({
    baseURL: baseURL,
    url: '/userInfo',
    method: 'get',
    params: { }
  })
}

// 根据用户ID判断是否是管理员用户
export function isAdmin() {
  return request({
    baseURL: baseURL,
    url: '/sysRole/isAdmin',
    method: 'get'
  })
}
export function getUserRes() {
  return request({
    baseURL: baseURL,
    url: '/menu/index',
    method: 'post'
  })
}
export function logout() {
  return request({
    baseURL: baseURL,
    url: '/logout',
    method: 'post'
  })
}
// 获取系统管理员
export function getSystemRole(name) {
  return request({
    baseURL: baseURL,
    url: `/sysRole/getByName/${name}`,
    method: 'get'
  })
}
// 获取用户IP
export function getPersonIp() {
  return request({
    baseURL: baseURL,
    url: `/personController/getPersonIp`,
    method: 'get'
  })
}

export function redisGetToken() {
  // console.log('cans',cans())
  return request({
    baseURL: baseURL,
    url: `/redisGetToken`,
    method: 'get',
    params: {key: cans()}
  })
}

export function getUserInfo() {
  return request({
    baseURL: baseURL,
    url: '/userInfo',
    method: 'get',
    params: { }
  })
}

function cans() {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var txt = 'http://security.tencent.com/';
  ctx.textBaseline = "top";
  ctx.font = "14px 'Arial'";
  ctx.textBaseline = "tencent";
  ctx.fillStyle = "#f60";
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = "#069";
  ctx.fillText(txt, 2, 15);
  ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
  ctx.fillText(txt, 4, 17);

  var b64 = canvas.toDataURL().replace("data:image/png;base64,", "");
  var bin = atob(b64);
  var crc = bin2hex(bin.slice(-16, -12));
  //var crc = bin.slice(-16,-12);
  return crc;
}

function bin2hex(str) {
  var result = "";
  for (var i = 0; i < str.length; i++) {
    result += int16_to_hex(str.charCodeAt(i));
  }
  return result;
}

function int16_to_hex(i) {
  var result = i.toString(16);
  var j = 0;
  while (j + result.length < 4) {
    result = "0" + result;
    j++;
  }
  return result;
}
