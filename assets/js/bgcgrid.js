let xgrid = null


export function initGrid() {
    const el = document.getElementById('attendance-grid');
    if (!el) {
        console.error('#attendance-grid not found');
        return null;
    }
 
    xgrid = new gridjs.Grid({
        columns: ["FY Target", "Ministry", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        data: [], // Make sure this is an empty array, not null
        //sort: true,
        resizable: true,
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
            table: 'table table-bordered' // This makes it look like a Bootstrap table
        }
    }).render(document.getElementById("attendance-grid"));
    
    return xgrid;

}

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
    const colors = [];

    apiData.data.forEach((row, index) => {
        const targetValue = Number(row[0]); // The 200 or 300
        const ministryName = row[1];       // The Ministry Name
        const monthlyData = row.slice(2).map(v => Number(v));

        // 1. Add the BAR (Actuals)
        chartSeries.push({
            name: `${ministryName} Actual`,
            type: 'column',
            data: monthlyData
        });

        // 2. Add the FLAT LINE (The Target Benchmark)
        chartSeries.push({
            name: `${ministryName} Target`,
            type: 'line',
            data: Array(12).fill(targetValue) // Creates the flat line [200, 200, 200...]
        });
    });

    const options = {
        series: chartSeries,
        chart: { height: 250, type: 'line', toolbar: { show: false } },
        stroke: {
            width: [0, 3, 0, 3], // 0 for bars, 3 for lines
            dashArray: [0, 5, 0, 5] // Optional: Makes the target lines "dashed" for a pro look
        },
        colors: ['#008FFB', '#008FFB', '#00E396', '#00E396'], // Match Bar/Line colors by ministry
        // ... rest of your labels and legends ...
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