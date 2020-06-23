const history = $("#history");

const graphRemain = $("#graphRemain");
const graphTotal = $("#graphTotal");

getHistory(history, graphRemain, graphTotal);

// setTimeout(function() {
//     $(".toast").toast('show');
// }, 3000);

// Evento de mudança de data
var inputDelay;
$("#inDate").change(function() {
    // Função ao alterar data
    clearTimeout(inputDelay);
    inputDelay = setTimeout(function() {
        getHistory(history, graphRemain, graphTotal);
    }, 500);
});

// Histórico do colaborador
function getHistory(history, graphRemain, graphTotal) {
    let tTotal = 380;

    var TableQuery = `SELECT
                [ID], [Função], [WO], [Descrição], [Tempo], (CASE WHEN [Extra] <> 0 THEN 'SIM' ELSE 'NÃO' END) AS [Extra] FROM [Relatórios]
                    WHERE [Registro] = ${colaborador.Registro.value}
                        AND [Data] = '${document.getElementById('inDate').value}'`;

    var GraphRemainQuery = `SELECT SUM([R].[Tempo]) AS [Soma]
	                    FROM [SAT].[dbo].[Relatórios] AS [R]
                            WHERE [R].[Registro] = ${colaborador.Registro.value}
                                AND [R].[Data] = '${document.getElementById('inDate').value}'            
                                    AND [R].[Extra] = 'FALSE'`;

    var GraphTotalQuery = `SELECT TOP(7) FORMAT([Data], 'dd/MM/yyyy') AS [Data], [Tempo]
                            FROM [SAT].[dbo].[Relatórios]
                                WHERE [Registro] = ${colaborador.Registro.value}
                                    AND [WO] != 0
                                        ORDER BY [Data] ASC`;

    connectSQL(function() {
        selectSQL(TableQuery, (data) => {
            makeTable(data, history);
            selectSQL(GraphRemainQuery, (data) => {
                makeGraphRemain(data, graphRemain);
                selectSQL(GraphTotalQuery, (data) => {
                    makeGraphTotal(data, graphTotal);
                });
            });
        });
    });
}

// Gera a tabela com base no JSON do MSSQL
function makeTable(dados, div) {
    div.hide();
    var thead = document.createElement('thead');
    var table = document.createElement('table');
    $(table).addClass('table');

    thead.innerHTML = `
            <thead>
                <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Função</th>
                    <th scope="col">WO</th>
                    <th scope="col">Descrição</th>
                    <th scope="col">Tempo</th>
                    <th scope="col">Extra</th>
                </tr>
            </thead>`;

    table.appendChild(thead);
    var tbody = document.createElement('tbody');

    dados.forEach(function(arr) {
        // Dados da tabela
        var tr = document.createElement('tr');
        // Conteúdo HTML da tabela
        tr.innerHTML = `
                <th scope="row">${arr.ID.value}</th>
                <th>${arr.Função.value}</th>
                <th>${arr.WO.value}</th>
                <th>${arr.Descrição.value}</th>
                <th>${arr.Tempo.value}</th>
                <th>${arr.Extra.value}</th>`;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    div.html('');
    $("#title").html('');

    $("#title").html(`Resumo de ${dateFormat(document.getElementById('inDate').value)}`);
    $("#title").append("<hr />");

    div.append(table);
    div.fadeIn('slow');
    // Variável de posição do mouse
    var id;
    // Menu
    const menu = new Menu();
    const menuItem = new MenuItem({
        label: 'Apagar',
        click: () => {
            connectSQL(() => {
                executeSQL("DELETE FROM [Relatórios] WHERE [ID] = " + id, () => {
                    getHistory(history, graphRemain, graphTotal);
                });
            });
        }
    });
    menu.append(menuItem);
    // Menu de contexto
    $("tbody").contextmenu((e) => {
        // Evita ações padrões
        e.preventDefault();
        id = Number(e.target.parentElement.getElementsByTagName("th")[0].innerHTML);
        menu.popup(remote.getCurrentWindow());
    });
}

// Variável do gráfico de tempo restante
var renderGraphRemain;

// Renderizar gráfico de tempo restante
function makeGraphRemain(dados, div) {
    div.hide();
    let data = [dados[0].Soma.value, (380 - dados[0].Soma.value)];
    let colors = randomColors(data.length);

    if (!(typeof(renderGraphRemain) == 'undefined')) {
        renderGraphRemain.destroy();
    }

    renderGraphRemain = new Chart(div, {
        type: 'pie',
        data: {
            labels: ['Total registrado', 'Restante'],
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            aspectRatio: 1,
            legend: {
                position: 'bottom'
            },
            title: {
                display: true,
                text: 'Tempo do dia'
            }
        }
    });
    div.fadeIn('slow');
}

// Variável do gráfico de tempo total
var renderGraphTotal;

// Renderizar gráfico de tempo total
function makeGraphTotal(dados, div) {
    div.hide();

    let dates = [];
    let times = [];
    let colors = randomColors(dados.length);

    dados.forEach(function(d) {
        dates.push(d.Data.value);
        times.push(d.Tempo.value);
    })

    if (!(typeof(renderGraphTotal) == 'undefined')) {
        renderGraphTotal.destroy();
    }

    renderGraphTotal = new Chart(div, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                data: times,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            responsive: false,
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Últimos 7 dias'
            }
        }
    });

    div.fadeIn('slow');
}

// Retorna cores aleatórias
function randomColors(num) {
    let colors = [];
    // Math.random() * (max - min) + min;
    for (i = 0; i < num; i++) {
        let r = Math.floor(Math.random() * (200));
        let g = Math.floor(Math.random() * (200));
        let b = Math.floor(Math.random() * (200));

        colors.push(`rgba(${r}, ${g}, ${b}, 1)`);
    }
    return colors;
}