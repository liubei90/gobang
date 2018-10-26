var GOBANG_LINE_COUNT = 16; // 五子棋格数

// 五子棋
function GoBang(elmId, player1, player2) {
  var elm = document.getElementById(elmId);

  this.chessPiecesPath = [];
  this.chessPiecesMap = {};
  this.player1 = player1;
  this.player2 = player2;
  this.chessBoard = new ChessBoard(elm);
  this.currentPlayer = null;
  this.state = -1; // 0 下棋中 1 player1胜 2 player2胜 3平局

  this.player1.init(this.chessBoard);
  this.player2.init(this.chessBoard);
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
  return 0;
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
  } else {
    this.currentPlayer = this.player1;
  }

  // 由于在点击事件中，一个玩家会触发另一个玩家状态的改变，然后另一个玩家也会响应当前点击事件
  var self = this;
  setTimeout(function() {
    self.getNextChessPieces();
  }, 0);
}

GoBang.prototype.getNextChessPieces = function() {
  var self = this;
  this.currentPlayer.getChessPieces(this.chessPiecesMap, function(chessPieces) {
    if (!self.addChessPieces(chessPieces)) {
      return self.getNextChessPieces();
    }

    self.state = self.isOver();

    if (self.state === 0) {
      return self.next();
    }

    self.over();
  });
}

GoBang.prototype.checkNextChessPieces = function(chessPieces) {
  return true;
}

GoBang.prototype.addChessPieces = function(chessPieces) {
  var x = chessPieces.x, y = chessPieces.y, chessPiecesMap = this.chessPiecesMap;

  if (!chessPiecesMap[x]) {
    chessPiecesMap[x] = {};
  }
  if (chessPiecesMap[x][y]) {
    return false;
  }

  chessPiecesMap[x][y] = chessPieces;
  this.chessBoard.addChessPieces(x, y, chessPieces);
  return true;
}

// 棋形判断
ChessPiecesShapeUtil = function() {
}

ChessPiecesShape.isFive = function(chessPiecesMap, x, y) {
  if (chessPiecesMap && chessPiecesMap[x] && chessPiecesMap[x][y]) {
    ;
  }
  return false;
}

// 棋盘，用来绘制
function ChessBoard(elm) {
  this.elm = elm;
  this.chessHandlers = [];

  this.drawGrid();
  this.registerClickHandler();
}

ChessBoard.prototype.registerChessHandler = function(callback) {
  this.chessHandlers.push(callback);
}

ChessBoard.prototype.registerClickHandler = function() {
  var self = this;
  this.elm.addEventListener('click', function(event) {
    self.clickHandler(event);
  })
}

ChessBoard.prototype.clickHandler = function(event) {
  if (event.target !== this.elm) return;
  var i, handler, clientX = event.clientX, clientY = event.clientY;

  var x = Math.floor((clientX - this.orgLeft + 0.5 * this.gridWidth) / this.gridWidth) + 1;
  var y = Math.floor((clientY - this.orgTop + 0.5 * this.gridHeight) / this.gridHeight) + 1;

  for (i = 0; i < this.chessHandlers.length; i++) {
    handler = this.chessHandlers[i];
    if (typeof handler === 'function') {
      handler.apply(null, [x, y]);
    }
  }
  event.stopPropagation()
  event.preventDefault();
}

ChessBoard.prototype.drawGrid = function() {
  var elm = this.elm;
  var react = elm.getBoundingClientRect();
  var width = react.width - 1;
  var height = react.height - 1;
  var gridCount = this.gridCount = GOBANG_LINE_COUNT - 1;
  var gridWidth = this.gridWidth = Math.floor(width/gridCount);
  var gridHeight = this.gridHeight = Math.floor(height/gridCount);
  var orgLeft = this.orgLeft = (width - (gridWidth * gridCount)) * 0.5;
  var orgTop = this.orgTop = (height - (gridHeight * gridCount)) * 0.5;

  elm.style.background = 'linear-gradient(180deg, transparent ' + (gridHeight - 1) + 'px, blue ' + gridHeight + 'px),'
                        + 'linear-gradient(90deg, transparent ' + (gridWidth - 1) + 'px, blue ' + gridWidth + 'px)';

  elm.style.backgroundRepeat = 'repeat';
  elm.style.backgroundSize = gridWidth + 'px ' + gridHeight + 'px';
  elm.style.backgroundPosition = orgLeft + 'px ' + orgTop + 'px';
}

ChessBoard.prototype.addChessPieces = function(x, y, chessPieces) {
  var elm = chessPieces.elm = document.createElement('div');
  elm.classList.add('chess-pieces');
  elm.style.backgroundColor = chessPieces.player.color;
  elm.style.width = this.gridWidth + 'px';
  elm.style.height = this.gridHeight + 'px';
  elm.style.left = ((x - 1.5) * this.gridWidth + this.orgLeft) + 'px';
  elm.style.top = ((y - 1.5) * this.gridHeight + this.orgTop) + 'px';
  this.elm.appendChild(elm);
}


// 棋子
function ChessPieces(x, y, player) {
  this.x = x;
  this.y = y;
  this.player = player;
}

function Player(flag, color) {
  this.flag = flag;
  this.color = color;
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
function PersionPlayer(flag, color) {
  Player.call(this, flag, color);
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
  console.log('chessHandler', this.flag, this.state);
  if (this.state === Player.STATE_CHESS) {
    var chessPieces = new ChessPieces(x, y, this);

    this.state = Player.STATE_WAIT;
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


var player1 = new PersionPlayer('1', '#eaeaea');
var player2 = new PersionPlayer('2', 'black');
var gobang = new GoBang('chessboard', player1, player2);

gobang.start();