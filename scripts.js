document.addEventListener('DOMContentLoaded', () => {
    anime({
        targets: '.project',
        translateY: [-50, 0],
        opacity: [0, 1],
        delay: anime.stagger(200, {start: 500}),
        easing: 'easeOutExpo'
    });
});