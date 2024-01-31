window.onload = () => {
    const game = new Game({
        newGameButton: document.querySelector('#start-button'),
        canvas: document.querySelector('#gameCanvas'),
        scoreElement: document.querySelector('#score'),
    });

};

