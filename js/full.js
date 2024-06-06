////LANDING PAGE
document.addEventListener('DOMContentLoaded', function () {
    const landingPage = document.getElementById('landingPage');
    const header = document.getElementById('header');
    const main = document.getElementById('main');
    const footer = document.getElementById('footer');
    const enterButton = document.getElementById('enterButton');

    enterButton.addEventListener('click', function () {
        // Tampilkan overlay loading
        loadingOverlay.style.display = 'flex';

        setTimeout(function() {
            // Sembunyikan overlay loading
            loadingOverlay.style.display = 'none';

            // Tampilkan konten utama
            landingPage.style.display = 'none';
            header.style.display = 'block';
            main.style.display = 'block';



            // Aktifkan konten pertama (contents)
            document.getElementById('contents').classList.add('active');

            // Klik tab default
            document.getElementById("defaultOpen").click();
        }, 500); // Simulasi loading selama 2 detik
    });
});



////DASHBOARD
//mengambil data 
import data from '../assets/data/nyc.json' with {type: 'json'}; // Sesuaikan dengan path yang benar
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

displayTotalRevenue(dwellings);
displayTotalTransaction(dwellings);

filterTahun.addEventListener('change', updateAllCharts);
boroughDropdown.addEventListener('change', updateAllCharts);


function updateAllCharts() {
    const filterValue = filterTahun.value;
    const selectedBorough = boroughDropdown.value;

    let filteredDwellings = dwellings;
    let dataUpdate = data;
    if (filterValue) {
        dataUpdate = FilterData(data, 'SALEDATE', filterValue);
        filteredDwellings = FilterData(dwellings, 'SALEDATE', filterValue);
    }

    if (selectedBorough !== "ALL BOROUGH") {
        dataUpdate = data.filter(item => item.BOROUGH == selectedBorough);
        filteredDwellings = filteredDwellings.filter(item => item.BOROUGH == selectedBorough);
    }

    console.log(dataUpdate, filteredDwellings); // Debugging to check filtered data

    updateChartData(chartSaleAll, [
        countDataByMonthAndYear(dataUpdate),
        countDataByMonthAndYear(filteredDwellings)
    ]);

    updateChartData(ChartBorougharea, [
        countSalesByBorough(filteredDwellings)
    ]);

    updateChartData(ChartClass, [
        calculateRevenueByBuildingClass(filteredDwellings)
    ]);

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

function countDataByMonthAndYear(data) {
    return data.reduce((counts, item) => {
        if (item.SALEDATE) {
            const [year, month] = item.SALEDATE.split('-');
            const key = `${getMonthName(parseInt(month))} ${year}`;
            counts[key] = (counts[key] || 0) + 1;
        } else {
            console.warn('Invalid SALEDATE format:', item.SALEDATE);
        }
        return counts;
    }, {});
}

function getMonthName(monthNumber) {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthNumber - 1] || '';
}

function FilterData(data, column, value) {
    if (column === 'SALEDATE') {
        return data.filter(dataset => dataset[column].startsWith(value));
    }
    return data.filter(dataset => dataset[column].includes(value));
}

function displayTotalRevenue(data) {
    let totalRevenue = 0;
    data.forEach(item => {
        const salePrice = parseFloat(item.SALEPRICE);
        if (!isNaN(salePrice)) {
            totalRevenue += salePrice;
        }
    });
    document.getElementById('total-revenue').textContent = '$' + formatNumber(totalRevenue);
}

function displayTotalTransaction(data) {
    let count = 0;
    data.forEach(item => {
        const salePrice = parseFloat(item.SALEPRICE);
        if (!isNaN(salePrice)) {
            count++;
        }
    });

    document.getElementById('total-transaction').textContent = formatNumber(count);;
}

function countSalesByBorough(data) {
    const countsale = {};
    data.forEach(item => {
        const borough = item.BOROUGH;
        if (borough) {
            countsale[borough] = (countsale[borough] || 0) + 1;
        }
    });
    return countsale;
}

function calculateRevenueByBuildingClass(data) {
    const revenueByBuildingClass = {};
    data.forEach(item => {
        const buildingClass = item['BUILDINGCLASSCATEGORY'];
        const salePrice = parseFloat(item['SALEPRICE']);
        if (buildingClass && !isNaN(salePrice)) {
            revenueByBuildingClass[buildingClass] = (revenueByBuildingClass[buildingClass] || 0) + salePrice;
        }
    });
    return revenueByBuildingClass;
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
        row.innerHTML += `
            <td>${i}</td>
            <td>${item['BOROUGH']}</td>
            <td>${item['NEIGHBORHOOD']}</td>
            <td>${item['BUILDINGCLASSCATEGORY']}</td>
            <td>${item['TAXCLASSATPRESENT']}</td>
            <td>${item['BLOCK']}</td>
            <td>${item['LOT']}</td>
            <td>${item['BUILDINGCLASSATPRESENT']}</td>
            <td>${item['ADDRESS']}</td>
            <td>${item['ZIPCODE']}</td>
            <td>${item['RESIDENTIALUNITS']}</td>
            <td>${item['COMMERCIALUNITS']}</td>
            <td>${item['TOTALUNITS']}</td>
            <td>${item['LANDSQUAREFEET']}</td>
            <td>${item['GROSSSQUAREFEET']}</td>
            <td>${item['YEARBUILT']}</td>
            <td>${item['BUILDINGCLASSATTIMEOFSALE']}</td>
            <td>${item['SALEPRICE']}</td>
            <td>${item['SALEDATE']}</td>
        `;
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
            const searchTerm = document.getElementById('search__data').value.toLowerCase();
            const filterBy = document.getElementById('filter__data').value;

            const filteredData = dwellings.filter(item => {
                const fieldValue = item[filterBy].toString().toLowerCase();
                return fieldValue.includes(searchTerm);
            });

            if (filteredData.length === 0) {
                document.getElementById('noResultsModal').style.display = 'block';
            } else {
                currentPage = 1; // Kembalikan ke halaman pertama setelah pencarian
                totalPages = Math.ceil(filteredData.length / pageSize); // Perbarui jumlah halaman
                displayData(currentPage, filteredData); // Tampilkan data hasil pencarian
            }
        }
    });


    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('noResultsModal').style.display = 'none';
    });

    document.getElementById('closeButton').addEventListener('click', () => {
        document.getElementById('noResultsModal').style.display = 'none';
    });

    window.addEventListener('click', event => {
        if (event.target === document.getElementById('noResultsModal')) {
            document.getElementById('noResultsModal').style.display = 'none';
        }
    });

    // Event listener untuk perubahan pada filter atau urutan pengurutan
    document.getElementById('filter__data').addEventListener('change', updateDisplayedData);
    document.getElementById('sortOrder').addEventListener('change', updateDisplayedData);

});


// Fungsi untuk mengurutkan data berdasarkan filter yang dipilih dan urutan pengurutan
function updateDisplayedData() {
    document.getElementById('search__data').value = '';
    const filterBy = document.getElementById('filter__data').value;
    const sortOrder = document.getElementById('sortOrder').value;
    console.log(filterBy, sortData)
    // Mengurutkan data hasil pencarian berdasarkan filter yang dipilih dan urutan pengurutan
    const sortedData = sortData(dwellings, filterBy, sortOrder);

    currentPage = 1; // Kembalikan ke halaman pertama setelah pengurutan atau perubahan filter
    totalPages = Math.ceil(sortedData.length / pageSize); // Perbarui jumlah halaman
    displayData(currentPage, sortedData); // Tampilkan data hasil pengurutan
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


