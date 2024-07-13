document.addEventListener("DOMContentLoaded", () => {
    showSection('menu');
    loadCredits();
    loadHighScores();
});

function showSection(sectionId) {
    document.querySelectorAll('.menu, .section').forEach(el => el.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
}

function pauseGame() {
    alert('Jogo pausado');
}

function loadCredits() {
    fetch('data/credits.txt')
        .then(response => response.text())
        .then(data => document.getElementById('credits-content').textContent = data);
}

function loadHighScores() {
    fetch('data/highscores.txt')
        .then(response => response.text())
        .then(data => document.getElementById('highscores-content').textContent = data);
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
        square.style.backgroundColor = candyColors[randomColor];
        grid.appendChild(square);
        squares.push(square);
    }
}

createBoard();

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
    colorBeingDragged = this.style.backgroundColor;
    squareIdBeingDragged = parseInt(this.id);
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
}

function dragLeave() {
}

function dragDrop() {
    colorBeingReplaced = this.style.backgroundColor;
    squareIdBeingReplaced = parseInt(this.id);
    squares[squareIdBeingDragged].style.backgroundColor = colorBeingReplaced;
    squares[squareIdBeingReplaced].style.backgroundColor = colorBeingDragged;
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
        squares[squareIdBeingReplaced].style.backgroundColor = colorBeingReplaced;
        squares[squareIdBeingDragged].style.backgroundColor = colorBeingDragged;
    } else squares[squareIdBeingDragged].style.backgroundColor = colorBeingDragged;
}

// Verificar linhas de três
function checkRowForThree() {
    for (let i = 0; i < 61; i++) {
        let rowOfThree = [i, i + 1, i + 2];
        let decidedColor = squares[i].style.backgroundColor;
        const isBlank = squares[i].style.backgroundColor === '';

        if (rowOfThree.every(index => squares[index].style.backgroundColor === decidedColor && !isBlank)) {
            score += 250;
            rowOfThree.forEach(index => {
                squares[index].style.backgroundColor = '';
            });
        }
    }
}

// Verificar colunas de três
function checkColumnForThree() {
    for (let i = 0; i < 47; i++) {
        let columnOfThree = [i, i + width, i + width * 2];
        let decidedColor = squares[i].style.backgroundColor;
        const isBlank = squares[i].style.backgroundColor === '';

        if (columnOfThree.every(index => squares[index].style.backgroundColor === decidedColor && !isBlank)) {
            score += 250;
            columnOfThree.forEach(index => {
                squares[index].style.backgroundColor = '';
            });
        }
    }
}

// Verificar linhas de quatro
function checkRowForFour() {
    for (let i = 0; i < 60; i++) {
        let rowOfFour = [i, i + 1, i + 2, i + 3];
        let decidedColor = squares[i].style.backgroundColor;
        const isBlank = squares[i].style.backgroundColor === '';

        if (rowOfFour.every(index => squares[index].style.backgroundColor === decidedColor && !isBlank)) {
            score += 500;
            rowOfFour.forEach(index => {
                squares[index].style.backgroundColor = '';
            });
        }
    }
}

// Verificar colunas de quatro
function checkColumnForFour() {
    for (let i = 0; i < 39; i++) {
        let columnOfFour = [i, i + width, i + width * 2, i + width * 3];
        let decidedColor = squares[i].style.backgroundColor;
        const isBlank = squares[i].style.backgroundColor === '';

        if (columnOfFour.every(index => squares[index].style.backgroundColor === decidedColor && !isBlank)) {
            score += 500;
            columnOfFour.forEach(index => {
                squares[index].style.backgroundColor = '';
            });
        }
    }
}

// Mover doces para baixo
function moveIntoSquareBelow() {
    for (let i = 0; i < 55; i++) {
        if (squares[i + width].style.backgroundColor === '') {
            squares[i + width].style.backgroundColor = squares[i].style.backgroundColor;
            squares[i].style.backgroundColor = '';
        }
        const firstRow = [0, 1, 2, 3, 4, 5, 6, 7];
        const isFirstRow = firstRow.includes(i);
        if (isFirstRow && squares[i].style.backgroundColor === '') {
            let randomColor = Math.floor(Math.random() * candyColors.length);
            squares[i].style.backgroundColor = candyColors[randomColor];
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
