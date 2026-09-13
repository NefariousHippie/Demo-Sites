/* ============================================================
   js/script.js – Oak Leaf Tree Service
   Vanilla JS – Mobile nav, Focus management, Form validation
   Agent Zero Compliant
   ============================================================ */

// ---------- 1. MOBILE NAVIGATION ----------
(function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.primary-nav');
    const navLinks = nav ? nav.querySelectorAll('a') : [];

    if (!toggle || !nav) return;

    function openMenu() {
        nav.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('nav-open');

        // Move focus to the first link in the mobile menu
        const firstLink = nav.querySelector('.nav-list a');
        if (firstLink) {
            setTimeout(function() {
                firstLink.focus();
            }, 100);
        }
    }

    function closeMenu() {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');

        // Return focus to the toggle button
        toggle.focus();
    }

    // Toggle on hamburger click
    toggle.addEventListener('click', function(e) {
        e.stopPropagation();
        if (nav.classList.contains('is-open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close nav when a link is clicked (good UX)
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            closeMenu();
        });
    });

    // Close on outside click
    document.addEventListener('click', function(e) {
        if (nav.classList.contains('is-open')) {
            const isClickInside = nav.contains(e.target) || toggle.contains(e.target);
            if (!isClickInside) {
                closeMenu();
            }
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) {
            closeMenu();
        }
    });

    // Close on resize to desktop
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth >= 768 && nav.classList.contains('is-open')) {
                closeMenu();
            }
        }, 150);
    });
})();


// ---------- 2. CONTACT FORM VALIDATION ----------
(function initForm() {
    const form = document.getElementById('estimateForm');
    if (!form) return;

    const successDiv = form.querySelector('.form-success');

    // Helper: show error on a field
    function setFieldError(input, message) {
        const errorId = input.id + '-error';
        const errorEl = document.getElementById(errorId);
        if (errorEl) {
            errorEl.textContent = message;
        }
        if (message) {
            input.setAttribute('aria-invalid', 'true');
            input.setAttribute('aria-describedby', errorId);
        } else {
            input.removeAttribute('aria-invalid');
            input.removeAttribute('aria-describedby');
        }
    }

    // Helper: validate a single field
    function validateField(input) {
        const type = input.getAttribute('type') || input.tagName.toLowerCase();
        const value = input.value.trim();

        // Required fields: name, phone, service
        if (input.hasAttribute('required')) {
            if (!value) {
                setFieldError(input, 'This field is required.');
                return false;
            }
            if (type === 'tel' && !/^[\d\s\-+()]+$/.test(value)) {
                setFieldError(input, 'Please enter a valid phone number.');
                return false;
            }
            if (type === 'tel' && value.replace(/\D/g, '').length < 10) {
                setFieldError(input, 'Please enter a valid phone number.');
                return false;
            }
            if (type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                setFieldError(input, 'Please enter a valid email address.');
                return false;
            }
            if (input.tagName.toLowerCase() === 'select' && value === '') {
                setFieldError(input, 'Please select a service.');
                return false;
            }
        }

        // Optional email validation if filled
        if (type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setFieldError(input, 'Please enter a valid email address.');
            return false;
        }

        setFieldError(input, '');
        return true;
    }

    // Validate on blur and input
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(function(input) {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') || this.type === 'email' || this.type === 'tel') {
                validateField(this);
            }
        });
        input.addEventListener('input', function() {
            if (this.getAttribute('aria-invalid') === 'true') {
                validateField(this);
            }
        });
        input.addEventListener('change', function() {
            if (this.getAttribute('aria-invalid') === 'true') {
                validateField(this);
            }
        });
    });

    // Submit handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate all fields
        let isValid = true;
        const allFields = form.querySelectorAll('input, select, textarea');
        allFields.forEach(function(field) {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            const firstInvalid = form.querySelector('[aria-invalid="true"]');
            if (firstInvalid) {
                firstInvalid.focus();
            }
            return;
        }

        // Submit to the Mr. Lander Client CTAs Worker
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
        }

        const data = new FormData(form);

        fetch('https://mr-lander-client-ctas.the-visibility-specialist.workers.dev/', {
            method: 'POST',
            body: data
        })
            .then(function (res) {
                return res.json().then(function (json) {
                    return { ok: res.ok, json: json };
                });
            })
            .then(function (result) {
                if (!result.ok || !result.json.ok) {
                    throw new Error((result.json && result.json.error) || 'Submission failed');
                }

                const formGroups = form.querySelectorAll('.form-group');
                const disclaimer = form.querySelector('.form-disclaimer');

                formGroups.forEach(function(g) { g.style.display = 'none'; });
                if (submitBtn) submitBtn.style.display = 'none';
                if (disclaimer) disclaimer.style.display = 'none';

                if (successDiv) {
                    successDiv.removeAttribute('hidden');
                    successDiv.setAttribute('role', 'status');
                    successDiv.focus();
                }

                form.reset();
            })
            .catch(function (err) {
                console.error('Submission error:', err);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Get a Free Estimate';
                }
                alert('Something went wrong submitting your request. Please call us directly at (555) 123-4567.');
            });
    });
})();


// ---------- 3. SMOOTH SCROLL (progressive enhancement) ----------
(function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (!target) return;

            if (!('scrollBehavior' in document.documentElement.style)) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
})();


// ---------- 4. LANGUAGE SWITCHER ----------
(function initI18n() {
    const translations = {
        en: {
            'meta.title': 'Oak Leaf Tree Service | Professional Tree Care',
            'nav.about': 'About',
            'nav.services': 'Services',
            'nav.process': 'Process',
            'nav.reviews': 'Reviews',
            'nav.callUs': 'Call Us',
            'hero.title': 'A Tree Service You Can Trust',
            'hero.subtitle': 'Safe, reliable tree care for your home and property. Our experienced team provides dependable tree removal, trimming, pruning, and storm cleanup with careful workmanship and respect for your property. We proudly serve homeowners throughout the local community with honest recommendations, straightforward service, and quality work you can count on.',
            'hero.cta': 'Get a Free Estimate',
            'about.eyebrow': 'About Us',
            'about.title': 'Your Local Tree Care Professionals',
            'about.p1': 'Oak Leaf Tree Service is a family-owned business dedicated to preserving the beauty and safety of your trees. We combine modern arboriculture techniques with old-fashioned hard work and integrity.',
            'about.p2': 'Whether you need a single limb trimmed or an entire lot cleared, we approach every project with the same commitment to quality, safety, and customer satisfaction.',
            'about.stat1': 'Years Experience',
            'about.stat2': 'Trees Removed',
            'about.stat3': 'Customer Rating',
            'services.eyebrow': 'What We Do',
            'services.title': 'Our Tree Services',
            'services.subtitle': 'From routine pruning to emergency removals, our experienced team handles the job safely and professionally.',
            'services.removal.title': 'Tree Removal',
            'services.removal.desc': 'Safe, controlled removal of hazardous, diseased, damaged, or unwanted trees—with careful attention to your home and property.',
            'services.trimming.title': 'Tree Trimming & Pruning',
            'services.trimming.desc': 'Improve tree health, appearance, and safety with professional pruning that removes dead, damaged, or overgrown branches.',
            'services.stump.title': 'Stump Grinding',
            'services.stump.desc': 'Remove unwanted stumps and surface roots to reclaim valuable yard space and leave your property cleaner and easier to maintain.',
            'services.emergency.title': 'Emergency Tree Service',
            'services.emergency.desc': 'Fast response when fallen or damaged trees create an immediate hazard to your home, vehicles, property, or access.',
            'services.storm.title': 'Storm Damage Cleanup',
            'services.storm.desc': 'Clear fallen branches, damaged trees, and storm debris while helping restore your property after severe weather.',
            'services.care.title': 'Tree Care & Maintenance',
            'services.care.desc': 'Keep your trees healthy and looking their best with ongoing maintenance, inspections, pruning, and professional care.',
            'whyUs.eyebrow': 'Why Oak Leaf',
            'whyUs.title': 'Why Choose Us',
            'whyUs.subtitle': "We're committed to doing the job right—safely, professionally, and with respect for your property.",
            'whyUs.item1.title': '👷 Experienced Professionals',
            'whyUs.item1.desc': '—Skilled tree-care professionals with hands-on experience and the right equipment for the job.',
            'whyUs.item2.title': '🛡️ Safety First',
            'whyUs.item2.desc': '—Careful planning and proven safety practices protect your family, property, and our crew.',
            'whyUs.item3.title': '📄 Licensed & Insured',
            'whyUs.item3.desc': '—Proper coverage gives you confidence from the first estimate through final cleanup.',
            'whyUs.item4.title': '⏰ Reliable Service',
            'whyUs.item4.desc': '—We communicate clearly, arrive when promised, and treat your property with respect.',
            'whyUs.item5.title': '📋 Transparent Estimates',
            'whyUs.item5.desc': '—Straightforward recommendations and pricing with no hidden fees or unnecessary surprises.',
            'whyUs.item6.title': '🧹 Professional Cleanup',
            'whyUs.item6.desc': "—We don't consider the job finished until the work area is clean and your property is left looking its best.",
            'process.eyebrow': 'How It Works',
            'process.title': 'Our Simple Process',
            'process.subtitle': 'From the first call to the final cleanup, we make professional tree care straightforward.',
            'process.step1.title': 'Request an Estimate',
            'process.step1.desc': 'Tell us what you need by phone, text, or through our online estimate form.',
            'process.step2.title': 'On-Site Assessment',
            'process.step2.desc': 'We inspect the trees, surrounding property, access, and scope of work to determine the safest approach.',
            'process.step3.title': 'Review Your Options',
            'process.step3.desc': 'We explain our recommendations, pricing, and expected timeline so you can make an informed decision.',
            'process.step4.title': 'Get the Job Done',
            'process.step4.desc': 'Our crew completes the work safely and efficiently, then cleans up the work area before we leave.',
            'serviceArea.eyebrow': 'Where We Serve',
            'serviceArea.title': 'Proudly Serving Your Community',
            'serviceArea.subtitle': 'We provide expert tree care across the greater metropolitan area.',
            'serviceArea.oakville': 'City of Oakville',
            'serviceArea.pinevalley': 'Pine Valley',
            'serviceArea.cedarridge': 'Cedar Ridge',
            'serviceArea.willowcreek': 'Willow Creek',
            'serviceArea.ashfordpark': 'Ashford Park',
            'serviceArea.highlandheights': 'Highland Heights',
            'serviceArea.meadowbrook': 'Meadowbrook',
            'serviceArea.note1': "Don't see your city?",
            'serviceArea.contactLink': 'Contact us',
            'serviceArea.note2': '—we likely serve you too.',
            'reviews.eyebrow': 'Testimonials',
            'reviews.title': 'What Our Customers Say',
            'reviews.subtitle': "Real reviews from real people—we let our work speak for itself.",
            'reviews.review1.text': '"Oak Leaf removed a massive pine that was leaning toward our house. Professional, fast, and left the yard cleaner than they found it."',
            'reviews.review2.text': '"They came out the same day for an emergency storm branch. Fair price, great communication. Highly recommend."',
            'reviews.review3.text': '"We used them for pruning and stump grinding. The crew was knowledgeable and respectful of our property. Will use again."',
            'reviews.review4.text': '"Best tree service we\'ve ever hired. They explained everything upfront and delivered exactly what they promised."',
            'contact.eyebrow': 'Free Estimate',
            'contact.title': 'Ready to Take Care of Your Trees?',
            'contact.p1': "Fill out the form and we'll reach out within 24 hours with a free, no-obligation estimate. Tell us about your tree care needs—whether it's a hazardous removal, routine trimming, or an emergency cleanup—and we'll handle the rest. No pressure, just honest advice and straight talk about what your trees actually need.",
            'contact.p2': "We're a local, family-owned business that takes pride in every job, big or small. Let's talk about your trees.",
            'contact.callout': "Prefer to talk? Give us a call—we're happy to answer your questions.",
            'contact.form.name': 'Full Name',
            'contact.form.phone': 'Phone Number',
            'contact.form.email': 'Email Address',
            'contact.form.service': 'Service Needed',
            'contact.form.select': 'Select a service…',
            'contact.form.removal': 'Tree Removal',
            'contact.form.trimming': 'Tree Trimming & Pruning',
            'contact.form.stump': 'Stump Grinding',
            'contact.form.emergency': 'Emergency Tree Service',
            'contact.form.storm': 'Storm Damage Cleanup',
            'contact.form.care': 'Tree Care & Maintenance',
            'contact.form.other': 'Other / Not Sure',
            'contact.form.address': 'Property Address',
            'contact.form.message': 'Message / Details',
            'contact.form.submit': 'Get a Free Estimate',
            'contact.form.disclaimer': "We'll never share your information. By submitting, you agree to our privacy policy.",
            'contact.form.success': "✅ Thank you! We'll be in touch shortly.",
            'footer.tagline': 'Professional, reliable tree care for your home and property. We put safety, integrity, and quality workmanship first on every job, treating your trees and property with the care they deserve.',
            'footer.services': 'Services',
            'footer.removal': 'Tree Removal',
            'footer.trimming': 'Trimming & Pruning',
            'footer.stump': 'Stump Grinding',
            'footer.emergency': 'Emergency Service',
            'footer.areas': 'Service Areas',
            'footer.oakville': 'Oakville',
            'footer.maplewood': 'Maplewood',
            'footer.pinevalley': 'Pine Valley',
            'footer.cedarridge': 'Cedar Ridge',
            'footer.contact': 'Contact',
            'footer.hours': '🕐 Mon—Fri 8AM—6PM',
            'footer.copyright': '© 2026 Powered by Mr. Lander. All rights reserved.',
            'footer.privacy': 'Privacy Policy',
            'footer.terms': 'Terms of Service'
        },
        es: {
            'meta.title': 'Oak Leaf Tree Service | Cuidado Profesional de Árboles',
            'nav.about': 'Nosotros',
            'nav.services': 'Servicios',
            'nav.process': 'Proceso',
            'nav.reviews': 'Reseñas',
            'nav.callUs': 'Llámenos',
            'hero.title': 'Un Servicio de Árboles en el que Puede Confiar',
            'hero.subtitle': 'Cuidado de árboles seguro y confiable para su hogar y propiedad. Nuestro equipo experimentado ofrece remoción, poda, recorte y limpieza de tormentas con un trabajo cuidadoso y respeto por su propiedad. Servimos con orgullo a los propietarios de toda la comunidad local con recomendaciones honestas, un servicio directo y un trabajo de calidad en el que puede confiar.',
            'hero.cta': 'Obtenga un Presupuesto Gratis',
            'about.eyebrow': 'Sobre Nosotros',
            'about.title': 'Sus Profesionales Locales en Cuidado de Árboles',
            'about.p1': 'Oak Leaf Tree Service es un negocio familiar dedicado a preservar la belleza y seguridad de sus árboles. Combinamos técnicas modernas de arboricultura con el trabajo duro y la integridad de siempre.',
            'about.p2': 'Ya sea que necesite podar una sola rama o despejar un terreno completo, abordamos cada proyecto con el mismo compromiso de calidad, seguridad y satisfacción del cliente.',
            'about.stat1': 'Años de Experiencia',
            'about.stat2': 'Árboles Removidos',
            'about.stat3': 'Calificación de Clientes',
            'services.eyebrow': 'Lo Que Hacemos',
            'services.title': 'Nuestros Servicios de Árboles',
            'services.subtitle': 'Desde poda de rutina hasta remociones de emergencia, nuestro equipo experimentado se encarga del trabajo de forma segura y profesional.',
            'services.removal.title': 'Remoción de Árboles',
            'services.removal.desc': 'Remoción segura y controlada de árboles peligrosos, enfermos, dañados o no deseados—con especial cuidado de su hogar y propiedad.',
            'services.trimming.title': 'Recorte y Poda de Árboles',
            'services.trimming.desc': 'Mejore la salud, apariencia y seguridad de sus árboles con una poda profesional que elimina ramas muertas, dañadas o demasiado crecidas.',
            'services.stump.title': 'Trituración de Tocones',
            'services.stump.desc': 'Elimine tocones y raíces superficiales no deseadas para recuperar espacio valioso en su jardín y dejar su propiedad más limpia y fácil de mantener.',
            'services.emergency.title': 'Servicio de Emergencia',
            'services.emergency.desc': 'Respuesta rápida cuando árboles caídos o dañados representan un peligro inmediato para su hogar, vehículos, propiedad o acceso.',
            'services.storm.title': 'Limpieza de Daños por Tormenta',
            'services.storm.desc': 'Retiramos ramas caídas, árboles dañados y escombros de tormenta mientras ayudamos a restaurar su propiedad tras el mal tiempo.',
            'services.care.title': 'Cuidado y Mantenimiento de Árboles',
            'services.care.desc': 'Mantenga sus árboles sanos y con la mejor apariencia con mantenimiento continuo, inspecciones, poda y cuidado profesional.',
            'whyUs.eyebrow': 'Por Qué Oak Leaf',
            'whyUs.title': 'Por Qué Elegirnos',
            'whyUs.subtitle': 'Nos comprometemos a hacer el trabajo bien—de forma segura, profesional y con respeto por su propiedad.',
            'whyUs.item1.title': '👷 Profesionales con Experiencia',
            'whyUs.item1.desc': '—Profesionales capacitados en el cuidado de árboles, con experiencia práctica y el equipo adecuado para el trabajo.',
            'whyUs.item2.title': '🛡️ La Seguridad Primero',
            'whyUs.item2.desc': '—Una planificación cuidadosa y prácticas de seguridad comprobadas protegen a su familia, propiedad y a nuestro equipo.',
            'whyUs.item3.title': '📄 Licenciados y Asegurados',
            'whyUs.item3.desc': '—Una cobertura adecuada le da confianza desde el primer presupuesto hasta la limpieza final.',
            'whyUs.item4.title': '⏰ Servicio Confiable',
            'whyUs.item4.desc': '—Nos comunicamos con claridad, llegamos cuando lo prometemos y tratamos su propiedad con respeto.',
            'whyUs.item5.title': '📋 Presupuestos Transparentes',
            'whyUs.item5.desc': '—Recomendaciones y precios claros, sin cargos ocultos ni sorpresas innecesarias.',
            'whyUs.item6.title': '🧹 Limpieza Profesional',
            'whyUs.item6.desc': '—No consideramos el trabajo terminado hasta que el área quede limpia y su propiedad luzca lo mejor posible.',
            'process.eyebrow': 'Cómo Funciona',
            'process.title': 'Nuestro Proceso Simple',
            'process.subtitle': 'Desde la primera llamada hasta la limpieza final, hacemos que el cuidado profesional de árboles sea sencillo.',
            'process.step1.title': 'Solicite un Presupuesto',
            'process.step1.desc': 'Cuéntenos lo que necesita por teléfono, mensaje de texto o a través de nuestro formulario en línea.',
            'process.step2.title': 'Evaluación en el Lugar',
            'process.step2.desc': 'Inspeccionamos los árboles, la propiedad circundante, el acceso y el alcance del trabajo para determinar el enfoque más seguro.',
            'process.step3.title': 'Revise Sus Opciones',
            'process.step3.desc': 'Le explicamos nuestras recomendaciones, precios y el tiempo estimado para que pueda tomar una decisión informada.',
            'process.step4.title': 'Realizamos el Trabajo',
            'process.step4.desc': 'Nuestro equipo completa el trabajo de forma segura y eficiente, y luego limpia el área antes de retirarse.',
            'serviceArea.eyebrow': 'Dónde Servimos',
            'serviceArea.title': 'Sirviendo a Su Comunidad con Orgullo',
            'serviceArea.subtitle': 'Ofrecemos cuidado experto de árboles en toda el área metropolitana.',
            'serviceArea.oakville': 'Ciudad de Oakville',
            'serviceArea.pinevalley': 'Pine Valley',
            'serviceArea.cedarridge': 'Cedar Ridge',
            'serviceArea.willowcreek': 'Willow Creek',
            'serviceArea.ashfordpark': 'Ashford Park',
            'serviceArea.highlandheights': 'Highland Heights',
            'serviceArea.meadowbrook': 'Meadowbrook',
            'serviceArea.note1': '¿No ve su ciudad?',
            'serviceArea.contactLink': 'Contáctenos',
            'serviceArea.note2': '—es probable que también le brindemos servicio.',
            'reviews.eyebrow': 'Testimonios',
            'reviews.title': 'Lo Que Dicen Nuestros Clientes',
            'reviews.subtitle': 'Reseñas reales de personas reales—dejamos que nuestro trabajo hable por sí mismo.',
            'reviews.review1.text': '"Oak Leaf removió un pino enorme que se inclinaba hacia nuestra casa. Profesionales, rápidos, y dejaron el jardín más limpio de lo que lo encontraron."',
            'reviews.review2.text': '"Llegaron el mismo día por una rama caída durante una tormenta de emergencia. Precio justo, excelente comunicación. Los recomiendo ampliamente."',
            'reviews.review3.text': '"Los contratamos para poda y trituración de tocones. El equipo fue conocedor y respetuoso con nuestra propiedad. Los volveremos a contratar."',
            'reviews.review4.text': '"El mejor servicio de árboles que hemos contratado. Explicaron todo de antemano y cumplieron exactamente lo que prometieron."',
            'contact.eyebrow': 'Presupuesto Gratis',
            'contact.title': '¿Listo para Cuidar Sus Árboles?',
            'contact.p1': 'Complete el formulario y nos comunicaremos con usted dentro de 24 horas con un presupuesto gratuito y sin compromiso. Cuéntenos sobre sus necesidades de cuidado de árboles—ya sea una remoción peligrosa, una poda de rutina o una limpieza de emergencia—y nosotros nos encargamos del resto. Sin presión, solo consejos honestos y una conversación directa sobre lo que sus árboles realmente necesitan.',
            'contact.p2': 'Somos un negocio local y familiar que se enorgullece de cada trabajo, grande o pequeño. Hablemos sobre sus árboles.',
            'contact.callout': '¿Prefiere hablar por teléfono? Llámenos—con gusto responderemos sus preguntas.',
            'contact.form.name': 'Nombre Completo',
            'contact.form.phone': 'Número de Teléfono',
            'contact.form.email': 'Correo Electrónico',
            'contact.form.service': 'Servicio Necesitado',
            'contact.form.select': 'Seleccione un servicio…',
            'contact.form.removal': 'Remoción de Árboles',
            'contact.form.trimming': 'Recorte y Poda de Árboles',
            'contact.form.stump': 'Trituración de Tocones',
            'contact.form.emergency': 'Servicio de Emergencia',
            'contact.form.storm': 'Limpieza de Daños por Tormenta',
            'contact.form.care': 'Cuidado y Mantenimiento de Árboles',
            'contact.form.other': 'Otro / No Estoy Seguro',
            'contact.form.address': 'Dirección de la Propiedad',
            'contact.form.message': 'Mensaje / Detalles',
            'contact.form.submit': 'Obtener un Presupuesto Gratis',
            'contact.form.disclaimer': 'Nunca compartiremos su información. Al enviar este formulario, usted acepta nuestra política de privacidad.',
            'contact.form.success': '✅ ¡Gracias! Nos pondremos en contacto con usted en breve.',
            'footer.tagline': 'Cuidado de árboles profesional y confiable para su hogar y propiedad. Ponemos la seguridad, la integridad y la calidad del trabajo primero en cada proyecto, tratando sus árboles y propiedad con el cuidado que merecen.',
            'footer.services': 'Servicios',
            'footer.removal': 'Remoción de Árboles',
            'footer.trimming': 'Recorte y Poda',
            'footer.stump': 'Trituración de Tocones',
            'footer.emergency': 'Servicio de Emergencia',
            'footer.areas': 'Áreas de Servicio',
            'footer.oakville': 'Oakville',
            'footer.maplewood': 'Maplewood',
            'footer.pinevalley': 'Pine Valley',
            'footer.cedarridge': 'Cedar Ridge',
            'footer.contact': 'Contacto',
            'footer.hours': '🕐 Lun—Vie 8AM—6PM',
            'footer.copyright': '© 2026 Desarrollado por Mr. Lander. Todos los derechos reservados.',
            'footer.privacy': 'Política de Privacidad',
            'footer.terms': 'Términos de Servicio'
        }
    };

    const STORAGE_KEY = 'oakleaf_lang';
    const html = document.documentElement;
    const langSwitch = document.getElementById('langSwitch');
    const langSwitchLabel = document.getElementById('langSwitchLabel');

    if (!langSwitch) return;

    let currentLang = 'en';
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved === 'en' || saved === 'es') {
            currentLang = saved;
        }
    } catch (e) {}

    function applyLanguage(lang) {
        const dict = translations[lang] || translations.en;

        document.querySelectorAll('[data-i18n]').forEach(function(el) {
            const key = el.getAttribute('data-i18n');
            if (Object.prototype.hasOwnProperty.call(dict, key)) {
                el.textContent = dict[key];
            }
        });

        if (dict['meta.title']) {
            document.title = dict['meta.title'];
        }

        html.setAttribute('lang', lang);

        const targetLang = lang === 'en' ? 'es' : 'en';
        if (langSwitchLabel) {
            langSwitchLabel.textContent = targetLang.toUpperCase();
        }
        langSwitch.setAttribute(
            'aria-label',
            lang === 'en' ? 'Switch to Spanish' : 'Cambiar a inglés'
        );

        currentLang = lang;

        try {
            window.localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) {}
    }

    applyLanguage(currentLang);

    langSwitch.addEventListener('click', function() {
        applyLanguage(currentLang === 'en' ? 'es' : 'en');
    });
})();