(function () {
    const header = document.querySelector('[data-header]');
    const menuButton = document.querySelector('[data-menu-button]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    function syncHeader() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 24);
    }

    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });

    if (menuButton && mobileNav && header) {
        menuButton.addEventListener('click', function () {
            const open = !mobileNav.classList.contains('is-open');
            mobileNav.classList.toggle('is-open', open);
            header.classList.toggle('is-open', open);
            document.body.classList.toggle('menu-open', open);
        });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
        const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
        let current = 0;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    });

    function applyFilters(scope) {
        const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));
        const searchInputs = Array.from(scope.querySelectorAll('[data-search]'));
        const yearSelect = scope.querySelector('[data-year-filter]');

        function filter() {
            const query = searchInputs.map(function (input) {
                return input.value.trim().toLowerCase();
            }).filter(Boolean).join(' ');
            const year = yearSelect ? yearSelect.value : '';

            cards.forEach(function (card) {
                const text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta')).toLowerCase();
                const meta = card.getAttribute('data-meta') || '';
                const matchQuery = !query || text.indexOf(query) !== -1;
                const matchYear = !year || meta.indexOf(year) !== -1;
                card.classList.toggle('is-hidden', !(matchQuery && matchYear));
            });
        }

        searchInputs.forEach(function (input) {
            input.addEventListener('input', filter);
        });

        if (yearSelect) {
            yearSelect.addEventListener('change', filter);
        }
    }

    applyFilters(document);
})();
