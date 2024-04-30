import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'syukurtullah@gmail.com',
        pass: 'yrbxrtlimzelrowu',
    },
    tls: { rejectUnauthorized: false },
});

export const sendVerificationEmail = async (name: string) => {
    console.log('ooo');

    await transporter.sendMail({
        from: '"DSS XIXIXI" <Syukurtullah@gmail.com>',
        to: 'syukurtullah04@gmail.com',
        subject: 'Verifikasi Pembuatan Akun',
        // html: `
        // <p>Halo <strong>  </strong> 👋,</p>
        // <p>
        //     Terima kasih dan selamat telah menyelesaikan seluruh acara di praktikum Pemrograman dan Aplikasi
        //     Komputer, khususnya acara 3, mengenai
        //     <strong>Eksekusi Kondisional</strong>
        // </p>
        // <p>
        //     Berikut kami kirimkan hasil penilaian dari praktikum PAK acara 3 Anda <i>(terlampir)</i>
        // </p>
        // `,
        text: `Halo, ${name},
Email Anda baru saja didaftarkan di DSS XIXIXI. Silakan konfirmasi alamat email Anda untuk mendapatkan password dan mengakses fitur dari kami.
        
Konfirmasi Sekarang
        
Jika Anda mengalami masalah saat mengklik tombol "Konfirmasi Sekarang", salin dan tempel URL di bawah ini ke browser web Anda:
https://home.s.id/auth/verify?token=SuOVVUDcqSymUGEi8ydW39Ho5b18obvs8NPa1FI64`,
    });

    console.log('ooo');
};
