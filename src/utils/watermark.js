let watermark = {}

let setWatermark = (str,str1,str2) => {
  let id = '1.23452384164.123412416';
  var container = document.body;
  if (document.getElementById(id) !== null) {
    document.body.removeChild(document.getElementById(id));
  }

  //创建一个画布
  let can = document.createElement('canvas');
  //设置画布的长宽
  can.width = 750;
  can.height = 500;

  let cans = can.getContext('2d');
  //旋转角度
  cans.rotate(-15 * Math.PI / 180);
  cans.font = '18px Vedana';
  //设置填充绘画的颜色、渐变或者模式
  cans.fillStyle = 'rgba(200, 200, 200, 0.40)';
  //设置文本内容的当前对齐方式
  cans.textAlign = 'left';
  //设置在绘制文本时使用的当前文本基线
  cans.textBaseline = 'Middle';
  //在画布上绘制填色的文本（输出的文本，开始绘制文本的X坐标位置，开始绘制文本的Y坐标位置）
  cans.fillText(str, 50, 50);
  cans.fillText(str1, 50, 100);
  cans.fillText(str2, 50, 150);

  cans.fillText(str, 100, 300);
  cans.fillText(str1, 100, 350);
  cans.fillText(str2, 100, 400);

  cans.fillText(str, 400, 150);
  cans.fillText(str1, 400,200);
  cans.fillText(str2, 400, 250);

  cans.fillText(str, 450, 400);
  cans.fillText(str1, 450,450);
  cans.fillText(str2, 450, 500);

  const wmInstance = document.querySelector('.__wm');
  let div = wmInstance || document.createElement('div');
  div.id = id;
  div.contentEditable='false';
  let styleStr = `
		top:30px;
		left:0px;
		width:100%;
		height:100%;
		position:fixed;
		z-index:100000;
		pointer-events:none;
		background-repeat:repeat;
		background:url('${can.toDataURL('image/png')}') left top repeat`;
  // div.style.pointerEvents = 'none';
  // div.style.top = '30px';
  // div.style.left = '0px';
  // div.style.position = 'fixed';
  // div.style.zIndex = '100000';
  // div.style.width = document.documentElement.clientWidth + 'px';
  // div.style.height = document.documentElement.clientHeight + 'px';
  // div.style.background = 'url(' + can.toDataURL('image/png') + ') left top repeat';
  div.setAttribute('style', styleStr);
  div.classList.add('__wm');
  document.body.appendChild(div);
  let MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  if (MutationObserver) {
    let mo = new MutationObserver(() => {
      const wmInstance = document.querySelector('.__wm');
      // 只在wmInstance元素变动才重新调用 setWatermark
      if ((wmInstance && wmInstance.getAttribute('style') != styleStr) || !wmInstance) {
        // 避免一直触发
        mo.disconnect();
        mo = null;
        setWatermark(str,str1,str2)
      }
    });

    mo.observe(div, {
      attributes: true,
      subtree: true,
      childList: true,
    });
  }
  return id;
}


// 该方法只允许调用一次
watermark.set = (str,str1,str2) => {
  let id = setWatermark(str,str1,str2);
  setInterval(() => {
    if (document.getElementById(id) === null) {
      id = setWatermark(str,str1,str2);
    }
  }, 500);
  window.onresize = () => {
    setWatermark(str,str1,str2);
  };
}

export default watermark;
