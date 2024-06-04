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

    let filteredData = data;
    let filteredDwellings = dwellings;

    if (filterValue) {
        filteredData = FilterData(data, 'SALEDATE', filterValue);
        filteredDwellings = FilterData(dwellings, 'SALEDATE', filterValue);
    }

    if (selectedBorough !== "ALL BOROUGH") {
        filteredData = filteredData.filter(item => item.BOROUGH == selectedBorough);
        filteredDwellings = filteredDwellings.filter(item => item.BOROUGH == selectedBorough);
    }

    console.log(filteredData, filteredDwellings); // Debugging to check filtered data

    updateChartData(chartSaleAll, [
        countDataByMonthAndYear(filteredData),
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


///// DATA TABLE
$(document).ready(function () {
    let i = 0;
    $('#dataTable').DataTable({
        data: dwellings,
        columns: [
            { data: 'BOROUGH' },
            { data: 'NEIGHBORHOOD' },
            { data: 'BUILDINGCLASSCATEGORY' },
            { data: 'BLOCK' },
            { data: 'ADDRESS' },
            { data: 'RESIDENTIALUNITS' },
            { data: 'COMMERCIALUNITS' },
            { data: 'TOTALUNITS' },
            { data: 'LANDSQUAREFEET' },
            { data: 'GROSSSQUAREFEET' },
            { data: 'YEARBUILT' },
            { data: 'SALEPRICE' },
            { data: 'SALEDATE' },
        ]
    });
});


