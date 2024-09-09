const express = require('express');
const router = express.Router();
const Guest = require('../models/Guest');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');

// Generate QR code and send RSVP link

router.post('/invite', async (req, res) => {
    const { name, email } = req.body;

    try {
        const guest = new Guest({ name, email });
        const qrCodeUrl = await QRCode.toDataURL(`${process.env.BASE_URL}:8080/rsvp/${guest._id}`);
        guest.qrCode = qrCodeUrl;
        await guest.save();

        // Set up Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Send the email with embedded QR code
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Aneez Akbar Fazal Birthday Invitation',
            html: `<p>You're invited! Scan this QR code to RSVP:</p><img src="cid:qrCode" alt="QR Code"/>`,
            attachments: [
                {
                    filename: 'qrcode.png',
                    path: qrCodeUrl,
                    cid: 'qrCode' // same cid as in the html img src
                }
            ]
        });

        res.status(200).json({ message: 'Invite sent successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// router.post('/invite', async (req, res) => {
//     const { name, email } = req.body;

//     try {
//         // Check if the guest already exists
//         const guestExists = await Guest.findOne({ email });
//         if (guestExists) {
//             return res.status(400).json({ message: 'Guest already invited with this email' });
//         }

//         // Create new guest
//         const guest = new Guest({ name, email });

//         // Generate QR code with RSVP link
//         const qrCodeUrl = await QRCode.toDataURL(`http://localhost:8080/rsvp/${guest._id}`);
//         guest.qrCode = qrCodeUrl;
//         await guest.save();

//         // Send invite email with QR code
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS,
//             },
//         });

//         await transporter.sendMail({
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: 'Aneez Akbar Fazal Birthday Invitation',
//             html: `<p>You're invited! Scan this QR code to RSVP:</p><img src="${qrCodeUrl}" alt="QR Code"/>`,
//         });

//         res.status(200).json({ message: 'Invite sent successfully' });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// RSVP Route
router.get('/rsvp/:id', async (req, res) => {
    try {
        const guest = await Guest.findById(req.params.id);
        if (!guest) return res.status(404).json({ message: 'Guest not found' });

        guest.rsvp = true;
        await guest.save();
        res.status(200).json({ message: 'RSVP confirmed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Verification at the entrance
router.post('/verify', async (req, res) => {
    const { id } = req.body;
    try {
        const guest = await Guest.findById(id);
        if (!guest) return res.status(404).json({ message: 'Guest not found' });
        if (guest.verified) return res.status(400).json({ message: 'Already verified' });

        guest.verified = true;
        await guest.save();
        res.status(200).json({ message: 'Guest verified for entrance' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
