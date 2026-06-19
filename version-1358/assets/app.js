(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function bindMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".nav-links");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function bindGlobalSearch() {
        var forms = document.querySelectorAll("[data-global-search]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q'], input[type='search']");
                var value = input ? input.value.trim() : "";
                var target = "./movies.html";
                if (value) {
                    target += "?q=" + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        });
    }

    function bindHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var next = Number(dot.getAttribute("data-slide"));
                if (!Number.isNaN(next)) {
                    show(next);
                }
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function getQueryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function bindFilters() {
        var panels = document.querySelectorAll(".js-filter-panel");
        panels.forEach(function (panel) {
            var scope = panel.closest(".content-section") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".js-movie-card"));
            var keyword = panel.querySelector(".js-keyword");
            var year = panel.querySelector(".js-year");
            var region = panel.querySelector(".js-region");
            var type = panel.querySelector(".js-type");
            var initial = getQueryValue("q");
            if (keyword && initial) {
                keyword.value = initial;
            }
            function apply() {
                var q = keyword ? keyword.value.trim().toLowerCase() : "";
                var y = year ? year.value : "";
                var r = region ? region.value : "";
                var t = type ? type.value : "";
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var matched = true;
                    if (q && text.indexOf(q) === -1) {
                        matched = false;
                    }
                    if (y && card.getAttribute("data-year") !== y) {
                        matched = false;
                    }
                    if (r && card.getAttribute("data-region") !== r) {
                        matched = false;
                    }
                    if (t && card.getAttribute("data-type") !== t) {
                        matched = false;
                    }
                    card.hidden = !matched;
                });
            }
            [keyword, year, region, type].forEach(function (control) {
                if (!control) {
                    return;
                }
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            });
            panel.addEventListener("submit", function (event) {
                event.preventDefault();
                apply();
            });
            apply();
        });
    }

    window.initPlayer = function (source) {
        var video = document.getElementById("moviePlayer");
        var cover = document.querySelector(".player-cover");
        if (!video || !source) {
            return;
        }
        var started = false;
        var hlsInstance = null;
        function start() {
            if (cover) {
                cover.classList.add("is-hidden");
            }
            if (started) {
                video.play().catch(function () {});
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.play().catch(function () {});
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }
            video.src = source;
            video.play().catch(function () {});
        }
        if (cover) {
            cover.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        bindMenu();
        bindGlobalSearch();
        bindHero();
        bindFilters();
    });
})();
