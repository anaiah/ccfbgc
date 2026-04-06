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

//get links for the user to show
export const getlinks = (grp) => {
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
     getlinks
}