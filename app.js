// Datos iniciales (simulados con archivos base64 para demostración)
let documents = [
    { 
        id: 1, 
        provider: "Proveedor A", 
        name: "Contrato de Servicios 2024", 
        type: "Contrato", 
        date: "2024-01-15",
        file: {
            name: "contrato_servicios.pdf",
            data: "data:application/pdf;base64,JVBERi0xLjQKJ..." // Base64 truncado por brevedad
        }
    },
    { 
        id: 2, 
        provider: "Proveedor A", 
        name: "Factura #001-2024", 
        type: "Factura", 
        date: "2024-02-20",
        file: {
            name: "factura_001.pdf",
            data: "data:application/pdf;base64,JVBERi0xLjQKJ..." // Base64 truncado por brevedad
        }
    },
    { 
        id: 3, 
        provider: "Proveedor B", 
        name: "Certificado de Calidad", 
        type: "Certificado", 
        date: "2024-03-10",
        file: {
            name: "certificado_calidad.pdf",
            data: "data:application/pdf;base64,JVBERi0xLjQKJ..." // Base64 truncado por brevedad
        }
    }
];

// Cargar documentos y pestañas al inicio
document.addEventListener('DOMContentLoaded', function() {
    renderProviderTabs();
    renderDocuments(documents);
    
    // Mostrar nombre del archivo seleccionado
    document.getElementById('fileInput').addEventListener('change', function(e) {
        const fileName = e.target.files[0] ? e.target.files[0].name : "Ningún archivo seleccionado";
        document.getElementById('fileName').textContent = fileName;
    });
});

// Generar pestañas de proveedores
function renderProviderTabs() {
    const tabsContainer = document.getElementById('providerTabs');
    const providers = [...new Set(documents.map(doc => doc.provider))];
    
    // Limpiar pestañas existentes (excepto "Todos")
    while (tabsContainer.children.length > 1) {
        tabsContainer.removeChild(tabsContainer.lastChild);
    }
    
    providers.forEach(provider => {
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.textContent = provider;
        tab.setAttribute('data-provider', provider);
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const provider = this.getAttribute('data-provider');
            filterByProvider(provider);
        });
        tabsContainer.appendChild(tab);
    });
}

// Filtrar por proveedor
function filterByProvider(provider) {
    const filteredDocs = provider === 'all' 
        ? documents 
        : documents.filter(doc => doc.provider === provider);
    renderDocuments(filteredDocs);
}

// Renderizar documentos en la tabla
function renderDocuments(docs) {
    const tbody = document.getElementById('documentsBody');
    tbody.innerHTML = '';
    
    if (docs.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" style="text-align: center;">No se encontraron documentos</td>';
        tbody.appendChild(row);
        return;
    }
    
    docs.forEach(doc => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${doc.provider}</td>
            <td>${doc.name}</td>
            <td>${doc.type}</td>
            <td>${doc.date}</td>
            <td>
                <button onclick="downloadDocument(${doc.id})">Descargar</button>
                <button onclick="deleteDocument(${doc.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Agregar nuevo documento
document.getElementById('documentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files[0]) {
        alert('Por favor seleccione un archivo');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const newDoc = {
            id: documents.length + 1,
            provider: document.getElementById('providerName').value,
            name: document.getElementById('docName').value,
            type: document.getElementById('docType').value,
            date: document.getElementById('docDate').value,
            file: {
                name: fileInput.files[0].name,
                data: e.target.result
            }
        };
        
        documents.push(newDoc);
        renderProviderTabs();
        renderDocuments(documents);
        document.getElementById('documentForm').reset();
        document.getElementById('fileName').textContent = "Ningún archivo seleccionado";
    };
    reader.readAsDataURL(fileInput.files[0]);
});

// Aplicar filtros combinados (proveedor + tipo)
document.getElementById('applyFilter').addEventListener('click', function() {
    const activeProvider = document.querySelector('.tab.active').getAttribute('data-provider');
    const filterType = document.getElementById('filterType').value;
    
    let filteredDocs = documents;
    if (activeProvider !== 'all') {
        filteredDocs = filteredDocs.filter(doc => doc.provider === activeProvider);
    }
    if (filterType) {
        filteredDocs = filteredDocs.filter(doc => doc.type === filterType);
    }
    
    renderDocuments(filteredDocs);
});

// Resetear filtros
document.getElementById('resetFilter').addEventListener('click', function() {
    document.getElementById('filterType').value = '';
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector('.tab[data-provider="all"]').classList.add('active');
    renderDocuments(documents);
});

// Descargar documento REAL
function downloadDocument(id) {
    const doc = documents.find(d => d.id === id);
    if (!doc || !doc.file) {
        alert('Documento no disponible para descarga');
        return;
    }
    
    const link = document.createElement('a');
    link.href = doc.file.data;
    link.download = doc.file.name || `documento_${id}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Eliminar documento
function deleteDocument(id) {
    if (confirm('¿Está seguro que desea eliminar este documento?')) {
        documents = documents.filter(doc => doc.id !== id);
        renderProviderTabs();
        renderDocuments(documents);
    }
}