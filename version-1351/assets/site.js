(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var open = mobilePanel.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero-slider]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dotsWrap = hero.querySelector('.hero-dots');
        var index = 0;

        function showSlide(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        if (dotsWrap && slides.length > 1) {
            slides.forEach(function (_, slideIndex) {
                var dot = document.createElement('button');
                dot.className = 'hero-dot';
                dot.type = 'button';
                dot.setAttribute('aria-label', String(slideIndex + 1));
                dot.addEventListener('click', function () {
                    showSlide(slideIndex);
                });
                dotsWrap.appendChild(dot);
            });
            showSlide(0);
            setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }
    }

    function getParam(name) {
        return new URLSearchParams(window.location.search).get(name) || '';
    }

    function normalize(text) {
        return (text || '').toString().trim().toLowerCase();
    }

    var searchInput = document.querySelector('[data-search-input]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var mainQuery = document.querySelector('[data-main-query]');

    if (searchInput) {
        var query = getParam('q');
        if (query) {
            searchInput.value = query;
        }
        if (mainQuery) {
            mainQuery.value = query;
        }
    }

    function filterCards() {
        var grid = document.querySelector('.searchable-grid');
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.js-searchable-card'));
        var keyword = normalize(searchInput ? searchInput.value : '');
        var year = yearSelect ? yearSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-keywords'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-category'),
                card.getAttribute('data-year')
            ].join(' '));
            var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchYear = !year || card.getAttribute('data-year') === year;
            var show = matchKeyword && matchYear;
            card.style.display = show ? '' : 'none';
            if (show) {
                visible += 1;
            }
        });

        var empty = document.querySelector('.empty-state');
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterCards);
        filterCards();
    }

    if (yearSelect) {
        yearSelect.addEventListener('change', filterCards);
        filterCards();
    }
})();
