//* ======================== Slide Control ===================== */
var contents = document.getElementsByClassName("slide-content");

document.getElementById("slide-menu").addEventListener("click", function(e) {
  const idx = [...this.children]
    .filter(el => el.className.indexOf('dot') > -1)
    .indexOf(e.target);
    
  if (idx >= 0) {
    var prev = document.querySelector(".dot.active");
    if (prev) prev.classList.remove("active");
    e.target.classList.add("active");
    
    for (var i = 0; i < contents.length; i++) {
      if (i == idx) {
        contents[i].style.display = "block";
      } else {
        contents[i].style.display = "none";
      }
    }  
  }
});

//* ======================== Slide Show Control ===================== */
const slider = document.querySelector('.container .slider');
const [btnLeft, btnRight] = ['prev_btn', 'next_btn'].map(id => document.getElementById(id));
let interval;

// Set positions
const setPositions = () => 
    [...slider.children].forEach((item, i) => 
        item.style.left = `${(i-1) * 440}px`);

// Initial setup
setPositions();

// Set transition speed
const setTransitionSpeed = (speed) => {
    [...slider.children].forEach(item => 
        item.style.transitionDuration = speed);
};

// Slide functions
const next = (isAuto = false) => { 
    setTransitionSpeed(isAuto ? '1.5s' : '0.2s');
    slider.appendChild(slider.firstElementChild); 
    setPositions(); 
};

const prev = () => { 
    setTransitionSpeed('0.2s');
    slider.prepend(slider.lastElementChild); 
    setPositions(); 
};

// Auto slide
const startAuto = () => interval = interval || setInterval(() => next(true), 2000);
const stopAuto = () => { clearInterval(interval); interval = null; };

// Event listeners
btnRight.addEventListener('click', () => next(false));
btnLeft.addEventListener('click', prev);

// Mouse hover controls
[slider, btnLeft, btnRight].forEach(el => {
    el.addEventListener('mouseover', stopAuto);
    el.addEventListener('mouseout', startAuto);
});

// Start auto slide
startAuto();