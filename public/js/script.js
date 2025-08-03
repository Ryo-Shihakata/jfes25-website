'use strict';

{
    // Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('header nav');
    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            nav.classList.toggle('active');
        });
        nav.addEventListener('click', () => {
            hamburger.classList.remove('active');
            nav.classList.remove('active');
        });
    }

    // Countdown Timer
    function setupCountdown() {
        const countdownElement = document.getElementById('countdown-days');
        if (!countdownElement) return;
        const eventDate = new Date('2025-09-05T00:00:00+09:00');
        const now = new Date();
        const diff = eventDate.getTime() - now.getTime();
        if (diff > 0) {
            countdownElement.textContent = Math.floor(diff / (1000 * 60 * 60 * 24));
        } else {
            const countdownContainer = document.getElementById('countdown');
            if (!countdownContainer) return;
            const day1_start = new Date('2025-09-05T00:00:00+09:00');
            const day1_end = new Date('2025-09-05T23:59:59+09:00');
            const day2_start = new Date('2025-09-06T00:00:00+09:00');
            const day2_end = new Date('2025-09-06T23:59:59+09:00');
            if (now >= day1_start && now <= day1_end) {
                countdownContainer.innerHTML = '<p>一日目開催中</p>';
            } else if (now >= day2_start && now <= day2_end) {
                countdownContainer.innerHTML = '<p>二日目開催中</p>';
            } else {
                countdownContainer.innerHTML = '<p>文化祭は終了しました</p>';
            }
        }
    }

    // --- Event Modal ---
    const eventModalOverlay = document.getElementById('event-modal-overlay');
    const eventModalBody = document.getElementById('event-modal-body');
    const eventModalClose = document.getElementById('event-modal-close');

    async function openEventModal(eventId) {
        if (!eventModalOverlay || !eventModalBody) return;
        try {
            const response = await fetch(`/api/events/${eventId}`);
            if (!response.ok) throw new Error('Event details could not be loaded.');
            const event = await response.json();
            
            eventModalBody.innerHTML = `
                <img src="${event.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image'}" alt="${event.title}">
                <h3>${event.title}</h3>
                <div class="meta">
                    <span class="category">カテゴリ: ${event.category}</span>
                    <span class="location">場所: ${event.location}</span>
                </div>
                <div class="description">
                    <p>${event.description}</p>
                </div>
            `;
            eventModalOverlay.classList.add('active');
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }

    function closeEventModal() {
        if (!eventModalOverlay) return;
        eventModalOverlay.classList.remove('active');
    }

    if (eventModalOverlay) {
        eventModalClose.addEventListener('click', closeEventModal);
        eventModalOverlay.addEventListener('click', (e) => {
            if (e.target === eventModalOverlay) {
                closeEventModal();
            }
        });
    }


    // Event List from Local API
    async function setupEvents() {
        const eventListContainer = document.getElementById('event-list');
        if (!eventListContainer) return;
        try {
            const response = await fetch('/api/events');
            if (!response.ok) throw new Error('Failed to fetch events');
            const data = await response.json();
            if (data.length === 0) {
                eventListContainer.innerHTML = '<p>現在登録されている企画はありません。</p>';
                return;
            }
            let html = '';
            data.forEach(event => {
                html += `
                    <div class="event-item" data-id="${event.id}">
                        <img src="${event.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${event.title}">
                        <h3>${event.title}</h3>
                        <p><span class="category">${event.category || '未分類'}</span></p>
                        <p>場所: ${event.location}</p>
                    </div>
                `;
            });
            eventListContainer.innerHTML = html;
            
            eventListContainer.addEventListener('click', (e) => {
                const eventItem = e.target.closest('.event-item');
                if (eventItem) {
                    openEventModal(eventItem.dataset.id);
                }
            });

        } catch (err) {
            eventListContainer.innerHTML = '<p>企画情報の読み込みに失敗しました。</p>';
            console.error(err);
        }
    }

    // News from Local API
    async function setupNews(targetListId = 'news-list', limit = 10) {
        const newsListContainer = document.getElementById(targetListId);
        if (!newsListContainer) return;
        try {
            const response = await fetch('/api/news');
            if (!response.ok) throw new Error('Failed to fetch news');
            let data = await response.json();
            if (limit > 0) data = data.slice(0, limit);
            if (data.length === 0) {
                newsListContainer.innerHTML = '<div class="news-item"><p>現在登録されているお知らせはありません。</p></div>';
                return;
            }
            let html = '';
            data.forEach(post => {
                const date = new Date(post.date).toLocaleDateString('ja-JP');
                html += `
                    <div class="news-item">
                        <a href="/pages/news-detail.html?id=${post.id}">
                            <time>${date}</time>
                            <span>${post.title}</span>
                            <span class="news-category">${post.category || '未分類'}</span>
                        </a>
                    </div>
                `;
            });
            newsListContainer.innerHTML = html;
        } catch (err) {
            newsListContainer.innerHTML = '<p>お知らせの読み込みに失敗しました。</p>';
            console.error(err);
        }
    }

    // Map Selector
    function setupMap() {
        const mapContainer = document.querySelector('.map-selector');
        if (!mapContainer) return;
        const mapButtons = document.querySelectorAll('.map-btn');
        const mapImages = document.querySelectorAll('.map-image');
        mapButtons.forEach(button => {
            button.addEventListener('click', () => {
                mapButtons.forEach(btn => btn.classList.remove('active'));
                mapImages.forEach(img => img.classList.remove('active'));
                button.classList.add('active');
                document.getElementById(button.dataset.map).classList.add('active');
            });
        });
    }

    // 初期化
    document.addEventListener('DOMContentLoaded', () => {
        setupCountdown();
        setupEvents();
        setupNews('news-list');
        setupNews('news-list-top', 3);
        setupMap();
    });
}