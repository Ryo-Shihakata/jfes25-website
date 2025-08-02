'use strict';

{
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('header nav');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
    });

    nav.addEventListener('click', () => {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
    });
}
