import { readFileSync } from 'fs';
import moment from 'moment';
import Mailjet from 'node-mailjet';
import { HOST_URL } from '../../constants/server.js';
import path from 'path';

// @ts-ignore
const mailjet = new Mailjet({
    apiKey: process.env.MJ_APIKEY_PUBLIC || '2cefff9869a1128640f5842b643d7d57',
    apiSecret: process.env.MJ_APIKEY_PRIVATE || '827255df13df49e52d0dcf2f0692e38e'
});


const htmlEmailTemplate = readFileSync(path.resolve('./src/utils/email/email.html'), 'utf-8')


export default async function sendVerificationEmail(name: string, email: string, token: string) {
    const verifyUrl = `${HOST_URL}/auth/verify/${token}`;

    return new Promise<void>((resolve, rejected) =>
        mailjet.post('send', { version: 'v3.1' }).request({
            Messages: [
                {
                    From: { Email: process.env.MJ_SENDER_EMAIL, Name: process.env.MJ_SENDER_NAME },
                    To: [{ Email: email, Name: name }],
                    Subject: 'Konfirmasi Akun Anda',
                    HTMLPart:
                        htmlEmailTemplate
                            .replace('{{name}}', name)
                            .replace('{{year}}', moment().format('YYYY'))
                            .replace('{{verifyurl}}', verifyUrl),
                },
            ],
        })
            .then(e => e.response.status == 200 ? resolve() : rejected())
            .catch(rejected)
    )
}