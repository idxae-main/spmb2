# Setup Sinkronisasi Cloud Data untuk SPMB

## Tujuan
Data pendaftar akan tersimpan di Google Sheets dan dapat diakses oleh SEMUA admin dari device manapun.

## Langkah-Langkah Setup

### 1. Siapkan Google Sheet
1. Buka https://sheet.google.com
2. Buat spreadsheet baru dengan nama "SPMB_Data"
3. Rename sheet pertama menjadi "Pendaftar"
4. Tambahkan header di baris pertama (A1:Q1):
   - A: nama
   - B: tempat_lahir
   - C: tanggal_lahir
   - D: jenis_kelamin
   - E: alamat
   - F: no_hp
   - G: email
   - H: asal_sekolah
   - I: tahun_lulus
   - J: jurusan_dipilih
   - K: nama_ortu
   - L: pekerjaan_ortu
   - M: no_hp_ortu
   - N: alasan_masuk
   - O: prestasi
   - P: timestamp
   - Q: id

5. Copy ID Sheet (ada di URL: docs.google.com/spreadsheets/d/YOUR_ID/edit)

### 2. Buat Google Apps Script
1. Buka https://script.google.com
2. Klik "New Project"
3. Beri nama project: "SPMB Backend"
4. Copy seluruh kode dari file GOOGLE_APPS_SCRIPT.js
5. Ganti `YOUR_SPREADSHEET_ID` dengan ID Sheet Anda

### 3. Deploy Web App
1. Klik "Deploy" > "New Deployment"
2. Pilih Type: "Web app"
3. Execute as: Pilih akun Anda
4. Execute as who: "Anyone"
5. Klik "Deploy"
6. Copy URL yang muncul

### 4. Update spmb.js
1. Buka file `spmb.js`
2. Cari baris: `const SCRIPT_URL = '...'`
3. Ganti URL dengan URL deployment dari step 3

### 5. Share Google Sheet (Optional)
Untuk memudahkan admin, share sheet ke admin lain dengan akses "Editor"

## Cara Kerja

**Alur Pendaftaran:**
```
User Submit Form
    ↓
Data Disimpan ke localStorage (instant)
    ↓
Coba Kirim ke Google Sheets via Apps Script
    ↓
Jika berhasil: Data di Sheets + localStorage
Jika gagal: Data tetap di localStorage (sync otomatis saat online)
```

**Alur Admin Akses Data:**
```
Admin Login
    ↓
Load data dari Google Sheets
    ↓
Fallback ke localStorage jika offline
    ↓
Tampilkan di dashboard
```

## Fitur
✅ Data real-time sync ke cloud
✅ Bisa diakses dari device manapun
✅ Offline mode (data tetap disimpan lokal)
✅ Auto-sync saat online kembali
✅ Admin bisa melihat data yang di-submit oleh user lain

## Troubleshooting

**Data tidak muncul di Google Sheets:**
1. Cek Console (F12) untuk error messages
2. Pastikan SPREADSHEET_ID benar
3. Pastikan sheet bernama "Pendaftar"
4. Pastikan Apps Script sudah di-deploy

**Admin tidak bisa melihat data:**
1. Klik tombol "Refresh Data" di dashboard
2. Cek console (F12) untuk error

**Deploy URL Error:**
1. Re-deploy Apps Script
2. Update SCRIPT_URL di spmb.js

## Testing

1. Buka spmb.html
2. Login sebagai Calon Murid
3. Isi form dan submit
4. Pesan "SUKSES!" akan muncul
5. Cek Console (F12) untuk confirm data tersimpan
6. Buka Google Sheet - data harus muncul dalam beberapa detik
7. Login sebagai Admin (spmbsmkbp / spmb2026)
8. Data akan muncul di dashboard
