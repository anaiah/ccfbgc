let xgrid = null


export function initGrid() {
    const el = document.getElementById('attendance-grid');
    if (!el) {
        console.error('#attendance-grid not found');
        return null;
    }

    xgrid = new gridjs.Grid({
        columns: [
            { name: 'Ministry', width: '150px' }, 
        ]
    }).render(el);

}


//======== Exported API ========
export const ccfgrid = {
     get xgrid() { return xgrid; },
}