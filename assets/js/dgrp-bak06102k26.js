document.addEventListener('DOMContentLoaded', function () {
    console.log("D-Groups module loaded successfully.");

    document.getElementById('dgrp-grid').innerHTML = ''; // Clear any existing content
    
    new gridjs.Grid({
        columns: ["Name", "Email", "Phone Number"],
        data: [
          ["John", "john@example.com", "(353) 01 222 3333"],
          ["Mark", "mark@gmail.com", "(01) 22 888 4444"]
        ]
      }).render(document.getElementById("dgrp-grid"));
    
    
    // // 1. Mock Local Church Database Structure
    // const dgroupDatabase = [
    //     { leader: "Bro. Jun Santos", type: "Singles (All Men)", age: "21-30", day: "Tuesday", time: "7:00 PM", place: "CCF Main / Zoom" },
    //     { leader: "Sis. Grace Mara", type: "Singles (All Women)", age: "21-30", day: "Thursday", time: "7:30 PM", place: "Ortigas Coffee Shop" },
    //     { leader: "Pastor Alex Villareal", type: "Couples", age: "30-40", day: "Saturday", time: "4:00 PM", place: "BGC Corporate Room" },
    //     { leader: "Bro. Dave Mendoza", type: "Mix (Youth/Campus)", age: "15-20", day: "Friday", time: "4:00 PM", place: "Katipunan Hub / Gym" },
    //     { leader: "Sis. Karen Cruz", type: "Singles (All Women)", age: "40-above", day: "Monday", time: "10:00 AM", place: "Alabang Residence" },
    //     { leader: "Bro. Ryan Reyes", type: "Singles (Mix)", age: "21-30", day: "Wednesday", time: "7:00 PM", place: "Makati Office Space" },
    //     { leader: "Bro. Manny Gomez", type: "Couples", age: "40-above", day: "Saturday", time: "6:00 PM", place: "Pasig Community Center" }
    // ];

    // // 2. Select HTML Document Nodes
    // const tableBody = document.getElementById('dgroupTableBody');
    // const filterSelectors = document.querySelectorAll('.search-filter');
    // const resetBtn = document.getElementById('resetFiltersBtn');

    // // 3. Render Database Objects Directly Into Grid UI Table
    // function renderTableRows(filteredData) {
    //     tableBody.innerHTML = ''; // Wipe out preceding items

    //     if (filteredData.length === 0) {
    //         tableBody.innerHTML = `
    //             <tr>
    //                 <td colspan="4" class="text-center py-4 text-white-50 italic fs-6">
    //                     No active D-Groups match your exact layout filters. Try expanding your search options.
    //                 </td>
    //             </tr>`;
    //         return;
    //     }

    //     filteredData.forEach(group => {
    //         const rowHtml = `
    //             <tr>
    //                 <td class="py-3 font-weight-bold text-warning">${group.leader}</td>
    //                 <td class="py-3 text-white">${group.day}</td>
    //                 <td class="py-3 text-white-50">${group.time}</td>
    //                 <td class="py-3"><span class="badge bg-secondary px-2 py-1 text-light">${group.place}</span></td>
    //             </tr>`;
    //         tableBody.insertAdjacentHTML('beforeend', rowHtml);
    //     });
    // }

    // // 4. Multi-layered Dropdown Comparison Logic
    // function executeFilterQuery() {
    //     const typeSelection = document.getElementById('regDescription').value;
    //     const ageSelection = document.getElementById('regAgeBracket').value;
    //     const daySelection = document.getElementById('regDay').value;
    //     const timeSelection = document.getElementById('regTime').value;

    //     const filteredResults = dgroupDatabase.filter(group => {
    //         const matchesType = !typeSelection || group.type === typeSelection;
    //         const matchesAge = !ageSelection || group.age === ageSelection;
    //         const matchesDay = !daySelection || group.day === daySelection;
    //         const matchesTime = !timeSelection || group.time === timeSelection;

    //         return matchesType && matchesAge && matchesDay && matchesTime;
    //     });

    //     renderTableRows(filteredResults);
    // }

    // // 5. Register Event Monitors Across Interface Control Selectors
    // filterSelectors.forEach(selector => {
    //     selector.addEventListener('change', executeFilterQuery);
    // });

    // // 6. Reset Filters Interface Mechanism
    // resetBtn.addEventListener('click', function() {
    //     filterSelectors.forEach(selector => selector.value = "");
    //     renderTableRows(dgroupDatabase); // Restore initial list
    // });

    // // Run baseline execution loop on startup load
    // renderTableRows(dgroupDatabase);
});
