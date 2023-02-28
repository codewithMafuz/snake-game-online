// values that need to query as id
const ids = ['board', 'snake-speed', 'pause', 'squareSnake'];
// values of audio defining
const mp3s = ['moveSound', 'foodSound', 'gameOverSound'];
// vars --
// vars of element getting by id
const [board, snakeSpeed, pause, squareSnake] = ids.map((i) => document.getElementById(i));
// vars of audios
const [moveSound, footSound, gameOverSound] = mp3s.map((a) => new Audio('audio/' + a + '.mp3'));
// normal constant vars ---
let animationFrameRunning; let score = 0;
let highScore = JSON.parse(localStorage.getItem('highScore'));
if (highScore === null) {
    highScore = 0;
    localStorage.setItem('highScore', JSON.stringify(highScore));
}
// remove modals if exists
function rmAllModalIfHave() {
    Array.from(document.getElementsByClassName('modal')).forEach((e) => {
        e.remove();
    });
}
// lastRunTime saving with this variable
let lastRunTime = 0; let fps = 5; // fps setting
// snake array for making snake body
let snakeBodyAllParts = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 }
];
// food / point box (default food point for the first time)
const food = { x: 10, y: 10 },
    snakePartClasses = $('.snake-head, .snake-body, .snake-foot')
// moved direction ,, it will run on each frame and will add/sub the x/y value
let runningNow = false;
let maxX = 40 - 1;
let maxY = 40 - 1;
const movedDirection = {
    x: 1,
    y: 0,
};
let prevPressedKeyAngelWas = 'X';
let isMobileSessionStorage = JSON.parse(sessionStorage.getItem('isMobile'));

if (isMobileSessionStorage === null) {
    fetch('https://api.bigdatacloud.net/data/client-info')
        .then((response) => response.json())
        .then((result) => {
            sessionStorage.setItem('isMobile', JSON.stringify(result.isMobile));
        })
        .catch((er) => {
            if (window.matchMedia('(max-width:600px)').matches) {
                isMobileSessionStorage = true;
                sessionStorage.setItem('isMobile', JSON.stringify(true));
            }
        });
}
// the main function that will run the gameEngine() again and again after a while (depends on fps)
function animationFrame(currentRunningTime) {
    runningNow = true;
    animationFrameRunning = requestAnimationFrame(animationFrame);
    if (((currentRunningTime - lastRunTime) / 1000) < (1 / fps)) return;
    lastRunTime = currentRunningTime;
    gameEngine();
}

// function for creating snakebox / path and set styles on it and others
const resetBoard = () => {
    board.innerHTML = '';
    snakeBodyAllParts = [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 3, y: 1 },
    ];
    movedDirection.x = 1;
    movedDirection.y = 0;
    prevPressedKeyAngelWas = 'X';
    setBoxInBoard(1, 1, 'snake-foot');
    setBoxInBoard(2, 1, 'snake-body');
    setBoxInBoard(3, 1, 'snake-head');
    cancelAnimationFrame(animationFrameRunning);
};
const setBoxInBoard = (x = 10, y = 10, col = 'snake-food') => {
    const snakeElm = document.createElement('div');
    snakeElm.style.gridColumnStart = x;
    snakeElm.style.gridRowStart = y;
    snakeElm.className = col;
    board.appendChild(snakeElm);
};
// genarate food box/ food
const genarateFood = () => {
    food.x = Math.floor(Math.random() * (maxX - 1)) + 1;
    food.y = Math.floor(Math.random() * (maxY - 1)) + 1;
};
// gameover function that should execute when snake go < | > of max index x or y | stack in his own body
const gameOver = (scoreWas, msg = false) => {
    gameOverSound.play();
    score = 0;
    displayScoreBoard();
    showAlertBox('Game Over !!!', `You made score : <b>${scoreWas}</b><br><b>${msg ? msg : 'Crashed On Wall'}</b`, 'OK');
};
const isDuplicateAvailabe = (arr) => {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length; j++) {
            if (i !== j && arr[i].x === arr[j].x && arr[i].y === arr[j].y) {
                return true;
            }
        }
    }
    return false;
};
const displayScoreBoard = () => {
    highScore = JSON.parse(localStorage.getItem('highScore'));
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', JSON.stringify(highScore));
    }
    $('.scoreElm').text(score);
    $('.highScoreElm').text(highScore);
};
const showAlertBox = (title = 'Game Over !!!', content = '', button1 = 'Close') => {
    rmAllModalIfHave();
    const div = document.createElement('div');
    div.className = 'modal';
    div.tabIndex = '-1';
    div.innerHTML =
   `
       <div class="modal-dialog">
           <div class="modal-content">
               <div class="modal-header">
                   <h5 class="modal-title">${title}</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
               </div>
               <div class="modal-body">${content}</div>
               <div class="modal-footer">
                   <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${button1}</button>
               </div>
           </div>
       </div>
   `;
    document.body.appendChild(div);
    $('.modal').modal('show');
};


function gameEngine() {
    // 1) snake body display
    snakePartClasses.css({ 'border-radius': squareSnake ? '2px' : '50px' })
    alreadyShown = false;
    const snkLen = snakeBodyAllParts.length;
    const snakeHeadPartIndex = snkLen - 1;
    board.innerHTML = '';
    const snakeBodyAllPartsAfterMoved = [];
    setBoxInBoard(food.x, food.y, 'snake-food');
    for (let i = 0; i < snkLen; i++) {
        const snakeBodyPart = snakeBodyAllParts[i];
        const snakeBodyPartNextOne = i !== snkLen - 1 ? snakeBodyAllParts[i + 1] : {
            x: snakeBodyPart.x + movedDirection.x,
            y: snakeBodyPart.y + movedDirection.y,
        };

        setBoxInBoard(snakeBodyPart.x, snakeBodyPart.y, i === 0 ? 'snake-foot' : i === snakeHeadPartIndex ? 'snake-head' : 'snake-body');
        snakeBodyAllPartsAfterMoved.push(snakeBodyPartNextOne);
    }
    // food
    if (snakeBodyAllParts[snakeBodyAllParts.length - 1].x === food.x && snakeBodyAllParts[snakeBodyAllParts.length - 1].y === food.y) {
        score++;
        footSound.play();
        genarateFood();
        // adding new part in snakeBodyPart
        const newBodyPart = { x: snakeBodyAllParts[0].x - 1, y: snakeBodyAllParts[0].y - 1 };
        snakeBodyAllPartsAfterMoved.unshift(newBodyPart);
    }
    // checking crashed or not
    const snakeHeadPart = snakeBodyAllParts[snkLen - 1];
    if (
        snakeHeadPart.x === 0 ||
        snakeHeadPart.y === 0 ||
        snakeHeadPart.x === maxX + 2 ||
        snakeHeadPart.y === maxY + 2) {
        if (!alreadyShown) {
            alreadyShown = true;
            gameOver(score);
            resetBoard();
            return;
        }
    }
    if (isDuplicateAvailabe(snakeBodyAllParts)) {
        if (!alreadyShown) {
            alreadyShown = true;
            gameOver(score, 'Snake Cut It\'s Foot');
            resetBoard();
            return;
        }
    }
    // displaying score
    displayScoreBoard();
    // updating snake body part
    snakeBodyAllParts = snakeBodyAllPartsAfterMoved;
}


// change snake speed if wants
snakeSpeed.addEventListener('input', function () {
    const val = parseInt(parseInt(this.value) / 10);
    val < 3 ? this.value = 30 : fps = val;
    $('#snake-speed').blur();
});

pause.addEventListener('click', function () {
    pauseOrContinueGame();
    if (runningNow) {
        pause.innerHTML = 'Paused';
    } else {
        pause.innerHTML = 'Continue';
    }
});

// move  controlling functions
const goUp = () => {
    if (runningNow && prevPressedKeyAngelWas !== 'Y') {
        moveSound.play();
        movedDirection.x = 0;
        movedDirection.y = -1;
        prevPressedKeyAngelWas = 'Y';
    }
}, goDown = () => {
    if (runningNow && prevPressedKeyAngelWas !== 'Y') {
        moveSound.play();
        movedDirection.x = 0;
        movedDirection.y = 1;
        prevPressedKeyAngelWas = 'Y';
    }
}, goLeft = () => {
    if (runningNow && prevPressedKeyAngelWas !== 'X') {
        moveSound.play();
        movedDirection.x = -1;
        movedDirection.y = 0;
        prevPressedKeyAngelWas = 'X';
    }
}, goRight = () => {
    if (runningNow && prevPressedKeyAngelWas !== 'X') {
        moveSound.play();
        movedDirection.x = 1;
        movedDirection.y = 0;
        prevPressedKeyAngelWas = 'X';
    }
}, pauseOrContinueGame = () => {
    if (isMobileSessionStorage) {
        $('header').hide();
    }
    if (runningNow) {
        cancelAnimationFrame(animationFrameRunning);
        runningNow = false;
    } else {
        requestAnimationFrame(animationFrame);
        runningNow = true;
    }
    pause.innerHTML = pause.innerHTML === 'Continue' ? 'Pause' : 'Continue';
}, controllMovement = (keyOrTouchName) => {
    switch (keyOrTouchName) {
        case 'ArrowUp':
            goUp();
            break;
        case 'ArrowDown':
            goDown();
            break;
        case 'ArrowLeft':
            goLeft();
            break;
        case 'ArrowRight':
            goRight();
            break;
        case ' ':
            pauseOrContinueGame();
            break;
    }
};
// events for controlling
document.addEventListener('keydown', function (ev) {
    const key = ev.key;
    controllMovement(key);
});
// events for controlling if mobile
if (isMobileSessionStorage) {
    document.addEventListener('swiped-left', (ev) => {
        controllMovement('ArrowLeft');
    });
    document.addEventListener('swiped-right', (ev) => {
        controllMovement('ArrowRight');
    });
    document.addEventListener('swiped-up', (ev) => {
        controllMovement('ArrowUp');
    });
    document.addEventListener('swiped-down', (ev) => {
        controllMovement('ArrowDown');
    });
}


// setting button
$('#setting').click(function () {
    if (isMobileSessionStorage) {
        $('header').toggle(300);
    }
    $(this).blur();
    document.body.click();
});
// close side bar in mobile
$('#closeSideBar').click((e) => {
    if (isMobileSessionStorage) {
        $('header').hide();
    }
});
if (!isMobileSessionStorage) {
    $('header').removeClass('none');
    $('.closeBox').hide();
}
// turn on or off box grid border
$('#bigField, #squareSnake').on('change', function () {
    $(this).blur();
    if (this.id === 'bigField') {
        resetBoard();
        if (this.checked) {
            maxX = 40 - 1;
            maxY = 40 - 1;
            $('#board').attr('style', 'grid-template-rows:repeat(40, 1fr)!important;grid-template-columns:repeat(40,1fr)!important');
        } else {
            maxX = 30 - 1;
            maxY = 30 - 1;
            $('#board').attr('style', 'grid-template-rows:repeat(30, 1fr)!important;grid-template-columns:repeat(30,1fr)!important');
        }
    } else {
        if (this.checked) {
            ;
        } else {
            $('.snake-head, .snake-body, .snake-foot').css({ 'border-radius': '50px' });
        }
    }
});
// function/methods run on load
resetBoard();
displayScoreBoard();
snakePartClasses.css({ 'border-radius': squareSnake ? '2px' : '50px' })

