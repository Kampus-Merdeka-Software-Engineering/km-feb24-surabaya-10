document.addEventListener('DOMContentLoaded', () => {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const content = document.getElementById('content');
    let originalData = []; // Simpan data asli di sini
    let filteredData = []; // Simpan data hasil pencarian di sini

    // Mengambil data JSON
    fetch('http://localhost:1000/data')
        .then(response => response.json())
        .then(fetchedData => {
            loadingOverlay.style.display = 'none'; // Sembunyikan overlay
            content.style.display = 'block';

            originalData = fetchedData; // Simpan data asli yang diambil dari server
            totalPages = Math.ceil(originalData.length / pageSize); // Perbarui jumlah halaman
            displayData(currentPage, originalData); // Tampilkan data halaman pertama saat halaman dimuat
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            loadingOverlay.style.display = 'none';
        });

    // Tampilkan animasi loading saat halaman dimuat
    loadingOverlay.style.display = 'flex'; // Tampilkan overlay

    const pageSize = 1000;
    let currentPage = 1;
    let totalPages = 0; // Jumlah halaman diinisialisasi dengan 0

    // Fungsi untuk menampilkan data pada halaman data
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
                <td>${item.ID}</td>
                <td>${item.BOROUGH}</td>
                <td>${item.NEIGHBORHOOD}</td>
                <td>${item['BUILDINGCLASSCATEGORY']}</td>
                <td>${item['TAXCLASSATPRESENT']}</td>
                <td>${item.BLOCK}</td>
                <td>${item.LOT}</td>
                <td>${item['BUILDINGCLASSATPRESENT']}</td>
                <td>${item.ADDRESS}</td>
                <td>${item['APARTMENTNUMBER']}</td>
                <td>${item['ZIPCODE']}</td>
                <td>${item['RESIDENTIALUNITS']}</td>
                <td>${item['COMMERCIALUNITS']}</td>
                <td>${item['TOTALUNITS']}</td>
                <td>${item['LANDSQUAREFEET']}</td>
                <td>${item['GROSSSQUAREFEET']}</td>
                <td>${item['YEARBUILT']}</td>
                <td>${item['TAXCLASSATTIMEOFSALE']}</td>
                <td>${item['BUILDINGCLASSATTIMEOFSALE']}</td>
                <td>${item['SALEPRICE']}</td>
                <td>${item['SALEDATE']}</td>
            `;
            tableBody.appendChild(row);
        });

        // Perbarui informasi halaman dan jumlah data
        document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
        document.getElementById('totalDataInfo').textContent = `Total Data: ${dataToDisplay.length}`;
    }

    // Event listener untuk tombol Next Page
    document.getElementById('nextPage').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayData(currentPage, filteredData);
        }
    });

    // Event listener untuk tombol Previous Page
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayData(currentPage, filteredData);
        }
    });

    // Event listener untuk pencarian
    document.getElementById('search').addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            const searchTerm = document.getElementById('search').value.toLowerCase();
            const filterBy = document.getElementById('filter').value;

            filteredData = originalData.filter(item => {
                const fieldValue = item[filterBy].toString().toLowerCase();
                return fieldValue.includes(searchTerm);
            });

            currentPage = 1; // Kembalikan ke halaman pertama setelah pencarian
            totalPages = Math.ceil(filteredData.length / pageSize); // Perbarui jumlah halaman
            displayData(currentPage, filteredData); // Tampilkan data hasil pencarian
        }
    });

    // Event listener untuk perubahan pada filter atau urutan pengurutan
    document.getElementById('filter').addEventListener('change', updateDisplayedData);
    document.getElementById('sortOrder').addEventListener('change', updateDisplayedData);

    // Fungsi untuk mengurutkan data berdasarkan filter yang dipilih dan urutan pengurutan
    function updateDisplayedData() {
        const filterBy = document.getElementById('filter').value;
        const sortOrder = document.getElementById('sortOrder').value;

        // Mengurutkan data hasil pencarian berdasarkan filter yang dipilih dan urutan pengurutan
        const sortedData = sortData(filteredData, filterBy, sortOrder);

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
});
