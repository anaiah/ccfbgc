calendar.initTimeSelects = (blockedHours = new Set()) => {
  const fromSel = document.getElementById('timeFrom');
  const toSel   = document.getElementById('timeTo');
  if (!fromSel || !toSel) return;

  // 1) FROM: disable blocked hours
  calendar.fillSelect(fromSel, 9, blockedHours);

  // pick first non-blocked as default from
  const firstAvailable = bgc.TIME_OPTIONS.find(o => !blockedHours.has(o.hour));
  if (!firstAvailable) {
    fromSel.innerHTML = '<option>No free times</option>';
    toSel.innerHTML = '';
    return;
  }
  fromSel.value = String(firstAvailable.hour);

  // 2) TO: do NOT disable hours; stop at first blocked hour after from
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

      // if we have a stopHour, don't go beyond it
      if (stopHour !== null && opt.hour > stopHour) return;

      const o = document.createElement('option');
      o.value = String(opt.hour);
      o.textContent = opt.label;
      toSel.appendChild(o);
    });

    if (toSel.options.length > 0) {
      toSel.value = toSel.options[0].value;
    }
  };

  fillTo(firstAvailable.hour);

  fromSel.onchange = () => {
    const fromHour = parseInt(fromSel.value, 10);
    fillTo(fromHour);
  };
};
