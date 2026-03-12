// const navbar = document.querySelector('.navbar');

// window.addEventListener('scroll', () => {
//     if (window.scrollY > 50) {
//         navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
//     } else {
//         navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
//     }
// });


document.addEventListener("DOMContentLoaded", function() {
    // 1. Select all links that start with "#"
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener("click", function(e) {
            // 2. Prevent the default behavior (jumping & adding # to URL)
            e.preventDefault();

            // 3. Get the target section ID (e.g., "#about")
            const targetId = this.getAttribute("href");
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                // 4. Calculate position - accounting for your fixed Navbar
                // Change '80' to the approximate height of your navbar
                const headerOffset = 80; 
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                // 5. Scroll smoothly
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });

                // 6. Optional: Close mobile menu if open (Bootstrap specific)
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse.classList.contains('show')) {
                    const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                        toggle: true
                    });
                }
            }
        });
    });

    const sections = document.querySelectorAll('.hero-section, .about-section, .contact-section');

    // Only do JS parallax on small screens – desktop keeps background-attachment: fixed
    const isMobile = window.matchMedia('(max-width: 991.98px)').matches;
    if (!isMobile || sections.length === 0) return;

    function updateParallax() {
      const scrollY = window.scrollY || window.pageYOffset;

      sections.forEach(sec => {
        const speed = 0.3; // tweak: 0.2 subtle, 0.5 stronger
        const offset = (scrollY - sec.offsetTop) * speed;
        sec.style.backgroundPosition = `center ${offset}px`;
      });
    }

    window.addEventListener('scroll', updateParallax, { passive: true });
    updateParallax();
    
    //** MISION VISION */
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
                el.style.transitionDelay = delay + 'ms';
                el.classList.add('is-visible');
                observer.unobserve(el);
            }
            });
        },
        {
            threshold: 0.2
        }
    );

    revealElements.forEach(el => observer.observe(el));
        const mvCards = document.querySelectorAll('.mv-reveal');
        
        if (!mvCards.length) return;

        const mvObserver = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const delay = parseInt(card.getAttribute('data-delay') || '0', 10);

                // stagger using transition-delay
                card.style.transitionDelay = delay + 'ms';
                card.classList.add('is-visible');

                mvObserver.unobserve(card);
            }
            });
        },
        {
            threshold: 0.2
        }
    );

    mvCards.forEach(card => mvObserver.observe(card));

    //==== from index.html==//
    // Update current year in footer
        document.getElementById('currentYear').textContent = new Date().getFullYear();

        // Get references to the modals
        const loginModalElement = document.getElementById('loginModal');
        const dataInputModalElement = document.getElementById('dataInputModal');
        const adminInputModalElement = document.getElementById('adminInputModal'); // New admin modal

        // Initialize Bootstrap Modal objects
        const loginModal = new bootstrap.Modal(loginModalElement);
        const dataInputModal = new bootstrap.Modal(dataInputModalElement);
        const adminInputModal = new bootstrap.Modal(adminInputModalElement); // New admin modal object

        // Get reference to the login form
        const loginForm = document.getElementById('loginForm');
        const inputEmail = document.getElementById('inputEmail'); // Get email input

        // Add event listener for the login form submission
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission

            const email = inputEmail.value.toLowerCase().trim(); // Get email and clean it

            // Close the login modal first
            loginModal.hide();

            // Simulate server-side check after a brief delay for transition
            setTimeout(() => {
                if (email === 'user@gmail.com') {
                    console.log('Login simulated for standard user.');
                    dataInputModal.show(); // Show data input modal
                } else {
                    console.log('Login simulated for admin user (or unknown).');
                    adminInputModal.show(); // Show admin dashboard modal
                }
            }, 300); // 300ms delay for smoother transition

            // Optionally, you might clear the login form fields here
            // loginForm.reset();
        });

        // Add event listener for the data input form submission
        const dataInputForm = document.getElementById('dataInputForm');
        dataInputForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission

            const selectedService = document.getElementById('serviceSelect').value;
            const selectedSegment = document.getElementById('segmentSelect').value;
            const countValue = document.getElementById('countInput').value;

            console.log('Data Submitted:');
            console.log('Service:', selectedService);
            console.log('Segment:', selectedSegment);
            console.log('Count:', countValue);

            // In a real app, you'd send this data to a server.
            // You might then close the modal or show a success message.
            alert(`Data for Service: "${selectedService}", Segment: "${selectedSegment}" with Count: "${countValue}" submitted!`);
            dataInputModal.hide(); // Close modal after submission
            dataInputForm.reset(); // Clear form
        });

        // Optional: Admin modal interaction (e.g., loading chart data) can go here
        adminInputModalElement.addEventListener('shown.bs.modal', function () {
            console.log('Admin Modal is fully open. Time to load chart data!');
            // Here you would typically initialize a chart library (e.g., Chart.js)
            // and fetch data to populate the chart inside the .chart-placeholder div.
        });

        const revealElements2 = document.querySelectorAll('.reveal-on-scroll');

        const observer2 = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // animate once
            }
            });
        },
        {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        }
        );

        revealElements2.forEach(el => observer2.observe(el));

});

