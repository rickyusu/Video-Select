// Nee Video List



// 1. KEEP YOUR ORIGINAL SETUPS
const PCLOUD_BASE_URL = "https://filedn.com/lTh0v2Bogc301OgoFen42cL/ToDelete/"; 


        // 1. UPDATE YOUR ADMIN EMAIL HERE
        const ADMIN_EMAIL = "rickyusu@gmail.com";

        

        
        
        const markedFiles = new Set();

        async function init() {
            const container = document.getElementById('video-list');

            try {
                // Fetch the videolist.txt file containing raw filenames
                const response = await fetch('videolist.txt');
                if (!response.ok) throw new Error("Could not find or read videolist.txt");
                
                const textData = await response.text();
                
                // Split by lines and clear out empty spaces
                const videoFilenames = textData.split('\n')
                                            .map(line => line.trim())
                                            .filter(line => line.length > 0);

                if (videoFilenames.length === 0) {
                    container.innerHTML = '<p>Your videolist.txt file is empty. Please add filenames to it.</p>';
                    return;
                }

                container.innerHTML = ''; 

                videoFilenames.forEach((filename, index) => {
                    // Combine the base folder link with the filename from text.txt
                    const fullVideoUrl = PCLOUD_BASE_URL + encodeURIComponent(filename);

                    const div = document.createElement('div');
                    div.className = 'video-item';
                    div.id = `item-${index}`; 
                    div.innerHTML = `
                        <h3 style="margin-top:0;">📄 ${filename}</h3>
                        <video controls preload="metadata">
                            <source src="${fullVideoUrl}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                        <button class="btn mark-btn" id="btn-${index}" onclick="toggleMark('${filename}', ${index})">Mark to Delete</button>
                    `;
                    container.appendChild(div);
                });

            } catch (err) {
                container.innerHTML = `<p style="color: #cf222e; font-weight: bold;">Error: ${err.message}</p>`;
            }
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
            window.location.href = `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`;
        }


        // Initialize the app
        init();
  

        // End of file