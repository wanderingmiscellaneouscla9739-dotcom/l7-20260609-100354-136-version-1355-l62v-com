(function() {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function() {
      var open = mobilePanel.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuButton.textContent = open ? '×' : '☰';
    });
  }

  var backTop = document.querySelector('.back-top');

  if (backTop) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 420) {
        backTop.classList.add('visible');
      } else {
        backTop.classList.remove('visible');
      }
    });

    backTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var prev = document.querySelector('.hero-control.prev');
  var next = document.querySelector('.hero-control.next');
  var current = 0;
  var timer = null;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function(slide, i) {
      slide.classList.toggle('active', i === current);
    });

    dots.forEach(function(dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  function startHeroTimer() {
    if (slides.length < 2) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function() {
      setSlide(current + 1);
    }, 5600);
  }

  dots.forEach(function(dot, i) {
    dot.addEventListener('click', function() {
      setSlide(i);
      startHeroTimer();
    });
  });

  if (prev) {
    prev.addEventListener('click', function() {
      setSlide(current - 1);
      startHeroTimer();
    });
  }

  if (next) {
    next.addEventListener('click', function() {
      setSlide(current + 1);
      startHeroTimer();
    });
  }

  setSlide(0);
  startHeroTimer();

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function(scope) {
    var searchInput = scope.querySelector('[data-card-search]');
    var yearSelect = scope.querySelector('[data-year-filter]');
    var regionSelect = scope.querySelector('[data-region-filter]');
    var tagButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
    var container = scope.parentElement.querySelector('[data-card-container]');
    var resultCount = scope.querySelector('[data-result-count]');

    if (!container) {
      return;
    }

    var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));
    var selectedTag = '';

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && searchInput) {
      searchInput.value = q;
    }

    function runFilter() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var count = 0;

      cards.forEach(function(card) {
        var text = card.textContent.toLowerCase();
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var matchRegion = !region || card.getAttribute('data-region') === region;
        var matchTag = !selectedTag || text.indexOf(selectedTag.toLowerCase()) !== -1;
        var visible = matchQuery && matchYear && matchRegion && matchTag;
        card.style.display = visible ? '' : 'none';
        if (visible) {
          count += 1;
        }
      });

      if (resultCount) {
        resultCount.textContent = count;
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', runFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', runFilter);
    }

    if (regionSelect) {
      regionSelect.addEventListener('change', runFilter);
    }

    tagButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        selectedTag = button.getAttribute('data-filter-value') || '';
        tagButtons.forEach(function(item) {
          item.classList.toggle('active', item === button);
        });
        runFilter();
      });
    });

    runFilter();
  });
})();

function initializePlayer(source) {
  var video = document.getElementById('videoPlayer');
  var overlay = document.getElementById('playerOverlay');
  var hlsPlayer = null;
  var prepared = false;

  if (!video || !overlay || !source) {
    return;
  }

  function prepareVideo() {
    if (prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsPlayer = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hlsPlayer.loadSource(source);
      hlsPlayer.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function playVideo() {
    prepareVideo();
    overlay.classList.add('is-hidden');
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function() {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', playVideo);

  video.addEventListener('play', function() {
    overlay.classList.add('is-hidden');
  });

  video.addEventListener('pause', function() {
    if (video.currentTime === 0 || video.ended) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function() {
    if (hlsPlayer) {
      hlsPlayer.destroy();
    }
  });
}
