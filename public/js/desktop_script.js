// This function will be called by the Google Maps script once it's loaded
// We make a single global callback and check which input exists on the current page.
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

    // --- State & Data ---
    let pageHistory = ['page-home'];
    let allLocationsData = {};
    let allCities = [];
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
    const locationMessages = [
        "Great news! We light up homes in <b>{city}</b>! Let's get you decked out for the holidays.",
        "Yes, we serve <b>{city}</b>! Ready to make your home the brightest on the block?",
        "You're in luck! Our team is ready to bring holiday cheer to <b>{city}</b>.",
        "Holiday lighting in <b>{city}</b>? Absolutely! Let’s plan your amazing display.",
        "We're excited to serve <b>{city}</b>! Click here to start your holiday transformation."
    ];

    // --- Page Navigation ---
    const showPage = (pageId, addToHistory = true) => {
        document.querySelectorAll('.page.active').forEach(p => p.classList.remove('active'));
        document.getElementById(pageId)?.classList.add('active');

        if (addToHistory && pageId !== pageHistory[pageHistory.length - 1]) {
            pageHistory.push(pageId);
        }

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.target === pageId);
        });
        window.scrollTo(0, 0);
    };
    
    const initNavigation = () => {
        document.body.addEventListener('click', e => {
            const navLink = e.target.closest('[data-target]');
            if (navLink) {
                e.preventDefault();
                const targetId = navLink.dataset.target;
                if (targetId.startsWith('page-')) {
                    showPage(targetId);
                }
            }
        });
    };

    // --- Services Logic ---
    const loadServices = async () => {
        try {
            const response = await fetch('js/services.json');
            const services = await response.json();
            const grid = document.querySelector('.services-grid');
            grid.innerHTML = '';
            for (const [key, service] of Object.entries(services)) {
                const card = document.createElement('a');
                card.href = '#';
                card.className = 'service-card';
                card.dataset.serviceKey = key;
                card.style.setProperty('--bg-image', `url('../${service.imageUrl}')`);
                card.innerHTML = `<h3 class="service-card-title">${key}</h3>`;
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadServiceDetail(key);
                });
                grid.appendChild(card);
            }
        } catch (error) {
            console.error("Failed to load services:", error);
        }
    };
    
    const loadServiceDetail = async (serviceKey) => {
        try {
            const servicesRes = await fetch('js/services.json');
            const services = await servicesRes.json();
            const serviceData = services[serviceKey];

            const contentRes = await fetch(serviceData.pageUrl);
            const htmlText = await contentRes.text();
            
            const servicePage = document.getElementById('page-service-detail');
            servicePage.querySelector('.service-detail-header').style.setProperty('--bg-image', `url('../${serviceData.imageUrl}')`);
            servicePage.querySelector('#service-detail-title').textContent = serviceKey;

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlText;
            
            const navContainer = servicePage.querySelector('.service-detail-nav');
            const contentContainer = servicePage.querySelector('#service-detail-content');
            navContainer.innerHTML = '';
            contentContainer.innerHTML = '';

            const sections = ['overview', 'details', 'why-us', 'faq'];
            sections.forEach((sectionName, index) => {
                const sectionContent = tempDiv.querySelector(`[data-section="${sectionName}"]`);
                if (sectionContent) {
                    const titleText = sectionName.charAt(0).toUpperCase() + sectionName.slice(1).replace('-us', ' Us');
                    
                    const navItem = document.createElement('a');
                    navItem.textContent = titleText;
                    navItem.className = 'service-detail-nav-item';
                    navItem.dataset.target = sectionName;
                    if (index === 0) navItem.classList.add('active');
                    navContainer.appendChild(navItem);

                    const contentSection = document.createElement('div');
                    contentSection.id = sectionName;
                    contentSection.className = 'content-section';
                    if (index === 0) contentSection.classList.add('active');
                    const sectionTitle = document.createElement('h2');
                    sectionTitle.className = 'section-title';
                    sectionTitle.textContent = titleText;
                    contentSection.appendChild(sectionTitle);
                    contentSection.innerHTML += sectionContent.innerHTML;
                    contentContainer.appendChild(contentSection);
                }
            });

            showPage('page-service-detail');
            setupServiceDetailInteractions(servicePage);

        } catch (error) {
            console.error("Failed to load service detail:", error);
        }
    };
    
    const setupServiceDetailInteractions = (servicePage) => {
        servicePage.querySelector('.back-to-services-btn').onclick = () => showPage('page-services');
        
        servicePage.querySelectorAll('.service-detail-nav-item').forEach(navItem => {
            navItem.addEventListener('click', e => {
                e.preventDefault();
                const targetId = navItem.dataset.target;
                
                servicePage.querySelectorAll('.service-detail-nav-item').forEach(i => i.classList.remove('active'));
                navItem.classList.add('active');
                
                servicePage.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
                servicePage.querySelector(`#${targetId}`).classList.add('active');
            });
        });

        servicePage.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const item = question.closest('.faq-item');
                const answer = item.querySelector('.faq-answer');
                item.classList.toggle('active');
                answer.style.maxHeight = item.classList.contains('active') ? `${answer.scrollHeight}px` : '0px';
            });
        });
    };

    // --- Gallery Logic ---
    const loadGallery = () => {
        const grid = document.querySelector('.gallery-grid');
        grid.innerHTML = '';
        galleryData.forEach((item, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.dataset.index = index;
            galleryItem.innerHTML = `
                <img src="assets/images/lights/${item.image}" alt="${item.title}" loading="lazy">
                <div class="gallery-item-overlay">
                    <h3 class="gallery-item-title">${item.title}</h3>
                </div>
            `;
            grid.appendChild(galleryItem);
        });
    };
    
    const initGalleryModal = () => {
        const overlay = document.getElementById('gallery-modal-overlay');
        const imageEl = document.getElementById('gallery-modal-image');
        const textEl = document.getElementById('gallery-modal-text');

        document.querySelector('.gallery-grid').addEventListener('click', e => {
            const item = e.target.closest('.gallery-item');
            if (item) {
                const data = galleryData[item.dataset.index];
                imageEl.src = `assets/images/lights/${data.image}`;
                imageEl.alt = data.title;
                textEl.innerHTML = data.description;
                overlay.classList.add('active');
            }
        });

        overlay.addEventListener('click', e => {
            if (e.target === overlay || e.target.closest('.modal-close-btn')) {
                overlay.classList.remove('active');
            }
            if (e.target.classList.contains('gallery-cta')) {
                e.preventDefault();
                overlay.classList.remove('active');
                showPage('page-contact');
            }
        });
    };

    // --- Locations Logic ---
    const loadLocations = async () => {
        try {
            const response = await fetch('js/locations.json');
            allLocationsData = await response.json();
            allCities = Object.entries(allLocationsData).flatMap(([county, cities]) => 
                cities.map(city => ({ name: city, county: county }))
            ).sort((a, b) => a.name.localeCompare(b.name));
            
            populateLocationFilters();
            renderLocationGrid(allCities, document.getElementById('locations-grid-container'));
            setupLocationInteractions();
            initLocationsModal();
            initLocationConfirmModal();
        } catch (error) {
            console.error("Failed to load locations:", error);
        }
    };
    
    const populateLocationFilters = () => {
        const container = document.getElementById('county-filter-group');
        container.innerHTML = '';
        const allCountiesBtn = document.createElement('button');
        allCountiesBtn.className = 'filter-option active';
        allCountiesBtn.textContent = 'All Counties';
        allCountiesBtn.dataset.county = 'all';
        container.appendChild(allCountiesBtn);

        Object.keys(allLocationsData).forEach(countyKey => {
            const btn = document.createElement('button');
            btn.className = 'filter-option';
            btn.textContent = countyKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            btn.dataset.county = countyKey;
            container.appendChild(btn);
        });
    };

    const renderLocationGrid = (cities, container) => {
        if (!container) return;
        container.innerHTML = '';
        cities.forEach((city, index) => {
            const card = document.createElement('div');
            card.className = 'location-card';
            card.dataset.city = city.name;

            const imgIndex = String((index % 15) + 1).padStart(2, '0');
            card.style.setProperty('--bg-image', `url('../assets/images/lights/pic${imgIndex}.jpg')`);
            card.innerHTML = `<span>${city.name}</span>`;
            container.appendChild(card);
        });
    };
    
    const setupLocationInteractions = () => {
        document.getElementById('location-search-bar').addEventListener('input', applyLocationFilters);
        document.getElementById('county-filter-group').addEventListener('click', e => {
            if (e.target.matches('.filter-option')) {
                document.querySelectorAll('#county-filter-group .filter-option').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                applyLocationFilters();
            }
        });
    };

    const applyLocationFilters = () => {
        const searchTerm = document.getElementById('location-search-bar').value.toLowerCase();
        const activeCounty = document.querySelector('#county-filter-group .filter-option.active').dataset.county;

        let filteredCities = allCities;

        if (activeCounty !== 'all') {
            filteredCities = filteredCities.filter(city => city.county === activeCounty);
        }
        if (searchTerm) {
            filteredCities = filteredCities.filter(city => city.name.toLowerCase().includes(searchTerm));
        }

        renderLocationGrid(filteredCities, document.getElementById('locations-grid-container'));
    };

    const initLocationConfirmModal = () => {
        const overlay = document.getElementById('location-confirm-modal-overlay');
        const messageEl = document.getElementById('location-modal-message');

        const handleClick = (e) => {
            const card = e.target.closest('.location-card');
            if (card) {
                e.preventDefault();
                const cityName = card.dataset.city;
                const randomIndex = Math.floor(Math.random() * locationMessages.length);
                messageEl.innerHTML = locationMessages[randomIndex].replace('{city}', cityName);
                overlay.classList.add('active');
            }
        };
        
        document.body.addEventListener('click', handleClick);

        overlay.addEventListener('click', e => {
            if (e.target === overlay || e.target.closest('.modal-close-btn')) {
                overlay.classList.remove('active');
            }
            if (e.target.closest('#location-modal-cta')) {
                overlay.classList.remove('active');
                
                // Also close the main locations modal if it's open
                const locationsModal = document.getElementById('locations-modal-overlay');
                if (locationsModal.classList.contains('active')) {
                    locationsModal.classList.remove('active');
                }
            }
        });
    };
    
    const initLocationsModal = () => {
        const overlay = document.getElementById('locations-modal-overlay');
        const openBtn = document.getElementById('open-locations-modal-btn');
        const closeBtn = document.getElementById('locations-modal-close-btn');
        const searchBar = document.getElementById('locations-modal-search-bar');
        const grid = document.getElementById('locations-modal-grid');
        
        const applyModalFilters = () => {
            const searchTerm = searchBar.value.toLowerCase();
            let filteredCities = allCities;

            if (searchTerm) {
                filteredCities = filteredCities.filter(city => city.name.toLowerCase().includes(searchTerm));
            }
            renderLocationGrid(filteredCities, grid);
        };

        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            applyModalFilters();
            overlay.classList.add('active');
        });
        
        const closeModal = () => overlay.classList.remove('active');
        
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', e => {
            if (e.target === overlay) closeModal();
        });

        searchBar.addEventListener('input', applyModalFilters);
    };

    // --- Contact Form Logic ---
    const phoneInputDesktop = document.getElementById('phone-desktop');
    const phoneAlertModalOverlay = document.getElementById('phone-alert-modal-overlay-desktop');
    const phoneAlertModalPanel = document.getElementById('phone-alert-modal-panel-desktop');
    const phoneAlertCloseBtn = document.getElementById('phone-alert-close-btn-desktop');
    const phoneAlertOkayBtn = document.getElementById('phone-alert-okay-btn-desktop');

    const initContactForm = () => {
        const form = document.getElementById('contact-form');
        const successModal = document.getElementById('form-success-modal-overlay');
        
        const addressAlertModalOverlay = document.getElementById('address-alert-modal-overlay-desktop');
        const addressInfoModalOverlay = document.getElementById('address-info-modal-overlay-desktop');

        const openAddressInfoModal = () => {
            addressAlertModalOverlay.classList.remove('active');
            addressInfoModalOverlay.classList.add('active');
        };
    
        const closeAddressAlertModal = () => {
            addressAlertModalOverlay.classList.remove('active');
        };
        
        const closeAddressInfoModal = () => {
            addressInfoModalOverlay.classList.remove('active');
        };
    
        document.getElementById('why-address-btn-desktop').addEventListener('click', openAddressInfoModal);
        document.getElementById('address-alert-why-btn-desktop').addEventListener('click', openAddressInfoModal);
    
        addressAlertModalOverlay.addEventListener('click', (e) => {
            if (e.target === addressAlertModalOverlay || e.target.closest('#address-alert-close-btn-desktop')) {
                closeAddressAlertModal();
            }
        });
    
        addressInfoModalOverlay.addEventListener('click', (e) => {
            if (e.target === addressInfoModalOverlay || e.target.closest('#address-info-close-btn-desktop')) {
                closeAddressInfoModal();
            }
        });
        
        const closePhoneAlertModal = () => {
            phoneAlertModalOverlay.classList.remove('active');
            phoneAlertModalPanel.classList.remove('active');
        };
        
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
            { title: "Success!", message: "Clark Griswold just called you an inspiration." }
        ];

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const addressValue = document.getElementById('address-storage-desktop').value;
                if (!addressValue || addressValue.trim() === '') {
                    addressAlertModalOverlay.classList.add('active');
                    return;
                }
                
                // --- PHONE VALIDATION ---
                const phoneValue = phoneInputDesktop.value.replace(/\D/g, '');
                if (phoneValue.length !== 10) {
                    phoneAlertModalOverlay.classList.add('active');
                    phoneAlertModalPanel.classList.add('active');
                    return;
                }

                try {
                    const formData = new FormData(form);
                    const submissionData = {};
                    for (const [key, value] of formData.entries()) {
                         if (!key.includes('full-address')) {
                            submissionData[key] = value;
                        }
                    }
                    
                    submissionData.formId = "petes-holiday-lighting"; 

                    await saveSubmission(submissionData);

                    const { title, message } = successMessages[Math.floor(Math.random() * successMessages.length)];
                    document.getElementById('form-success-title').textContent = title;
                    document.getElementById('form-success-message').textContent = message;
                    
                    successModal.classList.add('active');
                    form.reset();

                } catch (error) {
                    console.error("Error submitting form to Firebase:", error);
                    alert("There was an error submitting your request. Please try again.");
                }
            });
        }

        successModal.addEventListener('click', e => {
             if (e.target === successModal || e.target.closest('.modal-close-btn, #form-success-return-btn')) {
                successModal.classList.remove('active');
                if(e.target.id === 'form-success-return-btn') showPage('page-home');
            }
        });
    };
    
    // --- PHONE INPUT MASKING ---
    if (phoneInputDesktop) {
        phoneInputDesktop.addEventListener('input', (e) => {
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

    // --- App Initialization ---
    const initApp = () => {
        initNavigation();
        loadServices();
        loadGallery();
        initGalleryModal();
        loadLocations();
        initContactForm();
    };

    initApp();
});
