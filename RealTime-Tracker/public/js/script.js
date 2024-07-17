const socket = io(); 

let map; 

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { latitude, longitude });
            console.log(`Location sent: ${latitude}, ${longitude}`);

            if (!map) {
                map = L.map("map").setView([latitude, longitude], 10);

                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: "OpenStreetMap"
                }).addTo(map);
            }

            if (markers["current"]) {
                markers["current"].setLatLng([latitude, longitude]);
            } else {
                markers["current"] = L.marker([latitude, longitude]).addTo(map);
            }
        },
        (error) => {
            console.error('Geolocation error:', error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
} else {
    console.error("Geolocation is not supported by this browser.");
}

const markers = {};

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    if (!map) {
        map = L.map("map").setView([latitude, longitude], 10);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "OpenStreetMap"
        }).addTo(map);
    }

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

socket.on("disconnect", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
