import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import moment from 'moment';
import Mailjet from 'node-mailjet';
import path, { join } from 'path';

@Injectable()
export class EmailService {
    private readonly verificationEmailTemplate = readFileSync(
        join('.', 'dist/templates/email-verification.html'),
        'utf-8'
    );
    private readonly successVerificationEmailTemplate = readFileSync(
        join('.', 'dist/templates/email-verification-success.html'),
        'utf-8'
    );
    private readonly mailjet: Mailjet;
    private readonly hostUrl = process.env.HOST_URL!;

    constructor() {
        this.mailjet = new Mailjet({
            apiKey: process.env.MJ_APIKEY_PUBLIC,
            apiSecret: process.env.MJ_APIKEY_PRIVATE,
        });
    }

    async sendVerificationEmail(name: string, email: string, token: string) {
        const verifyUrl = `${this.hostUrl}/verify?token=${token}`;

        return new Promise<void>((resolve, rejected) =>
            this.mailjet
                .post('send', { version: 'v3.1' })
                .request({
                    Messages: [
                        {
                            From: {
                                Email: process.env.MJ_SENDER_EMAIL,
                                Name: process.env.MJ_SENDER_NAME,
                            },
                            To: [{ Email: email, Name: name }],
                            Subject: 'Konfirmasi Akun Anda',
                            HTMLPart: this.verificationEmailTemplate
                                .replace('{{name}}', name)
                                .replace('{{year}}', moment().format('YYYY'))
                                .replace('{{verifyurl}}', verifyUrl),
                        },
                    ],
                })
                .then((e) => (e.response.status == 200 ? resolve() : rejected()))
                .catch(rejected)
        );
    }
    async sendSuccessVerificationEmail(
        name: string,
        email: string,
        password: string,
        role: string
    ) {
        return new Promise<void>((resolve, rejected) =>
            this.mailjet
                .post('send', { version: 'v3.1' })
                .request({
                    Messages: [
                        {
                            From: {
                                Email: process.env.MJ_SENDER_EMAIL,
                                Name: process.env.MJ_SENDER_NAME,
                            },
                            To: [{ Email: email, Name: name }],
                            Subject: 'Verifikasi Akun berhasil',
                            HTMLPart: this.successVerificationEmailTemplate
                                .replace('{{name}}', name)
                                .replace('{{email}}', email)
                                .replace('{{password}}', password)
                                .replace('{{role}}', role)
                                .replace('{{year}}', moment().format('YYYY'))
                                .replace('{{loginUrl}}', this.hostUrl),
                        },
                    ],
                })
                .then((e) => (e.response.status == 200 ? resolve() : rejected()))
                .catch(rejected)
        );
    }
}
