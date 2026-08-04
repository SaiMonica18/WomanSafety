import { db, collection, addDoc, serverTimestamp } from "./firebase.js";

const GAS_URL = "https://script.google.com/macros/s/AKfycbzRU6nT9KObD4OhYhnT2k9o2Z9gsMKfuU9j3gsBww7_7Z_OsQg9H45rS06_90HY_f987Q/exec";

// Element References
const sosButton = document.getElementById("sosButton");
const safeButton = document.getElementById("safeButton");
const status = document.getElementById("status");
const userInfo = document.getElementById("userInfo");
const logoutBtn = document.getElementById("logoutBtn");

// Session Management
const name = localStorage.getItem("userName");
const phone = localStorage.getItem("userPhone");
const gender = localStorage.getItem("userGender");

// Redirect to login if user data is missing
if (!name || !phone) {
    window.location.href = "index.html";
}

// Populate User Profile
userInfo.innerHTML = `
    <strong>Profile Active</strong><br>
    👤 ${name} <br>
    📞 ${phone} <br>
    ⚧️ ${gender}
`;

// State variable to track the active street light alarm
let triggeredPoleId = null;

// --- 1. EMERGENCY SOS TRIGGER ---
sosButton.addEventListener("click", () => {
    status.innerText = "📡 Acquiring precise GPS location...";
    sosButton.disabled = true; // Prevent spam clicking
    sosButton.style.opacity = "0.7";

    if (!navigator.geolocation) {
        status.innerText = "❌ Location services are not supported by this browser.";
        sosButton.disabled = false;
        sosButton.style.opacity = "1";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            status.innerText = "⚡ Transmitting alert to Smart Street Lights...";

            try {
                // A. Log to Firebase Dashboard
                await addDoc(collection(db, "sosAlerts"), {
                    name: name,
                    phone: phone,
                    gender: gender,
                    latitude: latitude,
                    longitude: longitude,
                    time: serverTimestamp(),
                    status: "Emergency"
                });

                // B. Ping Apps Script to calculate distance and trigger ESP32
                const response = await fetch(`${GAS_URL}?action=triggerSOS&name=${name}&lat=${latitude}&lng=${longitude}`);
                const gasData = await response.json();

                // C. Process the hardware response
                if (gasData.distance <= 50) {
                    triggeredPoleId = gasData.nearestPole;
                    status.innerHTML = `🚨 ACTIVE ALARM: Nearest street light <b>${gasData.nearestPole}</b> activated (${gasData.distance}m away).`;
                } else {
                    status.innerHTML = `🚨 ALERT SENT: No smart pole within 50m (Nearest is ${gasData.distance}m). Cloud dashboard updated.`;
                    triggeredPoleId = gasData.nearestPole; // Store anyway in case user walks toward it
                }

                // D. UI Updates: Hide SOS, Show Safe Button
                sosButton.style.display = "none";
                safeButton.style.display = "block";

            } catch (error) {
                console.error(error);
                status.innerText = "❌ Network error. Could not reach hardware nodes.";
                sosButton.disabled = false;
                sosButton.style.opacity = "1";
            }
        },
        (error) => {
            console.error(error);
            status.innerText = "❌ Location access denied. Enable GPS to use SOS.";
            sosButton.disabled = false;
            sosButton.style.opacity = "1";
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
});

// --- 2. I AM SAFE (ALARM RESOLUTION) ---
safeButton.addEventListener("click", async () => {
    status.innerText = "🔄 Sending deactivation signal...";
    safeButton.disabled = true;
    safeButton.style.opacity = "0.7";

    try {
        if (triggeredPoleId) {
            // Tell Apps Script to switch the specific ESP32 buzzer to "OFF"
            const response = await fetch(`${GAS_URL}?action=resolveSOS&poleId=${triggeredPoleId}`);
            await response.json();
        }

        // Acknowledge safety and reset UI
        status.innerHTML = "✅ Safety confirmed. Hardware alarms deactivated.";
        
        setTimeout(() => {
            safeButton.style.display = "none";
            sosButton.style.display = "block";
            sosButton.disabled = false;
            sosButton.style.opacity = "1";
            safeButton.disabled = false;
            safeButton.style.opacity = "1";
            status.innerText = "System Ready.";
            triggeredPoleId = null;
        }, 3000);

    } catch (error) {
        console.error(error);
        status.innerText = "❌ Error reaching server. Please try again.";
        safeButton.disabled = false;
        safeButton.style.opacity = "1";
    }
});

// --- 3. LOGOUT ---
logoutBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to log out of the Safety Network?")) {
        localStorage.clear();
        window.location.href = "index.html";
    }
});
