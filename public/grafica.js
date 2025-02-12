document.addEventListener('DOMContentLoaded', function() {
    setupFilters();
});

const systems = [
    'autorizaciones web',
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
    'autorizaciones web': 'rgba(255, 99, 132, 0.6)',
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

let groupedData = {};

function fetchRecords() {
    fetch('/api/records')
        .then(response => response.json())
        .then(data => {
            // Agrupar y sumar los datos por mes y sistema
            groupedData = {};

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

                let systemKey = systems.find(system => record.system.toLowerCase() === system.toLowerCase());
                if (!systemKey && record.system.toLowerCase().includes('linea medica')) {
                    systemKey = 'linea medica';
                }

                if (systemKey) {
                    groupedData[monthYear][systemKey] += parseInt(record.durationMinutes);
                }
            });

            populateTableSelect(groupedData);
        })
        .catch(error => console.error('Error fetching records:', error));
}

function populateTableSelect(data) {
    const dropdownContent = document.querySelector('.dropdown-content');
    Object.keys(data).forEach(monthYear => {
        const option = document.createElement('a');
        option.href = "#";
        option.textContent = monthYear;
        option.addEventListener('click', function() {
            const tableSelect = document.getElementById('tableSelect');
            tableSelect.value = monthYear;
        });
        dropdownContent.appendChild(option);
    });
}

function setupFilters() {
    fetchRecords();
    const filterButton = document.getElementById('filterButton');
    filterButton.addEventListener('click', function() {
        const tableSelect = document.getElementById('tableSelect');
        const selectedTables = [tableSelect.value];
        filterContent(selectedTables);
    });
}

function filterContent(selectedTables) {
    const contentContainer = document.getElementById('contentContainer');

    selectedTables.forEach(monthYear => {
        let contentDiv = contentContainer.querySelector(`div[data-month-year="${monthYear}"]`);
        if (!contentDiv) {
            generateContentForMonthYear(monthYear, groupedData[monthYear]);
        } else {
            contentDiv.style.display = 'block';
        }
    });
}

function generateContentForMonthYear(monthYear, data) {
    const contentContainer = document.getElementById('contentContainer');

    const contentDiv = document.createElement('div');
    contentDiv.setAttribute('data-month-year', monthYear);
    contentDiv.classList.add('content-item');

    const closeButton = document.createElement('button');
    closeButton.classList.add('close-button');
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', function() {
        contentDiv.style.display = 'none';
    });

    const tableDiv = document.createElement('div');
    tableDiv.classList.add('table-container');

    const chartContainer = document.createElement('div');
    chartContainer.classList.add('chart-container');

    const table = document.createElement('table');
    table.classList.add('data-table');

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

    Object.keys(data).forEach(system => {
        const horas = (data[system] / 60).toFixed(2); // Convertir minutos a horas y mostrar con dos decimales
        if (parseFloat(horas) === 0) {
            return; // Omitir filas con valor cero
        }

        const tr = document.createElement('tr');
        const tdSystem = document.createElement('td');
        tdSystem.textContent = system;
        const tdHoras = document.createElement('td');
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
    pieCanvas.style.width = '48%';
    pieCanvas.style.height = '350px'; // Ajustar el tamaño de la gráfica circular

    const barCanvas = document.createElement('canvas');
    barCanvas.id = `bar-chart-${monthYear}`;
    barCanvas.style.width = '48%';
    barCanvas.style.height = '350px';

    const lineCanvas = document.createElement('canvas');
    lineCanvas.id = `line-chart-${monthYear}`;
    lineCanvas.style.width = '48%';
    lineCanvas.style.height = '350px';

    const pieAndTableContainer = document.createElement('div');
    pieAndTableContainer.classList.add('pie-and-table-container');
    pieAndTableContainer.appendChild(tableDiv);
    pieAndTableContainer.appendChild(pieCanvas);

    chartContainer.appendChild(pieAndTableContainer);
    chartContainer.appendChild(barCanvas);
    chartContainer.appendChild(lineCanvas);

    contentDiv.appendChild(closeButton);
    contentDiv.appendChild(chartContainer);
    contentContainer.appendChild(contentDiv);

    // Generar las gráficas
    generatePieChart(pieCanvas, data, monthYear);
    generateBarChart(barCanvas, data, monthYear);
    generateLineChart(lineCanvas, data, monthYear);
}

function generatePieChart(canvas, data, monthYear) {
    const filteredData = Object.entries(data).filter(([label, value]) => value > 0);
    const labels = filteredData.map(([label]) => label);
    const values = filteredData.map(([, value]) => value);
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
                },
                tooltip: {
                    bodyFont: {
                        size: 16 // Tamaño de letra más grande para los tooltips
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            layout: {
                padding: {
                    top: 20,
                    bottom: 20
                }
            }
        }
    });
}

function generateBarChart(canvas, data, monthYear) {
    const filteredData = Object.entries(data).filter(([label, value]) => value > 0);
    const labels = filteredData.map(([label]) => label);
    const values = filteredData.map(([, value]) => value);
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
                },
                tooltip: {
                    bodyFont: {
                        size: 16 // Tamaño de letra más grande para los tooltips
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            layout: {
                padding: {
                    top: 20,
                    bottom: 20
                }
            }
        }
    });
}

function generateLineChart(canvas, data, monthYear) {
    const filteredData = Object.entries(data).filter(([label, value]) => value > 0);
    const labels = filteredData.map(([label]) => label);
    const values = filteredData.map(([, value]) => value);
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
                },
                tooltip: {
                    bodyFont: {
                        size: 16 // Tamaño de letra más grande para los tooltips
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            layout: {
                padding: {
                    top: 20,
                    bottom: 20
                }
            }
        }
    });
}