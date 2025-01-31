document.addEventListener('DOMContentLoaded', function() {
    fetchRecords();
    document.getElementById('searchYear').addEventListener('input', filterTable);
    document.getElementById('searchMonth').addEventListener('input', filterTable);
    document.getElementById('searchStartDate').addEventListener('input', filterTable);
    document.getElementById('searchSystem').addEventListener('input', filterTable);
    document.getElementById('searchEndDate').addEventListener('input', filterTable);
    document.getElementById('searchDurationMinutes').addEventListener('input', filterTable);
    document.getElementById('searchObservations').addEventListener('input', filterTable);
});

function fetchRecords() {
    fetch('/api/records')
        .then(response => response.json())
        .then(data => {
            // Ordenar los datos por startDate en orden ascendente
            data.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

            const tableBody = document.getElementById('tableBody');
            tableBody.innerHTML = ''; // Limpiar el contenido existente

            data.forEach(record => {
                const newRow = document.createElement('tr');
                const hasNull = Object.values(record).some(value => value === null || value === 'null' || value === '');

                newRow.innerHTML = `
                    <td>${record.startDate}</td>
                    <td>${record.system}</td>
                    <td>${record.endDate}</td>
                    <td>${record.durationMinutes}</td>
                    <td>${record.observations}</td>
                    <td>
                        <button class="edit-btn" onclick="editRecord(${record.id})"><i class="fas fa-pencil-alt"></i></button>
                        <button class="reflect-btn" onclick="reflectRecord(${record.id})"><i class="fas fa-memory"></i></button>
                        <button class="delete-btn" onclick="confirmDelete(${record.id})"><i class="fas fa-trash"></i></button>
                        ${hasNull ? '<i class="fas fa-exclamation-circle warning-icon"></i>' : ''}
                    </td>
                `;
                tableBody.appendChild(newRow);
            });
        })
        .catch(error => console.error('Error fetching records:', error));
}

function reflectRecord(id) {
    fetch(`/api/records/${id}`)
        .then(response => response.json())
        .then(record => {
            const reflectModalBody = document.getElementById('reflectModalBody');
            reflectModalBody.innerHTML = `
                <p><strong>Año:</strong> ${record.year}</p>
                <p><strong>Mes:</strong> ${record.month}</p>
                <p><strong>Marca temporal:</strong> ${record.timestamp}</p>
                <p><strong>Correo electrónico:</strong> ${record.email}</p>
                <p><strong>Fecha de inicio:</strong> ${record.startDate}</p>
                <p><strong>Sistema afectado:</strong> ${record.system}</p>
                <p><strong>Problema:</strong> ${record.problem}</p>
                <p><strong>Número de caso:</strong> ${record.caseNumber}</p>
                <p><strong>Tipo de incidente:</strong> ${record.incidentType}</p>
                <p><strong>Acción de contingencia:</strong> ${record.contingencyAction}</p>
                <p><strong>Fecha de cierre:</strong> ${record.endDate}</p>
                <p><strong>Duración en minutos:</strong> ${record.durationMinutes}</p>
                <p><strong>Duración en días:</strong> ${record.durationDays}</p>
                <p><strong>Observaciones:</strong> ${record.observations}</p>
            `;
            openReflectModal();
        })
        .catch(error => console.error('Error fetching record details:', error));
}

function openReflectModal() {
    document.getElementById('reflectModal').style.display = 'block';
}

function closeReflectModal() {
    document.getElementById('reflectModal').style.display = 'none';
}

function filterTable() {
    const searchYear = document.getElementById('searchYear').value.toLowerCase();
    const searchMonth = document.getElementById('searchMonth').value.toLowerCase();
    const searchStartDate = document.getElementById('searchStartDate').value.toLowerCase();
    const searchSystem = document.getElementById('searchSystem').value.toLowerCase();
    const searchEndDate = document.getElementById('searchEndDate').value.toLowerCase();
    const searchDurationMinutes = document.getElementById('searchDurationMinutes').value.toLowerCase();
    const searchObservations = document.getElementById('searchObservations').value.toLowerCase();
    const table = document.getElementById('infoTable');
    const rows = table.getElementsByTagName('tr');

    for (let i = 2; i < rows.length; i++) { // Comienza en 2 para omitir las filas de encabezado
        const cells = rows[i].getElementsByTagName('td');
        const startDate = cells[0].innerText.toLowerCase();
        const system = cells[1].innerText.toLowerCase();
        const endDate = cells[2].innerText.toLowerCase();
        const durationMinutes = cells[3].innerText.toLowerCase();
        const observations = cells[4].innerText.toLowerCase();

        const match = startDate.includes(searchStartDate) &&
                      system.includes(searchSystem) &&
                      endDate.includes(searchEndDate) &&
                      durationMinutes.includes(searchDurationMinutes) &&
                      observations.includes(searchObservations) &&
                      (searchYear === '' || startDate.includes(searchYear)) &&
                      (searchMonth === '' || startDate.includes(searchMonth));

        rows[i].style.display = match ? '' : 'none';
    }
}

function addRecord(event) {
    event.preventDefault();

    const year = document.getElementById("year").value;
    const month = document.getElementById("month").value;
    const timestamp = document.getElementById("timestamp").value;
    const email = document.getElementById("email").value;
    const startDate = document.getElementById("startDate").value;
    const system = document.getElementById("system").value;
    const problem = document.getElementById("problem").value;
    const caseNumber = document.getElementById("caseNumber").value;
    const incidentType = document.getElementById("incidentType").value;
    const contingencyAction = document.getElementById("contingencyAction").value;
    const endDate = document.getElementById("endDate").value;
    const durationMinutes = document.getElementById("durationMinutes").value;
    const durationDays = document.getElementById("durationDays").value;
    const observations = document.getElementById("observations").value;

    // Enviar los datos al servidor
    fetch('/api/records', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            year, month, timestamp, email, startDate, system, problem, caseNumber, incidentType, contingencyAction, endDate, durationMinutes, durationDays, observations
        })
    })
    .then(response => response.json())
    .then(data => {
        // Crear una nueva fila en la tabla
        const tableBody = document.getElementById('tableBody');
        const newRow = document.createElement('tr');

        newRow.innerHTML = `
            <td>${startDate}</td>
            <td>${system}</td>
            <td>${endDate}</td>
            <td>${durationMinutes}</td>
            <td>${observations}</td>
            <td>
                <button class="edit-btn" onclick="editRecord(${data.id})">Editar</button>
                <button class="delete-btn" onclick="confirmDelete(${data.id})">Borrar</button>
            </td>
        `;
        tableBody.appendChild(newRow);

        // Cerrar el modal y limpiar el formulario
        closeAddModal();
        document.getElementById("addForm").reset();
    })
    .catch(error => console.error('Error adding record:', error));
}

function editRecord(id) {
    fetch(`/api/records/${id}`)
        .then(response => response.json())
        .then(record => {
            document.getElementById('editId').value = record.id;
            document.getElementById('editYear').value = record.year;
            document.getElementById('editMonth').value = record.month;
            document.getElementById('editTimestamp').value = record.timestamp;
            document.getElementById('editEmail').value = record.email;
            document.getElementById('editStartDate').value = record.startDate;
            document.getElementById('editSystem').value = record.system;
            document.getElementById('editProblem').value = record.problem;
            document.getElementById('editCaseNumber').value = record.caseNumber;
            document.getElementById('editIncidentType').value = record.incidentType;
            document.getElementById('editContingencyAction').value = record.contingencyAction;
            document.getElementById('editEndDate').value = record.endDate;
            document.getElementById('editDurationMinutes').value = record.durationMinutes;
            document.getElementById('editDurationDays').value = record.durationDays;
            document.getElementById('editObservations').value = record.observations;
            openEditModal();
        })
        .catch(error => console.error('Error fetching record details:', error));
}

function updateRecord(event) {
    event.preventDefault();

    const id = document.getElementById('editId').value;
    const year = document.getElementById('editYear').value;
    const month = document.getElementById('editMonth').value;
    const timestamp = document.getElementById('editTimestamp').value;
    const email = document.getElementById('editEmail').value;
    const startDate = document.getElementById('editStartDate').value;
    const system = document.getElementById('editSystem').value;
    const problem = document.getElementById('editProblem').value;
    const caseNumber = document.getElementById('editCaseNumber').value;
    const incidentType = document.getElementById('editIncidentType').value;
    const contingencyAction = document.getElementById('editContingencyAction').value;
    const endDate = document.getElementById('editEndDate').value;
    const durationMinutes = document.getElementById('editDurationMinutes').value;
    const durationDays = document.getElementById('editDurationDays').value;
    const observations = document.getElementById('editObservations').value;

    fetch(`/api/records/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            year, month, timestamp, email, startDate, system, problem, caseNumber, incidentType, contingencyAction, endDate, durationMinutes, durationDays, observations
        })
    })
    .then(response => response.json())
    .then(data => {
        fetchRecords(); // Refrescar la tabla
        closeEditModal();
    })
    .catch(error => console.error('Error updating record:', error));
}

function confirmDelete(id) {
    document.getElementById('confirmDeleteBtn').onclick = function() {
        deleteRecord(id);
    };
    openDeleteModal();
}

function deleteRecord(id) {
    fetch(`/api/records/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.deleted) {
            fetchRecords(); // Refrescar la tabla
        }
        closeDeleteModal();
    })
    .catch(error => console.error('Error deleting record:', error));
}

function openAddModal() {
    document.getElementById('addModal').style.display = 'block';
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
}

function openEditModal() {
    document.getElementById('editModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

function openDeleteModal() {
    document.getElementById('deleteModal').style.display = 'block';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

document.getElementById('editForm').addEventListener('submit', updateRecord);