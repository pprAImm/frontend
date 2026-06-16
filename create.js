(function() {
    const API_BASE = `http://${window.location.hostname}:8081`;

    const imageArea = document.getElementById('imageDropArea');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const imagePlaceholder = document.getElementById('imagePlaceholder');
    const categoriesContainer = document.getElementById('categoriesContainer');
    const titleInput = document.getElementById('seriesTitle');
    const descInput = document.getElementById('seriesDescription');
    const episodesList = document.getElementById('episodesList');
    const addEpisodeBtn = document.getElementById('addEpisodeBtn');
    const publishBtn = document.getElementById('publishBtn');

    const params = new URLSearchParams(window.location.search);
    const editId = params.get('id') ? parseInt(params.get('id'), 10) : null;

    let coverFile = null;
    let coverUrl = null;
    let selectedCategories = new Set();
    let episodeCount = 0;

    imageArea.addEventListener('click', () => imageInput.click());

    imageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        coverFile = file;
        coverUrl = null;
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            imagePlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    });

    (async function loadCategories() {
        try {
            const resp = await fetch(`${API_BASE}/api/categories`, { credentials: 'include' });
            if (!resp.ok) throw new Error('Failed to load categories');
            const categories = await resp.json();
            categories.forEach(cat => {
                const chip = document.createElement('span');
                chip.className = 'category-chip';
                chip.textContent = cat.name;
                chip.dataset.slug = cat.slug;
                chip.addEventListener('click', function() {
                    this.classList.toggle('selected');
                    if (this.classList.contains('selected')) {
                        selectedCategories.add(cat.slug);
                    } else {
                        selectedCategories.delete(cat.slug);
                    }
                });
                categoriesContainer.appendChild(chip);
            });

            if (editId) {
                const seriesResp = await fetch(`${API_BASE}/api/series/${editId}`, { credentials: 'include' });
                if (seriesResp.ok) {
                    const data = await seriesResp.json();
                    const s = data.series;
                    if (s) {
                        titleInput.value = s.title || '';
                        descInput.value = s.description || '';
                        if (s.cover_url) {
                            coverUrl = s.cover_url;
                            imagePreview.src = s.cover_url;
                            imagePreview.style.display = 'block';
                            imagePlaceholder.style.display = 'none';
                        }
                        if (s.categories && categories.length) {
                            const slugs = s.categories.map(c => c.slug || c);
                            categoriesContainer.querySelectorAll('.category-chip').forEach(chip => {
                                if (slugs.includes(chip.dataset.slug)) {
                                    chip.classList.add('selected');
                                    selectedCategories.add(chip.dataset.slug);
                                }
                            });
                        }
                        const eps = data.episodes || [];
                        eps.forEach(ep => {
                            episodeCount++;
                            const row = createEpisodeRow();
                            row.querySelector('.episode-title-input').value = ep.title || '';
                            row.querySelector('.episode-video-btn').textContent = '✓ видео загружено';
                            row.querySelector('.episode-video-btn').classList.add('has-video');
                            row.dataset.hasExistingVideo = 'true';
                            episodesList.appendChild(row);
                        });
                        publishBtn.textContent = 'Сохранить';
                    }
                }
            }
        } catch (_) {
            categoriesContainer.innerHTML = '<span style="color:rgba(255,255,255,0.3);font-size:0.9rem;">Не удалось загрузить категории</span>';
        }
    })();

    function createEpisodeRow() {
        episodeCount++;
        const row = document.createElement('div');
        row.className = 'episode-row';
        row.dataset.episode = episodeCount;

        const videoBtn = document.createElement('button');
        videoBtn.className = 'episode-video-btn';
        videoBtn.textContent = 'добавьте видео';

        const videoInput = document.createElement('input');
        videoInput.type = 'file';
        videoInput.accept = 'video/*';
        videoInput.style.display = 'none';

        let videoFile = null;

        videoBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            videoInput.click();
        });

        videoInput.addEventListener('change', function() {
            const file = this.files[0];
            if (!file) return;
            videoFile = file;
            videoBtn.textContent = `✓ видео (${file.name.length > 20 ? file.name.slice(0, 17) + '...' : file.name})`;
            videoBtn.classList.add('has-video');
            row.dataset.hasExistingVideo = 'false';
        });

        const titleInputEp = document.createElement('input');
        titleInputEp.className = 'episode-title-input';
        titleInputEp.type = 'text';
        titleInputEp.placeholder = 'Название серии';

        const removeBtn = document.createElement('button');
        removeBtn.className = 'episode-remove-btn';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', function() {
            row.remove();
        });

        row.appendChild(videoBtn);
        row.appendChild(videoInput);
        row.appendChild(titleInputEp);
        row.appendChild(removeBtn);

        return row;
    }

    addEpisodeBtn.addEventListener('click', function() {
        const row = createEpisodeRow();
        episodesList.appendChild(row);
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    publishBtn.addEventListener('click', async function() {
        const title = titleInput.value.trim();
        const description = descInput.value.trim();

        if (!coverFile && !coverUrl) {
            alert('Загрузите обложку сериала');
            return;
        }

        if (!title) {
            alert('Введите название сериала');
            return;
        }

        if (selectedCategories.size === 0) {
            alert('Выберите хотя бы одну категорию');
            return;
        }

        const rows = episodesList.querySelectorAll('.episode-row');
        if (rows.length === 0) {
            alert('Добавьте хотя бы одну серию');
            return;
        }

        const episodes = [];
        for (const row of rows) {
            const titleInput = row.querySelector('.episode-title-input');
            const videoInput = row.querySelector('input[type="file"]');
            const epTitle = titleInput.value.trim();

            if (!editId && !videoInput.files[0]) {
                alert('Загрузите видео для каждой серии');
                return;
            }

            if (!epTitle) {
                alert('Введите название для каждой серии');
                return;
            }

            episodes.push({
                title: epTitle,
                file: videoInput.files[0] || null
            });
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category_slugs', JSON.stringify(Array.from(selectedCategories)));
        if (coverFile) {
            formData.append('cover', coverFile);
        } else if (coverUrl) {
            formData.append('cover_url', coverUrl);
        }
        formData.append('episodes', JSON.stringify(episodes.map(e => ({ title: e.title }))));
        episodes.forEach((ep, i) => {
            if (ep.file) {
                formData.append(`episode_video_${i}`, ep.file);
            }
        });

        try {
            const url = editId ? `${API_BASE}/api/series/${editId}` : `${API_BASE}/api/series`;
            const method = editId ? 'PUT' : 'POST';
            const resp = await fetch(url, {
                method,
                credentials: 'include',
                body: formData
            });
            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                alert(err.error || 'Ошибка при сохранении сериала');
                return;
            }
            const data = await resp.json();
            window.location.href = `series.html?id=${data.id}`;
        } catch (_) {
            alert('Ошибка сети при сохранении сериала');
        }
    });
})();