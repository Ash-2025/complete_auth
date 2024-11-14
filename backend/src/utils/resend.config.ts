import {Resend} from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type params = {
    to:string,
    subject:string,
    text:string,
    html:string,
}

const getFromEmail = () => process.env.NODE_ENV === "development" ? 'onboarding@resend.dev' : process.env.EMAIL_SENDER!

const getToEmail = (to:string) => process.env.NODE_ENV === "development" ? 'delivered@resend.dev': to

export const sendMail = async ({to,subject,text,html}:params) => {
    return await resend.emails.send({
        from:getFromEmail(),
        to:getToEmail(to),
        subject,
        text,
        html
    })
}