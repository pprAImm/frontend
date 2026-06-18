(function() {
    const API_BASE = '';

    const params = new URLSearchParams(window.location.search);
    const seriesId = params.get('seriesId');
    let episodeId = params.get('episodeId');

    const video = document.getElementById('playerVideo');
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const speedLabel = document.getElementById('speedLabel');
    const speedMenu = document.getElementById('speedMenu');
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');
    const progressFill = document.getElementById('progressFill');
    const progressTrack = document.getElementById('progressTrack');
    const playerTitle = document.getElementById('playerTitle');
    const playerClose = document.getElementById('playerClose');
    const playerError = document.getElementById('playerError');

    let episodes = [];
    let currentIndex = -1;
    let progressSaveInterval = null;

    playerClose.addEventListener('click', function() {
        window.location.href = `series.html?id=${seriesId}`;
    });

    function formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function saveProgress() {
        if (!video.duration || !episodeId) return;
        fetch(`${API_BASE}/api/episodes/${episodeId}/progress`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                progress_seconds: Math.floor(video.currentTime),
                duration_seconds: Math.floor(video.duration),
                completed: video.ended || Math.abs(video.currentTime - video.duration) < 1
            })
        }).catch(function() {});
    }

    function restoreProgress(epId) {
        fetch(`${API_BASE}/api/episodes/${epId}/progress`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data && data.progress_seconds > 0 && !data.completed) {
                    const seekTo = data.progress_seconds;
                    if (video.readyState >= 1) {
                        video.currentTime = seekTo;
                    } else {
                        video.addEventListener('loadedmetadata', function onMeta() {
                            video.currentTime = seekTo;
                            video.removeEventListener('loadedmetadata', onMeta);
                        }, { once: true });
                    }
                }
            })
            .catch(function() {});
    }

    function startProgressTracking() {
        stopProgressTracking();
        progressSaveInterval = setInterval(saveProgress, 10000);
    }

    function stopProgressTracking() {
        if (progressSaveInterval) {
            clearInterval(progressSaveInterval);
            progressSaveInterval = null;
        }
    }

    function loadEpisode(epId) {
        fetch(`${API_BASE}/api/series/${seriesId}`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : Promise.reject(r))
            .then(data => {
                const s = data.series;
                if (!s) throw new Error('Series not found');
                episodes = data.episodes || [];
                currentIndex = episodes.findIndex(e => e.id == epId);
                if (currentIndex === -1 && episodes.length) currentIndex = 0;

                const ep = episodes[currentIndex];
                if (ep) {
                    episodeId = ep.id;
                    playerTitle.textContent = `${s.title} — Серия ${ep.episode_num || ''}: ${ep.title || ''}`;
                    const videoUrl = ep.tiktok_url;
                    if (videoUrl) {
                        let src = videoUrl.startsWith('http') ? videoUrl : `${API_BASE}${videoUrl}`;
                        if (window.location.protocol === 'https:' && src.startsWith('http://')) {
                            const u = new URL(src);
                            src = u.pathname + u.search;
                        }
                        if (typeof Hls !== 'undefined' && Hls.isSupported()) {
                            var hls = new Hls();
                            hls.loadSource(src);
                            hls.attachMedia(video);
                            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                                video.play().catch(function() {});
                            });
                        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                            video.src = src;
                            video.load();
                        } else {
                            video.style.display = 'none';
                            playerError.style.display = 'flex';
                            return;
                        }
                        playerError.style.display = 'none';
                        video.style.display = '';
                    } else {
                        video.style.display = 'none';
                        playerError.style.display = 'flex';
                    }
                }
                updateNavButtons();
                startProgressTracking();
                restoreProgress(epId);
            })
            .catch(function() {
                playerTitle.textContent = 'Ошибка загрузки';
            });
    }

    function updateNavButtons() {
        prevBtn.style.opacity = currentIndex <= 0 ? '0.3' : '1';
        prevBtn.style.pointerEvents = currentIndex <= 0 ? 'none' : 'auto';
        nextBtn.style.opacity = currentIndex >= episodes.length - 1 ? '0.3' : '1';
        nextBtn.style.pointerEvents = currentIndex >= episodes.length - 1 ? 'none' : 'auto';
    }

    function goToEpisode(index) {
        if (index < 0 || index >= episodes.length) return;
        video.pause();
        playBtn.textContent = '▶';
        const ep = episodes[index];
        window.history.replaceState(null, '', `player.html?seriesId=${seriesId}&episodeId=${ep.id}`);
        loadEpisode(ep.id);
    }

    prevBtn.addEventListener('click', function() {
        if (currentIndex > 0) goToEpisode(currentIndex - 1);
    });

    nextBtn.addEventListener('click', function() {
        if (currentIndex < episodes.length - 1) goToEpisode(currentIndex + 1);
    });

    playBtn.addEventListener('click', function() {
        if (video.paused) {
            video.play();
            playBtn.textContent = '⏸';
        } else {
            video.pause();
            playBtn.textContent = '▶';
        }
    });

    video.addEventListener('play', function() {
        playBtn.textContent = '⏸';
    });

    video.addEventListener('pause', function() {
        playBtn.textContent = '▶';
    });

    video.addEventListener('ended', function() {
        playBtn.textContent = '▶';
        saveProgress();
        if (currentIndex < episodes.length - 1) {
            goToEpisode(currentIndex + 1);
        }
    });

    window.addEventListener('beforeunload', function() {
        saveProgress();
    });

    document.addEventListener('visibilitychange', function() {
        if (document.hidden) saveProgress();
    });

    video.addEventListener('click', function() {
        playBtn.click();
    });

    video.addEventListener('error', function() {
        video.style.display = 'none';
        playerError.style.display = 'flex';
    });

    volumeSlider.addEventListener('input', function() {
        video.volume = parseFloat(this.value);
    });

    speedLabel.addEventListener('click', function(e) {
        e.stopPropagation();
        speedMenu.classList.toggle('open');
    });

    document.addEventListener('click', function() {
        speedMenu.classList.remove('open');
    });

    speedMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    document.querySelectorAll('.speed-option').forEach(function(opt) {
        opt.addEventListener('click', function() {
            const speed = parseFloat(this.dataset.speed);
            video.playbackRate = speed;
            speedLabel.textContent = `${speed}x`;
            document.querySelectorAll('.speed-option').forEach(function(o) {
                o.classList.remove('active');
            });
            this.classList.add('active');
            speedMenu.classList.remove('open');
        });
    });

    video.addEventListener('timeupdate', function() {
        currentTimeEl.textContent = formatTime(video.currentTime);
        if (video.duration) {
            const pct = (video.currentTime / video.duration) * 100;
            progressFill.style.width = `${pct}%`;
        }
    });

    video.addEventListener('loadedmetadata', function() {
        totalTimeEl.textContent = formatTime(video.duration);
    });

    progressTrack.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        if (video.duration) {
            video.currentTime = pct * video.duration;
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        switch (e.key) {
            case ' ':
                e.preventDefault();
                playBtn.click();
                break;
            case 'ArrowLeft':
                video.currentTime = Math.max(0, video.currentTime - 10);
                break;
            case 'ArrowRight':
                video.currentTime = Math.min(video.duration || Infinity, video.currentTime + 10);
                break;
            case 'ArrowUp':
                e.preventDefault();
                video.volume = Math.min(1, video.volume + 0.1);
                volumeSlider.value = video.volume;
                break;
            case 'ArrowDown':
                e.preventDefault();
                video.volume = Math.max(0, video.volume - 0.1);
                volumeSlider.value = video.volume;
                break;
            case 'f':
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    document.documentElement.requestFullscreen();
                }
                break;
        }
    });

    if (seriesId && episodeId) {
        loadEpisode(episodeId);
    } else {
        playerTitle.textContent = 'Укажите сериал и серию';
    }
})();