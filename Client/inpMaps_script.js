fetch("/check").then(response => response.json()).then(log => {
    if(log.log==0){
      window.location.href = "http://localhost:5000/login.html";
    }
})

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 0, lng: 0},
        zoom: 2
    });

    var marker = new google.maps.Marker({
        position: {lat: 0, lng: 0},
        map: map,
        draggable: true
    });

    google.maps.event.addListener(map, 'click', function(event) {
        marker.setPosition(event.latLng);
    });

    let set_cord_but=document.querySelector("#but");
    set_cord_but.addEventListener('click',()=>{
        updateCoordinates(marker.getPosition().lat(), marker.getPosition().lng());
        let cords={
            lat: marker.getPosition().lat(),
            lon: marker.getPosition().lng()
        };
        fetch("/sendCords",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(cords)
        });
    })
}

function updateCoordinates(latitude, longitude) {
    document.getElementById('latitude').textContent = latitude.toFixed(6);
    document.getElementById('longitude').textContent = longitude.toFixed(6);
}
