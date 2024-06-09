// catchscript.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1200;
canvas.height = 900;

let score = 0;
let yellowCircle = null;
let gameStarted = false;
let remainingTime = 90;
let animationFrameId;
let totalTossed = 0;
let rapidMode = false;

const backgroundImage = new Image();
backgroundImage.src = 'assets/CornCatch/background.png';

const backgroundInvertImage = new Image();
backgroundInvertImage.src = 'assets/CornCatch/backgroundinvert.png';

const blueBoxImage = new Image();
blueBoxImage.src = 'assets/CornCatch/CornKing.png';

const blueBoxInvertImage = new Image();
blueBoxInvertImage.src = 'assets/CornCatch/CornKinginvert.png';

const yellowCircleImage = new Image();
yellowCircleImage.src = 'assets/CornCatch/corn.png';

const yellowCircleInvertImage = new Image();
yellowCircleInvertImage.src = 'assets/CornCatch/corninvert.png';

const redRectImage = new Image();
redRectImage.src = 'assets/CornCatch/basket.png';

const redRectInvertImage = new Image();
redRectInvertImage.src = 'assets/CornCatch/basketinvert.png';

const splashScreenImage = new Image();
splashScreenImage.src = 'assets/CornCatch/splashscreen.jpg';

const startingSong = new Audio('assets/CornCatch/startsong.mp3');
startingSong.loop = true;
const selectSound = new Audio('assets/CornCatch/select.wav');
const countSound = new Audio('assets/CornCatch/count.wav');
const goSound = new Audio('assets/CornCatch/go.wav');
const gameSong = new Audio('assets/CornCatch/song.mp3');
gameSong.loop = true;
const songFaster = new Audio('assets/CornCatch/songfaster.mp3');
songFaster.loop = true;
const hurrySound = new Audio('assets/CornCatch/hurry.wav');
const catchSound = new Audio('assets/CornCatch/catch.wav');
const endGameSound = new Audio('assets/CornCatch/endgame.mp3');
const endSong = new Audio('assets/CornCatch/endsong.mp3');

const blueBox = {
    x: canvas.width / 2,
    y: 5,
    width: 400,
    height: 400,
    dx: 2
};

const redRect = {
    x: canvas.width / 2 - 75,
    y: canvas.height - 105,
    width: 200,
    height: 120,
    dx: 5
};

function drawBackground() {
    const background = rapidMode ? backgroundInvertImage : backgroundImage;
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

function drawBlueBox() {
    const blueBoxImg = rapidMode ? blueBoxInvertImage : blueBoxImage;
    ctx.drawImage(blueBoxImg, blueBox.x, blueBox.y, blueBox.width, blueBox.height);
}

function drawRedRect() {
    const redRectImg = rapidMode ? redRectInvertImage : redRectImage;
    ctx.drawImage(redRectImg, redRect.x, redRect.y, redRect.width, redRect.height);
}

function drawYellowCircle() {
    const yellowCircleImg = rapidMode ? yellowCircleInvertImage : yellowCircleImage;
    if (yellowCircle) {
        ctx.save();
        ctx.translate(yellowCircle.x + 50, yellowCircle.y + 50);
        ctx.rotate(yellowCircle.angle);
        ctx.drawImage(yellowCircleImg, -50, -50, 100, 100);
        ctx.restore();
    }
}

function updateBlueBox() {
    blueBox.x += blueBox.dx;
    if (blueBox.x + blueBox.width > canvas.width || blueBox.x < 0) {
        blueBox.dx *= -1;
    }
    if (Math.random() < 0.005) {
        blueBox.dx *= -1;
    }
}

function updateYellowCircle() {
    if (yellowCircle) {
        yellowCircle.x += yellowCircle.dx;
        yellowCircle.y += yellowCircle.dy;
        yellowCircle.dy += 0.5;
        yellowCircle.angle += 0.1;

        if (yellowCircle.y + 100 > canvas.height) {
            yellowCircle = null;
        }

        if (yellowCircle && yellowCircle.y + 100 > redRect.y &&
            yellowCircle.x + 50 > redRect.x && yellowCircle.x < redRect.x + redRect.width) {
            score++;
            catchSound.play();
            yellowCircle = null;
        }
    }
}

function tossYellowCircle() {
    if (!yellowCircle) {
        const tossFromLeft = Math.random() < 0.5;
        yellowCircle = {
            x: blueBox.x + blueBox.width / 2,
            y: blueBox.y + blueBox.height / 2,
            dx: tossFromLeft ? -2 : 2,
            dy: -10,
            angle: 0
        };
        totalTossed++;
    }
}

function updateRedRect() {
    if (leftPressed && redRect.x > 0) {
        redRect.x -= redRect.dx;
    }
    if (rightPressed && redRect.x + redRect.width < canvas.width) {
        redRect.x += redRect.dx;
    }
    redRect.y = canvas.height - redRect.height - 5;
}

let leftPressed = false;
let rightPressed = false;

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (e.key === 'ArrowRight') {
        rightPressed = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') {
        leftPressed = false;
    } else if (e.key === 'ArrowRight') {
        rightPressed = false;
    }
});

function drawStartScreen() {
    ctx.drawImage(splashScreenImage, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'yellow';
    ctx.font = '60px "Press Start 2P"';
    ctx.textAlign = 'center';
    if (Math.floor(Date.now() / 500) % 2) {
        ctx.fillText('START', canvas.width / 2, canvas.height / 2 + 200);
    }
}

function showStartScreen() {
    startingSong.play().catch((error) => {
        console.error('Failed to play starting song:', error);
    });
    function initialLoop() {
        if (!gameStarted) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawStartScreen();
            requestAnimationFrame(initialLoop);
        }
    }
    initialLoop();
}

function startCountdown(callback) {
    let countdown = 3;
    function drawCountdown() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'yellow';
        ctx.font = '120px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(countdown > 0 ? countdown : "GO!", canvas.width / 2, canvas.height / 2);
        if (countdown > 0) {
            countSound.play();
            countdown--;
            setTimeout(drawCountdown, 1000);
        } else {
            goSound.play();
            setTimeout(callback, 1000);
        }
    }
    drawCountdown();
}

function updateTimer() {
    if (remainingTime > 0) {
        remainingTime--;
        if (remainingTime === 15 && !rapidMode) {
            startRapidMode();
        }
        setTimeout(updateTimer, 1000);
    } else {
        endGame();
    }
}

function startRapidMode() {
    rapidMode = true;
    gameSong.pause();
    let hurryCount = 0;
    function playHurrySound() {
        if (hurryCount < 5) {
            hurrySound.play();
            hurryCount++;
            setTimeout(playHurrySound, 300);
        } else {
            songFaster.play();
        }
    }
    playHurrySound();
    blueBox.dx *= 2;
}

function startGame() {
    gameStarted = true;
    totalTossed = 0;
    rapidMode = false;
    startingSong.pause();
    startCountdown(() => {
        gameSong.play();
        gameLoop();
        updateTimer();
    });
}

function drawPlayAgainButton() {
    ctx.fillStyle = 'white';
    ctx.font = '30px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('Play Again', canvas.width / 2, canvas.height - 70);
}

function endGame() {
    gameSong.pause();
    songFaster.pause();
    endGameSound.play();
    cancelAnimationFrame(animationFrameId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'yellow';
    ctx.font = '40px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('THE CORN KING', canvas.width / 2, canvas.height / 2 - 150);
    ctx.fillText('HAS BLESSED YOU WITH', canvas.width / 2, canvas.height / 2 - 100);
    ctx.font = '80px "Press Start 2P"';
    ctx.fillText(`${score} CORNS!`, canvas.width / 2, canvas.height / 2);
    
    const percentageCaught = (score / totalTossed) * 100;
    let finalMessage = '';
    if (percentageCaught > 85) {
        finalMessage = "THE KING FAVORS YOU!";
    } else if (percentageCaught >= 65) {
        finalMessage = "THAT IS QUITE A BOUNTY!";
    } else if (percentageCaught >= 45) {
        finalMessage = "BETTER LUCK NEXT HARVEST";
    } else if (percentageCaught >= 35) {
        finalMessage = "NOT GREAT!\nHE IS FORGIVING, THOUGH.";
    } else {
        finalMessage = "YOU HAVE DISAPPOINTED\nTHE CORN KING GREATLY.";
    }

    ctx.font = '40px "Press Start 2P"';
    finalMessage.split('\n').forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, canvas.height / 2 + 60 + (index * 50));
    });
    endSong.play();

    // Draw the play again button
    drawPlayAgainButton();

    // Add event listener for the play again button
    canvas.addEventListener('click', handlePlayAgainClick);
}

function handlePlayAgainClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x >= canvas.width / 2 - 100 && x <= canvas.width / 2 + 100 &&
        y >= canvas.height - 90 && y <= canvas.height - 50) {
        canvas.removeEventListener('click', handlePlayAgainClick);
        restartGame();
    }
}

function restartGame() {
    score = 0;
    yellowCircle = null;
    remainingTime = 90;
    totalTossed = 0;
    rapidMode = false;
    blueBox.x = canvas.width / 2;
    blueBox.y = 5;
    blueBox.dx = 2;
    redRect.x = canvas.width / 2 - 75;
    redRect.y = canvas.height - 105;
    endSong.pause();
    endSong.currentTime = 0;
    gameStarted = false;
    startGame();
}

canvas.addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        selectSound.play();
        startGame();
    }
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawBlueBox();
    drawRedRect();
    drawYellowCircle();
    updateBlueBox();
    updateYellowCircle();
    updateRedRect();

    const tossProbability = rapidMode ? 0.04 : 0.02;
    if (Math.random() < tossProbability) {
        tossYellowCircle();
    }

    // Draw score and timer
    ctx.fillStyle = 'yellow';
    ctx.font = '60px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.fillText(score, 20, 80);
    ctx.textAlign = 'right';
    ctx.fillText(remainingTime, canvas.width - 20, 80);

    animationFrameId = requestAnimationFrame(gameLoop);
}

initialLoop();
