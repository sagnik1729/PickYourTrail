const nodemailer = require('nodemailer')

// new Email(user, url).sendWelcome()
// new Email(user, url).sendPasswordReset()

module.exports = class Email {

    constructor(user, url, message) {
        this.to = `${user.name} <${user.email}>`,
            this.firstName = user.name.split(' ')[0],
            this.url = url,
            this.message = message,
            this.from = `Sagnik Banerjee <${process.env.EMAIL_FROM}>`
    }

    createTransport() {
        if (process.env.NODE_ENV === 'development') {
            return nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            })
        }
    }
    async send(subject) {
        //DEFINE EMAIL OPTIONS
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            text: this.message,

        }

        //CREATE A TRANSPORT AND SEND EMAIL
        await this.createTransport().sendMail(mailOptions)

    }
    async sendWelcome() {
        await this.send(
            'Welcome to the PickYourTrail Family!'
        )
    }
    async sendPasswordReset() {
        await this.send(
            'Your password reset token (valid for only 10 minutes)'
        )
    }

}