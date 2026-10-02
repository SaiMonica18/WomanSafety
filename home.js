import {
    db,
    collection,
    addDoc,
    serverTimestamp
} from "./firebase.js";


// ===============================
// ELEMENTS
// ===============================

const sosButton =
    document.getElementById("sosButton");

const status =
    document.getElementById("status");

const userInfo =
    document.getElementById("userInfo");

const profileButton =
    document.getElementById("profileButton");

const profileSection =
    document.getElementById("profileSection");

const profileName =
    document.getElementById("profileName");

const profilePhone =
    document.getElementById("profilePhone");

const profileGender =
    document.getElementById("profileGender");

const profileEmail =
    document.getElementById("profileEmail");

const contactName =
    document.getElementById("contactName");

const contactEmail =
    document.getElementById("contactEmail");

const updateProfileButton =
    document.getElementById("updateProfileButton");


// ===============================
// GET SAVED USER DETAILS
// ===============================

let name =
    localStorage.getItem("userName");

let phone =
    localStorage.getItem("userPhone");

let gender =
    localStorage.getItem("userGender");

let email =
    localStorage.getItem("emergencyEmail");

let emergencyContactName =
    localStorage.getItem("contactName");

let emergencyContactEmail =
    localStorage.getItem("contactEmail");


// ===============================
// SHOW USER INFORMATION
// ===============================

function showUserInfo() {

    userInfo.innerHTML = `
        Name: ${name || "Not available"} <br>
        Phone: ${phone || "Not available"} <br>
        Gender: ${gender || "Not available"} <br>
        Emergency Contact:
        ${emergencyContactName || "Not available"}
    `;
}


// ===============================
// SHOW PROFILE DETAILS
// ===============================

function showProfile() {

    profileName.value =
        name || "";

    profilePhone.value =
        phone || "";

    profileGender.value =
        gender || "";

    profileEmail.value =
        email || "";

    contactName.value =
        emergencyContactName || "";

    contactEmail.value =
        emergencyContactEmail || "";
}


// ===============================
// HIDE PROFILE INITIALLY
// ===============================

profileSection.style.display =
    "none";


// ===============================
// PROFILE BUTTON
// ===============================

profileButton.addEventListener(
    "click",
    () => {

        if (
            profileSection.style.display ===
            "none"
        ) {

            profileSection.style.display =
                "block";

            showProfile();

        } else {

            profileSection.style.display =
                "none";
        }

    }
);


// ===============================
// UPDATE PROFILE
// ===============================

updateProfileButton.addEventListener(
    "click",
    () => {

        const newName =
            profileName.value.trim();

        const newPhone =
            profilePhone.value.trim();

        const newEmail =
            profileEmail.value.trim();

        const newContactName =
            contactName.value.trim();

        const newContactEmail =
            contactEmail.value.trim();


        // Check name

        if (newName === "") {

            alert(
                "Please enter your name."
            );

            return;
        }


        // Check phone

        if (newPhone === "") {

            alert(
                "Please enter your phone number."
            );

            return;
        }


        // Check emergency email

        if (newEmail === "") {

            alert(
                "Please enter emergency email."
            );

            return;
        }


        // Check contact name

        if (newContactName === "") {

            alert(
                "Please enter emergency contact name."
            );

            return;
        }


        // Check contact email

        if (newContactEmail === "") {

            alert(
                "Please enter emergency contact email."
            );

            return;
        }


        // ===============================
        // UPDATE VARIABLES
        // ===============================

        name =
            newName;

        phone =
            newPhone;

        email =
            newEmail;

        emergencyContactName =
            newContactName;

        emergencyContactEmail =
            newContactEmail;


        // ===============================
        // SAVE DETAILS
        // ===============================

        localStorage.setItem(
            "userName",
            name
        );

        localStorage.setItem(
            "userPhone",
            phone
        );

        localStorage.setItem(
            "emergencyEmail",
            email
        );

        localStorage.setItem(
            "contactName",
            emergencyContactName
        );

        localStorage.setItem(
            "contactEmail",
            emergencyContactEmail
        );


        // Refresh user information

        showUserInfo();


        alert(
            "Profile updated successfully!"
        );


        profileSection.style.display =
            "none";

    }
);


// ===============================
// SOS BUTTON
// ===============================

sosButton.addEventListener(
    "click",
    () => {

        status.innerText =
            "Getting your location...";


        // Check location support

        if (!navigator.geolocation) {

            status.innerText =
                "Location is not supported by this browser.";

            return;
        }


        navigator.geolocation.getCurrentPosition(

            async (position) => {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                status.innerText =
                    "Sending emergency alert...";


                try {

                    // ===============================
                    // SAVE SOS TO FIREBASE
                    // ===============================

                    await addDoc(
                        collection(
                            db,
                            "sosAlerts"
                        ),
                        {

                            name:
                                name || "Unknown",

                            phone:
                                phone || "Unknown",

                            gender:
                                gender || "Unknown",

                            email:
                                email || "Unknown",

                            emergencyContactName:
                                emergencyContactName ||
                                "Unknown",

                            emergencyContactEmail:
                                emergencyContactEmail ||
                                "Unknown",

                            latitude:
                                latitude,

                            longitude:
                                longitude,

                            time:
                                serverTimestamp(),

                            status:
                                "Emergency"
                        }
                    );


                    // ===============================
                    // SEND EMERGENCY EMAIL
                    // ===============================

                    const response =
                        await fetch(
                            "http://localhost:5000/send-email",
                            {

                                method:
                                    "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

                                        name:
                                            name,

                                        phone:
                                            phone,

                                        email:
                                            email,

                                        emergencyContactEmail:
                                            emergencyContactEmail,

                                        latitude:
                                            latitude,

                                        longitude:
                                            longitude
                                    })
                            }
                        );


                    // ===============================
                    // GET SERVER RESPONSE
                    // ===============================

                    const result =
                        await response.json();


                    console.log(
                        "Email response:",
                        result
                    );


                    // ===============================
                    // EMAIL SUCCESS
                    // ===============================

                    if (
                        response.ok &&
                        result.success
                    ) {

                        status.innerText =
                            "🚨 Emergency emails sent successfully!";

                        alert(
                            "🚨 Emergency SOS sent successfully!"
                        );

                    } else {

                        status.innerText =
                            "SOS saved, but email could not be sent.";

                        alert(
                            "SOS saved, but email sending failed."
                        );

                    }


                } catch (error) {

                    console.error(
                        "SOS Error:",
                        error
                    );


                    status.innerText =
                        "Error sending emergency alert.";


                    alert(
                        "Error: " +
                        error.message
                    );

                }

            },


            // ===============================
            // LOCATION ERROR
            // ===============================

            (error) => {

                console.error(
                    error
                );


                status.innerText =
                    "Unable to get your location.";


                alert(
                    "Please allow location access."
                );

            }

        );

    }
);


// ===============================
// SHOW USER INFORMATION
// ===============================

showUserInfo();