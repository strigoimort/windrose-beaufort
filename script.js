// Menampilkan loading saat file sedang diproses
function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

// Menyembunyikan loading setelah file selesai diproses
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Menampilkan status pemrosesan file
function showFileProcessingStatus() {
    document.getElementById('fileStatus').style.display = 'block';
}

// Menyembunyikan status pemrosesan setelah file selesai diproses
function hideFileProcessingStatus() {
    document.getElementById('fileStatus').style.display = 'none';
}

// Mengambil arah indeks dari derajat (0-360)
function getDirectionIndex(degree) {
    if (degree >= 348.75 || degree < 11.25) return 0;  // N
    if (degree < 33.75) return 1;  // NNE
    if (degree < 56.25) return 2;  // NE
    if (degree < 78.75) return 3;  // ENE
    if (degree < 101.25) return 4; // E
    if (degree < 123.75) return 5; // ESE
    if (degree < 146.25) return 6; // SE
    if (degree < 168.75) return 7; // SSE
    if (degree < 191.25) return 8; // S
    if (degree < 213.75) return 9; // SSW
    if (degree < 236.25) return 10; // SW
    if (degree < 258.75) return 11; // WSW
    if (degree < 281.25) return 12; // W
    if (degree < 303.75) return 13; // WNW
    if (degree < 326.25) return 14; // NW
    return 15; // NNW
}

// Mengonversi data mentah ke format yang dapat digunakan Highcharts
function formatData(rawData) {
    const categories = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

    const beaufortCategories = Array.from({ length: 16 }, () => Array(12).fill(0));

    rawData.forEach(row => {
        const degree = row.direction;
        const speed = row.speed;

        if (typeof degree !== 'number' || isNaN(degree) || degree < 0 || degree > 360) {
            return;
        }

        if (typeof speed !== 'number' || isNaN(speed) || speed < 0) {
            return;
        }

        const directionIndex = getDirectionIndex(degree);

        let beaufortIndex = 0;
        if (speed < 0.1) beaufortIndex = 0;
        else if (speed < 1.5) beaufortIndex = 1;
        else if (speed < 3.3) beaufortIndex = 2;
        else if (speed < 5.4) beaufortIndex = 3;
        else if (speed < 7.9) beaufortIndex = 4;
        else if (speed < 10.7) beaufortIndex = 5;
        else if (speed < 13.8) beaufortIndex = 6;
        else if (speed < 17.1) beaufortIndex = 7;
        else if (speed < 20.7) beaufortIndex = 8;
        else if (speed < 24.4) beaufortIndex = 9;
        else if (speed < 28.4) beaufortIndex = 10;
        else beaufortIndex = 11;

        beaufortCategories[directionIndex][beaufortIndex] += 1;
    });

    const totalDataPoints = beaufortCategories.reduce((sum, direction) => sum + direction.reduce((s, count) => s + count, 0), 0);

    // Menghitung persentase awal
    const initialPercentages = beaufortCategories.map(direction =>
        direction.map(value => (value / totalDataPoints) * 100)
    );

    // Hitung total persentase dari seluruh arah
    const totalInitialPercentage = initialPercentages.reduce((sum, direction) => sum + direction.reduce((s, percent) => s + percent, 0), 0);

    // Faktor penyesuaian untuk normalisasi agar total 100%
    const adjustmentFactor = 100 / totalInitialPercentage;

    // Normalisasi menggunakan faktor penyesuaian
    const normalizedPercentages = initialPercentages.map(direction =>
        direction.map(percent => percent * adjustmentFactor)
    );

    // Verifikasi total akhir setelah normalisasi
    const totalNormalizedPercentage = normalizedPercentages.reduce((sum, direction) => sum + direction.reduce((s, percent) => s + percent, 0), 0);
    
    // console.log("Total Persentase Setelah Normalisasi:", totalNormalizedPercentage);
    // console.log("Beaufort Categories (sebelum normalisasi):", beaufortCategories);
    // console.log("Total Data Points:", totalDataPoints);
    // console.log("Persentase Awal (sebelum normalisasi):", initialPercentages);
    // console.log("Total Persentase Awal:", totalInitialPercentage);
    // console.log("Faktor Penyesuaian:", adjustmentFactor);
    // console.log("Persentase Setelah Normalisasi:", normalizedPercentages);

    return {
        categories,
        beaufortCategories: normalizedPercentages
    };
}

// Menampilkan chart Wind Rose dengan menggunakan Highcharts
function renderWindRoseChart(data) {
    Highcharts.chart('container', {
        chart: { polar: true, type: 'column' },
        title: { text: 'Wind Rose' },
        subtitle: { text: 'Windrose plot based on Beaufort Scale' },
        pane: { size: '90%', startAngle: 0 },
        xAxis: {
            categories: data.categories,
            tickmarkPlacement: 'on',
            lineWidth: 0,
            startAngle: 0,
        },
        yAxis: {
            min: 0,
            endOnTick: false,
            showLastLabel: true,
            // title: { text: 'Frequency (%)' },
            labels: { formatter: function () { 
                return ""
                return this.value + '%'; } 
            }
        },
        tooltip: { pointFormat: '{series.name}: <b>{point.y:.2f}%</b>', shared: false },
        plotOptions: {
            series: {
                stacking: 'normal',
                shadow: false,
                groupPadding: 0,
                pointPlacement: 'on'
            }
        },
        series: [
            { name: 'Calm', data: data.beaufortCategories.map(direction => direction[0]), color: 'rgba(0, 204, 204, 0.75)' },
            { name: 'Light Air', data: data.beaufortCategories.map(direction => direction[1]), color: 'rgba(204, 204, 0, 0.75)' },
            { name: 'Light Breeze', data: data.beaufortCategories.map(direction => direction[2]), color: 'rgba(51, 51, 225, 0.75)' },
            { name: 'Gentle Breeze', data: data.beaufortCategories.map(direction => direction[3]), color: 'rgba(0, 255, 0, 0.75)' },
            { name: 'Moderate Breeze', data: data.beaufortCategories.map(direction => direction[4]), color: 'rgba(255, 255, 0, 0.75)' },
            { name: 'Strong Breeze', data: data.beaufortCategories.map(direction => direction[5]), color: 'rgba(255, 128, 0, 0.75)' },
            { name: 'Gale', data: data.beaufortCategories.map(direction => direction[6]), color: 'rgba(255, 0, 0, 0.75)' },
            { name: 'Strong Gale', data: data.beaufortCategories.map(direction => direction[7]), color: 'rgba(128, 0, 0, 0.75)' },
            { name: 'Storm', data: data.beaufortCategories.map(direction => direction[8]), color: 'rgba(0, 128, 255, 0.75)' },
            { name: 'Violent Storm', data: data.beaufortCategories.map(direction => direction[9]), color: 'rgba(128, 128, 255, 0.75)' },
            { name: 'Hurricane', data: data.beaufortCategories.map(direction => direction[10]), color: 'rgba(255, 0, 255, 0.75)' },
        ]
    });
}

// Membaca dan memproses file saat diupload
document.getElementById('fileInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        const fileContent = event.target.result;
        const fileType = file.name.split('.').pop().toLowerCase();
        let rawData = [];

        if (fileType === 'csv') {
            rawData = Papa.parse(fileContent, { header: true, skipEmptyLines: true }).data;
        } else if (fileType === 'xlsx') {
            const workbook = XLSX.read(fileContent, { type: 'binary' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            rawData = XLSX.utils.sheet_to_json(sheet);
        }

        if (rawData.length === 0) {
            alert("File format is invalid or empty.");
            return;
        }

        // Format data untuk chart
        showFileProcessingStatus();
        showLoading();

        const formattedData = formatData(rawData);

        // Render chart setelah data selesai diproses
        hideLoading();
        hideFileProcessingStatus();
        renderWindRoseChart(formattedData);
    };

    reader.readAsArrayBuffer(file);
});
