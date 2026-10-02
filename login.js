function login() {

    // Get Name
    let name = document.getElementById("name").value.trim();

    // Get Phone Number
    let phone = document.getElementById("phone").value.trim();

    // Get Gender
    let gender = document.getElementById("gender").value;


    // Check Name
    if (name === "") {

        alert("Please enter your name.");

        return;
    }


    // Check Phone Number
    if (phone === "") {

        alert("Please enter your phone number.");

        return;
    }


    // Check Gender
    if (gender === "") {

        alert("Please select your gender.");

        return;
    }


    // Save user details
    localStorage.setItem("userName", name);

    localStorage.setItem("userPhone", phone);

    localStorage.setItem("userGender", gender);


    // Go to Home Page
    window.location.href = "home.html";

}