import {
    db,
    collection,
    addDoc,
    serverTimestamp
} from "./firebase.js";

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

        status.innerText =
            "Location is not supported by this browser.";

        return;
    }

    // Get current location
    navigator.geolocation.getCurrentPosition(

        async (position) => {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            status.innerText =
                "Sending emergency alert...";

            try {

                // Save SOS details in Firebase
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

                status.innerText =
                    "🚨 Emergency alert sent successfully!";

                alert(
                    "Emergency SOS sent successfully!"
                );

            } catch (error) {

                console.error(error);

                status.innerText =
                    "Error sending emergency alert.";

                alert(
                    "Error: " + error.message
                );
            }
        },

        (error) => {

            console.error(error);

            status.innerText =
                "Unable to get your location.";

            alert(
                "Please allow location access."
            );
        }
    );
});