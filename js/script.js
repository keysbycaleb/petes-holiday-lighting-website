document.addEventListener('DOMContentLoaded', () => {
    // --- App Elements ---
    const appContainer = document.querySelector('.app-container');

    // --- Page Navigation & History ---
    let pageHistory = ['page-home'];
    
    const showPage = (pageId, isBack = false) => {
        const currentPage = document.querySelector('.page.active');
        const nextPage = document.getElementById(pageId);

        // CTA Button Bounce Logic
        if (pageId === 'page-home') {
            const ctaButton = document.querySelector('#page-home .hero .btn-primary');
            if (ctaButton) {
                // Ensure animation can be re-triggered
                ctaButton.classList.remove('bouncing');
                // Use a timeout to allow the browser to process the class removal before adding it again
                setTimeout(() => {
                    ctaButton.classList.add('bouncing');
                }, 10);
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
        window.scrollTo(0, 0);
        updateBottomNavUI(pageId);

        // Setup animations for the new page
        setupScrollAnimations(nextPage);
        setupTestimonialCarousel(nextPage);

        // Animate service cards when the services page is shown
        if (pageId === 'page-services') {
            const serviceCards = nextPage.querySelectorAll('.service-page-card');
            // First, remove the animate class to reset them
            serviceCards.forEach(card => card.classList.remove('animate'));
            // Then, use a short timeout to re-add it, forcing the animation to replay
            setTimeout(() => {
                serviceCards.forEach(card => card.classList.add('animate'));
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
        if (navLink && !navLink.closest('.location-card')) {
            e.preventDefault();
            const targetId = navLink.dataset.target;
            
            if (navLink.closest('.service-page-card')) {
                const serviceKey = navLink.dataset.serviceKey;
                loadServiceDetailPage(serviceKey);
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
            const isActive = item.dataset.target === currentPageId;
            item.classList.toggle('active', isActive);
        });
    };

    // --- SCROLL-BASED UI CHANGES & ANIMATIONS ---
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Header hide/show logic
        document.body.classList.toggle('header-hidden', scrollTop > lastScrollTop && scrollTop > 50);
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;

        const homeHeader = document.querySelector('#page-home .app-header');
        if (homeHeader) {
            homeHeader.classList.toggle('scrolled', scrollTop > 50);
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
                    // Correct the path relative to the CSS file
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
    const serviceDetailPage = document.getElementById('page-service-detail-template');
    
    async function loadServiceDetailPage(serviceKey) {
        const titleEl = serviceDetailPage.querySelector('.header-title');
        const heroTitleEl = serviceDetailPage.querySelector('.service-detail-hero-title');
        const heroEl = serviceDetailPage.querySelector('.service-detail-hero');
        const contentWrapper = serviceDetailPage.querySelector('.service-detail-content-wrapper');
        const ctaContainer = serviceDetailPage.querySelector('.service-detail-cta-container');

        try {
            const servicesRes = await fetch('js/services.json');
            const services = await servicesRes.json();
            const serviceData = services[serviceKey];
            
            const contentRes = await fetch(serviceData.pageUrl);
            const htmlText = await contentRes.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');

            titleEl.textContent = serviceKey;
            
            const overviewH4 = doc.querySelector('[data-section="overview"] h4');
            heroTitleEl.textContent = overviewH4 ? overviewH4.textContent : serviceKey;
            if(overviewH4) overviewH4.remove();

            heroEl.style.backgroundImage = `url('${serviceData.imageUrl}')`;
            
            contentWrapper.innerHTML = '';
            ['overview', 'details', 'why-us', 'faq'].forEach(section => {
                 const sectionContent = doc.querySelector(`[data-section="${section}"]`);
                 if (sectionContent) {
                    sectionContent.style.display = section === 'overview' ? 'block' : 'none';
                    contentWrapper.appendChild(sectionContent);
                 }
            });

            const ctaContent = doc.querySelector('.cta-footer');
            if (ctaContent) {
                 ctaContainer.innerHTML = ctaContent.outerHTML;
            }

            setupServiceDetailTabs();
            setupFaqAccordion(contentWrapper);
            showPage('page-service-detail-template');

        } catch (error) {
            console.error(`Failed to load service detail for ${serviceKey}:`, error);
        }
    }

    function setupServiceDetailTabs() {
        const tabs = serviceDetailPage.querySelectorAll('.service-detail-tab');
        const highlighter = serviceDetailPage.querySelector('.tab-highlighter');
        const contentSections = serviceDetailPage.querySelectorAll('.service-detail-content-wrapper > div');

        function activateTab(tab) {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            highlighter.style.width = `${tab.offsetWidth}px`;
            highlighter.style.left = `${tab.offsetLeft}px`;

            const targetSection = tab.dataset.target;
            contentSections.forEach(section => {
                section.style.display = section.dataset.section === targetSection ? 'block' : 'none';
            });
        }
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => activateTab(tab));
        });
        
        const initialActiveTab = serviceDetailPage.querySelector('.service-detail-tab.active');
        if(initialActiveTab) {
           setTimeout(() => activateTab(initialActiveTab), 50);
        }
    }
    
    function setupFaqAccordion(container) {
        const items = container.querySelectorAll('.faq-item');
        items.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            if(question && answer){
                question.addEventListener('click', () => {
                    const isActive = item.classList.toggle('active');
                    answer.style.maxHeight = isActive ? `${answer.scrollHeight}px` : '0px';
                });
            }
        });
    }

    // --- LOCATIONS PAGE LOGIC ---
    const locationsPage = document.getElementById('page-locations');
    if (locationsPage) {
        const grid = document.getElementById('location-card-grid');
        const searchBar = document.getElementById('location-search-bar');
        const openFilterBtn = document.getElementById('open-filter-modal-btn');
        const modalOverlay = document.getElementById('filter-modal-overlay');
        const filterPanel = document.getElementById('filter-panel');
        const filterOptionsContainer = document.getElementById('filter-options-container');
        const applyFiltersBtn = document.getElementById('apply-filters-btn');
        const clearFiltersBtn = document.getElementById('clear-filters-btn');
        
        let allLocationsData = {};
        let allCities = [];

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
                const imgIndex = String((index % 15) + 1).padStart(2, '0');
                card.style.setProperty('--bg-image', `url('../assets/images/lights/pic${imgIndex}.jpg')`);
                card.innerHTML = `<span>${city}</span>`;
                grid.appendChild(card);
            });
        }
        
        function populateFilterModal() {
            filterOptionsContainer.innerHTML = '';
            const counties = Object.keys(allLocationsData);
            counties.forEach(countyKey => {
                const countyName = countyKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const label = document.createElement('label');
                label.className = 'filter-option-checkbox';
                label.innerHTML = `
                    <input type="checkbox" name="county" value="${countyKey}">
                    <span class="checkbox-custom"></span>
                    <span>${countyName}</span>
                `;
                 label.addEventListener('click', (e) => {
                    const checkbox = label.querySelector('input');
                    if (e.target !== checkbox) {
                       checkbox.checked = !checkbox.checked;
                    }
                    label.classList.toggle('checked', checkbox.checked);
                });
                filterOptionsContainer.appendChild(label);
            });
        }
        
        function applyFilters() {
            const searchTerm = searchBar.value.toLowerCase();
            const selectedCounties = Array.from(filterOptionsContainer.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);

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
            modalOverlay.classList.add('active');
            filterPanel.classList.add('active');
        });

        const closeFilterModal = () => {
            modalOverlay.classList.remove('active');
            filterPanel.classList.remove('active');
        };

        modalOverlay.addEventListener('click', closeFilterModal);
        applyFiltersBtn.addEventListener('click', () => {
            applyFilters();
            closeFilterModal();
        });
        clearFiltersBtn.addEventListener('click', () => {
            filterOptionsContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
                cb.parentElement.classList.remove('checked');
            });
            applyFilters();
            closeFilterModal();
        });

        fetchLocations();
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
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            }, {
                rootMargin: '0px 0px -25% 0px',
                threshold: 0
            });
    
            stepCards.forEach(card => {
                observer.observe(card);
            });
        }
    }
    
    // --- TESTIMONIAL CAROUSEL ---
    let testimonialInterval;

    function setupTestimonialCarousel(pageElement) {
        const track = pageElement.querySelector('.testimonial-carousel-track');
        if (!track) return;

        if (testimonialInterval) {
            clearInterval(testimonialInterval);
        }

        // Use a timeout to ensure the element is rendered and has dimensions
        setTimeout(() => {
            // Reset position before setup
            track.style.transition = 'none';
            track.style.transform = 'translateX(0px)';

            const slides = Array.from(track.children);
            const originalSlideCount = slides.find(s => !s.classList.contains('clone')) ? slides.filter(s => !s.classList.contains('clone')).length : slides.length;

            if (originalSlideCount <= 1) return;
            
            // Ensure clone doesn't already exist
            if (track.children.length === originalSlideCount) {
                const firstClone = slides[0].cloneNode(true);
                firstClone.classList.add('clone');
                track.appendChild(firstClone);
            }

            let currentIndex = 0;

            const advanceSlide = () => {
                const slideWidth = slides[0].getBoundingClientRect().width;
                // If width is 0, the element is likely not visible, so don't do anything.
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
            };

            testimonialInterval = setInterval(advanceSlide, 6000);
        }, 100); // 100ms delay
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
        
        const itemsPerPage = 6;
        let currentPage = 1;
        const totalPages = Math.ceil(allCities.length / itemsPerPage);

        const renderFooterPage = (page) => {
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageItems = allCities.slice(start, end);
            
            gridContainer.innerHTML = pageItems.map((city, index) => {
                const imgIndex = ((start + index) % 15) + 1;
                const imgUrl = `../assets/images/lights/pic${String(imgIndex).padStart(2, '0')}.jpg`;
                const card = document.createElement('a');
                card.href = '#';
                card.dataset.target = 'page-locations';
                card.className = 'city-card location-card';
                card.style.setProperty('--bg-image', `url('${imgUrl}')`);
                card.innerHTML = `<span>${city.name}</span>`;
                return card.outerHTML;
            }).join('');
        };
        
        const controlsContainer = footer.querySelector('.pagination-controls');
        const prevBtn = controlsContainer.querySelector('[data-pagination-prev]');
        const nextBtn = controlsContainer.querySelector('[data-pagination-next]');

        const updateFooterControls = () => {
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
        };

        const handleButtonClick = (button) => {
            button.classList.add('bouncing');
            setTimeout(() => {
                button.classList.remove('bouncing');
            }, 800); // Duration of the bounce animation
        };
        
        prevBtn.addEventListener('click', () => { 
            if (currentPage > 1) { 
                handleButtonClick(prevBtn);
                currentPage--; 
                renderFooterPage(currentPage); 
                updateFooterControls(); 
            }
        });
        nextBtn.addEventListener('click', () => { 
            if (currentPage < totalPages) { 
                handleButtonClick(nextBtn);
                currentPage++; 
                renderFooterPage(currentPage); 
                updateFooterControls(); 
            }
        });
        
        locationsHeader.addEventListener('click', () => {
            const isActive = locationsHeader.classList.toggle('active');
            locationsContainer.style.maxHeight = isActive ? `${locationsContainer.scrollHeight}px` : '0px';

            if (isActive) {
                const animationDuration = 400; // Match CSS transition
                const startTime = performance.now();

                function animateScroll(currentTime) {
                    const elapsedTime = currentTime - startTime;
                    if (elapsedTime < animationDuration) {
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
    
    // --- Vertical Timeline (Original) ---
    function VerticalTimeline( element ) {
		this.element = element;
		this.blocks = this.element.getElementsByClassName("cd-timeline__block");
		this.images = this.element.getElementsByClassName("cd-timeline__img");
		this.contents = this.element.getElementsByClassName("cd-timeline__content");
		this.offset = 0.75;
		this.hideBlocks();
	};

	VerticalTimeline.prototype.hideBlocks = function() {
		if ( !"classList" in document.documentElement ) { return; }
		var self = this;
		for( var i = 0; i < this.blocks.length; i++) {
			(function(i){
				if( self.blocks[i].getBoundingClientRect().top > window.innerHeight*self.offset ) {
					self.images[i].classList.add("cd-timeline__img--hidden"); 
					self.contents[i].classList.add("cd-timeline__content--hidden"); 
				}
			})(i);
		}
	};

	VerticalTimeline.prototype.showBlocks = function() {
		if ( ! "classList" in document.documentElement ) { return; }
		var self = this;
		for( var i = 0; i < this.blocks.length; i++) {
			(function(i){
				if( self.contents[i].classList.contains("cd-timeline__content--hidden") && self.blocks[i].getBoundingClientRect().top <= window.innerHeight*self.offset ) {
					self.images[i].classList.add("cd-timeline__img--bounce-in");
					self.contents[i].classList.add("cd-timeline__content--bounce-in");
					self.images[i].classList.remove("cd-timeline__img--hidden");
					self.contents[i].classList.remove("cd-timeline__content--hidden");
				}
			})(i);
		}
	};

	var verticalTimelines = document.getElementsByClassName("js-cd-timeline"),
		verticalTimelinesArray = [],
		scrolling = false;
	if( verticalTimelines.length > 0 ) {
		for( var i = 0; i < verticalTimelines.length; i++) {
			(function(i){
				verticalTimelinesArray.push(new VerticalTimeline(verticalTimelines[i]));
			})(i);
		}

		window.addEventListener("scroll", function(event) {
			if( !scrolling ) {
				scrolling = true;
				(!window.requestAnimationFrame) ? setTimeout(checkTimelineScroll, 250) : window.requestAnimationFrame(checkTimelineScroll);
			}
		});
	}

	function checkTimelineScroll() {
		verticalTimelinesArray.forEach(function(timeline){
			timeline.showBlocks();
		});
		scrolling = false;
	};


    // --- INITIALIZATION ---
    async function initializeApp() {
        await initializeFooters();
        
        showPage('page-home');

        // Force a check of animations on initial load
        setTimeout(() => {
            checkTimelineScroll();
            const homePage = document.getElementById('page-home');
            if (homePage) {
                // Re-initialize animations for the home page specifically on load
                setupScrollAnimations(homePage);
                setupTestimonialCarousel(homePage);
            }
        }, 100);
    }

    initializeApp();
});
