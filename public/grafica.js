document.addEventListener('DOMContentLoaded', function() {
    fetchRecords();
});

const systems = [
    'autorización web',
    'click',
    'imagine',
    'infobip',
    'linea medica',
    'pc',
    'pure cloud',
    'red',
    'simon',
    'sisalud salud',
    'tronador'
];

const systemColors = {
    'autorización web': 'rgba(255, 99, 132, 0.6)',
    'click': 'rgba(54, 162, 235, 0.6)',
    'imagine': 'rgba(255, 206, 86, 0.6)',
    'infobip': 'rgba(75, 192, 192, 0.6)',
    'linea medica': 'rgba(153, 102, 255, 0.6)',
    'pc': 'rgba(255, 159, 64, 0.6)',
    'pure cloud': 'rgba(199, 199, 199, 0.6)',
    'red': 'rgba(83, 102, 255, 0.6)',
    'simon': 'rgba(255, 99, 132, 0.6)',
    'sisalud salud': 'rgba(54, 162, 235, 0.6)',
    'tronador': 'rgba(255, 206, 86, 0.6)'
};

function fetchRecords() {
    fetch('/api/records')
        .then(response => response.json())
        .then(data => {
            // Agrupar y sumar los datos por mes y sistema
            const groupedData = {};

            data.forEach(record => {
                // Filtrar datos con "null" o NaN
                if (record.durationMinutes === "null" || isNaN(record.durationMinutes) || record.durationMinutes === null) {
                    return;
                }

                const monthYear = `${record.month}-${record.year}`;
                if (!groupedData[monthYear]) {
                    groupedData[monthYear] = systems.reduce((acc, system) => {
                        acc[system] = 0;
                        return acc;
                    }, {});
                }

                const systemKey = systems.find(system => record.system.toLowerCase().includes(system));
                if (systemKey) {
                    groupedData[monthYear][systemKey] += parseInt(record.durationMinutes);
                }
            });

            generateContent(groupedData);
        })
        .catch(error => console.error('Error fetching records:', error));
}

function generateContent(data) {
    const contentContainer = document.getElementById('contentContainer');
    contentContainer.innerHTML = ''; // Limpiar el contenido existente

    Object.keys(data).forEach(monthYear => {
        const contentDiv = document.createElement('div');
        contentDiv.style.width = '100%';
        contentDiv.style.marginBottom = '40px';
        contentDiv.style.borderBottom = '2px solid #ccc';
        contentDiv.style.paddingBottom = '20px';

        const tableDiv = document.createElement('div');
        tableDiv.style.width = '45%';
        tableDiv.style.display = 'inline-block';
        tableDiv.style.verticalAlign = 'top';

        const chartDiv = document.createElement('div');
        chartDiv.style.width = '45%';
        chartDiv.style.display = 'inline-block';
        chartDiv.style.verticalAlign = 'top';

        const table = document.createElement('table');
        table.classList.add('data-table');
        table.style.width = '100%';

        const thead = document.createElement('thead');
        const trHead = document.createElement('tr');
        trHead.innerHTML = `
            <th>Sistema</th>
            <th>Horas</th>
        `;
        thead.appendChild(trHead);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        let totalHoras = 0;

        Object.keys(data[monthYear]).forEach(system => {
            const tr = document.createElement('tr');
            const tdSystem = document.createElement('td');
            tdSystem.textContent = system;
            const tdHoras = document.createElement('td');
            const horas = (data[monthYear][system] / 60).toFixed(2); // Convertir minutos a horas y mostrar con dos decimales
            tdHoras.textContent = isNaN(horas) ? '0.00' : horas; // Asegurarse de que no aparezca NaN
            totalHoras += parseFloat(horas);
            tr.appendChild(tdSystem);
            tr.appendChild(tdHoras);
            tbody.appendChild(tr);
        });

        // Fila para la suma total de horas
        const trTotal = document.createElement('tr');
        const tdTotalLabel = document.createElement('td');
        tdTotalLabel.textContent = 'Total';
        const tdTotalHoras = document.createElement('td');
        tdTotalHoras.textContent = totalHoras.toFixed(2); // Mostrar horas totales con dos decimales
        trTotal.appendChild(tdTotalLabel);
        trTotal.appendChild(tdTotalHoras);
        tbody.appendChild(trTotal);

        table.appendChild(tbody);

        // Añadir un título para cada tabla
        const tableTitle = document.createElement('h3');
        tableTitle.textContent = `Mes: ${monthYear}`;
        tableDiv.appendChild(tableTitle);
        tableDiv.appendChild(table);

        // Crear los canvas para las gráficas
        const pieCanvas = document.createElement('canvas');
        pieCanvas.id = `pie-chart-${monthYear}`;
        pieCanvas.style.width = '100%';
        pieCanvas.style.height = '200px';

        const barCanvas = document.createElement('canvas');
        barCanvas.id = `bar-chart-${monthYear}`;
        barCanvas.style.width = '100%';
        barCanvas.style.height = '200px';

        const lineCanvas = document.createElement('canvas');
        lineCanvas.id = `line-chart-${monthYear}`;
        lineCanvas.style.width = '100%';
        lineCanvas.style.height = '200px';

        chartDiv.appendChild(pieCanvas);
        chartDiv.appendChild(barCanvas);
        chartDiv.appendChild(lineCanvas);

        contentDiv.appendChild(tableDiv);
        contentDiv.appendChild(chartDiv);
        contentContainer.appendChild(contentDiv);

        // Generar las gráficas
        generatePieChart(pieCanvas, data[monthYear], monthYear);
        generateBarChart(barCanvas, data[monthYear], monthYear);
        generateLineChart(lineCanvas, data[monthYear], monthYear);
    });
}

function generatePieChart(canvas, data, monthYear) {
    const labels = Object.keys(data);
    const values = Object.values(data);
    const colors = labels.map(label => systemColors[label]);

    new Chart(canvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('0.6', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `Consumo de Minutos por Sistema - ${monthYear}`
                }
            }
        }
    });
}

function generateBarChart(canvas, data, monthYear) {
    const labels = Object.keys(data);
    const values = Object.values(data);
    const colors = labels.map(label => systemColors[label]);

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Minutos',
                data: values,
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('0.6', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `Consumo de Minutos por Sistema - ${monthYear}`
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function generateLineChart(canvas, data, monthYear) {
    const labels = Object.keys(data);
    const values = Object.values(data);
    const colors = labels.map(label => systemColors[label]);

    new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Minutos',
                data: values,
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('0.6', '1')),
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `Consumo de Minutos por Sistema - ${monthYear}`
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}