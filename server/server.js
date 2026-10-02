const express = require("express");
const cors = require("cors");
require("dotenv").config();
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());


// ======================================
// GMAIL EMAIL TRANSPORTER
// ======================================

const emailTransporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    tls: {
        rejectUnauthorized: false
    }
});


// ======================================
// TEST ROUTE
// ======================================

app.get("/", (req, res) => {

    res.send("Smart Women Safety Backend is running!");

});


// ======================================
// SEND EMERGENCY EMAIL
// ======================================

app.post("/send-email", async (req, res) => {

    try {

        const {
            name,
            phone,
            email,
            emergencyContactEmail,
            latitude,
            longitude
        } = req.body;


        // ----------------------------------
        // CHECK EMAIL
        // ----------------------------------

        if (!email && !emergencyContactEmail) {

            return res.status(400).json({

                success: false,

                message: "Emergency email is required"

            });

        }


        // ----------------------------------
        // GOOGLE MAPS LOCATION
        // ----------------------------------

        const mapLink =
            `https://maps.google.com/?q=${latitude},${longitude}`;


        // ----------------------------------
        // CREATE RECIPIENT LIST
        // ----------------------------------

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


        // ----------------------------------
        // SEND EMAIL
        // ----------------------------------

        await emailTransporter.sendMail({

            // Display name shown in Gmail
            from:
                `"Smart Women Safety" <${process.env.EMAIL_USER}>`,

            // Send to user's email/contact email
            to:
                recipients.join(", "),

            subject:
                "🚨 EMERGENCY SOS ALERT",

            text:
`EMERGENCY ALERT!

Smart Women Safety Emergency System

Name: ${name || "Unknown"}

Phone: ${phone || "Unknown"}

The user has activated the Emergency SOS button.

Emergency Location:
${mapLink}

Please check the user's location immediately.

This is an automated emergency alert from Smart Women Safety.`

        });


        // ----------------------------------
        // SUCCESS
        // ----------------------------------

        console.log(
            "Emergency email sent successfully to:",
            recipients.join(", ")
        );


        res.json({

            success: true,

            message:
                "Emergency email sent successfully"

        });


    } catch (error) {

        // ----------------------------------
        // ERROR
        // ----------------------------------

        console.error(
            "Email Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to send emergency email"

        });

    }

});


// ======================================
// START SERVER
// ======================================

const PORT = 5000;

app.listen(PORT, () => {

    console.log(
        `Backend running on http://localhost:${PORT}`
    );

});