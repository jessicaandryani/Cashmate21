// File: database/seeders/Article.ts

import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Article from '#models/article'

export default class extends BaseSeeder {
  async run() {
    // Hapus semua artikel yang ada sebelumnya
    await Article.query().del()

    // Menambahkan artikel edukatif tentang pentingnya literasi keuangan di Indonesia
    await Article.createMany([
      {
        title: 'Mengapa Literasi Keuangan Sangat Penting untuk Masa Depan Indonesia',
        content: `Literasi keuangan merupakan kemampuan untuk memahami dan mengelola keuangan pribadi secara bijak. Di Indonesia, tingkat literasi keuangan masih tergolong rendah. Survei Nasional Literasi dan Inklusi Keuangan (SNLIK) oleh OJK tahun 2022 menunjukkan bahwa indeks literasi keuangan masyarakat baru mencapai sekitar 49,68%. Artinya, lebih dari separuh masyarakat belum memiliki pemahaman yang cukup dalam mengelola keuangannya.

Pentingnya literasi keuangan tidak hanya berdampak pada individu, tetapi juga pada stabilitas ekonomi nasional. Masyarakat yang melek finansial cenderung lebih siap menghadapi risiko ekonomi, menghindari jeratan utang konsumtif, dan mampu menabung serta berinvestasi untuk masa depan. Oleh karena itu, edukasi keuangan harus dimulai sejak dini, baik melalui pendidikan formal di sekolah maupun melalui program pemerintah dan lembaga keuangan.`      
      },
      {
        title: 'Peran Literasi Keuangan dalam Meningkatkan Kesejahteraan Masyarakat',
        content: `Kesejahteraan masyarakat sangat erat kaitannya dengan bagaimana mereka mengelola keuangan. Literasi keuangan yang baik membantu seseorang dalam mengambil keputusan finansial yang tepat, seperti menyusun anggaran, menabung, berinvestasi, hingga memahami produk keuangan seperti asuransi dan pinjaman.

Otoritas Jasa Keuangan (OJK) terus mendorong program literasi keuangan melalui kampanye "Yuk Nabung Saham", "SiMOLEK", dan pelatihan UMKM. Dengan pemahaman yang benar, masyarakat tidak mudah tergiur oleh investasi bodong atau pinjaman online ilegal yang kian marak. Literasi yang kuat menjadi benteng pelindung dari kerugian dan ketidakstabilan keuangan pribadi.`
      },
      {
        title: 'Tantangan dan Solusi dalam Meningkatkan Literasi Keuangan di Indonesia',
        content: `Meningkatkan literasi keuangan di Indonesia bukanlah hal mudah. Tantangan utama adalah rendahnya akses informasi, masih banyaknya masyarakat di daerah terpencil yang belum terjangkau program edukasi, serta rendahnya minat untuk belajar keuangan.

Solusinya adalah kolaborasi berbagai pihak, mulai dari pemerintah, lembaga keuangan, sekolah, hingga platform digital. Teknologi finansial (fintech) dapat dimanfaatkan untuk memperluas jangkauan edukasi keuangan melalui aplikasi edukatif, webinar, dan konten media sosial. Literasi keuangan harus dibuat relevan dan mudah dipahami oleh semua kalangan agar bisa diterapkan langsung dalam kehidupan sehari-hari.`
      },
      {
        title: 'Membangun Budaya Literasi Keuangan Sejak Usia Dini',
        content: `Pendidikan keuangan sebaiknya dimulai sejak dini. Anak-anak perlu diajarkan konsep dasar seperti menabung, membedakan kebutuhan dan keinginan, serta pentingnya merencanakan pengeluaran. Ini dapat membentuk kebiasaan keuangan yang sehat sejak awal kehidupan.

Kementerian Pendidikan dan Kebudayaan telah memasukkan pendidikan keuangan dalam kurikulum tematik sekolah dasar. Selain itu, orang tua juga memiliki peran penting dalam memberikan teladan dan membiasakan anak-anak mengelola uang jajan dengan bijak. Membangun budaya sadar finansial sejak kecil akan melahirkan generasi yang tangguh secara ekonomi di masa depan.`
      },
       {
        title: 'Peran Digitalisasi dalam Mendorong Literasi Keuangan Generasi Muda',
        content: `Generasi muda Indonesia tumbuh di era digital, menjadikan platform online sebagai saluran efektif untuk edukasi keuangan. Aplikasi dompet digital, bank digital, dan platform edukasi kini menjadi sarana pembelajaran keuangan yang praktis dan menarik.

Dengan memanfaatkan media sosial, podcast, dan webinar, lembaga keuangan dapat menjangkau generasi muda dengan cara yang lebih relevan. Konten edukatif yang ringan dan interaktif membantu meningkatkan literasi keuangan mereka sejak dini.`
      },
      {
        title: 'Literasi Keuangan sebagai Pondasi UMKM yang Berkelanjutan',
        content: `Banyak pelaku UMKM di Indonesia belum memiliki pemahaman dasar mengenai pencatatan keuangan, manajemen utang, atau akses pendanaan formal. Akibatnya, banyak usaha kecil sulit berkembang atau rentan gagal.

Dengan literasi keuangan yang baik, UMKM bisa menyusun laporan keuangan, memahami arus kas, dan mengakses modal usaha dengan lebih efektif. OJK dan Bank Indonesia terus mendorong edukasi keuangan bagi pelaku UMKM agar bisa naik kelas dan lebih kompetitif.`
      },
      {
        title: 'Bahaya Kurangnya Literasi Keuangan: Kasus Investasi Bodong di Indonesia',
        content: `Investasi ilegal atau bodong terus menjerat masyarakat Indonesia karena minimnya pemahaman keuangan. Banyak orang tergiur imbal hasil tinggi tanpa memahami risiko atau legalitas produk keuangan yang ditawarkan.

OJK mencatat kerugian masyarakat akibat investasi bodong mencapai triliunan rupiah dalam beberapa tahun terakhir. Edukasi dan kewaspadaan menjadi kunci untuk melindungi masyarakat dari kerugian finansial.`
      },
      {
        title: 'Strategi Nasional Literasi Keuangan: Langkah Nyata Menuju Inklusi Finansial',
        content: `Pemerintah Indonesia telah meluncurkan Strategi Nasional Literasi Keuangan (SNLKI) 2021–2025 sebagai upaya memperkuat kemampuan finansial masyarakat. Strategi ini mencakup pengembangan kurikulum, pelatihan guru, kampanye media, hingga digitalisasi layanan keuangan.

Dengan pelaksanaan strategi yang terarah dan dukungan dari berbagai pihak, target literasi keuangan 90% di tahun 2025 diharapkan dapat tercapai. Literasi yang tinggi adalah pondasi bagi inklusi keuangan yang kuat dan ekonomi yang stabil.`
      }
    ])
  }
}
    