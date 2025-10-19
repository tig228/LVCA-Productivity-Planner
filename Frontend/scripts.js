// Core Buttons and modals 
const startButton = document.getElementById("start");
const nextButton = document.getElementById("next");
const addCourseButton = document.getElementById("courses");
const eventButton = document.getElementById("events");
const taskButton = document.getElementById("tasks");
const finishedButton = document.getElementById("submit");
const yesButton = document.getElementById("yes");
const noButton = document.getElementById("no");
const calendarButton = document.getElementById("seeCal");


const startModal = document.getElementById("welcome");
const addModal = document.getElementById("adding");
const loginModal = document.getElementById("login");
const suggestionModal = document.getElementById("suggestions");
const adviceModal = document.getElementById("advice");
const adviceForm = document.getElementById("adviceForm");
const eventModal = document.getElementById("event");
const taskModal = document.getElementById("task");
const courseModal = document.getElementById("course");
const calendarContainer = document.getElementById("calendarContainer");

// navigation
startButton.addEventListener("click", (e) => {
  e.preventDefault();
  startModal.style.display = "none";
  addModal.classList.add("show");
});

finishedButton.addEventListener("click", (e) => {
  e.preventDefault();
  addModal.style.display = "none";
  suggestionModal.classList.add("show");
});

yesButton.addEventListener("click", (e) => {
  e.preventDefault();
  suggestionModal.style.display = "none";
  adviceModal.classList.add("show");
});

noButton.addEventListener("click", (e) => {
  e.preventDefault();
  suggestionModal.style.display = "none";
  calendarContainer.style.display = "block";
});

// show event/task/course modals 
addCourseButton.addEventListener("click", (e) => {
  e.preventDefault();
  addModal.style.display = "none";
  courseModal.classList.add("show");
});

eventButton.addEventListener("click", (e) => {
  e.preventDefault();
  addModal.style.display = "none";
  eventModal.classList.add("show");
});

taskButton.addEventListener("click", (e) => {
  e.preventDefault();
  addModal.style.display = "none";
  taskModal.classList.add("show");
});

// this function will close and of the modals 
document.querySelectorAll(".btn.secondary, #closeBtn, #taskCloseBtn, #courseCloseBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".modal").forEach(modal => modal.classList.remove("show"));
    calendarContainer.style.display = "block";
  });
});

// ========= LOCAL CALENDAR STORAGE =========
function addToCalendarStorage(dateStr, title, time, note) {
  const STORAGE_KEY = "calendar_events_v1";
  const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const key = dateStr;

  // If no time specified, consult advice map to suggest a time:
  // - If the saved advice marks the course/task as hard and makes you tired -> suggest 18:00 (towards 6)
  // - If marked as easy (not hard) -> suggest early day 08:00
  // Matching strategy: try exact match of title to advice map keys (case-insensitive),
  // or check if any advice key is included in title.
  if (!time || time === "") {
    const DIFFICULTY_KEY = 'difficulty_map_v1';
    const map = JSON.parse(localStorage.getItem(DIFFICULTY_KEY) || '{}');
    const titleLC = (title || "").toLowerCase();
    let matchedEntry = null;
    for (const k of Object.keys(map)) {
      const kLC = k.toLowerCase();
      if (titleLC === kLC || titleLC.includes(kLC) || kLC.includes(titleLC)) {
        matchedEntry = map[k];
        break;
      }
    }
    if (matchedEntry) {
      const hard = !!matchedEntry.hard;
      const feeling = matchedEntry.feeling || 'tired';
      if (hard && feeling === 'tired') time = '18:00';
      else if (hard && feeling === 'energized') time = '16:00';
      else if (!hard) time = '08:00';
      // otherwise leave time as empty (user can set)
      // Also, if the advice entry contains a dueDate and no explicit date was provided,
      // we could derive scheduling from that; but addToCalendarStorage assumes dateStr is the target date.
    }
  }

  events[key] = events[key] || [];
  events[key].push({ title, time, note });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));

  if (typeof window.renderCalendar === "function") window.renderCalendar(); // refresh
}

// ========= FORM HANDLERS =========
document.getElementById("eventForm")?.addEventListener("submit", (e) => { //gets the event form 
  e.preventDefault();
  const title = document.getElementById("eventTitle").value.trim();
  const date = document.getElementById("eventDate").value;
  const time = document.getElementById("eventTime").value;
  const note = document.getElementById("eventNote").value.trim();
  if (!title || !date) return;
  addToCalendarStorage(date, title, time, note);
  document.querySelectorAll(".modal").forEach(m => m.classList.remove("show"));
  calendarContainer.style.display = "block";
});

document.getElementById("taskForm")?.addEventListener("submit", (e) => { // gets the task form 
  e.preventDefault();
  const title = document.getElementById("taskTitle").value.trim();
  const date = document.getElementById("taskDate").value;
  const time = document.getElementById("taskTime").value;
  const note = document.getElementById("taskNote").value.trim();
  if (!title || !date) return;
  addToCalendarStorage(date, title, time, note);
  document.querySelectorAll(".modal").forEach(m => m.classList.remove("show"));
  calendarContainer.style.display = "block";
});

document.getElementById("courseForm")?.addEventListener("submit", (e) => { //gets the course form
  e.preventDefault();
  const title = document.getElementById("courseTitle").value.trim();
  const date = document.getElementById("courseDate").value;
  const note = document.getElementById("courseNote").value.trim();
  if (!title || !date) return;
  addToCalendarStorage(date, title, "", note);
  document.querySelectorAll(".modal").forEach(m => m.classList.remove("show"));
  calendarContainer.style.display = "block";
});

calendarButton?.addEventListener("click", (e) => { // will display teh calendar without going through the modals 
  e.preventDefault();
  startModal.style.display = "none";
  calendarContainer.style.display = "block";
  if (typeof window.renderCalendar === "function") window.renderCalendar();
});

// ========= AI VOICE + GOOGLE CAL =========
const microphoneButton = document.getElementById("microphone");
const transcriptDisplay = document.getElementById("transcript");
const API_URL = "https://23elpyn70c.execute-api.us-east-1.amazonaws.com/prod/process";

const toGCalUTC = (iso) => {
  const d = new Date(iso);
  const p = n => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
};

const openGCal = (ev) => {
  const title = encodeURIComponent(ev.title || "");
  const details = encodeURIComponent(ev.description || "");
  const location = encodeURIComponent(ev.location || "");
  const dates = `${toGCalUTC(ev.start_time)}/${toGCalUTC(ev.end_time)}`;
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
  const win = window.open(url, "_blank");
  if (!win || win.closed || typeof win.closed === "undefined") {
    if (transcriptDisplay) {
      transcriptDisplay.innerHTML = `Popup blocked. <a href="${url}" target="_blank">Click here to open your Google Calendar event.</a>`;
    } else {
      alert("Popup blocked by the browser. Please allow popups and try again.");
    }
  }
};

const extractKeyword = (text) => {
  if (!text) return "Untitled Event";
  const words = text.split(/\s+/).filter(w => w.length > 3);
  return words.length ? words[0].replace(/[^a-zA-Z0-9]/g, "") : "Untitled Event";
};

// Speech recognition
const speechToText = () => new Promise((resolve) => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    transcriptDisplay.textContent = "Speech recognition not supported.";
    resolve(null);
    return;
  }
  const rec = new SR();
  rec.lang = "en-US";
  rec.interimResults = true;

  let finalText = "";
  let stopped = false;
  transcriptDisplay.textContent = "Listening (10s)...";

  rec.onresult = (e) => {
    const result = Array.from(e.results).map(r => r[0].transcript).join(" ");
    transcriptDisplay.textContent = result;
    if (e.results[e.results.length - 1].isFinal) finalText = result;
  };

  rec.onend = () => {
    if (!stopped) {
      stopped = true;
      resolve(finalText.trim() || null);
    }
  };

  rec.start();
  setTimeout(() => {
    if (!stopped) {
      stopped = true;
      rec.stop();
      transcriptDisplay.textContent += " (Stopped)";
    }
  }, 10000);
});

const promptForText = async () => {
  const text = prompt("Say or type something about your day:");
  if (!text) return null;
  transcriptDisplay.textContent = "You typed: " + text;
  return text.trim();
};

const parseWithAI = async (text) => {
  transcriptDisplay.textContent = "Processing with AI...";
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data.event;
};

microphoneButton?.addEventListener("click", async () => {
  try {
    let text = await speechToText();
    if (!text) text = await promptForText();
    if (!text) return;

    const ev = await parseWithAI(text);
    if (!ev.title || !ev.title.trim()) ev.title = extractKeyword(text);

    const localDate = ev.start_time.split("T")[0];
    const time = ev.start_time.split("T")[1]?.slice(0, 5);
    addToCalendarStorage(localDate, ev.title, time, ev.description);

    transcriptDisplay.textContent = `Event saved: ${ev.title} (${ev.start_time})`;

    if (confirm(`Added to your planner.\nTitle: ${ev.title}\nStart: ${ev.start_time}\nEnd: ${ev.end_time}\nLocation: ${ev.location || ""}\n\nOpen in Google Calendar?`)) {
      openGCal(ev);
    }
  } catch (err) {
    transcriptDisplay.textContent = "Error: " + err.message;
    alert("Error: " + err.message);
  }
});


(function () { // this creatses the calender 
  const daysGrid = document.getElementById("daysGrid");
  const monthLabel = document.getElementById("monthLabel");
  const rangeLabel = document.getElementById("rangeLabel");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const todayBtn = document.getElementById("todayBtn");

  let viewDate = new Date();
  const today = new Date();
  const STORAGE_KEY = "calendar_events_v1";

  const loadEvents = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const formatMonthYear = (d) => d.toLocaleString(undefined, { month: "long", year: "numeric" });
  const dateKey = (y, m, d) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  function render() {
    daysGrid.innerHTML = "";
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startWeekDay = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthLabel.textContent = formatMonthYear(viewDate);
    const startVisible = new Date(year, month, 1 - startWeekDay);
    const endVisible = new Date(year, month, 42 - startWeekDay);
    rangeLabel.textContent = `${startVisible.toLocaleDateString()} — ${endVisible.toLocaleDateString()}`;

    const events = loadEvents();

    for (let i = 0; i < 42; i++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "day";

      const dayOffset = i - startWeekDay + 1;
      const cellDate = new Date(year, month, dayOffset);
      const y = cellDate.getFullYear(), m = cellDate.getMonth() + 1, d = cellDate.getDate();
      const key = dateKey(y, m, d);

      // store exact date on the cell so clicks can identify the proper date (fixes cross-month edit bug)
      cell.dataset.date = key;

      if (cellDate.getMonth() !== month) cell.classList.add("outside");
      if (cellDate.toDateString() === today.toDateString()) cell.classList.add("today");

      const num = document.createElement("div");
      num.className = "date-num";
      num.textContent = d;
      cell.appendChild(num);

      const list = document.createElement("div");
      list.className = "events";
      const dayEvents = events[key] || [];
      dayEvents.slice(0, 3).forEach((ev, idx) => {
        const evEl = document.createElement("div");
        evEl.className = "event";
        // attach index mapping to the rendered element so clicks map to the correct event
        evEl.dataset.index = idx;
        evEl.textContent = (ev.time ? ev.time + " — " : "") + ev.title;
        list.appendChild(evEl);
      });
      if (dayEvents.length > 3) {
        const more = document.createElement("div");
        more.className = "event";
        // don't set data-index for the more element; clicking it will be ignored for edit/view
        more.textContent = `+${dayEvents.length - 3} more`;
        list.appendChild(more);
      }

      cell.appendChild(list);
      daysGrid.appendChild(cell);

      // Click to open Add/Edit modal
      
    }
  }

  // Expose globally
  window.renderCalendar = render;

  prevBtn.addEventListener("click", () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    render();
  });
  nextBtn.addEventListener("click", () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    render();
  });
  todayBtn.addEventListener("click", () => {
    viewDate = new Date();
    render();
  });

  render();
})();

// This code below is for the edit modal 


// ===== EVENT VIEW / EDIT / DELETE FUNCTIONALITY =====
const eventDetailModal = document.getElementById('eventDetailModal');
const eventDetailContent = document.getElementById('eventDetailContent');
const closeEventDetail = document.getElementById('closeEventDetail');
const editEventBtn = document.getElementById('editEventBtn');
const deleteEventBtn = document.getElementById('deleteEventBtn');
const deleteCalHeader = document.getElementById('deleteCal-header');
const editCalHeader = document.getElementById('editCal-header');
const addCalHeader = document.getElementById('addCal-header');

let selectedEvent = null; // store current event info (date, index, data)

// helper: get all events
function loadAllEvents() {
  return JSON.parse(localStorage.getItem('calendar_events_v1') || '{}');
}

// helper: save all events
function saveAllEvents(evObj) {
  localStorage.setItem('calendar_events_v1', JSON.stringify(evObj));
  if (window.renderCalendar) window.renderCalendar();
}

/* === Handle clicking on an individual event in the calendar === */
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('event')) {
    const dayCell = e.target.closest('.day');
    if (!dayCell) return;

    // Use the stored cell date rather than deriving it from the header month (fixes cross-month selection)
    const dateKey = dayCell.dataset.date;
    if (!dateKey) return;

    const events = loadAllEvents();
    const dayEvents = events[dateKey] || [];

    // Use the data-index attached to rendered event elements to find the correct event
    const idxAttr = e.target.dataset.index;
    const eventIndex = (typeof idxAttr !== 'undefined') ? parseInt(idxAttr, 10) : -1;
    if (eventIndex === -1) return; // ignore clicks on "+n more" or other non-event elements
    if (eventIndex > -1 && eventIndex < dayEvents.length) {
      selectedEvent = { dateKey, index: eventIndex, data: dayEvents[eventIndex] };
      const ev = selectedEvent.data;
      // identify event type
      let eventType = 'Event';
      if (ev.note?.toLowerCase().includes('task')) eventType = 'Task';
      if (ev.note?.toLowerCase().includes('course')) eventType = 'Course';
      
      eventDetailContent.innerHTML = `
        <p><strong>Type:</strong> ${eventType}</p>
        <p><strong>Title:</strong> ${ev.title}</p>
        <p><strong>Date:</strong> ${dateKey}</p>
        ${ev.time ? `<p><strong>Time:</strong> ${ev.time}</p>` : ''}
        ${ev.note ? `<p><strong>Details:</strong> ${ev.note}</p>` : ''}
      `;
      eventDetailModal.classList.add('show');
    }
  }
});

/* === Close Event Detail Modal === */
closeEventDetail.addEventListener('click', () => {
  eventDetailModal.classList.remove('show');
  selectedEvent = null;
});

/* === Delete Selected Event === */
deleteEventBtn.addEventListener('click', () => {
  if (!selectedEvent) return;
  const events = loadAllEvents();
  events[selectedEvent.dateKey].splice(selectedEvent.index, 1);
  if (events[selectedEvent.dateKey].length === 0) delete events[selectedEvent.dateKey];
  saveAllEvents(events);
  eventDetailModal.classList.remove('show');
  selectedEvent = null;
});

/* === Edit Selected Event === */
editEventBtn.addEventListener('click', () => {
  if (!selectedEvent) return;
  const ev = selectedEvent.data;
  // pre-fill event modal
  document.getElementById('eventTitle').value = ev.title;
  document.getElementById('eventDate').value = selectedEvent.dateKey;
  document.getElementById('eventTime').value = ev.time || '';
  document.getElementById('eventNote').value = ev.note || '';
  eventDetailModal.classList.remove('show');
  eventModal.classList.add('show');
});

/* === Header Delete Button: delete ALL events === */
deleteCalHeader?.addEventListener('click', () => {
  if (confirm('Are you sure you want to delete all events?')) {
    localStorage.removeItem('calendar_events_v1');
    if (window.renderCalendar) window.renderCalendar();
  }
});

/* === Header Edit Button: toggle edit mode === */
editCalHeader?.addEventListener('click', () => {
  alert('Click on any event to view or edit its details!');
});

/* === Header Add Button: open add modal === */
addCalHeader?.addEventListener('click', () => {
  addModal.classList.add('show');
});

/* === Advice Modal: save whether a course/task is usually hard and how it makes the user feel afterwards === */
const DIFFICULTY_KEY = 'difficulty_map_v1';

if (adviceForm) {
  adviceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('adviceName');
    const hardSelected = document.querySelector('input[name="adviceHard"]:checked');
    const feelingSelected = document.querySelector('input[name="adviceFeeling"]:checked');
    const dueDateInput = document.getElementById('adviceDueDate');
    const name = nameInput?.value.trim();
    const hard = hardSelected?.value === 'yes';
    const feeling = feelingSelected?.value || 'tired';
    const dueDate = dueDateInput?.value || '';

    if (!name) {
      alert('Please enter the course or task name.');
      return;
    }

    const map = JSON.parse(localStorage.getItem(DIFFICULTY_KEY) || '{}');
    map[name] = { hard, feeling, dueDate };
    localStorage.setItem(DIFFICULTY_KEY, JSON.stringify(map));

    // If a due date was provided, auto-schedule a prep task 2 days before.
    if (dueDate) {
      try {
        const due = new Date(dueDate + "T00:00:00");
        const prep = new Date(due);
        prep.setDate(prep.getDate() - 2);
        // format yyyy-mm-dd
        const yyyy = prep.getFullYear();
        const mm = String(prep.getMonth() + 1).padStart(2, '0');
        const dd = String(prep.getDate()).padStart(2, '0');
        const prepDateKey = `${yyyy}-${mm}-${dd}`;

        // Determine time based on difficulty + feeling
        let prepTime = '';
        if (hard && feeling === 'tired') prepTime = '18:00';
        else if (hard && feeling === 'energized') prepTime = '16:00';
        else if (!hard) prepTime = '08:00';

        const prepTitle = `Prep: ${name}`;
        const prepNote = `Auto-scheduled from advice (due ${dueDate})`;
        addToCalendarStorage(prepDateKey, prepTitle, prepTime, prepNote);
      } catch (err) {
        console.warn('Failed to auto-schedule prep task:', err);
      }
    }

    alert(`Saved: "${name}" marked as ${hard ? 'usually hard' : 'not usually hard'} and feeling "${feeling}".`);
    document.querySelectorAll(".modal").forEach(m => m.classList.remove("show"));
    calendarContainer.style.display = "block";
  });

  // Skip button: just close the modal and show calendar
  const adviceSkipBtn = document.getElementById('adviceSkipBtn');
  adviceSkipBtn?.addEventListener('click', () => {
    document.querySelectorAll(".modal").forEach(m => m.classList.remove("show"));
    calendarContainer.style.display = "block";
  });
}

// Optionally you can expose helper functions to read difficulty map
function getDifficultyMap() {
  return JSON.parse(localStorage.getItem(DIFFICULTY_KEY) || '{}');
}
function isUsuallyHard(name) {
  const map = getDifficultyMap();
  const entry = map[name];
  return !!entry && !!entry.hard;
}
function getFeelingFor(name) {
  const map = getDifficultyMap();
  const entry = map[name];
  return entry ? entry.feeling : undefined;
}