// Get the configure modal elements
const configureModal = document.getElementById('configureModal');
const configureBtn = document.getElementById('configure-btn');
const closeConfigureModalBtn = document.getElementsByClassName('close')[0];

// Get the FAQ modal elements
const faqModal = document.getElementById('faqModal');
const openFaqModalBtn = document.getElementById('openFaqModal');
const closeFaqModalBtn = document.getElementsByClassName('close')[1];

// Function to open a modal
function openModal(modal) {
    modal.style.display = "block";
    document.body.classList.add('no-scroll'); // Disable background scroll
}

// Function to close a modal
function closeModal(modal) {
    modal.style.display = "none";
    document.body.classList.remove('no-scroll'); // Enable background scroll
}

// Event listeners for configure modal
configureBtn.onclick = function () {
    openModal(configureModal);
}

closeConfigureModalBtn.onclick = function () {
    closeModal(configureModal);
    const selectedUrl = feedSelector.value;
    if (selectedUrl) {
        fetchAndDisplayFeed(selectedUrl);
    } else {
        noFeedMessage.style.display = 'block';
    }
}

// Event listeners for FAQ modal
openFaqModalBtn.onclick = function () {
    openModal(faqModal);
}

closeFaqModalBtn.onclick = function () {
    closeModal(faqModal);
}

// When the user clicks anywhere outside of the modals, close them
window.onclick = function (event) {
    if (event.target == configureModal) {
        closeModal(configureModal);
        const selectedUrl = feedSelector.value;
        if (selectedUrl) {
            fetchAndDisplayFeed(selectedUrl);
        } else {
            noFeedMessage.style.display = 'block';
        }
    }
    if (event.target == faqModal) {
        closeModal(faqModal);
    }
}
