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
            
            const isToday =
            year === todayY && month === todayM && d === todayD;

            const isPast =
            year === todayY && month === todayM && d < todayD;

            if (isToday) cell.classList.add('today');
            if (isPast)  cell.classList.add('disabled-day');
            
            if (d === todayDate) cell.classList.add('today');

            cell.textContent = d;

            // ADD CLICK HANDLER HERE
            if (!isPast) {
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

        // highlight selected cell
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

        textPretty.textContent = pretty;   // big title
        textRaw.textContent = raw;         // small badge

        section.classList.remove('d-none');

        const dateStr = calendar.formatDateLocalYYYYMMDD(dateObj);
        calendar.getRooms(dateStr);

        section.classList.remove('d-none');
        section.classList.add('show-card');
        
        // calendar.selectedDate = dateObj;  // <-- store full Date here

        // const section = document.getElementById('dateTimeSection');
        // const text = document.getElementById('selectedDateText');

        // if (!section || !text) return;

        // text.textContent = dateObj.toDateString();
        // section.classList.remove('d-none'); // show the time dropdown

        // const dateStr = calendar.formatDateLocalYYYYMMDD( calendar.selectedDate ) ;

        // calendar.getRooms(dateStr);
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
            // const uniqueById = [];

            // //check for duplicates
            // data.rooms.forEach(r => {
            //     if (!seenIds.has(r.id)) {
            //         seenIds.add(r.id);
            //         uniqueById.push({ room_description: r.room_description, id: r.id, reservations : r.reservations });
            //     }
            // });
            
            //console.log( uniqueById )

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

    //=========================== SAVE ROOMS TO DB
    saveRoom: async()=>{

        util.toggleButtonLoading('btnReserve','Saving Reservation',true)

        //get localstorage
        const user = JSON.parse(localStorage.getItem('bgc_user')) || {};
        
        console.log('saveRoom()', calendar.selectedDate)
        
        if (!calendar.selectedDate) {
            alert('Please select a date.');
            return;
        }

       // const selectedDate = calendar.selectedDate;

        const roomIdEl = document.getElementById('roomSelect');
        const fromEl   = document.getElementById('timeFrom');
        const toEl     = document.getElementById('timeTo');

        const roomId   = roomIdEl.value;
        
        const roomName = roomIdEl.options[roomIdEl.selectedIndex].text.toUpperCase();

        // Replace "(has reservations)" with an empty string and update the option
        //roomIdEl.options[roomIdEl.selectedIndex].text = roomName.replace("(has reservations)", "").trim();

        const roomNames = roomName.replace("(has reservations)", "").trim();

        const fromHour = parseInt(fromEl.value, 10);
        const toHour   = parseInt(toEl.value, 10);

        if (!roomId) {
            alert('Please select a room.');
            return;
        }
        if (isNaN(fromHour) || isNaN(toHour) || toHour <= fromHour) {
            alert('Please select a valid time range.');
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

        // use this instead of toISOString()
        const buildDateTime = (baseDate, hour) => {
            const d = new Date(baseDate);
            d.setHours(hour, 0, 0, 0);
            return formatLocalDateTime(d);  // local time, no timezone
        };

        const date_from = buildDateTime( calendar.selectedDate, fromHour);
        const date_to   = buildDateTime( calendar.selectedDate, toHour);

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
                    room_name: roomNames,
                    addedby_name: user.full_name,
                    ministry_name: user.ministry_description.toUpperCase()
                    
                    // replace with real user
                })
            });

            const data = await res.json();

            if (!data.success) {
                alert(data.error || 'Failed to save reservation.');
                util.toggleButtonLoading('btnReserve','Saving Reservation',true)
      
                return;
            }

            util.Toasted('Reservation saved!',3000,false);
            util.speak('Reservation successfully saved!')
            
            util.toggleButtonLoading('btnReserve',null,false)
                  
            // optional: refresh rooms for that date
            const dateStr = calendar.formatDateLocalYYYYMMDD( calendar.selectedDate ) ;

            console.log( dateStr )

            calendar.getRooms(dateStr);

        } catch (err) {
            console.error(err);
            alert('Network/server error while saving reservation.');
        }

    },

    deletebooking: async()=>{
    
        const btn = e.target.closest('.btn-delete-booking');
        if (!btn) return;

        // delete booking
        const id = btn.getAttribute('data-booking-id');
        if (!id) return;

        if (!confirm('Delete this booking?')) return;

        try {
        const res = await fetch(`${myIp}/bgc/deletebooking/${id}`, {
            method: 'DELETE'
        });
        const data = await res.json();

        if (!data.success) {
                alert(data.error || 'Failed to delete booking');
                return;
            }

            // refresh data for current date
            const dateStr = formatDateLocalYYYYMMDD(calendar.selectedDate);
            
            await calendar.getRooms(dateStr);      // reload rooms + reservations
            calendar.renderDayGrid();             // rebuild grid
            calendar.updateTimeSelectsForRoom();  // recompute blocked hours
        } catch (err) {
            console.error(err);
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

    // RENDER TO GRID /table  THE DAY CLICKD INFO
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

        // flatten all reservations for that day
        //console.log( 'DITO',calendar.roomsData.length)
        //let countReservation = 0
        calendar.roomsData.forEach(room => {
            (room.reservations || []).forEach(resv => {
            const tr = document.createElement('tr');

            // const fromStr = calendar.formatTime12hShort(resv.date_from.substring(11, 16)); // "HH:MM"
            // const toStr   = calendar.formatTime12hShort(resv.date_to.substring(11, 16));   // "HH:MM"

            const fromStr = calendar.formatTime12hShort(resv.date_from);
            const toStr   = calendar.formatTime12hShort(resv.date_to);
            //countReservation ++

            //IMPORTANT!  ADD THE TH HEADERS in index.html
            tr.innerHTML = `
                <td>${room.booking_id}</td>
                <td>${room.room_description}</td>
                <td>${fromStr}</td>
                <td>${toStr}</td>
                <td>${resv.added_by_name || ''}</td>
                <td>${resv.ministry || ''}</td>
            `;

            tbody.appendChild(tr);
            });
        });

        // const statusBadge = document.getElementById('roomStatusBadge');
        // if (statusBadge) {
        // if (countReservation === 0) {
        //     statusBadge.textContent = 'No reservations yet';
        //     statusBadge.className = 'badge bg-success-subtle text-success';
        // } else {
        //     statusBadge.textContent = `${countReservation} reservation(s)`;
        //     statusBadge.className = 'badge bg-warning-subtle text-warning';
        // }
        // }
        // no reservations?
        if (!tbody.hasChildNodes()) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="4" class="text-center text-muted">No reservations</td>`;
            tbody.appendChild(tr);
        }
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