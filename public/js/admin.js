document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const loginSection = document.getElementById('loginSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const loginForm = document.getElementById('loginForm');
    const adminEmailInput = document.getElementById('adminEmail');
    const adminPasswordInput = document.getElementById('adminPassword');
    const loginMessage = document.getElementById('loginMessage');
    const logoutBtn = document.getElementById('logoutBtn');
    const searchInput = document.getElementById('searchInput');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const viewArchivedBtn = document.getElementById('view-archived-btn');
    const dashboardTitle = document.getElementById('dashboard-title');

    // Modals
    const detailsModalOverlay = document.getElementById('details-modal-overlay');
    const detailsModalContent = document.getElementById('details-modal-content');
    const detailsModalActions = document.getElementById('details-modal-actions');
    const filterModalOverlay = document.getElementById('filter-modal-overlay');
    const infoModalOverlay = document.getElementById('info-modal-overlay');
    const filterOptionsContainer = document.querySelector('.filter-options-container');
    
    let allSubmissions = [];
    let currentlyDisplayedSubmissions = [];
    let isViewingArchived = false;
    
    // --- Filter State ---
    let filterState = {
        sortBy: 'Date', // 'Date', 'Name', 'Email', 'City'
        sortDirection: 'desc', // 'asc' or 'desc'
        emailProvider: 'All',
        city: 'All Cities'
    };

    // --- Authentication ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = adminEmailInput.value;
            const password = adminPasswordInput.value;
            loginMessage.textContent = '';
            loginMessage.className = 'message-area';

            try {
                await loginAdmin(email, password);
            } catch (error) {
                loginMessage.textContent = error.message;
                loginMessage.classList.add('error');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await logoutAdmin();
            } catch (error) {
                alert(error.message);
            }
        });
    }

    onAuthChanged(async (user) => {
        if (user) {
            loginSection.classList.add('hidden');
            dashboardSection.classList.remove('hidden');
            await loadSubmissions();
        } else {
            dashboardSection.classList.add('hidden');
            loginSection.classList.remove('hidden');
            adminEmailInput.value = '';
            adminPasswordInput.value = '';
            allSubmissions = [];
            renderSubmissions([]);
        }
    });

    async function loadSubmissions() {
        try {
            allSubmissions = await getSubmissions(isViewingArchived);
            applyFiltersAndSearch();
        } catch (error) {
            document.getElementById('submissionsTableBody').innerHTML = `<tr><td colspan="100%">${error.message}</td></tr>`;
        }
    }


    // --- Event Listeners ---
    searchInput.addEventListener('input', applyFiltersAndSearch);
    
    document.getElementById('open-filter-modal-btn').addEventListener('click', () => {
        renderFilterModal();
        filterModalOverlay.classList.add('active');
    });
    
    viewArchivedBtn.addEventListener('click', () => {
        isViewingArchived = !isViewingArchived;
        dashboardTitle.textContent = isViewingArchived ? 'Archived Submissions' : 'Submissions';
        viewArchivedBtn.textContent = isViewingArchived ? 'View Active' : 'View Archived';
        viewArchivedBtn.classList.toggle('btn-tertiary');
        viewArchivedBtn.classList.toggle('btn-secondary');
        loadSubmissions();
    });


    // --- Modal Handling ---
    function setupModal(overlayId) {
        const overlay = document.getElementById(overlayId);
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay || e.target.closest('.modal-close-btn')) {
                    overlay.classList.remove('active');
                }
            });
        }
    }
    setupModal('details-modal-overlay');
    setupModal('filter-modal-overlay');
    setupModal('info-modal-overlay');

    document.getElementById('apply-filters-btn')?.addEventListener('click', () => {
        applyFiltersAndSearch();
        filterModalOverlay.classList.remove('active');
    });

    // --- Filtering and Sorting Logic ---

    function applyFiltersAndSearch() {
        let processedSubmissions = [...allSubmissions];

        // 1. Apply Filtering (Email Provider and City)
        const { emailProvider, city } = filterState;
        if (emailProvider !== 'All') {
            processedSubmissions = processedSubmissions.filter(sub => (sub.email || '').toLowerCase().includes(`@${emailProvider.toLowerCase()}`));
        }
        if (city !== 'All Cities') {
            processedSubmissions = processedSubmissions.filter(sub => (sub.city || '').toLowerCase() === city.toLowerCase());
        }

        // 2. Apply Sorting
        const { sortBy, sortDirection } = filterState;
        processedSubmissions.sort((a, b) => {
            let aVal, bVal;

            if (sortBy === 'Date') {
                aVal = a.timestamp?.toDate() || 0;
                bVal = b.timestamp?.toDate() || 0;
            } else if (sortBy === 'Name') {
                aVal = `${a['first-name'] || ''} ${a['last-name'] || ''}`.toLowerCase();
                bVal = `${b['first-name'] || ''} ${b['last-name'] || ''}`.toLowerCase();
            } else {
                aVal = (a[sortBy.toLowerCase()] || '').toLowerCase();
                bVal = (b[sortBy.toLowerCase()] || '').toLowerCase();
            }

            if (aVal < bVal) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (aVal > bVal) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });


        // 3. Apply Search Term
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            processedSubmissions = processedSubmissions.filter(sub => {
                const fullName = `${sub['first-name'] || ''} ${sub['last-name'] || ''}`.toLowerCase();
                const address = (sub.address || '').toLowerCase(); // Use the full address for searching
                return (
                    fullName.includes(searchTerm) ||
                    (sub.email || '').toLowerCase().includes(searchTerm) ||
                    (sub.phone || '').toLowerCase().includes(searchTerm) ||
                    address.includes(searchTerm)
                );
            });
        }
        
        currentlyDisplayedSubmissions = processedSubmissions;
        renderSubmissions(currentlyDisplayedSubmissions);
    }
    
    // --- Rendering ---

    function renderSubmissions(submissions) {
        const tableHead = document.querySelector('.main-table thead');
        const tableBody = document.getElementById('submissionsTableBody');
        const mobileContainer = document.getElementById('mobile-card-container');
        const noResults = document.getElementById('noResultsMessage');

        tableHead.innerHTML = '';
        tableBody.innerHTML = '';
        mobileContainer.innerHTML = '';

        if (submissions.length === 0) {
            noResults.classList.remove('hidden');
            noResults.textContent = isViewingArchived ? "The archive is empty." : "No new submissions found.";
            return;
        }
        noResults.classList.add('hidden');
        
        // Render Table Header
        tableHead.innerHTML = `<tr>
            <th class="indicator-cell"></th>
            <th>Full Name</th>
            <th>Address</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th class="actions-cell"></th>
        </tr>`;

        // Render Table Rows and Mobile Cards
        submissions.forEach(sub => {
            const hasApt = sub['apt-suite'] && sub['apt-suite'].trim() !== '';
            const indicatorHtml = hasApt ? `<div class="apt-indicator">!</div>` : '';
            
            const fullName = `${sub['first-name'] || ''} ${sub['last-name'] || ''}`;
            
            let quickViewAddress = sub.address || '';
            if (hasApt) {
                 quickViewAddress = quickViewAddress.replace(`, ${sub['apt-suite']}`, '');
            }

            // Table Row
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="indicator-cell">${indicatorHtml}</td>
                <td>${escapeHtml(fullName)}</td>
                <td>${escapeHtml(quickViewAddress)}</td>
                <td>${escapeHtml(sub.email || '')}</td>
                <td>${escapeHtml(sub.phone || '')}</td>
                <td class="actions-cell">
                    <button class="actions-btn" data-id="${sub.id}"><i class="fa-solid fa-ellipsis-v"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);

            // Mobile Card
            const card = document.createElement('div');
            card.className = 'submission-card';
            card.innerHTML = `
                ${indicatorHtml}
                <div class="card-header">
                    <div>
                        <div class="card-name">${escapeHtml(fullName)}</div>
                        <div class="card-date">${sub.timestamp?.toDate ? sub.timestamp.toDate().toLocaleDateString() : 'N/A'}</div>
                    </div>
                    <button class="actions-btn" data-id="${sub.id}"><i class="fa-solid fa-ellipsis-v"></i></button>
                </div>
                <div class="card-body">
                    <p><i class="fa-solid fa-envelope"></i> ${escapeHtml(sub.email || '')}</p>
                    <p><i class="fa-solid fa-phone"></i> ${escapeHtml(sub.phone || '')}</p>
                    <p><i class="fa-solid fa-map-marker-alt"></i> ${escapeHtml(quickViewAddress)}</p>
                </div>
            `;
            mobileContainer.appendChild(card);
        });

        // Add event listeners for the new buttons
        document.querySelectorAll('.actions-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const submission = allSubmissions.find(s => s.id === id);
                showDetailsModal(submission);
            });
        });
        document.querySelectorAll('.apt-indicator').forEach(indicator => {
            indicator.addEventListener('click', () => {
                infoModalOverlay.classList.add('active');
            });
        });
    }

    function showDetailsModal(submission) {
        if (!submission) return;
        
        const displayOrder = [
            'first-name', 'last-name', 'email', 'phone', 'address', 'apt-suite', 
            'city', 'zip', 'referral', 'contact-permission', 'sms-permission', 'id', 'timestamp'
        ];

        let content = '';
        displayOrder.forEach(key => {
            if (submission.hasOwnProperty(key)) {
                let value = submission[key];
                if (key === 'address' && submission['apt-suite']) {
                    value = value.replace(`, ${submission['apt-suite']}`, '');
                }
                if (key === 'timestamp' && value?.toDate) {
                    value = value.toDate().toLocaleString();
                }
                content += `
                    <div class="detail-item">
                        <strong>${escapeHtml(key.replace(/-/g, ' ').replace(/^./, str => str.toUpperCase()))}</strong>
                        <span>${escapeHtml(String(value))}</span>
                    </div>`;
            }
        });
        detailsModalContent.innerHTML = content;

        // Add action buttons
        detailsModalActions.innerHTML = '';
        if (isViewingArchived) {
            const restoreBtn = document.createElement('button');
            restoreBtn.className = 'btn btn-primary';
            restoreBtn.textContent = 'Restore';
            restoreBtn.onclick = async () => {
                await restoreSubmission(submission.id);
                detailsModalOverlay.classList.remove('active');
                loadSubmissions();
            };
            detailsModalActions.appendChild(restoreBtn);
        } else {
            const archiveBtn = document.createElement('button');
            archiveBtn.className = 'btn btn-secondary';
            archiveBtn.textContent = 'Archive';
            archiveBtn.onclick = async () => {
                await archiveSubmission(submission.id);
                detailsModalOverlay.classList.remove('active');
                loadSubmissions();
            };
            detailsModalActions.appendChild(archiveBtn);
        }
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = async () => {
            try {
                await deleteSubmission(submission.id, isViewingArchived);
                detailsModalOverlay.classList.remove('active');
                loadSubmissions();
            } catch (err) {
                console.log(err.message); // Log cancellation message
            }
        };
        detailsModalActions.appendChild(deleteBtn);
        
        detailsModalOverlay.classList.add('active');
    }
    
    function renderFilterModal() {
        const createCycleButton = (id, options, current) => {
            const btn = document.createElement('button');
            btn.id = id;
            btn.className = 'filter-cycle-btn';
            btn.textContent = current;
            btn.dataset.options = JSON.stringify(options);
            btn.addEventListener('click', () => {
                const currentOptions = JSON.parse(btn.dataset.options);
                const currentIndex = currentOptions.indexOf(btn.textContent);
                const nextIndex = (currentIndex + 1) % currentOptions.length;
                btn.textContent = currentOptions[nextIndex];
                updateFilterStateFromUI();
            });
            return btn;
        };

        filterOptionsContainer.innerHTML = ''; // Clear previous

        // Row 1: Sort By
        const sortByRow = document.createElement('div');
        sortByRow.className = 'filter-row';
        sortByRow.innerHTML = `<label for="sort-by-btn">Sort By</label>`;
        const sortByBtn = createCycleButton('sort-by-btn', ['Date', 'Name', 'Email', 'City'], filterState.sortBy);
        sortByRow.appendChild(sortByBtn);
        
        filterOptionsContainer.appendChild(sortByRow);
        
        // Re-render modal if main sort criteria changes, because dependent options change
        sortByBtn.addEventListener('click', () => {
            updateFilterStateFromUI();
            renderFilterModal(); 
        });

        // Row 2: Direction (dependent on Sort By)
        const directionRow = document.createElement('div');
        directionRow.className = 'filter-row';
        directionRow.innerHTML = `<label for="sort-dir-btn">Direction</label>`;
        const directionOptions = (filterState.sortBy === 'Date') ? ['Newest First', 'Oldest First'] : ['A-Z', 'Z-A'];
        const currentDirection = (filterState.sortDirection === 'desc' ? directionOptions[0] : directionOptions[1]);
        const directionBtn = createCycleButton('sort-dir-btn', directionOptions, currentDirection);
        directionRow.appendChild(directionBtn);
        filterOptionsContainer.appendChild(directionRow);

        // Conditional Rows
        if (filterState.sortBy === 'Email') {
             const emailRow = document.createElement('div');
             emailRow.className = 'filter-row';
             emailRow.innerHTML = `<label for="email-provider-btn">Provider</label>`;
             const emailProviders = ['All', 'gmail', 'yahoo', 'outlook']; // Simplified
             const emailBtn = createCycleButton('email-provider-btn', emailProviders, filterState.emailProvider);
             emailRow.appendChild(emailBtn);
             filterOptionsContainer.appendChild(emailRow);
        }

        if (filterState.sortBy === 'City') {
            const cityRow = document.createElement('div');
            cityRow.className = 'filter-row';
            cityRow.innerHTML = `<label for="city-filter-btn">City</label>`;
            const cities = ['All Cities', ...new Set(allSubmissions.map(s => s.city).filter(Boolean).sort())];
            const cityBtn = createCycleButton('city-filter-btn', cities, filterState.city);
            cityRow.appendChild(cityBtn);
            filterOptionsContainer.appendChild(cityRow);
        }
    }

    function updateFilterStateFromUI() {
        const sortByBtn = document.getElementById('sort-by-btn');
        const directionBtn = document.getElementById('sort-dir-btn');
        const emailBtn = document.getElementById('email-provider-btn');
        const cityBtn = document.getElementById('city-filter-btn');

        if (sortByBtn) filterState.sortBy = sortByBtn.textContent;
        if (directionBtn) {
            filterState.sortDirection = (directionBtn.textContent === 'Newest First' || directionBtn.textContent === 'Z-A') ? 'desc' : 'asc';
        }
        filterState.emailProvider = emailBtn ? emailBtn.textContent : 'All';
        filterState.city = cityBtn ? cityBtn.textContent : 'All Cities';
    }

    function escapeHtml(str) {
        if (typeof str !== 'string') return str;
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
