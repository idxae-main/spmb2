// URL Google Apps Script untuk penyimpanan database
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzJgpFu6T6dkBjYMW9LGsKehLkaOs4BeZz3RvAVypvMDP0W6FprkrjzghP4Zzuf_Dav/exec';

// Data untuk menyimpan pendaftar (akan di-load dari Google Sheets)
let pendaftarData = [];

// Inisialisasi: load data dari Google Sheets saat halaman dibuka
function loadDataFromGoogleSheets() {
    fetch(SCRIPT_URL + '?action=getData', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Data dari Google Sheets:', data);
        if (data.success && Array.isArray(data.data)) {
            pendaftarData = data.data;
            // Simpan juga ke localStorage sebagai cache
            localStorage.setItem('spmbData', JSON.stringify(pendaftarData));
            console.log('Data berhasil diload dari Google Sheets');
        }
    })
    .catch(error => {
        console.warn('Gagal load dari Google Sheets, menggunakan localStorage:', error);
        // Fallback ke localStorage jika Google Sheets tidak bisa diakses
        pendaftarData = JSON.parse(localStorage.getItem('spmbData')) || [];
    });
}

// Elemen DOM
const loginPage = document.getElementById('loginPage');
const userPage = document.getElementById('userPage');
const adminPage = document.getElementById('adminPage');

const loginOptions = document.querySelectorAll('.login-option');
const userLoginForm = document.getElementById('userLoginForm');
const adminLoginForm = document.getElementById('adminLoginForm');
const userLoginBtn = document.getElementById('userLoginBtn');
const adminLoginBtn = document.getElementById('adminLoginBtn');

const spmbForm = document.getElementById('spmbForm');
const successMessage = document.getElementById('successMessage');
const loadingIndicator = document.getElementById('loadingIndicator');
const submitButton = document.getElementById('submitButton');

const refreshDataBtn = document.getElementById('refreshDataBtn');
const downloadPDFBtn = document.getElementById('downloadPDFBtn');
const pendaftarTableBody = document.getElementById('pendaftarTableBody');
const dataCount = document.getElementById('dataCount');
const totalPendaftar = document.getElementById('totalPendaftar');
const pendaftarHariIni = document.getElementById('pendaftarHariIni');

// Elemen untuk statistik jurusan
const countPemasaran = document.getElementById('countPemasaran');
const countTKJ = document.getElementById('countTKJ');
const countTSM = document.getElementById('countTSM');

// Event Listeners untuk login options
loginOptions.forEach(option => {
    option.addEventListener('click', function() {
        // Hapus kelas active dari semua options
        loginOptions.forEach(opt => opt.classList.remove('active'));
        // Tambahkan kelas active ke option yang diklik
        this.classList.add('active');
        
        const role = this.getAttribute('data-role');
        if (role === 'user') {
            userLoginForm.classList.add('active');
            adminLoginForm.classList.remove('active');
        } else if (role === 'admin') {
            userLoginForm.classList.remove('active');
            adminLoginForm.classList.add('active');
        }
    });
});

// Login sebagai User
userLoginBtn.addEventListener('click', function() {
    const userName = document.getElementById('userName').value;
    const userEmail = document.getElementById('userEmail').value;
    
    if (!userName || !userEmail) {
        alert('Harap isi nama dan email untuk melanjutkan.');
        return;
    }
    
    // Tampilkan halaman user
    showUserPage();
});

// Login sebagai Admin
adminLoginBtn.addEventListener('click', function() {
    const adminUsername = document.getElementById('adminUsername').value;
    const adminPassword = document.getElementById('adminPassword').value;
    
    // Untuk demo, kita gunakan username dan password sederhana
    if (adminUsername === 'spmbsmkbp' && adminPassword === 'spmb2026') {
        // Tampilkan halaman admin
        showAdminPage();
    } else {
        alert('Username atau password salah!');
    }
});

// Fungsi untuk menampilkan halaman login
function showLoginPage() {
    loginPage.style.display = 'block';
    userPage.style.display = 'none';
    adminPage.style.display = 'none';
}

// Fungsi untuk menampilkan halaman user
function showUserPage() {
    loginPage.style.display = 'none';
    userPage.style.display = 'block';
    adminPage.style.display = 'none';
}

// Fungsi untuk menampilkan halaman admin
function showAdminPage() {
    loginPage.style.display = 'none';
    userPage.style.display = 'none';
    adminPage.style.display = 'block';
    
    // Load data dari Google Sheets saat membuka admin page
    loadPendaftarDataFromServer();
}

// Cek status login saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    console.log('Halaman dimuat, data dari localStorage:', pendaftarData);
    showLoginPage();
    
    // Load data dari Google Sheets saat awal
    loadDataFromGoogleSheets();
    
    // Test koneksi ke Google Apps Script
    testGoogleScriptConnection();
});

// Form Pendaftaran
spmbForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validasi form
    if (!validateForm()) {
        return;
    }
    
    // Tampilkan loading indicator
    loadingIndicator.style.display = 'block';
    submitButton.disabled = true;
    successMessage.style.display = 'none';
    
    // Ambil data dari form
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    
    // Tambahkan timestamp
    data.timestamp = new Date().toLocaleString('id-ID');
    data.id = Date.now(); // ID unik
    
    console.log('Data yang akan disimpan:', data);
    
    // Simpan ke localStorage terlebih dahulu
    saveToLocalStorage(data);
    
    // Kemudian coba kirim ke Google Apps Script
    sendToGoogleSheets(data);
});

function validateForm() {
    const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#f72585';
        } else {
            field.style.borderColor = '#e9ecef';
        }
    });
    
    // Validasi checkbox persetujuan
    const agreement = document.getElementById('setuju');
    if (!agreement.checked) {
        isValid = false;
        agreement.parentElement.style.color = '#f72585';
    } else {
        agreement.parentElement.style.color = '';
    }
    
    return isValid;
}

function sendToGoogleSheets(data) {
    // Membuat FormData untuk dikirim
    const formData = new FormData();
    formData.append('action', 'saveData');
    
    // Append semua field dari data
    for (const key in data) {
        formData.append(key, data[key]);
    }
    
    console.log('Mengirim data ke Google Sheets dengan URL:', SCRIPT_URL);
    
    // Mengirim data ke Google Apps Script
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('Response status:', response.status);
        return response.json().catch(() => response.text());
    })
    .then(result => {
        console.log('Respons dari Google Sheets:', result);
        
        // Simpan ke array pendaftar
        pendaftarData.push(data);
        localStorage.setItem('spmbData', JSON.stringify(pendaftarData));
        
        // Sembunyikan loading indicator
        loadingIndicator.style.display = 'none';
        submitButton.disabled = false;
        
        // Tampilkan pesan sukses
        successMessage.style.display = 'block';
        
        // Reset form
        spmbForm.reset();
        
        // Scroll ke pesan sukses
        successMessage.scrollIntoView({ behavior: 'smooth' });
    })
    .catch(error => {
        console.error('Error mengirim ke Google Sheets:', error);
        
        // Tetap simpan ke lokal meskipun gagal
        pendaftarData.push(data);
        localStorage.setItem('spmbData', JSON.stringify(pendaftarData));
        
        // Sembunyikan loading indicator
        loadingIndicator.style.display = 'none';
        submitButton.disabled = false;
        
        // Tetap tampilkan pesan sukses (data sudah disimpan di lokal)
        alert('Data berhasil disimpan. Akan tersinkronisasi dengan server saat online.');
        successMessage.style.display = 'block';
        
        // Reset form
        spmbForm.reset();
        
        // Scroll ke pesan sukses
        successMessage.scrollIntoView({ behavior: 'smooth' });
    });
}

function saveToLocalStorage(data) {
    // Tambah data baru
    pendaftarData.push(data);
    
    // Simpan kembali ke localStorage
    localStorage.setItem('spmbData', JSON.stringify(pendaftarData));
    
    console.log('Data disimpan di localStorage:', data);
}

// Fungsi untuk memuat data pendaftar (Admin)
function loadPendaftarData() {
    // Reload data dari localStorage untuk memastikan data terbaru
    pendaftarData = JSON.parse(localStorage.getItem('spmbData')) || [];
    console.log('Data pendaftar yang dimuat:', pendaftarData);
    
    // Update statistik
    totalPendaftar.textContent = pendaftarData.length;
    
    // Hitung pendaftar hari ini
    const today = new Date().toLocaleDateString('id-ID');
    const todayCount = pendaftarData.filter(item => {
        return item.timestamp && item.timestamp.includes(today);
    }).length;
    pendaftarHariIni.textContent = todayCount;
    
    // Hitung statistik per jurusan
    calculateJurusanStats();
    
    // Update tabel
    updatePendaftarTable();
}

// Fungsi untuk load data dari Google Sheets
function loadPendaftarDataFromServer() {
    console.log('Loading data dari server...');
    
    fetch(SCRIPT_URL + '?action=getData', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Data dari server:', data);
        if (data.success && Array.isArray(data.data)) {
            pendaftarData = data.data;
            console.log('Data dari server berhasil dimuat:', pendaftarData.length, 'records');
        } else {
            // Fallback ke localStorage
            pendaftarData = JSON.parse(localStorage.getItem('spmbData')) || [];
            console.log('Menggunakan data dari localStorage');
        }
        
        // Update tampilan
        updateAdminDashboard();
    })
    .catch(error => {
        console.warn('Gagal load dari server, menggunakan localStorage:', error);
        pendaftarData = JSON.parse(localStorage.getItem('spmbData')) || [];
        updateAdminDashboard();
    });
}

// Fungsi untuk update dashboard admin
function updateAdminDashboard() {
    console.log('Mengupdate dashboard admin dengan', pendaftarData.length, 'data');
    
    // Update statistik
    totalPendaftar.textContent = pendaftarData.length;
    
    // Hitung pendaftar hari ini
    const today = new Date().toLocaleDateString('id-ID');
    const todayCount = pendaftarData.filter(item => {
        return item.timestamp && item.timestamp.includes(today);
    }).length;
    pendaftarHariIni.textContent = todayCount;
    
    // Hitung statistik per jurusan
    calculateJurusanStats();
    
    // Update tabel
    updatePendaftarTable();
}

// Fungsi untuk menghitung statistik per jurusan
function calculateJurusanStats() {
    const pemasaranCount = pendaftarData.filter(item => 
        item.jurusan_dipilih === 'Pemasaran'
    ).length;
    
    const tkjCount = pendaftarData.filter(item => 
        item.jurusan_dipilih === 'Teknik Komputer dan Jaringan'
    ).length;
    
    const tsmCount = pendaftarData.filter(item => 
        item.jurusan_dipilih === 'Teknik Sepeda Motor'
    ).length;
    
    // Update tampilan
    countPemasaran.textContent = pemasaranCount;
    countTKJ.textContent = tkjCount;
    countTSM.textContent = tsmCount;
}

function updatePendaftarTable() {
    pendaftarTableBody.innerHTML = '';
    
    if (pendaftarData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="6" style="text-align: center; padding: 30px;">Belum ada data pendaftar</td>`;
        pendaftarTableBody.appendChild(row);
        dataCount.textContent = 'Menampilkan 0 data';
        return;
    }
    
    // Urutkan data berdasarkan ID (timestamp) terbaru
    const sortedData = [...pendaftarData].sort((a, b) => b.id - a.id);
    
    sortedData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.nama || '-'}</td>
            <td>${item.asal_sekolah || '-'}</td>
            <td>${item.jurusan_dipilih || '-'}</td>
            <td>${item.no_hp || '-'}</td>
            <td>${item.timestamp || '-'}</td>
        `;
        pendaftarTableBody.appendChild(row);
    });
    
    dataCount.textContent = `Menampilkan ${pendaftarData.length} data`;
}

// Event listener untuk refresh data
refreshDataBtn.addEventListener('click', function() {
    console.log('Refresh data diminta...');
    loadPendaftarDataFromServer();
});

// Event listener untuk download PDF
downloadPDFBtn.addEventListener('click', function() {
    if (pendaftarData.length === 0) {
        alert('Tidak ada data untuk diunduh!');
        return;
    }
    
    generatePDF();
});

// Fungsi untuk menghasilkan PDF
function generatePDF() {
    // Inisialisasi jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Judul dokumen
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text('DATA PENDAFTAR SPMB', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('SMK BINA PUTERA BOGOR', 105, 22, { align: 'center' });
    doc.text('TAHUN AJARAN 2026/2027', 105, 29, { align: 'center' });
    
    // Tanggal generate
    const currentDate = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${currentDate}`, 14, 40);
    
    // Statistik per jurusan
    const pemasaranCount = pendaftarData.filter(item => 
        item.jurusan_dipilih === 'Pemasaran'
    ).length;
    
    const tkjCount = pendaftarData.filter(item => 
        item.jurusan_dipilih === 'Teknik Komputer dan Jaringan'
    ).length;
    
    const tsmCount = pendaftarData.filter(item => 
        item.jurusan_dipilih === 'Teknik Sepeda Motor'
    ).length;
    
    // Tambahkan statistik ke PDF
    doc.setFontSize(11);
    doc.text(`Total Pendaftar: ${pendaftarData.length}`, 14, 50);
    doc.text(`Pemasaran: ${pemasaranCount}`, 14, 57);
    doc.text(`Teknik Komputer dan Jaringan: ${tkjCount}`, 14, 64);
    doc.text(`Teknik Sepeda Motor: ${tsmCount}`, 14, 71);
    
    // Data untuk tabel
    const tableData = [];
    
    // Header tabel
    const headers = [
        'No',
        'Nama Lengkap',
        'Asal Sekolah', 
        'Jurusan',
        'No. HP',
        'Tanggal Daftar'
    ];
    
    // Isi tabel
    pendaftarData.forEach((item, index) => {
        tableData.push([
            index + 1,
            item.nama || '-',
            item.asal_sekolah || '-',
            item.jurusan_dipilih || '-',
            item.no_hp || '-',
            item.timestamp || '-'
        ]);
    });
    
    // Buat tabel
    doc.autoTable({
        head: [headers],
        body: tableData,
        startY: 80,
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [67, 97, 238],
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240]
        },
        margin: { top: 80 }
    });
    
    // Simpan PDF
    doc.save(`Data_Pendaftar_SMB_${new Date().toISOString().slice(0,10)}.pdf`);
}

// Reset border color ketika user mulai mengetik
document.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', function() {
        this.style.borderColor = '#e9ecef';
    });
});

// Fungsi untuk test koneksi ke Google Apps Script
function testGoogleScriptConnection() {
    const testData = new FormData();
    testData.append('test', 'connection');
    
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: testData
    })
    .then(response => {
        console.log('✅ Koneksi ke Google Apps Script berhasil (Status: ' + response.status + ')');
    })
    .catch(error => {
        console.warn('⚠️ Koneksi ke Google Apps Script gagal. Data akan disimpan di lokal saja.', error);
    });
}
