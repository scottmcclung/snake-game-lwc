import { LightningElement, track } from 'lwc';

export default class Game extends LightningElement {
    score = 0;
    highScore = 0;

    blockSize = 20;

    gameBlocks = new Map();
    @track gameBoard = [];

    renderComplete = false;

    xSpeed = 1;
    ySpeed = 0;

    xHead = 0;
    yHead = 0;

    xMax;
    yMax;

    tail = [];

    showOverlay = true;
    gameOver = false;

    speed = 1;
    intervalObj;

    renderGameBoard() {
        this.gameBoard = Array.from(this.gameBlocks.values());
    }

    connectedCallback() {
        this.highScore = localStorage.getItem('lwc_snake_high')
            ? localStorage.getItem('lwc_snake_high')
            : 0;
    }

    get displaySpeed() {
        return this.speed.toFixed(1);
    }

    startGame() {
        this.showOverlay = false;
        this.intervalObj = setInterval(() => {
            this.move();
        }, 300 / this.speed);
    }

    addSpeed() {
        this.speed = this.speed + 0.1;
        clearInterval(this.intervalObj);
        this.startGame();
    }

    move() {
        const headCoords = `${this.xHead}:${this.yHead}`;
        let lastElement = this.tail[this.tail.length - 1];
        if (lastElement !== headCoords) {
            this.tail.push(headCoords);
            this.setGameBlock(this.tail.shift(), { snake: false, class: '' });
        }

        this.xHead += this.xSpeed;
        this.yHead += this.ySpeed;

        if (this.xHead >= this.xMax) {
            this.xHead = 0;
        }

        if (this.xHead < 0) {
            this.xHead = this.xMax - 1;
        }

        if (this.yHead >= this.yMax) {
            this.yHead = 0;
        }

        if (this.yHead < 0) {
            this.yHead = this.yMax - 1;
        }

        const newHeadCoords = `${this.xHead}:${this.yHead}`;
        if (this.tail.includes(newHeadCoords)) {
            this.exitGame();
            return;
        }

        this.setGameBlock(newHeadCoords, { snake: true, class: 'snake' });

        if (this.gameBlocks.get(newHeadCoords).food) {
            this.score++;
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('lwc_snake_high', this.highScore);
            }
            this.addSpeed();
            this.tail.push(newHeadCoords);
            this.setGameBlock(newHeadCoords, { food: false });
            this.generateFood();
        }
    }

    addKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            e.preventDefault();
            switch (e.key) {
                case 'ArrowUp':
                    this.xSpeed = 0;
                    this.ySpeed = -1;
                    break;
                case 'ArrowDown':
                    this.xSpeed = 0;
                    this.ySpeed = 1;
                    break;
                case 'ArrowLeft':
                    this.xSpeed = -1;
                    this.ySpeed = 0;
                    break;
                case 'ArrowRight':
                    this.xSpeed = 1;
                    this.ySpeed = 0;
                    break;
                default:
                    break;
            }
        });
    }

    generateFood() {
        let xFood = Math.floor(Math.random() * (this.xMax - 1));
        let yFood = Math.floor(Math.random() * (this.yMax - 1));
        const foodCoords = `${xFood}:${yFood}`;

        if (this.tail.includes(foodCoords)) {
            return this.generateFood();
        }
        this.setGameBlock(foodCoords, { food: true, class: 'food' });
    }

    renderGameBlocks() {
        const container = this.template.querySelector('.game-container');
        const eWidth = container.clientWidth;
        const eHeight = container.clientHeight;

        this.xMax = Math.floor(eWidth / this.blockSize);
        this.yMax = Math.floor(eHeight / this.blockSize);

        this.gameBlocks = new Map();

        for (let y = 0; y < this.yMax; y++) {
            for (let x = 0; x < this.xMax; x++) {
                const coords = `${x}:${y}`;
                this.setGameBlock(coords, {
                    id: coords,
                    snake: false,
                    food: false,
                    class: ''
                });

                if (coords === '0:0') {
                    this.setGameBlock(coords, {
                        snake: true,
                        class: 'snake'
                    });
                }
            }
        }
    }

    renderedCallback() {
        if (!this.renderComplete) {
            this.renderComplete = true;
            this.renderGameBlocks();
            this.addKeyboardControls();
            this.generateFood();
        }
    }

    resetGame() {
        this.xSpeed = 1;
        this.ySpeed = 0;

        this.xHead = 0;
        this.yHead = 0;

        this.tail = [];

        this.score = 0;
        this.speed = 1;

        this.renderGameBlocks();
        this.generateFood();
        this.startGame();
    }

    exitGame() {
        this.showOverlay = true;
        this.gameOver = true;
        clearInterval(this.intervalObj);
    }

    setGameBlock(coords, args = {}) {
        const gameBlock = this.gameBlocks.get(coords) || {};
        this.gameBlocks.set(coords, Object.assign({}, gameBlock, args));
        this.renderGameBoard();
    }
}
