'use strict';

// ============================================
// GenZ Cap Store - Main JavaScript
// High-performance interactions for mobile-first design
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initNavigation();
    initCountdown();
    initFormValidation();
    initScrollAnimations();
    initSmoothScroll();
});

// ============================================
// Navigation Module
// ============================================
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;
    let ticking = false;

    // Navbar scroll behavior
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleNavbarScroll(navbar, lastScrollY);
                lastScrollY = window.scrollY;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

function handleNavbarScroll(navbar, lastScrollY) {
    const currentScrollY = window.scrollY;
    
    // Add shadow on scroll
    if (currentScrollY > 10) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
    } else {
        navbar.style.boxShadow = 'none';
    }
}

// ============================================
// Smooth Scroll Module
// ============================================
function initSmoothScroll() {
    // Handle all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Global smooth scroll function for buttons
function scrollToForm() {
    const waitlistSection = document.getElementById('waitlist');
    if (waitlistSection) {
        waitlistSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Focus on the first input after scroll
        setTimeout(() => {
            const firstInput = document.getElementById('fullName');
            if (firstInput) firstInput.focus();
        }, 500);
    }
}

// ============================================
// Countdown Timer Module
// ============================================
function initCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;

    // Set target date (12 days, 8 hours, 42 minutes from now)
    const now = new Date();
    const targetDate = new Date(now.getTime() + (12 * 24 * 60 * 60 * 1000) + (8 * 60 * 60 * 1000) + (42 * 60 * 1000));

    function updateCountdown() {
        const currentTime = new Date();
        const difference = targetDate - currentTime;

        if (difference <= 0) {
            // Reset to new drop cycle
            resetCountdown();
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        updateCountdownDisplay(days, hours, minutes);
    }

    function updateCountdownDisplay(days, hours, minutes) {
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');

        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    }

    function resetCountdown() {
        const newTarget = new Date();
        newTarget.setDate(newTarget.getDate() + 14); // Reset to 14 days
        targetDate = newTarget;
    }

    // Update immediately and then every minute
    updateCountdown();
    setInterval(updateCountdown, 60000);
}

// ============================================
// Form Validation & Submission Module
// ============================================
function initFormValidation() {
    const form = document.getElementById('leadForm');
    if (!form) return;

    const inputs = {
        fullName: document.getElementById('fullName'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone')
    };

    const errors = {
        fullName: document.getElementById('nameError'),
        email: document.getElementById('emailError'),
        phone: document.getElementById('phoneError')
    };

    // Real-time validation
    Object.keys(inputs).forEach(field => {
        const input = inputs[field];
        if (!input) return;

        input.addEventListener('blur', () => validateField(field, input.value));
        input.addEventListener('input', () => clearError(field));
    });

    // Phone number formatting
    if (inputs.phone) {
        inputs.phone.addEventListener('input', formatPhoneNumber);
    }

    // Form submission
    form.addEventListener('submit', handleFormSubmit);

    function validateField(field, value) {
        let isValid = true;
        let errorMessage = '';

        switch(field) {
            case 'fullName':
                isValid = value.trim().length >= 2;
                errorMessage = 'Please enter your full name (at least 2 characters)';
                break;
            
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(value);
                errorMessage = 'Please enter a valid email address';
                break;
            
            case 'phone':
                const phoneDigits = value.replace(/\D/g, '');
                isValid = phoneDigits.length >= 10;
                errorMessage = 'Please enter a valid phone number';
                break;
        }

        const formGroup = inputs[field]?.closest('.form-group');
        
        if (!isValid && value.trim() !== '') {
            if (formGroup) formGroup.classList.add('error');
            if (errors[field]) errors[field].textContent = errorMessage;
        } else {
            if (formGroup) formGroup.classList.remove('error');
        }

        return isValid;
    }

    function clearError(field) {
        const formGroup = inputs[field]?.closest('.form-group');
        if (formGroup) formGroup.classList.remove('error');
    }

    function formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length >= 6) {
            value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
        } else if (value.length >= 3) {
            value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
        }
        
        e.target.value = value;
    }

    async function handleFormSubmit(e) {
        e.preventDefault();

        // Validate all fields
        let isFormValid = true;
        Object.keys(inputs).forEach(field => {
            const input = inputs[field];
            if (input && !validateField(field, input.value)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            // Shake animation on invalid fields
            Object.keys(inputs).forEach(field => {
                const formGroup = inputs[field]?.closest('.form-group');
                if (formGroup && formGroup.classList.contains('error')) {
                    formGroup.style.animation = 'shake 0.5s ease';
                    setTimeout(() => {
                        formGroup.style.animation = '';
                    }, 500);
                }
            });
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('.form-submit');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Collect form data
        const formData = {
            full_name: inputs.fullName.value.trim(),
            email: inputs.email.value.trim(),
            phone_number: inputs.phone.value.trim(),
            created_at: new Date().toISOString()
        };

        try {
            // Simulate API call (replace with actual Supabase integration)
            await submitToWaitlist(formData);
            
            // Show success state
            showSuccessState();
            
            // Track conversion (placeholder for analytics)
            trackConversion('waitlist_signup', formData.email);
            
        } catch (error) {
            console.error('Form submission error:', error);
            showErrorState();
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    function showSuccessState() {
        form.style.display = 'none';
        const successMessage = document.getElementById('formSuccess');
        if (successMessage) {
            successMessage.classList.add('show');
        }
        
        // Confetti effect (simple CSS animation trigger)
        createConfetti();
    }

    function showErrorState() {
        alert('Something went wrong. Please try again or contact support.');
    }
}

// ============================================
// API Integration (Supabase Ready)
// ============================================
async function submitToWaitlist(data) {
    // This is a mock function - replace with actual Supabase integration
    // Example Supabase implementation:
    /*
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { error } = await supabase
        .from('leads')
        .insert([data]);
    
    if (error) throw error;
    */
    
    // Simulate network delay
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Waitlist submission:', data);
            resolve({ success: true });
        }, 1500);
    });
}

// ============================================
// Scroll Animations Module
// ============================================
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.design-card, .feature');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ============================================
// Analytics & Tracking
// ============================================
function trackConversion(eventName, value) {
    // Placeholder for analytics integration
    // Google Analytics, Mixpanel, etc.
    console.log(`Conversion tracked: ${eventName}`, { value });
    
    // Example: gtag('event', 'conversion', { ... });
}

// ============================================
// Visual Effects
// ============================================
function createConfetti() {
    const colors = ['#ff3366', '#00ff88', '#ffffff', '#ff5588'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}vw;
            top: -10px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            animation: confetti-fall ${Math.random() * 2 + 2}s linear forwards;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 4000);
    }
}

// Add confetti animation to styles dynamically
const confettiStyles = document.createElement('style');
confettiStyles.textContent = `
    @keyframes confetti-fall {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(confettiStyles);

// ============================================
// Utility Functions
// ============================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for global access
window.scrollToForm = scrollToForm;