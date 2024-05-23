document.addEventListener('DOMContentLoaded', () => {
    const SaleChart = document.getElementById("sale").getContext("2d");
    const dwellingsChart = document.getElementById("dwellingsSale").getContext("2d");
    const loadingOverlay = document.getElementById('loadingOverlay');
    const content = document.getElementById('contents');
    const filter = document.getElementById('filter');
    // Tampilkan animasi loading saat halaman dimuat
    loadingOverlay.style.display = 'flex'; // Tampilkan overlay

    // Fungsi pengambil data dari JSON
    let data = [];
    fetch('http://localhost:1000/dataset')
        .then(response => response.json())
        .then(fetchedData => {
            loadingOverlay.style.display = 'none'; // Sembunyikan overlay
            content.style.display = 'block'; // Tampilkan konten utama
            data = fetchedData; // Simpan data yang diambil dari server
            dwellings = DwellingsData(data);

            let chartSaleAll = LineChart('All NYC data property sale', SaleChart, countDataByMonthAndYear(data));
            let chartSaleDwellings = LineChart('Dwellings Sales', dwellingsChart, countDataByMonthAndYear(dwellings));
            filter.addEventListener('change', () => {
                let value = filter.value;
                const filteredData = countDataByMonthAndYear(FilterData(data, value));
                const filteredDwellingsData = countDataByMonthAndYear(FilterData(dwellings, value));

                chartSaleAll.data.labels = Object.keys(filteredData); // Perbarui labels
                chartSaleAll.data.datasets[0].data = Object.values(filteredData); // Perbarui data
                chartSaleAll.update(); // Perbarui chart

                chartSaleDwellings.data.labels = Object.keys(filteredDwellingsData); // Perbarui labels
                chartSaleDwellings.data.datasets[0].data = Object.values(filteredDwellingsData); // Perbarui data
                chartSaleDwellings.update(); // Perbarui chart
            });
            // Panggil fungsi untuk membuat chart setelah data diterima
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            loadingOverlay.style.display = 'none';
        });
});
// Fungsi untuk membuat line chart
function LineChart(ChartName, ChartID, AllData) {

    const labels = Object.keys(AllData); // Ambil kunci dari objek AllData sebagai label
    const dataValues = Object.values(AllData); // Ambil nilai dari objek AllData sebagai data
    let ChartLine = new Chart(ChartID, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: ChartName,
                    data: dataValues,
                    fill: false,
                    borderColor: '#FFDE3E',
                }
            ]
        }
    });
    return ChartLine;
}
// Fungsi membuat nama bulan
function getMonthName(monthNumber) {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthNumber - 1]; // Bulan dimulai dari indeks 0
}

// Fungsi untuk menghitung jumlah data dengan bulan dan tahun yang sama
function countDataByMonthAndYear(data) {
    const countsale = {};
    data.forEach(item => {
        if (item.SALEDATE) {
            const saleDate = item.SALEDATE.split(' ')[0]; // Ambil bagian tanggal saja (dd/mm/yyyy)
            const [year, month, day] = saleDate.split('-'); // Pisahkan hari, bulan, dan tahun
            const monthName = getMonthName(parseInt(month)); // Dapatkan nama bulan dari angka bulan
            const key = `${monthName} ${year}`; // Gabungkan bulan dan tahun sebagai kunci
            countsale[key] = (countsale[key] || 0) + 1; // Tambahkan jumlah data dengan kunci yang sama
        } else {
            console.warn('Invalid SALE_DATE format:', item.SALEDATE);
        }
    });

    // Ubah objek countsale menjadi array untuk diurutkan
    const sortedCountSale = Object.entries(countsale).sort((a, b) => {
        const [monthA, yearA] = a[0].split(' ');
        const [monthB, yearB] = b[0].split(' ');
        const dateA = new Date(`${monthA} 1, ${yearA}`);
        const dateB = new Date(`${monthB} 1, ${yearB}`);
        return dateA - dateB;
    });

    // Ubah array kembali menjadi objek yang diurutkan
    const orderedCountSale = {};
    sortedCountSale.forEach(([key, value]) => {
        orderedCountSale[key] = value;
    });
    return orderedCountSale;
}


function DwellingsData(data) {
    const result = data.filter(dataset => dataset.BUILDINGCLASSCATEGORY.includes("DWELLINGS"));
    return result;
}
function FilterData(data, value) {
    const result = data.filter(dataset => dataset.SALEDATE.includes(value));
    return result;
}