import { H as Hls } from './hls-dru42stk.js';

function ready(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
        return;
    }

    callback();
}

function initMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-mobile-menu]');

    if (!toggle || !menu) {
        return;
    }

    toggle.addEventListener('click', () => {
        menu.classList.toggle('is-open');
    });
}

function initHeroCarousel() {
    const carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
        return;
    }

    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function showSlide(index) {
        current = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === current);
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function restartTimer() {
        if (timer) {
            window.clearInterval(timer);
        }

        timer = window.setInterval(() => {
            showSlide(current + 1);
        }, 5200);
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            restartTimer();
        });
    });

    if (prev) {
        prev.addEventListener('click', () => {
            showSlide(current - 1);
            restartTimer();
        });
    }

    if (next) {
        next.addEventListener('click', () => {
            showSlide(current + 1);
            restartTimer();
        });
    }

    showSlide(0);
    restartTimer();
}

function initFilters() {
    const scopes = document.querySelectorAll('[data-filter-scope]');

    scopes.forEach((scope) => {
        const input = scope.querySelector('[data-filter-input]');
        const cards = Array.from(scope.querySelectorAll('[data-filter-card]'));
        const buttons = Array.from(scope.querySelectorAll('[data-filter-button]'));
        const sortSelect = scope.querySelector('[data-sort-select]');
        const sortableList = scope.querySelector('.sortable-list');
        let activeFilter = '';

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            const query = normalize(input ? input.value : '');

            cards.forEach((card) => {
                const haystack = normalize(card.dataset.search);
                const genre = normalize(card.dataset.genre);
                const region = normalize(card.dataset.region);
                const type = normalize(card.dataset.type);
                const category = normalize(card.dataset.category);
                const tags = normalize(card.dataset.tags);
                const matchesQuery = !query || haystack.includes(query);
                const matchesButton = !activeFilter || [genre, region, type, category, tags, haystack].some((value) => value.includes(activeFilter));

                card.classList.toggle('is-hidden-by-filter', !(matchesQuery && matchesButton));
            });
        }

        function applySort() {
            if (!sortSelect || !sortableList) {
                return;
            }

            const value = sortSelect.value;
            const sortedCards = [...cards].sort((a, b) => {
                if (value === 'year') {
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                }

                if (value === 'title') {
                    return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
                }

                return Number(b.dataset.hot || 0) - Number(a.dataset.hot || 0);
            });

            sortedCards.forEach((card) => sortableList.appendChild(card));
        }

        if (input) {
            const params = new URLSearchParams(window.location.search);
            const query = params.get('q');

            if (query) {
                input.value = query;
            }

            input.addEventListener('input', applyFilter);
        }

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                activeFilter = normalize(button.dataset.filterValue);
                buttons.forEach((item) => item.classList.toggle('is-active', item === button));
                applyFilter();
            });
        });

        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                applySort();
                applyFilter();
            });
        }

        applySort();
        applyFilter();
    });
}

function initPlayer() {
    const panel = document.querySelector('[data-player]');

    if (!panel) {
        return;
    }

    const video = panel.querySelector('video');
    const button = panel.querySelector('[data-play-button]');
    const scrollButton = document.querySelector('[data-scroll-player]');
    const source = panel.dataset.src || (button ? button.dataset.src : '');
    let hlsInstance = null;
    let sourceAttached = false;

    if (!video || !button || !source) {
        return;
    }

    function attachSource() {
        if (sourceAttached) {
            return;
        }

        sourceAttached = true;

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            video.src = source;
        }
    }

    async function playVideo() {
        attachSource();
        panel.classList.add('is-playing');
        video.controls = true;

        try {
            await video.play();
        } catch (error) {
            video.muted = true;
            try {
                await video.play();
            } catch (secondError) {
                panel.classList.remove('is-playing');
                video.controls = true;
            }
        }
    }

    button.addEventListener('click', playVideo);

    if (scrollButton) {
        scrollButton.addEventListener('click', (event) => {
            event.preventDefault();
            panel.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            playVideo();
        });
    }

    window.addEventListener('beforeunload', () => {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

ready(() => {
    initMenu();
    initHeroCarousel();
    initFilters();
    initPlayer();
});
