import {
    db,
    collection,
    addDoc,
    serverTimestamp
} from "./firebase.js";

// ===============================
// EMAILJS INITIALIZATION
// ===============================

emailjs.init({
    publicKey: "j4RX_dJK64Ql7eJTs"
});


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
    localStorage.getItem("userName") || "";

let phone =
    localStorage.getItem("userPhone") || "";

let gender =
    localStorage.getItem("userGender") || "";

let email =
    localStorage.getItem("emergencyEmail") || "";

let emergencyContactName =
    localStorage.getItem("contactName") || "";

let emergencyContactEmail =
    localStorage.getItem("contactEmail") || "";


// ===============================
// SHOW USER INFORMATION
// ===============================

function showUserInfo() {

    if (!userInfo) return;

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

    if (!profileSection) return;

    profileName.value = name;
    profilePhone.value = phone;
    profileGender.value = gender;
    profileEmail.value = email;

    contactName.value = emergencyContactName;
    contactEmail.value = emergencyContactEmail;
}


// ===============================
// HIDE PROFILE INITIALLY
// ===============================

if (profileSection) {

    profileSection.style.display = "none";
}


// ===============================
// PROFILE BUTTON
// ===============================

if (profileButton) {

    profileButton.addEventListener(
        "click",
        () => {

            if (
                profileSection.style.display === "none"
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
}


// ===============================
// UPDATE PROFILE
// ===============================

if (updateProfileButton) {

    updateProfileButton.addEventListener(
        "click",
        () => {

            const newName =
                profileName.value.trim();

            const newPhone =
                profilePhone.value.trim();

            const newGender =
                profileGender.value.trim();

            const newEmail =
                profileEmail.value.trim();

            const newContactName =
                contactName.value.trim();

            const newContactEmail =
                contactEmail.value.trim();


            // ===============================
            // VALIDATION
            // ===============================

            if (newName === "") {

                alert(
                    "Please enter your name."
                );

                return;
            }

            if (newPhone === "") {

                alert(
                    "Please enter your phone number."
                );

                return;
            }

            if (newGender === "") {

                alert(
                    "Please enter your gender."
                );

                return;
            }

            if (newEmail === "") {

                alert(
                    "Please enter emergency email."
                );

                return;
            }

            if (newContactName === "") {

                alert(
                    "Please enter emergency contact name."
                );

                return;
            }

            if (newContactEmail === "") {

                alert(
                    "Please enter emergency contact email."
                );

                return;
            }


            // ===============================
            // UPDATE VARIABLES
            // ===============================

            name = newName;
            phone = newPhone;
            gender = newGender;
            email = newEmail;

            emergencyContactName =
                newContactName;

            emergencyContactEmail =
                newContactEmail;


            // ===============================
            // SAVE TO LOCAL STORAGE
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
                "userGender",
                gender
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


            // ===============================
            // REFRESH USER INFORMATION
            // ===============================

            showUserInfo();

            alert(
                "Profile updated successfully!"
            );

            profileSection.style.display =
                "none";
        }
    );
}


// ===============================
// SOS BUTTON
// ===============================

if (sosButton) {

    sosButton.addEventListener(
        "click",
        () => {

            if (status) {

                status.innerText =
                    "Getting your location...";
            }


            // ===============================
            // CHECK LOCATION SUPPORT
            // ===============================

            if (!navigator.geolocation) {

                if (status) {

                    status.innerText =
                        "Location is not supported by this browser.";
                }

                return;
            }


            // ===============================
            // GET CURRENT LOCATION
            // ===============================

            navigator.geolocation.getCurrentPosition(

                async (position) => {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;


                    if (status) {

                        status.innerText =
                            "Saving emergency alert...";
                    }


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


                        console.log(
                            "SOS saved to Firebase successfully."
                        );


                        // ===============================
                        // GOOGLE MAPS LINK
                        // ===============================

                        const mapLink =
                            `https://maps.google.com/?q=${latitude},${longitude}`;


                        // ===============================
                        // CREATE RECIPIENT LIST
                        // ===============================

                        const recipients = [];


                        if (email) {

                            recipients.push(email);
                        }


                        if (
                            emergencyContactEmail &&
                            emergencyContactEmail !== email
                        ) {

                            recipients.push(
                                emergencyContactEmail
                            );
                        }


                        // ===============================
                        // CHECK EMAILS
                        // ===============================

                        if (recipients.length === 0) {

                            if (status) {

                                status.innerText =
                                    "SOS saved, but no email address found.";
                            }

                            alert(
                                "SOS saved, but no email address is available."
                            );

                            return;
                        }


                        if (status) {

                            status.innerText =
                                "Sending emergency email...";
                        }


                        // ===============================
                        // SEND EMAIL TO EACH RECIPIENT
                        // ===============================

                        for (
                            const recipient of recipients
                        ) {

                            await emailjs.send(

                                "service_hn9347h",

                                "template_g213jjx",

                                {

                                    to_email:
                                        recipient,

                                    name:
                                        name || "Unknown",

                                    phone:
                                        phone || "Unknown",

                                    gender:
                                        gender || "Unknown",

                                    map_link:
                                        mapLink,

                                    latitude:
                                        latitude,

                                    longitude:
                                        longitude
                                }
                            );
                        }


                        // ===============================
                        // EMAIL SUCCESS
                        // ===============================

                        console.log(
                            "Emergency email(s) sent successfully."
                        );


                        if (status) {

                            status.innerText =
                                "🚨 Emergency emails sent successfully!";
                        }


                        alert(
                            "🚨 Emergency SOS sent successfully!"
                        );


                    } catch (error) {

                        // ===============================
                        // ERROR
                        // ===============================

                        console.error(
                            "EmailJS / SOS Error:",
                            error
                        );


                        if (status) {

                            status.innerText =
                                "SOS saved, but email sending failed.";
                        }


                        alert(
                            "SOS was saved, but email sending failed.\n\n" +
                            "Error: " +
                            (error.text ||
                             error.message ||
                             "Unknown error")
                        );
                    }

                },


                // ===============================
                // LOCATION ERROR
                // ===============================

                (error) => {

                    console.error(
                        "Location error:",
                        error
                    );


                    if (status) {

                        status.innerText =
                            "Unable to get your location.";
                    }


                    alert(
                        "Please allow location access."
                    );
                },


                // ===============================
                // LOCATION OPTIONS
                // ===============================

                {

                    enableHighAccuracy:
                        true,

                    timeout:
                        10000,

                    maximumAge:
                        0
                }
            );
        }
    );
}


// ===============================
// INITIAL USER INFORMATION
// ===============================

showUserInfo();