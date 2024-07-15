fetch("/check").then(response => response.json()).then(log => {
    if(log.log==0){
      window.location.href = "http://localhost:5000/login.html";
    }
})

let form=document.querySelector(".form-box");
form.addEventListener("submit", async(e) => {
    e.preventDefault();
    const title = document.getElementById('fname').value;
    const type = document.getElementById('type').value;
    const description = document.getElementById('description').value;
    let latitude=0;
    let longitude=0;
    let obj={};
    await fetch("/getCord").then(response => response.json()).then(async(log) => {
        latitude=log.latC;
        longitude=log.lonC;
        obj={
            Title: title,
            "type (0: W , 1: F)": type,
            desc: description,
            address: `${latitude},${longitude}`,
            coords:{
                lat: latitude,
                lng: longitude
            },
            indexCords:{
                type:"Point",
                coordinates: [
                    latitude,
                    longitude
                ]
            }
        }
       await fetch("/sendData",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify(obj)
        }).then(response => response.json()).then(log => {
            if(log.log==1){
                let popup=document.querySelector(".Popup");
                popup.removeAttribute("hidden");
                form.hidden=true;
                let frame=document.querySelector(".map");
                frame.hidden=true;
            }
        })
    });
})