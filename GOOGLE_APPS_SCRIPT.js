/**
 * GOOGLE APPS SCRIPT UNTUK SPMB SMK BINA PUTERA BOGOR
 * 
 * Instruksi:
 * 1. Buka https://script.google.com
 * 2. Buat project baru
 * 3. Ganti semua kode dengan kode di bawah ini
 * 4. Buat Google Sheet dengan nama "SPMB_Data"
 * 5. Deploy sebagai Web App (Execute as: Me, Access: Anyone)
 * 6. Copy URL deployment dan ganti di file spmb.js pada variable SCRIPT_URL
 * 
 * Struktur Sheet "SPMB_Data":
 * - Sheet 1 bernama "Pendaftar" dengan kolom:
 *   A: nama, B: tempat_lahir, C: tanggal_lahir, D: jenis_kelamin
 *   E: alamat, F: no_hp, G: email, H: asal_sekolah
 *   I: tahun_lulus, J: jurusan_dipilih, K: nama_ortu, L: pekerjaan_ortu
 *   M: no_hp_ortu, N: alasan_masuk, O: prestasi, P: timestamp, Q: id
 */

// ID Google Sheet (ganti dengan ID sheet Anda)
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const SHEET_NAME = 'Pendaftar';

// Fungsi utama untuk handle request
function doPost(e) {
    try {
        const action = e.parameter.action || 'saveData';
        
        if (action === 'saveData') {
            return saveData(e);
        } else if (action === 'getData') {
            return getData();
        }
        
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            message: 'Action tidak dikenali'
        })).setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            message: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

function doGet(e) {
    try {
        const action = e.parameter.action || 'getData';
        
        if (action === 'getData') {
            return getData();
        }
        
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            message: 'Action tidak dikenali'
        })).setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            message: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// Fungsi untuk menyimpan data
function saveData(e) {
    try {
        const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
        
        // Ambil data dari request
        const values = [
            e.parameter.nama || '',
            e.parameter.tempat_lahir || '',
            e.parameter.tanggal_lahir || '',
            e.parameter.jenis_kelamin || '',
            e.parameter.alamat || '',
            e.parameter.no_hp || '',
            e.parameter.email || '',
            e.parameter.asal_sekolah || '',
            e.parameter.tahun_lulus || '',
            e.parameter.jurusan_dipilih || '',
            e.parameter.nama_ortu || '',
            e.parameter.pekerjaan_ortu || '',
            e.parameter.no_hp_ortu || '',
            e.parameter.alasan_masuk || '',
            e.parameter.prestasi || '',
            e.parameter.timestamp || new Date().toLocaleString('id-ID'),
            e.parameter.id || Date.now()
        ];
        
        // Tambah row baru
        sheet.appendRow(values);
        
        return ContentService.createTextOutput(JSON.stringify({
            success: true,
            message: 'Data berhasil disimpan',
            data: values
        })).setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            message: 'Error saat menyimpan: ' + error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// Fungsi untuk mengambil data
function getData() {
    try {
        const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
        const data = sheet.getDataRange().getValues();
        
        if (data.length === 0) {
            return ContentService.createTextOutput(JSON.stringify({
                success: true,
                data: []
            })).setMimeType(ContentService.MimeType.JSON);
        }
        
        // Skip header row dan convert ke object
        const headers = data[0];
        const result = [];
        
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const obj = {};
            
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = row[j];
            }
            
            result.push(obj);
        }
        
        return ContentService.createTextOutput(JSON.stringify({
            success: true,
            data: result
        })).setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            message: 'Error saat mengambil data: ' + error.toString(),
            data: []
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// Fungsi untuk test
function testConnection() {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    Logger.log('Connection successful. Sheet name: ' + sheet.getName());
}
