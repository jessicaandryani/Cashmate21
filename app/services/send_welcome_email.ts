    // app/services/send_welcome_email.ts
    import mail from '@adonisjs/mail/services/main'

    export async function sendWelcomeEmail(email: string, fullName: string) {
    try {
        console.log(`[EmailService] Mencoba mengirim email ke: ${email} dengan nama: ${fullName}`) // LOG A

        await mail.send((message) => {
        message
            .to(email)
            .from('no-reply@cashmate.my.id', 'Tim Cashmate') // Nama pengirim bisa lebih personal
            .subject(`Selamat Bergabung di Cashmate, ${fullName}! 🎉`) // Subjek lebih menarik
            .html(`
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h1 style="color: #4A90E2;">Halo ${fullName}, Selamat Datang di Cashmate!</h1>
                <p>Kami sangat senang Anda telah bergabung dengan <strong>Cashmate</strong>, aplikasi pintar untuk membantu Anda mengelola keuangan pribadi dengan lebih mudah dan efektif.</p>
                
                <p>Dengan Cashmate, Anda bisa:</p>
                <ul style="list-style-type: disc; padding-left: 20px;">
                <li>💰 Mencatat semua pemasukan dan pengeluaran Anda dengan cepat dan detail.</li>
                <li>🎯 Membuat dan melacak target keuangan bulanan untuk mencapai tujuan finansial Anda.</li>
                <li>📊 Mendapatkan laporan dan evaluasi mingguan untuk memantau kesehatan keuangan Anda.</li>
                <li>🧮 Menggunakan kalkulator finansial kami untuk perencanaan yang lebih matang.</li>
                </ul>

                <h2>Yuk, Mulai Sekarang!</h2>
                <p>Berikut beberapa langkah mudah untuk memulai petualangan finansial Anda bersama Cashmate:</p>
                <ol style="padding-left: 20px;">
                <li><strong>Catat Transaksi Pertama Anda:</strong> Mulai lacak ke mana uang Anda pergi.</li>
                <li><strong>Atur Target Keuangan:</strong> Tentukan tujuan finansial Anda di menu 'Target'.</li>
                <li><strong>Jelajahi Fitur Lainnya:</strong> Temukan semua kemudahan yang Cashmate tawarkan.</li>
                </ol>

                <p>Jika Anda memiliki pertanyaan atau membutuhkan bantuan, jangan ragu untuk mengunjungi halaman bantuan kami (jika ada link) atau hubungi tim support kami.</p>
                
                <p>Semangat mencapai kebebasan finansial!</p>
                
                <p>Salam hangat,<br>Tim Cashmate</p>
                
                <hr>
                <p style="font-size: 0.8em; color: #777;">Anda menerima email ini karena telah mendaftar di aplikasi Cashmate. Jika ini bukan Anda, mohon abaikan email ini.</p>
                <p style="font-size: 0.8em; color: #777;">Cashmate | Jalan Contoh No. 123, Kota Contoh | <a href="mailto:support@cashmate.my.id">support@cashmate.my.id</a></p>
            </div>
            `)
        })

        console.log(`[EmailService] ✅ Email berhasil dikirim ke: ${email}`) // LOG B
    } catch (error) {
        console.error('[EmailService] ❌ Gagal mengirim email:'); // LOG C
        console.error('[EmailService] Tipe Error:', Object.getPrototypeOf(error)?.constructor?.name || typeof error);
        console.error('[EmailService] Pesan Error Utama:', error.message);

        if (error.cause) {
        console.error('[EmailService] Penyebab Error (Error Cause):', error.cause);
        }
        if (error.status) {
        console.error('[EmailService] Status Code:', error.status);
        }
        if (error.body) {
        console.error('[EmailService] Error Body (dari Brevo/Transport):', JSON.stringify(error.body, null, 2));
        } else if (error.response && error.response.data) {
        console.error('[EmailService] Error Response Data:', JSON.stringify(error.response.data, null, 2));
        }
        console.error('[EmailService] Objek Error Lengkap (Serialized):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    }
    }
