var GOBANG_LINE_COUNT = 16; // 五子棋格数

// 五子棋
function GoBang(elmId, player1, player2) {
  var elm = document.getElementById(elmId);

  this.unRetractCache = [];
  this.chessPiecesPath = [];
  this.chessPiecesMap = {};
  this.currentPlayer = null;
  this.player1 = player1;
  this.player2 = player2;
  this.chessBoard = new ChessBoard(elm);
  this.state = GoBang.STATE_NOT_START; // 0 下棋中 1 player1胜 2 player2胜 3平局
  this.stateChangeHandler = null;
  this.player1.init(this.chessBoard);
  this.player2.init(this.chessBoard);
}

GoBang.STATE_NOT_START = -1; // 未开始
GoBang.STATE_PLAYING = 0; // 下棋中
GoBang.STATE_PLAYER1_WIN = 1; // player1胜
GoBang.STATE_PLAYER2_WIN = 2; // player2胜
GoBang.STATE_DOGFALL = 3; // 3平局

GoBang.prototype.start = function() {
  this.initChessPiecesArea();
  this.next();
}

GoBang.prototype.setStateChangeHandler = function(handler) {
  this.stateChangeHandler = handler;
}

GoBang.prototype.getState = function() {
  return this.state;
}

GoBang.prototype.retract = function() {
  if (this.chessPiecesPath.length < 1) return;
  
  var chessPieces = this.chessPiecesPath.pop();
  var x = chessPieces.x, y = chessPieces.y;

  this.unRetractCache.push(chessPieces);
  this.chessBoard.removeChessPieces(chessPieces);
  delete this.chessPiecesMap[x][y];

  this.next();
}

GoBang.prototype.unRetract = function() {
  if (this.unRetractCache.length < 1) return;

  var chessPieces = this.unRetractCache.pop();
  var x = chessPieces.x, y = chessPieces.y;

  this.chessPiecesPath.push(chessPieces);
  this.chessBoard.addChessPieces(chessPieces);
  this.chessPiecesMap[x][y] = chessPieces;

  this.next();
}

GoBang.prototype.initChessPiecesArea = function() {
  this.state = GoBang.STATE_PLAYING;
  this.chessPiecesPath = [];
  this.chessPiecesMap = {};
  this.currentPlayer = null;
  this.unRetractCache.length = 0;

  this.chessBoard.clearChessPieces();
  this.player1.cancelGetChessPieces();
  this.player2.cancelGetChessPieces();
}

// 判断是否结束
GoBang.prototype.isOver = function() {
  var fiveChessPieces = ChessPiecesShapeUtil.isOver(this.chessPiecesMap);

  if (fiveChessPieces) {
    if (fiveChessPieces[0].player === this.player1) {
      return GoBang.STATE_PLAYER1_WIN;
    } else {
      return GoBang.STATE_PLAYER2_WIN;
    }
  }
  return GoBang.STATE_PLAYING;
}

GoBang.prototype.over = function() {
  if (typeof this.stateChangeHandler === 'function') {
    this.stateChangeHandler.call(null, {
      state: this.state,
      currentPlayer: this.currentPlayer,
    });
  }
  console.log('game over');
}

GoBang.prototype.getNextPlayer = function() {
  if ((this.currentPlayer === null) || (this.currentPlayer === this.player2)) {
    return this.player1;
  } else {
    return this.player2;
  }
}

// 切换下一个玩家下棋
GoBang.prototype.next = function() {
  this.currentPlayer = this.getNextPlayer();

  if (typeof this.stateChangeHandler === 'function') {
    this.stateChangeHandler.call(null, {
      state: this.state,
      currentPlayer: this.currentPlayer,
    });
  }

  // 由于在点击事件中，一个玩家会触发另一个玩家状态的改变，然后另一个玩家也会响应当前点击事件
  var self = this;
  setTimeout(function() {
    self.getNextChessPieces();
  }, 0);
}

GoBang.prototype.getNextChessPieces = function() {
  var self = this;
  this.getNextPlayer().cancelGetChessPieces();
  this.currentPlayer.getChessPieces(this.chessPiecesMap, function(chessPieces) {
    if (!self.addChessPieces(chessPieces)) {
      return self.getNextChessPieces();
    }

    self.state = self.isOver();

    if (self.state === GoBang.STATE_PLAYING) {
      self.next();
    } else {
      self.over();
    }
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
  this.chessPiecesPath.push(chessPieces);
  this.chessBoard.addChessPieces(chessPieces, x, y);

  // 落子成功，清除暂存的撤销悔棋的棋子
  this.unRetractCache.length = 0;
  return true;
}

// 棋形判断
ChessPiecesShapeUtil = {
};

ChessPiecesShapeUtil.isFive = function(fiveChessPieces) {
  if (fiveChessPieces.length && !fiveChessPieces.some(function(item) {
    return !item || (item.player !== fiveChessPieces[0].player);
  })) {
    return true;
  }
  return false;
}

// 是否结束游戏
ChessPiecesShapeUtil.isOver = function(chessPiecesMap) {
  var i, j, d, fiveChessPieces, directArr = ['b', 'r', 'bl', 'br'];

  for (i in chessPiecesMap) {
    if (chessPiecesMap[i]) {
      for (j in chessPiecesMap[i]) {
        for (d = 0; d < directArr.length; d++) {
          fiveChessPieces = ChessPiecesShapeUtil.getFiveChessPieces(chessPiecesMap, Number(i), Number(j), 5, directArr[d]);
          if (ChessPiecesShapeUtil.isFive(fiveChessPieces)) {
            return fiveChessPieces;
          }
        }
      }
    }
  }
  // fixme： 需要判断是否是和棋
  return false;
}

ChessPiecesShapeUtil.getFiveChessPieces = function(chessPiecesMap, x, y, count, direct) {
  function getNextPos(i, isX) {
    if (direct === 't') { // 上
      return isX ? x : (y - i);
    } else if (direct === 'b') { // 下
      return isX ? x : (y + i);
    } else if (direct === 'l') { // 左
      return isX ? (x - i) : y;
    } else if (direct === 'r') { // 右
      return isX ? (x + i) : y;
    } else if (direct === 'tr') { // 上右
      return isX ? (x + i) : (y - i);
    } else if (direct === 'br') { // 下右
      return isX ? (x + i) :(y + i);
    } else if (direct === 'tl') { // 上左
      return isX ? (x - i) :(y - i);
    } else if (direct === 'bl') { // 下左
      return isX ? (x - i) : (y + i);
    }
  }

  var i, res = [], nextX, nextY;
  for (i = 0; i < count; i++) {
    nextX = getNextPos(i, true);
    nextY = getNextPos(i, false);
    if (chessPiecesMap[nextX] && chessPiecesMap[nextX][nextY]) {
      res.push(chessPiecesMap[nextX][nextY]);
    } else {
      res.push(null);
    }
  }
  return res;
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
  var react = this.elm.getBoundingClientRect();
  var i, handler, clientX = event.clientX - react.left, clientY = event.clientY - react.top;

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

ChessBoard.prototype.addChessPieces = function(chessPieces, x, y) {
  if (chessPieces.elm) {
    return this.elm.appendChild(chessPieces.elm);
  }
  var elm = chessPieces.elm = document.createElement('div');
  elm.classList.add('chess-pieces');
  elm.style.backgroundColor = chessPieces.player.color;
  elm.style.width = this.gridWidth + 'px';
  elm.style.height = this.gridHeight + 'px';
  elm.style.left = ((x - 1.5) * this.gridWidth + this.orgLeft) + 'px';
  elm.style.top = ((y - 1.5) * this.gridHeight + this.orgTop) + 'px';
  this.elm.appendChild(elm);
}

ChessBoard.prototype.removeChessPieces = function(chessPieces) {
  var elm = chessPieces.elm;

  this.elm.removeChild(elm);
}

ChessBoard.prototype.clearChessPieces = function() {
  this.elm.innerHTML = '';
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
Player.prototype.cancelGetChessPieces = function() {
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
  if (this.state === Player.STATE_CHESS) {
    var chessPieces = new ChessPieces(x, y, this);
    var next = this.next;

    this.state = Player.STATE_WAIT;
    this.next = null;
    next(chessPieces);
  };
}

// 设置当前角色为可接受落子事件
PersionPlayer.prototype.getChessPieces = function(chessPiecesMap, next) {
  this.state = Player.STATE_CHESS;
  this.next = next;
}

Player.prototype.cancelGetChessPieces = function() {
  this.state = Player.STATE_WAIT;
  this.next = null;
}


// 机器人
function ComputerPlayer(flag, style) {
  Player.call(this, flag, style);
}

ComputerPlayer.prototype = Object.create(Player.prototype);
ComputerPlayer.constructor = ComputerPlayer;
ComputerPlayer.PLAYER_SELF = 1;
ComputerPlayer.PLAYER_OTHER = 2;
// 重载角色的落子函数，机器人直接计算当前棋盘，获取棋子后直接返回
ComputerPlayer.prototype.getChessPieces = function(chessPiecesMap, next) {

  var map = this.cloneChessPiecesMap(chessPiecesMap);
  var pointList = this.genPointList(map);
  var best = -Infinity, tmp, i, pos, bestList = [];

  for (i = 0; i < pointList.length; i++) {
    pos = pointList[i];
    map[pos.x][pos.y] = ComputerPlayer.PLAYER_SELF;
    // tmp = this.evaluate(map);
    tmp = this.expectOther(1, map);
    if (tmp > best) {
      best = tmp;
      bestList.length = 0;
      bestList.push(pos);
    } else if (tmp === best) {
      bestList.push(pos);
    }
    map[pos.x][pos.y] = 0;
  }

  var bestPos;
  if (bestList.length > 0) {
    bestPos = bestList[Math.floor(Math.random() * bestList.length)];
  } else {
    bestPos = pointList[Math.floor(Math.random() * pointList.length)];
  }

  next(new ChessPieces(bestPos.x + 1, bestPos.y + 1, this));
}

// 克隆棋盘, 二维数组 当前机器人为1， 对手为2
ComputerPlayer.prototype.cloneChessPiecesMap = function(chessPiecesMap) {
  var i, j, p, map = [];
  for (i = 0; i < GOBANG_LINE_COUNT; i++) {
    for (j = 0; j < GOBANG_LINE_COUNT; j++) {
      if (chessPiecesMap[i + 1] && chessPiecesMap[i + 1][j + 1]) {
        if (chessPiecesMap[i + 1][j + 1].player === this) {
          p = ComputerPlayer.PLAYER_SELF;
        } else {
          p = ComputerPlayer.PLAYER_OTHER;
        }
      } else {
        p = 0;
      }
      if (!map[i]) {
        map[i] = [];
      }
      map[i][j] = p;
    }
  }
  return map;
}

// 预期自己下一步
ComputerPlayer.prototype.expectSelf = function(dep, map) {
  var best = -Infinity, tmp, i, pos;
  var pointList = this.genPointList(map);

  for (i = 0; i < pointList.length; i++) {
    pos = pointList[i];
    map[pos.x][pos.y] = ComputerPlayer.PLAYER_SELF;
    if (dep <= 0) {
      tmp = this.evaluate(map);
    } else {
      tmp = this.expectOther(dep - 1, map);
    }
    
    if (tmp > best) {
      best = tmp;
    }
    map[pos.x][pos.y] = 0;
  }

  return best;
}

// 预期对手下一步
ComputerPlayer.prototype.expectOther = function(dep, map) {
  var best = Infinity, tmp, i, pos;
  var pointList = this.genPointList(map);

  for (i = 0; i < pointList.length; i++) {
    pos = pointList[i];
    map[pos.x][pos.y] = ComputerPlayer.PLAYER_OTHER;
    if (dep <= 0) {
      tmp = this.evaluate(map);
    } else {
      tmp = this.expectSelf(dep - 1, map);
    }

    if (tmp < best) {
      best = tmp;
    }
    map[pos.x][pos.y] = 0;
  }

  return best;
}

// 评估当前棋盘的得分，越高机器人赢面越大
ComputerPlayer.prototype.evaluate = function(map) {
  var selfScore = 0, otherScore = 0;
  var i, j, x, y, posList = [];

  // 竖排
  for (i = 0; i < GOBANG_LINE_COUNT; i++) {
    for (j = 0; j < GOBANG_LINE_COUNT; j++) {
      posList.push(map[i][j]);
    }

    selfScore += this.countScore(posList, ComputerPlayer.PLAYER_SELF);
    otherScore += this.countScore(posList, ComputerPlayer.PLAYER_OTHER);
    posList.length = 0;
  }

  // 横排
  for (j = 0; j < GOBANG_LINE_COUNT; j++) {
    for (i = 0; i < GOBANG_LINE_COUNT; i++) {
      posList.push(map[i][j]);
    }

    selfScore += this.countScore(posList, ComputerPlayer.PLAYER_SELF);
    otherScore += this.countScore(posList, ComputerPlayer.PLAYER_OTHER);
    posList.length = 0;
  }

  // 上反斜线\
  for (i = 0; i < GOBANG_LINE_COUNT; i++) {
    for (x = i, y = 0; x < GOBANG_LINE_COUNT && y < GOBANG_LINE_COUNT; x++, y++) {
      posList.push(map[x][y]);
    }

    selfScore += this.countScore(posList, ComputerPlayer.PLAYER_SELF);
    otherScore += this.countScore(posList, ComputerPlayer.PLAYER_OTHER);
    posList.length = 0;
  }

  // 下反斜线\
  for (i = 1; i < GOBANG_LINE_COUNT; i++) {
    for (y = i, x = 0; x < GOBANG_LINE_COUNT && y < GOBANG_LINE_COUNT; x++, y++) {
      posList.push(map[x][y]);
    }

    selfScore += this.countScore(posList, ComputerPlayer.PLAYER_SELF);
    otherScore += this.countScore(posList, ComputerPlayer.PLAYER_OTHER);
    posList.length = 0;
  }

  // 上斜线/
  for (i = (GOBANG_LINE_COUNT - 1); i >= 0; i--) {
    for (x = 0, y = i; x < GOBANG_LINE_COUNT && y >= 0; x++, y--) {
      posList.push(map[x][y]);
    }

    selfScore += this.countScore(posList, ComputerPlayer.PLAYER_SELF);
    otherScore += this.countScore(posList, ComputerPlayer.PLAYER_OTHER);
    posList.length = 0;
  }

  // 下斜线/
  for (i = 1; i < GOBANG_LINE_COUNT; i++) {
    for (x = i, y = (GOBANG_LINE_COUNT - 1); x < GOBANG_LINE_COUNT && y >= 0; x++, y--) {
      posList.push(map[x][y]);
    }

    selfScore += this.countScore(posList, ComputerPlayer.PLAYER_SELF);
    otherScore += this.countScore(posList, ComputerPlayer.PLAYER_OTHER);
    posList.length = 0;
  }

  // console.log(selfScore, otherScore);
  return selfScore - otherScore;
}

ComputerPlayer.prototype.hasne = function(map, x, y) {
  var i, j, count = 1;
  var beginX = (x - count) > 0 ? (x - count) : 0, endX = Math.min(x + count +1, GOBANG_LINE_COUNT);
  var beginY = (y - count) > 0 ? (y - count) : 0, endY = Math.min(y + count + 1, GOBANG_LINE_COUNT);

  for (i = beginX; i < endX; i++) {
    for (j = beginY; j < endY; j++) {
      if ((i !== 0 || j !== 0) && map[i][j] !== 0) return true;
    }
  }

  return false;
}

// 产生空子序列
ComputerPlayer.prototype.genPointList = function(map) {
  var res = [];
  var i, j;

  for (i = 0; i < GOBANG_LINE_COUNT; i++) {
    for (j = 0; j < GOBANG_LINE_COUNT; j++) {
      if (map[i][j] === 0 && this.hasne(map, i, j)) {
        res.push({
          x: i,
          y: j
        });
      }
    }
  }
  return res;
}

ComputerPlayer.prototype.countScore = function(posList, player) {
  var score = 0;
  var empty = 0, number = 0, i = 1;
  
  if (posList[0] === 0) {
    empty++;
  } else if (posList[0] === player) {
    number++;
  }

  while(i < posList.length) {
    if (posList[i] === player) {
      number++;
    } else if (posList[i] === 0) {
      if (number === 0) empty = 1;
      else {
        score += this.scoreTable(number, empty + 1);
        empty = 1;
        number = 0;
      }
    } else {
      score += this.scoreTable(number, empty);
      empty = 0;
      number = 0;
    }
    i++;
  }

  score += this.scoreTable(number, empty);
  return score;
}

ComputerPlayer.prototype.scoreTable = function(number, empty) {
  if (number >= 5) {
    return 100000;
  } else if (number === 4) {
    if (empty === 2)
      return 10000;
    else if (empty === 1) 
      return 1000;
  } else if (number === 3) {
    if (empty === 2) 
      return 1000;
    else if (empty === 1) 
      return 100;
  } else if (number === 2) {
    if (empty === 2) 
      return 100;
    else if (empty === 1) 
      return 10;
  }
  return 0;
}



var player1 = new PersionPlayer('黑棋', 'black');
// var player2 = new PersionPlayer('白棋', '#eaeaea');
var player2 = new ComputerPlayer('白棋机器人', '#eaeaea');

var gobang = new GoBang('chessboard', player1, player2);

var startBtn = document.getElementById('startBtn');
var retractBtn = document.getElementById('retractBtn');
var unRetractBtn = document.getElementById('unRetractBtn');
var statePanel = document.getElementById('statePanel');

startBtn.addEventListener('click', function() {
  gobang.start();
  startBtn.innerHTML = '重新开始';
});

retractBtn.addEventListener('click', function() {
  if (gobang.getState() !== GoBang.STATE_PLAYING) return;
  gobang.retract();
});

unRetractBtn.addEventListener('click', function() {
  if (gobang.getState() !== GoBang.STATE_PLAYING) return;
  gobang.unRetract();
});

gobang.setStateChangeHandler(function(payload) {
  var state = payload.state, currentPlayer = payload.currentPlayer;

  if (state === GoBang.STATE_PLAYING) {
    statePanel.innerHTML = '下棋中，' + (currentPlayer ? ('当前棋手：' + currentPlayer.flag) : '');
  } else if ((state === GoBang.STATE_PLAYER1_WIN) || (state === GoBang.STATE_PLAYER2_WIN)) {
    statePanel.innerHTML = '游戏结束，' + currentPlayer.flag + '胜';
  }
});