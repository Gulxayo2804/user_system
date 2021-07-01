
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    auth: {
        user: 'gulxayo02@mail.ru',
        pass: 'g2300428'
    },
},{
    from: 'Admin <gulxayo02@mail.ru>'
});
const sendEmail = message => {
    transporter.sendMail(message, (err, info) => {
        if(err) return console.log(err)
        // console.log('Email is sent', info)
    })
}
module.exports =  sendEmail