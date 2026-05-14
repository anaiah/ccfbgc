// Change this to an object to hold multiple instances
//let grids = {}; 
window.bgcGrids = window.bgcGrids || {}; 

export function initGrid(title, divgrid, segment) {

    const el = document.getElementById(divgrid);

    if (!el) {
        console.error('#divgrid not found');
        return null;
    }
 
    // const monthColumns = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    // .map(month => ({
    //     name: month,
    //     width: '50px',
    //     attributes:{ style: 'text-align: center;' },
    //     formatter: (cell, row) => {
    //         const val = Number(cell);
    //         const target = Number(row.cells[3].data); // row.cells[0] is "FY Target"

    //         // 1. If no data, show a light gray dash (makes the table easier to read)
    //         if (val === 0 || !val) {
    //             return gridjs.html('<div style="text-align: center; color:#cbd5e1; font-weight:300">-</div>');
    //         }

    //         // 2. Add color logic (Green if it hit the target, Orange if not)
    //         const color = val >= target ? '#059669' : '#e55e46';
    //         const weight = val >= target ? '700' : '500'; //supposd to be 'normal' but bold looks better for both cases

    //         // 3. Return the formatted HTML
    //         return gridjs.html(`
    //             <div style="color: ${color};font-size:0.95em; font-weight: ${weight}; text-align: center;">
    //                 ${val}
    //                 '}
                
    //             </div>
    //         `);
    //     }
    // }));

const monthColumns = [ 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
.map((month, index) => ({
    name: month,
    id: (index + 5).toString(), // Jan becomes id '3', Feb becomes id '4', etc.
    width: '80px',
    formatter: (cell, row) => {
        const val = Number(cell); 
        const target = row.cells && row.cells[2] ? Number(row.cells[2].data) : 2; // Target is now col index 1 in the GRID

        if (val === 0 || isNaN(val)) return gridjs.html('<div style="color:#cbd5e1;">-</div>');
        
        const isHit = val >= target;
        return gridjs.html(`
            <div style="color: ${isHit ? '#059669' : '#e55e46'}; font-weight: bold; text-align: center;">
                ${val} ${isHit ? '✓' : '✗'}
            </div>
        `);
    }
}));


    const instance = new gridjs.Grid({
        
        columns:[

            { 
                id:'1',
                name: `${title}`, 
                width: '180px',
                formatter: (cell,row) => {
                    // cell = value of the first item in the array
                    // row.cells[1].data = value of the second item (index 1) in the array
                    const displayValue = row.cells[1].data;  
                    
                    return gridjs.html(`
                    <span style="background: #f1f5f9; color: #1e293b; padding: 4px 10px; border-radius: 12px; font-size: 0.85em; font-weight: bold; border: 1px solid #e2e8f0;">
                        ${displayValue}
                    </span>
                `)}
            },
            { 
                id:'2',
                name: "FY Target", 
                width: '130px',
                formatter: (cell,row) => {
                    // cell = value of the first item in the array
                    // row.cells[1].data = value of the second item (index 1) in the array
                    const displayValue = row.cells[2].data;  
                    
                    return gridjs.html(`
                    <span style="background: #f1f5f9; color: #1e293b; padding: 4px 10px; border-radius: 12px; font-size: 0.85em; font-weight: bold; border: 1px solid #e2e8f0;">
                        ${displayValue}
                    </span>
                `)}
            },

            ...monthColumns //spreads the 12 month objects into the columns array
        ],

        data: [], // Make sure this is an empty array, not null
        //sort: true,
        resizable: false,
        //search: true,
        width: 'auto',       // Change from 100%
        autoWidth: false,
        style:{
            table: {
                'table-layout': 'fixed', // Ensures column widths are strictly followed
                    'min-width':'1200px',
                'font-size': '12px',
                'table-layout':'fixed',
                'white-space': 'nowrap' // Prevent text from wrapping in cells
            }
        },
        className: {
            //table: 'table table-bordered' // This makes it look like a Bootstrap table
        }
    }).render(el);
    
    // ATTACH THE GRID DIRECTLY TO THE DIV
    // This makes the grid a "property" of the HTML element
    el.gridInstance = instance;
    
    console.log(`Grid attached to #${divgrid}`);    
    return instance ;


}//end init grid


//load data to grid from the backend API
// bgcgrid.js

export async function loadGridData(title, divgrid, segment) {
    const container = document.getElementById(divgrid);
    if (!container) return;

    
    // Show a small loader while fetching
    container.innerHTML = `<div class="text-center p-5"><div class="spinner-border text-primary"></div><p>Loading ${title}...</p></div>`;

    try {
        const response = await fetch(`${myIp}/bgc/get-target-grid/${segment}`);
        const result = await response.json();

        if (result.ok && result.data) {
            // Inside loadGridData logic...
            let html = `
                <div class="custom-table-wrapper">
                    <table class="wow-table">
                        <thead>
                            <tr>
                                <th class="sticky-col">${title}</th>
                                <th class="target-cell">FY Target</th>
                                <th class="month-header">Jan</th><th class="month-header">Feb</th>
                                <th class="month-header">Mar</th><th class="month-header">Apr</th>
                                <th class="month-header">May</th><th class="month-header">Jun</th>
                                <th class="month-header">Jul</th><th class="month-header">Aug</th>
                                <th class="month-header">Sep</th><th class="month-header">Oct</th>
                                <th class="month-header">Nov</th><th class="month-header">Dec</th>
                                <th class="total-header">AVG</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            result.data.forEach(row => {
                const label = row[1];
                const target = Number(row[2]);

                let rowSum = 0;
                let monthsWithData = 0;

                html += `<tr>`;
                html += `<td class="sticky-col label-cell">${label}</td>`;
                html += `<td class="target-cell">${target.toLocaleString()}</td>`;

                // Month Loop (Index 3 to 14)
                for (let i = 3; i <= 14; i++) {
                    const val = Number(row[i]) || 0;

                    if (val === 0) {
                        html += `<td class="empty-cell">-</td>`;
                    } else {
                        // Track sum and count for the Average
                        rowSum += val;
                        monthsWithData++;

                        html += `
                            <td class="month-cell">
                                <div class="val-container">
                                    ${val.toLocaleString()}
                                </div>
                            </td>`;
                    }
                }

                // --- Calculate Average ---
                // Only divide by months that actually have data
                const average = monthsWithData > 0 ? Math.round(rowSum / monthsWithData) : 0;
                
                // Compare Average to the Target
                const isHit = average >= target;
                const avgColor = isHit ? '#059669' : '#e11d48'; // Green if hit, Red if miss

                // Add the Average Column at the end
                html += `
                    <td class="total-cell" style="color: ${avgColor};">
                        ${average.toLocaleString()}
                        <div style="font-size: 8px; color: #94a3b8; font-weight: 400; margin-top: 2px;">&nbsp;</div>
                    </td>`;
                    
                html += `</tr>`;
            });

            html += `</tbody></table></div>`;
            container.innerHTML = html;

            // Optional chart logic
            if (segment === 'kpi' && typeof renderPerformanceChart === 'function') {
                ///// TAKE OUT CHART FOR NOW renderPerformanceChart(result);
            }
        }
    } catch (err) {
        console.error("Table Build Error:", err);
        container.innerHTML = `<div class="alert alert-danger">Failed to load ${title} data.</div>`;
    }
}

//recreat loadgriddata
const handlePush = () => {

    const aTitle = ['KPIs', 'MINISTRY EVENTS', 'MISSIONAL'];
    const aDiv = ['kpi-grid', 'ministry-grid', 'missional-grid'];
    const aSearch = ['kpi', 'ministry', 'mission'];

    async function setupGrid() {
            
        console.log("Starting setupGrids...");

        for (let i = 0; i < aSearch.length; i++) {
            const segment = aSearch[i];
            const title = aTitle[i];
            const divId = aDiv[i];

            console.log(`Loop ${i}: Initializing ${segment}`);

            // 1. Initialize
            //initGrid(title, divId, segment); 
            // 2. Tiny delay to ensure DOM and object are ready
            await new Promise(resolve => setTimeout(resolve, 50));

            // 3. Load
            await loadGridData(title, divId, segment); 
        }

        console.log("All grids loaded successfully.");
    }

    setupGrid();

}


// export async function loadGridData(segment) {
//     util.toggleButtonLoading("adminInputModalLabel", "Loading pls wait...", true);

//      console.log("DEBUG: loadGridData received segment:", segment);

//     if (!segment) {
//         console.error("DEBUG: segment is UNDEFINED in loadGridData call");
//         return;
//     }

//     const divMap = {
//         'kpi': 'kpi-grid',
//         'ministry': 'ministry-grid',
//         'mission': 'missional-grid' // Ensure this matches your HTML ID exactly
//     };

//     const divId = divMap[segment];
//     console.log("DEBUG: looking for divId:", divId);

//     const el = document.getElementById(divId);
//     const targetGrid = el ? el.gridInstance : null;

//     if (!targetGrid) {
//         console.error(`DEBUG: Grid instance not found on element #${divId}`);
//         return;
//     }

//     try {
//         const response = await fetch(`${myIp}/bgc/get-target-grid/${segment}`);
//         const result = await response.json();

//         if (result.ok) {

//             console.log( '*** MY DATA *** ', result.data )

//             // Update the specific grid instance found in our object
//             targetGrid.updateConfig({
//                 data: result.data 
//             }).forceRender();

//             if(segment === 'kpi'){
//                 ccfgrid.renderPerformanceChart(result);
//             }
//         }//eif

//     } catch (err) {
//         console.error("Grid Load Error:", err);
//     }
//     util.toggleButtonLoading("adminInputModalLabel", null, false);

// }

//==== for loading charts
//tis is also new but a horizontal flat line for target instead of the spike
export function renderPerformanceChart(apiData) {
    const chartElement = document.querySelector("#ccfbgcchart");
    if (!chartElement) return;

    if (window.myChart) {
        window.myChart.destroy();
    }
    const chartSeries = [];
    const chartColors = [];

    // 1. Define your "Church Brand" palette (Professional & Clear)
    const palette = [
        '#008FFB', // Blue
        '#00E396', // Green
        '#FEB019', // Orange
        '#775DD0', // Purple
        '#FF4560', // Red
        '#546E7A', // Slate Gray
        '#D4526E', // Pink
        '#A5978B'  // Brown/Tan
    ];

    apiData.data.forEach((row, index) => {

        const color =palette[index % palette.length]; // Cycle through the palette for each ministry

        const targetValue = Number(row[1]); // The 200 or 300
        const ministryName = row[1];       // The Ministry Name

        const monthlyData = row.slice(2).map(v => {
            const n = Number(v);
            return isNaN(n) ? 0 : n      // 1. Add the BAR (Actuals)
        });

        chartSeries.push({
            name: `${ministryName} Actual`,
            type: 'column',
            data: monthlyData
        });

        chartColors.push(color); // Bar color

        // 2. Add the FLAT LINE (The Target Benchmark)
        chartSeries.push({
            name: `${ministryName} Target`,
            type: 'line',
            data: Array(12).fill(targetValue) // Creates the flat line [200, 200, 200...]
        });
        
        chartColors.push(color); // Line color matches the Bar

    });

    const options = {
        series: chartSeries,
        colors: chartColors, // Use the defined colors for both bars and lines
        chart: {
            height: 250,
            type: 'line',
            toolbar: { show: false },
            zoom:{ enabled: false },
            redrawOnParentResize: false,
            redrawOnWindowResize: false,
        },
        tooltip:{ enabled: false }, // Disable tooltips for a cleaner look

         // --- ADD THIS BLOCK ---
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    height: 250
                },
                xaxis: {
                    labels: {
                        rotate: -45, // Rotates Jan-Dec so they don't overlap
                        style: { fontSize: '10px' }
                    }
                },
                legend: {
                    position: 'bottom', // Moves legend to bottom to save side-room
                    fontSize: '11px'
                }
            }
        }],

        // 1. ADD THE MONTH NAMES HERE
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        
        // stroke: {
        //     width: [0, 3, 0, 3], // 0 for bars, 3 for lines
        //     curve: 'smooth',
        //     dashArray: [0, 5, 0, 5] // 0 for solid bars, 5 for dashed target lines
        // },
        
        // 2. Align colors so Bar and Line for the same ministry match
        
        stroke: {
            // This creates: [0, 3, 0, 3, 0, 3...] 
            // 0 for every Bar, 3 for every Line
            width: chartSeries.map((s, i) => (i % 2 === 0 ? 0 : 3)),
            curve: 'smooth',
            // This creates: [0, 5, 0, 5...] 
            // Solid for every Bar, Dashed (5) for every Target Line
            dashArray: chartSeries.map((s, i) => (i % 2 === 0 ? 0 : 5))
        },
        
        xaxis: {
            type: 'category',
            labels: {
                style: { fontSize: '12px' }
            }
        },
        yaxis: {
            title: { text: 'Headcount' },
            labels: {
                formatter: (val) => Math.floor(val) // Removes decimals from Y axis
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'center'
        },
        grid: {
            padding: { left: 10, right: 10 }
        }
    };

    if(window.myChart) {
        try{
            window.myChart.destroy();
            window.myChart = null; // Clear the reference to the old chart
        }catch(err){
            console.error("Error updating chart:", err);
        }
    }

    window.myChart = new ApexCharts(chartElement, options);
    window.myChart.render();
}

//======================get links for the user to show
export const getlinks = (grp) => {
    console.log('Getting links for group:', grp);

    switch(grp) {
        case 4: //bossing   
            document.getElementById('loginli').classList.add('d-none')//hide login already
            document.getElementById('logoutLi').classList.remove('d-none')//show logout link already
            
            document.getElementById('gridchartli').classList.remove('d-none')//show grid chart
            document.getElementById('kpili').classList.remove('d-none')//show kpi data entry
            
            break;
        case 1:
        case 2:
        //case 5:
        case 6:
        case 7:
        case 8:
        case 9:
            document.getElementById('loginli').classList.add('d-none')//hide login already
            document.getElementById('logoutLi').classList.remove('d-none')//show logout link already
            
            document.getElementById('roomresLi').classList.remove('d-none')//show room res link already
            document.getElementById('dataentryli').classList.remove('d-none')//show data entry link already     //owner
            break;

        case 5://dgrp leaader
            document.getElementById('loginli').classList.add('d-none')//hide login already
            document.getElementById('logoutLi').classList.remove('d-none')//show logout link already
            //give roomres
            document.getElementById('roomresLi').classList.remove('d-none')//show room res link already
            
            break;



    }//endswitch
                
}

//==================== SAVE TARGET=====================//
export async function saveTarget(formData) {
    try {
        const response = await fetch(`${myIp}/bgc/save-target`, {   
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!result.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Server error' }));
            throw new Error(`HTTP error! Status: ${response.status} - ${errorData.message || response.statusText}`);
        }

        if(result.ok){

            util.Toasted('Data Saved Successfully',2000,false)
            util.speak('data saved successfully!')

            /// DONT HIDE MUNA util.hideModal('targetModal',100)

            ccfgrid.formReset('targetForm')

            // const adminModalEl = document.getElementById('adminInputModal');
            // const adminModal = bootstrap.Modal.getInstance(adminModalEl) || new bootstrap.Modal(adminModalEl);
            // adminModal.show();  
            
            ////  DONT LOAD MUNA ccfgrid.loadGridData() //refresh grid data after saving new target


            
        }
        //return result;
    } catch (error) {
        console.error('Error saving target:', error);
        throw error;
    }
}

const formReset = ( frm ) => {
    const form = document.getElementById(frm ); // assuming this is the form

    // 1. Reset standard fields
    form.reset();

    // 2. Remove Bootstrap validation states
    form.querySelectorAll('.is-invalid, .is-valid').forEach(el => {
        el.classList.remove('is-invalid', 'is-valid');
    });

    // 3. Clear hidden inputs (reset() ignores these)
    form.querySelectorAll('input[type="hidden"]').forEach(el => {
        el.value = '';
    });

    // 4. Manually trigger change for selects (if using select2 or similar plugins)
    form.querySelectorAll('select').forEach(sel => {
        sel.dispatchEvent(new Event('change'));
    });

}

const downloadReport = async () => {
    try {
        const response = await fetch(`${myIp}/bgc/downloadExcel`);
        
        if (!response.ok) throw new Error('Download failed');

        const blob = await response.blob();

        // --- Generate Date String MMDDYYYY ---
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const dd = String(now.getDate()).padStart(2, '0');
        const yyyy = now.getFullYear();
        const dateString = `${mm}${dd}${yyyy}`;

        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        
        a.download = `Ministry_Report_${dateString}.xlsx`;

        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        a.remove();
    } catch (err) {
        console.error("Error downloading excel:", err);
        alert("Could not download the report.");
    }
}

//======== Exported API ========
export const ccfgrid = {
     loadGridData: (title,div,segment) => loadGridData(title,div,segment), // Explicitly call the local function
     renderPerformanceChart,
     getlinks,
     saveTarget,
     formReset,
     handlePush
}

//========add another listener===========//
document.addEventListener('click', (event) => {
    switch (event.target.id) {
        case 'export-btn':
            downloadReport()
            util.speak('DOWNLOADING REPORT!!!')
            console.log('Exporting data...');
            break;
            
        case 'cancelAction':
            console.log('Action cancelled.');
            break;
        
        case 'dgroupActionBtn':
            
            const dgroupActionBtn = document.getElementById("dgroupActionBtn");
            const nextBtn = document.getElementById("nextBtn");
            const prevBtn = document.getElementById("prevBtn");
            const progress = document.getElementById("formProgress");
            
            let currentStep = 1;
            const totalSteps = 4; // Expanded step footprint
            const myModal = new bootstrap.Modal(document.getElementById('dgroupModal'));

            // 1. Initial Launch Evaluation Check
            
                const isRegistered = localStorage.getItem("dg_registered");
                
                if (isRegistered === "true") {
                    const modalBody = document.querySelector("#dgroupModal .modal-body");
                    const modalFooter = document.querySelector("#dgroupModal .modal-footer");
                    document.getElementById("modalTitle").innerText = "💛 My D-Group Hub";
                    
                    // Cleanly clear out wizard decorations for registered leaders
                    if(document.getElementById("formProgress")) {
                        document.getElementById("formProgress").parentElement.remove();
                    }
                    
                    modalBody.innerHTML = `
                        <div class="text-center py-3">
                            <h5>Welcome Back, ${localStorage.getItem("dg_name") || 'Leader'}!</h5>
                            <p class="text-white-50 small">Your catalog entry status is active in the CCF BGC database.</p>
                            <div class="list-group mt-4 bg-transparent border-0">
                                <button type="button" class="list-group-item list-group-item-action bg-dark text-white border-secondary mb-2 text-start">📖 Access Weekly Study Material</button>
                                <button type="button" class="list-group-item list-group-item-action bg-dark text-white border-secondary mb-2 text-start">🙏 Submit Ministry Request</button>
                            </div>
                        </div>`;
                    modalFooter.innerHTML = `<button type="button" class="btn btn-secondary" style="border-radius: 50px;" data-bs-dismiss="modal">Close</button>`;
                }
                myModal.show();
            

            // 2. Wizard Stepping Logic Navigation 
            nextBtn.addEventListener("click", () => {
                // Enforce input tracking validations inside the visible element step context
                const inputs = document.getElementById(`step${currentStep}`).querySelectorAll("input, select");
                let stepValid = true;

                inputs.forEach(input => {
                    if(!input.checkValidity()) {
                        input.reportValidity();
                        stepValid = false;
                    }
                });

                if (!stepValid) return;

                if (currentStep < totalSteps) {
                    document.getElementById(`step${currentStep}`).classList.add("d-none");
                    currentStep++;
                    document.getElementById(`step${currentStep}`).classList.remove("d-none");
                    updateWizardState();
                } else {
                    // 1. Prevent multiple rapid clicks by disabling the button immediately
                    nextBtn.disabled = true;
                    nextBtn.innerText = "Processing...";
                    
                    // Step 4 final action confirmed execution
                    submitRegistrationPayload();
                    return;

                }
            });

            prevBtn.addEventListener("click", () => {
                if (currentStep > 1) {
                    document.getElementById(`step${currentStep}`).classList.add("d-none");
                    currentStep--;
                    document.getElementById(`step${currentStep}`).classList.remove("d-none");
                    updateWizardState();
                }
            });

            function updateWizardState() {
                // Track visual linear width state calculations
                progress.style.width = `${(currentStep / totalSteps) * 100}%`;
                
                // Toggle backward structural element visibility bounds
                prevBtn.disabled = currentStep === 1;
                prevBtn.classList.toggle("opacity-50", currentStep === 1);
                
                // Dynamically shift labels for data step confirmation
                if (currentStep === totalSteps) {
                    nextBtn.innerText = "I Understand & Submit";
                    nextBtn.classList.replace("btn-warning", "btn-success");
                } else {
                    nextBtn.innerText = "Continue";
                    nextBtn.classList.replace("btn-success", "btn-warning");
                }
            }

            // 3. API Database Payload Route Dispatcher
            function submitRegistrationPayload() {
                console.log('Submitting form...')

                const payload = {
                    name: document.getElementById("regFullName").value,
                    email: document.getElementById("regEmail").value,
                    role: document.getElementById("regRole").value,
                    description: document.getElementById("regDescription").value,
                    ageBracket: document.getElementById("regAgeBracket").value,
                    day: document.getElementById("regDay").value,
                    time: document.getElementById("regTime").value,
                    place: document.getElementById("regPlace").value
                };

                // Fire transaction call to your Express server API node
                fetch(`${myIp}/bgc/register-leader`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                .then(res => {
                    if (!res.ok) throw new Error("Database validation error cluster");
                    return res.json();
                })
                .then(data => {
                    // Save local registration tokens to prevent re-prompting
                    localStorage.setItem("dg_registered", "true");
                    localStorage.setItem("dg_name", payload.name);
                    
                    util.Toasted(`🎉 You are Registered!, ${payload.name}.`,3000,false);
                    util.speak(`You are Registered! God Bless you.., ${payload.name}.` )
                    //window.location.reload();
                    util.hideModal('dgroupModal')
                })
                .catch(err => {
                    console.error(err);
                    alert("Network connection error dispatching data down to the Express database endpoint.");
                });
            }            

            //myModal.show();

        break;

            
        default:
            // Do nothing if the clicked element doesn't match an ID
            break;
    }
});