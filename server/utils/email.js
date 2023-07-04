
const nodemailer = require("nodemailer");
const config = require('../config/appconfig');
const Logger = require('./logger');
const logger = new Logger();

module.exports = {

  async	sendEmail(
		fromEmail,
		toEmails,
		subject,
		textContent,
		htmlContent,
	) {
    
    let transporter = await nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: false,
      auth: {
        user: config.mail.user,
        pass: config.mail.pwd,
      },
      tls: {
        rejectUnauthorized: false
      },
    });
  
    // send mail with defined transport object
    const mailOptions = {
      from: fromEmail,
      to: toEmails,
      subject,
      text: textContent,
      html: htmlContent
    }
    return await transporter.sendMail(mailOptions);
	},
};
