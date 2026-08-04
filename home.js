import { db, collection, addDoc, serverTimestamp } from "./firebase.js";

const GAS_URL = "https://script.google.com/macros/s/AKfycbzRU6nT9KObD4OhYhnT2k9o2Z9gsMKfuU9j3gsBww7_7Z_OsQg9H45rS06_90HY_f987Q/exec";

// Element References
const sosButton = document.getElementById("sosButton");
const safeButton = document.getElementById("safeButton");
const status = document.getElementById("status");
const userInfo = document.getElementById("userInfo");
const logoutBtn = document.getElementById("logoutBtn");

// 1. Session Management
const sessionData = localStorage.getItem("activeSession");

if (!sessionData) {
    // If no active session, redirect to login
    window.location.href = "login.html";
}

const user = JSON.parse(sessionData);

// Populate User Profile
userInfo.innerHTML = `
    <strong>Profile Active</strong><br>
    👤 ${user.name} (Age: ${user.age})<br>
    📞 ${user.mobile} <br>
    ⚧️ ${user.gender}
`;

let triggeredPoleId = null;

// --- 2. EMERGENCY SOS TRIGGER ---
sosButton.addEventListener("click", () => {
    status.innerText = "📡 Acquiring precise GPS location...";
    sosButton.style.display = "none"; 

    if (!navigator.geolocation) {
        status.innerText = "❌ Location services are not supported.";
        sosButton.style.display = "block";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            status.innerText = "⚡ Transmitting alert to Smart Street Lights...";

            try {
                // Log to Firebase
                await addDoc(collection(db, "sosAlerts"), {
                    name: user.name,
                    phone: user.mobile,
                    gender: user.gender,
                    latitude: latitude,
                    longitude: longitude,
                    time: serverTimestamp(),
                    status: "Emergency"
                });

                // Ping Apps Script
                const cacheBuster = new Date().getTime();
                const response = await fetch(`${GAS_URL}?action=triggerSOS&name=${user.name}&lat=${latitude}&lng=${longitude}&t=${cacheBuster}`);
                const gasData = await response.json();

                if (gasData.distance <= 50 && gasData.nearestPole !== "None") {
                    // SAVE POLE ID TO LOCAL STORAGE SO IT IS NEVER LOST
                    localStorage.setItem("activeEmergencyPole", gasData.nearestPole);
                    
                    status.innerHTML = `🚨 ACTIVE ALARM: Nearest street light <b>${gasData.nearestPole}</b> activated (${gasData.distance}m away).`;
                } else {
                    status.innerHTML = `🚨 ALERT SENT: No smart pole within 50m. Dashboard updated.`;
                }

                safeButton.style.display = "block";

            } catch (error) {
                console.error("SOS Error:", error);
                status.innerText = "❌ Network error. Alert logged to database only.";
                safeButton.style.display = "block";
            }
        },
        (error) => {
            console.error("GPS Error:", error);
            status.innerText = "❌ Location access denied. Enable GPS to use SOS.";
            sosButton.style.display = "block";
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
});

// --- 3. I AM SAFE (ALARM RESOLUTION) ---
safeButton.addEventListener("click", async () => {
    status.innerText = "🔄 Sending deactivation signal...";
    safeButton.disabled = true;

    try {
        // Retrieve the saved Pole ID from storage
        const poleToTurnOff = localStorage.getItem("activeEmergencyPole");

        if (poleToTurnOff && poleToTurnOff !== "None") {
            const cacheBuster = new Date().getTime();
            // Send request to Apps Script
            await fetch(`${GAS_URL}?action=resolveSOS&poleId=${poleToTurnOff}&t=${cacheBuster}`);
            
            // Clear it from storage once successful
            localStorage.removeItem("activeEmergencyPole");
        }

        status.innerHTML = "✅ Safety confirmed. Hardware alarms deactivated.";
        
        setTimeout(() => {
            safeButton.style.display = "none";
            safeButton.disabled = false;
            sosButton.style.display = "block";
            status.innerText = "System Ready.";
        }, 3000);

    } catch (error) {
        console.error("Resolve Error:", error);
        status.innerText = "❌ Error reaching server. Trying to reset UI.";
        safeButton.disabled = false;
    }
});

// --- 4. LOGOUT ---
logoutBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to log out?")) {
        // Remove only the active session, keeping the registered accounts intact
        localStorage.removeItem("activeSession");
        window.location.href = "login.html";
    }
});
