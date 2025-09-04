document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on a desktop-sized screen.
    if (window.innerWidth < 1024) return;

    const servicesPage = document.getElementById('page-services');
    if (!servicesPage) return;

    const serviceNavLinks = servicesPage.querySelectorAll('.desktop-service-nav .desktop-service-link');
    const serviceContentContainer = servicesPage.querySelector('.desktop-service-content');
    
    async function fetchHtmlAsDom(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const text = await response.text();
            const parser = new DOMParser();
            return parser.parseFromString(text, 'text/html');
        } catch (error) {
            console.error(`Could not fetch and parse HTML from: ${url}`, error);
            return null;
        }
    }

    function setupFaqAccordion(container) {
        const faqItems = container.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                const faqItem = question.parentElement;
                faqItem.classList.toggle('active');
                const answer = faqItem.querySelector('.faq-answer');
                if (faqItem.classList.contains('active')) {
                    answer.style.maxHeight = answer.scrollHeight + "px";
                } else {
                    answer.style.maxHeight = 0;
                }
            });
        });
    }

    async function renderServiceContent(linkElement) {
        if (!serviceContentContainer || !linkElement) {
            if(serviceContentContainer) serviceContentContainer.innerHTML = '<p>Select a service to see details.</p>';
            return;
        }

        const pageUrl = linkElement.dataset.target;
        const imageUrl = linkElement.dataset.imageUrl;
        const serviceTitle = linkElement.dataset.serviceTitle;
        
        serviceContentContainer.innerHTML = `<div style="padding: 40px; text-align: center;">Loading...</div>`;

        const doc = await fetchHtmlAsDom(pageUrl);
        if (!doc) {
            serviceContentContainer.innerHTML = '<p>Error loading service details.</p>';
            return;
        }
        
        let heroHTML = `
            <div class="desktop-service-hero" style="background-image: url('${imageUrl}')">
                <div class="desktop-service-hero-overlay">
                    <h3>${serviceTitle}</h3>
                    <p>${doc.querySelector('div[data-section="overview"] p')?.textContent || ''}</p>
                </div>
            </div>
        `;

        let contentNavHTML = '<nav class="desktop-content-nav">';
        let contentPanesHTML = '<div class="desktop-content-panes">';
        const sections = ['info', 'why-us', 'faq'];
        let isFirstPane = true;
        
        sections.forEach(sectionKey => {
            const sectionContent = doc.querySelector(`div[data-section="${sectionKey}"]`);
            if (sectionContent) {
                const tabTitle = sectionKey.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
                contentNavHTML += `<button class="desktop-content-tab ${isFirstPane ? 'active' : ''}" data-pane="${sectionKey}">${tabTitle}</button>`;
                contentPanesHTML += `<div class="content-pane ${isFirstPane ? 'active' : ''}" data-pane="${sectionKey}">${sectionContent.innerHTML}</div>`;
                isFirstPane = false;
            }
        });
        
        contentNavHTML += '</nav>';
        contentPanesHTML += '</div>';

        serviceContentContainer.innerHTML = heroHTML + `<div class="desktop-service-scroll-area">${contentNavHTML}${contentPanesHTML}</div>`;

        // Re-attach listeners for the new content
        setupFaqAccordion(serviceContentContainer);

        const contentNav = serviceContentContainer.querySelector('.desktop-content-nav');
        contentNav.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const paneName = e.target.dataset.pane;
                contentNav.querySelectorAll('.desktop-content-tab').forEach(tab => tab.classList.remove('active'));
                e.target.classList.add('active');
                serviceContentContainer.querySelectorAll('.content-pane').forEach(pane => {
                    pane.classList.toggle('active', pane.dataset.pane === paneName);
                });
            }
        });
    }

    serviceNavLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            serviceNavLinks.forEach(l => l.classList.remove('active'));
            e.currentTarget.classList.add('active');
            renderServiceContent(e.currentTarget);
        });
    });

    // Initial load for the default active service
    const initialActiveLink = document.querySelector('.desktop-service-nav .desktop-service-link.active');
    if (initialActiveLink) {
        renderServiceContent(initialActiveLink);
    }
});