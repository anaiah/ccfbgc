let xgrid = null


export function initGrid() {
    const el = document.getElementById('attendance-grid');
    if (!el) {
        console.error('#attendance-grid not found');
        return null;
    }
 
    const monthColumns = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    .map(month => ({
        name: month,
        width: '50px',
        attributes:{ style: 'text-align: center;' },
        formatter: (cell, row) => {
            const val = Number(cell);
            const target = Number(row.cells[0].data); // row.cells[0] is "FY Target"

            // 1. If no data, show a light gray dash (makes the table easier to read)
            if (val === 0 || !val) {
                return gridjs.html('<div style="text-align: center; color:#cbd5e1; font-weight:300">-</div>');
            }

            // 2. Add color logic (Green if it hit the target, Orange if not)
            const color = val >= target ? '#059669' : '#e55e46';
            const weight = val >= target ? '700' : '500'; //supposd to be 'normal' but bold looks better for both cases

            // 3. Return the formatted HTML
            return gridjs.html(`
                <div style="color: ${color};font-size:0.95em; font-weight: ${weight}; text-align: center;">
                    ${val}
                    ${val >= target ?'<small>✓</small>' : '<small>✗</small>'}
                
                </div>
            `);
        }
    }));

    
    xgrid = new gridjs.Grid({
        
        columns:[

            { 
                name: "Ministry", 
                width: '200px',
                formatter: (cell) => { 
                    return gridjs.html(`
                    <span style="background: #f1f5f9; color: #1e293b; padding: 4px 10px; border-radius: 12px; font-size: 0.85em; font-weight: bold; border: 1px solid #e2e8f0;">
                        ${cell}
                    </span>
                `)}
            },
            { 
                name: "FY Target", 
                width: '100px',
                formatter: (cell) => { 
                    return gridjs.html(`
                    <span style="background: #f1f5f9; color: #64748b; padding: 4px 10px; border-radius: 12px; font-size: 0.85em; font-weight: bold; border: 1px solid #e2e8f0;">
                        ${cell}
                    </span>
                `)}
            },

            ...monthColumns //spreads the 12 month objects into the columns array
        ],

        data: [], // Make sure this is an empty array, not null
        //sort: true,
        resizable: false,
        //search: true,
        width: '100%',
        autoWidth: false,
        style:{
            table: {
                'min-width':'1200px',
                'font-size': '12px',
                //'white-space': 'nowrap' // Prevent text from wrapping in cells
            }
        },
        className: {
            //table: 'table table-bordered' // This makes it look like a Bootstrap table
        }
    }).render(document.getElementById("attendance-grid"));
    
    return xgrid;

}//end init grid

//load data to grid from the backend API
export async function loadGridData() {
    util.toggleButtonLoading("adminInputModalLabel", "Loading pls wait...", true);

    if((!xgrid)) {
        console.error("Grid not initialized. Call initGrid() first.");
        return;
    }

    try {
        const response = await fetch(`${myIp}/bgc/get-target-grid`);
        const result = await response.json();

        if (result.ok) {
            // result.data is already an array of arrays from our previous Node.js step
            ccfgrid.xgrid.updateConfig({
                data: result.data 
            }).forceRender();

            //render chart
            ccfgrid.renderPerformanceChart(result);

        }
    } catch (err) {
        console.error("Grid Load Error:", err);
    }
    util.toggleButtonLoading("adminInputModalLabel", null, false);

}

//==== for loading charts
// export function renderPerformanceChart(apiData) {
//     // 1. Get the "FY Target" (The Red Line) 
//     // We'll take the average target or the first one as the benchmark
//     const targetData = apiData.data.map(row => row[0]); // All targets
//     const avgTarget = targetData.reduce((a, b) => a + b, 0) / targetData.length;

//     // 2. Prepare the Series (Ministries as Bars)
//     const series = apiData.data.map(row => {
//         return {
//             name: row[1], // Ministry Name
//             type: 'column', // Bar
//             data: row.slice(2) // Jan - Dec values
//         };
//     });

//     // 3. Add the Target Line (The Red Line)
//     series.push({
//         name: 'FY Target Benchmark',
//         type: 'line', // Line
//         data: Array(12).fill(Math.round(avgTarget)) // Horizontal line across 12 months
//     });

//     const options = {
//         series: series,
//         chart: {
//             height: 250,
//             type: 'line', // Base type must be 'line' for mixed charts
//             stacked: false,
//             toolbar: { show: false },
//             parentHeightOffset: 0
//         },
//         grid:{
//             padding: {
//                 left: 0,
//                 right: 0,
//                 top: 0,
//                 bottom: 0
//             }   
//         },

//         stroke: {
//             width: [1, 1, 1, 1, 1, 1, 1, 3], // Thicker stroke for the last series (the Line)
//             curve: 'smooth'
//         },
//         colors: ['#008FFB', '#00E396', '#FEB019', '#775DD0', '#3F51B5', '#03A9F4', '#FF4560'], // Red is the last one
//         plotOptions: {
//             bar: { columnWidth: '50%' }
//         },
//         fill: {
//             opacity: [0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 1],
//         },
//         labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
//         markers: { size: 0 },
//         yaxis: {
//             title: { text: 'Headcount' },
//         },
//         tooltip: {
//             shared: true,
//             intersect: false,
//         },
//         legend: { position: 'top',fontSize: '12px', offsetY:0 },
//     };

//     const chart = new ApexCharts(document.querySelector("#ccfbgcchart"), options);
//     chart.render();
// }

//this is the new but with spike fy target instead of the average line
export function xrenderPerformanceChart(apiData) {
    const chartElement = document.querySelector("#ccfbgcchart");
    if (!chartElement) return;

    if (window.myChart) {
        window.myChart.destroy();
    }

    // Prepare the final series array
    const chartSeries = [];

    apiData.data.forEach(row => {
        const targetValue = Number(row[0]); // The 200 or 300
        const ministryName = row[1];       // The Name
        const monthlyData = row.slice(2).map(v => Number(v)); // Jan-Dec as Numbers

        // 1. ADD THE BAR (Actual Headcount)
        chartSeries.push({
            name: `${ministryName} (Actual)`,
            type: 'column',
            data: monthlyData
        });

        // 2. ADD THE LINE (The Spike)
        // If headcount > 0, show the Target value. Otherwise, show 0.
        const spikeData = monthlyData.map(val => {
            return val > 0 ? targetValue : 0;
        });

        chartSeries.push({
            name: `${ministryName} Target`,
            type: 'line',
            data: spikeData
        });
    });

    const options = {
        series: chartSeries,
        chart: {
            height: 250,
            type: 'line', // Base type for mixed charts
            toolbar: { show: false }
        },
        stroke: {
            width: [0, 3, 0, 3, 0, 3], // 0 for Bars (no border), 3 for Lines (the spike)
            curve: 'smooth'
        },
        colors: ['#008FFB', '#FF4560', '#00E396', '#775DD0', '#FEB019', '#3F51B5'], // Alternate Bar/Line colors
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        markers: {
            size: 4 // Adds dots to the line "spikes"
        },
        yaxis: {
            title: { text: 'Headcount' }
        },
        legend: { position: 'top' }
    };

    window.myChart = new ApexCharts(chartElement, options);
    window.myChart.render();
}

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
        '#03A9F4', // Sky Blue
        '#546E7A', // Slate Gray
        '#D4526E', // Pink
        '#13d8aa', // Teal
        '#A5978B'  // Brown/Tan
    ];

    apiData.data.forEach((row, index) => {

        const color =palette[index % palette.length]; // Cycle through the palette for each ministry

        const targetValue = Number(row[1]); // The 200 or 300
        const ministryName = row[0];       // The Ministry Name

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
        parentHeightOffset: 0
    },
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

    colors: ['#008FFB', '#008FFB', '#00E396', '#00E396'], 
    
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
        case 5:
        case 6:
        case 7:
        case 8:
            document.getElementById('loginli').classList.add('d-none')//hide login already
            document.getElementById('logoutLi').classList.remove('d-none')//show logout link already
            
            document.getElementById('roomresLi').classList.remove('d-none')//show room res link already
            document.getElementById('dataentryli').classList.remove('d-none')//show data entry link already     //owner
    }//endswitch
                
}

//======== Exported API ========
export const ccfgrid = {
     get xgrid() { return xgrid; },
     loadGridData,
     renderPerformanceChart,
     getlinks
}