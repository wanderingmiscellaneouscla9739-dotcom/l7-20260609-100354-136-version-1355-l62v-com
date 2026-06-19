(function () {
    function canUseNative(video) {
        return video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');
    }

    function mount(wrapper) {
        const video = wrapper.querySelector('video');
        const button = wrapper.querySelector('[data-play-trigger]');
        const streamUrl = video ? video.getAttribute('data-stream') : '';
        let hls = null;
        let ready = false;

        if (!video || !button || !streamUrl) {
            return;
        }

        function attach() {
            if (ready) {
                return;
            }
            ready = true;

            if (canUseNative(video)) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                return;
            }

            video.src = streamUrl;
        }

        function start() {
            attach();
            button.hidden = true;
            const playTask = video.play();
            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {
                    button.hidden = false;
                });
            }
        }

        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (!ready || video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            button.hidden = true;
        });
        video.addEventListener('pause', function () {
            if (ready && video.currentTime === 0) {
                button.hidden = false;
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(mount);
})();
