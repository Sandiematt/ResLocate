fetch("/check").then(response => response.json()).then(log => {
    if(log.log==0){
      window.location.href = "http://localhost:5000/login.html";
    }
})

let image= document.querySelector(".imgbut");

image.addEventListener("change", (e) => {
    uploadImage(e);
});

const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
  
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
  
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
};

const uploadImage = async (event) => {
    const file = event.target.files[0];
    const base64 = await convertBase64(file);
    console.log(base64);

    let latitude=0;
    let longitude=0;
    let obj={};
    let form=document.querySelector(".form-box");
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById('fname').value;
    const date = document.getElementById('dateInp').value;
    const time = document.getElementById('timeInp').value;
    const description = document.getElementById('description').value;
    console.log("Stage-1");
    fetch("/getCord").then(response => response.json()).then(log => {
        latitude=log.latC;
        longitude=log.lonC;
        obj={
            image: base64,
            name: title,
            date: date,
            time:time,
            description:description,
            indexCords:{
                type:"Point",
                coordinates: [
                    latitude,
                    longitude
                ]
            },
            coords:[
                latitude,
                longitude
            ],
        }
        fetch("/sendWorkData",{
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

};

