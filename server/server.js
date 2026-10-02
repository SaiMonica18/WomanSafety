const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");
require("dotenv").config();

const app = express();

// ======================================
// MIDDLEWARE
// ======================================

app.use(cors());
app.use(express.json());

// ======================================
// RESEND
// ======================================

const resend = new Resend(process.env.RESEND_API_KEY);

// ======================================
// TEST ROUTE
// ======================================

app.get("/", (req, res) => {
    res.status(200).send("Smart Women Safety Backend is running!");
});

// ======================================
// TEST EMAIL ROUTE
// ======================================

app.get("/test-email", async (req, res) => {

    try {

        if (!process.env.RESEND_API_KEY) {

            return res.status(500).json({
                success: false,
                message: "RESEND_API_KEY is missing"
            });

        }

        const { data, error } = await resend.emails.send({

            from: "Smart Women Safety <onboarding@resend.dev>",

            // IMPORTANT:
            // Replace this with your own Gmail address
            to: ["meofeb20@gmail.com"],

            subject: "Smart Women Safety Test Email",

            html: `
                <h2>Smart Women Safety</h2>
                <p>Email service is working successfully.</p>
                <p>This is a test email from the emergency safety system.</p>
            `
        });

        if (error) {

            console.error("Resend Error:", error);

            return res.status(500).json({
                success: false,
                message: error.message || "Resend email failed"
            });

        }

        console.log("Test email sent:", data);

        return res.status(200).json({
            success: true,
            message: "Test email sent successfully",
            id: data.id
        });

    } catch (error) {

        console.error("Test Email Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to send test email"
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

        // ==================================
        // CHECK RESEND API KEY
        // ==================================

        if (!process.env.RESEND_API_KEY) {

            return res.status(500).json({
                success: false,
                message: "RESEND_API_KEY is missing on server"
            });

        }

        // ==================================
        // CHECK EMAIL
        // ==================================

        if (!email && !emergencyContactEmail) {

            return res.status(400).json({
                success: false,
                message: "Emergency email is required"
            });

        }

        // ==================================
        // GOOGLE MAPS LINK
        // ==================================

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

        // ==================================
        // RECIPIENTS
        // ==================================

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

        // ==================================
        // SEND EMERGENCY EMAIL
        // ==================================

        const { data, error } = await resend.emails.send({

            from:
                "Smart Women Safety <onboarding@resend.dev>",

            to:
                recipients,

            subject:
                "🚨 EMERGENCY SOS ALERT - Smart Women Safety",

            html: `
                <h2>🚨 EMERGENCY SOS ALERT</h2>

                <p>
                    <strong>Smart Women Safety Emergency System</strong>
                </p>

                <hr>

                <p>
                    <strong>Name:</strong>
                    ${name || "Unknown"}
                </p>

                <p>
                    <strong>Phone:</strong>
                    ${phone || "Unknown"}
                </p>

                <p>
                    The user has activated the
                    <strong>Emergency SOS</strong> button.
                </p>

                <p>
                    <strong>Emergency Location:</strong>
                </p>

                <p>
                    <a href="${mapLink}" target="_blank">
                        📍 View Emergency Location on Google Maps
                    </a>
                </p>

                <p>
                    Latitude: ${latitude || "Unknown"}
                </p>

                <p>
                    Longitude: ${longitude || "Unknown"}
                </p>

                <hr>

                <p>
                    Please check the user's location immediately.
                </p>

                <p>
                    This is an automated emergency alert from
                    Smart Women Safety.
                </p>
            `
        });

        // ==================================
        // RESEND ERROR
        // ==================================

        if (error) {

            console.error("Resend Email Error:", error);

            return res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Failed to send emergency email"
            });
        }

        // ==================================
        // SUCCESS
        // ==================================

        console.log(
            "Emergency email sent successfully:",
            data.id
        );

        return res.status(200).json({

            success: true,

            message:
                "Emergency email sent successfully",

            id:
                data.id
        });

    } catch (error) {

        console.error(
            "Emergency Email Error:",
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

const PORT =
    process.env.PORT || 5000;

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Smart Women Safety Backend running on port ${PORT}`
        );

    }
);

