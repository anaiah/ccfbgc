// const navbar = document.querySelector('.navbar');

// window.addEventListener('scroll', () => {
//     if (window.scrollY > 50) {
//         navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
//     } else {
//         navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
//     }
// });

const bgc = {
    userId:null,
    belongMinistry: null,
    volunteerName: null,
    ministryId:null,
    socket:null,
    chart1:null,

    saveAttendance: async (url="",formData) => {

        util.toggleButtonLoading("datainputBtn", "Saving data, please wait...", true);
        fetch( url, {
            method:'POST',
            //cache:'no-cache',
            headers: {
                 "Content-Type": "application/json",
            },
            
            body: JSON.stringify(formData)
        })
        .then((response) => {  //promise... then 
            return response.json();
        })
        .then((data) => {
            //alert(data.ok)
            if(data.ok){
                util.speak(`Good job on the ${data.action},.. ${bgc.volunteerName}!!!!`);
               
                //hide modalbox
                util.hideModal('dataInputModal',0) //hide dataentry
                //document.getElementById('footer-msg').innerHTML=''//reset

                const f = document.getElementById('dataInputForm');
                if (f) f.reset();

                //send message to socket for real-time update
                //everytime save notify opmgr
                bgc.socket.emit('sendToOwner', 'update')

            }else{
                util.speak(data.message)
                //util.alertMsg(data.message,'warning','equipmentPlaceHolder')
                return false
            }//eif
            
        })
        
        .catch( (error) => {
            console.error('Error in newempPost:', error);
            util.Toasted(`Network Error: ${error.message}`, 3000, false);
        })
        .finally ( ()=>{
            util.toggleButtonLoading("datainputBtn", null, false);
        })
    },

    //load chart
        loadChart: ()=>{
            console.log('loading from  controller  chart.....')
           
            //let colors = ['#0277bd', '#00838f', '#00695c', '#2e7d32','#558b2f','#9e9d24','#ff8f00','#d84315'];
            let colors = [ '#0277bd','#d84315',  '#2e7d32','#ff8f00']
                    
            // Fisher-Yates shuffle
            // for (let i = colors.length - 1; i > 0; i--) {
            //     const j = Math.floor(Math.random() * (i + 1));
            //     [colors[i], colors[j]] = [colors[j], colors[i]]; // swap elements
            // }//endfor   

            // Map data
           

           // console.log('categories',categories)


            var options = {
                series:[], 
                colors:colors,
                chart: {
                    type: 'bar',
                    height: 350,
                    width: 400,
                    redrawOnParentResize: false,
                    redrawOnWindowResize: false,
                            
                },
                
                plotOptions: {
                    bar: {
                        dataLabels: {
                            position: 'top',
                            //orientation:'vertical'
                        }
                    }
                },
                
                dataLabels: {
                    enabled: true,
                    dropShadow: {
                        enabled: true,
                        left: 1,
                        top: 1,
                        opacity: 0.5
                    },
                    formatter: function (val) {
                        if (val >= 1000000) {
                            return (val / 1000000).toFixed(1) + 'M';
                        } else if (val >= 1000) {
                            return (val / 1000).toFixed(1) + 'K';
                        }
                        
                        return val;
                    },
                    offsetY:-20,
                    style: {
                        fontSize: "12px",
                        colors: ["#d84315","#00695c"]
                    },
                
                },
                
                stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
                },
                xaxis: {
                    categories: [],

                    title: {
                        text: 'Store Status',
                        style: {
                            fontSize: '10px',
                            fontWeight: 'bold',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            color: '#6699ff' // set your desired color
                        }
                    }
                },
                yaxis: {
                    title: {
                        text: '',
                        style: {
                            fontSize: '10px',
                            fontWeight: 'bold',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            color: '#6699ff' // set your desired color
                        }
                    }    
                },
                fill: {
                    opacity: 1
                },
                tooltip: {
                    y: {
                        formatter: function (val) {
                            return val 
                        }
                }
                }
    
            } //end options
        

        }, 

    loadHeadcountChart: async () => {
        
    try {
        const res = await fetch(`${myIp}/bgc/headcount-by-ministry`);
        const payload = await res.json();
        if (!payload.ok) throw new Error(payload.message || 'No data');

        const palette = [
            '#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b',
            '#e377c2','#7f7f7f','#bcbd22','#17becf'
        ];
        const colors = payload.series.map((_, i) => palette[i % palette.length]);

        const options = {
            chart: { type: 'bar', height: 265, width: '100%' },
            colors,
            series: payload.series,
            xaxis: { categories: payload.categories },
            legend: { show: false },
            plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                dataLabels: { position: 'top' }
            }
            },
            dataLabels: {
            enabled: true,
            offsetY: -6,
            style: { fontSize: '12px', colors: ['#000'] }
            }
        };

        const el = document.querySelector('#ccfbgcchart');
        if (!el) throw new Error('#ccfbgcchart element not found');

        // destroy previous chart if exists
        if (bgc.chart1 && typeof bgc.chart1.destroy === 'function') {
            try { await bgc.chart1.destroy(); } catch (e) { /* ignore */ }
            bgc.chart1 = null;
        }

        // create and render new chart
        bgc.chart1 = new ApexCharts(el, options);
        await bgc.chart1.render();

        //const chartContainer = document.querySelector('.chart-placeholder');
       
        // build custom legend
        const legendContainer = document.getElementById('customLegend');
        if (legendContainer) {
            legendContainer.innerHTML = '';
            const paletteFromChart = (bgc.chart1.opts && bgc.chart1.opts.colors) ||
                                    (bgc.chart1.w && bgc.chart1.w.globals && bgc.chart1.w.globals.colors) ||
                                    colors;

        payload.series.forEach((s, i) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.dataset.seriesName = s.name;

        const sw = document.createElement('span');
        sw.className = 'legend-swatch';
        sw.style.backgroundColor = paletteFromChart[i] || '#888';

        const label = document.createElement('span');
        label.textContent = s.name;
        label.style.fontSize = '12px';
        label.style.color = '#333';

        item.appendChild(sw);
        item.appendChild(label);
        legendContainer.appendChild(item);

        item.addEventListener('click', () => {
            if (bgc.chart1 && typeof bgc.chart1.toggleSeries === 'function') {
            bgc.chart1.toggleSeries(s.name);
            item.classList.toggle('muted');
            }
        });
        });
        }
        } catch (err) {
        console.error('Failed to load headcount chart:', err);
        }
    },
    //===get segments for user
    getSegments:()=>{

        const userData = JSON.parse(localStorage.getItem('bgc_user')); // has ministry_segment, etc.
        console.log('your segment', userData)
        const segmentSelect = document.getElementById('segmentSelect');
        
        if (!segmentSelect) return;

        // Clear old options
        segmentSelect.innerHTML = '';

        const raw = userData.ministry_segment || ''; // e.g. "Youth,Music,Sharers"

        // Split, trim, and filter out empties
        const segments = raw
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        // Optional: add a default/placeholder option
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Select segment';
        placeholder.disabled = true;
        placeholder.selected = true;
        segmentSelect.appendChild(placeholder);

        // Add one <option> per segment
        segments.forEach(seg => {
            const opt = document.createElement('option');
            opt.value = seg;
            opt.textContent = seg;
            segmentSelect.appendChild(opt);
        });

    },

    //=====get links for user
    checkNavLinks: () => {
        const ul = document.querySelector('.navbar-nav.ms-auto.me-2');
        if (!ul) return;
        
       // read profile safely
            let profile = null;
            try { profile = JSON.parse(localStorage.getItem('bgc_user')); } catch (e) { profile = null; }
            const grp = profile && profile.grp_id ? String(profile.grp_id) : null;

            // find existing login li (by data-bs-target or link text)
            const loginLi = ul.querySelector('li.nav-item > a[data-bs-target="#loginModal"]')?.closest('li.nav-item')
                        || Array.from(ul.querySelectorAll('li.nav-item')).find(li => li.textContent.trim().toLowerCase() === 'login');

            // helper to create LI with anchor
            const createNavItem = (id, text, attrs = {}) => {
            const li = document.createElement('li');
            li.className = 'nav-item';
            const a = document.createElement('a');
            a.className = 'nav-link';
            if (id) a.id = id;
            a.href = attrs.href || '#';
            a.textContent = text;
            Object.entries(attrs).forEach(([k,v]) => {
                if (k === 'dataset') Object.entries(v).forEach(([dk,dv]) => a.dataset[dk] = dv);
                else a.setAttribute(k, v);
            });
            li.appendChild(a);
            return li;
            };

            let newLi;

            //2,5,6,7,8 are standard users; 4 is admin; else show login
            switch(grp) {
                case '1':
                case '2':
                case '5':
                case '6':
                case '7':
                case '8':
                    newLi = createNavItem('dataentryBtn', 'Data Entry', { 'data-bs-toggle': 'modal', 'data-bs-target': '#dataInputModal', href: '#' });
                    bgc.connectSocket()
                    bgc.getSegments()
                break;

                case '4': //owner
                    newLi = createNavItem('adminBtn', 'Admin', { 'data-bs-toggle': 'modal', 'data-bs-target': '#adminInputModal', href: '#' });
                    bgc.connectSocket()
                break;

                default:
                    newLi = createNavItem('', 'Login', { 'data-bs-toggle': 'modal', 'data-bs-target': '#loginModal', href: '#' });
                break;

            }//endsw

            if (grp !== '4') {
            } else if (grp === '4') {
            newLi = createNavItem('adminBtn', 'Admin', { 'data-bs-toggle': 'modal', 'data-bs-target': '#adminInputModal', href: '#' });
            } else {
            newLi = createNavItem('', 'Login', { 'data-bs-toggle': 'modal', 'data-bs-target': '#loginModal', href: '#' });
            }


            if (loginLi) {
                ul.replaceChild(newLi, loginLi);
            } else {
                ul.insertBefore(newLi, ul.firstElementChild);
            }

    },

    connectSocket:async()=>{
        //====connect to socket after login
        const user = JSON.parse(localStorage.getItem('bgc_user')) || {};
        let authz = [];
        authz.push(user.grp_id);
        authz.push(user.full_name);
        authz.push(user.id);

        console.log('=== authz ', authz);

        //==HANDSHAKE FIRST WITH SOCKET.IO
        const userName = { token: authz[1], emp_id: authz[2], mode: user.grp_id };

        bgc.socket = io.connect(`${myIp}`, {
            transports: ['websocket', 'polling'],
            upgrade: true,
            rememberTransport: false,
            query: `userName=${JSON.stringify(userName)}`
        });

        bgc.socket.on('connect', () => {
            console.log('Connected to Socket.IO server using:', bgc.socket.io.engine.transport.name);
        });

        bgc.socket.on('disconnect', () => {
            console.log('Disconnected from Socket.IO server');
        });
    
        //===receive messages from volunteers
        bgc.socket.on('xinit', (msg) => {
            util.Toasted(msg, 3000, true);
            util.speak(`${user.full_name}, there's an Incoming update!`);
            console.log('socket.io()', msg);
            bgc.loadHeadcountChart();
        });

        console.log('user logged in:', user.grp_id, user.full_name);

    },

    getCredentials:()=>{
        const user = JSON.parse(localStorage.getItem('bgc_user')); // has ministry_segment, etc.
        
        bgc.userId = user.id; // Set the user ID in the bgc object for global access
        bgc.belongMinistry = user.ministry_description; // Set the ministry description in the bgc object for global access
        bgc.ministryId = user.ministry_id; // Set the ministry ID in the bgc object for global access

    },

    init: function() {
        //collapse menu link when clickd
        console.log('bgc init called');
        const navLinks = document.querySelectorAll('.navbar-collapse .nav-link');
        const navbarCollapseEl = document.getElementById('navbarNav');

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapseEl);
            if (bsCollapse) {
                bsCollapse.hide();
            }
            });
        });
    }
}//end bgc

//swindow.bgc = bgc; // expose to global

document.addEventListener("DOMContentLoaded", function() {
    bgc.init();
    
    bgc.checkNavLinks()
    
    window.bgc = bgc;

    // ***************EVENT FOR LOGIN ************
    document.addEventListener('userLoggedIn', (e) => {
        
        
        //====connect to socket after login
        bgc.connectSocket()

        //bgc.getCredentials(); //get creds from login s

        console.log('user logged in:', e.detail.data.grp_id, e.detail.data.full_name);

        // Get references to the modals
        const loginModalElement = document.getElementById('loginModal');
        const loginModal = bootstrap.Modal.getInstance(loginModalElement) || new bootstrap.Modal(loginModalElement);

        // Close the login modal
        loginModal.hide();

        const dataInputModalElement = document.getElementById('dataInputModal');
        const adminInputModalElement = document.getElementById('adminInputModal');

        // Initialize Bootstrap Modal objects
        const dataInputModal = new bootstrap.Modal(dataInputModalElement);
        const adminInputModal = new bootstrap.Modal(adminInputModalElement);

        console.log('what is', e.detail.data.grp_id);

        // Simulate server-side check after a brief delay for transition
        setTimeout(() => {
            switch (e.detail.data.grp_id) {
                case '1':
                case '2':
                case '5':
                case '6':
                case '7':    
                case '8':

                    bgc.getSegments() //minnistry segments
                    bgc.getCredentials()

                    console.log('Login simulated for standard user.');
                    
                    //dataInputModal.show();
                    bgc.checkNavLinks(); //update nav links immediately

                    
                    break;
                case '4':
                    console.log('Login simulated for admin user.');

                    adminInputModal.show(); //on show chart loadheadcountchart()
                    bgc.checkNavLinks(); //update nav links immediately

                    break;
            }
        }, 300);
    });

    // listener for admin chart when admin modal show
    const adminModalEl = document.getElementById('adminInputModal');
    if (adminModalEl) {
        adminModalEl.addEventListener('shown.bs.modal', function () {
            if (typeof bgc !== 'undefined' && typeof bgc.loadHeadcountChart === 'function') {
                bgc.loadHeadcountChart();
            }
        });
    }
    // Smooth scroll for anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            const targetId = this.getAttribute("href");
            if (!targetId || targetId === '#') return;
            const targetSection = document.querySelector(targetId);
            if (!targetSection) return;
            targetSection.scrollIntoView({ behavior: "smooth" });
        });
    });

    // PARALLAX: only attach on mobile; do NOT return early (so other code runs)
    const sections = document.querySelectorAll('.hero-section, .about-section, .contact-section');
    const isMobile = window.matchMedia('(max-width: 991.98px)').matches;

    function updateParallax() {
        const scrollY = window.scrollY || window.pageYOffset;
        sections.forEach(sec => {
            const speed = 0.3; // tweak: 0.2 subtle, 0.5 stronger
            const offset = (scrollY - sec.offsetTop) * speed;
            sec.style.backgroundPosition = `center ${offset}px`;
        });
    }

    if (sections.length > 0 && isMobile) {
        window.addEventListener('scroll', updateParallax, { passive: true });
        updateParallax();
    }

    // REVEAL-ON-SCROLL (generic)
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
                el.style.transitionDelay = delay + 'ms';
                el.classList.add('is-visible');
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.2 });

    revealElements.forEach(el => observer.observe(el));

    // MV-specific observer (optional/staggered) — use correct selector so it actually finds cards
    const mvCards = document.querySelectorAll('.mv-card, .mv-reveal, .reveal-on-scroll');
    if (mvCards.length > 0) {
        const mvObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    const delay = parseInt(card.getAttribute('data-delay') || '0', 10);
                    card.style.transitionDelay = delay + 'ms';
                    card.classList.add('is-visible');
                    mvObserver.unobserve(card);
                }
            });
        }, { threshold: 0.2 });

        mvCards.forEach(card => mvObserver.observe(card));
    }
    //==== from index.html: footer year + modal init + login form handling ====
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const loginModalElement = document.getElementById('loginModal');
    const dataInputModalElement = document.getElementById('dataInputModal');
    const adminInputModalElement = document.getElementById('adminInputModal');

    const loginModal = new bootstrap.Modal(loginModalElement);
    const dataInputModal = new bootstrap.Modal(dataInputModalElement);
    const adminInputModal = new bootstrap.Modal(adminInputModalElement);

    const loginForm = document.getElementById('loginForm');
    const inputEmail = document.getElementById('inputEmail');

    // if (loginForm && inputEmail) { //temporary out this line
    //     loginForm.addEventListener('submit', function(event) {
    //         event.preventDefault();
    //         const email = inputEmail.value.toLowerCase().trim();
    //         loginModal.hide();
    //         setTimeout(() => {
    //             if (email === 'user@gmail.com') {
    //                 //dataInputModal.show();
    //             } else {
    //                 //adminInputModal.show();
    //             }
    //         }, 300);
    //     });
    // }

    // const dataInputForm = document.getElementById('dataInputForm');
    // if (dataInputForm) {
    //     dataInputForm.addEventListener('submit', function(event) {
    //         event.preventDefault();
    //         const selectedService = document.getElementById('serviceSelect')?.value;
    //         const selectedSegment = document.getElementById('segmentSelect')?.value;
    //         const countValue = document.getElementById('countInput')?.value;
    //         alert(`Data for Service: "${selectedService}", Segment: "${selectedSegment}" with Count: "${countValue}" submitted!`);
    //         dataInputModal.hide();
    //         dataInputForm.reset();
    //     });
    // }

    if (adminInputModalElement) {
        adminInputModalElement.addEventListener('shown.bs.modal', function () {
            console.log('Admin Modal is fully open. Time to load chart data!');
        });
    }
        
});

