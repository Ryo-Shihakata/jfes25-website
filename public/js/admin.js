'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // --- Element Cache ---
    const addNewsForm = document.getElementById('add-news-form');
    const newsList = document.getElementById('news-management-list');
    const addEventForm = document.getElementById('add-event-form');
    const eventList = document.getElementById('event-management-list');
    const timetableForm = document.getElementById('add-timetable-form');
    const timetableList = document.getElementById('timetable-management-list');
    const timetableIdField = document.getElementById('timetable-id');

    // --- News Functions ---
    const loadNews = async () => {
        try {
            const response = await fetch('/api/news');
            if (!response.ok) throw new Error('お知らせの読み込みに失敗しました。');
            const newsItems = await response.json();
            newsList.innerHTML = '';
            if (newsItems.length === 0) {
                newsList.innerHTML = '<li>登録されているお知らせはありません。</li>';
                return;
            }
            newsItems.forEach(item => {
                const listItem = document.createElement('li');
                const date = new Date(item.date).toLocaleString('ja-JP');
                listItem.innerHTML = `
                    <div class="item-info">
                        <strong>${item.title}</strong> [${item.category}]
                        <span>${date}</span>
                    </div>
                    <button class="btn-delete" data-type="news" data-id="${item.id}">削除</button>
                `;
                newsList.appendChild(listItem);
            });
        } catch (error) {
            newsList.innerHTML = `<li>${error.message}</li>`;
        }
    };

    const handleAddNews = async (event) => {
        event.preventDefault();
        const formData = new FormData(addNewsForm);
        const newsData = {
            title: formData.get('title'),
            category: formData.get('category'),
            content: formData.get('content'),
        };
        try {
            const response = await fetch('/api/news', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newsData),
            });
            if (!response.ok) throw new Error((await response.json()).message);
            addNewsForm.reset();
            await loadNews();
        } catch (error) {
            alert(error.message);
        }
    };

    // --- Event Functions ---
    const loadEvents = async () => {
        try {
            const response = await fetch('/api/events');
            if (!response.ok) throw new Error('イベントの読み込みに失敗しました。');
            const eventItems = await response.json();
            eventList.innerHTML = '';
            if (eventItems.length === 0) {
                eventList.innerHTML = '<li>登録されているイベントはありません。</li>';
                return;
            }
            eventItems.forEach(item => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <div class="item-info">
                        ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title}">` : ''}
                        <strong>${item.title}</strong> [${item.category}]
                        <span>場所: ${item.location}</span>
                    </div>
                    <button class="btn-delete" data-type="event" data-id="${item.id}">削除</button>
                `;
                eventList.appendChild(listItem);
            });
        } catch (error) {
            eventList.innerHTML = `<li>${error.message}</li>`;
        }
    };

    const handleAddEvent = async (event) => {
        event.preventDefault();
        const formData = new FormData(addEventForm);
        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error((await response.json()).message);
            addEventForm.reset();
            await loadEvents();
        } catch (error) {
            alert(error.message);
        }
    };

    // --- Timetable Functions ---
    const loadTimetable = async () => {
        try {
            const response = await fetch('/api/timetable');
            if (!response.ok) throw new Error('タイムテーブルの読み込みに失敗しました。');
            const items = await response.json();
            timetableList.innerHTML = '';
            if (items.length === 0) {
                timetableList.innerHTML = '<li>登録されているタイムテーブル項目はありません。</li>';
                return;
            }
            items.forEach(item => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <div class="item-info">
                        <strong>${item.title}</strong> (${item.startTime} - ${item.endTime})
                        <span>[${item.day}日目] ${item.location}</span>
                    </div>
                    <div>
                        <button class="btn-edit" data-type="timetable" data-id='${JSON.stringify(item)}'>編集</button>
                        <button class="btn-delete" data-type="timetable" data-id="${item.id}">削除</button>
                    </div>
                `;
                timetableList.appendChild(listItem);
            });
        } catch (error) {
            timetableList.innerHTML = `<li>${error.message}</li>`;
        }
    };

    const handleAddOrUpdateTimetable = async (event) => {
        event.preventDefault();
        const formData = new FormData(timetableForm);
        const data = Object.fromEntries(formData.entries());
        const id = data.id;

        if (!id) delete data.id;

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/timetable/${id}` : '/api/timetable';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || '保存に失敗しました。');
            }
            timetableForm.reset();
            timetableIdField.value = '';
            document.querySelector('#add-timetable-form button[type="submit"]').textContent = 'タイムテーブルに追加';
            await loadTimetable();
        } catch (error) {
            alert(`エラー: ${error.message}`);
        }
    };

    const handleEditTimetable = (item) => {
        timetableIdField.value = item.id;
        document.getElementById('timetable-title').value = item.title;
        document.getElementById('timetable-location').value = item.location;
        document.getElementById('timetable-day').value = item.day;
        document.getElementById('timetable-startTime').value = item.startTime;
        document.getElementById('timetable-endTime').value = item.endTime;
        document.querySelector('#add-timetable-form button[type="submit"]').textContent = 'タイムテーブルを更新';
        timetableForm.scrollIntoView({ behavior: 'smooth' });
    };

    // --- Event Listeners ---
    addNewsForm.addEventListener('submit', handleAddNews);
    addEventForm.addEventListener('submit', handleAddEvent);
    timetableForm.addEventListener('submit', handleAddOrUpdateTimetable);

    document.querySelector('.admin-container').addEventListener('click', async (event) => {
        const deleteButton = event.target.closest('.btn-delete');
        const editButton = event.target.closest('.btn-edit');

        if (deleteButton) {
            const type = deleteButton.dataset.type;
            const id = deleteButton.dataset.id;
            
            // THIS IS THE FIX: Use the correct singular/plural endpoint
            const endpoint = (type === 'timetable') ? `/api/timetable/${id}` : `/api/${type}s/${id}`;

            let typeJP = '';
            switch(type) {
                case 'news': typeJP = 'お知らせ'; break;
                case 'event': typeJP = 'イベント'; break;
                case 'timetable': typeJP = 'タイムテーブル項目'; break;
                default: typeJP = '項目';
            }

            if (!confirm(`この${typeJP}を本当に削除しますか？`)) return;

            try {
                const response = await fetch(endpoint, { method: 'DELETE' });
                if (!response.ok) {
                    // Try to parse error message, but handle cases where it's not JSON
                    let errorMsg = '削除に失敗しました。';
                    try {
                        const err = await response.json();
                        errorMsg = err.message || errorMsg;
                    } catch (e) {
                        // The response was not JSON, likely an HTML error page.
                        // The error in the console is more informative in this case.
                        console.error("Failed to parse server error response as JSON.");
                    }
                    throw new Error(errorMsg);
                }
                
                if (type === 'news') await loadNews();
                else if (type === 'event') await loadEvents();
                else if (type === 'timetable') await loadTimetable();

            } catch (error) {
                alert(`エラー: ${error.message}`);
            }
        }

        if (editButton) {
            const type = editButton.dataset.type;
            if (type === 'timetable') {
                const itemData = JSON.parse(editButton.dataset.id);
                handleEditTimetable(itemData);
            }
        }
    });

    // --- Initial Load ---
    loadNews();
    loadEvents();
    loadTimetable();
});