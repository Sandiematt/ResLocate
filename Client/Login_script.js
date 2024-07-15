let Uname=document.getElementById('name_inp');
let pass=document.getElementById('pass_inp');
let button=document.querySelector('.sumbit-btn');

button.addEventListener("click",()=>{
    let obj={
        username: Uname.value,
        password: pass.value
    }
    fetch("/auth",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(obj)
    }).then(response => response.json()).then(auth => {
        if(auth.auth==1){
            window.location.href = "http://localhost:5000/Contributors_page";
        }
        else{
            document.querySelector(".auth_fail").removeAttribute("hidden");
        }
    })
})

