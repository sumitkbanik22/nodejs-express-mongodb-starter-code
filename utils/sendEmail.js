const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

class SendEmail {

    async sendEmail (email, subject, payload, template) {

        try {

            // create reusable transporter object using deafult SMTP transport
            const transporter = nodemailer.createTransport({
                host: process.env.HOST,
                service: process.env.EMAIL_SERVICE,
                port: 587,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            const source = fs.readFileSync(path.join(__dirname, template), 'utf8');
            const compiledTemplate = handlebars.compile(source);
            const options = () => {
                return {
                    from: process.env.FROM_EMAIL,
                    to: email,
                    subject: subject,
                    html: compiledTemplate(payload)
                };
            };

            // Send email
            await transporter.sendMail(options(), (error, info) => {
                if (error) {
                    // console.log(error);
                } else {
                    // console.log(info)
                }
            });

            return {status: "success", message: "Email sent sucessfully"};

        } catch (err) {
            return {status: "fail", message: "Email not sent", err};
        }

    }

}

module.exports = new SendEmail();