let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
document.body.style.overflow = 'hidden';
document.body.style.backgroundColor = `rgb(0, 255, 0)`;

var canvasWidth = window.innerWidth;
var canvasHeight = window.innerHeight;

canvas.width = canvasWidth;
canvas.height = canvasHeight;


// board
const BOARD_X = 20;
const BOARD_Y = 20;
const BOARD_PIXEL_SIZE = 40;
const BOARD_COLOR = "gray";

// snake
const SNAKE_MOVING_SPEED = 1;
const SNAKE_COLOR = "green";
const SNAKE_STARTING_X = BOARD_X / 2;
const SNAKE_STARTING_Y = BOARD_Y / 4;

// map 
const MAP_START_X = 50;
const MAP_START_Y = 50;
const MAP_WIDTH = BOARD_X * BOARD_PIXEL_SIZE;
const MAP_HEIGHT = BOARD_Y * BOARD_PIXEL_SIZE;
const MAP_BORDER = 5;
const MAP_BORDER_COLOR = "black";
const MAP_LEFT_BORDER = MAP_START_X + MAP_BORDER * 2;
const MAP_RIGHT_BORDER = MAP_START_X + MAP_WIDTH - MAP_BORDER*2 - BOARD_PIXEL_SIZE;
const MAP_UP_BORDER = MAP_START_Y + MAP_BORDER * 2;
const MAP_DOWN_BORDER = MAP_START_Y + MAP_HEIGHT - MAP_BORDER*2 - BOARD_PIXEL_SIZE
const MAP_APPLE_COLOR = "red";


class Apple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Segment {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Snake {
    constructor() {
        this.dirX = 0;
        this.dirY = 1;
        this.score = 0;
        this.highestScore = 0;
        this.size = 3;
        this.deathsCount = 0;
        
        this.segments = new Array();
        this.segments.push(new Segment(SNAKE_STARTING_X, SNAKE_STARTING_Y));
        this.segments.push(new Segment(SNAKE_STARTING_X, SNAKE_STARTING_Y - 1));
        this.segments.push(new Segment(SNAKE_STARTING_X, SNAKE_STARTING_Y - 2));
    }
}

function spawnApple(apple) {
    if (apple == null) {
        let x = Math.floor(Math.random() * BOARD_X);
        let y = Math.floor(Math.random() * BOARD_Y);
        return new Apple(x, y);
    }
}

function eatApple(apple, snake) {
    haveCoordinatesRepeated = false;
    var x = null;
    var y = null;
    do {
        haveCoordinatesRepeated = false;
        x = Math.floor(Math.random() * BOARD_X);
        y = Math.floor(Math.random() * BOARD_Y);
    
        snake.segments.forEach(segment => {
            if (segment.x == x && segment.y == y) {
                haveCoordinatesRepeated = true;
            }
        });
    } while (haveCoordinatesRepeated == true);

    snake.score += 1000;
    snake.size += 1;
    apple.x = x;
    apple.y = y;

    if (snake.score > snake.highestScore) {
        snake.highestScore = snake.score;
    }
}

function drawInfo(snake) {
    context.fillStyle = "black";
    context.font = "bold 30px Comic Sans MS";
    context.fillText("Highest score: " + snake.highestScore, MAP_WIDTH + 70, MAP_START_Y + 20);
    context.fillText("Score: " + snake.score, MAP_WIDTH + 70, MAP_START_Y + 60);
    context.fillText("Deaths: " + snake.deathsCount, MAP_WIDTH + 70, MAP_START_Y + 100);
    context.fillText("Size: " + snake.size, MAP_WIDTH + 70, MAP_START_Y + 140);
}

function drawMap() {
    // outer border
    context.fillRect(MAP_START_X - MAP_BORDER, MAP_START_Y - MAP_BORDER, MAP_WIDTH + MAP_BORDER * 2, MAP_HEIGHT + MAP_BORDER*2);

    // board
    for (let y = 0; y < BOARD_Y; y++) {
        for (let x = 0; x < BOARD_X; x++) {
            context.fillStyle = BOARD_COLOR;
            context.fillRect(MAP_START_X + x * BOARD_PIXEL_SIZE, MAP_START_Y + y * BOARD_PIXEL_SIZE, BOARD_PIXEL_SIZE, BOARD_PIXEL_SIZE);
        }
    }

    // grid
    context.strokeStyle = MAP_BORDER_COLOR;
    context.lineWidth = 1;

    for (let y = 0; y < BOARD_Y; y++) {
        context.moveTo(MAP_START_X, MAP_START_Y + y * BOARD_PIXEL_SIZE);
        context.lineTo(MAP_START_X + MAP_WIDTH, MAP_START_Y + y * BOARD_PIXEL_SIZE);
    }
    
    for (let x = 0; x < BOARD_X; x++) {   
        context.moveTo(MAP_START_X + x * BOARD_PIXEL_SIZE, MAP_START_Y);
        context.lineTo(MAP_START_X + x * BOARD_PIXEL_SIZE, MAP_START_Y + MAP_HEIGHT);
    }
    context.stroke();
}

function drawSnake(snake) {
    snake.segments.forEach(segment => {
        context.fillStyle = SNAKE_COLOR;
        context.fillRect(MAP_START_X + segment.x * BOARD_PIXEL_SIZE, MAP_START_Y + segment.y * BOARD_PIXEL_SIZE, BOARD_PIXEL_SIZE, BOARD_PIXEL_SIZE);
    })
}

function drawApple(apple) {
    if (apple != null) {
        context.fillStyle = MAP_APPLE_COLOR;
        context.fillRect(MAP_START_X + apple.x * BOARD_PIXEL_SIZE, MAP_START_Y + apple.y * BOARD_PIXEL_SIZE, BOARD_PIXEL_SIZE, BOARD_PIXEL_SIZE);
    }
}


function moveSnake(snake, apple) {
    headX = snake.segments[0].x;
    headY = snake.segments[0].y;
    newX = null;
    newY = null;
    
    newX = headX + snake.dirX;
    newY = headY + snake.dirY;
    if (newX == BOARD_X || newX == -1 || newY == BOARD_Y || newY == -1) {
        restartGame(snake);
    } else {
        hasEatenHimself = false;

        snake.segments.forEach(segment => {
            if (segment.x == newX && segment.y == newY) {
                hasEatenHimself = true;
                restartGame(snake);
            }
        });

        if (!hasEatenHimself) {
            if (apple.x == newX && apple.y == newY) {           // collecting apples
                eatApple(apple, snake);
                snake.segments.unshift(new Segment(newX, newY));
            } else {                                            // basic move
                snake.segments.splice(snake.segments.length - 1, 1);
                snake.segments.unshift(new Segment(newX, newY));
            }
        }
    }
}


function restartGame(snake) {
    snake.dirX = 0;
    snake.dirY = 1;
    snake.score = 0;
    snake.size = 3;
    snake.deathsCount += 1;

    snake.segments = new Array();
    snake.segments.push(new Segment(SNAKE_STARTING_X, SNAKE_STARTING_Y));
    snake.segments.push(new Segment(SNAKE_STARTING_X, SNAKE_STARTING_Y - 1));
    snake.segments.push(new Segment(SNAKE_STARTING_X, SNAKE_STARTING_Y - 2));

    apple = null;
    apple = spawnApple(apple);
}

var Game = {};
Game.fps = 10;
Game.running = true;
var snake = new Snake();
var apple = spawnApple(apple);
var board = new Array(BOARD_Y);
var wasMoveMade = false;
for (var y = 0; y < BOARD_Y; y++) {
    board[y] = new Array(BOARD_X);
}


// movement and other keys
window.addEventListener("keydown", (event)=>{
    setTimeout(()=>{
        if (event.keyCode == 37 && snake.dirX != 1 && !wasMoveMade) {          // go left
            snake.dirX = -1;
            snake.dirY = 0;
            wasMoveMade = true;
        } else if (event.keyCode == 38 && snake.dirY != 1 && !wasMoveMade) {   //go up
            snake.dirX = 0;
            snake.dirY = -1;
            wasMoveMade = true;
        } else if (event.keyCode == 39 && snake.dirX != -1 && !wasMoveMade) {   // go right
            snake.dirX = 1;
            snake.dirY = 0;
            wasMoveMade = true;
        } else if (event.keyCode == 40 && snake.dirY != -1 && !wasMoveMade) {   // go down
            snake.dirX = 0;
            snake.dirY = 1;
            wasMoveMade = true;
        } else if (event.keyCode == 82) {   // restart
            restartGame(snake, apple);
        }
    }, 1)
})

Game.update = function() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    context.clearRect(0, 0, canvasWidth, canvasHeight);
};

Game.draw = function() {
    drawMap();
    drawInfo(snake);
    drawApple(apple);
    drawSnake(snake);
};

Game.run = function() {
    Game.update();
    moveSnake(snake, apple);
    Game.draw();
    wasMoveMade = false;
};

Game.intervalId = setInterval(Game.run, 1000 / Game.fps);