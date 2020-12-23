/**
 * 移除js或css
 * @param filename 要移除的文件名
 * @param filetype 文件类型
 */
export function removeJcCssfile(filename,filetype){
  var targetelement=(filetype=="js")? "script" :(filetype=="css")? "link" : "none"
  var targetattr=(filetype=="js")?"src" : (filetype=="css")? "href" :"none"
  var allsuspects=document.getElementsByTagName(targetelement)
  for (var i=allsuspects.length; i>=0;i--){
    if (allsuspects[i] &&allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1)
      allsuspects[i].parentNode.removeChild(allsuspects[i])
  }
}

/**
 * 动态添加css文件
 * @param href 路径
 * @param id 添加的id
 */
export function addCssFile(href,id){
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.id = id;
    document.body.appendChild(link);
  }
}

/**
 * 动态添加Js文件
 * @param src 路径
 * @param id 添加的id
 */
export function addJsFile(src,id){
  if (!document.getElementById(id)) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.id = id;
    document.body.appendChild(script);
  }
}
