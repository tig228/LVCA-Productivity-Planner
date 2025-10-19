//Milestone #5 comment through the code and understand each line
// Miilestone #6 Fix the CSS aspects XX
// Milestone #7 If they click on a calendar a info modual shows up of the events and tasks that they need to do 




const startButton = document.getElementById("start");
const nextButton = document.getElementById("next");
const addCourseButton = document.getElementById("courses");
const eventButton = document.getElementById("events");
const taskButton = document.getElementById("tasks");
const finishedButton = document.getElementById("submit");
const yesButton = document.getElementById("yes");
const noButton = document.getElementById("no");
const calendarButton = document.getElementById("seeCal"); 
const editCalHeader = document.getElementById("editCal-header"); 
const deleteCalHeader = document.getElementById("deleteCalHeader");
const addCalHeader = document.getElementById("addCal-header"); 

const startModal = document.getElementById("welcome");
const addModal = document.getElementById("adding");
const loginModal = document.getElementById("login");
const suggestionModal = document.getElementById("suggestions");
const adviceModal = document.getElementById("advice");
const eventModal = document.getElementById("event");
const taskModal = document.getElementById("task");
const courseModal = document.getElementById("course");
const calendarContainer = document.getElementById("calendarContainer");

startButton.addEventListener("click", (e) => { // this takes you to the login page 
  e.preventDefault();
  startModal.style.display = "none";
  loginModal.classList.add("show");
});

nextButton.addEventListener("click", (e) => {  // this takes you to the add events page
  e.preventDefault();  
  loginModal.style.display = "none";
  addModal.classList.add("show");
});

finishedButton.addEventListener("click", (e) => {  // once you click this button it will take you to a prompt where you can ask for suggestions 
  e.preventDefault();
  addModal.style.display = "none";
  suggestionModal.classList.add("show");
});

yesButton.addEventListener("click", (e) => {  // if yes there will be many questions as to where you events should go 
  e.preventDefault();
  suggestionModal.style.display = "none";
  adviceModal.classList.add("show");
});

noButton.addEventListener("click", (e) => {  // no will take you immediately to the finished calenday 
  e.preventDefault();
  suggestionModal.style.display = "none";
  calendarContainer.style.display = "block";
});

// ===== SHOW EVENT / TASK / COURSE MODALS =====
addCourseButton.addEventListener("click", (e) => {   // will take you to the addCourses
  e.preventDefault();
  addModal.style.display = "none";
  courseModal.classList.add("show");
});

eventButton.addEventListener("click", (e) => {   // will take you to the addEvents 
  e.preventDefault();
  addModal.style.display = "none";
  eventModal.classList.add("show");
});

taskButton.addEventListener("click", (e) => {  // will take you to the add Tasks 
  e.preventDefault();
  addModal.style.display = "none";
  taskModal.classList.add("show");
});



// ===== SIMPLE CLOSES =====
document.querySelectorAll(".btn.secondary, #closeBtn, #taskCloseBtn, #courseCloseBtn").forEach(btn => {  // this hides the calendar 
  btn.addEventListener("click", () => {
    document.querySelectorAll(".modal").forEach(modal => modal.classList.remove("show"));
    calendarContainer.style.display = "block";
  });
});

// ====== CALENDAR LOGIC (unchanged, wrapped to avoid interference) ======
(function () {
  const daysGrid = document.getElementById('daysGrid');  // this creates the buttons labels and grids for the calendar 
  const monthLabel = document.getElementById('monthLabel');
  const rangeLabel = document.getElementById('rangeLabel');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const todayBtn = document.getElementById('todayBtn');

  let viewDate = new Date();  // this is 
  const today = new Date();
  const STORAGE_KEY = 'calendar_events_v1';

  const loadEvents = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');  // this gets storage and loads the events 
  const saveEvents = (obj) => localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  const formatMonthYear = (d) => d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  const dateKey = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  function render() {
    daysGrid.innerHTML = '';
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startWeekDay = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    monthLabel.textContent = formatMonthYear(viewDate);
    const startVisible = new Date(year, month, 1 - startWeekDay);
    const endVisible = new Date(year, month, (42 - startWeekDay));
    rangeLabel.textContent = `${startVisible.toLocaleDateString()} — ${endVisible.toLocaleDateString()}`;
    const events = loadEvents();

    for (let i = 0; i < 42; i++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'day';
      const dayOffset = i - startWeekDay + 1;
      const cellDate = new Date(year, month, dayOffset);
      const y = cellDate.getFullYear(), m = cellDate.getMonth() + 1, d = cellDate.getDate();
      const key = dateKey(y, m, d);
      if (cellDate.getMonth() !== month) cell.classList.add('outside');
      if (cellDate.toDateString() === today.toDateString()) cell.classList.add('today');

      
      const num = document.createElement('div');
      num.className = 'date-num';
      num.textContent = d;
      cell.appendChild(num);

      const list = document.createElement('div');
      list.className = 'events';
      const dayEvents = events[key] || [];
      dayEvents.slice(0, 3).forEach(ev => {
        const evEl = document.createElement('div');
        evEl.className = 'event';
        evEl.textContent = (ev.time ? ev.time + ' — ' : '') + ev.title;
        list.appendChild(evEl);
      });
      if (dayEvents.length > 3) {
        const more = document.createElement('div');
        more.className = 'event';
        more.textContent = `+${dayEvents.length - 3} more`;
        list.appendChild(more);
      }

      cell.appendChild(list);
      daysGrid.appendChild(cell); 

      cell.addEventListener('click', (e) => {  // if the cell is clicked the information the user can change the information 
        e.preventDefault(); 
        calendarContainer.style.display = "block";
        addModal.classList.add("show");         


      })
    }
  }

  // 

  
// Prevent full-page submit/reload for the separate input modals
const eventFormEl = document.getElementById('eventForm');
const taskFormEl  = document.getElementById('taskForm');
const courseFormEl = document.getElementById('courseForm');

[eventFormEl, taskFormEl, courseFormEl].forEach(formEl => {
  if (!formEl) return;
  formEl.addEventListener('submit', (e) => {
    e.preventDefault();                    // STOP page reload
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('show')); // close modals
    calendarContainer.style.display = 'block'; // reveal calendar
    // NOTE: we do NOT change your data logic — these forms remain separate and you can
    // add your own save logic here if/when you want. This only prevents the reload.
  });
});
  prevBtn.addEventListener('click', (e) => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    render();
  });
  nextBtn.addEventListener('click', (e) => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    render();
  });
  todayBtn.addEventListener('click', (e) => {
    viewDate = new Date();
    render();
  });

  render();

})();

// ===== CONNECT EVENT / TASK / COURSE FORMS TO CALENDAR =====
function addToCalendarStorage(dateStr, title, time, note) {
  const STORAGE_KEY = 'calendar_events_v1';
  const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const key = dateStr; // already in YYYY-MM-DD format from <input type="date">
  events[key] = events[key] || [];
  events[key].push({ title, time, note });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));

  // re-render calendar immediately
  if (typeof window.renderCalendar === 'function') {
    window.renderCalendar();
  }
}

// Hook up each form to save into calendar
document.getElementById('eventForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('eventTitle').value.trim();
  const date = document.getElementById('eventDate').value;
  const time = document.getElementById('eventTime').value;
  const note = document.getElementById('eventNote').value.trim();
  if (!title || !date) return;
  addToCalendarStorage(date, title, time, note);
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
  calendarContainer.style.display = 'block';
});

document.getElementById('taskForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('taskTitle').value.trim();
  const date = document.getElementById('taskDate').value;
  const time = document.getElementById('taskTime').value;
  const note = document.getElementById('taskNote').value.trim();
  if (!title || !date) return;
  addToCalendarStorage(date, title, time, note);
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
  calendarContainer.style.display = 'block';
});

document.getElementById('courseForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('courseTitle').value.trim();
  const date = document.getElementById('courseDate').value;
  const note = document.getElementById('courseNote').value.trim();
  if (!title || !date) return;
  addToCalendarStorage(date, title, '', note);
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
  calendarContainer.style.display = 'block';
});

calendarButton.addEventListener("click", (e) => {
  e.preventDefault();
  startModal.style.display = "none";
  calendarContainer.style.display = "block";
  window.renderCalendar(); // Call the global reference
});
