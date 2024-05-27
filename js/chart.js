import data from '../assets/data/nyc.json' with {type: 'json'}; // Sesuaikan dengan path yang benar
//daftar canvas
const SaleChart = document.getElementById("sale").getContext("2d");
const dwellingsChart = document.getElementById("dwellingsSale").getContext("2d");
const BoroughChart = document.getElementById('bar-chart-borough');
const classChart = document.getElementById('bar-chart-class-category')


//daftar filter
const filter = document.getElementById('filter');
const boroughDropdown = document.getElementById('borough-dropdown');

//visualisasi awal dashboard
let dwellings = FilterData(data, 'BUILDINGCLASSCATEGORY', 'DWELLINGS');
let chartSaleAll = CreateChart('line', 'All NYC data property sale', SaleChart, countDataByMonthAndYear(data));
let chartSaleDwellings = CreateChart('line', 'Dwellings Sales', dwellingsChart, countDataByMonthAndYear(dwellings));
displayTotalRevenue(dwellings);
displayTotalTransaction(dwellings);
let ChartBorougharea = CreateChart('bar', 'Penjualan Dwellings per Borough', BoroughChart, countSalesByBorough(dwellings))
let ChartClass = CreateChart('bar', 'Dwelling Class Categori', classChart, calculateRevenueByBuildingClass(dwellings))


filter.addEventListener('change', () => {
    const value = filter.value;
    const filteredData = countDataByMonthAndYear(FilterData(data, 'SALEDATE', value));
    const filteredDwellingsData = countDataByMonthAndYear(FilterData(dwellings, 'SALEDATE', value));
    console.log(filteredData)
    updateChartData(chartSaleAll, filteredData);
    updateChartData(chartSaleDwellings, filteredDwellingsData);
});

boroughDropdown.addEventListener('change', () => {
    const selectedBorough = boroughDropdown.value;
    let filterData = dwellings;

    if (selectedBorough !== "ALL BOROUGH") {
        filterData = data.filter(item => item.BOROUGH == selectedBorough);
    }
    console.log(filterData)
    displayTotalRevenue(filterData);
    displayTotalTransaction(filterData);
});


function updateChartData(chart, newData) {
    chart.data.labels = Object.keys(newData);
    chart.data.datasets[0].data = Object.values(newData);
    chart.update();
}

function CreateChart(type, ChartName, ChartID, AllData) {
    const labels = Object.keys(AllData);
    const dataValues = Object.values(AllData);
    const createdchart = new Chart(ChartID, {
        type: type,
        data: {
            labels: labels,
            datasets: [
                {
                    label: ChartName,
                    data: dataValues,
                    backgroundColor: '#ffdf3e64',
                    borderColor: '#FFDE3E',
                }
            ]
        }
    });
    return createdchart;
}

function countDataByMonthAndYear(data) {
    return data.reduce((counts, item) => {
        if (item.SALEDATE) {
            const [year, month] = item.SALEDATE.split('-');
            const key = `${getMonthName(parseInt(month))} ${year}`;
            counts[key] = (counts[key] || 0) + 1;
        } else {
            console.warn('Invalid SALE_DATE format:', item.SALEDATE);
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
        const salePrice = item['SALEPRICE'];
        if (buildingClass && !isNaN(salePrice)) {
            revenueByBuildingClass[buildingClass] = (revenueByBuildingClass[buildingClass] || 0) + salePrice;
        }
        formatNumber(salePrice)
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
