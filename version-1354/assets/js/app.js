(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".nav-links");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero-slider]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        var prev = root.querySelector(".hero-prev");
        var next = root.querySelector(".hero-next");
        var index = Math.max(0, slides.findIndex(function (slide) {
            return slide.classList.contains("active");
        }));
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        show(index);
        restart();
    }

    function normalizeText(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".site-search-input"));
        var yearSelects = Array.prototype.slice.call(document.querySelectorAll(".year-filter"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
        if (!cards.length) {
            return;
        }

        function currentQuery() {
            var values = inputs.map(function (input) {
                return normalizeText(input.value);
            }).filter(Boolean);
            return values[values.length - 1] || "";
        }

        function currentYear() {
            var values = yearSelects.map(function (select) {
                return select.value;
            }).filter(Boolean);
            return values[values.length - 1] || "";
        }

        function apply() {
            var query = currentQuery();
            var year = currentYear();
            cards.forEach(function (card) {
                var text = normalizeText(card.getAttribute("data-search"));
                var yearValue = card.getAttribute("data-year") || "";
                var matchedQuery = !query || text.indexOf(query) !== -1;
                var matchedYear = !year || yearValue === year;
                card.classList.toggle("is-filtered-out", !(matchedQuery && matchedYear));
            });
        }

        inputs.forEach(function (input) {
            input.addEventListener("input", apply);
        });
        yearSelects.forEach(function (select) {
            select.addEventListener("change", apply);
        });
        apply();
    }

    function attachStream(video) {
        var stream = video.getAttribute("data-stream");
        if (!stream || video.getAttribute("data-ready") === "1") {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                maxBufferLength: 32,
                enableWorker: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            video.hlsPlayer = hls;
        } else {
            video.src = stream;
        }
        video.setAttribute("data-ready", "1");
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
        shells.forEach(function (shell) {
            var video = shell.querySelector("video[data-stream]");
            var button = shell.querySelector(".player-start");
            if (!video || !button) {
                return;
            }
            function start() {
                attachStream(video);
                button.classList.add("is-hidden");
                video.controls = true;
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        button.classList.remove("is-hidden");
                    });
                }
            }
            button.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
