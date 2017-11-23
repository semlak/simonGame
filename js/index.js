var currentGame ;
var windowTimeouts = [];



var printVar = function(x, varName) {
  var name = varName || '';
  console.log("printing variable " + name + ":", x);
};

var getRandomHexColor = function(min, max) {
  
  //return ('#'+Math.floor(Math.random()*16777215).toString(16));
  return ('#'+(Math.floor(Math.random()*(max - min + 1)) + min).toString(16));
};

var getRandomInt = function(min, max) {
    return Math.floor(Math.random() *  (max - min + 1)) + min;
};

var SimonGame = function(difficulty, gameTimingLength) {
  this.difficulty = difficulty || 0;  //levels could be 0 (easy), or 1 (hard). Default is 0
  this.playerTurnInProgress = false;
  this.playSequence = [];
  this.initialGameTimingLength = gameTimingLength || 1000;
  this.gameTimingLength = this.initialGameTimingLength;
  this.audioElements = []; //globalVariable
  this.playerTurnCurrentInput = [];
  this.gameOnStatus = false; //this refers to whether the gaming device is switched on or off
  this.gameStartedStatus = false; // this refers to whether there is currently a game in progress. The device must be on for this to be true (gameOnStatus === true)
  this.strictModeOn = false;

};

SimonGame.prototype.prepareAudioElements = function() {
  var game = this;
  for (var i = 0; i < 4; i++) {
    var array = [];
    var audioElement0 = document.createElement('audio');
    audioElement0.setAttribute('src', 'https://s3.amazonaws.com/freecodecamp/simonSound' + (i + 1) + '.mp3');
    var audioElement1 = document.createElement('audio');
    audioElement1.setAttribute('src', 'https://s3.amazonaws.com/freecodecamp/simonSound' + (i + 1) + '.mp3');
    array.push(audioElement0);
    array.push(audioElement1);
    game.audioElements.push(array);
  }
};

SimonGame.prototype.cycleThroughLights = function() {
  //this is just for testing colors;
  for (var i = 0; i < 12; i++) {
    window.setTimeout(function(i) {
      $('#quarter-circle-' + (i%4)).addClass('lit');
      window.setTimeout(function(i) {
        console.log(i%4);
        $('#quarter-circle-' + (i%4)).removeClass('lit');      
      }, 500, i);
    }, (1000 * i), i);    
  }
}

SimonGame.prototype.resetGame = function() {
  var game = this;
  $('.quarter-circle').removeClass('lit');
  $('#start-game-button-label').text('RESTART');
  game.gameStartStatus = true;
  $('#counter').text('--');
  while (windowTimeouts.length > 0) {
    var timeoutID = windowTimeouts.shift();
    window.clearTimeout(timeoutID);
  };
  game.gameTimingLength = game.initialGameTimingLength;
  game.playSequence = [];
  game.addToPlaySequence();
  game.playerTurnInProgress = false;    
  game.playCurrentPlaySequenceForUser();
};


SimonGame.prototype.addToPlaySequence = function() {
  this.playSequence.push(getRandomInt(0,3));
  $('#counter').text(this.playSequence.length);
};

SimonGame.prototype.playAudioElement = function(i) {
  var game = this;
  var audioElement = game.audioElements[i].shift();
  audioElement.pause();
  audioElement.currentTime = 0;
  audioElement.play();
  game.audioElements[i].push(audioElement);
  
};

SimonGame.prototype.playCurrentPlaySequenceForUser = function() {
  var game = this;
  game.playSequence.forEach(function(gameQuarter, index) {
    windowTimeouts.push(window.setTimeout(function() {
      var piece = '#quarter-circle-' + gameQuarter;    
      $(piece).addClass('lit');
      game.playAudioElement(gameQuarter);
      windowTimeouts.push(window.setTimeout(function() {
        $(piece).removeClass('lit')
      }, game.gameTimingLength));
    }, game.gameTimingLength*1.5* (index+1)));
  });
  windowTimeouts.push(window.setTimeout(function() {
    game.beginUserResponseSession();
  }, (game.playSequence.length + 0) * game.gameTimingLength*1.5 + game.gameTimingLength));
};




SimonGame.prototype.handleOnOffClick = function(e) {
  var game = this;
  if (game.gameOnStatus) {
    //game.turnOffGame();
    console.log("turning off game");
    $('.quarter-circle').removeClass('lit');
    $('#start-game-button-label').text('START');
    $('.inner-circle-contents').children().addClass('inactive');
    game.gameStartStatus = false;
    game.gameOnStatus = false;
    //window.clearTimeout(ids)
    $('#turn-on').removeClass('active-on-off-control');
    $('#turn-off').addClass('active-on-off-control');
    $('#counter').text('--');
    while (windowTimeouts.length > 0) {
      var timeoutID = windowTimeouts.shift();
      window.clearTimeout(timeoutID);
    };
  }
  else {
    //game.turnOnGame();
    console.log("turning on game");
    game.gameOnStatus = true;    
    $('#turn-off').removeClass('active-on-off-control');
    $('#turn-on').addClass('active-on-off-control');
    $('.inner-circle-contents').children().removeClass('inactive');    
  }
};

SimonGame.prototype.handleGameWin = function() {
  $('#counter').text("**");
  var game = this;
  game.gameStartStatus = false;
  for (var i = 0; i < 24; i++) {
      //$('#quarter-circle-' + i).css('background', getRandomHexColor(7829367, 16777215));    
    window.setTimeout(function(i) {
      //$('#quarter-circle-' + (i%4)).css('background', getRandomHexColor(1911, 4095));
      $('#quarter-circle-' + (i%4)).toggleClass('lit');
    }, (100 * i), i);
    //console.log(500*i);
  }
}

SimonGame.prototype.handleUserSuccess = function() {
  //console.log("handlingUserSuccess");
  var game = this;
  game.playerTurnInProgress = false;  
  $('.quarter-circle').removeClass('lit');
  var currentGameLength = game.playerTurnCurrentInput.length;
  //currentGameLength is number of turns already completed.
  if (currentGameLength === 4) {
    //speed up game
    game.gameTimingLength = game.gameTimingLength * .5;
  }
  else if (currentGameLength === 8) {
    //speed up game
    game.gameTimingLength = game.gameTimingLength * .5;
  }
  else if (currentGameLength === 12) {
    //speed up game
    game.gameTimingLength = game.gameTimingLength * .5;
  }
  
  if (currentGameLength === 20) {
    //end game
    game.handleGameWin();
  }
  else {
    game.addToPlaySequence();
    game.playCurrentPlaySequenceForUser();
  }
}

SimonGame.prototype.handleUserError = function() {
  var game = this;
  game.playerTurnInProgress = false;  
  $('.quarter-circle').removeClass('lit');
  [0,1,2,3].forEach(function(gameQuarter, index) {
    window.setTimeout(function() {
      var piece = '#quarter-circle-' + gameQuarter;    
      $(piece).addClass('lit');
      game.playAudioElement(gameQuarter);
      window.setTimeout(function() {
        $(piece).removeClass('lit')
      }, 100);
    }, 100* (index+1));
  });
  window.setTimeout(function() {
    if (game.strictStatusOn) {
      game.resetGame();
    }
    else {
      game.playCurrentPlaySequenceForUser();
    }
  }, (4) * 100);
};

SimonGame.prototype.handleQuarterCircleMousedown = function(e) {
  var game = this;
  if (game.playerTurnInProgress) {
    var quarterNum = e.currentTarget.id.slice(-1);
    //printVar(quarterNum, "quarterNum");
    $('#quarter-circle-' + quarterNum).addClass('lit');
    game.playAudioElement(quarterNum);
    game.playerTurnCurrentInput.push(Number.parseInt(quarterNum));
    if (game.playerTurnCurrentInput[game.playerTurnCurrentInput.length - 1] !== game.playSequence[game.playerTurnCurrentInput.length - 1]) {
      window.setTimeout(function() {
        game.handleUserError();
      } , 500);
      //do something to alert of an error
    }
    else if (game.playerTurnCurrentInput.length === game.playSequence.length) {
      window.setTimeout(function() {
        game.handleUserSuccess();
      } , 500);
    }
  }
};

SimonGame.prototype.handleQuarterCircleMouseup = function(e) {
  var game = this;
  if (game.playerTurnInProgress) {
    var quarterNum = e.currentTarget.id.slice(-1);
    $('#quarter-circle-' + quarterNum).removeClass('lit');
    //game.audioElements[quarterNum].pause();    
  }  
};



SimonGame.prototype.beginUserResponseSession = function() {
  var game = this;
  game.playerTurnInProgress = true;
  game.playerTurnCurrentInput = [];
  //now, the mousedown listening function will listen for user clicks, add the response to the playerTurnCurrentInput array, and see if it was the correct response by comparing to the game.playSequence array
};

SimonGame.prototype.handleGameStartButtonMousedown = function() {
  var game = this;
  //basically start or restart game
  game.resetGame(); 
}

SimonGame.prototype.handleGameControlButtonMousedown = function(e) {
  var game = this;
  $('#' + e.target.id).addClass('button-press');
  if (game.gameOnStatus) {
    if (e.target.id === 'start-button') {
      game.handleGameStartButtonMousedown();
    }
    else if (e.target.id === 'strict-button') {
      game.strictStatusOn = (game.strictStatusOn === true ? false : true);
      $('#strict-status-indicator').toggleClass('enabled');
      printVar(game.strictStatusOn, "strictStatusOn");
    }
  }
};


SimonGame.prototype.handleGameControlButtonMouseup = function(e) {
  //var target = "#" + e.target.id;
  $('.game-control-button').removeClass('button-press');
  
};

$(document).ready(function(){ 
  
  currentGame = new SimonGame(1);
  currentGame.prepareAudioElements(); 
    
  $(".quarter-circle").on('mousedown', function(e) {
    currentGame.handleQuarterCircleMousedown(e);
  });
  
  $(".quarter-circle").on('mouseup', function(e) {
    currentGame.handleQuarterCircleMouseup(e);
  });
  
  $(".on-off-controls").on('click', function(e) {
    currentGame.handleOnOffClick(e);
  });
  
  $('.game-control-button').on('mousedown', function(e) {
    currentGame.handleGameControlButtonMousedown(e)
  });

  $('.game-control-button').on('mouseup', function(e) {
    currentGame.handleGameControlButtonMouseup(e)
  });  
  $('.inner-circle-contents').children().addClass('inactive');
  
});