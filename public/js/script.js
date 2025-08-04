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
        const filterButtonsContainer = document.getElementById('event-filter-buttons');
        if (!eventListContainer || !filterButtonsContainer) return;

        let allEvents = []; // To store all events

        // Function to display events
        function displayEvents(events) {
            if (events.length === 0) {
                eventListContainer.innerHTML = '<p>該当する企画はありません。</p>';
                return;
            }
            let html = '';
            events.forEach(event => {
                html += `
                    <div class="event-item" data-id="${event.id}" data-category="${event.category || '未分類'}">
                        <img src="${event.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${event.title}">
                        <h3>${event.title}</h3>
                        <p><span class="category">${event.category || '未分類'}</span></p>
                        <p>場所: ${event.location}</p>
                    </div>
                `;
            });
            eventListContainer.innerHTML = html;
        }

        // Function to setup filter buttons
        function setupFilterButtons() {
            const categories = ['すべて', ...new Set(allEvents.map(event => event.category || '未分類'))];
            filterButtonsContainer.innerHTML = categories.map(category => 
                `<button class="filter-btn" data-category="${category}">${category}</button>`
            ).join('');

            // Add event listener to buttons
            filterButtonsContainer.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    const selectedCategory = e.target.dataset.category;
                    
                    // Update active button
                    filterButtonsContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                    e.target.classList.add('active');

                    if (selectedCategory === 'すべて') {
                        displayEvents(allEvents);
                    } else {
                        const filteredEvents = allEvents.filter(event => (event.category || '未分類') === selectedCategory);
                        displayEvents(filteredEvents);
                    }
                }
            });
            
            // Set "すべて" as active by default
            filterButtonsContainer.querySelector('.filter-btn[data-category="すべて"]').classList.add('active');
        }

        try {
            const response = await fetch('/api/events');
            if (!response.ok) throw new Error('Failed to fetch events');
            allEvents = await response.json();
            
            if (allEvents.length === 0) {
                eventListContainer.innerHTML = '<p>現在登録されている企画はありません。</p>';
                return;
            }
            
            setupFilterButtons();
            displayEvents(allEvents); // Display all events initially
            
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
    async function setupNews(targetListId = 'news-list', limit = 0) { // Changed limit default
        const newsListContainer = document.getElementById(targetListId);
        const filterButtonsContainer = document.getElementById('news-filter-buttons');
        if (!newsListContainer) return;

        let allNews = [];

        function displayNews(newsItems) {
            if (newsItems.length === 0) {
                newsListContainer.innerHTML = '<div class="news-item"><p>現在登録されているお知らせはありません。</p></div>';
                return;
            }
            let limitedNews = limit > 0 ? newsItems.slice(0, limit) : newsItems;
            let html = '';
            limitedNews.forEach(post => {
                const date = new Date(post.date).toLocaleDateString('ja-JP');
                html += `
                    <div class="news-item" data-category="${post.category || '未分類'}">
                        <a href="/pages/news-detail.html?id=${post.id}">
                            <time>${date}</time>
                            <span>${post.title}</span>
                            <span class="news-category">${post.category || '未分類'}</span>
                        </a>
                    </div>
                `;
            });
            newsListContainer.innerHTML = html;
        }

        function setupFilterButtons() {
            if (!filterButtonsContainer) return; // Don't run on homepage
            const categories = ['すべて', ...new Set(allNews.map(post => post.category || '未分類'))];
            filterButtonsContainer.innerHTML = categories.map(category =>
                `<button class="filter-btn" data-category="${category}">${category}</button>`
            ).join('');

            filterButtonsContainer.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    const selectedCategory = e.target.dataset.category;

                    filterButtonsContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                    e.target.classList.add('active');

                    if (selectedCategory === 'すべて') {
                        displayNews(allNews);
                    } else {
                        const filteredNews = allNews.filter(post => (post.category || '未分類') === selectedCategory);
                        displayNews(filteredNews);
                    }
                }
            });
            
            filterButtonsContainer.querySelector('.filter-btn[data-category="すべて"]').classList.add('active');
        }

        try {
            const response = await fetch('/api/news');
            if (!response.ok) throw new Error('Failed to fetch news');
            allNews = await response.json();
            
            if (filterButtonsContainer) { // Only setup filters on news page
                setupFilterButtons();
            }
            
            displayNews(allNews);

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
        setupTimetable();
    });

    // Timetable Display
    async function setupTimetable() {
        const container = document.getElementById('timetable-display-container');
        if (!container) return;

        try {
            const response = await fetch('/api/timetable');
            if (!response.ok) throw new Error('タイムテーブルの読み込みに失敗しました。');
            const timetableData = await response.json();

            if (timetableData.length === 0) {
                container.innerHTML = '<p>現在登録されているタイムテーブル情報はありません。</p>';
                return;
            }

            // Group by day
            const day1 = timetableData.filter(item => item.day === 1);
            const day2 = timetableData.filter(item => item.day === 2);

            // Find all unique locations
            const locations = [...new Set(timetableData.map(item => item.location))];

            // Find time range robustly
            const allTimes = timetableData.flatMap(item => [item.startTime, item.endTime]).filter(Boolean);
            if (allTimes.length === 0) {
                container.innerHTML = '<p>登録されているタイムテーブルに、有効な時間がありません。</p>';
                return;
            }
            const minTime = allTimes.reduce((min, t) => t < min ? t : min, '23:59');
            const maxTime = allTimes.reduce((max, t) => t > max ? t : max, '00:00');
            
            const timeSlots = generateTimeSlots(minTime, maxTime);
            if (timeSlots.length === 0) {
                container.innerHTML = '<p>タイムスロットを生成できませんでした。</p>';
                return;
            }

            container.innerHTML = `
                <div class="timetable-controls">
                    <button id="day1-btn" class="timetable-day-btn active">1日目</button>
                    <button id="day2-btn" class="timetable-day-btn">2日目</button>
                </div>
                <div id="timetable-day-1" class="timetable-grid active">
                    ${generateGridHTML(day1, locations, timeSlots)}
                </div>
                <div id="timetable-day-2" class="timetable-grid">
                    ${generateGridHTML(day2, locations, timeSlots)}
                </div>
            `;

            // Tab functionality
            const day1Btn = document.getElementById('day1-btn');
            const day2Btn = document.getElementById('day2-btn');
            const day1Grid = document.getElementById('timetable-day-1');
            const day2Grid = document.getElementById('timetable-day-2');

            day1Btn.addEventListener('click', () => {
                day1Btn.classList.add('active');
                day2Btn.classList.remove('active');
                day1Grid.classList.add('active');
                day2Grid.classList.remove('active');
            });

            day2Btn.addEventListener('click', () => {
                day2Btn.classList.add('active');
                day1Btn.classList.remove('active');
                day2Grid.classList.add('active');
                day1Grid.classList.remove('active');
            });

        } catch (error) {
            container.innerHTML = `<p>${error.message}</p>`;
        }
    }

    function generateTimeSlots(start, end) {
        const slots = [];
        let current = new Date(`1970-01-01T${start}:00`);
        const endT = new Date(`1970-01-01T${end}:00`);
        
        while(current <= endT) {
            slots.push(current.toTimeString().substring(0, 5));
            current.setMinutes(current.getMinutes() + 30);
        }
        return slots;
    }

    function generateGridHTML(events, locations, timeSlots) {
        if (events.length === 0) return '<p>この日の予定はありません。</p>';
        if (locations.length === 0 || timeSlots.length === 0) return '<p>タイムテーブルの表示に必要な情報が不足しています。</p>';

        const timeToMinutes = (time) => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const gridStartTime = timeToMinutes(timeSlots[0]);
        const slotDuration = 30; // 30 minutes per slot

        let header = '<div class="timetable-header">';
        header += '<div class="time-axis"></div>'; // Empty corner
        locations.forEach(loc => header += `<div>${loc}</div>`);
        header += '</div>';

        let body = '<div class="timetable-body">';
        // Time Axis
        body += '<div class="time-axis">';
        timeSlots.forEach(time => body += `<div>${time}</div>`);
        body += '</div>';

        // Grid for each location
        locations.forEach(loc => {
            body += '<div class="location-column">';
            timeSlots.forEach(time => {
                body += `<div class="time-slot" data-time="${time}"></div>`;
            });
            body += '</div>';
        });
        body += '</div>'; // end timetable-body

        let gridContainer = `<div class="grid-container" style="--locations: ${locations.length}; --timeslots: ${timeSlots.length};">${header}${body}</div>`;
        
        let eventsHTML = '<div class="events-overlay">';
        events.forEach(event => {
            const locIndex = locations.indexOf(event.location);
            if (locIndex === -1) return; // Skip if location not found

            const eventStartMinutes = timeToMinutes(event.startTime);
            const eventEndMinutes = timeToMinutes(event.endTime);

            const startRow = (eventStartMinutes - gridStartTime) / slotDuration;
            const endRow = (eventEndMinutes - gridStartTime) / slotDuration;
            
            if (startRow < 0 || endRow > timeSlots.length) return;

            const rowSpan = Math.max(1, Math.round(endRow - startRow));
            
            // CSS Grid line numbers are 1-based. Add 1 for the header row.
            const gridRowStart = Math.floor(startRow) + 2; 
            const gridCol = locIndex + 2;

            eventsHTML += `
                <div class="timetable-event" style="--col: ${gridCol}; --row-start: ${gridRowStart}; --row-span: ${rowSpan};">
                    <strong>${event.title}</strong>
                    <span>${event.startTime} - ${event.endTime}</span>
                </div>
            `;
        });
        eventsHTML += '</div>';

        return gridContainer + eventsHTML;
    }
}