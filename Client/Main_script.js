let login_but=document.querySelector(".login_but");
let locateRes_but=document.querySelector(".button1");
let locateWork_but=document.querySelector(".button2");
let is_logged_in=0;

fetch("/check").then(response => response.json()).then(log => {
  if(log.log==1){
    is_logged_in=1;
    login_but.textContent="Profile";
  }
})

login_but.addEventListener("click",()=>{
  if(is_logged_in==0){
    window.location.href = "http://localhost:5000/login.html";
  }
  else{
    window.location.href = "http://localhost:5000/Contributors_page";
  }
})


locateRes_but.addEventListener('click',()=>{
  window.location.href = "http://localhost:5000/findRes";
})

locateWork_but.addEventListener('click',()=>{
  window.location.href = "http://localhost:5000/findWork";
})


let currentSlide = 1;
    const images = ["1.png","2.png","3.png"];

    function changeSlide(n) {
      showSlide(currentSlide += n);
    }

    function showSlide(n) {
      const sliderImage = document.getElementById('slider-image');
      
      // Fade out
      sliderImage.style.opacity = 0;

      // Set new image source after the fade-out is complete
      setTimeout(() => {
        if (n >= images.length) { currentSlide = 0; }
        if (n < 0) { currentSlide = images.length - 1; }
        sliderImage.src = images[currentSlide];
        
        // Fade in
        sliderImage.style.opacity = 1;
      }, 500);
    }
    function autoSlide() {
      setInterval(() => {
        changeSlide(1); // Increment to the next slide
      }, 5000); // Set the interval to 1000 milliseconds (1 second)
    }
    
    // Show the first slide initially
    showSlide(currentSlide);
    
    // Start automatic sliding
    autoSlide();

    showSlide(currentSlide);

