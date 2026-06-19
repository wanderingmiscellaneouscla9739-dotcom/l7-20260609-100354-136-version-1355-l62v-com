(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupPlayers();
    });

    function setupNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var panel = document.querySelector(".mobile-nav-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        function activate(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                activate(index);
            });
        });
        window.setInterval(function () {
            activate(current + 1);
        }, 5200);
    }

    function setupFilters() {
        var search = document.querySelector(".page-search");
        var selects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var empty = document.querySelector(".empty-state");
        if (!cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var keyword = params.get("keyword");
        if (keyword && search) {
            search.value = keyword;
        }
        function normalize(value) {
            return (value || "").toString().toLowerCase();
        }
        function yearMatch(cardYear, selected) {
            if (!selected || selected === "全部年代") {
                return true;
            }
            var yearNumber = parseInt(cardYear, 10);
            if (selected === "2010-2019") {
                return yearNumber >= 2010 && yearNumber <= 2019;
            }
            if (selected === "2000-2009") {
                return yearNumber >= 2000 && yearNumber <= 2009;
            }
            if (selected === "更早") {
                return yearNumber > 0 && yearNumber < 2000;
            }
            return cardYear.indexOf(selected) !== -1;
        }
        function applyFilters() {
            var term = normalize(search ? search.value : "");
            var selected = {};
            selects.forEach(function (select) {
                selected[select.getAttribute("data-filter")] = select.value;
            });
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(" "));
                var matchText = !term || haystack.indexOf(term) !== -1;
                var matchYear = yearMatch(card.dataset.year || "", selected.year);
                var matchRegion = !selected.region || selected.region === "全部地区" || haystack.indexOf(normalize(selected.region)) !== -1;
                var matchGenre = !selected.genre || selected.genre === "全部类型" || haystack.indexOf(normalize(selected.genre)) !== -1;
                var show = matchText && matchYear && matchRegion && matchGenre;
                card.classList.toggle("hidden-by-filter", !show);
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        if (search) {
            search.addEventListener("input", applyFilters);
        }
        selects.forEach(function (select) {
            select.addEventListener("change", applyFilters);
        });
        applyFilters();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var start = player.querySelector(".player-start");
            if (!video || !start) {
                return;
            }
            var stream = start.getAttribute("data-stream") || video.getAttribute("data-stream");
            var loaded = false;
            var hlsInstance = null;
            function playStream() {
                if (!stream) {
                    return;
                }
                player.classList.add("is-playing");
                if (loaded) {
                    video.play().catch(function () {});
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    video.play().catch(function () {});
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    return;
                }
                video.src = stream;
                video.play().catch(function () {});
            }
            start.addEventListener("click", playStream);
            video.addEventListener("click", function () {
                if (!loaded) {
                    playStream();
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }
})();
