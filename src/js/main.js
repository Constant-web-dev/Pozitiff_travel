'use strict';

const squareMainSide = document.querySelector('.square__main');
const squareUpcomingSide = document.querySelector('.square__upcoming');

const mainButton = document.querySelector('.square__button-box');
const cross = document.querySelector('.square__cross');

mainButton.addEventListener('click', () => {
    squareMainSide.style.display = 'none';
    squareUpcomingSide.style.display = 'grid';
});

cross.addEventListener('click', () => {
    squareMainSide.style.display = 'grid';
    squareUpcomingSide.style.display = 'none';
});