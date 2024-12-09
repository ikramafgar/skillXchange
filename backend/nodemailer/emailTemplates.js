export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification for SkillXChange</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #00c6ff, #0072ff); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Email Verification - SkillXChange</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; margin-bottom: 20px;">Hello 👋</p>
    <p style="font-size: 16px;">Thank you for signing up at <strong>SkillXChange</strong>! To complete your registration, please verify your email address by clicking the button below.</p>
    <div style="  font-size: 24px;font-weight: bold;text-align: center;margin: 20px 0;color: #2196F3;">
     <div >{verificationCode}</div>
    </div>
    <p style="margin-top: 20px;">If you did not create an account, please ignore this email.</p>
    <p>Best regards,<br>The SkillXChange Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;
export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - SkillXChange</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #00c6ff, #0072ff); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">SkillXChange - Password Reset</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; margin-bottom: 20px;">Hello {name},</p>
    <p style="font-size: 16px;">We received a request to reset your password for your SkillXChange account. If you did not request this change, please ignore this email. Otherwise, use the link below to reset your password:</p>
    
    <div style="text-align: center; margin: 20px;">
      <a href="{resetURL}" style="background-color: #0072ff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
    </div>

    <p>If you did not request this change or need help, please contact us immediately at support@skillxchange.com.</p>
    
    <p>Best regards,<br>The SkillXChange Team</p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

    <div  style="background: linear-gradient(to right, #00c6ff, #0072ff); padding: 20px; text-align: center;">
      <h1>Password Reset Successful</h1>
    </div>
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      <p>Hello,</p>
      <p>Your password has been successfully reset.</p>
      <p>If you didn't request this, contact our support team immediately.</p>
      <p>Best regards,<br>The SkillXChange Team</p>
    </div>
    <div  style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
      <p>This is an automated message, please do not reply.</p>
    </div>
 
</body>
</html>
`;

export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SkillXChange</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #00c6ff, #0072ff); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Welcome to SkillXChange</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; margin-bottom: 20px;">Hello {name},</p>
    <p style="font-size: 16px;">We are thrilled to have you join our community at <strong>SkillXChange</strong>! Our mission is to empower learners and skill sharers worldwide.</p>
   
    <p>Here’s what you can do now:</p>
    <ul style="list-style-type: none; padding: 0;">
      <li style="margin-bottom: 10px;"><strong>🌟 Discover:</strong> Explore various skills and connect with like-minded people.</li>
      <li style="margin-bottom: 10px;"><strong>🎯 Learn:</strong> Begin your journey to mastering new skills.</li>
      <li style="margin-bottom: 10px;"><strong>🤝 Share:</strong> Showcase your expertise and help others grow.</li>
    </ul>
    <p style="margin-top: 20px;">To get started, log in to your account and explore what we have to offer. We're excited to see you thrive!</p>
    <div style="text-align: center; margin: 20px;">
      <a href="{/login}" style="background-color: #0072ff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Log In</a>
    </div>
    <p>If you have any questions, feel free to contact us anytime.</p>
    <p>Best regards,<br>The SkillXChange Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;
