// check login-
fetch("/check").then(response => response.json()).then(log => {
  if(log.log==0){
    window.location.href = "http://localhost:5000/login.html";
  }
})



// logout-
let logout_button=document.querySelector(".logout");
logout_button.addEventListener("click",()=>{
  fetch("/logout").then(response => response.json()).then(log => {
    if(log.log==0){
      window.location.href = "http://localhost:5000/home";
      //console.log("Logout: ",log.log);
    }
    else{
      //console.log("Logout Failed!",log.log);
    }
  })
})



//---------------------------------------------
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
      }, 2000); // Set the interval to 1000 milliseconds (1 second)
    }
    
    // Show the first slide initially
    showSlide(currentSlide);
    
    // Start automatic sliding
    autoSlide();

    showSlide(currentSlide);