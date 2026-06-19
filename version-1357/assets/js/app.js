(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function getItemText(item) {
        return [
            item.getAttribute("data-title"),
            item.getAttribute("data-year"),
            item.getAttribute("data-region"),
            item.getAttribute("data-type"),
            item.getAttribute("data-genre"),
            item.textContent
        ].join(" ").toLowerCase();
    }

    function bindFilter(root) {
        var targetSelector = root.getAttribute("data-filter-target");
        var target = targetSelector ? document.querySelector(targetSelector) : null;

        if (!target) {
            return;
        }

        var input = root.querySelector("[data-filter-input]");
        var yearSelect = root.querySelector("[data-filter-year]");
        var typeSelect = root.querySelector("[data-filter-type]");
        var sortSelect = root.querySelector("[data-filter-sort]");
        var count = root.querySelector("[data-filter-count]");
        var items = Array.prototype.slice.call(target.querySelectorAll("[data-filter-item]"));
        var defaultOrder = items.slice();

        function matchesYear(item, yearValue) {
            var itemYear = Number(item.getAttribute("data-year")) || 0;

            if (!yearValue) {
                return true;
            }

            if (yearValue === "older") {
                return itemYear < 2020;
            }

            return String(itemYear) === yearValue;
        }

        function applySort() {
            var value = sortSelect ? sortSelect.value : "default";
            var sorted = defaultOrder.slice();

            if (value === "year-desc") {
                sorted.sort(function (a, b) {
                    return (Number(b.getAttribute("data-year")) || 0) - (Number(a.getAttribute("data-year")) || 0);
                });
            }

            if (value === "year-asc") {
                sorted.sort(function (a, b) {
                    return (Number(a.getAttribute("data-year")) || 0) - (Number(b.getAttribute("data-year")) || 0);
                });
            }

            if (value === "title-asc") {
                sorted.sort(function (a, b) {
                    return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
                });
            }

            sorted.forEach(function (item) {
                target.appendChild(item);
            });
        }

        function applyFilter() {
            var query = normalize(input ? input.value : "");
            var yearValue = yearSelect ? yearSelect.value : "";
            var typeValue = typeSelect ? typeSelect.value : "";
            var visibleCount = 0;

            applySort();

            items.forEach(function (item) {
                var text = getItemText(item);
                var typeText = item.getAttribute("data-type") || "";
                var keywordMatch = !query || text.indexOf(query) !== -1;
                var yearMatch = matchesYear(item, yearValue);
                var typeMatch = !typeValue || typeText.indexOf(typeValue) !== -1 || text.indexOf(typeValue.toLowerCase()) !== -1;
                var visible = keywordMatch && yearMatch && typeMatch;

                item.classList.toggle("is-hidden", !visible);

                if (visible) {
                    visibleCount += 1;
                }
            });

            if (count) {
                count.textContent = String(visibleCount);
            }
        }

        if (document.body.getAttribute("data-page") === "search" && input) {
            var params = new URLSearchParams(window.location.search);
            var queryValue = params.get("q");

            if (queryValue) {
                input.value = queryValue;
            }
        }

        [input, yearSelect, typeSelect, sortSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });

        applyFilter();
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]")).forEach(bindFilter);
}());
