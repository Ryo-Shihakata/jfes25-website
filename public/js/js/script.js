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

    // microCMS Client
    let client;
    try {
        client = microcms.createClient({
            serviceDomain: MICROCMS_CONFIG.serviceDomain,
            apiKey: MICROCMS_CONFIG.apiKey,
        });
    } catch (e) {
        console.error("microCMSの設定が正しくありません。src/config.js を確認してください。");
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

    // Event List from microCMS
    async function setupEvents() {
        const eventListContainer = document.getElementById('event-list');
        if (!client || !eventListContainer) return;

        try {
            const data = await client.get({ endpoint: 'event' });
            let html = '';
            data.contents.forEach(event => {
                html += `
                    <div class="event-item">
                        <img src="${event.image ? event.image.url : 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${event.name}">
                        <h3>${event.name}</h3>
                        <p><span class="category">${event.category || '未分類'}</span></p>
                        <p>主催: ${event.organizer}</p>
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

    // News from microCMS
    async function setupNews(targetListId = 'news-list', limit = 10) {
        const newsListContainer = document.getElementById(targetListId);
        if (!client || !newsListContainer) return;

        try {
            const data = await client.get({ endpoint: 'blogs', queries: { limit: limit } });
            let html = '';
            data.contents.forEach(post => {
                const date = new Date(post.publishedAt).toLocaleDateString('ja-JP');
                html += `
                    <div class="news-item">
                        <a href="#">
                            <time>${date}</time>
                            <span>${post.title}</span>
                            <span class="news-category">${post.category ? post.category.name : '未分類'}</span>
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
        setupNews('news-list'); // Newsページ用
        setupNews('news-list-top', 3); // トップページ用（3件のみ表示）
        setupMap();
    });
}