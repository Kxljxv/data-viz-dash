/**
 * AEA Carousel Component
 * A responsive, accessible, and high-performance carousel with Cyberpunk-Lite aesthetics.
 */
export default class Carousel {
    constructor(element, options = {}) {
        if (!element) return;

        this.element = element;
        this.viewport = element.querySelector('.aea-carousel-viewport');
        this.track = element.querySelector('.aea-carousel-track');
        this.slides = Array.from(element.querySelectorAll('.aea-carousel-slide'));
        this.prevBtn = element.querySelector('.aea-carousel-prev');
        this.nextBtn = element.querySelector('.aea-carousel-next');
        this.dotsContainer = element.querySelector('.aea-carousel-indicators');
        this.dots = Array.from(element.querySelectorAll('.aea-carousel-dot'));

        // Default options
        this.options = {
            autoplay: options.autoplay || false,
            autoplaySpeed: options.autoplaySpeed || 5000,
            centerMode: options.centerMode || false,
            slidesToShow: options.slidesToShow || 1,
            gap: options.gap || 0,
            infinite: options.infinite !== undefined ? options.infinite : true,
            ...options
        };

        this.currentIndex = 0;
        this.isTransitioning = false;
        this.autoplayTimer = null;
        this.touchStartX = 0;
        this.touchEndX = 0;

        this.init();
    }

    init() {
        this.setupSlides();
        this.addEventListeners();
        this.update();

        if (this.options.autoplay) {
            this.startAutoplay();
        }
    }

    setupSlides() {
        // Set slide widths based on slidesToShow
        const slideWidth = 100 / this.options.slidesToShow;
        this.slides.forEach(slide => {
            slide.style.flex = `0 0 ${slideWidth}%`;
            slide.style.width = `${slideWidth}%`;
        });
    }

    addEventListeners() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.stopAutoplay();
                this.prev();
                if (this.options.autoplay) this.startAutoplay();
            });
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.stopAutoplay();
                this.next();
                if (this.options.autoplay) this.startAutoplay();
            });
        }

        if (this.dots.length > 0) {
            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    this.stopAutoplay();
                    this.goTo(index);
                    if (this.options.autoplay) this.startAutoplay();
                });
            });
        }

        // Touch events for swipe
        this.viewport.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.viewport.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

        // Keyboard navigation
        this.element.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prev();
            } else if (e.key === 'ArrowRight') {
                this.next();
            }
        });

        // Window resize
        window.addEventListener('resize', () => this.update());
    }

    update() {
        const slideWidth = this.slides[0].offsetWidth;
        let offset = -(this.currentIndex * slideWidth);

        if (this.options.centerMode) {
            const viewportWidth = this.viewport.offsetWidth;
            offset = -(this.currentIndex * slideWidth) + (viewportWidth / 2) - (slideWidth / 2);
        }

        this.track.style.transform = `translateX(${offset}px)`;

        // Update active classes
        this.slides.forEach((slide, index) => {
            if (index === this.currentIndex) {
                slide.classList.add('aea-active');
                slide.setAttribute('aria-hidden', 'false');
            } else {
                slide.classList.remove('aea-active');
                slide.setAttribute('aria-hidden', 'true');
            }
        });

        // Update dots
        if (this.dots.length > 0) {
            this.dots.forEach((dot, index) => {
                if (index === this.currentIndex) {
                    dot.classList.add('aea-active');
                    dot.setAttribute('aria-current', 'true');
                } else {
                    dot.classList.remove('aea-active');
                    dot.removeAttribute('aria-current');
                }
            });
        }
    }

    goTo(index) {
        if (this.isTransitioning) return;

        const slideCount = this.slides.length;
        
        if (this.options.infinite) {
            if (index < 0) {
                this.currentIndex = slideCount - 1;
            } else if (index >= slideCount) {
                this.currentIndex = 0;
            } else {
                this.currentIndex = index;
            }
        } else {
            this.currentIndex = Math.max(0, Math.min(index, slideCount - 1));
        }

        this.isTransitioning = true;
        this.update();

        // Reset transition flag after animation
        setTimeout(() => {
            this.isTransitioning = false;
        }, 500); // Matches CSS transition time
    }

    next() {
        this.goTo(this.currentIndex + 1);
    }

    prev() {
        this.goTo(this.currentIndex - 1);
    }

    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
    }

    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
    }

    handleSwipe() {
        const swipeThreshold = 50;
        if (this.touchEndX < this.touchStartX - swipeThreshold) {
            this.next();
        } else if (this.touchEndX > this.touchStartX + swipeThreshold) {
            this.prev();
        }
    }

    startAutoplay() {
        this.stopAutoplay();
        this.autoplayTimer = setInterval(() => this.next(), this.options.autoplaySpeed);
    }

    stopAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }
}
