export const move = {
  mounted(el: any, binding: any) {
    el.onmousedown = function (e: any) {
      const init = -e.clientY;
      console.log('init', init);
      const parent = document.getElementsByClassName(binding.value)[0] as HTMLElement;
      const initHeight = parent.offsetHeight;
      document.onmousemove = function (e) {
        const end = -e.clientY;
        // end - init表示鼠标移动的距离
        // end为鼠标移动的宽度,可用于设置最小宽度
        // console.log(end)
        // if(end > -250){
        let newHeight = end - init + initHeight;
        newHeight < 242 && (newHeight = 242)
        parent.style.height = newHeight + "px";
        // }else{
        //   end = -250;
        //   // 最小宽度242
        //   parent.style.height = 242 + "px";
        // }
      };
      document.onmouseup = function () {
        document.onmousemove = document.onmouseup = null;
      };
    };
  }
}