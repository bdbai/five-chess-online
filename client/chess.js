var socket = io.connect('dd.bdbaifr1.ml:3000');
function Chess() {
	this.cvs = document.getElementById('chess');
	this.ctx = this.cvs.getContext('2d');
	this.me = 1;// 1 黑 2 白
	this.chessBoard = [];//存储棋盘中哪些已经被下子
  this.lastOne = false;
}
Chess.prototype.init = function() {
  var that = this;
  socket.on('assign', function(data) {
      that.chessBoard = data.table.status;
      that.me = data.table.hasOccupied ? 2 : 1;
      switch (that.me) {
          case 1:
            alert('黑');
            break;
          case 2:
            alert('白');
            break;
      }
      that.drawChessBoard();
      for (var i = 0; i < 15; i++) {
          for (var j = 0; j < 15; j++) {
            if (that.chessBoard[i][j] !== 0) {
                that.step(i, j, that.chessBoard[i][j]);
            }
          }
      }
      // 为canvas绑定点击落子时间
      that.cvs.onclick = function(e) {
          if (that.lastOne !== false) {
            that.step(that.lastOne.i, that.lastOne.j, that.lastOne.color);
          }
          that.drawChess(e);
      };
  });
  socket.on('played', function(data) {
      if (data.color === that.me) return;
      that.lastOne = data;
      that.chessBoard[data.i][data.j] = data.color;
      that.step(data.i, data.j, 3);
  });
};
Chess.prototype.drawChessBoard = function() {
	var ctx = this.ctx;
	ctx.save();
	ctx.strokeStyle = '#bfbfbf';
	for (var i = 0; i < 15; i++) {
	  // 纵线
	  ctx.moveTo(15 + i*30, 15);
	  ctx.lineTo(15 + i*30, 435);
	  ctx.stroke();
	  // 横线
	  ctx.moveTo(15, 15 + i*30);
	  ctx.lineTo(435 , 15 + i*30);
	  ctx.stroke();
  }
  ctx.restore();
};
Chess.prototype.drawChess = function(e) {

	// offsetX 为相对canvas的偏移量
	// pageX或x 为相对document位置
	// screenX 为相对window位置
	var x = e.offsetX;
	var y = e.offsetY;
	var i = Math.floor(x/30);
	var j = Math.floor(y/30);
  socket.emit('play', { i: i, j: j, color: this.me });
	if(this.chessBoard[i][j] == 0){
		this.step(i,j,this.me);
		this.chessBoard[i][j] = this.me;
	}
};
Chess.prototype.step = function(i,j,me) {
	var ctx = this.ctx;
	ctx.save();

	// createRadialGradient 有两组参数 每组3个参数 分别代表圆心x、y、半径
	// addColorStop的参数为对应的渐变颜色
	var gradient = ctx.createRadialGradient(15 + i*30 + 2,15 + j*30 - 2, 13, 15 + i*30 + 2,15 + j*30 - 2, 0);
  switch (me) {
    case 1:
  		gradient.addColorStop(0,'#0a0a0a');
	  	gradient.addColorStop(1,'#636766');
      break;
    case 2:
  		gradient.addColorStop(0,'#d1d1d1');
	  	gradient.addColorStop(1,'#f9f9f9');
      break;
    case 3:
  		gradient.addColorStop(0,'#992222');
  		gradient.addColorStop(1,'#CC2222');
      break;
	}
	ctx.fillStyle = gradient;

	ctx.beginPath();
	ctx.arc(15 + i*30,15 + j*30, 13, 0, 2* Math.PI);
	ctx.closePath();

	ctx.fill();
	ctx.restore();
};
