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
    const tableBody = document.getElementById('submissionsTableBody');
    const noResultsMessage = document.getElementById('noResultsMessage');

    let allSubmissions = [];

    // --- Authentication Logic ---
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
            try {
                allSubmissions = await getSubmissions();
                renderSubmissions(allSubmissions);
            } catch (error) {
                tableBody.innerHTML = `<tr><td colspan="100%">${error.message}</td></tr>`;
            }
        } else {
            dashboardSection.classList.add('hidden');
            loginSection.classList.remove('hidden');
            adminEmailInput.value = '';
            adminPasswordInput.value = '';
            allSubmissions = [];
            renderSubmissions([]);
        }
    });


    // --- Dashboard Features ---
    if(searchInput) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            if (!searchTerm) {
                renderSubmissions(allSubmissions);
                return;
            }

            const filteredSubmissions = allSubmissions.filter(sub => {
                // Search across all values in the submission object
                return Object.values(sub).some(val => 
                    String(val).toLowerCase().includes(searchTerm)
                );
            });

            renderSubmissions(filteredSubmissions);
        });
    }

    if(exportCsvBtn) {
        exportCsvBtn.addEventListener('click', () => {
            const headers = Array.from(document.querySelectorAll('#dashboardSection table thead th')).map(th => th.textContent);
            const rows = Array.from(document.querySelectorAll('#dashboardSection table tbody tr'));
            
            let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
            
            rows.forEach(row => {
                const rowData = Array.from(row.querySelectorAll('td')).map(td => `"${td.textContent.replace(/"/g, '""')}"`);
                csvContent += rowData.join(",") + "\n";
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `pete's_submissions_${new Date().toISOString().slice(0,10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
    
    function escapeHtml(str) {
        const p = document.createElement("p");
        p.textContent = str;
        return p.innerHTML;
    }

    function renderSubmissions(submissions) {
        const tableHead = document.querySelector('#dashboardSection table thead');
        
        tableHead.innerHTML = '';
        tableBody.innerHTML = '';

        if (submissions.length === 0) {
            noResultsMessage.classList.remove('hidden');
            noResultsMessage.textContent = searchInput.value ? "No matching records found." : "No submissions have been recorded yet.";
            return;
        }

        noResultsMessage.classList.add('hidden');

        const allHeaders = new Set();
        submissions.forEach(sub => {
            Object.keys(sub).forEach(key => allHeaders.add(key));
        });

        const headerOrder = ['id', 'formId', 'timestamp', 'name', 'email', 'phone', 'street', 'city', ...Array.from(allHeaders).filter(h => !['id', 'formId', 'timestamp', 'name', 'email', 'phone', 'street', 'city'].includes(h)).sort()];
        
        const headerHtml = `<tr>${headerOrder.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr>`;
        tableHead.innerHTML = headerHtml;

        submissions.forEach(sub => {
            const rowHtml = headerOrder.map(header => {
                let cellValue = sub[header];
                
                if (header === 'timestamp' && cellValue && typeof cellValue.toDate === 'function') {
                    cellValue = cellValue.toDate().toLocaleString();
                } else if (cellValue === undefined || cellValue === null) {
                    cellValue = ' ';
                }
                
                return `<td>${escapeHtml(String(cellValue))}</td>`;
            }).join('');
            tableBody.innerHTML += `<tr>${rowHtml}</tr>`;
        });
    }
});
