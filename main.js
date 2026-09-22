// Nee Video List



// 1. KEEP YOUR ORIGINAL SETUPS
const PCLOUD_BASE_URL = "https://filedn.com/lTh0v2Bogc301OgoFen42cL/ToDelete/"; 
const VIDEOLIST_FILE_URL = "https://rickyusu.github.io/VideoSelect/videolist.txt";
const WebMAIL_access_key = "3dda0e4c-6471-46d2-81b4-37a9fc909736";        // 1. UPDATE YOUR ADMIN EMAIL HERE
const ADMIN_EMAIL = "rickyusu@gmail.com";


// Configuration
const itemsPerPage = 24; 
let currentPage = 1;
let allVideos = []; // This will hold our parsed array of video names
// Global array to store selections across pages
const markedFiles = new Set();
 

// 1. Fetch and Parse the text file
async function loadVideoList() {
    try {
        // Fetch the file from your local web server
        const response = await fetch(VIDEOLIST_FILE_URL);
        const text = await response.text();
        
        // Split the file by lines and clean up empty rows
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        // Transform full paths into structured objects with clean filenames
        allVideos = lines.map((filePath, index) => {
            // Extract just the filename (like %%~nF in batch)
            const cleanName = filePath.split('\\').pop().split('/').pop().replace(/\.[^/.]+\$/, "");
            return {
                id: index + 1,
                fullName: PCLOUD_BASE_URL+filePath, // Keeps original path if needed for selection tool
                title: cleanName     // Just the text filename
            };
        });
        
        // Load the very first page once data is ready
        displayPage(1);
        
    } catch (error) {
        console.error("Error reading videolist.txt:", error);
        document.querySelector('.video-container').innerHTML = "<p>Error loading video list.</p>";
    }
}

// 2. Slice and Display the data for the current page
function displayPage(page) {

    currentPage = page;
    
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedVideos = allVideos.slice(startIndex, endIndex);

    const videoContainer = document.querySelector('.video-container');
    videoContainer.innerHTML = paginatedVideos.map((video, localIndex) => {
        
        // FIX: Calculate a completely unique global index for IDs across all pages
        const globalIndex = startIndex + localIndex;
        
        // Check our Set to see if this specific file is currently marked
        const isMarked = markedFiles.has(video.title);
        
        return `
            <!-- Use globalIndex instead of regular index -->
            <div id="item-${globalIndex}" class="video-card ${isMarked ? 'marked' : ''}">
                <video class="video-preview" preload="metadata" controls muted>
                    <source src="${video.fullName}" type="video/mp4">
                </video>                
                <!-- Explicit button markup generation block -->
                <button id="btn-${globalIndex}" 
                        class="select-btn" 
                        onclick="toggleMarkNew('${encodeURIComponent(video.title)}', ${globalIndex})">
                    ${isMarked ? '✓ Marked to Delete' : 'Mark to Delete'}
                </button>
                <p title="${video.fullName}">${video.title}</p>
            </div>

        `;
    }).join('');
    
    // Re-draw navigation buttons
    renderPaginationControls();
}

// 3. Generate the Page Navigation UI
function renderPaginationControls() {
    const totalPages = Math.ceil(allVideos.length / itemsPerPage);
    const controlsContainer = document.querySelector('.pagination-controls');
    
    // Previous Button
    let html = `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="displayPage(${currentPage - 1})">Previous</button>
    `;

    // Smart Pagination: If you have 20+ pages, only show a few windowed buttons
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    if (startPage > 1) html += `<button onclick="displayPage(1)">1</button>${startPage > 2 ? '<span>...</span>' : ''}`;

    for (let i = startPage; i <= endPage; i++) {
        html += `
            <button class="${currentPage === i ? 'active' : ''}" onclick="displayPage(${i})">
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) html += `${endPage < totalPages - 1 ? '<span>...</span>' : ''}<button onclick="displayPage(${totalPages})">${totalPages}</button>`;

    // Next Button
    html += `
        <button ${currentPage === totalPages ? 'disabled' : ''} onclick="displayPage(${currentPage + 1})">Next</button>
    `;

    controlsContainer.innerHTML = html;
}

// Initial load on page opening// Replace your old "displayPhotos();" line at the bottom with this:
window.onload = function() {
  loadVideoList();
  // displayPhotos();
};

//     Old functions

function toggleMarkNew(encodedFilename, globalIndex) {
    const filename = decodeURIComponent(encodedFilename);
    
    // 1. Get the direct DOM elements for just this card
    const cardElement = document.getElementById(`item-${globalIndex}`);
    const buttonElement = document.getElementById(`btn-${globalIndex}`);

    // 2. Toggle the data inside your Set and update just the targeted UI elements
    if (markedFiles.has(filename)) {
        markedFiles.delete(filename);
        
        // Instant visual update for this card only
        if (cardElement) cardElement.classList.remove('marked');
        if (buttonElement) buttonElement.textContent = "Mark to Delete";
    } else {
        markedFiles.add(filename);
        
        // Instant visual update for this card only
        if (cardElement) cardElement.classList.add('marked');
        if (buttonElement) buttonElement.textContent = "✓ Marked to Delete";
    }
    
    // 3. Keep your sidebar synchronized
    updateSidebar(); 
}

function toggleMark(filename, index) {
    const item = document.getElementById(`item-${index}`);
    const btn = document.getElementById(`btn-${index}`);

    if (markedFiles.has(filename)) {
        markedFiles.delete(filename);
        item.classList.remove('marked');
        btn.textContent = "Mark to Delete";
    } else {
        markedFiles.add(filename);
        item.classList.add('marked');
        btn.textContent = "✓ Marked to Delete";
    }
    updateSidebar();
}

function updateSidebar() {
    const countDiv = document.getElementById('marked-count');
    const textarea = document.getElementById('marked-list-text');
    
    countDiv.textContent = `${markedFiles.size} file(s) selected`;
    textarea.value = markedFiles.size === 0 ? "" : Array.from(markedFiles).join('\n');
}

function submitList() {
    if (markedFiles.size === 0) {
        alert("Please mark at least one video before submitting.");
        return;
    }

    const fileListText = Array.from(markedFiles).join('\n');
    
    // Copy list to clipboard
    navigator.clipboard.writeText(fileListText);

    const subject = encodeURIComponent("Requested Video Deletions");
    const body = encodeURIComponent("Hello,\n\nPlease delete the following video files:\n\n" + fileListText + "\n\nThank you.");
    
    alert("The clean file list has been copied to your clipboard. Your email app will now open.");
    //window.location.href = `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`;
}

function submitAllList() {
    if (markedFiles.size === 0) {
        alert("Please mark at least one video before submitting.");
        return;
    }

    const fileListText = Array.from(markedFiles).join('\n');
    
    // Copy list to clipboard
    navigator.clipboard.writeText(fileListText);

    const emailListText = decodeURIComponent("Hello,\n\nPlease delete the following video files:\n\n" + fileListText + "\n\nThank you.");
    // Package names for Web3Forms email delivery
    document.getElementById('hiddenAllVideoList').value = emailListText; 

    alert("The clean file list has been copied to your clipboard. Your email app will now open.");
    // Delay sending email
    document.getElementById('realSubmitAllBtn').click();
}


        // End of file