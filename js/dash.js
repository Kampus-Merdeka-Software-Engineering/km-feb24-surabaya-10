document.addEventListener('DOMContentLoaded', () => {
    const loadingOverlay = document.querySelector('.loading-overlay');
    const content = document.querySelector('.content');
    const boroughDropdown = document.getElementById('borough-dropdown');
    let data = [];

    loadingOverlay.style.display = 'flex';

    fetch('http://localhost:1000/data')
        .then(response => response.json())
        .then(fetchedData => {
            data = fetchedData;
            loadingOverlay.style.display = 'none';
            content.style.display = 'block';

            // Menambahkan opsi "Semua Boroughs"
            const allOption = document.createElement('option');
            allOption.textContent = "ALL BOROUGH";
            boroughDropdown.appendChild(allOption);

            // Populate dropdown with unique borough values
            const uniqueBoroughs = [...new Set(data.map(item => item.BOROUGH))];
            uniqueBoroughs.forEach(borough => {
                const option = document.createElement('option');
                option.textContent = borough;
                boroughDropdown.appendChild(option);
            });

            // Initialize charts with all data
            displayTotalRevenue(calculateTotalRevenue(data));
            displayTotalTransaction(countTotalTransaction(data));
            createLineChart(countDataByMonthAndYear(data));
            createBarChartBorough(countSalesByBorough(data));
            createBarChartClassCategory(calculateRevenueByBuildingClass(data));
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            loadingOverlay.style.display = 'none';
        });

    boroughDropdown.addEventListener('change', () => {
        const selectedBorough = boroughDropdown.value;
        let filteredData = data;

        if (selectedBorough !== "ALL BOROUGH") {
            filteredData = data.filter(item => item.BOROUGH === selectedBorough);
        }

        displayTotalRevenue(calculateTotalRevenue(filteredData));
        displayTotalTransaction(countTotalTransaction(filteredData));
        createLineChart(countDataByMonthAndYear(filteredData));
        createBarChartBorough(countSalesByBorough(filteredData));
        createBarChartClassCategory(calculateRevenueByBuildingClass(filteredData));
    });

    function calculateTotalRevenue(data) {
        let totalRevenue = 0;
        data.forEach(item => {
            const salePrice = parseCurrency(item['SALE_PRICE']);
            if (!isNaN(salePrice)) {
                totalRevenue += salePrice;
            }
        });
        return totalRevenue;
    }

    function parseCurrency(currencyString) {
        return parseFloat(currencyString.replace(/[$,]/g, ''));
    }

    function displayTotalRevenue(revenue) {
        const totalRevenueElement = document.getElementById('total-revenue');
        totalRevenueElement.textContent = '$' + revenue.toLocaleString();
    }

    function countTotalTransaction(data) {
        let count = 0;
        data.forEach(item => {
            const salePrice = parseCurrency(item['SALE_PRICE']);
            if (!isNaN(salePrice)) {
                count++;
            }
        });
        return count;
    }

    function displayTotalTransaction(count) {
        const countElement = document.getElementById('total-transaction');
        countElement.textContent = count.toLocaleString();
    }

    function countDataByMonthAndYear(data) {
        const countsale = {};
        data.forEach(item => {
            if (item.SALE_DATE) {
                const saleDate = item.SALE_DATE.split(' ')[0];
                const [day, month, year] = saleDate.split('/');
                const monthName = getMonthName(parseInt(month));
                const key = `${monthName} ${year}`;
                countsale[key] = (countsale[key] || 0) + 1;
            }
        });

        const sortedCountSale = Object.entries(countsale).sort((a, b) => {
            const [monthA, yearA] = a[0].split(' ');
            const [monthB, yearB] = b[0].split(' ');
            const dateA = new Date(`${monthA} 1, ${yearA}`);
            const dateB = new Date(`${monthB} 1, ${yearB}`);
            return dateA - dateB;
        });

        const orderedCountSale = {};
        sortedCountSale.forEach(([key, value]) => {
            orderedCountSale[key] = value;
        });

        return orderedCountSale;
    }

    function getMonthName(monthNumber) {
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        return months[monthNumber - 1];
    }

    function createLineChart(countsale) {
        const ctx = document.getElementById("line-chart").getContext('2d');
        if (window.lineChart !== undefined) {
            window.lineChart.destroy();
        }

        const labels = Object.keys(countsale);
        const dataValues = Object.values(countsale);

        window.lineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Data Penjualan',
                    data: dataValues,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)'
                }]
            }
        });
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

    function createBarChartBorough(countsale) {
        const ctx = document.getElementById("bar-chart-borough").getContext('2d');
        if (window.barChartBorough !== undefined) {
            window.barChartBorough.destroy();
        }

        const labels = Object.keys(countsale);
        const dataValues = Object.values(countsale);

        window.barChartBorough = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Penjualan',
                    data: dataValues,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function calculateRevenueByBuildingClass(data) {
        const revenueByBuildingClass = {};
        data.forEach(item => {
            const buildingClass = item['BUILDING_CLASS_CATEGORY'];
            const salePrice = parseCurrency(item['SALE_PRICE']);
            if (buildingClass && !isNaN(salePrice)) {
                revenueByBuildingClass[buildingClass] = (revenueByBuildingClass[buildingClass] || 0) + salePrice;
            }
        });
        return revenueByBuildingClass;
    }

    function createBarChartClassCategory(revenueByBuildingClass) {
        const ctx = document.getElementById("bar-chart-class-category").getContext('2d');
        if (window.barChartClassCategory !== undefined) {
            window.barChartClassCategory.destroy();
        }

        const labels = Object.keys(revenueByBuildingClass);
        const dataValues = Object.values(revenueByBuildingClass);

        window.barChartClassCategory = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Revenue',
                    data: dataValues,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
});