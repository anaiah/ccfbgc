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


});

