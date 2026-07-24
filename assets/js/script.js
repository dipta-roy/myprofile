// ==========================================
// TIME-BASED THEME SCHEDULING
// ==========================================
function applyTimeBasedTheme() {
    const currentHour = new Date().getHours();
    // 6 AM (6) to 6 PM (18) is Light Mode
    if (currentHour >= 6 && currentHour < 18) {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

// Apply theme immediately on load
applyTimeBasedTheme();

// ==========================================
// NAVIGATION SCROLL EFFECTS
// ==========================================
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.getElementById('navMenu');

// Navbar scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// ==========================================
// MOBILE MENU TOGGLE
// ==========================================
mobileMenuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileMenuToggle.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        navMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
    }
});

// ==========================================
// SMOOTH SCROLL & ACTIVE LINK HIGHLIGHTING
// ==========================================
const scrollLinks = document.querySelectorAll('.nav-link, .footer-links a');
scrollLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });

            // Close mobile menu after clicking
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        }
    });
});

// Update active nav link on scroll
const sections = document.querySelectorAll('section[id]');

function updateActiveLink() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (correspondingLink) {
                correspondingLink.classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', updateActiveLink);

// ==========================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ==========================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all timeline items and cards
const animatedElements = document.querySelectorAll(
    '.timeline-item, .skill-category, .github-card, .download-card, .cert-card, .publication-item, .contact-card'
);

animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

// ==========================================
// SKILL PROGRESS BAR ANIMATION
// ==========================================
const skillBars = document.querySelectorAll('.skill-progress');
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const width = entry.target.style.width;
            entry.target.style.width = '0';
            setTimeout(() => {
                entry.target.style.width = width;
            }, 100);
            skillObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

skillBars.forEach(bar => {
    skillObserver.observe(bar);
});

// ==========================================
// PARALLAX EFFECT FOR ORBS
// ==========================================
const orbs = document.querySelectorAll('.gradient-orb');

window.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    orbs.forEach((orb, index) => {
        const speed = (index + 1) * 20;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;

        orb.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// ==========================================
// DYNAMIC STATISTICS COUNTER
// ==========================================
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + '+';
        }
    }, 16);
}

// Check if stats are visible and animate
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statValues = document.querySelectorAll('.stat-value');
            statValues.forEach(stat => {
                const text = stat.textContent;
                const number = parseInt(text);
                if (!isNaN(number)) {
                    animateCounter(stat, number, 1500);
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// ==========================================
// TYPING EFFECT FOR HERO SUBTITLE
// ==========================================
const heroSubtitle = document.querySelector('.hero-subtitle');
if (heroSubtitle) {
    const text = heroSubtitle.textContent;
    const titles = [
        'Product Security Specialist',
        'MedTech Security Expert',
        'AI Security Specialist'
    ];

    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentTitle = titles[titleIndex];

        if (isDeleting) {
            heroSubtitle.textContent = currentTitle.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            heroSubtitle.textContent = currentTitle.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentTitle.length) {
            isDeleting = true;
            typingSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            titleIndex = (titleIndex + 1) % titles.length;
            typingSpeed = 500; // Pause before new title
        }

        setTimeout(type, typingSpeed);
    }

    // Start typing effect after a short delay
    setTimeout(type, 1000);
}



// ==========================================
// EASTER EGG: KONAMI CODE
// ==========================================
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode.splice(-konamiSequence.length - 1, konamiCode.length - konamiSequence.length);

    if (konamiCode.join('').includes(konamiSequence.join(''))) {
        activateEasterEgg();
    }
});

function activateEasterEgg() {
    // Create celebration effect
    const colors = ['#6366f1', '#ec4899', '#3b82f6', '#8b5cf6', '#f59e0b'];

    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            createConfetti(colors[Math.floor(Math.random() * colors.length)]);
        }, i * 30);
    }

    // Show secret message
    const message = document.createElement('div');
    message.textContent = '🎉 You found the secret! Welcome, security enthusiast! 🛡️';
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #6366f1, #ec4899);
        color: white;
        padding: 2rem 3rem;
        border-radius: 1rem;
        font-size: 1.5rem;
        font-weight: 700;
        z-index: 9999;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: bounceIn 0.6s ease-out;
    `;

    document.body.appendChild(message);

    setTimeout(() => {
        message.style.animation = 'bounceOut 0.6s ease-out';
        setTimeout(() => message.remove(), 600);
    }, 3000);
}

function createConfetti(color) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${color};
        top: -10px;
        left: ${Math.random() * 100}%;
        opacity: 1;
        z-index: 9998;
        border-radius: 50%;
    `;

    document.body.appendChild(confetti);

    const fallDuration = 2000 + Math.random() * 2000;
    const startTime = Date.now();
    const startLeft = parseFloat(confetti.style.left);

    function animateConfetti() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / fallDuration;

        if (progress < 1) {
            confetti.style.top = (progress * (window.innerHeight + 20)) + 'px';
            confetti.style.left = (startLeft + Math.sin(progress * 4 * Math.PI) * 5) + '%';
            confetti.style.opacity = 1 - progress;
            confetti.style.transform = `rotate(${progress * 360 * 4}deg)`;
            requestAnimationFrame(animateConfetti);
        } else {
            confetti.remove();
        }
    }

    requestAnimationFrame(animateConfetti);
}

// ==========================================
// PAGE LOAD ANIMATION
// ==========================================
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.remove();
        }, 500);
    }
});



// ==========================================
// ACCESSIBILITY: KEYBOARD NAVIGATION
// ==========================================
document.addEventListener('keydown', (e) => {
    // Skip to main content with Enter key on logo
    if (e.key === 'Enter' && document.activeElement.classList.contains('nav-logo')) {
        document.querySelector('main').focus();
    }
});

// Add focus visible styles for keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
});

// ==========================================
// ==========================================
// DYNAMIC DATA LOADING
// ==========================================
function loadPortfolioData() {
    try {
        if (typeof portfolioData === 'undefined') {
            throw new Error('Portfolio data not found. Ensure portfolio.js is loaded.');
        }

        renderGithubProjects(portfolioData.github_projects);
        renderSoftwareDownloads(portfolioData.software_downloads);

        // Initialize interactive elements after rendering
        initDynamicInteractions();
    } catch (error) {
        console.error('Error loading portfolio data:', error);
    }
}

function renderGithubProjects(projects) {
    const container = document.getElementById('github-grid-container');
    if (!container) return;

    container.innerHTML = projects.map(project => `
        <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="github-card" data-category="${project.categories}">
            <div class="github-card-header">
                <i class="fab fa-github github-icon"></i>
                <span class="github-stars">⭐</span>
            </div>
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="github-footer">
                <span class="github-language">${project.language}</span>
                <span class="github-link">View on GitHub →</span>
            </div>
        </a>
    `).join('');
}

function renderSoftwareDownloads(downloads) {
    const container = document.getElementById('downloads-grid-container');
    if (!container) return;

    container.innerHTML = downloads.map(dl => {
        let checksumHtml = dl.checksum
            ? `<div class="checksum-value" title="Click to copy SHA-256 hash">SHA-256: <code>${dl.checksum}</code></div>`
            : '';

        let vtHtml = dl.vtLink
            ? `<a href="${dl.vtLink}" class="vt-link" target="_blank" rel="noopener noreferrer"><i class="fas fa-shield-alt"></i> VirusTotal</a>`
            : '';

        let actionsHtml = dl.vtLink
            ? `<div class="footer-actions">${vtHtml}<a href="${dl.downloadUrl}" class="download-link">Download Now →</a></div>`
            : `<span class="download-link">Download Now →</span>`; // Fallback for certs without VT link

        return `
        <div class="${!dl.checksum ? 'download-card' : 'download-card'}">
            <div class="download-card-header">
                <i class="${dl.icon} download-icon"></i>
                <span class="version-badge">${dl.version}</span>
            </div>
            <h3>${dl.title}</h3>
            <p>${dl.description}</p>
            ${checksumHtml}
            <div class="download-footer">
                <span class="file-type">${dl.fileType}</span>
                ${dl.vtLink ? actionsHtml : `<a href="${dl.downloadUrl}" class="download-link">Download Now →</a>`}
            </div>
        </div>
        `;
    }).join('');
}

// ==========================================
// INTERACTIVE LOGIC FOR DYNAMIC ELEMENTS
// ==========================================
function initDynamicInteractions() {
    // 1. GITHUB PROJECT FILTERING
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.github-card');
    const githubGrid = document.getElementById('github-grid-container');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active')) return; // Prevent re-filtering same category

            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            // Smooth fade out
            githubGrid.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            githubGrid.style.opacity = '0';
            githubGrid.style.transform = 'translateY(10px)';

            setTimeout(() => {
                projectCards.forEach(card => {
                    const categories = card.getAttribute('data-category') ? card.getAttribute('data-category').split(' ') : [];

                    if (filterValue === 'all' || categories.includes(filterValue)) {
                        card.classList.remove('hidden');
                        card.style.animation = 'none'; // reset individual animation
                    } else {
                        card.classList.add('hidden');
                    }
                });

                // Smooth fade back in
                githubGrid.style.opacity = '1';
                githubGrid.style.transform = 'translateY(0)';
            }, 300);
        });
    });

    // 2. CLICK TO COPY CHECKSUM
    const checksumElements = document.querySelectorAll('.checksum-value');
    checksumElements.forEach(element => {
        element.addEventListener('click', () => {
            const codeElement = element.querySelector('code');
            if (codeElement) {
                const hashText = codeElement.textContent.trim();
                navigator.clipboard.writeText(hashText).then(() => {
                    const originalHTML = element.innerHTML;
                    element.innerHTML = `<span style="color: var(--color-primary-light); font-weight: bold;"><i class="fas fa-check-circle"></i> Copied Hash!</span>`;
                    element.style.pointerEvents = 'none';

                    setTimeout(() => {
                        element.innerHTML = originalHTML;
                        element.style.pointerEvents = 'auto';
                    }, 1500);
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                });
            }
        });
    });
}

// ==========================================
// FLOATING COMPANION & SECTION TRACKING
// ==========================================
function initFloatingCompanion() {
    const profileCard = document.querySelector('.profile-card');
    const heroSection = document.getElementById('home');
    const sections = document.querySelectorAll('section');

    if (!profileCard || !heroSection) return;

    // 1. Detect scrolling past hero to toggle floating mode
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // When hero is out of view, activate floating companion
            if (!entry.isIntersecting && window.scrollY > 300) {
                profileCard.classList.add('floating-companion');
            } else {
                profileCard.classList.remove('floating-companion');
            }
        });
    }, { threshold: 0.1 });

    heroObserver.observe(heroSection);

    // 2. Detect section changes to trigger micro-animations and speech bubble
    let bubbleTimeout;
    const speechBubble = document.getElementById('companionSpeechBubble');

    const showBubbleMessage = (message) => {
        if (!speechBubble) return;
        speechBubble.innerHTML = message;
        speechBubble.classList.add('show-bubble');

        clearTimeout(bubbleTimeout);
        bubbleTimeout = setTimeout(() => {
            speechBubble.classList.remove('show-bubble');
        }, 4000); // Hide after 4 seconds
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && profileCard.classList.contains('floating-companion')) {
                const sectionId = entry.target.id;

                // Clear existing animation classes
                profileCard.classList.remove('companion-bounce', 'companion-spin');

                // Trigger reflow to restart animation
                void profileCard.offsetWidth;

                // Apply different animations based on section
                if (sectionId === 'github' || sectionId === 'downloads') {
                    profileCard.classList.add('companion-spin');
                } else if (sectionId) {
                    profileCard.classList.add('companion-bounce');
                }

                // Alternate left and right sides smoothly
                const leftSideSections = ['experience', 'github', 'certifications'];
                if (leftSideSections.includes(sectionId)) {
                    profileCard.classList.add('companion-left-side');
                } else {
                    profileCard.classList.remove('companion-left-side');
                }

                // Show dynamic speech bubble message based on section
                let message = "";
                switch (sectionId) {
                    case 'about':
                        message = "Hey! This is About Me";
                        break;
                    case 'experience':
                        message = "Check out my work history!";
                        break;
                    case 'skills':
                        message = "Here are my core skills";
                        break;
                    case 'github':
                        message = "Looking for my OpenSource work?";
                        break;
                    case 'downloads':
                        message = "Download my tools here";
                        break;
                    case 'certifications':
                        message = "My verified credentials";
                        break;
                    case 'contact':
                        message = "Let's get in touch!";
                        break;
                }

                if (message) {
                    showBubbleMessage(message);
                }
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(section => {
        if (section.id !== 'home') {
            sectionObserver.observe(section);
        }
    });

    // 3. Click companion to scroll back to top
    profileCard.addEventListener('click', () => {
        if (profileCard.classList.contains('floating-companion')) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

// ==========================================
// SCROLL-REACTIVE BACKGROUND ORBS
// ==========================================
function initScrollReactiveOrbs() {
    const orb1 = document.querySelector('.orb-1');
    const orb2 = document.querySelector('.orb-2');
    const orb3 = document.querySelector('.orb-3');

    if (!orb1 || !orb2 || !orb3) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = scrollY / maxScroll; // 0 to 1

                // Each orb moves in different directions and at different speeds
                // Using sin/cos to create organic, looping movement paths
                const angle1 = scrollPercent * Math.PI * 4; // 2 full cycles
                const angle2 = scrollPercent * Math.PI * 3;
                const angle3 = scrollPercent * Math.PI * 5;

                const x1 = Math.sin(angle1) * 150 + scrollPercent * 200;
                const y1 = Math.cos(angle1) * 80 - scrollY * 0.05;

                const x2 = Math.cos(angle2) * -200 + scrollPercent * -150;
                const y2 = Math.sin(angle2) * 120 - scrollY * 0.08;

                const x3 = Math.sin(angle3) * 180;
                const y3 = Math.cos(angle3) * -100 - scrollY * 0.03;

                orb1.style.transform = `translate(${x1}px, ${y1}px) scale(${1 + scrollPercent * 0.3})`;
                orb2.style.transform = `translate(${x2}px, ${y2}px) scale(${1 - scrollPercent * 0.2})`;
                orb3.style.transform = `translate(${x3}px, ${y3}px) scale(${1 + Math.sin(angle3) * 0.2})`;

                ticking = false;
            });
            ticking = true;
        }
    });
}

// Start loading process when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadPortfolioData();
    initFloatingCompanion();
    initScrollReactiveOrbs();
});
