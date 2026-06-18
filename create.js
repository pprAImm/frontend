(function() {
    const API_BASE = '';

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
    const editId = params.get('editId') ? parseInt(params.get('editId'), 10) : params.get('id') ? parseInt(params.get('id'), 10) : null;

    const deleteSeriesBtn = document.getElementById('deleteSeriesBtn');

    const deleteSeriesBtn = document.getElementById('deleteSeriesBtn');

    let coverFile = null;
    let selectedCategories = new Set();
    let episodeCount = 0;
    let deletedEpisodeIds = [];

    imageArea.addEventListener('click', () => imageInput.click());

    imageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        coverFile = file;
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
                            imagePreview.src = s.cover_url;
                            imagePreview.style.display = 'block';
                            imagePlaceholder.style.display = 'none';
                            coverFile = null;
                        }
                        if (s.category_id && categories.length) {
                            const cat = categories.find(c => c.id === s.category_id);
                            if (cat) {
                                categoriesContainer.querySelectorAll('.category-chip').forEach(chip => {
                                    if (chip.dataset.slug === cat.slug) {
                                        chip.classList.add('selected');
                                        selectedCategories.add(cat.slug);
                                    }
                                });
                            }
                        }
                        const eps = data.episodes || [];
                        eps.forEach(ep => {
                            episodeCount++;
                            const row = createEpisodeRow(ep.title || '');
                            row.dataset.episodeId = ep.id;
                            const btn = row.querySelector('.episode-video-btn');
                            btn.textContent = '✓ видео загружено';
                            btn.classList.add('has-video');
                            // Кнопка удаления для существующего эпизода
                            addDeleteButton(row, ep.id);
                            episodesList.appendChild(row);
                        });
                        publishBtn.textContent = 'Сохранить';
                        deleteSeriesBtn.style.display = 'inline-block';
                    }
                }
            }
        } catch (_) {
            categoriesContainer.innerHTML = '<span style="color:rgba(255,255,255,0.3);font-size:0.9rem;">Не удалось загрузить категории</span>';
        }
    })();

    function addDeleteButton(row, episodeId) {
        const delBtn = document.createElement('button');
        delBtn.className = 'episode-remove-btn';
        delBtn.textContent = '×';
        delBtn.style.color = '#ff4444';
        delBtn.title = 'Удалить эпизод';
        delBtn.addEventListener('click', async function(e) {
            e.stopPropagation();
            if (!confirm('Удалить этот эпизод?')) return;
            try {
                const resp = await fetch(`${API_BASE}/api/episodes/${episodeId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                if (!resp.ok) {
                    const err = await resp.json().catch(() => ({}));
                    alert(err.error || 'Ошибка при удалении эпизода');
                    return;
                }
                deletedEpisodeIds.push(episodeId);
                row.remove();
            } catch (_) {
                alert('Ошибка сети при удалении эпизода');
            }
        });
        row.querySelector('.episode-remove-btn').replaceWith(delBtn);
    }

    function createEpisodeRow(title) {
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
        });

        const titleInputEp = document.createElement('input');
        titleInputEp.className = 'episode-title-input';
        titleInputEp.type = 'text';
        titleInputEp.value = title;
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
        const row = createEpisodeRow('');
        episodesList.appendChild(row);
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    deleteSeriesBtn.addEventListener('click', async function() {
        if (!confirm('Удалить сериал и все его эпизоды? Это действие нельзя отменить.')) return;
        if (!confirm('Вы уверены?')) return;
        try {
            deleteSeriesBtn.disabled = true;
            deleteSeriesBtn.textContent = 'Удаляем...';
            const resp = await fetch(`${API_BASE}/api/series/${editId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                alert(err.error || 'Ошибка при удалении сериала');
                deleteSeriesBtn.disabled = false;
                deleteSeriesBtn.textContent = 'Удалить сериал';
                return;
            }
            window.location.href = 'user.html';
        } catch (_) {
            alert('Ошибка сети при удалении сериала');
            deleteSeriesBtn.disabled = false;
            deleteSeriesBtn.textContent = 'Удалить сериал';
        }
    });

    publishBtn.addEventListener('click', async function() {
        const title = titleInput.value.trim();
        const description = descInput.value.trim();

        if (!editId && !coverFile) {
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

        const existingEpisodes = [];
        const newEpisodeRows = [];
        for (const row of rows) {
            const titleInput = row.querySelector('.episode-title-input');
            const videoInput = row.querySelector('input[type="file"]');
            const epTitle = titleInput.value.trim();

            if (row.dataset.episodeId) {
                existingEpisodes.push({ title: epTitle, id: parseInt(row.dataset.episodeId) });
                continue;
            }

            if (!videoInput.files[0]) {
                alert('Загрузите видео для каждой новой серии');
                return;
            }

            if (!epTitle) {
                alert('Введите название для каждой серии');
                return;
            }

            newEpisodeRows.push(row);
        }

        const nextEpNum = existingEpisodes.length + 1;
        const episodes = [];
        for (let i = 0; i < newEpisodeRows.length; i++) {
            const row = newEpisodeRows[i];
            const titleInput = row.querySelector('.episode-title-input');
            const videoInput = row.querySelector('input[type="file"]');
            episodes.push({
                title: titleInput.value.trim(),
                file: videoInput.files[0],
                existing: false,
                episodeNum: nextEpNum + i,
            });
        }

        publishBtn.disabled = true;

        try {
            let seriesId;

            if (editId) {
                // Режим редактирования — PUT
                publishBtn.textContent = 'Сохраняем сериал...';
                const metaForm = new FormData();
                metaForm.append('title', title);
                metaForm.append('description', description);
                metaForm.append('category_slugs', JSON.stringify(Array.from(selectedCategories)));
                if (coverFile) {
                    metaForm.append('cover', coverFile);
                }

                const metaResp = await fetch(`${API_BASE}/api/series/${editId}`, {
                    method: 'PUT',
                    credentials: 'include',
                    body: metaForm,
                });

                if (!metaResp.ok) {
                    const err = await metaResp.json().catch(() => ({}));
                    alert(err.error || 'Ошибка при сохранении сериала');
                    publishBtn.disabled = false;
                    publishBtn.textContent = 'Сохранить';
                    return;
                }

                seriesId = editId;
            } else {
                // Создание нового сериала — POST
                publishBtn.textContent = 'Создаём сериал...';
                const metaForm = new FormData();
                metaForm.append('title', title);
                metaForm.append('description', description);
                metaForm.append('category_slugs', JSON.stringify(Array.from(selectedCategories)));
                metaForm.append('cover', coverFile);

                const metaResp = await fetch(`${API_BASE}/api/series`, {
                    method: 'POST',
                    credentials: 'include',
                    body: metaForm,
                });

                if (!metaResp.ok) {
                    const err = await metaResp.json().catch(() => ({}));
                    alert(err.error || 'Ошибка при создании сериала');
                    publishBtn.disabled = false;
                    publishBtn.textContent = 'Выложить';
                    return;
                }

                const metaData = await metaResp.json();
                seriesId = metaData.id;
            }

            // Загружаем видео для НОВЫХ эпизодов
            const newEpisodes = episodes.filter(ep => !ep.existing);
            for (let i = 0; i < newEpisodes.length; i++) {
                const ep = newEpisodes[i];
                publishBtn.textContent = `Загружаем видео ${i + 1}/${newEpisodes.length}...`;

                const videoForm = new FormData();
                videoForm.append('file', ep.file);
                videoForm.append('series_id', String(seriesId));
                videoForm.append('title', ep.title);
                videoForm.append('episode_num', String(ep.episodeNum));

                const videoResp = await fetch(`/upload`, {
                    method: 'POST',
                    credentials: 'include',
                    body: videoForm,
                });

                if (!videoResp.ok) {
                    const errText = await videoResp.text();
                    alert(`Ошибка загрузки видео "${ep.title}": ${errText}`);
                    publishBtn.disabled = false;
                    publishBtn.textContent = editId ? 'Сохранить' : 'Выложить';
                    return;
                }
            }

            window.location.href = `series.html?id=${seriesId}`;
        } catch (_) {
            alert('Ошибка сети при сохранении сериала');
            publishBtn.disabled = false;
            publishBtn.textContent = editId ? 'Сохранить' : 'Выложить';
        }
    });
})();
