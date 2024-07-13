document.addEventListener("DOMContentLoaded", () => {
    showSection('menu');
    loadCredits();
    loadHighScores();
    setupMusic();
});

function showSection(sectionId) {
    document.querySelectorAll('.menu, .section').forEach(el => el.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
}

let timerInterval;
let timeRemaining = 120; // 2 minutes in seconds
let gamePaused = false;

function startTimer() {
    timerInterval = setInterval(() => {
        if (!gamePaused) {
            timeRemaining--;
            updateTimerDisplay();
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                endGame();
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('timer').innerText = `Tempo: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function pauseGame() {
    gamePaused = !gamePaused;
    if (gamePaused) {
        clearInterval(timerInterval);
        const pauseMenu = confirm("Jogo pausado. Deseja ver os 10 melhores jogadores ou voltar ao menu principal?");
        if (pauseMenu) {
            showSection('highscores');
        } else {
            const confirmExit = confirm("Deseja realmente sair do jogo?");
            if (confirmExit) {
                showSection('menu');
            }
        }
    } else {
        startTimer();
    }
}

function loadCredits() {
    fetch('data/credits.txt')
        .then(response => response.text())
        .then(data => document.getElementById('credits-content').textContent = data);
}

function loadHighScores() {
    fetch('data/highscores.txt')
        .then(response => response.json())
        .then(data => {
            const scoresList = data.map(entry => `${entry.name}: ${entry.score}`).join('\n');
            document.getElementById('highscores-content').textContent = scoresList;
        });
}

function endGame() {
    const highscores = getHighScores();
    const lowestHighScore = highscores.length > 0 ? highscores[highscores.length - 1].score : 0;

    if (score >= lowestHighScore) {
        let playerName = prompt("Parabéns! Você entrou para o placar dos 10 melhores. Digite seu nome (máximo 10 caracteres):");
        if (playerName) {
            playerName = playerName.substring(0, 10);
            highscores.push({ name: playerName, score: score });
            highscores.sort((a, b) => b.score - a.score);
            if (highscores.length > 10) {
                highscores.pop();
            }
            saveHighScores(highscores);
            loadHighScores();
        }
    }
    showSection('menu');
}

function getHighScores() {
    let highscores = [];
    try {
        highscores = JSON.parse(localStorage.getItem('highscores')) || [];
    } catch (e) {
        console.error("Failed to load highscores from localStorage", e);
    }
    return highscores;
}

function saveHighScores(highscores) {
    try {
        localStorage.setItem('highscores', JSON.stringify(highscores));
    } catch (e) {
        console.error("Failed to save highscores to localStorage", e);
    }
}

// Implementar mecânicas do jogo Candy Crush

const grid = document.querySelector('#game-board');
const width = 8;
const squares = [];
const candyColors = [
    'red',
    'yellow',
    'orange',
    'purple',
    'green',
    'blue'
];

let score = 0;
let level = 1;

// Criar o tabuleiro
function createBoard() {
    for (let i = 0; i < width * width; i++) {
        const square = document.createElement('div');
        square.setAttribute('draggable', true);
        square.setAttribute('id', i);
        let randomColor = Math.floor(Math.random() * candyColors.length);
        square.style.backgroundImage = `url('images/sprites/${candyColors[randomColor]}.png')`;
        grid.appendChild(square);
        squares.push(square);
    }
}

createBoard();
startTimer();

// Funções de arrastar doces
let colorBeingDragged;
let colorBeingReplaced;
let squareIdBeingDragged;
let squareIdBeingReplaced;

squares.forEach(square => square.addEventListener('dragstart', dragStart));
squares.forEach(square => square.addEventListener('dragend', dragEnd));
squares.forEach(square => square.addEventListener('dragover', dragOver));
squares.forEach(square => square.addEventListener('dragenter', dragEnter));
squares.forEach(square => square.addEventListener('dragleave', dragLeave));
squares.forEach(square => square.addEventListener('drop', dragDrop));

function dragStart() {
    colorBeingDragged = this.style.backgroundImage;
    squareIdBeingDragged = parseInt(this.id);
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
}

function dragLeave() {}

function dragDrop() {
    colorBeingReplaced = this.style.backgroundImage;
    squareIdBeingReplaced = parseInt(this.id);
    squares[squareIdBeingDragged].style.backgroundImage = colorBeingReplaced;
    squares[squareIdBeingReplaced].style.backgroundImage = colorBeingDragged;
}

function dragEnd() {
    // O que constitui um movimento válido?
    let validMoves = [
        squareIdBeingDragged - 1,
        squareIdBeingDragged - width,
        squareIdBeingDragged + 1,
        squareIdBeingDragged + width
    ];
    let validMove = validMoves.includes(squareIdBeingReplaced);

    if (squareIdBeingReplaced && validMove) {
        squareIdBeingReplaced = null;
    } else if (squareIdBeingReplaced && !validMove) {
        squares[squareIdBeingReplaced].style.backgroundImage = colorBeingReplaced;
        squares[squareIdBeingDragged].style.backgroundImage = colorBeingDragged;
    } else squares[squareIdBeingDragged].style.backgroundImage = colorBeingDragged;
}

// Verificar linhas de três
function checkRowForThree() {
    for (let i = 0; i < 61; i++) {
        let rowOfThree = [i, i + 1, i + 2];
        let decidedColor = squares[i].style.backgroundImage;
        const isBlank = squares[i].style.backgroundImage === '';

        if (rowOfThree.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
            score += 250;  // Alterado para 250 pontos
            rowOfThree.forEach(index => {
                squares[index].style.backgroundImage = '';
            });
        }
    }
}

// Verificar colunas de três
function checkColumnForThree() {
    for (let i = 0; i < 47; i++) {
        let columnOfThree = [i, i + width, i + width * 2];
        let decidedColor = squares[i].style.backgroundImage;
        const isBlank = squares[i].style.backgroundImage === '';

        if (columnOfThree.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
            score += 250;  // Alterado para 250 pontos
            columnOfThree.forEach(index => {
                squares[index].style.backgroundImage = '';
            });
        }
    }
}

// Verificar linhas de quatro
function checkRowForFour() {
    for (let i = 0; i < 60; i++) {
        let rowOfFour = [i, i + 1, i + 2, i + 3];
        let decidedColor = squares[i].style.backgroundImage;
        const isBlank = squares[i].style.backgroundImage === '';

        if (rowOfFour.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
            score += 500;  // Alterado para 250 pontos
            rowOfFour.forEach(index => {
                squares[index].style.backgroundImage = '';
            });
        }
    }
}

// Verificar colunas de quatro
function checkColumnForFour() {
    for (let i = 0; i < 39; i++) {
        let columnOfFour = [i, i + width, i + width * 2, i + width * 3];
        let decidedColor = squares[i].style.backgroundImage;
        const isBlank = squares[i].style.backgroundImage === '';

        if (columnOfFour.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
            score += 500;  // Alterado para 250 pontos
            columnOfFour.forEach(index => {
                squares[index].style.backgroundImage = '';
            });
        }
    }
}

// Mover doces para baixo
function moveIntoSquareBelow() {
    for (let i = 0; i < 55; i++) {
        if (squares[i + width].style.backgroundImage === '') {
            squares[i + width].style.backgroundImage = squares[i].style.backgroundImage;
            squares[i].style.backgroundImage = '';
        }
        const firstRow = [0, 1, 2, 3, 4, 5, 6, 7];
        const isFirstRow = firstRow.includes(i);
        if (isFirstRow && squares[i].style.backgroundImage === '') {
            let randomColor = Math.floor(Math.random() * candyColors.length);
            squares[i].style.backgroundImage = `url('images/sprites/${candyColors[randomColor]}.png')`;
        }
    }
}

window.setInterval(function() {
    checkRowForFour();
    checkColumnForFour();
    checkRowForThree();
    checkColumnForThree();
    moveIntoSquareBelow();
    document.getElementById('score').innerText = 'Pontuação: ' + score;
    document.getElementById('level').innerText = 'Nível: ' + Math.floor(score / 1000) + 1;
}, 100);

// Música de fundo
function setupMusic() {
    const backgroundMusic = new Audio('songs/background.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.play();
}
