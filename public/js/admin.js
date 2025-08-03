'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // --- News Management Elements ---
    const addNewsForm = document.getElementById('add-news-form');
    const newsList = document.getElementById('news-management-list');

    // --- Event Management Elements ---
    const addEventForm = document.getElementById('add-event-form');
    const eventList = document.getElementById('event-management-list');


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
                body: formData, // No 'Content-Type' header, browser sets it for multipart/form-data
            });
            if (!response.ok) throw new Error((await response.json()).message);
            addEventForm.reset();
            await loadEvents();
        } catch (error) {
            alert(error.message);
        }
    };


    // --- Generic Delete Function ---
    const handleDelete = async (event) => {
        const button = event.target.closest('.btn-delete');
        if (!button) return;

        const type = button.dataset.type;
        const id = button.dataset.id;
        if (!confirm(`この${type === 'news' ? 'お知らせ' : 'イベント'}を本当に削除しますか？`)) {
            return;
        }

        try {
            const response = await fetch(`/api/${type}s/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error((await response.json()).message);
            
            if (type === 'news') await loadNews();
            else if (type === 'event') await loadEvents();

        } catch (error) {
            alert(error.message);
        }
    };


    // --- Event Listeners ---
    addNewsForm.addEventListener('submit', handleAddNews);
    addEventForm.addEventListener('submit', handleAddEvent);
    document.querySelector('.admin-container').addEventListener('click', handleDelete);


    // --- Initial Load ---
    loadNews();
    loadEvents();
});