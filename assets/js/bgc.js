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
                //bgc.socket.emit('sendToOwner', 'update')
                bgc.sendUpdate(1,2,3)

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

    //===== chart filter xaxis categories ===
    // Populate select
    updateChart:(sel)=>{

        sel = sel || document.getElementById('ministrySelect');
        let selectedIdx;
        if (sel.value === 'all') {
            selectedIdx = bgc.aCategories.map((_, i) => i);
        } else if (sel.multiple) {
            selectedIdx = Array.from(sel.selectedOptions).map(o => parseInt(o.value, 10));    
        } else {
            // single-select case (placeholder blocks empty)
            selectedIdx = [parseInt(sel.value, 10)];
        }
        // guard
        if (selectedIdx.some(i => Number.isNaN(i))) return;
            
        const newCats = selectedIdx.map(i => bgc.aCategories[i]);
            
        const newSeries = bgc.payload.series.map(s => ({
            name: s.name,
            data: selectedIdx.map(i => s.data[i])
        }));

        // guard
        if (!Array.isArray(selectedIdx) || selectedIdx.some(i => Number.isNaN(i))) return;

        // Determine which series have any non-null value at the selected indices
        const seriesHasValue = bgc.payload.series.map(s =>
            selectedIdx.some(i => Array.isArray(s.data) && s.data[i] != null)
        );

        // Show/hide series in ApexCharts and update custom legend classes
        bgc.payload.series.forEach((s, idx) => {
            const name = s.name;
            if (seriesHasValue[idx]) {
            if (bgc.chart1) bgc.chart1.showSeries(name);
            // update legend UI: remove muted class
            const item = document.querySelector(`
                #customLegend .legend-item[data-series-name="${CSS.escape(name)}"]
                `);
            if (item) item.classList.remove('d-none');
            } else {
            if (bgc.chart1) bgc.chart1.hideSeries(name);
            const item = document.querySelector(`
                #customLegend .legend-item[data-series-name="${CSS.escape(name)}"]
                `);
            if (item) item.classList.add('d-none');
            }
        });

        if(bgc.chart1){
            bgc.chart1.updateOptions({ xaxis: { categories: newCats } }, false);
            bgc.chart1.updateSeries(newSeries, true);
        }        
    },
    //=======admin main chart loader====
    aCategories:[],
    payload:[],

    loadHeadcountChart: async () => {

        /*
        payload.categories = ['LIVE PROD', 'USHERS', 'WELCOME'] // x-axis labels
        payload.series = [ { name: 'AM - LIVE PROD', data: [7, 23, 0] }, { name: 'PM - LIVE PROD', data: [5, 0, 0] } ]
        */
        try {
            const res = await fetch(`${myIp}/bgc/headcount-by-ministry`);
            const payload = await res.json();

            if (!payload.ok) throw new Error(payload.message || 'No data');

            const palette = [
                '#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b',
                '#e377c2','#7f7f7f','#bcbd22','#17becf'
            ];
            const colors = payload.series.map((_, i) => palette[i % palette.length]);

            bgc.payload = payload;
            bgc.aCategories = payload.categories//pass to bgc array

            bgc.buildMinistryTable(bgc.payload, 'chartDetailed')

            /*************** */
            /************ end  */

            const options = {
                chart: { type: 'bar', height: 265, width: '100%' },
                colors,
                series: payload.series,
                xaxis: {
                    categories: payload.categories,
                    labels: {
                        rotate: -65,               // or -90
                        rotateAlways: true,
                        //hideOverlappingLabels: true,
                        trim: true,
                        style: { fontSize: '10px', colors: ['#1d0868'] } // array or single color
                    }
                },
                
                legend: { show: false }, //will make own legend

                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: '95%',
                        dataLabels: { position: 'top' }
                    }
                },

                dataLabels: {
                    enabled: true,
                    offsetY: -10,
                    //formatter: val => (val == null ? '' : val),
                    style: { fontSize: '10px', colors: ['#200505'] }
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

                //fill-out select tag filter for main  ministries
                const ministrySelect = document.getElementById('ministrySelect');
        
                ministrySelect.innerHTML = ''; // clear

              const placeholder = document.createElement('option');
                placeholder.value = '';
                placeholder.textContent = 'Please Select';
                placeholder.disabled = true;
                placeholder.selected = true;
                ministrySelect.appendChild(placeholder);

                const allOpt = document.createElement('option');
                allOpt.value = 'all';      // <- use 'all' not ''
                allOpt.textContent = 'ALL';
                ministrySelect.appendChild(allOpt);

                payload.categories.forEach((cat, idx) => {
                const opt = document.createElement('option');
                opt.value = String(idx);
                opt.textContent = cat;
                ministrySelect.appendChild(opt);
                })

                ministrySelect.selectedIndex = 0;

                
            }//eif

        } catch (err) {
            console.error('Failed to load headcount chart:', err);
        }
    },

    //====== build detald table display
    buildMinistryTable : ( payload, containerId ) => {
        console.log('building table', containerId)

        if (!payload || !payload.categories || !payload.series) return;
        const container = document.getElementById(containerId);
        if (!container) return;

        // parse series name to { when: 'AM'|'PM'|'OTHER', segment: '...' }
        function parseSeriesName(name = '') {
            const normalized = name.replace(/\u00B7|\u2022|·|•/g, '-').replace(/\s+/g, ' ').trim();
            const whenMatch = normalized.match(/\b(AM|PM)\b/i);
            const when = whenMatch ? whenMatch[0].toUpperCase() : 'OTHER';
            const remainder = normalized.replace(/\b(AM|PM)\b/ig, '').replace(/[-–—:]/g, ' ').trim();
            const segment = remainder || name;
            return { when, segment: segment.trim() };
        }

        // Build map: for each ministry index, collect segments with AM/PM values
        const tableMap = payload.categories.map(cat => ({ ministry: cat, segments: {} }));
    
        payload.series.forEach(series => {
            const { when, segment } = parseSeriesName(series.name);
            (series.data || []).forEach((val, idx) => {
                if (idx < 0 || idx >= tableMap.length) return;
                if (val == null) return;                // <-- skip null/undefined values entirely
                const segKey = segment || 'Default';
                const segMap = tableMap[idx].segments;
                if (!segMap[segKey]) segMap[segKey] = { AM: null, PM: null, OTHER: null };
                segMap[segKey][when] = val;
            });
        });

        // prune segments that ended up with all nulls (defensive)
        tableMap.forEach(row => {
            Object.keys(row.segments).forEach(k => {
                const v = row.segments[k];
                if ((v.AM == null) && (v.PM == null) && (v.OTHER == null)) {
                delete row.segments[k];
                }
            });
        });

        // Build table
        const table = document.createElement('table');
        table.className = 'table  table-sm table-striped';
        table.style.width = '100%';
        table.innerHTML =    ` <thead>
        <tr><th>Ministry</th><th>Segment</th><th style="text-align:right">AM</th>
        <th style="text-align:right">PM</th></tr>
        </thead><tbody></tbody>`  ;

        const tbody = table.querySelector('tbody');

        //check xlsx
        tableMap.forEach(row => {
            const segments = Object.keys(row.segments);

            if (segments.length === 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${esc(row.ministry)}</td><td>-</td><td style="text-align:right">
                </td><td style="text-align:right"></td>`;

                tbody.appendChild(tr);
                return;
            }

            segments.forEach((seg, i) => {
                const vals = row.segments[seg];

                // compute arrow for PM vs AM
                const amVal = vals.AM == null ? 0 : Number(vals.AM);
                const pmVal = vals.PM == null ? 0 : Number(vals.PM);
                let arrowHtml = '';
                if (!isNaN(amVal) && !isNaN(pmVal)) {
                    if (pmVal > amVal) {
                        arrowHtml = ' <i class="trend trendup ti ti-caret-up"></i>';
                    } else if (pmVal < amVal) {
                        arrowHtml = ' <i class="trend trenddown ti ti-caret-down"></i>';
                    }
                }//eif


                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${i === 0 ? esc(row.ministry) : ''}</td>   
                <td style="text-align:left">${esc(seg)}</td>   
                <td style="text-align:right">${vals.AM == null ? '0' : vals.AM}</td>   
                <td style="text-align:right">${vals.PM == null ? '0' : vals.PM}${arrowHtml}</td>`
                ;
                // tr.innerHTML =`<td>${i === 0 ? esc(row.ministry) : ''}</td>
                //        <td>${esc(seg)}</td>       
                //        <td style="text-align:right">${vals.AM == null ? '0' : vals.AM}</td>       
                //        <td style="text-align:right">${vals.PM == null ? '0' : vals.PM}</td>`    ;
                
                tbody.appendChild(tr);
            });

            /* use this to produce xls via ednpoint checkxlsxconst exportRows = [];
tableMap.forEach(row => {
  const segments = Object.keys(row.segments).sort((a,b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  if (segments.length === 0) {
    exportRows.push({ Ministry: row.ministry, Segment: '', AM: 0, PM: 0 });
  } else {
    segments.forEach(seg => {
      const vals = row.segments[seg];
      exportRows.push({
        Ministry: row.ministry,
        Segment: seg,
        AM: vals.AM == null ? 0 : vals.AM,
        PM: vals.PM == null ? 0 : vals.PM
      });
    });
  }
});

// send to server (JSON POST)
fetch('https://your-server/xls-export', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ rows: exportRows, filename: 'ministry_report.xlsx' })
})
.then(r => r.blob())
.then(blob => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ministry_report.xlsx';
  document.body.appendChild(a); a.click();
  a.remove(); URL.revokeObjectURL(url);
}); 
            */
        });

        container.innerHTML = '';
        container.appendChild(table);

        function num(v) { return (v == null || v === '') ? '0' : v; }
        
        function esc(s) {
            if (s == null) return '';
            return String(s).replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>').replace(/"/g,'"');
        }

        (bgc && bgc.payload ? bgc.payload : window.payload);
    } ,

   
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

    // helper to create LI with anchor
    createNavItem :  (id, text, attrs = {}) => {
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
    
    },

    // //=====get links for user
    // checkNavLinks: () => {
    //     const ul = document.querySelector('.navbar-nav.ms-auto.me-2');
    //     if (!ul) return;
        
    //         // read profile safely
    //         let profile = null;
            
    //         try { profile = JSON.parse(localStorage.getItem('bgc_user')); } catch (e) { profile = null; }
    //         const grp = profile && profile.grp_id ? String(profile.grp_id) : null;

    //         // find existing login li (by data-bs-target or link text)
    //         const loginLi = ul.querySelector('li.nav-item > a[data-bs-target="#loginModal"]')?.closest('li.nav-item')
    //                     || Array.from(ul.querySelectorAll('li.nav-item')).find(li => li.textContent.trim().toLowerCase() === 'login');

            
    //         let newLi, newLIcal;

    //         //2,5,6,7,8 are standard users; 4 is admin; else show login
    //         switch(grp) {
    //             case '1':
    //             case '2':
    //             case '5':
    //             case '6':
    //             case '7':
    //             case '8':
                   
    //                 bgc.getSegments()
    //                 bgc.getCredentials()
                

    //             break;

    //             case '4': //owner
    //                 //newLi = bgc.createNavItem('adminBtn', 'Admin', { 'data-bs-toggle': 'modal', 'data-bs-target': '#adminInputModal', href: '#' });
    //                 //bgc.connectSocket()
    //             break;

    //             default:
    //                 newLi = bgc.createNavItem('', 'Login', { 'data-bs-toggle': 'modal', 'data-bs-target': '#loginModal', href: '#' });
    //             break;

    //         }//endsw

    //         if (loginLi) {
    //             ul.replaceChild(newLi, loginLi);
    //             document.getElementById('logoutLi').classList.remove('d-none')

    //             console.log('1')
    //         } else {
    //             ul.insertBefore(newLi, ul.firstElementChild);
    //             document.getElementById('logoutLi').classList.remove('d-none')

    //             console.log('2')
    //         }

    // },

    // connectSocket:async()=>{
    //     //====connect to socket after login
    //     const user = JSON.parse(localStorage.getItem('bgc_user')) || {};
    //     let authz = [];
    //     authz.push(user.grp_id);
    //     authz.push(user.full_name);
    //     authz.push(user.id);

    //     console.log('=== authz ', authz);

    //     //==HANDSHAKE FIRST WITH SOCKET.IO
    //     const userName = { token: authz[1], emp_id: authz[2], mode: user.grp_id };

    //     bgc.socket = io.connect(`${myIp}`, {
    //         transports: ['websocket', 'polling'],
    //         upgrade: true,
    //         rememberTransport: false,
    //         query: `userName=${JSON.stringify(userName)}`
    //     });

    //     bgc.socket.on('connect', () => {
    //         console.log('Connected to Socket.IO server using:', bgc.socket.io.engine.transport.name);
    //     });

    //     bgc.socket.on('disconnect', () => {
    //         console.log('Disconnected from Socket.IO server');
    //     });
    
    //     //===receive messages from volunteers
    //     bgc.socket.on('xinit', (msg) => {
    //         util.Toasted(msg, 3000, true);
    //         util.speak(`${user.full_name}, there's an Incoming update!`);
    //         console.log('socket.io()', msg);
    //         bgc.loadHeadcountChart();
    //     });

    //     console.log('user logged in:', user.grp_id, user.full_name);

    // },

    getCredentials:()=>{
        const user = JSON.parse(localStorage.getItem('bgc_user')); // has ministry_segment, etc.
        
        bgc.userId = user.id; // Set the user ID in the bgc object for global access
        bgc.belongMinistry = user.ministry_description; // Set the ministry description in the bgc object for global access
        bgc.ministryId = user.ministry_id; // Set the ministry ID in the bgc object for global access

    },

    TIME_OPTIONS:[],

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
    },

    broadCast: () => {
        fetch(`${myIp}/bgc/update-entry`, {
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Add your data here
                item: "New entry added",
                id: bgc.userId || 'unknown',
                user: bgc.volunteerName || 'Unknown Volunteer',
                ministry: bgc.belongMinistry || 'Unknown Ministry'
            })
        }) 
    },
    sendUpdate:(p1,p2,p3)=>{
        //send message to pusher for real-time update
        fetch(`${myIp}/bgc/send-update`, {
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Add your data here
                id: bgc.userId || 'unknown',
                user: bgc.volunteerName || 'Unknown Volunteer',
                ministry: bgc.belongMinistry || 'Unknown Ministry'
            })
        }) 
    }
}//end bgc

//swindow.bgc = bgc; // expose to global

document.addEventListener("DOMContentLoaded", function() {
    bgc.init();
    
    //bgc.checkNavLinks()
    
    window.bgc = bgc; //set global

    const logoutLi = document.getElementById('logoutLi');
    const user = localStorage.getItem('bgc_user');

    if (!user) {
        logoutLi.classList.add('d-none');   // force hide
    } else {
        logoutLi.classList.remove('d-none'); // show only when logged in
    }   

    /* CAROUSEL */

    // Define your array of image paths
    const carouselImages = [
        'assets/img/GLC_0537.JPG',
        'assets/img/IMG_0975.jpg', // <--- Add your other image paths here
        'assets/img/W2W_0270.JPG',
        'assets/img/ZMP_2002.jpg',
        
        // ... add as many image paths as you need
    ];

    const carouselIndicatorsContainer = document.getElementById('carouselIndicators');
    const carouselInnerContainer = document.getElementById('carouselInner');

    if (carouselIndicatorsContainer && carouselInnerContainer && carouselImages.length > 0) {
        carouselImages.forEach((imagePath, index) => {
        // 1. Create Carousel Indicator (the dots at the bottom)
        const indicator = document.createElement('button');
        indicator.setAttribute('type', 'button');
        indicator.setAttribute('data-bs-target', '#aboutCarousel');
        indicator.setAttribute('data-bs-slide-to', index.toString());
        indicator.setAttribute('aria-label', `Slide ${index + 1}`);
        if (index === 0) {
            indicator.classList.add('active');
            indicator.setAttribute('aria-current', 'true');
        }
        carouselIndicatorsContainer.appendChild(indicator);

        // 2. Create Carousel Item (the image slide itself)
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        if (index === 0) {
            carouselItem.classList.add('active');
        }

        const img = document.createElement('img');
        img.setAttribute('src', imagePath);
        img.setAttribute('alt', `About CCF BGC Slide ${index + 1}`);
        img.classList.add('d-block', 'w-100', 'carousel-img-fit'); // Add custom class for height control

        carouselItem.appendChild(img);
        carouselInnerContainer.appendChild(carouselItem);
        });

        // Optional: Manually initialize carousel if data-bs-ride="carousel" isn't enough,
        // or to set specific options like interval.
        // var myCarousel = new bootstrap.Carousel(document.getElementById('aboutCarousel'), {
        //   interval: 4000, // Advance slide every 4 seconds
        //   pause: 'hover' // Pause on mouse hover
        // });
    } else {
        console.warn("Carousel containers or image array not found. Dynamic carousel population skipped.");
    }
    /** END CAROUSEL */

    //======================api key for PUSHER
    const pusher = new Pusher('e7e1396c6d903263f9a9', {
        cluster: 'ap1',
        encrypted: true
    });

    /// broadcase  to all users in channel
    const channel = pusher.subscribe('bgc-channel');

    channel.bind('entry-updated', function(data) {
        //console.log('Received Pusher event:', data);
        util.Toasted(`${data.message}`, 3000, true);
        util.speak(data.message)
        
        //bgc.loadHeadcountChart(); // Refresh chart with new data
    })

    //to bossings/owners only
    const privychannel = pusher.subscribe(`user-${bgc.userId}`); //subscribe to private channel for this user

    privychannel.bind('personal-alert', function(data) {
        //console.log('Received Pusher event:', data);
        util.Toasted(`From ${data.sender}, ${data.message}`, 3000, true);
        util.speak(data.message)
    });

    // ***************EVENT FIRED FOR LOGIN / USER LOGGED************
    document.addEventListener('userLoggedIn', (e) => {
        
        //====connect to socket after login
        //bgc.connectSocket()

        //console.log('user logged in:', e.detail.data.grp_id, e.detail.data.full_name);

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

        //fire test sse's


        // Simulate server-side check after a brief delay for transition
        setTimeout(() => {
            switch (e.detail.data.grp_id) {
                case 1:
                case 2:
                case 5:
                case 6:
                case 7:
                case 8:

                   

                    bgc.getSegments() //minnistry segments
                    bgc.getCredentials()
                    
                    //bgc.checkNavLinks(); //update nav links immediately
                    document.getElementById('loginli').classList.add('d-none')//show logout link already
                    
                    document.getElementById('logoutLi').classList.remove('d-none')//show logout link already
                    
                    console.log('Login simulated for standard user.');
                    
                    document.getElementById('roomresLi').classList.remove('d-none')//show room res link already
                    document.getElementById('dataentryli').classList.remove('d-none')//show data entry link already
                    
                    break;
                case 4:
                    console.log('Login simulated for admin user.');

                    document.getElementById('loginli').classList.add('d-none')//show logout link already
                    
                    document.getElementById('logoutLi').classList.remove('d-none')//show logout link already
                    
                    adminInputModal.show(); //on show chart loadheadcountchart()
                    //bgc.checkNavLinks(); //update nav links immediately


                    break;
            }//ENDSWITCH
        }, 300);

        //=========PUSHER NOTIFICATION
        bgc.broadCast(); //send test broadcast to trigger update for all clients (including self)
        

        //  //*********** SSE ************************ */
        // const eventSource = new EventSource(`${myIp}/bgc/notifications`);

        // eventSource.onopen = () => {
        //     console.log('SSE connection established');
        // };

        // eventSource.onmessage = (event) => {
        //     const data = JSON.parse(event.data);
        //     console.log('Received SSE:', data);
            
        //     // if (data.type === 'UPDATE_DETECTED') {
        //     //     alert("A new entry was updated!");
        //     //     // Refresh your data here
        //     // }
        // };

        // eventSource.onerror = (err) => {
        //     console.error('SSE error:', err);
        //     if(eventSource.readyState === EventSource.CLOSED) {
        //         console.log('SSE connection closed by server');
        //     }else if (eventSource.readyState === EventSource.CONNECTING) {
        //         console.log('SSE connection lost. Attempting to reconnect...');
        //     } else {
        //         console.log('SSE connection error. ReadyState:', eventSource.readyState);
        //     }//eif

        //     //eventSource.close();
        // };



        //create polling events
        // **** THIS  IS THE TOKEN PART ****
        /*
        let lastEventId = Number(localStorage.getItem('lastEventId') || 0);
        const token = localStorage.getItem('token');

        setInterval(async () => {
        const r = await fetch(`${myIp}/events?after=${lastEventId}`, {
        headers: { Authorization: `Bearer ${token}` }
        });
        const j = await r.json();
        (j.events || []).forEach(ev => { lastEventId = ev.id; console.log('EVENT', ev); });
        localStorage.setItem('lastEventId', lastEventId);
        }, 5000);
        */

    });

    /************ EVENT FOR LOGOUT  */
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('bgc_user');
        window.location.href = 'https://ccfbgc.org/';
    });

    //**** room reservation */
    const calendarModal = document.getElementById('calendarModal');
    calendarModal.addEventListener('show.bs.modal', () => {
        calendar.buildCurrentMonthCalendar(); // your calendar
        calendar.initTimeSelects(); // time select
        //calendar.getRooms(); // room select
    });

    //********* room reservation when changing rooms */
    document.getElementById('roomSelect').addEventListener('change', () => {
        calendar.updateTimeSelectsForRoom();
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

    if (adminInputModalElement) {
        adminInputModalElement.addEventListener('shown.bs.modal', function () {
            console.log('Admin Modal is fully open. Time to load chart data!');
        });
    }
        
});

