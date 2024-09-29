const crypto = require('crypto');
const nodemailer = require('nodemailer');

app.post('/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  // Check if the email exists in your database
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ err: "User not found" });
  }

  // Generate a password reset token
  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  // Send email
  const transporter = nodemailer.createTransport({
    // Configure your email service here
  });

  const mailOptions = {
    to: user.email,
    from: 'youremail@example.com',
    subject: 'Rhythm Password Reset',
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      http://${req.headers.host}/reset/${resetToken}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      return res.status(500).json({ err: "Error sending email" });
    }
    res.json({ message: 'An e-mail has been sent with further instructions.' });
  });
});