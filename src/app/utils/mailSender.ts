import nodemailer from 'nodemailer'
import config from '../config'
import { getErrorMessage } from '../helpers/getErrorMessage'

interface Attachment {
    filename: string
    path?: string
    content?: string | Buffer
    contentType?: string
}

interface MailOptions {
    to: string | string[]
    subject: string
    text?: string
    html?: string
    attachments?: Attachment[]
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.mailer_name,
        pass: config.mailer_pass,
    },
})

/**
 * Sends an email with optional attachments.
 * @param options Mail options
 * @returns Promise resolving to the messageId string
 * @throws Error if sending fails
 */
export async function mailSender(options: MailOptions): Promise<string> {
    console.log(config.mailer_name, config.mailer_pass)
    const { to, subject, text, html, attachments } = options

    if (!to || !subject) {
        throw new Error(
            'Missing required email parameters: to, subject, and text'
        )
    }

    const mailOptions: nodemailer.SendMailOptions = {
        from: '"Test School" <va.habibur@gmail.com>',
        to,
        subject,
        text,
        html,
        attachments,
    }

    try {
        const info = await transporter.sendMail(mailOptions)
        return info.messageId
    } catch (error) {
        console.error('mailSender error:', error)
        throw new Error(getErrorMessage(error))
    }
}
