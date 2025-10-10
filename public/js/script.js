// This function will be called by the Google Maps script once it's loaded
function initAllAutocompletes() {
    initAutocomplete('full-address', 'address-storage', 'city-storage', 'zip-storage');
    initAutocomplete('full-address-desktop', 'address-storage-desktop', 'city-storage-desktop', 'zip-storage-desktop');
}

function initAutocomplete(inputId, addressStorageId, cityStorageId, zipStorageId) {
    const addressInput = document.getElementById(inputId);
    if (!addressInput) return;

    const autocomplete = new google.maps.places.Autocomplete(addressInput, {
        componentRestrictions: { country: "us" },
        fields: ["address_components", "formatted_address"],
        types: ["address"],
    });

    autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        
        let city = "";
        let zip = "";
        for (const component of place.address_components) {
            if (component.types.includes("locality")) {
                city = component.long_name;
            }
            if (component.types.includes("postal_code")) {
                zip = component.long_name;
            }
        }
        
        document.getElementById(addressStorageId).value = place.formatted_address || '';
        document.getElementById(cityStorageId).value = city;
        document.getElementById(zipStorageId).value = zip;
    });
}


document.addEventListener('DOMContentLoaded', () => {
    // --- App Elements ---
    const appContainer = document.querySelector('.app-container');
    const serviceDetailPage = document.getElementById('page-service-detail-template');

    // --- Data ---
    const galleryData = [
        { image: 'pic01.jpg', title: 'Classic Elegance', description: 'Warm white lights trace the stunning roofline of this beautiful stucco home, accented by matching wreaths. The soft glow creates a timeless and inviting holiday atmosphere. <a href="#" class="gallery-cta" data-target="page-contact">Like the look of this house? Contact us to see how we can help!</a>' },
        { image: 'pic02.jpg', title: 'Farmhouse Festive', description: 'Crisp white lights give this modern farmhouse a clean and festive look. A single, glowing star adds a touch of classic Christmas magic to the design. <a href="#" class="gallery-cta" data-target="page-contact">Like the look of this house? Contact us to see how we can help!</a>' },
        { image: 'pic03.jpg', title: 'Winter Wonderland', description: 'This home is transformed with brilliant white rooflines and glowing snowflake accents. The combination evokes the feeling of a perfect, snowy Christmas night. <a href="#" class="gallery-cta" data-target="page-contact">Like the look of this house? Contact us to see how we can help!</a>' },
        { image: 'pic04.jpg', title: 'Bold & Bright', description: 'Vibrant red lights make a powerful statement, outlining the home’s architecture and creating a warm, cheerful glow. Illuminated reindeer complete this joyful scene. <a href="#" class="gallery-cta" data-target="page-contact">Like the look of this house? Contact us to see how we can help!</a>' },
        { image: 'pic05.jpg', title: 'Icy Blue Christmas', description: 'Cool blue and white lights create a serene, wintery escape. The snowflake motifs add a delicate and magical touch to this eye-catching display. <a href="#" class="gallery-cta" data-target="page-contact">Like the look of this house? Contact us to see how we can help!</a>' },
        { image: 'pic06.jpg', title: 'Snowy Welcome', description: 'The warm lights on this classic brick home stand out beautifully against a blanket of snow, creating a picture-perfect and cozy holiday welcome. <a href="#" class="gallery-cta" data-target="page-contact">Like the look of this house? Contact us to see how we can help!</a>' },
        { image: 'pic07.jpg', title: 'Woodland Charm', description: 'This dark-paneled home is beautifully defined by warm white lights, with festive wreaths in each window adding a traditional and charming touch. <a href="#" class="gallery-cta" data-target="page-contact">Like the look of this house? Contact us to see how we can help!</a>' },
        { image: 'pic08.jpg', title: 'Cozy Cottage Glow', description: 'A simple yet elegant design enhances the cozy feel of this home. Lit mini-trees frame the doorway, inviting guests in with a warm holiday spirit. <a href="#" class="gallery-cta" data-target="page-contact">Like the look of this house? Contact us to see how we can help!</a>' },
        { image: 'pic09.jpg', title: 'Symmetrical Sparkle', description: 'Clean lines and perfect symmetry make this display a standout. The bright white lights and festive red bows create a look that is both modern and classic. <a href="#" class="gallery-cta" data-target="page-contact">Like the look of this house? Contact us to see how we can help!</a>' },
        { image: 'pic10.jpg', title: 'Stone & Starlight', description: 'Warm lights complement the beautiful stonework of this home. Wreaths adorned with red bows add a perfect pop of traditional Christmas color. <a href="#" class="gallery-cta" data-target="page-contact">Like the look of this house? Contact us to see how we can help!</a>' },
        { image: 'pic11.jpg', title: 'Suburban Glow', description: 'This ranch-style home shines with a classic roofline installation. The lights beautifully highlight the architectural details and create a welcoming curbside appeal. <a href="#" class="gallery-cta" data-target="page-contact">Like the look of this house? Contact us to see how we can help!</a>' },
        { image: 'pic12.jpg', title: 'Rustic Radiance', description: 'The combination of stone, dark wood, and warm lights gives this home a rustic yet elegant holiday feel. It’s a cozy look perfect for a mountain retreat. <a href="#" class="gallery-cta" data-target="page-contact">Like the look of this house? Contact us to see how we can help!</a>' },
        { image: 'pic13.jpg', title: 'Grand Illumination', description: 'A large home with multiple peaks provides the perfect canvas for a grand display. The lights create a stunning silhouette against the night sky. <a href="#" class="gallery-cta" data-target="page-contact">Like the look of this house? Contact us to see how we can help!</a>' },
        { image: 'pic14.jpg', title: 'Coastal Christmas', description: 'This beautiful home with its clean white fencing gets a classic holiday treatment. The warm lights add a touch of magic to its charming coastal architecture. <a href="#" class="gallery-cta" data-target="page-contact">Like the look of this house? Contact us to see how we can help!</a>' },
        { image: 'pic15.jpg', title: 'Architectural Highlight', description: 'Every peak and angle of this stunning home is expertly traced with light, showcasing its intricate design and creating a truly breathtaking holiday spectacle. <a href="#" class="gallery-cta" data-target="page-contact">Like the look of this house? Contact us to see how we can help!</a>' }
    ];

    // --- Page Navigation & History ---
    let pageHistory = ['page-home'];
    
    const showPage = (pageId, isBack = false) => {
        const currentPage = document.querySelector('.page.active');
        const nextPage = document.getElementById(pageId);

        // CTA Button Bounce Logic
        if (pageId === 'page-home') {
            const ctaButton = document.querySelector('#page-home .hero .btn-primary');
            if (ctaButton) {
                ctaButton.classList.remove('bouncing');
                setTimeout(() => ctaButton.classList.add('bouncing'), 10);
            }
            // Reset vertical timeline animation
            if (verticalTimelinesArray.length > 0) {
                verticalTimelinesArray.forEach(timeline => timeline.reset());
                setTimeout(checkTimelineScroll, 50); // Re-check which blocks should be visible
            }
        }

        if (!nextPage || (currentPage && currentPage.id === pageId)) return;

        if (!isBack) {
            if (pageId !== pageHistory[pageHistory.length - 1]) {
                pageHistory.push(pageId);
            }
        }

        if (currentPage) {
            currentPage.classList.remove('active');
        }
        
        nextPage.classList.add('active');
        // On page show, we should be at the top. This is an instant scroll.
        window.scrollTo(0, 0); 
        updateBottomNavUI(pageId);

        setupScrollAnimations(nextPage);
        setupTestimonialCarousel(nextPage);

        if (pageId === 'page-services') {
            const serviceCards = nextPage.querySelectorAll('.service-page-card');
            serviceCards.forEach(card => card.classList.remove('animate'));
            setTimeout(() => {
                serviceCards.forEach(card => card.classList.add('animate'));
            }, 50);
        }

        if (pageId === 'page-locations') {
            // Re-trigger location card animation by re-applying filters
             const locationsPageLogic = document.getElementById('page-locations');
             if(locationsPageLogic) {
                const applyBtn = locationsPageLogic.querySelector('#apply-filters-btn');
                if(applyBtn) applyBtn.click();
             }
        }
        
        if (pageId === 'page-gallery') {
            const galleryCards = nextPage.querySelectorAll('.gallery-card');
            galleryCards.forEach(card => card.classList.remove('animate'));
            setTimeout(() => {
                galleryCards.forEach(card => card.classList.add('animate'));
            }, 50);
        }
    };

    const goBack = () => {
        if (pageHistory.length > 1) {
            pageHistory.pop();
            const prevPageId = pageHistory[pageHistory.length - 1];
            showPage(prevPageId, true);
        }
    };

    // --- MAIN EVENT LISTENER FOR NAVIGATION ---
    document.body.addEventListener('click', (e) => {
        const navLink = e.target.closest('[data-target]');
        if (navLink) {
            e.preventDefault();
            const targetId = navLink.dataset.target;
            
            if (navLink.closest('.service-page-card')) {
                const serviceKey = navLink.dataset.serviceKey;
                loadServiceDetailPage(serviceKey);
            } else if (navLink.closest('.city-card')) {
                const cityName = navLink.querySelector('span').textContent;
                showLocationModal(cityName);
            } else {
                 showPage(targetId);
            }
        }

        const backBtn = e.target.closest('.header-back-btn');
        if (backBtn) {
            e.preventDefault();
            goBack();
        }

        const homeBtn = e.target.closest('.home-btn');
        if(homeBtn) {
            e.preventDefault();
            pageHistory = ['page-home'];
            showPage('page-home');
        }
    });

    const updateBottomNavUI = (currentPageId) => {
        document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.target === currentPageId);
        });
    };

    // --- SCROLL-BASED UI CHANGES & ANIMATIONS ---
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        document.body.classList.toggle('header-hidden', scrollTop > lastScrollTop && scrollTop > 50);
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;

        const homeHeader = document.querySelector('#page-home .app-header');
        if (homeHeader) {
            homeHeader.classList.toggle('scrolled', scrollTop > 50);
        }
        
        const serviceTabs = document.querySelector('.service-detail-page.active .service-detail-tabs');
        if (serviceTabs) {
            const heroSection = document.querySelector('.service-detail-page.active .service-detail-hero');
            const heroHeight = heroSection ? heroSection.offsetHeight : 0;
            const headerHeight = 64; 
            
            if (scrollTop > (heroHeight - headerHeight)) {
                serviceTabs.classList.add('sticky');
            } else {
                serviceTabs.classList.remove('sticky');
            }
        }

    }, { passive: true });


    // --- DYNAMIC CONTENT & PAGE LOGIC ---
    
    // --- SERVICES PAGE LOGIC ---
    const servicesPage = document.getElementById('page-services');
    if (servicesPage) {
        const grid = servicesPage.querySelector('.services-page-grid');
        
        async function fetchServices() {
            try {
                const response = await fetch('js/services.json');
                const services = await response.json();
                grid.innerHTML = '';
                Object.entries(services).forEach(([key, service]) => {
                    const card = document.createElement('a');
                    card.href = '#';
                    card.className = 'service-page-card';
                    card.dataset.target = 'page-service-detail-template';
                    card.dataset.serviceKey = key;
                    const imageUrl = `../${service.imageUrl}`;
                    card.style.setProperty('--bg-image', `url('${imageUrl}')`);
                    
                    card.innerHTML = `
                        <div class="service-page-card-content">
                            <h3 class="card-title">${key}</h3>
                        </div>
                    `;
                    grid.appendChild(card);
                });
            } catch (error) {
                console.error("Failed to load services:", error);
                grid.innerHTML = "<p>Could not load services.</p>";
            }
        }
        
        fetchServices();
    }

    // --- SERVICE DETAIL PAGE LOGIC ---
    let isServicePageLoading = false;

    async function loadServiceDetailPage(serviceKey) {
        if (isServicePageLoading) return;
        isServicePageLoading = true;

        const titleEl = serviceDetailPage.querySelector('.header-title');
        const heroTitleEl = serviceDetailPage.querySelector('.service-detail-hero-title');
        const heroEl = serviceDetailPage.querySelector('.service-detail-hero');
        const contentWrapper = serviceDetailPage.querySelector('.service-detail-content-wrapper');

        // Reset tabs to default active state ('overview')
        serviceDetailPage.querySelectorAll('.service-detail-tab').forEach(t => t.classList.remove('active'));
        const overviewTab = serviceDetailPage.querySelector('.service-detail-tab[data-target="overview"]');
        if (overviewTab) overviewTab.classList.add('active');

        try {
            const servicesRes = await fetch('js/services.json');
            const services = await servicesRes.json();
            const serviceData = services[serviceKey];
            
            const contentRes = await fetch(serviceData.pageUrl);
            const htmlText = await contentRes.text();
            const doc = new DOMParser().parseFromString(htmlText, 'text/html');

            titleEl.textContent = serviceKey;
            heroTitleEl.textContent = serviceKey;
            heroEl.style.backgroundImage = `url('../${serviceData.imageUrl}')`;
            
            contentWrapper.innerHTML = '';
            contentWrapper.style.minHeight = ''; // Clear minHeight
            ['overview', 'details', 'why-us', 'faq'].forEach(sectionName => {
                const sectionContent = doc.querySelector(`[data-section="${sectionName}"]`);
                if (sectionContent) {
                    const finalSection = document.createElement('div');
                    finalSection.dataset.section = sectionName;
                    const titleEl = sectionContent.querySelector('h4.sub-title');
                    let titleText = (sectionName === 'overview') ? "Summary" : (titleEl ? titleEl.textContent : null);
                    if (titleEl) titleEl.remove();
                    
                    if (titleText) {
                        const newTitle = document.createElement('h4');
                        newTitle.className = 'section-title';
                        newTitle.textContent = titleText;
                        finalSection.appendChild(newTitle);
                    }

                    const cardSelectors = { details: 'li', 'why-us': '.why-us-card', faq: '.faq-item' };
                    const elementsToCardify = sectionContent.querySelectorAll(cardSelectors[sectionName]);

                    if (elementsToCardify.length > 0) {
                        const cardContainer = document.createElement('div');
                        cardContainer.className = 'info-card-container';
                        elementsToCardify.forEach(el => {
                            if (el.textContent.trim()) {
                                const card = document.createElement('div');
                                card.className = 'info-card';
                                card.innerHTML = el.outerHTML;
                                cardContainer.appendChild(card);
                            }
                        });
                        finalSection.appendChild(cardContainer);
                    } else {
                        finalSection.innerHTML += sectionContent.innerHTML;
                    }
                    finalSection.style.display = 'none';
                    contentWrapper.appendChild(finalSection);
                }
            });
            
            showPage('page-service-detail-template');
            
            // Activate the default tab after a short delay to allow rendering
            setTimeout(() => {
                const initialTab = serviceDetailPage.querySelector('.service-detail-tab.active');
                if(initialTab) activateTab(initialTab, true);
                isServicePageLoading = false;
            }, 100);

        } catch (error) {
            console.error(`Failed to load service detail for ${serviceKey}:`, error);
            isServicePageLoading = false;
        }
    }
    
    function animateInfoCards(sectionElement) {
        if (!sectionElement) return;
        const cards = sectionElement.querySelectorAll('.info-card');
        cards.forEach((card, index) => {
            card.style.animation = 'none';
            void card.offsetWidth;
            card.style.animation = `infoCardFadeInUp 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) ${index * 0.1}s forwards`;
        });
    }

    function activateTab(tab, isInitialLoad = false) {
        if (!tab) return;
        const highlighter = serviceDetailPage.querySelector('.tab-highlighter');
        const contentWrapper = serviceDetailPage.querySelector('.service-detail-content-wrapper');
        const allTabs = serviceDetailPage.querySelectorAll('.service-detail-tab');
        const contentSections = serviceDetailPage.querySelectorAll('.service-detail-content-wrapper > div[data-section]');
        const targetSectionName = tab.dataset.target;
    
        // --- Added Feature: Smooth scroll to top on tab change ---
        if (!isInitialLoad) {
            const heroSection = serviceDetailPage.querySelector('.service-detail-hero');
            // Calculate the position where the tabs become sticky and scroll to it.
            const targetScrollPosition = (heroSection ? heroSection.offsetHeight : 0) - 64; // 64 is header height
            
            // We only scroll if the user is further down the page than the target.
            if (window.scrollY > targetScrollPosition) {
                 window.scrollTo({
                    top: targetScrollPosition,
                    behavior: 'smooth'
                });
            }
        }
        // --- End of Added Feature ---
    
        allTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        highlighter.style.width = `${tab.offsetWidth}px`;
        highlighter.style.left = `${tab.offsetLeft}px`;
    
        contentSections.forEach(section => {
            section.style.display = section.dataset.section === targetSectionName ? 'block' : 'none';
        });
    
        const activeSection = contentWrapper.querySelector(`[data-section="${targetSectionName}"]`);
        if (activeSection) {
            // Let content determine height automatically
            contentWrapper.style.minHeight = '0px'; 
            animateInfoCards(activeSection);
        }
    }

    // --- EVENT DELEGATION FOR SERVICE DETAIL PAGE ---
    if (serviceDetailPage) {
        // Handle Tab Clicks
        serviceDetailPage.addEventListener('click', (e) => {
            const tab = e.target.closest('.service-detail-tab');
            if (tab && !tab.classList.contains('active')) {
                activateTab(tab);
            }
        });

        // Handle FAQ Clicks
        serviceDetailPage.addEventListener('click', (e) => {
            const question = e.target.closest('.faq-question');
            if (!question) return;

            const faqItem = question.closest('.faq-item');
            if (!faqItem) return;

            const answer = faqItem.querySelector('.faq-answer');
            if (!answer) return;

            faqItem.classList.toggle('active');
            answer.style.maxHeight = faqItem.classList.contains('active') ? `${answer.scrollHeight}px` : '0px';
        });
    }
    
    // --- LOCATIONS PAGE LOGIC ---
    const locationsPage = document.getElementById('page-locations');
    if (locationsPage) {
        const grid = document.getElementById('location-card-grid');
        const searchBar = document.getElementById('location-search-bar');
        const openFilterBtn = document.getElementById('open-filter-modal-btn');
        const filterModalOverlay = document.getElementById('filter-modal-overlay');
        const filterPanel = document.getElementById('filter-panel');
        const filterOptionsContainer = document.getElementById('filter-options-container');
        const applyFiltersBtn = document.getElementById('apply-filters-btn');
        const clearFiltersBtn = document.getElementById('clear-filters-btn');
        let allLocationsData = {}, allCities = [];

        async function fetchLocations() {
            try {
                const response = await fetch('js/locations.json');
                allLocationsData = await response.json();
                allCities = Object.values(allLocationsData).flat().sort();
                populateFilterModal();
                applyFilters();
            } catch (error) {
                console.error("Failed to load locations:", error);
                grid.innerHTML = "<p>Could not load locations.</p>";
            }
        }

        function renderGrid(cities) {
            grid.innerHTML = '';
            cities.forEach((city, index) => {
                const card = document.createElement('a');
                card.href = '#';
                card.className = 'city-card';
                card.dataset.target = 'location-modal'; // For modal triggering
                const imgIndex = String((index % 15) + 1).padStart(2, '0');
                card.style.setProperty('--bg-image', `url('../assets/images/lights/pic${imgIndex}.jpg')`);
                card.innerHTML = `<span>${city}</span>`;

                // Cascading animation logic
                card.style.opacity = '0';
                card.style.transform = 'scale(0.5)';
                const delay = index < 10 ? index * 0.1 : 1 + (index - 10) * 0.02;
                card.style.animation = `cardBounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${delay}s forwards`;
                
                grid.appendChild(card);
            });
        }
        
        function createFilterOption(value, text, isChecked = false) {
            const label = document.createElement('label');
            label.className = 'filter-option-checkbox';
            if (isChecked) label.classList.add('checked');
            label.innerHTML = `
                <input type="checkbox" name="county" value="${value}" ${isChecked ? 'checked' : ''}>
                <span class="checkbox-custom"></span>
                <span>${text}</span>
            `;
            return label;
        }

        function populateFilterModal() {
            filterOptionsContainer.innerHTML = '';
            // Add "All Counties" option first
            filterOptionsContainer.appendChild(createFilterOption('all', 'All Counties', true));

            Object.keys(allLocationsData).forEach(countyKey => {
                const countyName = countyKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                filterOptionsContainer.appendChild(createFilterOption(countyKey, countyName));
            });
        }
        
       // Delegated click listener for the entire filter options container
        filterOptionsContainer.addEventListener('click', (e) => {
            const label = e.target.closest('.filter-option-checkbox');
            if (!label) return;

            // Use a timeout to allow the browser's default checkbox behavior to complete first
            setTimeout(() => {
                const allCheckboxes = filterOptionsContainer.querySelectorAll('input[name="county"]');
                const clickedCheckbox = label.querySelector('input');
                const allCountiesCheckbox = filterOptionsContainer.querySelector('input[value="all"]');

                if (clickedCheckbox.value === 'all') {
                    // If "All Counties" was just checked, uncheck all others
                    if (clickedCheckbox.checked) {
                        allCheckboxes.forEach(cb => {
                            if (cb.value !== 'all') cb.checked = false;
                        });
                    }
                } else {
                    // If a specific county was just checked, uncheck "All Counties"
                    if (clickedCheckbox.checked) {
                        allCountiesCheckbox.checked = false;
                    }
                }

                // If no specific counties are checked, re-check "All Counties"
                const anyCountyChecked = Array.from(allCheckboxes).some(cb => cb.checked && cb.value !== 'all');
                if (!anyCountyChecked) {
                    allCountiesCheckbox.checked = true;
                }
                
                // Update visual styles for all checkboxes
                allCheckboxes.forEach(cb => {
                    cb.parentElement.classList.toggle('checked', cb.checked);
                });
            }, 0);
        });


        function applyFilters() {
            const searchTerm = searchBar.value.toLowerCase();
            const selectedCounties = Array.from(filterOptionsContainer.querySelectorAll('input[name="county"]:checked'))
                .map(cb => cb.value)
                .filter(val => val !== 'all'); // Exclude 'all' from the list
            
            let tempFiltered = allCities;

            if (selectedCounties.length > 0) {
                tempFiltered = selectedCounties.flatMap(county => allLocationsData[county]);
            }

            if (searchTerm) {
                tempFiltered = tempFiltered.filter(city => city.toLowerCase().includes(searchTerm));
            }
            renderGrid(tempFiltered.sort());
        }
        
        searchBar.addEventListener('input', applyFilters);
        
        openFilterBtn.addEventListener('click', () => {
            filterModalOverlay.classList.add('active');
            filterPanel.classList.add('active');
        });

        const closeFilterModal = () => {
            filterModalOverlay.classList.remove('active');
            filterPanel.classList.remove('active');
        };

        filterModalOverlay.addEventListener('click', closeFilterModal);
        
        applyFiltersBtn.addEventListener('click', () => {
            applyFilters();
            closeFilterModal();
        });
        
        clearFiltersBtn.addEventListener('click', () => {
            filterOptionsContainer.querySelectorAll('input').forEach(cb => {
                const isAllCounties = cb.value === 'all';
                cb.checked = isAllCounties;
                cb.parentElement.classList.toggle('checked', isAllCounties);
            });
        });

        fetchLocations();
    }
    
    // --- LOCATION MODAL LOGIC ---
    const locationModalOverlay = document.getElementById('location-modal-overlay');
    const locationModalPanel = document.getElementById('location-modal-panel');
    const locationModalMessage = document.getElementById('location-modal-message');
    const locationModalCta = document.getElementById('location-modal-cta');
    const locationModalCloseBtn = document.getElementById('location-modal-close-btn');

    const locationMessages = [
        "Great news! We light up homes in <b>{city}</b>! Let's get you decked out for the holidays.",
        "Yes, we serve <b>{city}</b>! Ready to make your home the brightest on the block?",
        "You're in luck! Our team is ready to bring holiday cheer to <b>{city}</b>.",
        "Holiday lighting in <b>{city}</b>? Absolutely! Let’s plan your amazing display.",
        "We're excited to serve <b>{city}</b>! Click here to start your holiday transformation."
    ];

    function showLocationModal(cityName) {
        const randomIndex = Math.floor(Math.random() * locationMessages.length);
        const message = locationMessages[randomIndex].replace('{city}', cityName);
        locationModalMessage.innerHTML = message;
        
        locationModalOverlay.classList.add('active');
        locationModalPanel.classList.add('active');
    }

    function closeLocationModal() {
        locationModalOverlay.classList.remove('active');
        locationModalPanel.classList.remove('active');
    }

    locationModalOverlay.addEventListener('click', closeLocationModal);
    locationModalCloseBtn.addEventListener('click', closeLocationModal);
    locationModalCta.addEventListener('click', (e) => {
        e.preventDefault();
        closeLocationModal();
        showPage('page-contact');
    });

    // --- FORM SUBMISSION & SUCCESS MODAL ---
    const contactForm = document.getElementById('contact-form');
    const successModalOverlay = document.getElementById('form-success-modal-overlay');
    const successModalPanel = document.getElementById('form-success-modal-panel');
    const successReturnBtn = document.getElementById('form-success-return-btn');
    const successTitle = document.getElementById('form-success-title');
    const successMessage = document.getElementById('form-success-message');

    // --- ADDRESS VALIDATION MODALS ---
    const addressAlertModalOverlay = document.getElementById('address-alert-modal-overlay');
    const addressAlertModalPanel = document.getElementById('address-alert-modal-panel');
    const addressInfoModalOverlay = document.getElementById('address-info-modal-overlay');
    const addressInfoModalPanel = document.getElementById('address-info-modal-panel');
    
    // --- PHONE VALIDATION MODAL ---
    const phoneAlertModalOverlay = document.getElementById('phone-alert-modal-overlay');
    const phoneAlertModalPanel = document.getElementById('phone-alert-modal-panel');
    const phoneAlertCloseBtn = document.getElementById('phone-alert-close-btn');
    const phoneAlertOkayBtn = document.getElementById('phone-alert-okay-btn');

    // --- PHONE INPUT MASKING ---
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            const digits = e.target.value.replace(/\D/g, '');
            if (!digits.length) {
                e.target.value = '';
                return;
            }
            if (digits.length <= 3) {
                e.target.value = `(${digits}`;
            } else if (digits.length <= 6) {
                e.target.value = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
            } else {
                e.target.value = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
            }
        });
    }

    const openAddressInfoModal = () => {
        addressAlertModalOverlay.classList.remove('active');
        addressAlertModalPanel.classList.remove('active');
        addressInfoModalOverlay.classList.add('active');
        addressInfoModalPanel.classList.add('active');
    };

    const closeAddressAlertModal = () => {
        addressAlertModalOverlay.classList.remove('active');
        addressAlertModalPanel.classList.remove('active');
    };
    
    const closeAddressInfoModal = () => {
        addressInfoModalOverlay.classList.remove('active');
        addressInfoModalPanel.classList.remove('active');
    };
    
    const closePhoneAlertModal = () => {
        phoneAlertModalOverlay.classList.remove('active');
        phoneAlertModalPanel.classList.remove('active');
    };
    
    document.getElementById('why-address-btn').addEventListener('click', openAddressInfoModal);
    document.getElementById('address-alert-why-btn').addEventListener('click', openAddressInfoModal);
    
    addressAlertModalOverlay.addEventListener('click', (e) => {
        if (e.target === addressAlertModalOverlay || e.target.closest('#address-alert-close-btn')) {
            closeAddressAlertModal();
        }
    });

    addressInfoModalOverlay.addEventListener('click', (e) => {
        if (e.target === addressInfoModalOverlay || e.target.closest('#address-info-close-btn')) {
            closeAddressInfoModal();
        }
    });

    phoneAlertCloseBtn.addEventListener('click', closePhoneAlertModal);
    phoneAlertOkayBtn.addEventListener('click', closePhoneAlertModal);
    phoneAlertModalOverlay.addEventListener('click', (e) => {
        if (e.target === phoneAlertModalOverlay) {
            closePhoneAlertModal();
        }
    });

    const successMessages = [
        { title: "All set!", message: "Your neighbors are about to regret their inflatable snowman." },
        { title: "Message sent!", message: "Elves are already arguing over ladder duty for your display." },
        { title: "Your request is in!", message: "Santa’s jealous you didn’t call him first." },
        { title: "Form submitted—congrats!", message: "Your house is now officially visible from the North Pole." },
        { title: "Submission received!", message: "Rudolph’s nose is about to have some competition." },
        { title: "All set!", message: "Your halls are about to get decked harder than Mariah Carey hits that high note." },
        { title: "Consultation request confirmed!", message: "Your lights may cause more traffic than a mall parking lot on Christmas Eve." },
        { title: "Form submitted!", message: "Santa just texted—he wants to move in once your lights are up." },
        { title: "Request received!", message: "Warning: neighbors may start caroling out of sheer envy." },
        { title: "Success!", message: "Clark Griswold just called you an inspiration." }
    ];

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const addressValue = document.getElementById('address-storage').value;
            if (!addressValue || addressValue.trim() === '') {
                addressAlertModalOverlay.classList.add('active');
                addressAlertModalPanel.classList.add('active');
                return;
            }

            // --- PHONE VALIDATION ---
            const phoneValue = phoneInput.value.replace(/\D/g, '');
            if (phoneValue.length !== 10) {
                phoneAlertModalOverlay.classList.add('active');
                phoneAlertModalPanel.classList.add('active');
                return;
            }
            
            try {
                const formData = new FormData(contactForm);
                const submissionData = {};
                for (const [key, value] of formData.entries()) {
                    if (key !== 'full-address') {
                        submissionData[key] = value;
                    }
                }
                
                submissionData.formId = "petes-holiday-lighting"; 

                await saveSubmission(submissionData);

                const randomIndex = Math.floor(Math.random() * successMessages.length);
                const randomMessage = successMessages[randomIndex];
                successTitle.textContent = randomMessage.title;
                successMessage.textContent = randomMessage.message;

                successModalOverlay.classList.add('active');
                successModalPanel.classList.add('active');
                contactForm.reset();

            } catch (error) {
                console.error("Error submitting form to Firebase:", error);
                alert("There was an error submitting your request. Please try again.");
            }
        });
    }
    
    function closeSuccessModal() {
        successModalOverlay.classList.remove('active');
        successModalPanel.classList.remove('active');
    }

    if (successReturnBtn) {
        successReturnBtn.addEventListener('click', () => {
            closeSuccessModal();
            pageHistory = ['page-home'];
            showPage('page-home');
        });
    }
    if (successModalOverlay) {
        successModalOverlay.addEventListener('click', closeSuccessModal);
    }


    // --- SCROLL ANIMATIONS SETUP ---
    function setupScrollAnimations(pageElement) {
        const stepsContainer = pageElement.querySelector('.steps-container');
        if (stepsContainer) {
            const stepCards = stepsContainer.querySelectorAll('.step-card');
            if (stepCards.length === 0) return;
            stepCards.forEach(card => card.classList.remove('is-visible'));
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) entry.target.classList.add('is-visible');
                });
            }, { rootMargin: '0px 0px -25% 0px', threshold: 0 });
            stepCards.forEach(card => observer.observe(card));
        }
    }
    
    // --- TESTIMONIAL CAROUSEL ---
    let testimonialInterval;

    function setupTestimonialCarousel(pageElement) {
        const track = pageElement.querySelector('.testimonial-carousel-track');
        if (!track) return;
        if (testimonialInterval) clearInterval(testimonialInterval);

        setTimeout(() => {
            track.style.transition = 'none';
            track.style.transform = 'translateX(0px)';
            const slides = Array.from(track.children);
            const originalSlideCount = slides.filter(s => !s.classList.contains('clone')).length;
            if (originalSlideCount <= 1) return;
            if (track.children.length === originalSlideCount) {
                const firstClone = slides[0].cloneNode(true);
                firstClone.classList.add('clone');
                track.appendChild(firstClone);
            }
            let currentIndex = 0;
            testimonialInterval = setInterval(() => {
                const slideWidth = slides[0].getBoundingClientRect().width;
                if (slideWidth === 0) return;
                currentIndex++;
                const gap = parseFloat(window.getComputedStyle(track).gap);
                const offset = -currentIndex * (slideWidth + gap);
                track.style.transition = 'transform 1.2s cubic-bezier(0.68, -0.6, 0.6, 1.6)';
                track.style.transform = `translateX(${offset}px)`;
                if (currentIndex === originalSlideCount) {
                    setTimeout(() => {
                        track.style.transition = 'none';
                        currentIndex = 0;
                        track.style.transform = `translateX(0px)`;
                    }, 1200);
                }
            }, 6000);
        }, 100);
    }

    // --- FOOTER SETUP ---
    async function initializeFooters() {
        const template = document.getElementById('footer-template');
        if (!template) return;
        try {
            const response = await fetch('js/locations.json');
            const locationsData = await response.json();
            const allCities = Object.entries(locationsData).flatMap(([county, cities]) =>
                cities.map(city => ({ name: city, county: county }))
            ).sort((a, b) => a.name.localeCompare(b.name));
            document.querySelectorAll('.app-footer').forEach(footer => {
                if (footer.innerHTML.trim() === '') {
                    footer.innerHTML = template.innerHTML;
                    setupFooterPagination(footer, allCities);
                }
            });
        } catch (error) {
            console.error("Failed to load location data for footers:", error);
            document.querySelectorAll('.app-footer').forEach(footer => {
                if (footer.innerHTML.trim() === '') {
                    footer.innerHTML = template.innerHTML;
                    const accordion = footer.querySelector('.footer-locations-accordion');
                    if (accordion) accordion.style.display = 'none';
                }
            });
        }
    }

    function setupFooterPagination(footer, allCities) {
        const gridContainer = footer.querySelector('.city-card-grid');
        const locationsHeader = footer.querySelector('.locations-header');
        const locationsContainer = footer.querySelector('.locations-list-container');
        if (!gridContainer || !locationsHeader || !locationsContainer) return;
        
        const itemsPerPage = 6, totalPages = Math.ceil(allCities.length / itemsPerPage);
        let currentPage = 1;

        const renderFooterPage = (page) => {
            const start = (page - 1) * itemsPerPage, end = start + itemsPerPage;
            gridContainer.innerHTML = allCities.slice(start, end).map((city, index) => {
                const imgIndex = ((start + index) % 15) + 1;
                const imgUrl = `../assets/images/lights/pic${String(imgIndex).padStart(2, '0')}.jpg`;
                return `<a href="#" data-target="location-modal" class="city-card" style="--bg-image: url('${imgUrl}')"><span>${city.name}</span></a>`;
            }).join('');
        };
        
        const controls = footer.querySelector('.pagination-controls'),
              prevBtn = controls.querySelector('[data-pagination-prev]'),
              nextBtn = controls.querySelector('[data-pagination-next]');

        const updateFooterControls = () => {
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
        };
        const handleButtonClick = (button) => {
            button.classList.add('bouncing');
            setTimeout(() => button.classList.remove('bouncing'), 800);
        };
        
        prevBtn.addEventListener('click', () => { 
            if (currentPage > 1) { handleButtonClick(prevBtn); currentPage--; renderFooterPage(currentPage); updateFooterControls(); }
        });
        nextBtn.addEventListener('click', () => { 
            if (currentPage < totalPages) { handleButtonClick(nextBtn); currentPage++; renderFooterPage(currentPage); updateFooterControls(); }
        });
        
        locationsHeader.addEventListener('click', () => {
            const isActive = locationsHeader.classList.toggle('active');
            locationsContainer.style.maxHeight = isActive ? `${locationsContainer.scrollHeight}px` : '0px';
            if (isActive) {
                const animDuration = 400, startTime = performance.now();
                function animateScroll(currentTime) {
                    const elapsed = currentTime - startTime;
                    if (elapsed < animDuration) {
                        window.scrollTo(0, document.body.scrollHeight);
                        requestAnimationFrame(animateScroll);
                    } else {
                        window.scrollTo(0, document.body.scrollHeight);
                    }
                }
                requestAnimationFrame(animateScroll);
            }
        });
        renderFooterPage(1);
        updateFooterControls();
    }
    
    // --- Vertical Timeline ---
    function VerticalTimeline(element) {
        this.element = element;
        this.blocks = this.element.getElementsByClassName("cd-timeline__block");
        this.images = this.element.getElementsByClassName("cd-timeline__img");
        this.contents = this.element.getElementsByClassName("cd-timeline__content");
        this.offset = 0.75;
        this.hideBlocks();
    }
    VerticalTimeline.prototype.hideBlocks = function() {
        if (!("classList" in document.documentElement)) return;
        for (let i = 0; i < this.blocks.length; i++) {
            if (this.blocks[i].getBoundingClientRect().top > window.innerHeight * this.offset) {
                this.images[i].classList.add("cd-timeline__img--hidden");
                this.contents[i].classList.add("cd-timeline__content--hidden");
            }
        }
    };
    VerticalTimeline.prototype.showBlocks = function() {
        if (!("classList" in document.documentElement)) return;
        for (let i = 0; i < this.blocks.length; i++) {
            if (this.contents[i].classList.contains("cd-timeline__content--hidden") && this.blocks[i].getBoundingClientRect().top <= window.innerHeight * this.offset) {
                this.images[i].classList.add("cd-timeline__img--bounce-in");
                this.contents[i].classList.add("cd-timeline__content--bounce-in");
                this.images[i].classList.remove("cd-timeline__img--hidden");
                this.contents[i].classList.remove("cd-timeline__content--hidden");
            }
        }
    };
    VerticalTimeline.prototype.reset = function() {
        for (let i = 0; i < this.blocks.length; i++) {
            this.images[i].classList.remove("cd-timeline__img--bounce-in");
            this.contents[i].classList.remove("cd-timeline__content--bounce-in");
            this.images[i].classList.add("cd-timeline__img--hidden");
            this.contents[i].classList.add("cd-timeline__content--hidden");
        }
    };
    let verticalTimelines = document.getElementsByClassName("js-cd-timeline"),
        verticalTimelinesArray = [],
        scrolling = false;
    if (verticalTimelines.length > 0) {
        for (let i = 0; i < verticalTimelines.length; i++) {
            verticalTimelinesArray.push(new VerticalTimeline(verticalTimelines[i]));
        }
        window.addEventListener("scroll", function(event) {
            if (!scrolling) {
                scrolling = true;
                (!window.requestAnimationFrame) ? setTimeout(checkTimelineScroll, 250) : window.requestAnimationFrame(checkTimelineScroll);
            }
        });
    }
    function checkTimelineScroll() {
        verticalTimelinesArray.forEach(timeline => timeline.showBlocks());
        scrolling = false;
    }

    // --- GALLERY PAGE SETUP ---
    function setupGalleryPage() {
        const galleryShowcase = document.getElementById('gallery-showcase');
        if (!galleryShowcase) return;
        
        galleryShowcase.innerHTML = ''; // Clear existing
        galleryData.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'gallery-card';
            card.dataset.index = index;
            
            // Stagger the animation
            card.style.animationDelay = `${index * 0.1}s`;
            
            card.innerHTML = `
                <img src="assets/images/lights/${item.image}" alt="${item.title}" class="gallery-card-image" loading="lazy">
                <h3 class="gallery-card-title">${item.title}</h3>
            `;
            galleryShowcase.appendChild(card);
        });
    }

    // --- GALLERY MODAL LOGIC ---
    const galleryModalOverlay = document.getElementById('gallery-modal-overlay');
    const galleryModalImage = document.getElementById('gallery-modal-image');
    const galleryModalText = document.getElementById('gallery-modal-text');
    const galleryShowcase = document.getElementById('gallery-showcase');

    function openGalleryModal(index) {
        const item = galleryData[index];
        if (!item) return;

        galleryModalImage.src = `assets/images/lights/${item.image}`;
        galleryModalImage.alt = item.title;
        galleryModalText.innerHTML = item.description;
        galleryModalOverlay.classList.add('active');
    }

    function closeGalleryModal() {
        galleryModalOverlay.classList.remove('active');
    }

    if (galleryShowcase) {
        galleryShowcase.addEventListener('click', (e) => {
            const card = e.target.closest('.gallery-card');
            if (card) {
                openGalleryModal(card.dataset.index);
            }
        });
    }
    
    if (galleryModalOverlay) {
        galleryModalOverlay.addEventListener('click', (e) => {
            if (e.target.id === 'gallery-modal-overlay' || e.target.closest('#gallery-modal-close-btn')) {
                closeGalleryModal();
            }
            if (e.target.classList.contains('gallery-cta')) {
                e.preventDefault();
                closeGalleryModal();
                showPage('page-contact');
            }
        });
    }


    // --- INITIALIZATION ---
    async function initializeApp() {
        await initializeFooters();
        setupGalleryPage();
        showPage('page-home');
        setTimeout(() => {
            checkTimelineScroll();
            const homePage = document.getElementById('page-home');
            if (homePage) {
                setupScrollAnimations(homePage);
                setupTestimonialCarousel(homePage);
            }
        }, 100);
    }

    initializeApp();
});
