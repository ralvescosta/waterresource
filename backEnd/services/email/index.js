const nodemailer = require('nodemailer');
const env = require('../../.env');

//Configurate the email services
let transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    port: 25,
    auth:{
        user: env.gmail,
        pass: env.emailPassword
    },

    tls:{
        rejectUnauthorized: false
    }
})

//Export Function to send Email's
exports.sendingMail = (to, subject, body) =>{
    let HelperOptions = {
        from: `"WaterResource" <${env.gmail}>`,
        to: to,
        subject: subject,
        html: body
    };

    transporter.sendMail(HelperOptions, (error,info)=>{
        if(error){
            return
        }
    });
}


