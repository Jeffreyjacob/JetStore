import nodeMailer, { SendMailOptions } from "nodemailer";


const sendEmail = (option: SendMailOptions) => {
    const transporter = nodeMailer.createTransport({
        host: process.env.EMAIL_HOST,
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_MAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    const mailOption = {
        from:process.env.EMAIL_MAIL,
        to:option.to,
        subject:option.subject,
        html:option.text
    }

    transporter.sendMail(mailOption,function(err,info){
        if(err){
            console.log(err)
        }else{
            console.log(info)
        }
    })
}

export default sendEmail;