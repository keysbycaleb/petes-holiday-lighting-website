document.addEventListener('DOMContentLoaded', () => {
    // --- App Elements ---
    const appContainer = document.querySelector('.app-container');
    const bottomNav = document.querySelector('.bottom-nav');

    // --- Page Navigation & History ---
    let pageHistory = ['page-home'];
    
    // --- Animation Observer ---
    let observer;

    function setupScrollAnimations(pageElement) {
        const elementsToAnimate = pageElement.querySelectorAll('.animate-on-scroll');
        if (elementsToAnimate.length === 0) return;

        const animationObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        });

        elementsToAnimate.forEach((el, index) => {
            if (!el.classList.contains('is-visible')) {
                // Apply slide-in animations based on position or element type
                if (el.closest('.services-page-grid, .location-card-grid')) {
                     el.classList.add(index % 2 === 0 ? 'animate-slide-in-left' : 'animate-slide-in-right');
                } else {
                    el.classList.add('animate-slide-in-left');
                }
                animationObserver.observe(el);
            }
        });
        pageElement.observer = animationObserver;
    }

    const fetchPage = async (pagePath) => {
        try {
            const response = await fetch(pagePath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const text = await response.text();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = text;
            
            // Add animation class to elements within the fetched content
            tempDiv.querySelectorAll('.content-block, .list-group, .why-us-grid, .faq-accordion, .contact-form, .location-card-grid, .detail-hero, .cta-footer').forEach(el => {
                el.classList.add('animate-on-scroll');
            });

            return tempDiv.innerHTML;
        } catch (error) {
            console.error(`Could not fetch page: ${pagePath}`, error);
            // Provide a user-friendly error message within the page content
            return '<div class="content-block animate-on-scroll is-visible"><p>Error: Could not load content for this location.</p></div>';
        }
    };
    
    // --- Particle Effect ---
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray;

        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Bubble {
             constructor() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + Math.random() * 100;
                this.radius = Math.random() * 3 + 2;
                this.speedY = Math.random() * 1 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.2;
            }
            update() {
                this.y -= this.speedY;
                this.x += this.speedX;
                if (this.y < -this.radius) {
                    this.y = canvas.height + this.radius;
                    this.x = Math.random() * canvas.width;
                }
                if (this.x < this.radius || this.x > canvas.width - this.radius) {
                    this.speedX *= -1;
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(173, 216, 230, ${this.opacity * 0.5})`; // Light Blue
                ctx.fillStyle = `rgba(173, 216, 230, ${this.opacity * 0.2})`;   // Light Blue
                ctx.lineWidth = 2;
                ctx.fill();
                ctx.stroke();
            }
        }

        const initBubbles = () => {
            particlesArray = [];
            let num = (canvas.width * canvas.height) / 15000;
            if (num > 100) num = 100;
            for (let i = 0; i < num; i++) {
                particlesArray.push(new Bubble());
            }
        };

        const animateBubbles = () => {
            if (!particlesArray) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particlesArray.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateBubbles);
        };

        setCanvasSize();
        initBubbles();
        animateBubbles();
        window.addEventListener('resize', () => {
            setCanvasSize();
            initBubbles();
        });
    }

    const showPage = async (pageId, pageData = null) => {
        const oldPage = document.querySelector('.page.active');
        if (oldPage && oldPage.observer) {
            oldPage.observer.disconnect();
        }

        let targetPage;
        let isDetailPage = false;

        if (pageData && pageData.type === 'service') {
            isDetailPage = true;
            targetPage = document.getElementById('page-service-detail-template');
            const pageContentHTML = await fetchPage(pageData.target);
            
            targetPage.querySelector('.header-title').textContent = pageData.title;
            targetPage.querySelector('.service-detail-hero').style.backgroundImage = `url('${pageData.image}')`;
            
            const contentWrapper = targetPage.querySelector('.service-detail-content-wrapper');
            contentWrapper.innerHTML = pageContentHTML;

            const ctaSection = contentWrapper.querySelector('div[data-section="cta"]');
            const ctaContainer = targetPage.querySelector('.service-detail-cta-container');
            ctaContainer.innerHTML = '';
            if (ctaSection) {
                ctaContainer.appendChild(ctaSection);
            }

            const overviewTab = targetPage.querySelector('.service-detail-tab[data-section="overview"]');
            const overviewContent = contentWrapper.querySelector('div[data-section="overview"]');
            
            targetPage.querySelectorAll('.service-detail-tab').forEach(t => t.classList.remove('active'));
            if (contentWrapper.querySelectorAll('div[data-section]').length > 0) {
                 contentWrapper.querySelectorAll('div[data-section]').forEach(c => c.classList.remove('active'));
            }

            if (overviewTab) {
                overviewTab.classList.add('active');
                updateTabHighlighter(overviewTab);
            }
            if (overviewContent) overviewContent.classList.add('active');

        } else if (pageData && pageData.type === 'location') {
            isDetailPage = true;
            targetPage = document.createElement('section');
            targetPage.className = 'page location-detail-page';
            targetPage.id = `page-${pageData.target.replace(/[^a-zA-Z0-9]/g, '-')}`;
            
            const pageContentHTML = await fetchPage(pageData.target);
            const cityName = pageData.target.split('/').pop().replace('.html', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            targetPage.innerHTML = `
                <header class="app-header">
                    <a href="#" class="header-back-btn"><i class="fas fa-chevron-left"></i> Back</a>
                    <h2 class="header-title">${cityName}</h2>
                    <div class="header-actions">
                        <a href="tel:6573871505" class="icon-btn" aria-label="Call"><i class="fa-solid fa-phone"></i></a>
                    </div>
                </header>
                <main class="page-content">${pageContentHTML}<footer class="app-footer"></footer></main>
            `;
            appContainer.appendChild(targetPage);
            generateFooters();

        } else {
            targetPage = document.getElementById(pageId);
        }

        if (!targetPage) {
            console.error(`Page "${pageId}" not found or loaded.`);
            return;
        }

        document.body.classList.remove('header-hidden');
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        targetPage.classList.add('active');
        setupScrollAnimations(targetPage);
        updateBottomNavUI(pageId, isDetailPage);

        const pageContentEl = targetPage.querySelector('.page-content');
        if (pageContentEl) pageContentEl.scrollTop = 0;
    };


    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-target]');
        const homeButton = e.target.closest('.home-btn');
        const backButton = e.target.closest('.header-back-btn');

        if (homeButton) {
            e.preventDefault();
            pageHistory = ['page-home'];
            showPage('page-home');
            return;
        }
        
        if (backButton) {
            e.preventDefault();
            const currentPage = document.querySelector('.page.active');
            pageHistory.pop();
            const previousPageId = pageHistory[pageHistory.length - 1] || 'page-home';
            showPage(previousPageId);
            if (currentPage && currentPage.classList.contains('location-detail-page')) {
                setTimeout(() => currentPage.remove(), 400);
            }
            return;
        }

        if (link) {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            if (!targetId) return;

            // This handles the chatbot link click to navigate the SPA
            if (link.closest('.chatbot-message')) {
                const page = document.querySelector('.page.active');
                const serviceDetails = {
                    type: 'service',
                    target: targetId,
                    title: link.textContent.trim(),
                    image: `assets/images/services/${targetId.split('/').pop().replace('.html', '')}.webp`
                };
                pageHistory.push(targetId);
                showPage(targetId, serviceDetails);
                toggleChatbot(false); // Close chatbot after navigation
                return;
            }

            if (link.closest('.action-sheet')) {
                toggleActionSheet(false);
            }

            if (link.classList.contains('service-card') || link.classList.contains('service-page-card') || (link.closest('.list-group') && targetId.includes('services'))) {
                const serviceDetails = {
                    type: 'service',
                    target: targetId,
                    title: link.dataset.serviceTitle || link.textContent.trim(),
                    image: link.dataset.imageUrl,
                };
                pageHistory.push(targetId);
                showPage(targetId, serviceDetails);

            } else if (link.classList.contains('city-card') || (link.parentElement && link.parentElement.classList.contains('location-card-grid'))) {
                 const locationDetails = {
                    type: 'location',
                    target: targetId
                };
                pageHistory.push(targetId);
                showPage(targetId, locationDetails);
            
            } else if (link.classList.contains('nav-item')) {
                pageHistory = [targetId];
                showPage(targetId);
            } else {
                pageHistory.push(targetId);
                showPage(targetId);
            }
        }
    });
    
    function updateTabHighlighter(activeTab) {
        const highlighter = activeTab.closest('.service-detail-tabs-scroller').querySelector('.tab-highlighter');
        if (!highlighter) return;
        highlighter.style.width = `${activeTab.offsetWidth}px`;
        highlighter.style.left = `${activeTab.offsetLeft}px`;
    }

    document.querySelector('#page-service-detail-template').addEventListener('click', function(event) {
        const tab = event.target.closest('.service-detail-tab');
        if (tab) {
            event.preventDefault();
            const section = tab.dataset.section;
            const contentWrapper = this.querySelector('.service-detail-content-wrapper');
            const pageContent = this.querySelector('.page-content');

            if (pageContent.scrollTop > contentWrapper.offsetTop - 60) {
                pageContent.scrollTo({
                    top: contentWrapper.offsetTop - 60,
                    behavior: 'smooth'
                });
            }

            this.querySelectorAll('.service-detail-tab').forEach(t => t.classList.remove('active'));
            this.querySelectorAll('.service-detail-content-wrapper > div[data-section]').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            updateTabHighlighter(tab);
            const content = contentWrapper.querySelector(`div[data-section="${section}"]`);
            if (content) {
                content.classList.add('active');
            }
        }
    });
    
    document.body.addEventListener('click', function(event) {
        const faqQuestion = event.target.closest('.faq-question');
        if (faqQuestion) {
            const faqItem = faqQuestion.parentElement;
            faqItem.classList.toggle('active');
        }

        const locationsHeader = event.target.closest('.locations-header');
        if (locationsHeader) {
            const container = locationsHeader.nextElementSibling;
            locationsHeader.classList.toggle('active');
            container.classList.toggle('open');
        }

        const contentHeader = event.target.closest('.content-accordion-header');
        if (contentHeader) {
            const body = contentHeader.nextElementSibling;
            contentHeader.classList.toggle('active');
            body.classList.toggle('open');
        }

        const scrollToTopButton = event.target.closest('.scroll-to-top');
        if (scrollToTopButton) {
            event.preventDefault();
            const activePageContent = document.querySelector('.page.active .page-content');
            if (activePageContent) {
                activePageContent.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });

    const updateBottomNavUI = (currentPageId, isDetailPage = false) => {
        document.querySelectorAll('.nav-item').forEach(item => {
            let isActive = item.dataset.target === currentPageId;
            if (isDetailPage) {
                if (currentPageId.includes('services')) {
                    if (item.dataset.target === 'page-services') isActive = true;
                } else if (currentPageId.includes('locations')) {
                    if (item.dataset.target === 'page-locations') isActive = true;
                }
            }
            item.classList.toggle('active', isActive);
        });
    };

    let lastScrollTop = 0;
    document.querySelectorAll('.page-content').forEach(pageContent => {
        pageContent.addEventListener('scroll', () => {
            let scrollTop = pageContent.scrollTop;
            if (scrollTop > lastScrollTop && scrollTop > 50) {
                document.body.classList.add('header-hidden');
            } else {
                document.body.classList.remove('header-hidden');
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        });
    });
    
    const citiesData = {
        'los-angeles-county': ['Agoura Hills, CA', 'Alhambra, CA', 'Baldwin Park, CA', 'Bellflower, CA', 'Burbank, CA', 'Carson, CA', 'Compton, CA', 'Downey, CA', 'El Monte, CA', 'Glendale, CA', 'Hawthorne, CA', 'Lakewood, CA', 'Lancaster, CA', 'Long Beach, CA', 'Lynwood, CA', 'Palmdale, CA', 'Pasadena, CA', 'Pomona, CA', 'Redondo Beach, CA', 'Santa Clarita, CA', 'Santa Monica, CA', 'South Gate, CA', 'Torrance, CA', 'West Covina, CA', 'Whittier, CA'],
        'orange-county': ['Anaheim, CA', 'Costa Mesa, CA', 'Irvine, CA', 'Laguna Beach, CA', 'Laguna Hills, CA', 'Laguna Niguel, CA', 'Newport Beach, CA', 'Yorba Linda, CA'],
        'san-diego-county': ['Carlsbad, CA', 'Chula Vista, CA', 'Coronado, CA', 'Del Mar, CA', 'El Cajon, CA', 'Encinitas, CA', 'Escondido, CA', 'Imperial Beach, CA', 'La Mesa, CA', 'Lemon Grove, CA', 'National City, CA', 'Oceanside, CA', 'Poway, CA', 'San Marcos, CA', 'Santee, CA', 'Solana Beach, CA', 'Vista, CA']
    };
    
    const countyNames = {
        'los-angeles-county': 'Los Angeles County',
        'orange-county': 'Orange County',
        'san-diego-county': 'San Diego County'
    };

    function generateCityHTML(city, category) {
        const cityNameForImage = city.replace(', CA', '').replace(/ /g, '-').toLowerCase();
        const cityPageUrl = `pages/locations/${cityNameForImage}.html`;
        return `<a href="#" data-target="${cityPageUrl}" class="city-card" data-category="${category}" style="background-image: url('assets/images/cities/${cityNameForImage}.webp')" loading="lazy"><span>${city}</span></a>`;
    }

    function setupFooterPagination(footer) {
        const gridContainer = footer.querySelector('.locations-list-container .city-card-grid');
        if (!gridContainer) return;

        const allCities = [];
        Object.values(citiesData).forEach(county => allCities.push(...county));
        allCities.sort();

        const itemsPerPage = 6;
        let currentPage = 1;

        function renderFooterPage(page) {
            gridContainer.innerHTML = '';
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageItems = allCities.slice(start, end);

            pageItems.forEach(city => {
                const cityNameForImage = city.replace(', CA', '').replace(/ /g, '-').toLowerCase();
                const card = document.createElement('a');
                card.href = "#";
                card.dataset.target = `pages/locations/${cityNameForImage}.html`;
                card.className = 'city-card';
                card.style.backgroundImage = `url(assets/images/cities/${cityNameForImage}.webp)`;
                card.innerHTML = `<span>${city}</span>`;
                gridContainer.appendChild(card);
            });
        }

        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'pagination-controls';
        footer.querySelector('.locations-list-container').appendChild(controlsContainer);
        
        const pageCount = Math.ceil(allCities.length / itemsPerPage);
        
        function updateFooterControls() {
            controlsContainer.querySelector('.prev-btn').disabled = currentPage === 1;
            controlsContainer.querySelector('.next-btn').disabled = currentPage === pageCount;
        }

        controlsContainer.innerHTML = `<button class="pagination-btn prev-btn">&laquo; Prev</button><button class="pagination-btn next-btn">Next &raquo;</button>`;
        controlsContainer.querySelector('.prev-btn').addEventListener('click', (e) => { e.preventDefault(); if (currentPage > 1) { currentPage--; renderFooterPage(currentPage); updateFooterControls(); }});
        controlsContainer.querySelector('.next-btn').addEventListener('click', (e) => { e.preventDefault(); if (currentPage < pageCount) { currentPage++; renderFooterPage(currentPage); updateFooterControls(); }});
        
        renderFooterPage(1);
        updateFooterControls();
    }

    function generateFooters() {
        const footerHTML = `
            <div class="footer-content">
                <div class="footer-section about">
                    <div class="header-brand-name footer-brand">MODE</div>
                     <div class="footer-socials">
                        <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                        <a href="#" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
                        <a href="tel:6573871505" aria-label="Call"><i class="fa-solid fa-phone"></i></a>
                    </div>
                </div>
                <div class="footer-section">
                    <h6>Company</h6>
                    <ul>
                        <li><a href="#">Contact</a></li>
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Client Testimonials</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h6>Services</h6>
                    <ul>
                        <li><a href="#">Exterior Window Cleaning</a></li>
                        <li><a href="#">Gutter Cleaning</a></li>
                        <li><a href="#">Bird Proofing</a></li>
                        <li><a href="#">House & Roof Washing</a></li>
                    </ul>
                </div>

                <div class="footer-locations-accordion">
                    <div class="locations-header">
                        <span>View Cities We Serve</span>
                        <i class="locations-header-icon fas fa-chevron-down"></i>
                    </div>
                    <div class="locations-list-container">
                        <div class="city-card-grid condensed">
                        </div>
                    </div>
                </div>
            </div>
            <div class="copyright">
                © ${new Date().getFullYear()} Mode Pressure Washing Service. All rights reserved.
            </div>
        `;
        document.querySelectorAll('.app-footer').forEach(footer => {
            // Check if this footer is inside the locations page.
            if (footer.closest('#page-locations')) {
                // If it is, remove the locations accordion to prevent conflicts.
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = footerHTML;
                const accordion = tempDiv.querySelector('.footer-locations-accordion');
                if (accordion) {
                    accordion.remove();
                }
                footer.innerHTML = tempDiv.innerHTML;
            } else {
                // For all other pages, include the accordion and set up pagination.
                footer.innerHTML = footerHTML;
                setupFooterPagination(footer);
            }
        });
    }
    
    function setupLocationPage() {
        const page = document.getElementById('page-locations');
        if (!page) return;

        const locationGrid = page.querySelector('.location-card-grid');
        const searchBar = page.querySelector('#location-search-bar');
        const filterToggleButton = page.querySelector('#filter-toggle-btn');
        
        const filterPanel = document.getElementById('filter-panel');
        const filterOverlay = document.getElementById('filter-modal-overlay');
        const countyFilterOptionsGrid = document.getElementById('county-filter-tags');
        const applyFiltersBtn = document.getElementById('apply-filters-btn');
        const clearFiltersBtn = document.getElementById('clear-filters-btn');

        if (!locationGrid || !searchBar || !filterToggleButton || !filterPanel) return;

        let activeCountyFilters = ['all'];
        
        locationGrid.innerHTML = '';

        const allCitiesWithCategory = [];
        Object.entries(citiesData).forEach(([category, cities]) => {
            cities.forEach(city => {
                allCitiesWithCategory.push({ name: city, category: category });
            });
        });

        allCitiesWithCategory.sort((a, b) => a.name.localeCompare(b.name));

        allCitiesWithCategory.forEach(cityInfo => {
            const cardHTML = generateCityHTML(cityInfo.name, cityInfo.category);
            locationGrid.insertAdjacentHTML('beforeend', cardHTML);
        });

        let countyOptionsHTML = `<label class="filter-option-checkbox checked" for="county-all"><input type="checkbox" id="county-all" name="county" value="all" checked><div class="checkbox-custom"></div><span>All Counties</span></label>`;
        Object.entries(countyNames).forEach(([value, name]) => {
            countyOptionsHTML += `<label class="filter-option-checkbox" for="county-${value}"><input type="checkbox" id="county-${value}" name="county" value="${value}"><div class="checkbox-custom"></div><span>${name}</span></label>`;
        });
        countyFilterOptionsGrid.innerHTML = countyOptionsHTML;

        const allCountyCheckboxes = countyFilterOptionsGrid.querySelectorAll('.filter-option-checkbox');

        function applyFiltersAndSearch() {
            const searchTerm = searchBar.value.toLowerCase().trim();
            const cards = locationGrid.querySelectorAll('.city-card');

            cards.forEach(card => {
                const city = card.querySelector('span').textContent.toLowerCase();
                const category = card.dataset.category;
                
                const matchesSearch = searchTerm === '' || city.includes(searchTerm);
                const matchesFilter = activeCountyFilters.includes('all') || activeCountyFilters.includes(category);
                
                const isVisible = matchesSearch && matchesFilter;
                card.style.display = isVisible ? '' : 'none';
            });
        }

        function toggleFilterModal(show) {
            document.body.classList.toggle('filter-modal-open', show);
            filterOverlay.classList.toggle('active', show);
            filterPanel.classList.toggle('active', show);
        }

        filterToggleButton.addEventListener('click', () => toggleFilterModal(true));
        filterOverlay.addEventListener('click', () => toggleFilterModal(false));
        applyFiltersBtn.addEventListener('click', () => {
            activeCountyFilters = Array.from(countyFilterOptionsGrid.querySelectorAll('input:checked')).map(cb => cb.value);
            applyFiltersAndSearch();
            toggleFilterModal(false);
        });
        
        clearFiltersBtn.addEventListener('click', () => {
             allCountyCheckboxes.forEach(label => {
                const cb = label.querySelector('input');
                const isAll = cb.value === 'all';
                cb.checked = isAll;
                label.classList.toggle('checked', isAll);
            });
        });

        countyFilterOptionsGrid.addEventListener('click', (e) => {
            const label = e.target.closest('.filter-option-checkbox');
            if (!label) return;

            const checkbox = label.querySelector('input');
            const isChecked = !checkbox.checked;
            const allCheckboxLabel = countyFilterOptionsGrid.querySelector('label[for="county-all"]');
            const allCheckbox = allCheckboxLabel.querySelector('input');

            checkbox.checked = isChecked;
            label.classList.toggle('checked', isChecked);

            if (checkbox.value === 'all' && isChecked) {
                 allCountyCheckboxes.forEach(otherLabel => {
                    if(otherLabel !== label) {
                        otherLabel.querySelector('input').checked = false;
                        otherLabel.classList.remove('checked');
                    }
                });
            } else if (checkbox.value !== 'all' && isChecked) {
                allCheckbox.checked = false;
                allCheckboxLabel.classList.remove('checked');
            }
             
            if (!Array.from(countyFilterOptionsGrid.querySelectorAll('input:not([value="all"]):checked')).length) {
                 allCheckbox.checked = true;
                 allCheckboxLabel.classList.add('checked');
            }
        });

        searchBar.addEventListener('input', applyFiltersAndSearch);
        applyFiltersAndSearch();
    }


    const ctaOverlay = document.getElementById('cta-overlay');
    const ctaActionSheet = document.getElementById('cta-action-sheet');

    function toggleActionSheet(show) {
        ctaOverlay.classList.toggle('visible', show);
        ctaActionSheet.classList.toggle('visible', show);
    }
    
    // --- CHATBOT LOGIC ---
    const chatbotToggler = document.getElementById('chatbot-toggler');
    const chatbotCloseBtn = document.getElementById('chatbot-close-btn');
    const chatbox = document.getElementById('chatbot-messages');
    const chatInputContainer = document.getElementById('chatbot-input');
    const heroSearchForm = document.getElementById('hero-search-form');
    const heroSearchInput = document.getElementById('hero-search-input');
    
    let botBrain = {};
    let currentConversationState = {};
    let isBotTyping = false;
    let hasShownScrollPrompt = false;

    async function loadData() {
        if(chatbotToggler) chatbotToggler.disabled = true;
        try {
            const brainRes = await fetch('chatbot_knowledge_base_v2.json');
            botBrain = await brainRes.json();
            if(chatbotToggler) chatbotToggler.disabled = false;
        } catch (error) {
            console.error("Failed to load chatbot brain:", error);
            if(chatbotToggler) { chatbotToggler.style.opacity = '0.5'; chatbotToggler.style.cursor = 'not-allowed'; }
        }
    }

    const toggleChatbot = (show, initialMessage = null) => {
        const isVisible = document.body.classList.contains('show-chatbot');
        if (show === isVisible) return;

        document.body.classList.toggle('show-chatbot', show);

        if (show) {
            startNewConversation();
            if (initialMessage) {
                addMessage(initialMessage, 'user');
            }
            showTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                if (initialMessage) {
                    handleUserInput(initialMessage, true);
                } else {
                    addMessage(botBrain.knowledgeBase.greeting, 'bot');
                    showOptions(["Get a Quote", "Our Services", "Locations"]);
                }
            }, 1200);
        }
    };

    function resetConversationState() {
        currentConversationState = { intent: null, step: 'start', data: {} };
    }
    
    function startNewConversation() {
        resetConversationState();
        isBotTyping = false;
        hasShownScrollPrompt = false;
        chatbox.innerHTML = '';
        chatInputContainer.innerHTML = '';
    }

    const addMessage = (message, sender) => {
        const li = document.createElement("li");
        li.className = `chatbot-message ${sender}`;
        li.innerHTML = message;
        chatbox.appendChild(li);
        
        setTimeout(() => {
            chatbox.scrollTo({
                top: chatbox.scrollHeight,
                behavior: 'smooth'
            });
        }, 50);
    };

    const showTypingIndicator = () => {
        if (isBotTyping) return;
        isBotTyping = true;
        const li = document.createElement("li");
        li.className = "chatbot-message bot typing-indicator";
        li.innerHTML = `<span></span><span></span><span></span>`;
        chatbox.appendChild(li);
        
        setTimeout(() => {
            chatbox.scrollTo({
                top: chatbox.scrollHeight,
                behavior: 'smooth'
            });
        }, 50);
    };

    const removeTypingIndicator = () => {
        const indicator = chatbox.querySelector('.typing-indicator');
        if (indicator) indicator.remove();
        isBotTyping = false;
    };

    const showOptions = (options) => {
        chatInputContainer.innerHTML = '';
        
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'chatbot-input-options';
        
        options.forEach(optionText => {
            const button = document.createElement('button');
            button.className = 'chatbot-option-btn';
            button.textContent = optionText;
            button.addEventListener('click', () => handleUserInput(optionText));
            optionsContainer.appendChild(button);
        });

        chatInputContainer.appendChild(optionsContainer);

        requestAnimationFrame(() => {
            const isOverflowing = optionsContainer.scrollWidth > optionsContainer.clientWidth;
            
            if (isOverflowing) {
                optionsContainer.style.justifyContent = 'flex-start';
            } else {
                optionsContainer.style.justifyContent = 'center';
            }
        });
    };

    const showTextInput = (placeholder = "Type your message...") => {
        chatInputContainer.innerHTML = '';
        const form = document.createElement('form');
        form.id = 'chatbot-text-form';
        form.style.display = 'flex';
        form.style.gap = '10px';
        form.innerHTML = `
            <input type="text" id="chatbot-text-input" placeholder="${placeholder}" required style="flex-grow: 1; padding: 12px; border-radius: 50px; border: 1px solid #3a3a3c; background: #2c2c2e; color: #fff; font-size: 1rem;">
            <button type="submit" style="width: 45px; height: 45px; border-radius: 50%; background: var(--primary-color); color: #fff; border: none; font-weight: 600; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease;"><i class="fa-solid fa-paper-plane"></i></button>
        `;
        chatInputContainer.appendChild(form);

        const input = form.querySelector('#chatbot-text-input');
        input.focus();
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (text && !isBotTyping) handleUserInput(text);
        });
    };

    function normalize(str) {
        return (str || '').toLowerCase().replace(/[.,!?'`;]/g, '').trim();
    }
    
    // --- FINALIZED LOGIC ---
    function analyzeInput(userInput) {
        const normalizedInput = normalize(userInput);
        if (!botBrain || !botBrain.intents) return { intent: 'fallback_unknown_query', entities: {} };

        // --- RULE-BASED OVERRIDES for critical, unambiguous actions ---
        const cancelKeywords = ['cancel', 'cancelling', 'cancellation'];
        if (cancelKeywords.some(kw => normalizedInput.includes(kw))) {
            return { intent: 'ask_about_policy', entities: {}, trigger: 'cancel' };
        }

        let servicesFound = [];
        let intentsFound = [];

        // 1. Find all matching services
        for (const serviceName in botBrain.services) {
            for (const keyword of botBrain.services[serviceName].keywords) {
                const keywordRegex = new RegExp(`\\b${keyword.replace(/ /g, '\\s')}\\b`);
                if (keywordRegex.test(normalizedInput)) {
                    servicesFound.push({ service: serviceName, score: keyword.length });
                }
            }
        }
        
        // 2. Find all matching intents
        for (const intentName in botBrain.intents) {
            for (const keyword of botBrain.intents[intentName]) {
                const keywordRegex = new RegExp(`\\b${keyword.replace(/ /g, '\\s')}\\b`);
                if (keywordRegex.test(normalizedInput)) {
                    intentsFound.push({ intent: intentName, score: keyword.length });
                }
            }
        }

        // 3. Check for tie-breaker
        const uniqueServices = new Set(servicesFound.map(s => s.service));
        if (uniqueServices.size > 1) {
            return { intent: 'fallback_tie_breaker', entities: { services: Array.from(uniqueServices) } };
        }
        
        // 4. Determine best matches by score
        servicesFound.sort((a, b) => b.score - a.score);
        intentsFound.sort((a, b) => b.score - a.score);

        const bestIntent = intentsFound.length > 0 ? intentsFound[0].intent : null;
        const bestService = servicesFound.length > 0 ? servicesFound[0].service : null;
        
        let determinedIntent = 'fallback_unknown_query';
        let entities = {};

        if (bestService) {
            entities.service = bestService;
            if (bestIntent && (bestIntent === 'get_quote' || bestIntent === 'ask_about_booking')) {
                determinedIntent = bestIntent;
            } else {
                determinedIntent = 'service_inquiry';
            }
        } else if (bestIntent) {
            determinedIntent = bestIntent;
        }

        return { intent: determinedIntent, entities: entities };
    }

    function processConversationStep(userInput) {
        if (currentConversationState.step !== 'start') {
            handleContinuation(userInput);
            return;
        }
        
        const analysis = analyzeInput(userInput);
        let intent = analysis.intent; // Use let to allow modification
        const serviceName = analysis.entities.service;
        const trigger = analysis.trigger;

        const allCities = Object.values(citiesData).flat();
        const cityMatch = allCities.find(c => normalize(userInput).includes(normalize(c.replace(', CA', ''))));
        if (cityMatch) {
            currentConversationState.data.city = cityMatch;
        }

        // If the initial analysis fails but we find a city, override the intent to be about location.
        if (intent === 'fallback_unknown_query' && cityMatch) {
            intent = 'ask_about_location';
        }
        
        currentConversationState.intent = intent;
        if(serviceName) currentConversationState.data.service = serviceName;
        
        switch (intent) {
            case 'greeting':
                addMessage(botBrain.knowledgeBase.greeting, 'bot');
                showOptions(["Get a Quote", "Our Services", "Locations"]);
                resetConversationState();
                break;
            case 'get_quote':
            case 'ask_about_booking':
                if (serviceName && currentConversationState.data.city) {
                    currentConversationState.step = 'awaiting_name';
                    addMessage(`Ok, I have ${serviceName} in ${currentConversationState.data.city}. To get you an accurate quote, I just need a few more details. What is your full name?`, 'bot');
                    showTextInput("e.g., Jane Doe");
                } else if (serviceName) {
                    currentConversationState.step = 'awaiting_city_check';
                    addMessage(`Great, let's get a quote for ${serviceName}. What city is the property in?`, 'bot');
                    showTextInput("e.g., Irvine, CA");
                } else {
                    currentConversationState.step = 'awaiting_service';
                    const message = intent === 'get_quote' ? "I can help with that." : "I can help you get started with booking.";
                    addMessage(`${message} Which service are you interested in?`, 'bot');
                    showOptions(Object.keys(botBrain.services));
                }
                break;
            case 'ask_about_service':
                 addMessage("We offer a range of professional exterior cleaning services. Which one would you like to know more about?", 'bot');
                 showOptions(Object.keys(botBrain.services));
                 currentConversationState.step = 'awaiting_service_followup';
                 break;
            case 'service_inquiry':
                addMessage(`You're asking about ${serviceName}. What would you like to do?`, 'bot');
                showOptions([`Get a Quote for ${serviceName}`, `More Details about ${serviceName}`]);
                currentConversationState.step = 'awaiting_service_followup';
                break;
            case 'ask_about_location':
                if (currentConversationState.data.city) {
                    currentConversationState.step = 'awaiting_service_for_city';
                    addMessage(`Yes, we proudly serve ${currentConversationState.data.city}! Which of our services can I help you with there?`, 'bot');
                    showOptions(Object.keys(botBrain.services));
                } else {
                    currentConversationState.step = 'awaiting_city_check';
                    addMessage("We serve many cities across Los Angeles, Orange, and San Diego counties. Which city would you like to check?", 'bot');
                    showTextInput("e.g., Irvine, CA");
                }
                break;
            case 'get_contact_info':
                addMessage(botBrain.knowledgeBase.contact_info, 'bot');
                endConversation(true);
                break;
            case 'ask_about_company':
                addMessage(botBrain.knowledgeBase.company_info, 'bot');
                endConversation(true);
                break;
            case 'ask_about_duration':
                addMessage(botBrain.knowledgeBase.duration_info, 'bot');
                endConversation(true);
                break;
            case 'ask_about_policy':
                const policyNormalizedInput = normalize(userInput);
                 if (trigger === 'cancel' || policyNormalizedInput.includes('cancel')) {
                    addMessage(botBrain.knowledgeBase.cancellation_policy, 'bot');
                } else if (policyNormalizedInput.includes('rain')) {
                    addMessage(botBrain.knowledgeBase.rain_policy, 'bot');
                } else if (policyNormalizedInput.includes('prepare') || policyNormalizedInput.includes('home')) {
                    addMessage(botBrain.knowledgeBase.preparation_info, 'bot');
                } else if (policyNormalizedInput.includes('safe') || policyNormalizedInput.includes('insurance') || policyNormalizedInput.includes('soap') || policyNormalizedInput.includes('plant')) {
                    addMessage(botBrain.knowledgeBase.safety_info, 'bot');
                } else if (policyNormalizedInput.includes('payment')) {
                    addMessage(botBrain.knowledgeBase.payment_info, 'bot');
                } else if (policyNormalizedInput.includes('unhappy') || policyNormalizedInput.includes('guarantee') || policyNormalizedInput.includes('rework')) {
                    addMessage(botBrain.knowledgeBase.satisfaction_policy, 'bot');
                } else {
                    addMessage("I can help with questions about our policies. What are you interested in?", 'bot');
                    showOptions(["Cancellation", "Rain/Weather", "How to Prepare", "Safety & Insurance", "Payment", "Satisfaction Guarantee"]);
                    currentConversationState.step = 'awaiting_clarification';
                    return;
                }
                endConversation(true);
                break;
            case 'ask_about_business_hours':
                 addMessage(botBrain.knowledgeBase.business_hours_info, 'bot');
                 endConversation(true);
                 break;
            case 'acknowledgement':
                 endConversation(true);
                 break;
            case 'fallback_tie_breaker':
                addMessage(botBrain.conversationFlows.fallback_tie_breaker.message, 'bot');
                showOptions(analysis.entities.services);
                break;
            default: // fallback_unknown_query
                addMessage(botBrain.conversationFlows.fallback_unknown_query.message, 'bot');
                endConversation(true);
                break;
        }
    }
    
    function handleContinuation(userInput) {
        const { step } = currentConversationState;
        
        switch(step) {
            case 'awaiting_service':
            case 'awaiting_service_for_city':
                const serviceMatch = Object.keys(botBrain.services).find(s => normalize(userInput).includes(normalize(s)));
                if (serviceMatch) {
                    currentConversationState.data.service = serviceMatch;
                    if (currentConversationState.data.city) {
                        currentConversationState.step = 'awaiting_name';
                        addMessage(`Ok, I have ${serviceMatch} in ${currentConversationState.data.city}. To get you an accurate quote, I just need a few more details. What is your full name?`, 'bot');
                        showTextInput("e.g., Jane Doe");
                    } else {
                        currentConversationState.step = 'awaiting_city_check';
                        addMessage(`Great, let's get a quote for ${serviceMatch}. What city is the property in?`, 'bot');
                        showTextInput("e.g., Irvine, CA");
                    }
                } else {
                    addMessage("Sorry, I don't recognize that service. Please choose one from the list.", 'bot');
                    showOptions(Object.keys(botBrain.services));
                }
                break;

            case 'awaiting_city_check':
                const allCities = Object.values(citiesData).flat();
                const cityMatch = allCities.find(c => normalize(c).includes(normalize(userInput)) || normalize(userInput).includes(normalize(c.replace(', CA', ''))));
                if (cityMatch) {
                    currentConversationState.data.city = cityMatch;
                    
                    if (currentConversationState.data.service) {
                        currentConversationState.step = 'awaiting_name';
                        addMessage(`Ok, I have ${currentConversationState.data.service} in ${cityMatch}. To get you an accurate quote, I just need a few more details. What is your full name?`, 'bot');
                        showTextInput("e.g., Jane Doe");
                    } else {
                        currentConversationState.step = 'awaiting_service_for_city';
                        addMessage(`Yes, we proudly serve ${cityMatch}! Which of our services can I help you with there?`, 'bot');
                        showOptions(Object.keys(botBrain.services));
                    }
                } else {
                    addMessage(`I'm sorry, it doesn't look like we serve "${userInput.trim()}". You can see all our locations on the locations page.`, 'bot');
                    endConversation(true);
                }
                break;

            case 'awaiting_name':
                currentConversationState.data.name = userInput;
                currentConversationState.step = 'awaiting_contact';
                addMessage(`Thanks, ${userInput}. What is the best phone number or email to send the quote to?`, 'bot');
                showTextInput("e.g., (555) 123-4567 or jane@email.com");
                break;
            
            case 'awaiting_contact':
                currentConversationState.data.contact = userInput;
                currentConversationState.step = 'awaiting_details';
                addMessage(`Got it. Lastly, please provide any additional details about the property (e.g., 2-story house, steep roof, etc.). This will help us create the most accurate quote possible.`, 'bot');
                showTextInput("Type any details here...");
                break;

            case 'awaiting_details':
                 currentConversationState.data.details = userInput;
                 addMessage(`Perfect, thank you! I've collected all the necessary information for your ${currentConversationState.data.service} quote in ${currentConversationState.data.city}. Our team will review the details and get back to you shortly at ${currentConversationState.data.contact}.`, 'bot');
                 endConversation(true);
                 break;

            case 'awaiting_service_followup':
                if (normalize(userInput).includes('quote')) {
                    currentConversationState.step = 'awaiting_city_check';
                    addMessage(`Great, let's get a quote for ${currentConversationState.data.service}. What city is the property in?`, 'bot');
                    showTextInput("e.g., Irvine, CA");
                } else if (normalize(userInput).includes('detail')) {
                    const serviceInfo = botBrain.services[currentConversationState.data.service];
                    const pageUrl = serviceInfo.pageUrl;
                    const linkHTML = `<a href="#" data-target="${pageUrl}" data-service-title="${serviceInfo.name}" data-image-url="${serviceInfo.imageUrl}">${currentConversationState.data.service} Details</a>`;
                    addMessage(`You got it. Click here for more information: ${linkHTML}`, 'bot');
                    endConversation(true);
                } else {
                    addMessage(botBrain.conversationFlows.fallback_unknown_query.message, 'bot');
                    endConversation(true);
                }
                break;
            
            case 'awaiting_clarification':
                const normalizedClarification = normalize(userInput);
                let policyFound = false;
                if (normalizedClarification.includes('cancel')) {
                    addMessage(botBrain.knowledgeBase.cancellation_policy, 'bot');
                    policyFound = true;
                } else if (normalizedClarification.includes('rain')) {
                    addMessage(botBrain.knowledgeBase.rain_policy, 'bot');
                    policyFound = true;
                } else if (normalizedClarification.includes('prepare')) {
                    addMessage(botBrain.knowledgeBase.preparation_info, 'bot');
                    policyFound = true;
                } else if (normalizedClarification.includes('safe')) {
                    addMessage(botBrain.knowledgeBase.safety_info, 'bot');
                    policyFound = true;
                } else if (normalizedClarification.includes('payment')) {
                    addMessage(botBrain.knowledgeBase.payment_info, 'bot');
                    policyFound = true;
                } else if (normalizedClarification.includes('satisfaction') || normalizedClarification.includes('guarantee')) {
                    addMessage(botBrain.knowledgeBase.satisfaction_policy, 'bot');
                    policyFound = true;
                }
                
                if (policyFound) {
                    endConversation(true);
                } else {
                    addMessage(botBrain.conversationFlows.fallback_unknown_query.message, 'bot');
                    endConversation(true);
                }
                break;

            default:
                addMessage(botBrain.conversationFlows.fallback_unknown_query.message, 'bot');
                endConversation(true);
                break;
        }
    }

    const handleUserInput = (input, isInitialMessage = false) => {
        if (isBotTyping) return;
        if (!isInitialMessage) {
            addMessage(input, 'user');
        }
        chatInputContainer.innerHTML = '';
        showTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator();
            try {
                processConversationStep(input);
            } catch (error)
            {
                console.error("Chatbot error:", error);
                addMessage(botBrain.knowledgeBase.error_message, 'bot');
                resetConversationState();
            }
        }, 1200);
    };

    function endConversation(shouldPrompt = false) {
        resetConversationState();
        if (shouldPrompt) {
            setTimeout(() => {
                addMessage(botBrain.knowledgeBase.re_engage_prompt, 'bot');
                showOptions(["Get a Quote", "Our Services", "Locations"]);
            }, 2000);
        }
    }
    
    // --- Event Listeners & Initializers ---
    document.body.addEventListener('click', function(event) {
        const target = event.target.closest('.cta-btn, .contact-form-trigger, #cta-overlay, #cta-cancel-btn, #action-sheet-open-chatbot');
        if (!target) return;
        
        event.preventDefault();

        if (target.matches('.cta-btn')) {
            toggleActionSheet(true);
        } else if (target.matches('.contact-form-trigger, #action-sheet-open-chatbot')) {
            toggleActionSheet(false);
            toggleChatbot(true, 'I need a quote');
        } else {
            toggleActionSheet(false);
        }
    });

    if (chatbotToggler) chatbotToggler.addEventListener("click", () => toggleChatbot(true));
    if (chatbotCloseBtn) chatbotCloseBtn.addEventListener("click", () => toggleChatbot(false));
    
    if (heroSearchForm) {
        heroSearchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const query = heroSearchInput.value.trim();
            if (query) {
                toggleChatbot(true, query);
                heroSearchInput.value = '';
            }
        });
    }

    function initializeApp() {
        generateFooters();
        setupLocationPage();
        const initialPage = document.querySelector('.page.active');
        if (initialPage) {
            setupScrollAnimations(initialPage);
        }
    }

    loadData();
    initializeApp();
});