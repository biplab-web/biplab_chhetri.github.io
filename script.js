const divider = document.getElementById('divider');
const hero = document.getElementById('hero');
const scrollProgress = document.getElementById('scroll-progress');
const backToTop = document.getElementById('back-to-top');
const welcomeModal = document.getElementById('welcome-modal');
const welcomeClose = document.getElementById('welcome-close');

let isDragging = false;

// Welcome modal - show only once per session
// Clear for testing: sessionStorage.removeItem('welcomeShown');
if(!sessionStorage.getItem('welcomeShown')){
    welcomeModal.classList.add('show');
    sessionStorage.setItem('welcomeShown', 'true');
}

welcomeClose.addEventListener('click', () => {
    welcomeModal.classList.remove('show');
});

welcomeModal.addEventListener('click', (e) => {
    if(e.target === welcomeModal){
        welcomeModal.classList.remove('show');
    }
});

// Divider drag functionality
divider.addEventListener('mousedown', (e) => {
    isDragging = true;
    divider.classList.add('dragging');
    e.preventDefault();
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    divider.classList.remove('dragging');
});

window.addEventListener('mousemove', (e) => {
    if(!isDragging) return;
    const newHeight = e.clientY;
    if(newHeight > 100 && newHeight < window.innerHeight - 100){
        hero.style.height = newHeight + 'px';
    }
});

// Smooth section animations on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if(entry.isIntersecting){
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            
            const items = entry.target.querySelectorAll('li, .project');
            items.forEach((item, i) => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                item.style.transition = 'all 0.6s ease-out';
                item.style.transitionDelay = (i * 0.1) + 's';
                
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 50);
            });
            
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    if(section !== hero){
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.6s ease-out';
        observer.observe(section);
    }
});

// Scroll progress bar
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = scrolled + '%';
    
    // Show/hide back-to-top button
    if(scrollTop > 300){
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
});

// Back to top functionality
backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Active nav link on scroll
const navLinks = document.querySelectorAll('nav a');
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if(scrollY >= sectionTop - 200){
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if(link.getAttribute('href').slice(1) === current){
            link.classList.add('active');
        }
    });
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e){
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if(target){
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Lightbox (image modal) functionality
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-img');
const lbCaption = document.getElementById('lightbox-caption');
const lbClose = document.getElementById('lightbox-close');
const lbOverlay = document.getElementById('lightbox-overlay');
const lbReturn = document.getElementById('lightbox-return');
const lbPrev = document.getElementById('lightbox-prev');
const lbNext = document.getElementById('lightbox-next');

// gather project images in an array
const projectImages = Array.from(document.querySelectorAll('.project-img'));
let currentIndex = -1;

function openLightboxFromIndex(index){
    const img = projectImages[index];
    if(!img || !lightbox) return;
    currentIndex = index;
    lbImg.src = img.src;
    lbImg.alt = img.alt || '';
    lbCaption.textContent = img.alt || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // trigger zoom (CSS handles via .open)
    setTimeout(() => lbImg.classList.add('visible'), 10);
}

function openLightboxFromImg(img){
    const index = projectImages.indexOf(img);
    if(index === -1) return openLightboxFromIndex(0);
    openLightboxFromIndex(index);
}

function closeLightbox(){
    if(!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lbImg.classList.remove('visible');
    // small delay to allow transition
    setTimeout(() => {
        lbImg.src = '';
        lbCaption.textContent = '';
    }, 200);
    document.body.style.overflow = '';
    currentIndex = -1;
}

function showNext(){
    if(currentIndex === -1) return;
    const next = (currentIndex + 1) % projectImages.length;
    openLightboxFromIndex(next);
}

function showPrev(){
    if(currentIndex === -1) return;
    const prev = (currentIndex - 1 + projectImages.length) % projectImages.length;
    openLightboxFromIndex(prev);
}

projectImages.forEach((img, idx) => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => openLightboxFromIndex(idx));
});

if(lbClose) lbClose.addEventListener('click', closeLightbox);
if(lbReturn) lbReturn.addEventListener('click', closeLightbox);
if(lbOverlay) lbOverlay.addEventListener('click', closeLightbox);
if(lbNext) lbNext.addEventListener('click', showNext);
if(lbPrev) lbPrev.addEventListener('click', showPrev);

document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') closeLightbox();
    if(e.key === 'ArrowRight') showNext();
    if(e.key === 'ArrowLeft') showPrev();
});

// Parallax hero + clouds: smooth update using requestAnimationFrame
(() => {
    const clouds = Array.from(document.querySelectorAll('.cloud'));
    let lastScroll = window.scrollY;
    let ticking = false;

    function updateParallax(scrollY){
        // Tunable params
        const heroFactor = 0.18; // how quickly hero moves relative to scroll
        const leftFactor = 0.45; // hero-left vertical factor
        const rightFactor = 0.25; // hero-right vertical factor

        const heroHeight = hero ? hero.offsetHeight : window.innerHeight;
        const maxHeroShift = Math.max( Math.min(heroHeight * 0.6, 300), 120 ); // relative max, clamp

        const heroShift = Math.min(scrollY * heroFactor, maxHeroShift);
        if(hero) hero.style.transform = `translateY(-${heroShift}px)`;

        // hero child parallax (smaller, independent)
        const hLeft = document.querySelector('.hero-left');
        const hRight = document.querySelector('.hero-right');
        if(hLeft) hLeft.style.transform = `translateY(-${Math.min(heroShift * leftFactor, maxHeroShift * leftFactor)}px)`;
        if(hRight) hRight.style.transform = `translateY(-${Math.min(heroShift * rightFactor, maxHeroShift * rightFactor)}px)`;

        // adjust fade overlay opacity and blur
        const heroFade = document.querySelector('.hero-fade');
        if(heroFade){
            const opacity = Math.min(heroShift / maxHeroShift, 1) * 0.9; // up to 0.9
            const blurPx = Math.min(heroShift * 0.04, 8); // up to ~8px
            heroFade.style.opacity = opacity;
            heroFade.style.backdropFilter = `blur(${blurPx}px)`;
        }

        // Clouds move horizontally and slightly vertically at different speeds
        clouds.forEach((c, i) => {
            const speeds = [0.12, -0.08, 0.10, -0.06];
            const v = speeds[i % speeds.length] || 0.08;
            const x = Math.round(scrollY * v);
            const y = Math.round(scrollY * 0.02 * (i % 2 === 0 ? 1 : -1));
            c.style.transform = `translate(${x}px, ${y}px)`;
        });

        // Small parallax for other sections: shift up slightly as user scrolls
        const otherSections = Array.from(document.querySelectorAll('section')).filter(s => s.id !== 'hero');
        otherSections.forEach(sec => {
            const rect = sec.getBoundingClientRect();
            // progress: 0 when section bottom at top of viewport, 1 when section top at bottom
            const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
            const maxShiftSection = 30; // px max shift for sections
            const shift = -Math.round(progress * maxShiftSection);
            sec.style.transform = `translateY(${shift}px)`;
        });
    }

    window.addEventListener('scroll', () => {
        lastScroll = window.scrollY;
        if(!ticking){
            window.requestAnimationFrame(() => {
                updateParallax(lastScroll);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
    
    // initialize positions
    updateParallax(window.scrollY);
})();