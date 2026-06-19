(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    setInterval(function () {
      showSlide(index + 1);
    }, 5600);
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  var filterList = document.querySelector('[data-filter-list]');

  if (filterPanel && filterList) {
    var textInput = filterPanel.querySelector('[data-filter-text]');
    var categorySelect = filterPanel.querySelector('[data-filter-category]');
    var regionInput = filterPanel.querySelector('[data-filter-region]');
    var yearInput = filterPanel.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));

    function normalize(value) {
      return (value || '').toString().toLowerCase().trim();
    }

    function applyFilters() {
      var text = normalize(textInput && textInput.value);
      var category = normalize(categorySelect && categorySelect.value);
      var region = normalize(regionInput && regionInput.value);
      var year = normalize(yearInput && yearInput.value);

      cards.forEach(function (card) {
        var content = normalize(card.textContent + ' ' + card.dataset.title + ' ' + card.dataset.type);
        var cardCategory = normalize(card.dataset.category);
        var cardRegion = normalize(card.dataset.region);
        var cardYear = normalize(card.dataset.year);
        var visible = true;

        if (text && content.indexOf(text) === -1) {
          visible = false;
        }

        if (category && cardCategory !== category) {
          visible = false;
        }

        if (region && cardRegion.indexOf(region) === -1) {
          visible = false;
        }

        if (year && cardYear.indexOf(year) === -1) {
          visible = false;
        }

        card.classList.toggle('is-filtered-out', !visible);
      });
    }

    [textInput, categorySelect, regionInput, yearInput].forEach(function (input) {
      if (input) {
        input.addEventListener('input', applyFilters);
        input.addEventListener('change', applyFilters);
      }
    });
  }
})();

function initMoviePlayer(source) {
  var video = document.querySelector('[data-movie-video]');
  var start = document.querySelector('[data-player-start]');

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (video.dataset.ready === 'true') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsInstance = hls;
    } else {
      video.src = source;
    }

    video.dataset.ready = 'true';
  }

  function playVideo() {
    attachSource();

    if (start) {
      start.classList.add('is-hidden');
    }

    var playPromise = video.play();

    if (playPromise && playPromise.catch) {
      playPromise.catch(function () {});
    }
  }

  if (start) {
    start.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', function () {
    if (start) {
      start.classList.add('is-hidden');
    }
  });
}

(function () {
  var form = document.querySelector('[data-site-search-form]');
  var input = document.querySelector('[data-site-search-input]');
  var results = document.querySelector('[data-search-results]');

  if (!form || !input || !results || !window.moviesData) {
    return;
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function render(query) {
    var keyword = normalize(query);
    var list = window.moviesData.filter(function (movie) {
      var text = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category,
        movie.tags
      ].join(' '));

      return !keyword || text.indexOf(keyword) !== -1;
    }).slice(0, 120);

    results.innerHTML = list.map(function (movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<article class="movie-card">' +
        '<a class="poster" href="' + movie.file + '">' +
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="poster-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.type) + '</span>' +
        '</a>' +
        '<div class="card-body">' +
        '<h3><a href="' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
        '</div>' +
        '</article>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    render(input.value);

    if (history.replaceState) {
      var url = input.value ? 'search.html?q=' + encodeURIComponent(input.value) : 'search.html';
      history.replaceState(null, '', url);
    }
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  input.value = query;
  render(query);
})();
