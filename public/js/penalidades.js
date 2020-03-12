function getRequest() {
    try {
        var request = new XMLHttpRequest();
    } catch (err) {
        try {
            var request = ActiveXObject('Msxm12.XMLHTTP');
        } catch (err2) {
            try {
                var request = ActiveXObject('Microsoft.EXMLHTTP');
            } catch (err3) {
                var request = false;
            }
        }
    }
    return request;
}

let today = new Date();

basicPagesFactor = 20;
let filters = {
    fromDate: new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0).getTime(),
    toDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0).getTime() + 86400000,
    itemsPerPage: basicPagesFactor,
    currentPage: 1,
    pagesNumber: 0
};

function formatTime(date) {
    return `${date.getDate()<10?'0': ''}${date.getDate()}/${date.getMonth()+1<10? '0': ''}${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()<10?'0': ''}${date.getMinutes()}:${date.getSeconds()<10?'0': ''}${date.getSeconds()}`
}

function setDate(destination, date) {
    let formatedDate = `${date.getFullYear()}-${date.getMonth()+1<10? '0': ''}${date.getMonth() + 1}-${date.getDate()<10?'0': ''}${date.getDate()}`;
    destination.val(formatedDate);
}

document.getElementById('fromDate').addEventListener('input', () => {
    // 86400000[ms] is equal to 24h
    // 14400000[ms] is equal to 4h
    if ($('#fromDate').val() == '') {
        // let aux = new Date($('#toDate').val()).getTime();
        // let aux_date = new Date(aux + 86400000);
        // filters.fromDate = aux + 14400000;
        // setDate($('#fromDate'), aux_date);
        filters.fromDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0).getTime();
        setDate($('#fromDate'), new Date(today.getFullYear(), today.getMonth(), 1));
    } else {
        filters.fromDate = new Date($('#fromDate').val()).getTime() + 14400000;
    }

    $('#generateExcel').attr('href', `/reports/registro_de_penalidades?token=${token}&fromDate=${filters.fromDate}&toDate=${filters.toDate}`);

    let date = new Date(filters.fromDate);
    $('#toDate').attr('min', `${date.getFullYear()}-${date.getMonth()+1<10? '0': ''}${date.getMonth() + 1}-${date.getDate()<10?'0': ''}${date.getDate()}`);
    filters.currentPage = 1;
    render();
});
document.getElementById('toDate').addEventListener('input', () => {
    // 86400000[ms] is equal to 24h
    // 14400000[ms] is equal to 4h
    if ($('#toDate').val() == '') {
        filters.toDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0).getTime() + 86400000;
        setDate($('#toDate'), today);
    } else {
        filters.toDate = new Date($('#toDate').val()).getTime() + 86400000 + 14400000;
    }

    $('#generateExcel').attr('href', `/reports/registro_de_penalidades?token=${token}&fromDate=${filters.fromDate}&toDate=${filters.toDate}`);

    let date = new Date(new Date($('#toDate').val()).getTime() + 86400000);
    $('#fromDate').attr('max', `${date.getFullYear()}-${date.getMonth()+1<10? '0': ''}${date.getMonth() + 1}-${date.getDate()<10?'0': ''}${date.getDate()}`);
    filters.currentPage = 1;
    render();
});

document.getElementById('itemsPerPage').addEventListener('input', () => {
    filters.itemsPerPage = Number($('#itemsPerPage').val()) * basicPagesFactor;
    filters.currentPage = 1;
    render();
});

function render() {
    let html = '';
    let dataRequest = getRequest();
    dataRequest.onreadystatechange = () => {
        if (dataRequest.readyState == 4) {
            if (dataRequest.status == 200) {
                let res = JSON.parse(dataRequest.response);
                let regs = res.registros;
                let counter = 0;
                // Table headers
                html += '<thead class="thead-dark">';
                html += '    <tr>';
                html += '        <th scope="col">Item</th>';
                html += '        <th scope="col">Tipo de penalidad</th>';
                html += '        <th scope="col">Sigma</th>';
                html += '        <th scope="col">Ruta</th>';
                html += '        <th scope="col">Móvil</th>';
                html += '        <th scope="col">Detalle</th>';
                html += '        <th scope="col">Hora de Recepción</th>';
                html += '        <th scope="col">Supervisor</th>';
                html += '        <th scope="col">Respuesta</th>';
                html += '        <th scope="col">Hora de Respuesta</th>';
                html += '        <th scope="col">Contra-respuesta</th>';
                html += '        <th scope="col">Hora de Contra-respuesta</th>';
                html += '        <th scope="col">Comentarios</th>';
                html += '    </tr>';
                html += '</thead>';
                html += '<tbody>'
                regs.forEach(element => {
                    if (counter % 2 == 0) {
                        html += '<tr class="table-success">';
                    } else {
                        html += '<tr>';
                    }
                    counter++;
                    html += '    <th scope="row">';
                    html += `        ${element.item? element.item: '-'}`;
                    html += '    </th>';
                    html += '    <td>';
                    html += `        ${element.tipoDePenalidad? element.tipoDePenalidad: '-'}`;
                    html += '    </td>';
                    html += '    <td>';
                    html += `        ${element.sigma? element.sigma: '-'}`;
                    html += '    </td>';
                    html += '    <td>';
                    html += `        ${element.ruta? element.ruta.ruta: '-'}`;
                    html += '    </td>';
                    html += '    <td>';
                    html += `        ${element.movil? element.movil: '-'}`;
                    html += '    </td>';
                    html += '    <td>';
                    html += `        ${element.detalle? element.detalle: '-'}`;
                    html += '    </td>';
                    html += '    <td>';
                    html += `        ${element.horaDeRecepcion? formatTime(new Date(element.horaDeRecepcion)): '-'}`;
                    html += '    </td>';
                    html += '    <td>';
                    html += `        ${element.supervisore ? element.supervisore.zona : '-'}`;
                    html += '    </td>';
                    html += '    <td>';
                    html += `        ${element.respuesta ? element.respuesta : '-'}`;
                    html += '    </td>';
                    html += '    <td>';
                    html += `        ${element.horaDeRespuesta ? formatTime(new Date(element.horaDeRespuesta)) : '-'}`;
                    html += '    </td>';
                    html += '    <td>';
                    html += `        ${element.contrarespuesta ? element.contrarespuesta : '-'}`;
                    html += '    </td>';
                    html += '    <td>';
                    html += `        ${element.horaDeContrarespuesta ? formatTime(new Date(element.horaDeContrarespuesta)) : '-'}`;
                    html += '    </td>';
                    html += '    <td>';
                    html += `        ${element.comentarios ? element.comentarios : '-'}`;
                    html += '    </td>';
                    html += '</tr>';
                });
                html += '/<tbody>'
                $('#table').html(html);

                let paginator = '';
                paginator += `<li class="page-item ${filters.currentPage == 1? 'disabled': ''}">`;
                paginator += '    <a class="page-link text-dark" id="prev-page" href="#" aria-label="Previous">';
                paginator += '        <span aria-hidden="true">&laquo;</span>';
                paginator += '    </a>';
                paginator += '</li>';
                filters.pagesNumber = Math.ceil(res.count / filters.itemsPerPage);
                if (filters.currentPage > 2 && filters.currentPage < filters.pagesNumber - 2) {
                    paginator += `                <li class="page-item disabled"><a class="page-link text-dark" href="#">...</a></li>`;
                    for (let i = filters.currentPage >= 2 ? filters.currentPage - 2 : 0; i < filters.currentPage + 1 && i < filters.pagesNumber; i++) {
                        paginator += `                <li class="page-item"><a class="page-link ${filters.currentPage === (i+1) ? 'text-light active bg-dark': 'text-dark'}" id="page-${i+1}" href="#">${i+1}</a></li>`;
                    }
                    paginator += `                <li class="page-item disabled"><a class="page-link text-dark" href="#">...</a></li>`;
                } else {
                    if (filters.currentPage <= 2) {
                        for (let i = 0; i < 4 && i < filters.pagesNumber; i++) {
                            paginator += `                <li class="page-item"><a class="page-link ${filters.currentPage === (i+1) ? 'text-light active bg-dark': 'text-dark'}" id="page-${i+1}" href="#">${i+1}</a></li>`;
                        }
                        if (filters.pagesNumber > 4) {
                            paginator += `                <li class="page-item disabled"><a class="page-link text-dark" href="#">...</a></li>`;
                        }
                    } else {
                        if (filters.pagesNumber > 4) {
                            paginator += `                <li class="page-item disabled"><a class="page-link text-dark" href="#">...</a></li>`;
                        }
                        for (let i = filters.pagesNumber >= 4 ? filters.pagesNumber - 4 : 0; i < filters.pagesNumber; i++) {
                            paginator += `                <li class="page-item"><a class="page-link ${filters.currentPage === (i+1) ? 'text-light active bg-dark': 'text-dark'}" id="page-${i+1}" href="#">${i+1}</a></li>`;
                        }
                    }
                }
                paginator += `                <li class="page-item ${filters.currentPage === filters.pagesNumber? 'disabled': ''}">`;
                paginator += '                    <a class="page-link text-dark" id="next-page" href="#" aria-label="Next">';
                paginator += '                        <span aria-hidden="true">&raquo;</span>';
                paginator += '                    </a>';
                paginator += '                </li>';
                $('#pageNav').html(paginator);

                // ===============================================
                // Curent page 1, 2, 3, ...
                // ===============================================
                for (let i = 0; i < filters.pagesNumber; i++) {
                    if (document.getElementById(`page-${i+1}`)) {
                        document.getElementById(`page-${i+1}`).addEventListener('click', () => {
                            filters.currentPage = i + 1;
                            render();
                        });
                    }
                }
                // ===============================================
                // Prev and next pages
                // ===============================================
                document.getElementById('prev-page').addEventListener('click', () => {
                    filters.currentPage -= 1;
                    render();
                });
                document.getElementById('next-page').addEventListener('click', () => {
                    filters.currentPage += 1;
                    render();
                });
                // ============================================================================================================
            } else {
                let res = JSON.parse(dataRequest.response);
                alert(JSON.stringify(res.err));
            }
        }
    };

    dataRequest.open('GET', `penalties?fromDate=${filters.fromDate}&toDate=${filters.toDate}&from=${(filters.currentPage - 1) * filters.itemsPerPage}&to=${filters.itemsPerPage}`, true);
    dataRequest.setRequestHeader('token', token);
    dataRequest.setRequestHeader('Content-Type', 'application/json');
    dataRequest.send();
}

setDate($('#fromDate'), new Date(today.getFullYear(), today.getMonth(), 1));
$('#fromDate').attr('max', `${today.getFullYear()}-${today.getMonth()+1<10? '0': ''}${today.getMonth() + 1}-${today.getDate()<10?'0': ''}${today.getDate()}`);
setDate($('#toDate'), today);
$('#toDate').attr('max', `${today.getFullYear()}-${today.getMonth()+1<10? '0': ''}${today.getMonth() + 1}-${today.getDate()<10?'0': ''}${today.getDate()}`);
$('#toDate').attr('min', `${new Date(filters.fromDate).getFullYear()}-${new Date(filters.fromDate).getMonth()+1<10? '0': ''}${new Date(filters.fromDate).getMonth() + 1}-${new Date(filters.fromDate).getDate()<10?'0': ''}${new Date(filters.fromDate).getDate()}`);



let token;
if (!sessionStorage.getItem('token')) {
    window.location = "/";
} else {
    token = sessionStorage.getItem('token');
    $('#generateExcel').attr('href', `/reports/registro_de_penalidades?token=${token}&fromDate=${filters.fromDate}&toDate=${filters.toDate}`);
    render();
}