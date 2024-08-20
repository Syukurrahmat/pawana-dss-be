// NOTE : LIMIT IN HERE IS UPPER LIMIT

export const ISPUConvertionTable = [
    {
        ISPU: 50,
        category: 'Baik',
        PM100: 50,
        PM25: 15.5,
        recomendation: {
            info: 'Kualitas udara yang sangat baik. Udara pada tingkat ini tidak berdampak negatif pada manusia, hewan, atau tumbuhan. Disarankan untuk bebas melakukan aktivitas di luar ruangan tanpa perlu khawatir tentang kualitas udara.',
            company:
                'Operasional pabrik tahu dapat berjalan normal tanpa ada penyesuaian khusus. Aktivitas luar ruangan seperti pemindahan bahan baku atau produk jadi dapat dilakukan tanpa masalah.',
            public: 'Masyarakat dapat melanjutkan semua aktivitas luar ruangan seperti biasa tanpa kekhawatiran terhadap kualitas udara.',
        },
    },
    {
        ISPU: 100,
        category: 'Sedang',
        PM100: 150,
        PM25: 55.4,
        recomendation: {
            info: 'Kualitas udara masih dapat diterima untuk kesehatan manusia, hewan, dan tumbuhan. Dalam kondisi ini, kelompok yang sensitif disarankan untuk mengurangi aktivitas fisik yang terlalu lama atau berat. Namun, orang pada umumnya masih dapat beraktivitas di luar ruangan tanpa risiko kesehatan yang berarti.',
            company:
                'Pabrik perlu memantau kesehatan pekerja yang sensitif terhadap kualitas udara dan menyediakan fasilitas medis. Mereka juga bisa menyesuaikan jadwal kerja untuk mengurangi paparan udara luar bagi pekerja yang sensitif.',
            public: 'Masyarakat, terutama kelompok sensitif, sebaiknya mengurangi aktivitas fisik yang berat dan terlalu lama di luar ruangan.',
        },
    },
    {
        ISPU: 200,
        category: 'Tidak Sehat',
        PM100: 350,
        PM25: 150.4,
        recomendation: {
            info: 'Kualitas udara mulai merugikan bagi manusia, hewan, dan tumbuhan. Penderita asma perlu mengikuti petunjuk medis dan menyimpan obat asma mereka. Penderita penyakit jantung mungkin mengalami gejala seperti palpitasi, jantung berdetak cepat, sesak napas, atau kelelahan yang tidak biasa, yang bisa menjadi tanda masalah serius. Oleh karena itu, semua orang disarankan untuk mengurangi durasi aktivitas fisik di luar ruangan.',
            company:
                'Pabrik harus mengurangi aktivitas luar ruangan dan memberikan perlindungan tambahan bagi pekerja dengan kondisi kesehatan tertentu. Mereka juga perlu meningkatkan filtrasi udara di dalam ruangan dan menyediakan area istirahat yang bersih dan sehat.',
            public: 'Masyarakat, khususnya penderita asma dan penyakit jantung, harus mengurangi aktivitas luar ruangan dan mengambil tindakan pencegahan tambahan, seperti memakai masker dan menghindari tempat dengan polusi tinggi.',
        },
    },
    {
        ISPU: 300,
        category: 'Sangat Tidak Sehat',
        PM100: 420,
        PM25: 250.4,
        recomendation: {
            info: 'Kualitas udara yang sangat tidak sehat dan dapat meningkatkan risiko kesehatan bagi sebagian besar populasi yang terpapar. Kelompok sensitif sebaiknya menghindari semua aktivitas di luar ruangan, lebih banyak beraktivitas di dalam ruangan, atau menjadwalkan ulang aktivitas saat kualitas udara membaik. Semua orang juga dianjurkan untuk menghindari aktivitas fisik yang panjang di luar ruangan dan mempertimbangkan untuk beraktivitas di dalam ruangan.',
            company:
                'Pabrik harus menunda atau memindahkan aktivitas luar ruangan ke dalam ruangan sebanyak mungkin. Mereka juga harus memastikan sistem ventilasi dalam ruangan berfungsi dengan baik dan memberikan pelindung pernapasan seperti masker kepada pekerja jika diperlukan.',
            public: 'Masyarakat sebaiknya menghindari aktivitas luar ruangan yang tidak perlu dan lebih banyak beraktivitas di dalam ruangan. Gunakan masker jika harus keluar dan pastikan tempat tinggal memiliki ventilasi udara yang baik.',
        },
    },
    {
        ISPU: Infinity,
        category: 'Berbahaya',
        recomendation: {
            info: 'Kualitas udara yang sangat berbahaya dan dapat menyebabkan masalah kesehatan serius pada populasi, membutuhkan tindakan cepat. Kelompok sensitif harus tetap berada di dalam ruangan dan membatasi aktivitas. Semua orang harus menghindari semua aktivitas di luar ruangan untuk melindungi kesehatan mereka.',
            company:
                'Pabrik harus mengambil langkah-langkah darurat dengan menghentikan semua kegiatan luar ruangan dan memastikan semua pekerja berada di dalam ruangan. Mereka juga harus memberikan informasi dan edukasi mengenai perlindungan diri terhadap polusi udara, serta memastikan ketersediaan fasilitas medis untuk menngani kondisi darurat.',
            public: 'Masyarakat harus menghindari semua aktivitas di luar ruangan. Tetap berada di dalam ruangan sebanyak mungkin, gunakan pembersih udara, dan pastikan ventilasi udara baik. Jika keluar rumah tidak bisa dihindari, pakai masker dan batasi waktu di luar.',
        },
    },
];

export const CO2ConversionTable = [
    {
        limit: 330,
        category: 'Bersih',
        recomendation: {
            info: 'Kadar CO2 rendah, kondisi ini tidak menimbulkan efek negatif pada kesehatan manusia. Kadar ini mendukung pernapasan normal dan kinerja optimal tubuh, serta tidak menyebabkan gejala kesehatan yang merugikan. Secara lingkungan, kadar CO2 yang rendah membantu memelihara ekosistem alami dengan baik dan berkontribusi pada keseimbangan suhu global dan mengurangi efek rumah kaca',
            company:
                'Tetap melakukan pemantauan rutin terhadap kualitas udara untuk memastikan kadar CO2 tetap stabil dan rendah. Memastikan sistem ventilasi yang memadai agar udara bersirkulasi dengan baik dapat menghindari penumpukan CO2 di area kerja dan menjaga kadar oksigen yang cukup.',
            public: 'tetap jaga kadar co2 dengan mengurangi penggunaan kendaraan bermotor pribadi dan beralih ke transportasi umum, bersepeda, atau berjalan kaki yang secara signifikan dapat mengurangi emisi CO2. Mengurangi konsumsi energi di rumah melalui cara sederhana seperti mematikan peralatan listrik ketika tidak digunakan, dan menggunakan lampu hemat energi.',
        },
    },
    {
        limit: 700,
        category: 'Tercemar',
        recomendation: {
            info: 'Kadar CO2 tercemar, terdapat peningkatan risiko kesehatan seperti sakit kepala, kelelahan, dan gangguan konsentrasi. Orang dengan kondisi pernapasan seperti asma, mungkin mengalami gejala yang lebih parah. Secara lingkungan, kadar CO2 pada rentang ini dapat mulai mempengaruhi fotosintesis tanaman dan keseimbangan ekosistem lokal. Ini juga berpotensi meningkatkan suhu global yang dapat mempengaruhi pola cuaca dan ekosistem.',
            company:
                'Disarankan untuk memastikan ventilasi yang baik untuk mengurangi konsentrasi CO2 di udara. Penggunaan tanaman di sekitar area pabrik juga dapat membantu menyerap CO2 melalui fotosintesis. Selain itu, meningkatkan efisiensi energi dengan menggunakan peralatan yang lebih hemat energi akan mengurangi emisi CO2.',
            public: 'Disarankan untuk mengurangi penggunaan kendaraan pribadi dengan memanfaatkan transportasi umum, berjalan kaki, atau bersepeda. Penghijauan lingkungan dengan menanam lebih banyak pohon dan tanaman, serta meningkatkan efisiensi energi di rumah, dapat membantu mengurangi emisi CO2 secara signifikan.',
        },
    },
    {
        limit: Infinity,
        category: 'Bahaya',
        recomendation: {
            info: 'Kadar CO2 yang melebihi 700 ppm dapat menyebabkan gangguan pernapasan serius, peningkatan tekanan darah, dan risiko gangguan kardiovaskular. Selain itu, dapat menyebabkan masalah kesehatan mental seperti kecemasan dan gangguan kognitif. Dari perspektif lingkungan, kadar CO2 yang tinggi ini menyebabkan pemanasan global yang signifikan, mencairkan es kutub, dan meningkatkan level air laut. Hal ini juga mengancam kelangsungan hidup banyak spesies tanaman dan hewan akibat perubahan ekosistem yang drastis.',
            company:
                'Disarankan untuk memasang sistem filtrasi udara yang efektif dan pemantauan kualitas udara untuk memastikan kadar CO2 tetap dalam batas aman. Penggunaan sumber energi terbarukan seperti panel surya juga bisa menjadi solusi untuk mengurangi emisi CO2 dari proses produksi.',
            public: 'kampanye kesadaran lingkungan sangat penting untuk meningkatkan pemahaman tentang bahaya CO2 dan cara menguranginya. Pengurangan sampah dan peningkatan praktik daur ulang juga penting untuk mengurangi emisi dari pembakaran sampah. Selain itu, dukungan terhadap kebijakan dan program pemerintah yang bertujuan untuk mengurangi emisi CO2 dan mempromosikan keberlanjutan lingkungan sangat diperlukan.',
        },
    },
];

export const CH4ConversionTable = [
    {
        limit: 1000,
        category: 'Aman',
        recomendation: {
            info: 'Umumnya tidak ada dampak negatif yang signifikan terhadap kesehatan manusia. Metana pada kadar ini dianggap aman untuk pernapasan normal dan tidak menimbulkan gejala kesehatan yang merugikan. Secara lingkungan, kadar metana yang rendah ini tidak memiliki efek yang merugikan secara langsung terhadap ekosistem. Pemeliharaan kadar metana pada tingkat ini membantu menjaga kualitas udara yang baik dan mendukung stabilitas lingkungan.',
            company:
                'Untuk perusahaan semi-outdoor seperti pabrik tahu : penting untuk melakukan pemantauan rutin terhadap kualitas udara dengan menggunakan sistem deteksi metana yang dapat memastikan kadar gas tetap di bawah ambang batas aman. Selanjutnya, ventilasi yang baik harus dipastikan agar udara dapat sirkulasi dengan baik, mencegah penumpukan metana yang berpotensi membahayakan.',
            public: 'Penting untuk meningkatkan kesadaran akan pentingnya menjaga kadar metana rendah melalui edukasi dan kampanye lingkungan. Praktik pengelolaan limbah yang baik, seperti komposting, dan penggunaan sumber energi terbarukan juga dapat membantu mengurangi kontribusi terhadap emisi metana secara keseluruhan.',
        },
    },
    {
        limit: Infinity,
        category: 'Tercemar',
        recomendation: {
            info: 'Paparan jangka panjang pada kadar ini dapat menyebabkan gejala seperti sakit kepala, pusing, dan gangguan pernapasan. Metana dalam konsentrasi tinggi dapat menggantikan oksigen di udara, yang berpotensi menyebabkan hipoksia (kekurangan oksigen) pada manusia. Dari perspektif lingkungan, kadar metana yang tinggi berkontribusi signifikan terhadap pemanasan global. Ini dapat mempercepat perubahan iklim dan berdampak buruk pada ekosistem.',
            company:
                'Untuk perusahaan berbasis semi-outdoor seperti pabrik tahu, Pastikan menggunakan ventilasi yang baik dan menggunakan sistem filtrasi udara yang efektif adalah langkah penting lainnya. Sistem ini membantu mengurangi konsentrasi metana di udara dengan memastikan sirkulasi udara yang optimal, sehingga mengurangi kemungkinan terjadinya penumpukan gas yang berbahaya.',
            public: 'Disarankan berpartisipasi dalam program daur ulang dan pengelolaan limbah organik yang penting untuk mengurangi emisi gas metana dari limbah rumah tangga. Mendukung dan mengadopsi praktik pertanian yang ramah lingkungan yang dapat mengurangi emisi gas metana.',
        },
    },
];
