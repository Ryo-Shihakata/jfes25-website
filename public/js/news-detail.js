'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('news-detail-container');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const newsId = params.get('id');

    if (!newsId) {
        container.innerHTML = '<p>記事のIDが指定されていません。</p>';
        return;
    }

    try {
        const response = await fetch(`/api/news/${newsId}`);
        if (!response.ok) {
            throw new Error('お知らせの読み込みに失敗しました。記事が見つからないか、サーバーに問題が発生しました。');
        }
        const newsItem = await response.json();

        document.title = `${newsItem.title} - お知らせ詳細 - JFES25`;

        const date = new Date(newsItem.date).toLocaleDateString('ja-JP');

        container.innerHTML = `
            <div class="news-detail-header">
                <h1>${newsItem.title}</h1>
                <div class="news-detail-meta">
                    <time>${date}</time>
                    <span class="news-category">${newsItem.category || '未分類'}</span>
                </div>
            </div>
            <div class="news-detail-content">
                <p>${newsItem.content}</p>
            </div>
            <a href="/pages/news.html">お知らせ一覧に戻る</a>
        `;

    } catch (error) {
        container.innerHTML = `<p>${error.message}</p>`;
        console.error(error);
    }
});
