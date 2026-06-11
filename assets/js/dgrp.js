//document.addEventListener('DOMContentLoaded', function () {
    console.log("D-Groups module loaded successfully.");
    // 1. Store the complete fetched database records globally
    // 1. Initialize your Grid.js instance once globally
    document.getElementById("dgrp-grid").innerHTML = ""; // Clear any existing content

// Global Grid.js Initialization with all 3 requested features
const grid = new gridjs.Grid({
  columns: [
    {
        name: "Name",
        formatter: (cell, row) => {
        const leaderName = row.cells[0].data;
        const leaderEmail = row.cells[1].data;
        
        // Escape strings to prevent syntax breakages inside the onclick string
        const escapedName = leaderName.replace(/'/g, "\\'");
        const escapedEmail = leaderEmail.replace(/'/g, "\\'");

        return gridjs.html(`
            <div class="d-flex flex-column align-items-start gap-1">
            <span class="fw-bold">${leaderName}</span>
            <button type="button" 
                    class="btn btn-sm btn-outline-info py-0 px-2" 
                    style="font-size: 0.7rem; letter-spacing: 0.5px;"
                    onclick="openJoinModal('${escapedName}', '${escapedEmail}')">
                Email to Join
            </button>
            </div>
        `);
        }
    },
    {
        name: "Email",
        hidden: true // <-- THIS COMPLETELY HIDES THE COLUMN FROM THE UI [1]
    }, 
    { name: "Description" }, 
    { name: "Age Bracket" }, 
    { name: "Day" }, 
    { name: "Time" }, 
    { name: "Location" }

    ],
  data: [],
  sort: true,
  pagination: {
    limit: 5,
    summary: true,
    buttonsCount: 3
  },
  fixedHeader: true,
  height: '249px', 
  style: {
    container: { backgroundColor: '#212529', border: 'none', color: '#f8f9fa' },
    table: { background: '#212529', color: '#f8f9fa', borderCollapse: 'collapse' },
    th: { background: '#1A1D20', color: '#adb5bd', border: '1px solid #495057', padding: '12px 16px' },
    td: { background: '#212529', color: '#f8f9fa', border: '1px solid #373b3e', padding: '12px 16px' }
    // REMOVED internal footer styles to prevent overrides!
  },
  className: {
    table: 'table mb-0'
    // REMOVED custom paginationButton attributes that were breaking selectors!
  }
}).render(document.getElementById("dgrp-grid"));

// Native mouse interactions for dark-theme hovers
document.getElementById("dgrp-grid").addEventListener("mouseover", (e) => {
  const cell = e.target.closest(".gridjs-td");
  if (cell) {
    cell.style.backgroundColor = "#2c3034";
    cell.style.color = "#ffffff";
  }
});

document.getElementById("dgrp-grid").addEventListener("mouseout", (e) => {
  const cell = e.target.closest(".gridjs-td");
  if (cell) {
    cell.style.backgroundColor = "#212529";
    cell.style.color = "#f8f9fa";
  }
});

// Helper function to toggle a custom Bootstrap loading overlay
// Helper function to show/hide a full loading overlay inside the grid wrapper
function toggleLoading(isLoading) {
  const gridContainer = document.getElementById("dgrp-grid");
  
  if (isLoading) {
    // Check if an overlay is already active to prevent duplicates
    if (document.getElementById("grid-loading-overlay")) return;

    // Create a dark glass overlay container with a Bootstrap spinner and text
    const overlay = document.createElement("div");
    overlay.id = "grid-loading-overlay";
    overlay.className = "d-flex flex-column align-items-center justify-content-center position-absolute top-0 start-0 w-100 h-100";
    overlay.style.backgroundColor = "rgba(33, 37, 41, 0.75)"; // Matches your #212529 dark theme background
    overlay.style.zIndex = "1050"; // Places it over sticky headers
    
    overlay.innerHTML = `
      <div class="spinner-border text-info" role="status" style="width: 2.5rem; height: 2.5rem;"></div>
      <span class="text-white-50 mt-2 small text-uppercase tracking-wider" style="letter-spacing: 1px;">Loading D-Groups...</span>
    `;
    
    // Ensure the parent container can hold absolute positioning bounds
    gridContainer.style.position = "relative";
    gridContainer.appendChild(overlay);
  } else {
    // Safely strip away the loading layout once data arrives
    const overlay = document.getElementById("grid-loading-overlay");
    if (overlay) overlay.remove();
  }
}


// Main Core Fetch Function
function loadFilteredData() {

  
  const description = document.getElementById('xregDescription').value.trim() || "NA";
  const ageBracket  = document.getElementById('xregAgeBracket').value.trim()  || "NA";
  const day         = document.getElementById('xregDay').value.trim()         || "NA";
  const time        = document.getElementById('xregTime').value.trim()        || "NA";

  // 3. Show Loading Indicator right before fetching
  toggleLoading(true);

  const finalUrl = `${myIp}/bgc/getdgrp/${encodeURIComponent(description)}/${encodeURIComponent(ageBracket)}/${encodeURIComponent(day)}/${encodeURIComponent(time)}`;
  console.log("Fetching D-Group data with URL:", finalUrl);


  fetch(finalUrl)
    .then(res => res.json())
    .then(serverRows => {
      const formattedRows = serverRows.map(row => [
        row.full_name.toUpperCase(),
        row.email,
        row.group_description.toUpperCase(),
        row.age_bracket.toUpperCase(),
        row.meeting_day.toUpperCase(),
        row.meeting_time.toUpperCase(),
        row.meeting_place.toUpperCase()
      ]);
      
      // Clear data and apply fresh array references cleanly
      grid.updateConfig({ data: [...formattedRows] }).forceRender();
    })
    .catch(error => console.error("API Fetch Error:", error))
    .finally(() => {
      // Hide Loading Indicator when done (success or failure)
      toggleLoading(false);
    });
}

// Initial execution trigger on load
//loadFilteredData();

document.querySelectorAll('.search-filter').forEach(element => {
  element.addEventListener('change', loadFilteredData);
});

// 1. Function invoked by clicking the Grid.js inline cell button
function openJoinModal(leaderName, leaderEmail) {
  // Store target leader variables into the hidden modal forms
  document.getElementById('modalLeaderName').value = leaderName;
  document.getElementById('modalLeaderEmail').value = leaderEmail;

  // Launch the Bootstrap modal structure programmatically
  const joinModal = new bootstrap.Modal(document.getElementById('joinGroupModal'));
  joinModal.show();
}

// 2. Event interceptor handling form submission 
document.getElementById('joinGroupForm').addEventListener('submit', function(e) {
  e.preventDefault(); // Stop default web page reload behaviors

  // Gather target form details
  const leaderName = document.getElementById('modalLeaderName').value;
  const emailTo = document.getElementById('modalLeaderEmail').value;
  const emailFrom = document.getElementById('modalUserFromEmail').value;
  const name = document.getElementById('modalUserFromName').value;

  // Your requested API endpoint address layout pattern
  // encodeURIComponent treats path segment spaces/characters like '@' or ' ' cleanly
  const emailApiUrl = `${myIp}/bgc/emailer/${encodeURIComponent(emailTo)}/${encodeURIComponent(leaderName)}/${encodeURIComponent(emailFrom)}/${encodeURIComponent(name)}`;

  // Quick UI feedback context
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerText = "Sending...";

  fetch(emailApiUrl, {
    method: 'GET' // Change to 'POST' if your endpoint structure is defined via router.post()
  })
  .then(res => {
    if (!res.ok) throw new Error('Email delivery failed');
    return res.json();
  })
  .then(data => {
    alert("Request dispatched successfully to the D-Group leader!");
    util.speak(data.message);

    // Clear and conceal the modal container layout safely
    document.getElementById('joinGroupForm').reset();
    const modalElement = document.getElementById('joinGroupModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();
  })
  .catch(err => {
    console.error("Mailer Connection Error:", err);
    alert("Failed to send message. Please verify connection credentials.");
  })
  .finally(() => {
    // Re-enable form interactions
    submitBtn.disabled = false;
    submitBtn.innerText = "Send Request";
  });
});

//=====reset filter
// Attach click listener to your Reset Filters button element
document.getElementById('resetFiltersBtn').addEventListener('click', function() {
  // 1. Reset each dropdown back to the first empty option ""
  document.getElementById('xregDescription').value = "";
  document.getElementById('xregAgeBracket').value = "";
  document.getElementById('xregDay').value = "";
  document.getElementById('xregTime').value = "";

  // 2. Trigger the fetch function (it will automatically send "NA/NA/NA/NA" to your backend now)
  //loadFilteredData();
    // 1. Clear current table grid rows down to zero data immediately on filter change
  grid.updateConfig({ data: [] }).forceRender();
  
});

// Detect when the Join D-Group Modal closes completely
document.getElementById('filterDgroupModal').addEventListener('hidden.bs.modal', function () {
  console.log("modal closed")

  // 1. Reset each dropdown back to the first empty option ""
  document.getElementById('xregDescription').value = "";
  document.getElementById('xregAgeBracket').value = "";
  document.getElementById('xregDay').value = "";
  document.getElementById('xregTime').value = "";
  
  // 2. Clear out your input forms so it is clean for the next user interaction
  //document.getElementById('joinGroupForm').reset();

    // 1. Clear the grid array to zero data in the UI
  grid.updateConfig({ data: [] }).forceRender();
});
