const feedSelector = document.getElementById('feed-selector');
const searchInput = document.getElementById('search-input');
const feedContainer = document.getElementById('feed-container');
const loadingIndicator = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const loadMoreBtn = document.getElementById('load-more-btn');
const feedTable = document.getElementById('feed-table');
const feedHeader = document.getElementById('feed-header');
const noFeedMessage = document.getElementById('no-feed-message');
const suggestedFeeds = document.getElementById('suggested-feeds');
const additionalFeeds = document.getElementById('additional-feeds');
const noMatchesMessage = document.getElementById('no-matches-message');

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const DEFAULT_FEED_URL = 'https://www.reddit.com/r/technology/.rss';
const CACHE_EXPIRATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

let allProcessedItems = [];
let displayedItemCount = 0;
const ITEMS_PER_LOAD = 6;
let currentFeedUrl = '';

function truncateText(text, maxLength = 300) {
    if (!text) return '';
    const strippedText = text.replace(/<[^>]*>/g, '');
    if (strippedText.length > maxLength) {
        return strippedText.substring(0, maxLength) + ' <span class="read-more">... Read more</span>';
    }
    return strippedText;
}

function formatDate(date) {
    return date.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}

function parseDate(dateString) {
    const dateParsers = [
        () => new Date(dateString),
        () => new Date(Date.parse(dateString)),
        () => {
            const formats = [
                /^\w{3}, \d{1, 2} \w{3} \d{4} \d{2}:\d{2}:\d{2} [+-]\d{4}$/,
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
            ];
            for (let regex of formats) {
                if (regex.test(dateString)) {
                    return new Date(dateString);
                }
            }
            return null;
        }
    ];

    for (let parser of dateParsers) {
        try {
            const parsed = parser();
            if (parsed && !isNaN(parsed)) return parsed;
        } catch { }
    }

    return null;
}

function extractDate(item) {
    const dateSelectors = [
        'pubDate', 'lastBuildDate', 'published', 'updated', 'date', 'dc\\:date'
    ];

    for (let selector of dateSelectors) {
        const dateEl = item.querySelector(selector);
        if (dateEl) {
            const dateString = dateEl.textContent;
            const parsedDate = parseDate(dateString);
            if (parsedDate) return parsedDate;
        }
    }

    return new Date();
}

function extractContent(item) {
    const contentSelectors = [
        'description', 'content\\:encoded', 'content[type="html"]', 'content'
    ];

    for (let selector of contentSelectors) {
        const contentEl = item.querySelector(selector);
        if (contentEl) {
            return truncateText(contentEl.textContent || contentEl.innerHTML);
        }
    }

    return 'No description available';
}

function extractLink(item) {
    const linkSelectors = ['link', 'guid', 'id'];

    for (let selector of linkSelectors) {
        const linkEl = item.querySelector(selector);
        if (linkEl) {
            if (linkEl.getAttribute && linkEl.getAttribute('href')) {
                return linkEl.getAttribute('href');
            }
            return linkEl.textContent || linkEl.innerHTML;
        }
    }

    return '#';
}

function extractTitle(item) {
    const titleEl = item.querySelector('title');
    return titleEl ? titleEl.textContent : null;
}

function extractFeedInfo(xmlDoc) {
    const titleEl = xmlDoc.querySelector('channel title') || xmlDoc.querySelector('title');
    const descriptionEl = xmlDoc.querySelector('channel description') || xmlDoc.querySelector('subtitle');
    return {
        title: titleEl ? titleEl.textContent : 'No title available',
        description: descriptionEl ? descriptionEl.textContent : 'No description available'
    };
}

function displayItems() {
    const remainingItems = allProcessedItems.slice(
        displayedItemCount,
        displayedItemCount + ITEMS_PER_LOAD
    );

    remainingItems.forEach(item => {
        const feedItemEl = document.createElement('article');
        feedItemEl.classList.add('feed-item');

        feedItemEl.addEventListener('click', () => {
            window.open(item.link, '_blank');
        });

        const descriptionClass = item.description.length > 300
            ? 'feed-item-description truncated'
            : 'feed-item-description';

        feedItemEl.innerHTML = `
    <div class="feed-item-content">
        ${item.title ? `<h6>${item.title}</h6>` : ''}
        <div class="${descriptionClass}">${item.description}</div>
        <div class="feed-item-date">${formatDate(item.date)}</div>
    </div>
    `;

        feedContainer.appendChild(feedItemEl);
    });

    displayedItemCount += remainingItems.length;

    if (displayedItemCount >= allProcessedItems.length) {
        loadMoreBtn.style.display = 'block';
        loadMoreBtn.textContent = 'This is the end of this RSS feed';
        loadMoreBtn.disabled = true;
    } else {
        loadMoreBtn.style.display = 'block';
        loadMoreBtn.textContent = 'Load More Posts';
        loadMoreBtn.disabled = false;
    }
}

async function fetchAndDisplayFeed(url) {
    if (currentFeedUrl === url) return;
    currentFeedUrl = url;

    feedContainer.innerHTML = ''; // Clear previous feed content
    errorMessage.style.display = 'none';
    displayedItemCount = 0;
    allProcessedItems = [];

    loadingIndicator.style.display = 'block';
    loadingIndicator.textContent = 'Fetching feed... This is the easy part.';

    try {
        const response = await fetch(CORS_PROXY + encodeURIComponent(url));

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        loadingIndicator.textContent = 'Parsing feed... It can take time due to network latency, server delays, large feed sizes, and browser performance. Still, no more than 2 to 15 seconds.';

        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        const feedInfo = extractFeedInfo(xmlDoc);
        feedHeader.innerHTML = `
            <h1 class="feed-heading">${feedInfo.title}</h1>
            <p class="feed-description">${feedInfo.description}</p>
            <p class="last-fetched">Last fetched: ${formatDate(new Date())}</p>
        `;

        loadingIndicator.textContent = 'Extracting items...';

        let items = xmlDoc.querySelectorAll('item, entry');

        if (items.length === 0) { // Check for empty feed
            errorMessage.textContent = "This feed is currently empty or unavailable.";
            errorMessage.style.display = 'block';
            loadingIndicator.style.display = 'none';
            return; // Stop further processing
        }

        loadingIndicator.textContent = 'Processing items...';

        const processedItems = Array.from(items).map(item => {
            const title = extractTitle(item);
            const link = extractLink(item);
            const description = extractContent(item);
            const date = extractDate(item);

            return { title, link, description, date };
        });

        loadingIndicator.textContent = 'Sorting items...';

        processedItems.sort((a, b) => b.date - a.date);

        allProcessedItems = processedItems;

        loadingIndicator.textContent = `Displaying ${processedItems.length} items...`;

        displayItems();

        loadingIndicator.style.display = 'none';

        localStorage.setItem(`lastFetched-${url}`, new Date().toISOString()); // Always update last fetched time
        localStorage.setItem('selectedFeedUrl', url); // Store the currently selected feed URL

    } catch (error) {
        console.error('Error fetching RSS feed:', error);
        errorMessage.textContent = `Failed to load feed: ${error.message}`;
        errorMessage.style.display = 'block';
        loadingIndicator.style.display = 'none';
    }
}

loadMoreBtn.addEventListener('click', displayItems);

function addFeed() {
    const feedUrl = document.getElementById('feed-url').value;

    if (feedUrl) {
        const feeds = JSON.parse(localStorage.getItem('feeds')) || [];
        feeds.push({ url: feedUrl });
        localStorage.setItem('feeds', JSON.stringify(feeds));
        renderFeedTable();
        populateFeedSelector();
        document.getElementById('feed-url').value = '';
        noFeedMessage.style.display = 'none';
    }
}

function initializeFeeds() {
    let feeds = JSON.parse(localStorage.getItem('feeds')) || [];
    if (feeds.length === 0) {
        feeds.push({ url: DEFAULT_FEED_URL });
        localStorage.setItem('feeds', JSON.stringify(feeds));
    }
}

function renderFeedTable() {
    const feeds = JSON.parse(localStorage.getItem('feeds')) || [];
    feedTable.innerHTML = '';

    feeds.forEach((feed, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
    <td>${feed.url}</td>
    <td><button class="delete-btn" onclick="deleteFeed(${index})"><i class="ph-duotone ph-trash"></i>Delete</button></td>
    `;
        feedTable.appendChild(row);
    });

    if (feeds.length === 0) {
        noFeedMessage.style.display = 'block';
        loadingIndicator.style.display = 'none';
        feedSelector.disabled = true;
        document.getElementById('downloadCSV').disabled = true;
    } else {
        noFeedMessage.style.display = 'none';
        feedSelector.disabled = false;
        document.getElementById('downloadCSV').disabled = false;
    }
}

function deleteFeed(index) {
    const feeds = JSON.parse(localStorage.getItem('feeds')) || [];
    feeds.splice(index, 1);
    localStorage.setItem('feeds', JSON.stringify(feeds));
    renderFeedTable();
    populateFeedSelector();
    if (feeds.length === 0) {
        noFeedMessage.style.display = 'block';
        feedSelector.disabled = true;
        document.getElementById('downloadCSV').disabled = true;
    }
}

function downloadCSV() {
    const feeds = JSON.parse(localStorage.getItem('feeds')) || [];
    const csvContent = "data:text/csv;charset=utf-8,"
        + feeds.map(feed => `${feed.url}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "feeds.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function uploadCSV(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const csvContent = e.target.result;
        const rows = csvContent.split("\n");
        const feeds = rows.map(row => {
            const url = row.trim();
            return { url };
        });
        localStorage.setItem('feeds', JSON.stringify(feeds));
        renderFeedTable();
        populateFeedSelector();
        noFeedMessage.style.display = 'none';
    };

    reader.readAsText(file);
}

function loadCSVFromURL() {
    const csvUrl = document.getElementById('csv-url').value;

    if (csvUrl) {
        fetch(csvUrl)
            .then(response => response.text())
            .then(csvContent => {
                const rows = csvContent.split("\n").slice(1);
                const feeds = rows.map(row => {
                    const url = row.trim();
                    return { url };
                });
                localStorage.setItem('feeds', JSON.stringify(feeds));
                renderFeedTable();
                populateFeedSelector();
                noFeedMessage.style.display = 'none';
            })
            .catch(error => {
                console.error('Error loading CSV from URL:', error);
                alert('Failed to load CSV from URL');
            });
    }
}

function populateFeedSelector() {
    const feeds = JSON.parse(localStorage.getItem('feeds')) || [];
    feedSelector.innerHTML = ''; // Clear existing options

    feeds.forEach((feed) => {
        const option = document.createElement('option');
        option.value = feed.url;
        option.textContent = feed.url;
        feedSelector.appendChild(option);
    });

    const selectedFeedUrl = localStorage.getItem('selectedFeedUrl');

    if (selectedFeedUrl) {
        fetchAndDisplayFeed(selectedFeedUrl);

        if (feeds.some(feed => feed.url === selectedFeedUrl)) {
            feedSelector.value = selectedFeedUrl;
        } else {
            const option = document.createElement('option');
            option.value = selectedFeedUrl;
            option.textContent = selectedFeedUrl;
            feedSelector.appendChild(option);
            feedSelector.value = selectedFeedUrl;
        }
    } else if (feeds.length > 0) {
        feedSelector.value = feeds[0].url;
        fetchAndDisplayFeed(feeds[0].url);
    } else {
        noFeedMessage.style.display = 'block';
        feedSelector.disabled = true;
        document.getElementById('downloadCSV').disabled = true; // Disable download button as well
    }
}

// Event listener for the main feed selector
feedSelector.addEventListener('change', (event) => {
    const selectedUrl = event.target.value;
    localStorage.setItem('selectedFeedUrl', selectedUrl);
    fetchAndDisplayFeed(selectedUrl);
});

async function loadFeeds() {
    const response = await fetch('feeds.json');
    const feedsData = await response.json();
    renderSuggestedFeeds(feedsData);
}

function renderSuggestedFeeds(feedsData) {
    suggestedFeeds.innerHTML = '';
    additionalFeeds.innerHTML = '<option value="" disabled selected>Explore more feeds</option>';

    const searchTerm = searchInput.value.toLowerCase();

    feedsData.categories.forEach(category => {
        if (category.displayInSidebar) {
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('category');

            const categoryName = document.createElement('h6');
            categoryName.classList.add('category-name');
            categoryName.textContent = category.name;
            categoryDiv.appendChild(categoryName);

            category.popularFeeds.forEach(feed => {
                if (feed.name.toLowerCase().includes(searchTerm)) {
                    const feedLink = document.createElement('a');
                    feedLink.classList.add('feed-link');
                    feedLink.href = '#';
                    feedLink.textContent = feed.name;
                    feedLink.addEventListener('click', () => {
                        fetchAndDisplayFeed(feed.url);
                        localStorage.setItem('selectedFeedUrl', feed.url);
                        feedSelector.value = ''; // Optional: Clear main selector
                    });
                    categoryDiv.appendChild(feedLink);
                }
            });

            suggestedFeeds.appendChild(categoryDiv);
        }

        const optgroup = document.createElement('optgroup');
        optgroup.label = category.name;
        category.additionalFeeds.forEach(feed => {
            if (feed.name.toLowerCase().includes(searchTerm)) {
                const option = document.createElement('option');
                option.value = feed.url;
                option.textContent = feed.name;
                optgroup.appendChild(option);
            }
        });
        additionalFeeds.appendChild(optgroup);
    });

    if (additionalFeeds.options.length === 1) {
        noMatchesMessage.style.display = 'block';
    } else {
        noMatchesMessage.style.display = 'none';
    }
}

loadFeeds();

searchInput.addEventListener('input', () => {
    loadFeeds();
});

additionalFeeds.addEventListener('change', (event) => {
    const selectedUrl = event.target.value;
    fetchAndDisplayFeed(selectedUrl);
    localStorage.setItem('selectedFeedUrl', selectedUrl);
    feedSelector.value = ''; // Optional: Clear main selector
});

initializeFeeds();
renderFeedTable();
populateFeedSelector();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}

let deferredPrompt;
const addBtn = document.querySelector('.add-button');
addBtn.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    addBtn.style.display = 'block';

    addBtn.addEventListener('click', (e) => {
        addBtn.style.display = 'none';
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            deferredPrompt = null;
        });
    });
});

function checkAndRefreshFeeds() {
    const feeds = JSON.parse(localStorage.getItem('feeds')) || [];
    const now = new Date().getTime();

    feeds.forEach(feed => {
        const lastFetched = localStorage.getItem(`lastFetched-${feed.url}`);
        if (lastFetched) {
            const lastFetchedTime = new Date(lastFetched).getTime();
            if (now - lastFetchedTime > CACHE_EXPIRATION) {
                fetchAndDisplayFeed(feed.url);
            }
        }
    });
}

setInterval(checkAndRefreshFeeds, CACHE_EXPIRATION);

// Ensure the feed stays the same on page refresh
document.addEventListener('DOMContentLoaded', () => {
    const selectedFeedUrl = localStorage.getItem('selectedFeedUrl');
    if (selectedFeedUrl) {
        fetchAndDisplayFeed(selectedFeedUrl);
    }
});
