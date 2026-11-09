# Kejutan Ulang Tahun — Jalan-jalan ke Rumah (gaya anime)

Halaman kejutan berupa permainan kecil bergaya anime. **Yang berjalan adalah yang berulang tahun**
(pilih tokoh cowok atau cewek). Di dalam rumah sudah menunggu pasangannya (lawan jenis) untuk memberi kejutan.

Alurnya:
1. Mulai dari trotoar jalan besar ("Selamat bermain!"). Rumah biasa dengan taman kecil, pagar, dan **kotak surat** di samping gerbang.
   Tidak ada tombol atau label: pemain mencari dan mengklik sendiri bendanya (harus cukup dekat).
   Pohon besar di halaman bisa diklik: sepucuk surat jatuh, dan surat itu bisa diklik (isi `suratPohon` dari admin).
2. Klik **pintu**: pintu terbuka, layar gelap beberapa detik, lalu lampu menyala dan si dia teriak **SURPRISE!**
   dengan konfeti, lalu menyampaikan pesannya.
   Bangku di bawah pohon bisa diklik: tokoh duduk dan bisa menulis keluh kesah (dibalas teks `balasKeluh`).
   Malam hari: lampu jalan, lampu taman, jendela rumah menyala, kunang-kunang.
3. Ruang tengah temaram. Masuk pertama kali: si dia hanya teriak **SURPRISE!**. Klik **si dia**: ucapan (`pesanKejutan`) + pertanyaan (`tanyaKabar`),
   kamu mengetik jawaban, lalu dia membalas (`balasKabar`). Klik **pot tanaman**: surat berhias daun (`suratPot`).
   Dekati **lilin** di kue cokelat: tulis wish, hitung mundur **3… 2… 1…**, lalu tiup lilin.
4. **Lantai 2 (kamar)**: plafon langit malam; klik kasur (selimut tersingkap, bunga bertuliskan "night"), jendela (melihat halaman yang sama),
   lemari (ganti gaun/jas + `catatanGaun`), foto dinding (`fotoDinding`), foto di meja (bisa dibalik, `fotoMeja` + `tulisanFoto`), remote TV di meja yang sama (video layar penuh, `video`, diunggah lewat admin maks. 25 MB).
   Jendela memperlihatkan halaman, pagar, jalan, dan rumah di seberang.
   Pintu kiri menuju **kamar mandi** kecil: cermin di dinding kiri (titik air, hati + tulisan `tulisanCermin`, bayangan diri samar),
   bak lonjong berisi teka-teki (buka sumbat, air surut, ambil `suratBak`, lalu boleh berendam dengan busa & bebek karet),
   dan tempat sampah: tamu menulis hal yang ingin dibuang & dilupakan, kertas diremas, lalu muncul balasan (`suratSampah`).

Kontrol: ketuk/klik tempat di lantai dan tokoh berjalan sendiri ke sana (mencari jalan menghindari perabot). Ketuk benda yang jauh: tokoh berjalan mendekat lalu bendanya langsung terbuka. Tetap bisa menahan jari/kursor ke arah tujuan, menggeser joystick, atau memakai tombol panah / WASD (semua ini membatalkan ketuk tujuan).

## Mengubah isi: halaman admin
Buka `https://purwoadhii.github.io/jamiati/admin/`, masuk dengan **fine-grained token** GitHub
(Repository access: repo ini saja, Permissions → Contents: Read and write). Isi surat, pesan, wish, foto, dan musik, lalu Simpan.
GitHub Pages butuh sekitar 1 menit untuk memperbarui; tekan Ctrl+F5 setelahnya.

## Struktur
- `index.html` — halaman kejutan
- `data.js` — isi kejutan (ditulis oleh admin)
- `admin/index.html` — halaman admin
- `mesin/rumah.js` — permainan (semua gambar digambar sendiri dengan canvas)
- `mesin/rumah.css` — tampilan sampul, dialog, adegan tiup lilin
- `assets/` — foto & musik yang diunggah lewat admin

## Musik & kolam
Tiap tempat punya musik sendiri (`musik` = luar, `musikLantai1`, `musikKamar`, `musikMandi`), berganti otomatis dengan efek pudar; tempat yang kosong hening. Saat video TV diputar musik berhenti.
Di pojok kanan halaman ada kolam dengan ikan hias, kodok kecil yang kadang melompat, dan jangkrik.

## Kamar: foto, album, kolam
Foto dinding (`fotoDinding`) ada di samping lemari; diklik tampil layar penuh. Di meja samping kasur: bingkai foto, album (`album`: daftar foto, 1 foto = 1 halaman buku), remote TV.
Klik kolam di halaman untuk melihatnya dari dekat; ketuk air untuk memberi makan ikan.

## Kompres di admin
Foto dikecilkan (maks. 1600 px, ± 700 KB), musik di atas 7 MB atau bukan mp3 diubah ke mp3 (lamejs dari cdnjs), video di atas 20 MB direkam ulang 720p lewat MediaRecorder (H.264 bila didukung browser).

## Pesan penutup
Setelah semua benda rahasia ditemukan (hitungan tampil di pojok kiri atas), muncul `pesanAkhir` yang ditulis di admin.

## Menyimpan tulisan tamu (database Supabase)
Semua yang diketik di game (wish di lilin, jawaban "bagaimana keadaanmu", keluh kesah di bangku, tulisan di tempat sampah)
dikirim ke tabel `tulisan` di Supabase bila `dbUrl` dan `dbKey` (kunci publishable/anon) diisi di admin.
Tamu hanya bisa menambah baris; membaca dan menghapus lewat fungsi `baca_tulisan`/`hapus_tulisan` yang meminta sandi baca.
Skrip SQL dibuat oleh admin (bagian "Simpan semua tulisan tamu"); hanya hash sandi yang masuk ke database.

## Efek suara

Dibuat langsung dengan kode (Web Audio), jadi tidak perlu file: jangkrik dan kodok di luar rumah (makin keras di dekat kolam, berhenti saat masuk rumah), letupan dan suara "SURPRISE!" saat kejutan, bunyi hitung mundur 3-2-1 dan hembusan saat tiup lilin, serta air bak yang terbuang saat sumbat ditarik.
Musik latar per tempat sudah dihapus dari admin. Slot audio di admin sekarang hanya untuk efek suara: **suara malam di luar** (kodok & jangkrik, diputar berulang, berhenti saat masuk rumah), **air bak terbuang**, **suara cowok hitung mundur 3-2-1**, dan **suara "SURPRISE!"**. Slot yang kosong memakai suara buatan bawaan. Tombol musik di pojok bisa mematikan semua suara.
