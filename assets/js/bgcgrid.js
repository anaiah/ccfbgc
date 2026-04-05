let xgrid = null


export function initGrid() {
    const el = document.getElementById('attendance-grid');
    if (!el) {
        console.error('#attendance-grid not found');
        return null;
    }

   const xgrid = new gridjs.Grid({
    columns: ["FY Target", "Ministry", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    data: [], // Make sure this is an empty array, not null
    className: {
        table: 'table table-bordered' // This makes it look like a Bootstrap table
    }
}).render(document.getElementById("attendance-grid"));


}


//======== Exported API ========
export const ccfgrid = {
     get xgrid() { return xgrid; },
}