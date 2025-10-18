//Milestone #1 Create an action for each button 

let startButton = document.getElementById("start");  // provided are all the button variables 
let nextButton = document.getElementById("next"); 
let addCourseButton = document.getElementById("course");
let eventButton = document.getElementById("event");
let taskButton = document.getElementById("task"); 
let microphone = document.getElementById("microhphone"); 
let finishedButton = document.getElementById("submit"); 
let yesButton = document.getElementById("yes"); 
let noButton = document.getElementById("no");

const startModal = document.getElementById("welcome"); 
const addModal = document.getElementById("adding"); 
const loginModal = document.getElementById("login"); 
const suggestionModal = document.getElementById("suggestions"); 
const adviceModal = document.getElementById("advice"); 
const eventModal = document.getElementById("event"); 
const taskModal = document.getElementById("task"); 
const courseModal = document.getElementById("course"); 


startButton.addEventListener("click", (e) => {
    e.preventDefault(); // this will make sure the website does not refresh 
    startModal.style.display = "none"; 
    loginModal.classList.add("show");

})
nextButton.addEventListener("click", (e) => {
    e.preventDefault(); // this will make sure the website does not refresh 
    loginModal.style.display = "none"; 
    addModal.classList.add("show");

})
finishedButton.addEventListener("click", (e) => {
    e.preventDefault(); // this will make sure the website does not refresh 
    addModal.style.display = "none"; 
    suggestionModal.classList.add("show");

})
yesButton.addEventListener("click", (e) => { // the yes button will take you to the suggestions page 
    e.preventDefault(); // this will make sure the website does not refresh 
    suggestionModal.style.display = "none"; 
    adviceModal.classList.add("show"); 

})

noButton.addEventListener("click", (e) => { // the no button will take you to the calendar 
    e.preventDefault(); // this will make sure the website does not refresh 
    suggestionModal.style.display = "none"; 
    suggestionModal.classList.add("show");

})

