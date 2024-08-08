import { readFileSync } from 'fs';
import moment from 'moment';
import Mailjet from 'node-mailjet';
import { HOST_URL } from '../constants/server';
import path from 'path';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
    private readonly mailjet: Mailjet
    private readonly htmlEmailTemplate: string

    constructor() {
        this.mailjet = new Mailjet({
            apiKey: process.env.MJ_APIKEY_PUBLIC,
            apiSecret: process.env.MJ_APIKEY_PRIVATE,
        });
        
        this.htmlEmailTemplate = readFileSync(path.resolve('./src/services/email/email.html'), 'utf-8')
    }

    async sendVerificationEmail(name: string, email: string, token: string) {
        const verifyUrl = `${HOST_URL}/auth/verify/${token}`;

        return new Promise<void>((resolve, rejected) =>
            this.mailjet.post('send', { version: 'v3.1' }).request({
                Messages: [
                    {
                        From: { Email: process.env.MJ_SENDER_EMAIL, Name: process.env.MJ_SENDER_NAME },
                        To: [{ Email: email, Name: name }],
                        Subject: 'Konfirmasi Akun Anda',
                        HTMLPart:
                            this.htmlEmailTemplate
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

}



