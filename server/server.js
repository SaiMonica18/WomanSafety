const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// ======================================
// MIDDLEWARE
// ======================================

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
    res.status(200).send("Smart Women Safety Backend is running!");
});

// ======================================
// EMAIL TRANSPORTER TEST
// ======================================

app.get("/test-email", async (req, res) => {
    try {
        await emailTransporter.verify();

        res.status(200).json({
            success: true,
            message: "Email service is connected successfully"
        });

    } catch (error) {
        console.error("Email connection error:", error);

        res.status(500).json({
            success: false,
            message: "Email service connection failed"
        });
    }
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
        // CHECK RECIPIENT EMAIL
        // ----------------------------------

        if (!email && !emergencyContactEmail) {

            return res.status(400).json({
                success: false,
                message: "Emergency email is required"
            });

        }

        // ----------------------------------
        // CHECK GMAIL CONFIGURATION
        // ----------------------------------

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {

            console.error("EMAIL_USER or EMAIL_PASS is missing");

            return res.status(500).json({
                success: false,
                message: "Email configuration is missing on server"
            });

        }

        // ----------------------------------
        // GOOGLE MAPS LOCATION
        // ----------------------------------

        let mapLink = "Location unavailable";

        if (
            latitude !== undefined &&
            latitude !== null &&
            longitude !== undefined &&
            longitude !== null
        ) {

            mapLink =
                `https://maps.google.com/?q=${latitude},${longitude}`;

        }

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
            recipients.push(emergencyContactEmail);
        }

        // ----------------------------------
        // SEND EMAIL
        // ----------------------------------

        await emailTransporter.sendMail({

            from:
                `"Smart Women Safety" <${process.env.EMAIL_USER}>`,

            to:
                recipients.join(", "),

            subject:
                "🚨 EMERGENCY SOS ALERT - Smart Women Safety",

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

        return res.status(200).json({

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

        return res.status(500).json({

            success: false,

            message:
                "Failed to send emergency email"

        });

    }

});

// ======================================
// START SERVER
// ======================================

// IMPORTANT:
// Render provides its own PORT.
// Locally it will use 5000.

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Smart Women Safety Backend running on port ${PORT}`
    );

});