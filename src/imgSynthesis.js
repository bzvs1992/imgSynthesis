// canvas图片合并类
// 传入参数只有src是必填，其他都可以不填，定位默认0，0
// 20190328  maning
/*
  @width:Number //canvas宽度
  @height:Number //canvas高度
  @txt:object //合成文本
      @text:String 合成内容
      @x:Number //x轴
      @y:Number //y轴
      @width:Number //文本的宽度
      @size:24 文本字号
      @color:'#000' //颜色
      @writingMode:'td' //文字竖排显示，默认横排
  @img:Array //合并图片数组
      @x:Number //图片x轴
      @y:Number //图片y轴
      @src:String //图片地址(必填)
*/

class imgSynthesis{
  constructor(){
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext('2d');
  }
  async set({width=640,height=1236,txt=null,img}){
    this.canvas.width = width;
    this.canvas.height = height;
    // console.log(txt);
      for(let i of img){ 
        let img_bg = new Image();
        img_bg.setAttribute('crossOrigin', 'anonymous');
        await  new Promise((resolve,reject)=>{
          if(i.src){
            img_bg.onload = ()=>{
              let {x=0,y=0} = i;
              if(i.width!=undefined){
                this.ctx.drawImage(img_bg,x,y,i.width,i.height);
              }else{
                this.ctx.drawImage(img_bg,x,y);
              }
              
              resolve();
            }
            img_bg.src=i.src;
          }else{
            reject('缺少src参数');
          }
          
        })
      }
      this.setText();
      for(let i of txt){ 
        console.log(i);
        let {text=null,size='24px',width=156,color='#000000',x=0,y=0,writingMode=''} = i;
        this.ctx.font = size+" bold Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "bottom";
        this.ctx.fillStyle = color;
        // console.log(writingMode);
        if(writingMode=='td'){
          this.ctx.fillTextVertical(String(text), x, y);
        }else{
          let MeasureWrapTextHeight = this.ctx.MeasureWrapTextHeight(text,width,size);
          this.ctx.wrapText(String(text),x,y,width,size);
        }
        
      }
      return this.canvas.toDataURL();
    };
  //文字设置 kongdejian
  setText(){
    // canvas 文字换行
    CanvasRenderingContext2D.prototype.wrapText = function(
      text,
      x,
      y,
      maxWidth,
      lineHeight
    ) {
      if (typeof text != "string" || typeof x != "number" || typeof y != "number") {
        return;
      }
      const context = this;
      const canvas = context.canvas;
      if (typeof maxWidth == "undefined") {
        maxWidth = (canvas && canvas.width) || 300;
      }
      if (typeof lineHeight == "undefined") {
        lineHeight =
          (canvas && parseInt(window.getComputedStyle(canvas).lineHeight)) ||
          parseInt(window.getComputedStyle(document.body).lineHeight);
      }
      // 字符分隔为数组
      let arrText = text.split("");
      let line = "";
      for (let n = 0; n < arrText.length; n++) {
        const testLine = line + arrText[n];
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          context.fillText(line, x, y);
          line = arrText[n];
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      context.fillText(line, x, y);
    };
    // 测量文字高度
    CanvasRenderingContext2D.prototype.MeasureWrapTextHeight = function(
      text,
      maxWidth,
      lineHeight
    ) {
      if (typeof text != "string") {
        return;
      }
      const context = this;
      const canvas = context.canvas;
      if (typeof maxWidth == "undefined") {
        maxWidth = (canvas && canvas.width) || 300;
      }
      if (typeof lineHeight == "undefined") {
        lineHeight =
          (canvas && parseInt(window.getComputedStyle(canvas).lineHeight)) ||
          parseInt(window.getComputedStyle(document.body).lineHeight);
      }
      let strHeight = lineHeight;

      // 字符分隔为数组
      let arrText = text.split("");
      let line = "";
      for (let n = 0; n < arrText.length; n++) {
        const testLine = line + arrText[n];
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          line = arrText[n];
          strHeight += lineHeight;
        } else {
          line = testLine;
        }
      }
      return strHeight;
    };

  

  /**
   * 文本竖排显示
  * @author zhangxinxu(.com)
  * @licence MIT
  * @description http://www.zhangxinxu.com/wordpress/?p=7362
  */
  CanvasRenderingContext2D.prototype.fillTextVertical = function (text, x, y) {
    let context = this;
    let canvas = context.canvas;
    
    let arrText = text.split('');
    let arrWidth = arrText.map(function (letter) {
        return context.measureText(letter).width;
    });
    
    let align = context.textAlign;
    let baseline = context.textBaseline;
    
    if (align == 'left') {
        x = x + Math.max.apply(null, arrWidth) / 2;
    } else if (align == 'right') {
        x = x - Math.max.apply(null, arrWidth) / 2;
    }
    if (baseline == 'bottom' || baseline == 'alphabetic' || baseline == 'ideographic') {
        y = y - arrWidth[0] / 2;
    } else if (baseline == 'top' || baseline == 'hanging') {
        y = y + arrWidth[0] / 2;
    }
    
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // 开始逐字绘制
    arrText.forEach(function (letter, index) {
        // 确定下一个字符的纵坐标位置
        let letterWidth = arrWidth[index];
        // 是否需要旋转判断
        let code = letter.charCodeAt(0);
        if (code <= 256) {
            context.translate(x, y);
            // 英文字符，旋转90°
            context.rotate(90 * Math.PI / 180);
            context.translate(-x, -y);
        } else if (index > 0 && text.charCodeAt(index - 1) < 256) {
            // y修正
            y = y + arrWidth[index - 1] / 2;
        }
        context.fillText(letter, x, y);
        // 旋转坐标系还原成初始态
        context.setTransform(1, 0, 0, 1, 0, 0);
        // 确定下一个字符的纵坐标位置
        let letterWidth2 = arrWidth[index];
        y = y + letterWidth2;
    });
    // 水平垂直对齐方式还原
    context.textAlign = align;
    context.textBaseline = baseline;
  };
  }
}
module.exports  = imgSynthesis;