// 五子棋
function GoBang(elm, maxLines, player1, player2) {
  this.chessPiecesArea = [];
  this.player1 = player1;
  this.player2 = player2;
  this.chessBoard = new ChessBoard(elm, maxLines);
  this.currentPlayer = null;
  this.state = -1; // 0 下棋中 1 player1胜 2 player2胜 3平局 
}

GoBang.prototype.initChessPiecesArea = function() {
  ;
}

GoBang.prototype.drawChessBoard = function() {
  ;
}

GoBang.prototype.start = function() {
  this.initChessPiecesArea();
  this.drawChessBoard();
  this.next();
}

// 判断是否结束
GoBang.prototype.isOver = function() {
  ;
}

GoBang.prototype.over = function() {
  ;
}

// 切换下一个玩家下棋
GoBang.prototype.next = function() {
  if (this.currentPlayer === null) {
    this.currentPlayer = this.player1;
  } else if (this.currentPlayer === this.player1) {
    this.currentPlayer = this.player2;
  } else () {
    this.currentPlayer = this.player1;
  }

  this.getNextChessPieces();
}

GoBang.prototype.getNextChessPieces = function() {
  this.currentPlayer.getChessPieces(this.chessPiecesArea, function(chessPieces) {
    if (!this.checkNextChessPieces(chessPieces)) {
      return this.getNextChessPieces();
    }

    this.addChessPieces(chessPieces);
    this.state = this.isOver();

    if (this.state === 0) {
      return this.next();
    }

    this.over();
  });
}

GoBang.prototype.checkNextChessPieces = function(chessPieces) {
  ;
}

GoBang.prototype.addChessPieces = function(chessPieces) {
  ;
}

// 棋盘，用来绘制
function ChessBoard(elm, maxLines) {

}


// 棋子
function ChessPieces() {

}

// 人
function PersionPlayer() {

}

// 机
function ComputerPlayer() {

}