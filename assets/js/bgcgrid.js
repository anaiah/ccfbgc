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
        }
    } catch (err) {
        console.error("Grid Load Error:", err);
    }

}


//======== Exported API ========
export const ccfgrid = {
     get xgrid() { return xgrid; },
     loadGridData
}