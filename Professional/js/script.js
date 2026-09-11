document.addEventListener('DOMContentLoaded', function() {

    // ==========================================
    // 1. MOBILE MENU TOGGLE
    // ==========================================
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const iconHamburger = menuToggle?.querySelector('.icon-hamburger');
    const iconClose = menuToggle?.querySelector('.icon-close');

    if (menuToggle && mobileMenu && iconHamburger && iconClose) {

        function openMenu() {
            mobileMenu.classList.add('open');
            menuToggle.setAttribute('aria-expanded', 'true');
            mobileMenu.setAttribute('aria-hidden', 'false');
            mobileMenu.removeAttribute('inert');
            iconHamburger.style.display = 'none';
            iconClose.style.display = 'block';

            const firstLink = mobileMenu.querySelector('a');
            if (firstLink) {
                setTimeout(function() {
                    firstLink.focus();
                }, 100);
            }
        }

        function closeMenu() {
            mobileMenu.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
            mobileMenu.setAttribute('aria-hidden', 'true');
            mobileMenu.setAttribute('inert', '');
            iconHamburger.style.display = 'block';
            iconClose.style.display = 'none';

            menuToggle.focus();
        }

        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            if (mobileMenu.classList.contains('open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                closeMenu();
            });
        });

        document.addEventListener('click', function(e) {
            if (mobileMenu.classList.contains('open')) {
                const isClickInside = mobileMenu.contains(e.target) || menuToggle.contains(e.target);
                if (!isClickInside) {
                    closeMenu();
                }
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
                closeMenu();
                menuToggle.focus();
            }
        });
    }

    // ==========================================
    // 2. GALLERY LIGHTBOX
    // ==========================================
    const lightboxDialog = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = lightboxDialog?.querySelector('.lightbox-close');

    if (lightboxDialog && lightboxImg && closeBtn) {

        document.querySelectorAll('.gallery-item').forEach(function(item) {
            item.addEventListener('click', function() {
                const fullSrc = this.dataset.full;
                if (fullSrc) {
                    lightboxImg.src = fullSrc;
                    const imgAlt = this.querySelector('img')?.alt || 'Enlarged gallery image';
                    lightboxImg.alt = imgAlt;
                    lightboxDialog.showModal();
                    closeBtn.focus();
                }
            });
        });

        closeBtn.addEventListener('click', function() {
            lightboxDialog.close();
        });

        lightboxDialog.addEventListener('click', function(e) {
            if (e.target === lightboxDialog) {
                lightboxDialog.close();
            }
        });

        lightboxDialog.addEventListener('close', function() {
            lightboxImg.src = '';
        });
    }

    // ==========================================
    // 3. CONTACT FORM VALIDATION
    // ==========================================
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {

        function clearErrors() {
            contactForm.querySelectorAll('.form-error').forEach(function(span) {
                span.textContent = '';
            });
            contactForm.querySelectorAll('[aria-invalid="true"]').forEach(function(el) {
                el.removeAttribute('aria-invalid');
            });
        }

        function validateField(input) {
            const id = input.id;
            const errorSpan = document.getElementById(id + '-error');
            const isRequired = input.hasAttribute('required');
            const isEmail = input.type === 'email';
            const isTel = input.type === 'tel';

            if (!isRequired && !isEmail && !isTel) return true;
            if (!isRequired && !input.value.trim() && !isEmail && !isTel) return true;

            let isValid = true;
            let message = '';

            if (isRequired && !input.value.trim()) {
                isValid = false;
                message = 'This field is required.';
            }

            if (isEmail && input.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
                isValid = false;
                message = 'Please enter a valid email address.';
            }

            if (isTel && input.value.trim()) {
                const phoneClean = input.value.trim().replace(/[\s\-\(\)\.]/g, '');
                if (phoneClean.length < 10) {
                    isValid = false;
                    message = 'Please enter a valid phone number.';
                }
            }

            if (!isValid) {
                if (errorSpan) errorSpan.textContent = message;
                input.setAttribute('aria-invalid', 'true');
            } else {
                if (errorSpan) errorSpan.textContent = '';
                input.removeAttribute('aria-invalid');
            }

            return isValid;
        }

        contactForm.querySelectorAll('input, select, textarea').forEach(function(input) {
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required') || this.type === 'email' || this.type === 'tel') {
                    validateField(this);
                }
            });
            input.addEventListener('input', function() {
                const errorSpan = document.getElementById(this.id + '-error');
                if (errorSpan && errorSpan.textContent !== '') {
                    errorSpan.textContent = '';
                    this.removeAttribute('aria-invalid');
                }
            });
        });

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            clearErrors();

            let isValid = true;
            const fieldsToValidate = this.querySelectorAll(
                'input[required], select[required], input[type="email"], input[type="tel"]'
            );

            fieldsToValidate.forEach(function(input) {
                if (!validateField(input)) {
                    isValid = false;
                }
            });

            const fileInput = document.getElementById('file-upload');
            if (fileInput && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                if (file.size > 5 * 1024 * 1024) {
                    isValid = false;
                    const errorSpan = document.getElementById('file-error');
                    if (errorSpan) {
                        errorSpan.textContent = 'File size exceeds 5MB limit.';
                    }
                    fileInput.setAttribute('aria-invalid', 'true');
                }
            }

            if (!isValid) {
                const firstInvalid = this.querySelector('[aria-invalid="true"]');
                if (firstInvalid) {
                    firstInvalid.focus();
                }
                return;
            }

            const submitBtn = this.querySelector('.form-submit');
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            setTimeout(function() {
                const successMsg = document.createElement('div');
                successMsg.setAttribute('role', 'status');
                successMsg.style.cssText =
                    'text-align: center; padding: 2rem 0; color: var(--color-accent); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; font-family: var(--font-mono);';
                successMsg.textContent = '✓ Thank you! Your request has been received. We will contact you within 24 hours.';

                contactForm.innerHTML = '';
                contactForm.appendChild(successMsg);
            }, 1200);
        });
    }

    // ==========================================
    // 4. SCROLL ANIMATIONS
    // ==========================================
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        const animatedSections = document.querySelectorAll(
            '.services-section, .why-us-section, .about-section, .gallery-section, .reviews-section, .faq-section, .final-cta-section, .contact-section'
        );

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedSections.forEach(function(section) {
            section.classList.add('fade-section');
            observer.observe(section);
        });
    } else {
        document.querySelectorAll('.fade-section').forEach(function(el) {
            el.classList.add('visible');
        });
    }

});