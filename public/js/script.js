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

    // News from API
    async function setupNews(targetListId = 'news-list', limit = 10) {
        const newsListContainer = document.getElementById(targetListId);
        if (!newsListContainer) return;

        try {
            // APIからお知らせを取得
            const response = await fetch('/api/news');
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            let newsItems = await response.json();

            // 表示件数を制限
            if (limit > 0) {
                newsItems = newsItems.slice(0, limit);
            }

            if (newsItems.length === 0) {
                newsListContainer.innerHTML = '<p>お知らせはまだありません。</p>';
                return;
            }

            let html = '';
            newsItems.forEach(post => {
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


    // Countdown Timer
    function setupCountdown() {
        const countdownElement = document.getElementById('countdown-days');
        if (!countdownElement) return;

        const eventDate = new Date('2025-09-05T00:00:00+09:00');
        const now = new Date();
        const diff = eventDate.getTime() - now.getTime();

        if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            countdownElement.textContent = days;
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

    // Event List from API
    async function setupEvents() {
        const eventListContainer = document.getElementById('event-list');
        if (!eventListContainer) return;

        try {
            const response = await fetch('/api/events');
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            const events = await response.json();

            if (events.length === 0) {
                eventListContainer.innerHTML = '<p>企画情報はまだありません。</p>';
                return;
            }
            
            let html = '';
            events.forEach(event => {
                html += `
                    <div class="event-item">
                        <img src="${event.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${event.title}">
                        <h3>${event.title}</h3>
                        <p><span class="category">${event.category || '未分類'}</span></p>
                        <p>場所: ${event.location}</p>
                    </div>
                `;
            });
            eventListContainer.innerHTML = html;
        } catch (err) {
            eventListContainer.innerHTML = '<p>企画情報の読み込みに失敗しました。</p>';
            console.error(err);
        }
    }

    // News from API
    async function setupNews(targetListId = 'news-list', limit = 0) { // limitのデフォルトを0（全件表示）に変更
        const newsListContainer = document.getElementById(targetListId);
        if (!newsListContainer) return;

        try {
            // APIからお知らせを取得
            const response = await fetch('/api/news');
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            let newsItems = await response.json();

            // 表示件数を制限
            if (limit > 0) {
                newsItems = newsItems.slice(0, limit);
            }

            if (newsItems.length === 0) {
                newsListContainer.innerHTML = '<p>お知らせはまだありません。</p>';
                return;
            }

            let html = '';
            newsItems.forEach(post => {
                const date = new Date(post.date).toLocaleDateDateString('ja-JP');
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

                const mapId = button.dataset.map;
                document.getElementById(mapId).classList.add('active');
            });
        });
    }


    // 初期化
    document.addEventListener('DOMContentLoaded', () => {
        setupCountdown();
        setupEvents();
        
        // 現在のページに応じてニュースの読み込みを分ける
        if (document.getElementById('news-list-top')) {
            setupNews('news-list-top', 3); // トップページ用（3件のみ表示）
        }
        if (document.getElementById('news-list')) {
            setupNews('news-list'); // Newsページ用
        }

        setupMap();
    });
}