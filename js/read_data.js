document.addEventListener('DOMContentLoaded', () => {
    const pageSize = 1000;
    let currentPage = 1;
    let data = []; // Simpan semua data di sini
    let totalPages = Math.ceil(data.length / pageSize);

    // Fungsi untuk menampilkan data pada halaman data
    function displayData(page) {
        const startIndex = (page - 1) * pageSize;
        const endIndex = page * pageSize;
        const paginatedData = data.slice(startIndex, endIndex);

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
        document.getElementById('totalDataInfo').textContent = `Total Data: ${data.length}`;
    }

    // Event listener untuk tombol Next Page
    document.getElementById('nextPage').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayData(currentPage);
        }
    });

    // Event listener untuk tombol Previous Page
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayData(currentPage);
        }
    });

    fetch('http://localhost:1000/data')
        .then(response => response.json())
        .then(fetchedData => {
            data = fetchedData; // Simpan data yang diambil dari server
            totalPages = Math.ceil(data.length / pageSize); // Perbarui jumlah halaman
            displayData(currentPage); // Tampilkan data halaman pertama saat halaman dimuat
        })
        .catch(error => console.error('Error fetching data:', error));
});
