navigator.geolocation.getCurrentPosition(function(position) {
    const userLocation = {
    lat: position.coords.latitude,
    lng: position.coords.longitude};

    const obj={
        "lat":userLocation.lat,
        "lon":userLocation.lng
    }
    fetch("/getLocWork",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(obj)
    })
    .then(response => response.json())
    .then(locations => {
        const jsonData = locations;
        //console.log(jsonData);
        const container = document.getElementById('container');
        const popup = document.getElementById('popup');
        const closeBtn = document.getElementById('closeBtn');
        const popupTitle = document.getElementById('popupTitle');
        const popupImg = document.getElementById('popupImg');
        const popupDescription = document.getElementById('popupDescription');
        const popupDirections=document.getElementById('dir');
        const dirbut=document.querySelector(".dirLink");

        // Function to display JSON data dynamically
        function displayData() {
        container.innerHTML = '';
        jsonData.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('card');

            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.name;
            img.style.maxWidth = '100%';

            const name = document.createElement('h3');
            name.textContent = item.name;

            const dateTime = document.createElement('p');
            dateTime.textContent = `Date: ${item.date}`;

            const time = document.createElement('p');
            time.textContent = `Time: ${item.time}`;

            card.appendChild(img);
            card.appendChild(name);
            card.appendChild(dateTime);
            card.appendChild(time);

            card.addEventListener('click', () => openPopup(item));

            container.appendChild(card);
        });
        }

        // Function to open popup with all information
        // Function to open popup with all information
        function generateDirectionsURL(destination) {
            const googleMapsUrlBase = 'https://www.google.com/maps/place/';
            return googleMapsUrlBase + destination.toString();
        }
        
        function openPopup(item) {
            container.style.opacity='60%';
            popupTitle.textContent = item.name;
            popupImg.src = item.image;
            popupDateTime.textContent = `Date & Time: ${item.date} ${item.time}`;
            popupDescription.textContent = `${item.description}`;
            dirbut.setAttribute("href",generateDirectionsURL(item.coords))
            popup.style.display = 'block';
            closeBtn.addEventListener('click', () => {
                closePopup();
            });

            window.addEventListener('click', (e) => {
                if (e.target === popup) {
                closePopup();
                }
            });
        }

        // Function to close the popup
        function closePopup() {
            popup.style.animation = 'fadeOut 0.5s ease-in-out'; // Add fadeOut animation
            setTimeout(() => {
                popup.style.display = 'none';
                popup.style.animation = ''; // Reset animation
            }, 0); // Wait for animation to finish
            container.style.opacity='100%';
        }

        // Call the function to display data
        displayData();
    })
})






//----------------------------------------------------------------------------
