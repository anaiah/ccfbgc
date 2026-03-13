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
        
            const xoptions = {
  chart: { type: 'bar', height: '100%' }, // height 100% so it fills container
  series: [{ name: 'Headcount', data: [10, 20, 30] }],
  xaxis: { categories: ['A', 'B', 'C'] },
  // optional responsive / grid / padding settings
};

            bgc.chart1 = new ApexCharts(document.querySelector("#ccfbgcchart"), xoptions);
            bgc.chart1.render();
        }, 

    loadHeadcountChart: async () => {
    
        try {
            const res = await fetch(`${myIp}/bgc/headcount-by-ministry`);
            const payload = await res.json();
            if (!payload.ok) throw new Error(payload.message || 'No data');
            /**** */
            // create chart with built-in legend hidden
            const options = {
            chart: { type: 'bar', height: 400, width: '100%' },
            series: payload.series,          // same shape from server
            xaxis: { categories: payload.categories },
            legend: { show: false },         // disable built-in legend
            //plotOptions: { bar: { horizontal: false } }
            plotOptions: {
                bar: {
                horizontal: false,        // or true if you want horizontal bars
                columnWidth: '55%',
                dataLabels: {
                    position: 'top'         // places labels above each bar
                }
                }
            },
            dataLabels: {
                enabled: true,
                offsetY: -6,               // move label slightly above bar (tweak as needed)
                style: {
                fontSize: '12px',
                colors: ['#000']         // black text
                }
            }
            };
            const el = document.querySelector('#ccfbgcchart');
            const chart = new ApexCharts(el, options);
            await chart.render();

            // build custom legend
            // assume `chart` is your ApexCharts instance and `payload.series` exists
const legendContainer = document.getElementById('customLegend');
legendContainer.innerHTML = '';

const colors = (chart.w && chart.w.globals && chart.w.globals.colors) || chart.opts.colors || [];

// create legend items
payload.series.forEach((s, i) => {
  const item = document.createElement('div');
  item.className = 'legend-item';
  item.dataset.seriesName = s.name;

  const sw = document.createElement('span');
  sw.className = 'legend-swatch';
  sw.style.background = colors[i] || '#888'; // color from chart

  const label = document.createElement('span');
  label.textContent = s.name;
  label.style.fontSize = '12px';
  label.style.color = '#333';

  item.appendChild(sw);
  item.appendChild(label);
  legendContainer.appendChild(item);

  // toggle series on click
  item.addEventListener('click', () => {
    chart.toggleSeries(s.name);
    item.classList.toggle('muted');
  });
});

            /**** */
        } catch (err) {
            console.error('Failed to load headcount chart:', err);
        }
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

window.bgc = bgc; // expose to global


document.addEventListener("DOMContentLoaded", function() {
    bgc.init();
   
    //EVENT FOR LOGIN
    document.addEventListener('userLoggedIn', (e) => {

        bgc.loadHeadcountChart()

        //====connect to socket after  login
        const user = JSON.parse(localStorage.getItem('bgc_user'))

        let authz = []
        authz.push( user.grp_id )
        authz.push( user.full_name )
        authz.push( user.id )
                
        console.log('=== authz ',authz[1], authz[2])

        //==HANDSHAKE FIRST WITH SOCKET.IO
        const userName = { token : authz[1] , emp_id: authz[2], mode: user.grp_id}//full name token

        bgc.socket = io.connect(`${myIp}`, {
            //withCredentials: true,
            transports: ['websocket', 'polling'], // Same as server
            upgrade: true, // Ensure WebSocket upgrade is attempted
            rememberTransport: false, //Don't keep transport after refresh
            query:`userName=${JSON.stringify(userName)}`
            // extraHeaders: {
            //   "osndp-header": "osndp"
            // }
        });//========================initiate socket handshake ================

        bgc.socket.on('connect', () => {
            console.log('Connected to Socket.IO server using:', bgc.socket.io.engine.transport.name); // Check the transport
        });

        bgc.socket.on('disconnect', () => {
            console.log('Disconnected from Socket.IO server');
        });
       
        //===receive messges from volunters
        bgc.socket.on('xinit', (msg) => {
            util.Toasted(msg, 3000, true);
            util.speak(`${user.full_name}, there's an Incoming update!`)

            console.log('socket.io()',msg)

            bgc.loadHeadcountChart(); // Refresh chart data when update received
        })

        console.log('user logged in:', e.detail.data.grp_id, e.detail.data.full_name); // user data from login response

        // e.g. update UI, close modal, etc.
        // Get references to the modals
        
        const loginModalElement = document.getElementById('loginModal');
        // const loginModal = new bootstrap.Modal(loginModalElement);
        const loginModal = bootstrap.Modal.getInstance(loginModalElement)
                        || new bootstrap.Modal(loginModalElement);

        // Close the login modal
        loginModal.hide();


        const dataInputModalElement = document.getElementById('dataInputModal');
        const adminInputModalElement = document.getElementById('adminInputModal'); // New admin modal

        // Initialize Bootstrap Modal objects
        const dataInputModal = new bootstrap.Modal(dataInputModalElement);
        const adminInputModal = new bootstrap.Modal(adminInputModalElement); // New admin modal object

        
        console.log( 'what is', e.detail.data.grp_id)
        // Simulate server-side check after a brief delay for transition
        setTimeout(() => {
            switch(e.detail.data.grp_id) {
                case '1': // Standard user
                case '3':
                case '5':   
                case '6':
                case '7':   
                    const user = e.detail.data; // has ministry_segment, etc.

                    const segmentSelect = document.getElementById('segmentSelect');
                    if (!segmentSelect) return;

                    // Clear old options
                    segmentSelect.innerHTML = '';

                    const raw = user.ministry_segment || ''; // e.g. "Youth,Music,Sharers"

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


                    console.log('Login simulated for standard user.');
                    dataInputModal.show(); // Show data input modal
                    break;
                case '4': // Admin or unknown
                    console.log('Login simulated for admin user (or unknown).');
                    adminInputModal.show(); // Show admin dashboard modal
            }
        }, 300); // 300ms delay for smoother transition

    });


    // 1. Select all links that start with "#"
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();

            const targetId = this.getAttribute("href"); // e.g. "#about" or "#"
            if (!targetId || targetId === '#') {
                return; // nothing to scroll to
            }

            const targetSection = document.querySelector(targetId);
            if (!targetSection) return;

            targetSection.scrollIntoView({ behavior: "smooth" });
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

        
});

