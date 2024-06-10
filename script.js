
document.addEventListener('DOMContentLoaded', function () {

    ////LANDING PAGE
    const landingPage = document.getElementById('landingPage');
    const header = document.getElementById('header');
    const main = document.getElementById('main');
    const footer = document.getElementById('footer');
    const enterButton = document.getElementById('enterButton');

    enterButton.addEventListener('click', function () {
        // Tampilkan overlay loading
        loadingOverlay.style.display = 'flex';

        setTimeout(function () {
            // Sembunyikan overlay loading
            loadingOverlay.style.display = 'none';

            // Tampilkan konten utama
            landingPage.style.display = 'none';
            header.style.display = 'block';
            main.style.display = 'block';



            // Aktifkan konten pertama (contents)
            document.getElementById('contents').classList.add('active');

            // Klik tab default
            document.getElementById("Link__dashboard").click();
        }, 500); // Simulasi loading selama 2 detik
    });

    const tablinks = document.querySelectorAll('.tablinks');
    const tabcontents = document.querySelectorAll('.tabcontent');
    let openTab = null;
    let openContent = null;

    tablinks.forEach((tablinks, index) => {
        tablinks.addEventListener('click', function () {
            if (openTab) {
                openTab.classList.remove("active");
            }
            if (openContent) {
                openContent.style.display = 'none'
            }

            const tabID = tablinks.id;
            const currentTab = document.getElementById(tabID);

            const contenID = tabcontents[index].id;
            const currentConten = document.getElementById(contenID);

            currentConten.style.display = "block";
            openContent = currentConten;

            currentTab.className += " active";
            openTab = currentTab;

        })

    });

    //fungsi untuk kembali ke halaman landing page
    document.getElementById('exit').addEventListener('click', () => {
        const landingPage = document.getElementById('landingPage');
        const header = document.getElementById('header');
        const main = document.getElementById('main');

        // Tampilkan halaman landing dan sembunyikan konten utama
        landingPage.style.display = 'block';
        header.style.display = 'none';
        main.style.display = 'none';

    });

});

////DASHBOARD
//mengambil data 
import data from './assets/data/nyc.json' with {type: 'json'}; // Sesuaikan dengan path yang benar
if (!data) {
    loadingOverlay.style.display = 'flex'; // Tampilkan overlay
} else {
    loadingOverlay.style.display = 'none';
}

// daftar canvas
const SaleChart = document.getElementById("sale").getContext("2d");
const BoroughChart = document.getElementById('bar-chart-borough').getContext("2d");
const classChart = document.getElementById('bar-chart-class-category').getContext("2d");

// daftar filter
const filterTahun = document.getElementById('filter-tahun');
const boroughDropdown = document.getElementById('borough-dropdown');

// visualisasi awal dashboard
let dwellings = FilterData(data, 'BUILDINGCLASSCATEGORY', 'DWELLINGS');
let chartSaleAll = CreateChart('line', 'NYC Property Sale', SaleChart, [
    { label: 'All NYC data property sale', data: countDataByMonthAndYear(data), borderColor: '#FFDE3E', backgroundColor: '#ffdf3e64' },
    { label: 'Dwellings Sales', data: countDataByMonthAndYear(dwellings), borderColor: '#3e95cd', backgroundColor: '#3e95cd64' }
]);
let ChartBorougharea = CreateChart('bar', 'Penjualan Dwellings per Borough', BoroughChart, [
    { label: 'Dwellings per Borough', data: countSalesByBorough(dwellings), backgroundColor: '#ffdf3e64', borderColor: '#FFDE3E' }
]);
let ChartClass = CreateChart('bar', 'Dwelling Class Category', classChart, [
    { label: 'Dwelling Class Category', data: calculateRevenueByBuildingClass(dwellings), backgroundColor: '#3e95cd64', borderColor: '#3e95cd' }
]);

//menambilkan total pendapatan dan transaksi
displayTotalRevenue(dwellings);
displayTotalTransaction(dwellings);

//filter
filterTahun.addEventListener('change', updateAllCharts);
boroughDropdown.addEventListener('change', updateAllCharts);

// Fungsi untuk memperbarui semua grafik berdasarkan filter dan data yang dipilih
function updateAllCharts() {
    // Dapatkan nilai filter dari dropdown
    const filterValue = filterTahun.value; // Filter berdasarkan tahun
    const selectedBorough = boroughDropdown.value; // Borough yang dipilih

    // Inisialisasi variabel untuk data yang difilter
    let filteredDwellings = dwellings; // Default semua hunian
    let dataUpdate = data; // Default semua data

    // Terapkan filter jika nilai filter dipilih
    if (filterValue) {
        // Filter data berdasarkan tanggal penjualan
        dataUpdate = FilterData(data, 'SALEDATE', filterValue);
        filteredDwellings = FilterData(dwellings, 'SALEDATE', filterValue);
    }

    // Terapkan filter borough jika borough tertentu dipilih
    if (selectedBorough !== "ALL BOROUGH") {
        // Filter data berdasarkan borough yang dipilih
        dataUpdate = data.filter(item => item.BOROUGH == selectedBorough);
        filteredDwellings = filteredDwellings.filter(item => item.BOROUGH == selectedBorough);
    }

    // Perbarui grafik dengan data yang difilter
    // Perbarui grafik untuk penjualan berdasarkan bulan dan tahun
    updateChartData(chartSaleAll, [
        countDataByMonthAndYear(dataUpdate), // Semua data
        countDataByMonthAndYear(filteredDwellings) // Data yang difilter
    ]);

    // Perbarui grafik untuk penjualan berdasarkan borough
    updateChartData(ChartBorougharea, [
        countSalesByBorough(filteredDwellings) // Data yang difilter berdasarkan borough
    ]);

    // Perbarui grafik untuk pendapatan berdasarkan kelas bangunan
    updateChartData(ChartClass, [
        calculateRevenueByBuildingClass(filteredDwellings) // Data yang difilter berdasarkan kelas bangunan
    ]);

    // Tampilkan total pendapatan dan total transaksi untuk data yang difilter
    displayTotalRevenue(filteredDwellings);
    displayTotalTransaction(filteredDwellings);
}

function updateChartData(chart, newData) {
    chart.data.datasets.forEach((dataset, index) => {
        dataset.data = Object.values(newData[index]);
    });
    chart.data.labels = Object.keys(newData[0]); // Assumes all datasets have the same labels
    chart.update();
}

function CreateChart(type, ChartName, ChartID, datasets) {
    const data = {
        labels: Object.keys(datasets[0].data), // Assumes all datasets have the same labels
        datasets: datasets.map(ds => ({
            label: ds.label,
            data: Object.values(ds.data),
            backgroundColor: ds.backgroundColor,
            borderColor: ds.borderColor,
            fill: false,
            borderWidth: 2,
            tension: 0, // Controls the curve of the line (0 for straight lines)
            pointRadius: 2, // Radius of the points on the line
            pointHoverRadius: 7 // Radius of the points when hovered
        }))
    };

    const createdChart = new Chart(ChartID, {
        type: type,
        data: data,
        options: {
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        font: {
                            size: 16 // Ukuran font untuk judul skala X
                        }
                    },
                    ticks: {
                        font: {
                            size: 8 // Ukuran font untuk skala X
                        }
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        font: {
                            size: 16 // Ukuran font untuk judul skala Y
                        }
                    },
                    ticks: {
                        font: {
                            size: 8 // Ukuran font untuk skala Y
                        }
                    }
                }
            },
            grid: {
                display: false // Optional: Hides the grid lines for better visibility of bars
            }
        },
        plugins: {
            legend: {
                labels: {
                    font: {
                        size: 10 // Ukuran font untuk label legenda
                    }
                }
            },
            title: {
                display: false,
                text: ChartName,
                font: {
                    size: 18 // Ukuran font untuk judul chart
                }
            },
            elements: {
                bar: {
                    borderWidth: 2,
                    borderRadius: 4,
                    barThickness: 5
                }
            }
        }
    });

    return createdChart;
}
// Fungsi untuk menghitung jumlah data berdasarkan bulan dan tahun dari data penjualan
function countDataByMonthAndYear(data) {
    return data.reduce((counts, item) => {
        if (item.SALEDATE) {
            const [year, month] = item.SALEDATE.split('-'); // Pisahkan tahun dan bulan dari tanggal penjualan
            const key = `${getMonthName(parseInt(month))} ${year}`; // Buat kunci dengan nama bulan dan tahun
            counts[key] = (counts[key] || 0) + 1; // Tambahkan jumlah penjualan ke dalam objek counts
        } else {
            console.warn('Format SALEDATE tidak valid:', item.SALEDATE); // Tampilkan pesan jika format tanggal penjualan tidak valid
        }
        return counts;
    }, {});
}

// Fungsi untuk mendapatkan nama bulan berdasarkan nomor bulan
function getMonthName(monthNumber) {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthNumber - 1] || ''; // Mengembalikan nama bulan berdasarkan nomor bulan
}

// Fungsi untuk melakukan filter data berdasarkan kolom dan nilai tertentu
function FilterData(data, column, value) {
    if (column === 'SALEDATE') {
        return data.filter(dataset => dataset[column].startsWith(value)); // Filter berdasarkan awalan nilai untuk kolom SALEDATE
    }
    return data.filter(dataset => dataset[column].includes(value)); // Filter berdasarkan nilai yang terdapat dalam kolom
}

// Fungsi untuk menampilkan total pendapatan dari data penjualan
function displayTotalRevenue(data) {
    let totalRevenue = 0;
    data.forEach(item => {
        const salePrice = parseFloat(item.SALEPRICE); // Ambil harga penjualan dan ubah ke dalam tipe data float
        if (!isNaN(salePrice)) { // Periksa apakah harga penjualan valid
            totalRevenue += salePrice; // Tambahkan harga penjualan ke total pendapatan
        }
    });
    document.getElementById('total-revenue').textContent = '$' + formatNumber(totalRevenue); // Tampilkan total pendapatan dengan format mata uang
}

// Fungsi untuk menampilkan total transaksi dari data penjualan
function displayTotalTransaction(data) {
    let count = 0;
    data.forEach(item => {
        const salePrice = parseFloat(item.SALEPRICE); // Ambil harga penjualan dan ubah ke dalam tipe data float
        if (!isNaN(salePrice)) { // Periksa apakah harga penjualan valid
            count++; // Tambahkan jumlah transaksi
        }
    });

    document.getElementById('total-transaction').textContent = formatNumber(count); // Tampilkan jumlah transaksi dengan format angka
}

// Fungsi untuk menghitung jumlah penjualan berdasarkan borough
function countSalesByBorough(data) {
    const countsale = {};
    data.forEach(item => {
        const borough = item.BOROUGH; // Ambil borough dari data
        if (borough) { // Pastikan borough tidak kosong
            countsale[borough] = (countsale[borough] || 0) + 1; // Tambahkan jumlah penjualan berdasarkan borough
        }
    });
    return countsale; // Kembalikan objek dengan jumlah penjualan berdasarkan borough
}

// Fungsi untuk menghitung pendapatan berdasarkan kelas bangunan
function calculateRevenueByBuildingClass(data) {
    const revenueByBuildingClass = {};
    data.forEach(item => {
        const buildingClass = item['BUILDINGCLASSCATEGORY']; // Ambil kelas bangunan dari data
        const salePrice = parseFloat(item['SALEPRICE']); // Ambil harga penjualan dan ubah ke dalam tipe data float
        if (buildingClass && !isNaN(salePrice)) { // Periksa apakah kelas bangunan dan harga penjualan valid
            revenueByBuildingClass[buildingClass] = (revenueByBuildingClass[buildingClass] || 0) + salePrice; // Tambahkan pendapatan berdasarkan kelas bangunan
        }
    });
    return revenueByBuildingClass; // Kembalikan objek dengan pendapatan berdasarkan kelas bangunan
}

function formatNumber(num) {
    if (num >= 1000 && num < 1000000) {
        return (num / 1000).toFixed(1) + 'k'; // mengubah 1000 - 999999 menjadi 1k - 999k
    } else if (num >= 1000000 && num < 1000000000) {
        return (num / 1000000).toFixed(1) + 'M'; // mengubah 1000000 - 999999999 menjadi 1M - 999M
    } else if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B'; // mengubah 1000000000 dan seterusnya menjadi 1B dan seterusnya
    } else {
        return num.toString(); // mengubah angka di bawah 1000 menjadi string biasa
    }
}





/////////////////// TABEL DATA

const pageSize = 100; // Sesuaikan dengan jumlah data per halaman yang diinginkan
let currentPage = 1;
let totalPages = Math.ceil(dwellings.length / pageSize);
const column = [
    'BOROUGH',
    'NEIGHBORHOOD',
    'BUILDINGCLASSCATEGORY',
    'TAXCLASSATPRESENT',
    'BLOCK',
    'LOT',
    'BUILDINGCLASSATPRESENT',
    'ADDRESS',
    'ZIPCODE',
    'RESIDENTIALUNITS',
    'COMMERCIALUNITS',
    'TOTALUNITS',
    'LANDSQUAREFEET',
    'GROSSSQUAREFEET',
    'YEARBUILT',
    'BUILDINGCLASSATTIMEOFSALE',
    'SALEPRICE',
    'SALEDATE',
]

function displayData(page, dataToDisplay) {
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const paginatedData = dataToDisplay.slice(startIndex, endIndex);

    const tableBody = document.getElementById('dataBody');
    tableBody.innerHTML = ''; // Bersihkan isi tabel sebelum menambahkan data baru

    let i = startIndex;
    paginatedData.forEach(item => {
        i++;
        const row = document.createElement('tr');
        row.innerHTML += `<td>${i}</td>`;
        column.forEach(col => {
            row.innerHTML += `<td>${item[col]}</td>`;
        });
        tableBody.appendChild(row);
    });

    // Perbarui informasi halaman dan jumlah data
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('totalDataInfo').textContent = `Total Data: ${dataToDisplay.length}`;

    // Perbarui kondisi tombol
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}


document.addEventListener('DOMContentLoaded', () => {
    displayData(currentPage, dwellings);

    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayData(currentPage, dwellings);
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayData(currentPage, dwellings);
        }
    });

    // Event listener untuk pencarian
    document.getElementById('search__data').addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            if (activeButton) {
                removeEventClick();
            }
            const filteredData = searchDwellings();
            currentPage = 1; // Kembalikan ke halaman pertama setelah pencarian
            totalPages = Math.ceil(filteredData.length / pageSize); // Perbarui jumlah halaman
            displayData(currentPage, filteredData); // Tampilkan data hasil pencarian

        }
    });


    document.getElementById('closeModal').addEventListener('click', () => {
        closeModal()
    });

    document.getElementById('closeButton').addEventListener('click', () => {
        closeModal()
    });

    window.addEventListener('click', event => {
        if (event.target === document.getElementById('noResultsModal')) {
            closeModal()
        }
    });
    //tambah tombol sort

    let activeButton = null; // Variabel untuk menyimpan tombol yang sedang aktif
    const headers = document.querySelectorAll('.header');

    headers.forEach((header, index) => {
        if (index > 0) {
            const button = document.createElement('button');
            button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-up-fill" viewBox="0 0 16 16">
                <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-down-fill" viewBox="0 0 16 16">
                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
            </svg>`;
            button.value = column[index - 1];
            button.addEventListener('click', function () {
                // Hapus event listener dari tombol sebelumnya jika ada
                if (activeButton != null && activeButton != button) {
                    removeEventClick()
                }

                // Set tombol yang sedang aktif menjadi tombol yang baru di klik
                activeButton = button;

                // Tambahkan event listener pada tombol yang baru di klik
                activeButtonClickHandler();
            });

            header.appendChild(button);
        }
    });
    // Event listener untuk perubahan pada filter atau urutan pengurutan

    // Fungsi untuk menangani event klik pada tombol yang aktif
    function activeButtonClickHandler() {
        const caretUp = activeButton.querySelector('.bi-caret-up-fill');
        const caretDown = activeButton.querySelector('.bi-caret-down-fill');
        if (caretUp.style.display === 'block') {
            caretUp.style.display = 'none';
            caretDown.style.color = 'red';
            caretDown.style.display = 'block';
            updateDisplayedData(activeButton.value, 'desc');
        } else {
            caretUp.style.display = 'block';
            caretUp.style.color = 'green';
            caretDown.style.display = 'none';
            updateDisplayedData(activeButton.value, 'asc');
        }
    }

    //fungsi remove event klik
    function removeEventClick() {
        const caretUp = activeButton.querySelector('.bi-caret-up-fill');
        const caretDown = activeButton.querySelector('.bi-caret-down-fill');
        // restyle ke tampilan awal
        caretUp.style.display = 'block';
        caretUp.style.color = '';
        caretDown.style.display = 'none';
        activeButton.removeEventListener('click', activeButtonClickHandler);//hapus event
    }


    const filter__data = document.getElementById('filter__data');
    filter__data.addEventListener('change', () => {
        if (activeButton) {
            removeEventClick();
        }
        updateDisplayedData(filter__data.value, 'asc');
    });

});
// Fungsi untuk mengurutkan data berdasarkan filter yang dipilih dan urutan pengurutan
function updateDisplayedData(filterBy, sortOrder) {
    const filteredData = searchDwellings();
    // Mengurutkan data hasil pencarian berdasarkan filter yang dipilih dan urutan pengurutan
    const sortedData = sortData(filteredData, filterBy, sortOrder);

    currentPage = 1; // Kembalikan ke halaman pertama setelah pengurutan atau perubahan filter
    totalPages = Math.ceil(sortedData.length / pageSize); // Perbarui jumlah halaman
    displayData(currentPage, sortedData); // Tampilkan data hasil pengurutan
}

//fungsi seacrh data
function searchDwellings() {
    const searchTerm = document.getElementById('search__data').value.toLowerCase();
    const filterBy = document.getElementById('filter__data').value;

    const filteredData = dwellings.filter(item => {
        const fieldValue = item[filterBy].toString().toLowerCase();
        return fieldValue.includes(searchTerm);
    });
    if (filteredData.length === 0) {
        document.getElementById('noResultsModal').style.display = 'block';
    } else {
        return filteredData;
    }
}
//fungsi close modal data tidak ditemukan
function closeModal() {
    const search = document.getElementById('search__data');
    document.getElementById('noResultsModal').style.display = 'none';
    search.value = '';
    search.focus();
    const filteredData = searchDwellings();
    currentPage = 1; // Kembalikan ke halaman pertama setelah pencarian
    totalPages = Math.ceil(filteredData.length / pageSize); // Perbarui jumlah halaman
    displayData(currentPage, filteredData); // Tampilkan data hasil pencarian


}


// Fungsi untuk mengurutkan data berdasarkan filter yang dipilih dan urutan pengurutan
function sortData(dataToSort, filterBy, sortOrder) {
    return dataToSort.sort((a, b) => {
        const valueA = a[filterBy];
        const valueB = b[filterBy];

        if (sortOrder === 'asc') {
            return valueA > valueB ? 1 : -1;
        } else {
            return valueA < valueB ? 1 : -1;
        }
    });
}



/////// Data Team
// Variabel global untuk menyimpan pop-up yang saat ini terbuka
let openPopup = null;

// Mendapatkan semua elemen mentor dan anggota tim
const mentors = document.querySelectorAll('.mentor');
const teamMembers = document.querySelectorAll('.team-member');

// Menambahkan event listener ke setiap elemen mentor
mentors.forEach((mentor, index) => {
    mentor.addEventListener('click', () => {
        // Tutup pop-up yang saat ini terbuka (jika ada)
        if (openPopup) {
            openPopup.style.display = 'none';
        }

        // Mendapatkan elemen popup yang sesuai
        const popupId = `mentorPopup-${index + 1}`;
        const popup = document.getElementById(popupId);
        // Menampilkan pop-up
        popup.style.display = 'block';

        // Menyimpan pop-up yang saat ini terbuka
        openPopup = popup;
    });
});

// Menambahkan event listener ke setiap elemen anggota tim
teamMembers.forEach((teamMember, index) => {
    teamMember.addEventListener('click', () => {
        // Tutup pop-up yang saat ini terbuka (jika ada)
        if (openPopup) {
            openPopup.style.display = 'none';
        }

        // Mendapatkan elemen popup yang sesuai
        const popupId = `popup-${index + 1}`;
        const popup = document.getElementById(popupId);
        // Menampilkan pop-up
        popup.style.display = 'block';

        // Menyimpan pop-up yang saat ini terbuka
        openPopup = popup;
    });
});

// Menambahkan event listener ke ikon tutup di setiap pop-up
document.querySelectorAll('.close-icon').forEach((closeIcon) => {
    closeIcon.addEventListener('click', () => {
        // Mendapatkan elemen pop-up induk
        const popup = closeIcon.parentNode.parentNode;
        // Menyembunyikan pop-up
        popup.style.display = 'none';

        // Reset variabel global
        openPopup = null;
    });
});


