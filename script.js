class Tetris {
    constructor() {
        this.gameBoard = document.getElementById('game-board');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.startButton = document.getElementById('start-btn');
        
        // 移动端控制按钮
        this.rotateBtn = document.getElementById('rotate-btn');
        this.dropBtn = document.getElementById('drop-btn');
        this.leftBtn = document.getElementById('left-btn');
        this.rightBtn = document.getElementById('right-btn');
        
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.CELL_SIZE = 30;
        
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.isPlaying = false;
        
        this.currentPiece = null;
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        
        this.SHAPES = {
            I: [[1, 1, 1, 1]],
            O: [[1, 1], [1, 1]],
            T: [[0, 1, 0], [1, 1, 1]],
            S: [[0, 1, 1], [1, 1, 0]],
            Z: [[1, 1, 0], [0, 1, 1]],
            J: [[1, 0, 0], [1, 1, 1]],
            L: [[0, 0, 1], [1, 1, 1]]
        };
        
        this.COLORS = {
            I: '#00bcd4',
            O: '#ffeb3b',
            T: '#9c27b0',
            S: '#4caf50',
            Z: '#f44336',
            J: '#2196f3',
            L: '#ff9800'
        };
        
        this.init();
    }
    
    init() {
        this.createBoard();
        this.startButton.addEventListener('click', () => this.startGame());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // 添加移动端触控事件
        this.rotateBtn.addEventListener('click', () => {
            if (this.isPlaying) {
                this.rotate();
                this.draw();
            }
        });
        
        this.dropBtn.addEventListener('click', () => {
            if (this.isPlaying) {
                this.dropDown();
                this.draw();
            }
        });
        
        this.leftBtn.addEventListener('click', () => {
            if (this.isPlaying) {
                this.moveLeft();
                this.draw();
            }
        });
        
        this.rightBtn.addEventListener('click', () => {
            if (this.isPlaying) {
                this.moveRight();
                this.draw();
            }
        });
        
        // 防止移动端双击缩放
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // 防止移动端滚动
        document.addEventListener('touchmove', (e) => {
            if (this.isPlaying) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    createBoard() {
        this.gameBoard.innerHTML = '';
        for (let i = 0; i < this.BOARD_HEIGHT; i++) {
            for (let j = 0; j < this.BOARD_WIDTH; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                this.gameBoard.appendChild(cell);
            }
        }
    }
    
    startGame() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.gameOver = false;
        this.score = 0;
        this.level = 1;
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.updateScore();
        this.spawnPiece();
        this.gameLoop();
    }
    
    spawnPiece() {
        const shapes = Object.keys(this.SHAPES);
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        this.currentPiece = {
            shape: this.SHAPES[randomShape],
            color: randomShape,
            x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(this.SHAPES[randomShape][0].length / 2),
            y: 0
        };
        
        if (this.checkCollision()) {
            this.gameOver = true;
            this.isPlaying = false;
            alert('游戏结束！得分：' + this.score);
        }
    }
    
    checkCollision() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;
                    
                    if (boardX < 0 || boardX >= this.BOARD_WIDTH ||
                        boardY >= this.BOARD_HEIGHT ||
                        (boardY >= 0 && this.board[boardY][boardX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    mergePiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++;
            }
        }
        
        if (linesCleared > 0) {
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.score / 1000) + 1;
            this.updateScore();
        }
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
    }
    
    draw() {
        const cells = this.gameBoard.getElementsByClassName('cell');
        
        // 清空画板
        for (let i = 0; i < cells.length; i++) {
            cells[i].className = 'cell';
        }
        
        // 绘制已固定的方块
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    const index = y * this.BOARD_WIDTH + x;
                    cells[index].classList.add('filled', this.board[y][x]);
                }
            }
        }
        
        // 绘制当前方块
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        const boardY = this.currentPiece.y + y;
                        const boardX = this.currentPiece.x + x;
                        if (boardY >= 0) {
                            const index = boardY * this.BOARD_WIDTH + boardX;
                            cells[index].classList.add('filled', this.currentPiece.color);
                        }
                    }
                }
            }
        }
    }
    
    moveDown() {
        this.currentPiece.y++;
        if (this.checkCollision()) {
            this.currentPiece.y--;
            this.mergePiece();
            this.clearLines();
            this.spawnPiece();
        }
    }
    
    moveLeft() {
        this.currentPiece.x--;
        if (this.checkCollision()) {
            this.currentPiece.x++;
        }
    }
    
    moveRight() {
        this.currentPiece.x++;
        if (this.checkCollision()) {
            this.currentPiece.x--;
        }
    }
    
    rotate() {
        const originalShape = this.currentPiece.shape;
        const rows = originalShape.length;
        const cols = originalShape[0].length;
        
        // 创建新的旋转后的形状
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                rotated[x][rows - 1 - y] = originalShape[y][x];
            }
        }
        
        this.currentPiece.shape = rotated;
        if (this.checkCollision()) {
            this.currentPiece.shape = originalShape;
        }
    }
    
    dropDown() {
        while (!this.checkCollision()) {
            this.currentPiece.y++;
        }
        this.currentPiece.y--;
        this.mergePiece();
        this.clearLines();
        this.spawnPiece();
    }
    
    handleKeyPress(event) {
        if (!this.isPlaying) return;
        
        switch (event.keyCode) {
            case 37: // 左箭头
                this.moveLeft();
                break;
            case 39: // 右箭头
                this.moveRight();
                break;
            case 40: // 下箭头
                this.moveDown();
                break;
            case 38: // 上箭头
                this.rotate();
                break;
            case 32: // 空格
                this.dropDown();
                break;
        }
        this.draw();
    }
    
    gameLoop() {
        if (!this.isPlaying) return;
        
        this.moveDown();
        this.draw();
        
        setTimeout(() => this.gameLoop(), 1000 / this.level);
    }
}

// 初始化游戏
const game = new Tetris(); 