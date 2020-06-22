const history = $("#history");
const graph = $("#graph");

getHistory(history, graph);

// Evento de mudança de data
var inputDelay;
$("#inDate").change(function() {
    // Função ao alterar data
    clearTimeout(inputDelay);
    inputDelay = setTimeout(function() {
        getHistory(history, graph);
    }, 500);
});

// Histórico do colaborador
function getHistory(table, graph) {
    let tTotal = 380;

    var TableQuery = `SELECT
                [ID], [Função], [WO], [Descrição], [Tempo], (CASE WHEN [Extra] <> 0 THEN 'SIM' ELSE 'NÃO' END) AS [Extra] FROM [Relatórios]
                    WHERE [Registro] = ${colaborador.Registro.value}
                        AND [Data] = '${document.getElementById('inDate').value}'`;

    var GraphQuery = `SELECT SUM([R].[Tempo]) AS [Soma]
	                    FROM [SAT].[dbo].[Relatórios] AS [R]
                            WHERE [R].[Registro] = ${colaborador.Registro.value}
                                AND [R].[Data] = '${document.getElementById('inDate').value}'            
			                        AND [R].[Extra] = 'FALSE'`;

    connectSQL(function() {
        selectSQL(TableQuery, (data) => {
            makeTable(data, table);
            selectSQL(GraphQuery, (data) => {
                makeGraph(data, graph);
            });
        });
    });
}

// Gera a tabela com base no JSON do MSSQL
function makeTable(dados, div) {
    $("#content").hide();

    if (dados.length >= 1) {
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
        div.append(table);
        $("#content").fadeIn('slow');
        // Variável de posição do mouse
        var id;
        // Menu
        const menu = new Menu();
        const menuItem = new MenuItem({
            label: 'Apagar',
            click: () => {
                connectSQL(() => {
                    executeSQL("DELETE FROM [Relatórios] WHERE [ID] = " + id, () => {
                        getHistory($("#history"), $("#graph"));
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
    } else {
        $("#content").hide();
    }
}

// Variável do gráfico
var render;

function makeGraph(dados, div) {
    let ctx = document.getElementById(div.attr('id')).getContext('2d');

    let data = [dados[0].Soma.value, (380 - dados[0].Soma.value)];
    let colors = randomColors(data.length);

    if (!(typeof(render) == 'undefined')) {
        console.log("Destruindo!");
        render.destroy();
    }

    render = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Total registrado', 'Restante'],
            datasets: [{
                label: 'Tempo restante',
                data: data,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            aspectRatio: 1
        }
    });

}

// Retorna cores aleatórias
function randomColors(num) {
    let colors = [];
    // Math.random() * (max - min) + min;
    for (i = 0; i < num; i++) {
        let r = Math.floor(Math.random() * (150 - 50) + 50);
        let g = Math.floor(Math.random() * (150 - 50) + 50);
        let b = Math.floor(Math.random() * (150 - 50) + 50);

        colors.push(`rgba(${r}, ${g}, ${b}, 1)`);
    }

    return colors;
}