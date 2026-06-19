(function () {
    function setup(player) {
        var video = player.querySelector('video');
        var cover = player.querySelector('.play-cover');
        var streamUrl = player.getAttribute('data-stream');
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached || !video || !streamUrl) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function start() {
            attach();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', start);
        }

        player.querySelectorAll('[data-play-button]').forEach(function (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                start();
            });
        });

        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.querySelectorAll('.video-player').forEach(setup);
})();
