(function () {
    var header = document.querySelector('[data-header]');
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 16) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (menuButton && mobileMenu && header) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
            header.classList.toggle('menu-open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('is-missing');
        }, { once: true });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeSlide = 0;
    var timer = null;

    function setSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle('active', current === activeSlide);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle('active', current === activeSlide);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            setSlide(activeSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            window.clearInterval(timer);
            setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            startHero();
        });
    });

    startHero();

    var input = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var activeFilter = 'all';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
        var query = normalize(input ? input.value : '');
        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search'));
            var channel = card.getAttribute('data-channel') || '';
            var matchesQuery = !query || text.indexOf(query) !== -1;
            var matchesFilter = activeFilter === 'all' || channel === activeFilter;
            card.classList.toggle('is-filtered', !(matchesQuery && matchesFilter));
        });
    }

    if (input) {
        input.addEventListener('input', filterCards);
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            activeFilter = chip.getAttribute('data-filter') || 'all';
            chips.forEach(function (item) {
                item.classList.toggle('active', item === chip);
            });
            filterCards();
        });
    });

    var player = document.querySelector('[data-player]');
    var playButton = document.querySelector('[data-play-button]');

    function loadPlayer() {
        if (!player) {
            return;
        }
        var video = player.querySelector('video');
        if (!video) {
            return;
        }
        var source = video.getAttribute('data-video');
        if (!source) {
            return;
        }
        if (playButton) {
            playButton.classList.add('hidden');
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.src !== source) {
                video.src = source;
            }
            video.play().catch(function () {});
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (!video._hlsInstance) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                video._hlsInstance = hls;
            }
            video.play().catch(function () {});
            return;
        }
        if (video.src !== source) {
            video.src = source;
        }
        video.play().catch(function () {});
    }

    if (playButton) {
        playButton.addEventListener('click', loadPlayer);
    }

    if (player) {
        player.addEventListener('click', function (event) {
            if (event.target && event.target.closest && event.target.closest('video')) {
                return;
            }
            if (playButton && !playButton.classList.contains('hidden')) {
                loadPlayer();
            }
        });
    }
})();
