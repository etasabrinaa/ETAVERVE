// ==========================================
// CONSTANTS & LOCAL STORAGE KEYS
// ==========================================
const REPORTS_STORAGE_KEY = 'EDUTRACK_REPORTS_DATA_V2';
const RATES_STORAGE_KEY = 'EDUTRACK_STUDENT_RATES_V2';
const AUTH_SESSION_KEY = 'EDUTRACK_GURU_LOGGED_IN';

// Default initial data for demo
const INITIAL_DUMMY_REPORTS = [
    {
        id: 'rep-1',
        namaMurid: 'Budi Santoso',
        tanggal: '2026-09-01',
        pertemuanKe: 1,
        materi: 'Matematika - Bab 1 Eksponen dan Bentuk Akar. Penjelasan rumus dan 5 latihan soal.',
        foto: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
        catatan: 'Budi sangat antusias, materi eksponen dipahami dengan baik.'
    },
    {
        id: 'rep-2',
        namaMurid: 'Budi Santoso',
        tanggal: '2026-09-04',
        pertemuanKe: 2,
        materi: 'Fisika - Gerak Lurus Beraturan (GLB) dan GLBB. Pembahasan grafik dan rumus V = S/t.',
        foto: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80',
        catatan: 'Perlu sedikit latihan tambahan di perhitungan satuan meter/detik.'
    },
    {
        id: 'rep-3',
        namaMurid: 'Siti Rahma',
        tanggal: '2026-09-02',
        pertemuanKe: 1,
        materi: 'IPA - Tata Surya dan Karakteristik Planet Terrestrial.',
        foto: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80',
        catatan: 'Siti mengumpulkan tugas catatan dengan sangat rapi.'
    }
];

// Default individual rates per student
const INITIAL_DUMMY_RATES = {
    'Budi Santoso': 85000,
    'Siti Rahma': 75000,
    'DEFAULT': 75000
};

// Global Application State
let reports = [];
let studentRates = {};
let isGuruLoggedIn = false;
let currentActiveRole = 'wali'; // Default view is public 'wali'

// Initialize Application when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    loadStoredData();
    checkAuthSession();
    setCurrentDateDefaults();
    setupDatalistMurid();

    // Initial Renders
    renderWaliDashboard();
    renderGuruHistory();
    renderStudentRatesTable();

    // Set Print Date Display
    const printDateElem = document.getElementById('printDate');
    if (printDateElem) {
        printDateElem.innerText = new Date().toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }
});

function loadStoredData() {
    // Load Reports
    const savedReports = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (savedReports) {
        try { reports = JSON.parse(savedReports); } catch (e) { reports = INITIAL_DUMMY_REPORTS; }
    } else {
        reports = INITIAL_DUMMY_REPORTS;
        saveReportsToStorage();
    }

    // Load Per-Student Rates
    const savedRates = localStorage.getItem(RATES_STORAGE_KEY);
    if (savedRates) {
        try { studentRates = JSON.parse(savedRates); } catch (e) { studentRates = INITIAL_DUMMY_RATES; }
    } else {
        studentRates = INITIAL_DUMMY_RATES;
        saveRatesToStorage();
    }
}

function saveReportsToStorage() {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
}

function saveRatesToStorage() {
    localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(studentRates));
}

function checkAuthSession() {
    isGuruLoggedIn = localStorage.getItem(AUTH_SESSION_KEY) === 'true';
    updateAuthUI();
}

function updateAuthUI() {
    const btnLogout = document.getElementById('btnLogoutGuru');
    const btnGuruLabel = document.getElementById('btnGuruLabel');

    if (isGuruLoggedIn) {
        btnLogout.classList.remove('hidden');
        btnGuruLabel.innerText = 'Dashboard Guru';
    } else {
        btnLogout.classList.add('hidden');
        btnGuruLabel.innerText = 'Login Guru';
    }
}

function setCurrentDateDefaults() {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);

    const inputTanggal = document.getElementById('inputTanggal');
    if (inputTanggal) inputTanggal.value = today;

    const filterGuruBulan = document.getElementById('filterGuruBulan');
    if (filterGuruBulan) filterGuruBulan.value = currentMonth;

    const selectWaliBulan = document.getElementById('selectWaliBulan');
    if (selectWaliBulan) selectWaliBulan.value = currentMonth;
}

// ==========================================
// AUTHENTICATION & ROLE SWITCHING
// ==========================================
function handleGuruRoleClick() {
    if (isGuruLoggedIn) {
        switchRole('guru');
    } else {
        openLoginModal();
    }
}

function openLoginModal() {
    document.getElementById('modalLogin').classList.remove('hidden');
}

function closeLoginModal() {
    document.getElementById('modalLogin').classList.add('hidden');
}

function handleLoginSubmit(event) {
    event.preventDefault();
    const user = document.getElementById('loginUsername').value.trim();
    const pass = document.getElementById('loginPassword').value.trim();

    // Default Credential Check
    if (user === 'Hepta' && pass === '12345') {
        isGuruLoggedIn = true;
        localStorage.setItem(AUTH_SESSION_KEY, 'true');
        updateAuthUI();
        closeLoginModal();
        switchRole('guru');
        showToast('Berhasil login sebagai Guru!', 'success');
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
    } else {
        showToast('Username atau password salah!', 'error');
    }
}

function logoutGuru() {
    isGuruLoggedIn = false;
    localStorage.removeItem(AUTH_SESSION_KEY);
    updateAuthUI();
    switchRole('wali');
    showToast('Anda telah logout dari mode Guru.', 'info');
}

function switchRole(role) {
    if (role === 'guru' && !isGuruLoggedIn) {
        openLoginModal();
        return;
    }

    currentActiveRole = role;
    const btnGuru = document.getElementById('btnRoleGuru');
    const btnWali = document.getElementById('btnRoleWali');
    const viewGuru = document.getElementById('viewGuru');
    const viewWali = document.getElementById('viewWali');

    if (role === 'guru') {
        btnGuru.className = "flex-1 sm:flex-initial px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 bg-white text-sky-700 shadow-sm";
        btnWali.className = "flex-1 sm:flex-initial px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900";
        viewGuru.classList.remove('hidden');
        viewWali.classList.add('hidden');
        renderGuruHistory();
        renderStudentRatesTable();
    } else {
        btnWali.className = "flex-1 sm:flex-initial px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 bg-white text-sky-700 shadow-sm";
        btnGuru.className = "flex-1 sm:flex-initial px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900";
        viewGuru.classList.add('hidden');
        viewWali.classList.remove('hidden');
        setupWaliMuridDropdown();
        renderWaliDashboard();
    }
}

// ==========================================
// INDIVIDUAL STUDENT RATES MANAGEMENT
// ==========================================
function openModalAddStudentRate() {
    document.getElementById('modalStudentRate').classList.remove('hidden');
}

function closeModalAddStudentRate() {
    document.getElementById('modalStudentRate').classList.add('hidden');
    document.getElementById('rateModalNamaMurid').value = '';
    document.getElementById('rateModalNominal').value = '';
}

function handleSaveStudentRate(e) {
    e.preventDefault();
    const nama = document.getElementById('rateModalNamaMurid').value.trim();
    const rate = parseInt(document.getElementById('rateModalNominal').value, 10);

    if (nama && !isNaN(rate) && rate >= 0) {
        studentRates[nama] = rate;
        saveRatesToStorage();
        closeModalAddStudentRate();
        renderStudentRatesTable();
        renderGuruHistory();
        setupDatalistMurid();
        showToast(`Tarif untuk ${nama} disimpan: Rp ${rate.toLocaleString('id-ID')}`, 'success');
    }
}

function deleteStudentRate(nama) {
    if (confirm(`Hapus kustom tarif untuk murid "${nama}"? (Akan kembali ke tarif default)`)) {
        delete studentRates[nama];
        saveRatesToStorage();
        renderStudentRatesTable();
        renderGuruHistory();
        showToast(`Tarif khusus ${nama} telah dihapus`, 'info');
    }
}

function getRateForStudent(namaMurid) {
    if (studentRates[namaMurid] !== undefined) {
        return studentRates[namaMurid];
    }
    return studentRates['DEFAULT'] || 75000;
}

function renderStudentRatesTable() {
    const tbody = document.getElementById('studentRatesTableBody');
    if (!tbody) return;

    const names = Object.keys(studentRates).filter(n => n !== 'DEFAULT');

    if (names.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="py-4 text-center text-slate-400 italic">
                    Belum ada tarif khusus. Semua murid menggunakan tarif standar Rp ${(studentRates['DEFAULT'] || 75000).toLocaleString('id-ID')} / sesi.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = names.map(nama => `
        <tr class="hover:bg-slate-50 transition-all">
            <td class="py-2.5 px-3 font-medium text-slate-800">${escapeHtml(nama)}</td>
            <td class="py-2.5 px-3 font-semibold text-sky-700">Rp ${studentRates[nama].toLocaleString('id-ID')} <span class="text-[10px] text-slate-400 font-normal">/ sesi</span></td>
            <td class="py-2.5 px-3 text-right">
                <button onclick="deleteStudentRate('${escapeHtml(nama)}')" class="text-red-500 hover:text-red-700 p-1 text-xs">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ==========================================
// REPORT CRUD & FORM HANDLING
// ==========================================
function setupDatalistMurid() {
    const listMurid = document.getElementById('listMurid');
    if (!listMurid) return;

    listMurid.innerHTML = '';
    
    // Collect names from both reports & student rates list
    const namesFromReports = reports.map(r => r.namaMurid);
    const namesFromRates = Object.keys(studentRates).filter(n => n !== 'DEFAULT');
    const uniqueNames = [...new Set([...namesFromReports, ...namesFromRates])];

    uniqueNames.forEach(nama => {
        const opt = document.createElement('option');
        opt.value = nama;
        listMurid.appendChild(opt);
    });
}

function autoCalculatePertemuan() {
    const editId = document.getElementById('editReportId').value;
    if (editId) return;

    const nama = document.getElementById('inputNamaMurid').value.trim();
    if (!nama) {
        document.getElementById('inputPertemuanKe').value = 1;
        return;
    }

    const count = reports.filter(r => r.namaMurid.toLowerCase() === nama.toLowerCase()).length;
    document.getElementById('inputPertemuanKe').value = count + 1;
}

function handleFotoPreview() {
    const url = document.getElementById('inputFotoUrl').value.trim();
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');

    if (url) {
        imagePreview.src = url;
        previewContainer.classList.remove('hidden');
    } else {
        previewContainer.classList.add('hidden');
    }
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('inputFotoUrl').value = e.target.result;
        handleFotoPreview();
    };
    reader.readAsDataURL(file);
}

function clearFotoPreview() {
    document.getElementById('inputFotoUrl').value = '';
    document.getElementById('inputFotoFile').value = '';
    document.getElementById('previewContainer').classList.add('hidden');
}

function handleSaveLaporan(e) {
    e.preventDefault();

    const editId = document.getElementById('editReportId').value;
    const namaMurid = document.getElementById('inputNamaMurid').value.trim();
    const tanggal = document.getElementById('inputTanggal').value;
    const pertemuanKe = parseInt(document.getElementById('inputPertemuanKe').value, 10) || 1;
    const materi = document.getElementById('inputMateri').value.trim();
    const foto = document.getElementById('inputFotoUrl').value.trim();
    const catatan = document.getElementById('inputCatatan').value.trim();

    if (!namaMurid || !tanggal || !materi) {
        showToast('Mohon lengkapi field wajib!', 'error');
        return;
    }

    if (editId) {
        const index = reports.findIndex(r => r.id === editId);
        if (index !== -1) {
            reports[index] = { ...reports[index], namaMurid, tanggal, pertemuanKe, materi, foto, catatan };
            showToast('Laporan berhasil diperbarui!', 'success');
        }
    } else {
        const newReport = {
            id: 'rep-' + Date.now(),
            namaMurid,
            tanggal,
            pertemuanKe,
            materi,
            foto,
            catatan
        };
        reports.unshift(newReport);
        showToast('Laporan harian berhasil disimpan!', 'success');
    }

    saveReportsToStorage();
    setupDatalistMurid();
    resetForm();
    renderGuruHistory();
}

function editReport(id) {
    const rep = reports.find(r => r.id === id);
    if (!rep) return;

    document.getElementById('editReportId').value = rep.id;
    document.getElementById('inputNamaMurid').value = rep.namaMurid;
    document.getElementById('inputTanggal').value = rep.tanggal;
    document.getElementById('inputPertemuanKe').value = rep.pertemuanKe;
    document.getElementById('inputMateri').value = rep.materi;
    document.getElementById('inputFotoUrl').value = rep.foto || '';
    document.getElementById('inputCatatan').value = rep.catatan || '';

    handleFotoPreview();

    document.getElementById('btnSubmitForm').innerHTML = `<i class="fa-solid fa-pen"></i><span>Update Laporan</span>`;
    document.getElementById('btnCancelEdit').classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteReport(id) {
    if (confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
        reports = reports.filter(r => r.id !== id);
        saveReportsToStorage();
        setupDatalistMurid();
        renderGuruHistory();
        showToast('Laporan telah dihapus', 'info');
    }
}

function resetForm() {
    document.getElementById('formInputLaporan').reset();
    document.getElementById('editReportId').value = '';
    clearFotoPreview();
    setCurrentDateDefaults();
    
    document.getElementById('btnSubmitForm').innerHTML = `<i class="fa-solid fa-paper-plane"></i><span>Simpan Laporan</span>`;
    document.getElementById('btnCancelEdit').classList.add('hidden');
}

// ==========================================
// RENDER GURU DASHBOARD
// ==========================================
function renderGuruHistory() {
    const filterMurid = document.getElementById('filterGuruMurid');
    const filterBulan = document.getElementById('filterGuruBulan').value;
    const container = document.getElementById('guruLogList');

    if (!filterMurid || !container) return;

    // Populate Filter Dropdown
    const currentSelectedMurid = filterMurid.value || 'ALL';
    filterMurid.innerHTML = `<option value="ALL">Semua Murid</option>`;
    
    const uniqueNames = [...new Set(reports.map(r => r.namaMurid))];
    uniqueNames.forEach(nama => {
        const opt = document.createElement('option');
        opt.value = nama;
        opt.innerText = nama;
        if (nama === currentSelectedMurid) opt.selected = true;
        filterMurid.appendChild(opt);
    });

    // Filter Logic
    let filtered = reports.filter(r => {
        const matchMurid = (filterMurid.value === 'ALL' || r.namaMurid === filterMurid.value);
        const matchBulan = filterBulan ? r.tanggal.startsWith(filterBulan) : true;
        return matchMurid && matchBulan;
    });

    filtered.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    // Dynamic Honor Calculation (Summing each report using the specific student rate)
    const totalHonorEst = filtered.reduce((sum, rep) => {
        const rate = getRateForStudent(rep.namaMurid);
        return sum + rate;
    }, 0);

    document.getElementById('guruTotalHonor').innerText = `Rp ${totalHonorEst.toLocaleString('id-ID')}`;

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <i class="fa-solid fa-folder-open text-3xl text-slate-300 mb-2"></i>
                <p class="text-slate-500 font-medium text-sm">Belum ada laporan pertemuan untuk filter ini.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(r => {
        const rateUnit = getRateForStudent(r.namaMurid);
        return `
            <div class="bg-slate-50 hover:bg-white p-4 rounded-xl border border-slate-200 transition-all shadow-xs space-y-3">
                <div class="flex justify-between items-start gap-2">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-slate-800 text-sm">${escapeHtml(r.namaMurid)}</span>
                            <span class="bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-md font-semibold">Pertemuan #${r.pertemuanKe}</span>
                        </div>
                        <div class="text-xs text-slate-500 mt-1 flex items-center gap-3">
                            <span><i class="fa-regular fa-calendar text-slate-400 mr-1"></i>${formatTanggal(r.tanggal)}</span>
                            <span class="font-semibold text-emerald-600"><i class="fa-solid fa-money-bill-wave mr-1"></i>Rp ${rateUnit.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-1">
                        <button onclick="editReport('${r.id}')" title="Edit" class="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-sky-50 hover:text-sky-600 text-slate-600 flex items-center justify-center text-xs transition-all">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button onclick="deleteReport('${r.id}')" title="Hapus" class="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-600 flex items-center justify-center text-xs transition-all">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>

                <div class="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-100 leading-relaxed">
                    <span class="font-semibold text-slate-900 block mb-1">Materi:</span>
                    ${escapeHtml(r.materi)}
                </div>

                ${r.catatan ? `
                    <div class="text-xs text-amber-800 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/50 flex items-start gap-2">
                        <i class="fa-regular fa-lightbulb mt-0.5 text-amber-600"></i>
                        <div><span class="font-semibold">Catatan:</span> ${escapeHtml(r.catatan)}</div>
                    </div>
                ` : ''}

                ${r.foto ? `
                    <div class="pt-1">
                        <a href="${r.foto}" target="_blank" class="inline-flex items-center gap-1.5 text-xs text-sky-600 font-medium hover:underline">
                            <i class="fa-solid fa-image"></i> Lihat Foto Dokumentasi
                        </a>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// ==========================================
// RENDER WALI MURID PUBLIC DASHBOARD
// ==========================================
function setupWaliMuridDropdown() {
    const select = document.getElementById('selectWaliMurid');
    if (!select) return;

    const currentSelected = select.value;
    select.innerHTML = '';

    const names = [...new Set(reports.map(r => r.namaMurid))];
    
    if (names.length === 0) {
        select.innerHTML = `<option value="">Belum Ada Data Siswa</option>`;
        return;
    }

    names.forEach(nama => {
        const opt = document.createElement('option');
        opt.value = nama;
        opt.innerText = nama;
        if (nama === currentSelected) opt.selected = true;
        select.appendChild(opt);
    });
}

function renderWaliDashboard() {
    const selectWali = document.getElementById('selectWaliMurid');
    const selectBulan = document.getElementById('selectWaliBulan');
    const timelineContainer = document.getElementById('waliTimelineList');

    if (!selectWali || !selectBulan || !timelineContainer) return;

    const selectedMurid = selectWali.value;
    const selectedBulan = selectBulan.value;

    document.getElementById('labelNamaMuridWali').innerText = selectedMurid || 'Semua Siswa';
    document.getElementById('labelPeriodeWali').innerText = selectedBulan ? formatBulanTahun(selectedBulan) : 'Semua Bulan';

    if (!selectedMurid) {
        document.getElementById('statWaliTotalPertemuan').innerText = '0 Sesi';
        document.getElementById('statWaliTotalMateri').innerText = '0 Topik';
        timelineContainer.innerHTML = `
            <div class="text-center py-12 text-slate-500 text-sm">
                Silakan pilih nama siswa terlebih dahulu.
            </div>
        `;
        return;
    }

    const filtered = reports.filter(r => {
        const matchMurid = r.namaMurid === selectedMurid;
        const matchBulan = selectedBulan ? r.tanggal.startsWith(selectedBulan) : true;
        return matchMurid && matchBulan;
    });

    filtered.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    document.getElementById('statWaliTotalPertemuan').innerText = `${filtered.length} Sesi`;
    document.getElementById('statWaliTotalMateri').innerText = `${filtered.length} Topik`;

    if (filtered.length === 0) {
        timelineContainer.innerHTML = `
            <div class="text-center py-12 text-slate-500 text-sm">
                <i class="fa-solid fa-calendar-xmark text-3xl text-slate-300 mb-2 block"></i>
                Tidak ada catatan pertemuan untuk <b>${escapeHtml(selectedMurid)}</b> di periode <b>${formatBulanTahun(selectedBulan)}</b>.
            </div>
        `;
        return;
    }

    // NOTE: Salary/Honor information is explicitly EXCLUDED from the Parent View.
    timelineContainer.innerHTML = filtered.map(r => `
        <div class="relative pl-8 sm:pl-12 group">
            <div class="absolute left-1.5 sm:left-4 top-1.5 -translate-x-1/2 w-5 h-5 rounded-full bg-sky-500 border-4 border-white shadow-sm flex items-center justify-center"></div>

            <div class="bg-slate-50 group-hover:bg-white p-5 rounded-2xl border border-slate-200 transition-all shadow-card space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                    <div>
                        <span class="bg-sky-100 text-sky-700 font-bold text-xs px-2.5 py-1 rounded-lg">Pertemuan Ke-${r.pertemuanKe}</span>
                        <h4 class="text-sm font-bold text-slate-800 mt-2">${formatTanggal(r.tanggal)}</h4>
                    </div>
                    <span class="text-xs text-slate-400 font-medium">${r.tanggal}</span>
                </div>

                <div>
                    <h5 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Materi Yang Diajarkan:</h5>
                    <p class="text-sm text-slate-800 font-medium leading-relaxed bg-white p-3.5 rounded-xl border border-slate-100">
                        ${escapeHtml(r.materi)}
                    </p>
                </div>

                ${r.catatan ? `
                    <div>
                        <h5 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Catatan Evaluasi Guru:</h5>
                        <div class="text-xs text-indigo-900 bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 flex items-start gap-2">
                            <i class="fa-solid fa-comment-dots text-indigo-500 mt-0.5"></i>
                            <span>${escapeHtml(r.catatan)}</span>
                        </div>
                    </div>
                ` : ''}

                ${r.foto ? `
                    <div>
                        <h5 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Dokumentasi Sesi Belajar:</h5>
                        <div class="rounded-xl overflow-hidden border border-slate-200 max-w-md bg-slate-100">
                            <img src="${r.foto}" alt="Dokumentasi Les" class="w-full h-48 sm:h-56 object-cover hover:scale-105 transition-transform duration-300" onerror="this.onerror=null; this.src='https://placehold.co/600x400/e2e8f0/475569?text=Foto+Tidak+Tersedia';">
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function formatTanggal(dateStr) {
    if (!dateStr) return '-';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
}

function formatBulanTahun(yearMonthStr) {
    if (!yearMonthStr) return '-';
    const [year, month] = yearMonthStr.split('-');
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    
    let bgClass = 'bg-slate-800 text-white';
    if (type === 'success') bgClass = 'bg-emerald-600 text-white';
    if (type === 'error') bgClass = 'bg-red-600 text-white';

    toast.className = `${bgClass} text-xs font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all duration-300 transform translate-y-2 opacity-0`;
    toast.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-info'}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}