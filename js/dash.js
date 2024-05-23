document.addEventListener('DOMContentLoaded', () => {

    const boroughDropdown = document.getElementById('borough-dropdown');
    let data = [];


    fetch('http://localhost:1000/data')
        .then(response => response.json())
        .then(fetchedData => {
            data = fetchedData;

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
            createDoughnutChartBorough(countSalesByBorough(data))
            createBarChartBorough(countSalesByBorough(data));
            createBarChartClassCategory(calculateRevenueByBuildingClass(data));
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });

    boroughDropdown.addEventListener('change', () => {
        const selectedBorough = boroughDropdown.value;
        let filteredData = data;

        if (selectedBorough !== "ALL BOROUGH") {
            filteredData = data.filter(item => item.BOROUGH === selectedBorough);
        }

        displayTotalRevenue(calculateTotalRevenue(filteredData));
        displayTotalTransaction(countTotalTransaction(filteredData));
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
    function createDoughnutChartBorough(countsale) {
        const ctx = document.getElementById("doughnut-chart-borough").getContext('2d');
        if (window.doughnutChartBorough !== undefined) {
            window.doughnutChartBorough.destroy();
        }

        const labels = Object.keys(countsale);
        const dataValues = Object.values(countsale);
        window.doughnutChartBorough = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: '',
                    data: dataValues,
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        'rgb(54, 162, 235)',
                        'rgb(255, 205, 86)',
                        'rgb(25, 20, 86)',
                        'rgb(155, 5, 86)'
                    ],
                    hoverOffset: 4
                }]
            }, options: {
                plugins: {
                    legend: {
                        labels: {
                            generateLabels: function (chart) {
                                return [];
                            }
                        }
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