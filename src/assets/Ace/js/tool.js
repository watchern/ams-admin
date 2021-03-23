export default {
  setTableCellRender(params) {
    var eDiv = document.createElement('div');
    eDiv.innerHTML =
      `<div class='ace-progress-bar'>
        <div class='ace-progress-bar-inner animated lightSpeedIn' style='width:${params.value.width}%; background: ${params.value.color}'>
          <span class='ace-bar-val' style='background: ${params.value.color}'>
            ${params.value.width}%
            <i class='ace-bar-val-dian' style='border-top-color:${params.value.color}'></i>
          </span>
        </div>
      </div>`;
    return eDiv;
  }
}
