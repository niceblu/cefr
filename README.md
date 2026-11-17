# CEFR Placement Test

Web app tes penempatan bahasa Inggris (A1–B2) untuk mahasiswa.
Tampilan (frontend) di-host di **GitHub Pages**, sedangkan penilaian, penyimpanan data, dan panel admin berjalan di **Google Apps Script** + Google Sheet.

```
index.html              ← frontend (dipublikasikan ke GitHub Pages)
apps-script/Code.gs     ← backend (ditempel ke Google Apps Script)
.github/workflows/      ← otomatisasi deploy ke GitHub Pages
```

## 1. Perbarui backend (Google Apps Script)
1. Buka project Apps Script Anda, ganti seluruh isi `Code.gs` dengan `apps-script/Code.gs`.
2. **Deploy → Manage deployments → ikon pensil → Version: New version → Deploy.**
   Pengaturan wajib: *Execute as: Me*, *Who has access: Anyone*. URL `/exec` tetap sama.
3. Jika Anda membuat deployment baru dan URL berubah, ubah konstanta `API_URL` di `index.html`.

## 2. Publikasikan frontend (GitHub Pages)
1. Buat repository baru di GitHub, lalu unggah semua isi folder ini (termasuk `.github` dan `.nojekyll`).
2. Buka **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push ke branch `main`. Tunggu workflow *Deploy to GitHub Pages* selesai di tab **Actions**.
4. Aplikasi tersedia di `https://<username>.github.io/<nama-repo>/`.

## Admin
Klik logo 5 kali dengan cepat, lalu masukkan PIN (awal: `1234`, **segera ganti** di tab Pengaturan).

## Catatan
- Setelah mengubah `Code.gs`, selalu buat *New version* pada deployment, jika tidak perubahan tidak berlaku.
- Kunci jawaban tidak pernah dikirim ke browser peserta; penilaian dilakukan di server.
- Permintaan pertama bisa lambat 1–3 detik karena Apps Script perlu "bangun" (cold start).
