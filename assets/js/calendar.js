const calendar = {
   
    buildTimeOptionsArray: () => {
        const startHour = 10;  // 9 AM
        const endHour   = 21; // 5 PM

        for (let h = startHour; h <= endHour; h++) {
            const d = new Date();
            d.setHours(h, 0, 0, 0);
            const label = d.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
            });
            bgc.TIME_OPTIONS.push({ hour: h, label });
        }//endfor

    },

    // // ==== MAIN write calendar in modals
    buildCurrentMonthCalendar : () => {

        //build time options first
        calendar.buildTimeOptionsArray()

        const container = document.getElementById('calendarContainer');
        container.innerHTML = '';

        const now = new Date();
        const todayY = now.getFullYear();
        const todayM = now.getMonth();
        const todayD = now.getDate();

        const year = now.getFullYear();
        const month = now.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const monthName = firstDay.toLocaleString('default', { month: 'long' });
        const daysInMonth = lastDay.getDate();

        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const title = document.createElement('h4');
        title.className = 'text-center mb-3';
        title.textContent = `${monthName} ${year}`;
        container.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'calendar-grid';

        weekdays.forEach(d => {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell header';
            cell.textContent = d;
            grid.appendChild(cell);
        });

        const startWeekday = firstDay.getDay();
        for (let i = 0; i < startWeekday; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-cell empty';
            grid.appendChild(emptyCell);
        }

        const todayDate = now.getDate();

        for (let d = 1; d <= daysInMonth; d++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell border';
            
            // Check if the current loop date is exactly today
            const isToday = year === todayY && month === todayM && d === todayD;

            // CHANGE: Treat both past days AND today as disabled/invalid for bookings
            const isPastOrToday = (year === todayY && month === todayM && d < todayD) || isToday;

            // Keep visual 'today' badge if you still want users to see which day is today
            if (isToday) cell.classList.add('today'); 
            
            // Use your updated condition here to disable the cells visually
            if (isPastOrToday) cell.classList.add('disabled-day');

            cell.textContent = d;

            // CHANGE: Only attach the click handler if the day is strictly tomorrow or later
            if (!isPastOrToday) {
                cell.addEventListener('click', () => {
                    const selectedDate = new Date(year, month, d);
                    calendar.onDayClick(selectedDate, cell);
                });
            }

            grid.appendChild(cell);
        }

        container.appendChild(grid);
    },

    selectedDate:null,

    formatDateLocalYYYYMMDD : (d) => {
    const year  = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // 01–12
    const day   = String(d.getDate()).padStart(2, '0');      // 01–31
    return `${year}-${month}-${day}`;
    },

    // when a calendar day is clicked:
    onDayClick : (dateObj, cellEl) => {
        calendar.selectedDate = dateObj;

        // Highlight selected cell
        document.querySelectorAll('.calendar-cell.selected-day')
            .forEach(c => c.classList.remove('selected-day'));
        if (cellEl) cellEl.classList.add('selected-day');

        const section = document.getElementById('dateTimeSection');
        const textRaw = document.getElementById('selectedDateRaw');
        const textPretty = document.getElementById('selectedDateTextPretty');

        if (!section || !textRaw || !textPretty) return;

        const pretty = dateObj.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const raw = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        textPretty.textContent = pretty;   
        textRaw.textContent = raw;         

        // FIX: Ensure the section unhides cleanly by explicitly forcing bootstrap displays
        section.classList.remove('d-none');
        section.style.display = 'block'; // <-- ADD THIS LINE to bypass any hidden CSS rules!

        const dateStr = calendar.formatDateLocalYYYYMMDD(dateObj);
        calendar.getRooms(dateStr);
    },

    //=========this controls what's inside time select
    fillSelect : (select, minHour = 9, blockedHours = new Set()) => {
        select.innerHTML = '';

        bgc.TIME_OPTIONS.forEach(opt => {
            if (opt.hour >= minHour) {
            const o = document.createElement('option');
            o.value = String(opt.hour);     // ensure value is a string
            o.textContent = opt.label;

            const disabled = blockedHours.has(opt.hour);
            if (disabled) o.disabled = true;

            //TURN OFF CHECKING IF BLOCKED OR NOT
            // console.log(
            //     'option',
            //     opt.hour,
            //     opt.label,
            //     'blocked?', disabled
            // );

            select.appendChild(o);
            }
        });
    },

   
    // this one update the select time and room also
    updateTimeSelectsForRoom : () => {
        //
        console.log('calling updateTimeSelctsForRoom()')
        const roomSel = document.getElementById('roomSelect');
        if (!roomSel) return;

        const selectedId = roomSel.value; // string "1"
        console.log('waht is room value id ', selectedId, calendar.roomsData)
        
        // get ALL entries for that room id
        const roomEntries = calendar.roomsData.filter(r => String(r.id) === selectedId);
        console.log('room entries for', selectedId, roomEntries);

        // merge all reservations from those entries
        const reservations = roomEntries.flatMap(r => r.reservations || []);
        console.log('ALL reservations for room', selectedId, reservations);

        const blockedHours = new Set();

        reservations.forEach(resv => {
        const fromStr = resv.date_from;
        const toStr   = resv.date_to;

        const fromH = parseInt(fromStr.substring(11, 13), 10);
        const toH   = parseInt(toStr.substring(11, 13), 10);

        console.log('resv range', fromStr, toStr, '=>', fromH, 'to', toH);

        for (let h = fromH; h < toH; h++) {
            blockedHours.add(h);
        }
        });


        // replace this one
        // const room = calendar.roomsData.find(r => String(r.id) === selectedId);
        // console.log('selected room', selectedId, room);

        // const reservations = room ? room.reservations || [] : [];
        // console.log('reservations for room', selectedId, reservations);

        // const blockedHours = new Set();       
        
        // reservations.forEach(resv => {
        //     // Expect 'YYYY-MM-DD HH:MM:SS'
        //     const fromStr = resv.date_from;
        //     const toStr   = resv.date_to;

        //     const fromH = parseInt(fromStr.substring(11, 13), 10); // '09' -> 9
        //     const toH   = parseInt(toStr.substring(11, 13), 10);   // '10' -> 10

        //     console.log('resv range', fromStr, toStr, '=>', fromH, 'to', toH);

        //     for (let h = fromH; h < toH; h++) {
        //         blockedHours.add(h);
        //     }
        // });

        console.log('blockedHours =', Array.from(blockedHours));

        calendar.initTimeSelects(blockedHours);

        const statusBadge = document.getElementById('roomStatusBadge');
        if (statusBadge) {
            if (reservations.length === 0) {
                statusBadge.textContent = 'No reservations yet';
                statusBadge.className = 'badge bg-success-subtle text-success';
            } else {
                statusBadge.textContent = `${reservations.length} reservation(s)`;
                statusBadge.className = 'badge bg-warning-subtle text-warning';
            }
        }
    },

     // CALleD FROM updatetimeselectsforRoom()
     // this also controls the time in select
    initTimeSelects:(blockedHours = new Set()) => {
        const fromSel = document.getElementById('timeFrom');
        const toSel   = document.getElementById('timeTo');
        if (!fromSel || !toSel) return;

        // fill "From" with disabled taken hours
        calendar.fillSelect(fromSel, 9, blockedHours);

        // pick first non-blocked as default from
        const firstAvailable = bgc.TIME_OPTIONS.find(o => !blockedHours.has(o.hour));
        if (!firstAvailable) {
            fromSel.innerHTML = '<option>No free times</option>';
            toSel.innerHTML = '';
            return;
        }

        fromSel.value = firstAvailable.hour;

        // 2) TO: we do NOT disable options; we stop at first blocked hour
        const fillTo = (fromHour) => {
            toSel.innerHTML = '';

            // find the earliest blocked hour AFTER fromHour
            let stopHour = null;
            bgc.TIME_OPTIONS.forEach(opt => {
            if (opt.hour > fromHour && blockedHours.has(opt.hour) && stopHour === null) {
                stopHour = opt.hour;
            }
            });

            bgc.TIME_OPTIONS.forEach(opt => {
            if (opt.hour <= fromHour) return;

            // if we have a stopHour, do not go past it
            if (stopHour !== null && opt.hour > stopHour) return;

            const o = document.createElement('option');
            o.value = String(opt.hour);
            o.textContent = opt.label;
            toSel.appendChild(o);
            });

            // default: first option if exists
            if (toSel.options.length > 0) {
            toSel.value = toSel.options[0].value;
            }
        };

        fillTo(firstAvailable.hour);

        fromSel.onchange = () => {
            const fromHour = parseInt(fromSel.value, 10);
            fillTo(fromHour);
        };
    },

    //================== GET ROOMS
    roomsData:[],
    getRooms: async( dateStr ) => {
        const select = document.getElementById('roomSelect');

        if (!select) return;
        
        select.innerHTML = '';
        const loadingOpt = document.createElement('option');
        loadingOpt.value = '';
        loadingOpt.textContent = 'Loading rooms...';
        loadingOpt.disabled = true;
        loadingOpt.selected = true;
        select.appendChild(loadingOpt);
        
        util.speak('Loading rooms!!!')
        
        try {
            const res = await fetch(`${myIp}/bgc/getrooms/${dateStr}`);
            const data = await res.json();

            select.innerHTML = '';

            if (!data.success || !Array.isArray(data.rooms) || data.rooms.length === 0) {
                const opt = document.createElement('option');
                opt.value = '';
                opt.textContent = 'No rooms available';
                opt.disabled = true;
                opt.selected = true;
        
                select.appendChild(opt);
                calendar.roomsData = [];
                return;
            }

            console.log('these rooms ',  data.rooms)
            
            calendar.roomsData = data.rooms // pass to calendar.roomsData[] for universal use

             // placeholder "Select Room"
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = 'Select Room';
            placeholder.disabled = true;
            placeholder.selected = true;
            select.appendChild(placeholder);

            const seenIds = new Set();

            data.rooms.forEach(room => {

                if (seenIds.has(room.id)) return;
                seenIds.add(room.id);

                const opt = document.createElement('option');
                opt.value = room.id;
                opt.textContent = room.room_description;

                //optional: mark rooms that already have reservations
                if (room.reservations && room.reservations.length > 0) {
                   opt.textContent += ' (has reservations)';
                }

                select.appendChild(opt);
            });

            calendar.roomsData = data.rooms

            // pick first room and build times for it
            select.value = data.rooms[0].id;
            calendar.updateTimeSelectsForRoom();   // <-- will call initTimeSelects()
            calendar.renderDayGrid(); //after getting room display info

        } catch (err) {
             console.error('Error fetching rooms:', err);
            select.innerHTML = '';
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'Error loading rooms';
            select.appendChild(opt);
            calendar.roomsData = [];
        }
        
    },

    // RENDER TO GRID /table THE DAY CLICKD INFO // rnder al room info and reservation for that day
    renderDayGrid : () => {
        const tbody = document.querySelector('#dayReservationsTable tbody');
        const title  = document.getElementById('dayReservationsTitle');
        
        if (!tbody || !title) return;
        
        tbody.innerHTML = '';

        // format: Sun, Mar 22, 2026
        if (calendar.selectedDate) {
            const nice = calendar.selectedDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            title.textContent = `Reservations for ${nice}`;
        } else {
            title.textContent = 'Reservations for this day';
        }

        console.log('=====renderdaygrid(()', calendar.roomsData)

        calendar.roomsData.forEach(room => {
            (room.reservations || []).forEach(resv => {
                const tr = document.createElement('tr');

                const fromStr = calendar.formatTime12hShort(resv.date_from);
                const toStr   = calendar.formatTime12hShort(resv.date_to);

                // REPLACED MINISTRY COLUMNS WITH YOUR REMARKS DATA COLUMN
                // Added text styling to prevent extra-long words from breaking layouts
                // Inside your renderDayGrid loop:
                tr.innerHTML = `
                    <td class="ps-3">
                        <!-- Interactive Delete Button -->
                        <button type="button" class="btn btn-link link-danger p-0 border-0 text-decoration-none small fw-bold" onclick="calendar.deleteBooking(${resv.id})">
                            <i class="fas fa-trash-alt me-1"></i>#${resv.id}
                        </button>
                    </td>
                    <td class="fw-bold text-dark">${room.room_description}</td>
                    <td><span class="badge bg-light text-primary border border-primary-subtle px-2 py-1">${fromStr}</span></td>
                    <td><span class="badge bg-light text-danger border border-danger-subtle px-2 py-1">${toStr}</span></td>
                    <td>${resv.added_by_name || ''}</td>
                    <td class="ps-2 pe-3 text-wrap text-break" style="max-width: 250px;">${resv.remarks || '<span class="text-muted italic">None</span>'}</td>
                `;

                //  tr.innerHTML = `
                //     <td class="ps-3 fw-semibold text-secondary">#${resv.id}</td>
                //     <td class="fw-bold text-dark">${room.room_description}</td>
                //     <td><span class="badge bg-light text-primary border border-primary-subtle px-2 py-1">${fromStr}</span></td>
                //     <td><span class="badge bg-light text-danger border border-danger-subtle px-2 py-1">${toStr}</span></td>
                //     <td>${resv.added_by_name || ''}</td>
                //     <td class="ps-2 pe-3 text-wrap text-break" style="max-width: 250px;">${resv.remarks || '<span class="text-muted italic">None</span>'}</td>
                // `;

                tbody.appendChild(tr);
            });
        });

        // FIX: Changed colspan from 4 to 6 so it stretches perfectly across your 6 headers
        if (!tbody.hasChildNodes()) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="6" class="text-center text-muted py-4 small">No reservations scheduled for this date.</td>`;
            tbody.appendChild(tr);
        }
    },

    //=========================== SAVE ROOMS TO DB
    saveRoom: async () => {
        // 1. Fetch the remarks input value first
        const remarksInput = document.getElementById('bookingRemarks');
        const remarksValue = remarksInput ? remarksInput.value.trim() : '';

        // 2. NEW: Validation check for blank remarks box (HALTS PROCESS)
        if (!remarksValue) {
            if (remarksInput) {
                remarksInput.classList.add('is-invalid');
                remarksInput.focus();
                
                // Clear the red border style when the user types a correction
                remarksInput.addEventListener('input', function removeErr() {
                    remarksInput.classList.remove('is-invalid');
                    remarksInput.removeEventListener('input', removeErr);
                });
            }
            alert('Please provide booking remarks or a purpose before reserving.');
            return; // Halt here BEFORE activating loaders or saving
        }

        // Activate the button loading spinner state
        util.toggleButtonLoading('btnReserve', 'Saving Reservation', true);

        // Fetch user metadata from local storage
        const user = JSON.parse(localStorage.getItem('bgc_user')) || {};
        
        console.log('saveRoom()', calendar.selectedDate);
        
        if (!calendar.selectedDate) {
            alert('Please select a date.');
            util.toggleButtonLoading('btnReserve', null, false); // Fix: Kill loader on early exit
            return;
        }

        const roomIdEl = document.getElementById('roomSelect');
        const fromEl   = document.getElementById('timeFrom');
        const toEl     = document.getElementById('timeTo');

        const roomId   = roomIdEl.value;
        const roomName = roomIdEl.options[roomIdEl.selectedIndex].text;
        const roomNames = roomName.replace("(has reservations)", "").trim();

        const fromHour = parseInt(fromEl.value, 10);
        const toHour   = parseInt(toEl.value, 10);

        if (!roomId) {
            alert('Please select a room.');
            util.toggleButtonLoading('btnReserve', null, false); // Fix: Kill loader on early exit
            return;
        }
        if (isNaN(fromHour) || isNaN(toHour) || toHour <= fromHour) {
            alert('Please select a valid time range.');
            util.toggleButtonLoading('btnReserve', null, false); // Fix: Kill loader on early exit
            return;
        }

        function formatLocalDateTime(d) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hh = String(d.getHours()).padStart(2, '0');
            const mm = String(d.getMinutes()).padStart(2, '0');
            const ss = String(d.getSeconds()).padStart(2, '0');
            return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
        }

        const buildDateTime = (baseDate, hour) => {
            const d = new Date(baseDate);
            d.setHours(hour, 0, 0, 0);
            return formatLocalDateTime(d); 
        };

        const date_from = buildDateTime(calendar.selectedDate, fromHour);
        const date_to   = buildDateTime(calendar.selectedDate, toHour);

        try {
            const res = await fetch(`${myIp}/bgc/room-reserve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room_id: roomId,
                    date_from,
                    date_to,
                    added_by: user.id,
                    ministry: user.ministry_id,
                    room_name: roomNames.toUpperCase(),
                    addedby_name: user.full_name,
                    addedby_email: user.email,
                    ministry_name: user.ministry_description.toUpperCase(),
                    remarks: remarksValue // <-- NEW: Injected Remarks into Payload
                })
            });

            const data = await res.json();

            if (!data.success) {
                alert(data.error || 'Failed to save reservation.');
                util.toggleButtonLoading('btnReserve', null, false); // Fix: Turn OFF loading state on server errors
                return;
            }

            util.Toasted('Reservation saved!', 3000, false);
            util.speak('Reservation successfully saved!');
            
            // Clear out the remarks text input box completely on database success
            if (remarksInput) remarksInput.value = '';
            
            util.toggleButtonLoading('btnReserve', null, false);
                  
            const dateStr = calendar.formatDateLocalYYYYMMDD(calendar.selectedDate);
            console.log(dateStr);

            calendar.getRooms(dateStr);

        } catch (err) {
            console.error(err);
            alert('Network/server error while saving reservation.');
            util.toggleButtonLoading('btnReserve', null, false); // Fix: Turn OFF loading state on crash
        }
    },


        //=========================== DELETE/CANCEL RESERVATION
    // CHANGE: Pass the row ID directly as a parameter instead of relying on broken event scopes
    deleteBooking: async (id) => {
        if (!id) return;

        if (!confirm('Delete this booking?')) return;

        try {
            const res = await fetch(`${myIp}/bgc/deleteBooking/${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();

            if (!data.success) {
                alert(data.error || 'Failed to delete booking');
                return;
            }

            util.Toasted('Reservation deleted!', 3000, false);

            // Fetch the updated dataset for the active date
            const dateStr = calendar.formatDateLocalYYYYMMDD(calendar.selectedDate);
            
            // Reload dataset. (getRooms automatically runs updateTimeSelectsForRoom and renderDayGrid internally)
            await calendar.getRooms(dateStr);      

        } catch (err) {
            console.error('Error in delete booking sequence:', err);
            alert('Server error while deleting booking');
        }
    },

    // helper for formatting 12hr time
    // input: '2026-03-22 09:00:00'  -> '09:00a'
    //        '2026-03-22 16:00:00'  -> '4:00p'
    formatTime12hShort:(dateTimeStr) => {
        if (!dateTimeStr) return '';
        // get 'HH:MM'
        const timePart = dateTimeStr.substring(11, 16); // '09:00' or '16:00'
        let [hh, mm] = timePart.split(':').map(Number);

        const suffix = hh >= 12 ? 'p' : 'a';
        let hour12 = hh % 12;
        if (hour12 === 0) hour12 = 12;

        // 0-pad only if you want 09:00a instead of 9:00a
        const hourStr = hour12 < 10 ? '0' + hour12 : String(hour12);

        return `${hourStr}:${mm.toString().padStart(2, '0')}${suffix}`;
    },

    formatDateLocalYYYYMMDD : (d) => {
        const year  = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0'); // 01–12
        const day   = String(d.getDate()).padStart(2, '0');      // 01–31
        return `${year}-${month}-${day}`;
    }

} //end obj
 
window.calendar = calendar
// this is the listerner
//   const calendarModal = document.getElementById('calendarModal');
//     calendarModal.addEventListener('show.bs.modal', () => {
//         calendar.buildCurrentMonthCalendar(); // your calendar
//         calendar.initTimeSelects(); // time select
//         calendar.getRooms(); // room select
//     });