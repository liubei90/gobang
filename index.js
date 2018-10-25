// 五子棋
function GoBang(elm, maxLines, player1, player2) {
  this.chessPiecesPath = [];
  this.chessPiecesMap = {};
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
  var self = this;
  this.currentPlayer.getChessPieces(this.chessPiecesMap, function(chessPieces) {
    if (!self.checkNextChessPieces(chessPieces)) {
      return self.getNextChessPieces();
    }

    self.addChessPieces(chessPieces);
    self.state = self.isOver();

    if (self.state === 0) {
      return self.next();
    }

    self.over();
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
function ChessPieces(x, y, player) {
  this.x = x;
  this.y = y;
  this.player = player;
}

function Player(flag, style) {
  this.flag = flag;
  this.style = style;
  this.state = Player.STATE_WAIT;
}

Player.STATE_WAIT = 0; // 等待对手落子
Player.STATE_CHESS = 1; // 自己落子

Player.prototype.init = function(chessBoard) {
  this.chessBoard = chessBoard;
}

Player.prototype.getChessPieces = function(chessPiecesMap, next) {
  ;
}

// 人
function PersionPlayer(flag, style) {
  Player.call(this, flag, style);
  this.next = null;
}
PersionPlayer.prototype = Object.create(Player.prototype);
PersionPlayer.constructor = PersionPlayer;

// 向棋盘注册落子事件，fixme: 是否在游戏结束时移除改事件。还是在棋盘中统一移除
PersionPlayer.prototype.init = function(chessBoard) {
  var self = this;
  this.chessBoard = chessBoard;
  this.chessBoard.registerChessHandler(function(x, y) {
    self.chessHandler(x, y);
  });
}

PersionPlayer.prototype.chessHandler = function(x, y) {
  if (this.state === Player.STATE_CHESS) {
    var chessPieces = new ChessPieces(0, 0, this.flag);

    this.next(chessPieces);
  };
}

// 设置当前角色为可接受落子事件
PersionPlayer.prototype.getChessPieces = function(chessPiecesMap, next) {
  this.state = Player.STATE_CHESS;
  this.next = next;
}


// 机器人
function ComputerPlayer(flag, style) {
  Player.call(this, flag, style);
}

ComputerPlayer.prototype = Object.create(Player.prototype);
ComputerPlayer.constructor = ComputerPlayer;

// 重载角色的落子函数，机器人直接计算当前棋盘，获取棋子后直接返回
ComputerPlayer.prototype.getChessPieces = function(chessPiecesMap, next) {
  var chessPieces = new ChessPieces(0, 0, this.flag);

  next(chessPieces);
}