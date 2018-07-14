'use strict';

// UI Controller
const UICtrl = (function () {
  const UISelectors = {
    gameplayStartBtn: '#start-game-btn',
    curtain: '#curtain',
    menuWindow: '#menu',
    recordDisplayer: '#record',
    recordResetBtn: '#record-reset-btn',
    game: '#game',
    cardContainer: '.card-container'
  };

  const loadEventListeners = function () {
    document.querySelector(UISelectors.gameplayStartBtn).addEventListener('click', GameplayCtrl.start, false);
    document.querySelector(UISelectors.recordResetBtn).addEventListener('click', StorageCtrl.resetRecord, false);
  };
  
  const displayRecord = function (reset) {
    let message
    if (StorageCtrl.record === null || reset === 'reset') {
      message = '';
    } else {
      message = `Your record is: ${StorageCtrl.record / 1000}s`;
    }
    document.querySelector(UISelectors.recordDisplayer).innerHTML = message;
  }

  const introWindow = {
    hide: function () {
      document.querySelector(UISelectors.curtain).classList.add('curtain--hidden');
      document.querySelector(UISelectors.menuWindow).classList.add('menu--hidden');
      document.querySelector(UISelectors.game).classList.remove('game--hidden');
    },
    
    show: function () {
      document.querySelector(UISelectors.curtain).classList.remove('curtain--hidden');
      document.querySelector(UISelectors.menuWindow).classList.remove('menu--hidden');
      document.querySelector(UISelectors.game).classList.add('game--hidden');
    },
  }

  return {
    UISelectors: UISelectors,
    loadEventsListeners: loadEventListeners,
    displayRecord: displayRecord,
    hideIntro: introWindow.hide,
    showIntro: introWindow.show
  }
})();



// Objects Controller
const ObjectsCtrl = (function () {
  const Board = {
    clear: function() {
      const cards = document.querySelectorAll(UICtrl.UISelectors.cardContainer);
      cards.forEach(card => {
        card.remove();
      })
    }
  };

  const Deck = {
    torifudaArray: [
      {
        type: 'torifuda',
        name: 'i',
        content: 'い'
      },
      {
        type: 'torifuda',
        name: 'ro',
        content: 'ろ'
      },
{
type: 'torifuda',
name: 'ha',
content: 'は'
},
{
type: 'torifuda',
name: 'ni',
content: 'に'
},
{
type: 'torifuda',
name: 'ho',
content: 'ほ'
}
    ],
    yomifudaArray: [
      {
        type: 'yomifuda',
        name: 'i',
        content: '犬も歩けば棒に当たる'
      },
      {
        type: 'yomifuda',
        name: 'ro',
        content: '論より証拠'
      },
{
type: 'yomifuda',
name: 'ha',
content: '花より団子'
},
{
type: 'yomifuda',
name: 'ni',
content: '憎まれっ子世にはばかる'
},
{
type: 'yomifuda',
name: 'ho',
content: '骨折り損のくたびれ儲け'
}
    ],

    concat: function () {
      this.full = this.torifudaArray.concat(this.yomifudaArray);
    },
    
    shuffle: function () {
      this.full.sort(() => 0.5 - Math.random());
    },

    generate: function() {
      Deck.concat();
      Deck.shuffle();
      Deck.full.forEach(card => {
        Card.generate(card);
      });
    },
  };

  const Card = {
    isClickable: true,
    
    generate: function (card) {
      const cardContainer = document.createElement('div');
      const cardElement = document.createElement('div');
      cardContainer.appendChild(cardElement);
      cardContainer.classList.add('card-container');
      cardElement.classList.add('card', 'card--' + card.type);
      cardElement.dataset.name = card.name;
      cardElement.dataset.content = card.content;
      
      const randomDegree = 180 * Math.random();
      const randomPosition = 50 * Math.random();
      cardContainer.style.transform = 'rotate(' + randomDegree + 'deg) translate(' + randomPosition + 'px) scale(1)';
      
      cardElement.addEventListener('mouseenter', function(e){
        e.target.parentElement.style.transform += 'scale(1.1)';
      });
      cardElement.addEventListener('mousemove', this.lift);
      cardElement.addEventListener('click', this.select);
      cardElement.addEventListener('mouseleave', function(e) {
        e.target.parentElement.style.transform += 'scale(0.9)';
        e.target.style.transform = `matrix3d(
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1
          )`;
      });
      game.appendChild(cardContainer);
    },
    
    lift: function (e) {
      if (e.target.classList.contains('selected')) {
        return;
      }
      const cursorXPosition = e.offsetX;
      const cursorYPosition = e.offsetY;
      const cardXCenter = e.target.clientWidth / 2;
      const cardYCenter = e.target.clientHeight / 2;
      const rotateY = (cursorXPosition - cardXCenter) / 250;
      const rotateX = (cursorYPosition - cardYCenter) / 350;
      
      e.target.style.transform = `matrix3d(
        1, 0, ${rotateY}, 0,
        0, 1, ${rotateX}, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
        )`;
    },
    
    select: function() {
      let selected = event.target;
      
      if (selected === GameplayCtrl.Round.previousClick || !Card.isClickable) {
        console.log('blocked');
        return;
      }
      
      if (GameplayCtrl.Round.clickCounter >= 2) {
        GameplayCtrl.Round.reset();
      }
      Card.show();
      GameplayCtrl.Round.clickCounter++;
      console.log(GameplayCtrl.Round.clickCounter);
      if (GameplayCtrl.Round.clickCounter === 1) { 
        GameplayCtrl.Round.firstClick = selected.dataset.name;
        GameplayCtrl.Round.previousClick = selected;
      } else {
        Card.isClickable = false;
        GameplayCtrl.Round.secondClick = selected.dataset.name;
        GameplayCtrl.Round.previousClick = '';
        if (GameplayCtrl.Round.firstClick !== GameplayCtrl.Round.secondClick) { 
          Card.hide();
          console.log('not match');
        } else {
          GameplayCtrl.matchCounter++;
          Card.remove();
          console.log('match');        
        }
      }
      console.log('first: '+GameplayCtrl.Round.firstClick);
      console.log('second: '+GameplayCtrl.Round.secondClick);
      console.log('previous: '+GameplayCtrl.Round.previousClick);
      console.log('match counter: '+GameplayCtrl.matchCounter);
      
      if (GameplayCtrl.matchCounter === Deck.full.length / 2) {
        setTimeout(GameplayCtrl.end, 1200);
      }
    },
    
    show: function() {
      let clicked = event.target;
      let cursorXPosition = event.offsetX;
      const cardXCenter = event.target.clientWidth / 2;
      clicked.classList.add('selected');

      if (cursorXPosition < cardXCenter) {
        clicked.classList.add('left-edge');
      } else {
        clicked.classList.add('right-edge');
      }
    },
    
    hide: function() {
      console.log('hide');
      setTimeout(function() { 
        Card.isClickable = true;
        const selected = document.querySelectorAll('.selected');
        selected.forEach(item => {
          item.classList.remove('selected', 'left-edge', 'right-edge');
        });
      }, 1200);
    },
    
    remove: function() {
      setTimeout(function() {
        Card.isClickable = true;
        const selected = document.querySelectorAll('.selected');
        console.log(selected);
        selected.forEach(item => {
          console.log(item);
          item.remove();
        });
      }, 1200);
    }
  };

  return {
    generateDeck: Deck.generate,
    clearBoard: Board.clear
  }
})();



// Gameplay Controller
const GameplayCtrl = (function () {

  let startTime = 0;
  let endTime = 0;
  let score = 0;
  let matchCounter = 0;
  
  const start = function () {
    GameplayCtrl.matchCounter = 0;
    UICtrl.hideIntro();
    ObjectsCtrl.generateDeck();
    GameplayCtrl.startTime = new Date().getTime();
    console.log('start: '+GameplayCtrl.startTime);
  };
  
  const Round = {
    clickCounter: 0,
    firstClick: '',
    secondClick: '',
    previousClick: '',
    
    reset: function() {
      console.log(this);
      console.log(this.clickCounter);
      console.log('reset');
      
      this.clickCounter = 0;
      this.firstClick = '';
      this.secondClick = '';
    },  
  };
  
  const end = function() {
    console.log(this);
    this.endTime = new Date().getTime();
    this.score = this.endTime - GameplayCtrl.startTime;
    console.log('start: '+GameplayCtrl.startTime);
    console.log('end: '+this.endTime);
    console.log('czas trwania: '+this.score / 1000+'s');
    console.log('Win!');
    if (StorageCtrl.record === null ||this.score < StorageCtrl.record) {
      StorageCtrl.updateRecord(this.score);
      UICtrl.displayRecord();
    }
    ObjectsCtrl.clearBoard();
    UICtrl.showIntro();
  };

  return {
    start: start,
    startTime: startTime,
    endTime: endTime,
    matchCounter: matchCounter,
    Round: Round,
    end: end
  }
})();



// Record Controller
const StorageCtrl = (function () {
  let record = localStorage.getItem('record');
  
  const updateRecord = function(score) {
    localStorage.record = score;
    StorageCtrl.record = localStorage.record;
  };
  
  const resetRecord = function() {
    localStorage.removeItem('record');
    UICtrl.displayRecord('reset');
  }
  return {
    record: record,
    updateRecord: updateRecord,
    resetRecord: resetRecord
  }
})();



// Game Controller
const Game = (function () {
  console.log('Game initialized');
  UICtrl.loadEventsListeners();
  UICtrl.displayRecord();
})();