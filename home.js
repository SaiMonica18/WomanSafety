import {
    db,
    collection,
    addDoc,
    serverTimestamp
} from "./firebase.js";

// Add your Google Apps Script URL here
const GAS_URL = "https://script.google.com/macros/s/AKfycbzRU6nT9KObD4OhYhnT2k9o2Z9gsMKfuU9j3gsBww7_7Z_OsQg9H45rS06_90HY_f987Q/exec";

const sosButton = document.getElementById("sosButton");
const status = document.getElementById("status");
const userInfo = document.getElementById("userInfo");

// Get login details
const name = localStorage.getItem("userName");
const phone = localStorage.getItem("userPhone");
const gender = localStorage.getItem("userGender");

// Show user details
userInfo.innerHTML = `
    Name: ${name || "Not available"} <br>
    Phone: ${phone || "Not available"} <br>
    Gender: ${gender || "Not available"}
`;

// When SOS button is clicked
sosButton.addEventListener("click", () => {
    status.innerText = "Getting your location...";

    // Check location support
    if (!navigator.geolocation) {
        status.innerText = "Location is not supported by this browser.";
        return;
    }

    // Get current location
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            status.innerText = "Sending emergency alert to database and street lights...";

            try {
                // 1. Save SOS details in Firebase (Updates your Emergency Dashboard)
                await addDoc(
                    collection(db, "sosAlerts"),
                    {
                        name: name || "Unknown",
                        phone: phone || "Unknown",
                        gender: gender || "Unknown",
                        latitude: latitude,
                        longitude: longitude,
                        time: serverTimestamp(),
                        status: "Emergency"
                    }
                );

                // 2. Send SOS to Google Apps Script (Triggers the ESP32 Buzzer)
                const response = await fetch(`${GAS_URL}?action=triggerSOS&name=${name}&lat=${latitude}&lng=${longitude}`);
                const gasData = await response.json();

                // 3. Update the UI based on the distance to the nearest pole
                if (gasData.distance <= 50) {
                    status.innerHTML = `🚨 Emergency alert sent! Nearest street light <b>${gasData.nearestPole}</b> activated (${gasData.distance}m away).`;
                } else {
                    status.innerHTML = `🚨 Emergency alert sent! No smart street light within 50m (Nearest is ${gasData.distance}m away).`;
                }

                alert("Emergency SOS sent successfully!");

            } catch (error) {
                console.error(error);
                status.innerText = "Error sending emergency alert.";
                alert("Error: " + error.message);
            }
        },
        (error) => {
            console.error(error);
            status.innerText = "Unable to get your location.";
            alert("Please allow location access.");
        }
    );
});
