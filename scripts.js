document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const content = document.getElementById('content');

    setTimeout(() => {
        loader.style.display = 'none';
        content.classList.remove('hidden');
    }, 2000);

    anime({
        targets: '.project',
        translateY: [-50, 0],
        opacity: [0, 1],
        delay: anime.stagger(200, {start: 500}),
        easing: 'easeOutExpo'
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__fadeInUp');
            }
        });
    });

    document.querySelectorAll('.project').forEach(project => {
        observer.observe(project);
    });
});