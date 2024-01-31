// map to powers of 2 to tiles
const TILES = [
    { value: 1, color: '#000000', font: 'bold 55px Arial', text: '1', textColor: '#776e65' },
    { value: 2, color: '#eee4da', font: 'bold 55px Arial', text: '2', textColor: '#776e65' },
    { value: 4, color: '#ede0c8', font: 'bold 55px Arial', text: '4', textColor: '#776e65' },
    { value: 8, color: '#f2b179', font: 'bold 55px Arial', text: '8', textColor: '#f9f6f2' },
    { value: 16, color: '#f59563', font: 'bold 55px Arial', text: '16', textColor: '#f9f6f2' },
    { value: 32, color: '#f67c5f', font: 'bold 55px Arial', text: '32', textColor: '#f9f6f2' },
    { value: 64, color: '#f65e3b', font: 'bold 55px Arial', text: '64', textColor: '#f9f6f2' },
    { value: 128, color: '#edcf72', font: 'bold 55px Arial', text: '128', textColor: '#f9f6f2' },
    { value: 256, color: '#edcc61', font: 'bold 55px Arial', text: '256', textColor: '#f9f6f2' },
    { value: 512, color: '#edc850', font: 'bold 55px Arial', text: '512', textColor: '#f9f6f2' },
    { value: 1024, color: '#edc53f', font: 'bold 55px Arial', text: '1024', textColor: '#f9f6f2' },
    { value: 2048, color: '#edc22e', font: 'bold 55px Arial', text: '2048', textColor: '#f9f6f2' }
];

function tileFromValue(value) {
    const index = Math.log2(value);
    return TILES[index];
}

class Game {
    constructor(docElements) {
        this.docElements = docElements;
        this.docElements.newGameButton.onclick = () => { this.reset() };
        const canvas = docElements.canvas;
        const ctx = canvas.getContext('2d');
        this.ctx = ctx;
        this.score = 0;
        this.tiles = [];
        this.tileMargin = 10;
        this.tileSize = 100;
        this.boardSize = this.tileSize * 4 + this.tileMargin * 5;

        canvas.width = this.boardSize;
        canvas.height = this.boardSize;
        this.gridCellBG = "#eee4da59";
        this.keysLocked = false;
        this.isGameOver = false;
        this.reset();
    }


    reset() {
        this.unbindKeys();

        this.score = 0;
        this.isGameOver = false;
        this.tiles = new Array(16).fill(0);

        this.setTile(this.getRandomEmptyTile(), 2);
        this.setTile(this.getRandomEmptyTile(), 2);

        this.draw();

        this.bindKeys();
    }

    bindKeys() {
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    unbindKeys() {
        document.removeEventListener('keydown', this.onKeyDown.bind(this));
        document.removeEventListener('keyup', this.onKeyUp.bind(this));
    }

    setTile(pos, value) {
        this.tiles[pos.x + pos.y * 4] = value;
    }

    draw() {
        // the board
        const { ctx, boardSize } = this;
        ctx.fillStyle = '#bbada0';
        ctx.fillRect(0, 0, boardSize, boardSize);

        // the grid
        for (let i = 0; i < 4; i++) {
            const x = i * 110 + 10;
            for (let j = 0; j < 4; j++) {
                const y = j * 110 + 10;
                ctx.fillStyle = this.gridCellBG;
                ctx.fillRect(x, y, 100, 100);
            }
        }

        // the tiles
        const { tileSize, tileMargin } = this;
        for (let i = 0; i < this.tiles.length; i++) {
            const tileValue = this.tiles[i];
            if (tileValue === 0) continue;
            const tilePos = { x: i % 4, y: Math.floor(i / 4) };
            const x = tilePos.x * tileSize + tileMargin * (tilePos.x + 1);
            const y = tilePos.y * tileSize + tileMargin * (tilePos.y + 1);
            const tileData = tileFromValue(tileValue);

            ctx.fillStyle = tileData.color;
            ctx.fillRect(x, y, tileSize, tileSize);
            ctx.fillStyle = tileData.textColor;
            ctx.font = tileData.font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tileData.text, x + tileSize / 2, y + tileSize / 2);

        }

        this.docElements.scoreElement.innerHTML = this.score;

        if (this.isGameOver) {
            ctx.fillStyle = '#00000066';
            ctx.fillRect(0, 0, boardSize, boardSize);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 55px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Game Over', boardSize / 2, boardSize / 2);
        }
    }


    gameOver() {
        // remove event listeners
        this.unbindKeys();
        this.isGameOver = true;
        this.draw();
    }

    onKeyDown(e) {
        if (this.keysLocked) return;
        this.keysLocked = true;
        switch (e.keyCode) {
            case 37:
                this.moveLeft();
                break;
            case 38:
                this.moveUp();
                break;
            case 39:
                this.moveRight();
                break;
            case 40:
                this.moveDown();
                break;
        }
    }
    onKeyUp(e) {
        this.keysLocked = false;
    }

    moveLeft() {
        // move all tiles to the left
        for (let i = 0; i < this.tiles.length; i++) {
            const tileValue = this.tiles[i];
            if (tileValue === 0) continue;

            let x = i % 4;
            let y = Math.floor(i / 4);

            while (x > 0) {
                const leftTileValue = this.tiles[x - 1 + y * 4];
                if (leftTileValue === 0) {
                    this.setTile({ x: x - 1, y }, tileValue);
                    this.setTile({ x, y }, 0);
                    x--;
                } else if (leftTileValue === tileValue) {
                    this.setTile({ x: x - 1, y }, tileValue * 2);
                    this.setTile({ x, y }, 0);
                    this.score += tileValue * 2;
                    break;
                } else {
                    break;
                }
            }
        }
        this.addNewTile();
        this.draw();
        this.checkGameOver();
    }

    moveRight() {
        // move all tiles to the right
        for (let i = this.tiles.length - 1; i >= 0; i--) {
            const tileValue = this.tiles[i];
            if (tileValue === 0) continue;

            let x = i % 4;
            let y = Math.floor(i / 4);

            while (x < 3) {
                const rightTileValue = this.tiles[x + 1 + y * 4];
                if (rightTileValue === 0) {
                    this.setTile({ x: x + 1, y }, tileValue);
                    this.setTile({ x, y }, 0);
                    x++;
                } else if (rightTileValue === tileValue) {
                    this.setTile({ x: x + 1, y }, tileValue * 2);
                    this.setTile({ x, y }, 0);
                    this.score += tileValue * 2;
                    break;
                } else {
                    break;
                }
            }
        }
        this.addNewTile();
        this.draw();
        this.checkGameOver();
    }

    moveUp() {
        for (let i = 0; i < this.tiles.length; i++) {
            const tileValue = this.tiles[i];
            if (tileValue === 0) continue;

            let x = i % 4;
            let y = Math.floor(i / 4);

            while (y > 0) {
                const upTileValue = this.tiles[x + (y - 1) * 4];
                if (upTileValue === 0) {

                    this.setTile({ x, y: y - 1 }, tileValue);
                    this.setTile({ x, y }, 0);
                    this.draw();
                    y--;
                } else if (upTileValue === tileValue) {

                    this.setTile({ x, y: y - 1 }, tileValue * 2);
                    this.setTile({ x, y }, 0);
                    this.score += tileValue * 2;
                    this.draw();
                    break;
                } else {
                    break;
                }
            }
        }

        this.addNewTile();
        this.draw();
        this.checkGameOver();
    }

    moveDown() {
        for (let i = this.tiles.length - 1; i >= 0; i--) {
            const tileValue = this.tiles[i];
            if (tileValue === 0) continue;

            let x = i % 4;
            let y = Math.floor(i / 4);

            while (y < 3) {
                const downTileValue = this.tiles[x + (y + 1) * 4];
                if (downTileValue === 0) {
                    this.setTile({ x, y: y + 1 }, tileValue);
                    this.setTile({ x, y }, 0);
                    y++;
                } else if (downTileValue === tileValue) {
                    this.setTile({ x, y: y + 1 }, tileValue * 2);
                    this.setTile({ x, y }, 0);
                    this.score += tileValue * 2;
                    break;
                } else {
                    break;
                }
            }
        }

        this.addNewTile();
        this.draw();
        this.checkGameOver();
    }

    checkGameOver() {
        // check if there are any empty tiles
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i] === 0) {
                return;
            }
        }

        // check if there are any tiles that can be merged
        for (let i = 0; i < this.tiles.length; i++) {
            const tileValue = this.tiles[i];
            const x = i % 4;
            const y = Math.floor(i / 4);

            const rightTileValue = this.tiles[x + 1 + y * 4];
            const leftTileValue = this.tiles[x - 1 + y * 4];
            const upTileValue = this.tiles[x + (y - 1) * 4];
            const downTileValue = this.tiles[x + (y + 1) * 4];

            if (tileValue === rightTileValue || tileValue === leftTileValue || tileValue === upTileValue || tileValue === downTileValue) {
                return;
            }
        }

        this.gameOver();
    }

    addNewTile() {
        const pos = this.getRandomEmptyTile();
        const value = this.getRandomValue();
        this.setTile(pos, value);
    }


    getRandomEmptyTile() {
        // create an array of indices of empty tiles
        const emptyTiles = [];
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i] === 0) {
                emptyTiles.push(i);
            }
        }

        // create a random number between 0 and emptyTiles.length
        const random = Math.floor(Math.random() * emptyTiles.length);
        const val = emptyTiles[random];
        const pos = { x: val % 4, y: Math.floor(val / 4) };

        return pos;
    }

    getRandomValue() {
        return Math.random() < 0.9 ? 2 : 4;
    }
}