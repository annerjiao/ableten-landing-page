document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded'); // Verify script is running
    
    const carousel = document.querySelector('.carousel');
    const dots = document.querySelectorAll('.dot');
    const testimonials = document.querySelectorAll('.testimonial');
    let currentIndex = 0;
    let autoPlayInterval;

    console.log('Carousel element:', carousel); // Check if carousel is found
    console.log('Dots elements:', dots); // Check if dots are found

    // Function to show a specific testimonial
    function showTestimonial(index) {
        // Hide all testimonials
        testimonials.forEach((testimonial, i) => {
            testimonial.style.display = i === index ? 'block' : 'none';
        });

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        currentIndex = index;
    }

    // Add click handlers to dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showTestimonial(index);
        });
    });

    // Show first testimonial initially
    showTestimonial(0);

    // Auto-play functionality
    function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % testimonials.length;
            showTestimonial(nextIndex);
        }, 5000);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }
    }

    // Intersection Observer for scroll-based progression
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.7
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startAutoPlay();
            } else {
                stopAutoPlay();
            }
        });
    }, options);

    // Observe the testimonials section
    const testimonialSection = document.querySelector('.testimonials');
    observer.observe(testimonialSection);

    // Start auto-play initially if testimonials section is in view
    if (testimonialSection.getBoundingClientRect().top < window.innerHeight) {
        startAutoPlay();
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            stopAutoPlay();
            showTestimonial(currentIndex - 1);
            startAutoPlay();
        } else if (e.key === 'ArrowRight' && currentIndex < testimonials.length - 1) {
            stopAutoPlay();
            showTestimonial(currentIndex + 1);
            startAutoPlay();
        }
    });

    // Touch/swipe support
    let touchStartX = 0;
    carousel.addEventListener('touchstart', (e) => {
        stopAutoPlay();
        touchStartX = e.touches[0].clientX;
    });

    carousel.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > 50) { // 50px threshold
            if (diff > 0 && currentIndex < testimonials.length - 1) {
                // Swipe left
                showTestimonial(currentIndex + 1);
            } else if (diff < 0 && currentIndex > 0) {
                // Swipe right
                showTestimonial(currentIndex - 1);
            }
        }
        startAutoPlay();
    });

    // Pause auto-play when user interacts with carousel
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);
}); 