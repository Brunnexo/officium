// Selecionar navegação
$(".active").removeClass("active");
$("#resume").addClass("active");

const graphFunctions = $("#graphFunctions");
const graphProjects = $("#graphProjects");
const graphExtra = $("#graphExtra");

// Inicializar gráficos
getHistory();

// Histórico do colaborador
function getHistory() {

    var functionsQuery = `SELECT SUM([Tempo]) AS [Tempo], [Função]
                                FROM [SAT].[dbo].[Relatórios]
                                    GROUP BY [Função]`;

    var projectsQuery = `SELECT TOP(10) SUM([R].[Tempo]) AS [Tempo], [P].[Projeto]
                            FROM [SAT].[dbo].[Relatórios] AS [R]
                                INNER JOIN [SAT].[dbo].[WOs] AS [W] ON ([R].[WO] IN ([W].[Administrativo], [W].[Compras], [W].[Eletricista], [W].[Engenheiro], [W].[Ferramentaria], [W].[Mecânico], [W].[Programador], [W].[Projetista]))
                                    LEFT JOIN [SAT].[dbo].[Projetos] AS [P] ON ([W].[ID] = [P].[ID])
                                        GROUP BY [P].[Projeto]`;

    var extraQuery = `SELECT TOP(10) SUM([R].[Tempo]) AS [Tempo], MONTH([R].[Data]) AS [Data]
                        FROM [SAT].[dbo].[Relatórios] AS [R]
                            WHERE [R].[Extra] = 'TRUE'
                                GROUP BY MONTH([R].[Data])`;

    connectSQL(function() {
        selectSQL(functionsQuery, (data) => {
            makeGraphFunctions(data, graphFunctions);
            selectSQL(projectsQuery, (data) => {
                makeGraphProjects(data, graphProjects);
                selectSQL(extraQuery, (data) => {
                    makeGraphExtra(data, graphExtra);
                });
            });
        });
    });
}


// Variável do gráfico de tempo por funções
var renderGraphFunctions;
// Renderizar o gráfico de tempo por funções
function makeGraphFunctions(data, div) {
    div.hide();
    let times = [];
    let functions = [];
    data.forEach(function(d) {
        times.push(d.Tempo.value);
        functions.push(d.Função.value);
    });
    let colors = randomColors(functions.length);
    if (!(typeof(renderGraphFunctions) == 'undefined')) {
        renderGraphFunctions.destroy();
    }
    renderGraphFunctions = new Chart(div, {
        type: 'bar',
        data: {
            labels: functions,
            datasets: [{
                data: times,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            aspectRatio: 1,
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Tempo total por funções'
            }
        }
    });
    div.fadeIn('slow');
}

// Variável do gráfico de tempo total por projeto
var renderGraphProjects;
// Renderizar o gráfico de tempo total por projeto
function makeGraphProjects(data, div) {
    div.hide();

    let times = [];
    let projects = [];

    data.forEach(function(d) {
        times.push(d.Tempo.value);
        projects.push(d.Projeto.value);
    });

    let colors = randomColors(projects.length);

    if (!(typeof(renderGraphProjects) == 'undefined')) {
        renderGraphProjects.destroy();
    }

    renderGraphProjects = new Chart(div, {
        type: 'bar',
        data: {
            labels: projects,
            datasets: [{
                data: times,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            aspectRatio: 1,
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Tempo por projeto'
            }
        }
    });
    div.fadeIn('slow');
}

// Variável do gráfico de tempo extra
var renderGraphExtra;
// Renderizar o gráfico de tempo extra
function makeGraphExtra(data, div) {
    div.hide();

    let meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    let times = [];
    let dates = [];

    data.forEach(function(d) {
        times.push(d.Tempo.value);
        dates.push(meses[d.Data.value]);
    });

    let colors = randomColors(dates.length);

    if (!(typeof(renderGraphExtra) == 'undefined')) {
        renderGraphExtra.destroy();
    }

    renderGraphExtra = new Chart(div, {
        type: 'doughnut',
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
            responsive: false,
            maintainAspectRatio: false,
            legend: {
                position: 'right'
            },
            title: {
                display: true,
                text: 'Hora extra no ano'
            }
        }
    });
    div.fadeIn('slow');
}

// Retorna cores aleatórias
function randomColors(num) {
    let colors = [];

    // Math.random() * (max - min) + min;

    let diff = 0;
    for (i = 0; i < num; i++) {
        if (i <= 51) {
            let r = Math.round(Math.random() * ((255 - diff) - (0 + diff) + 1) + (0 + diff));
            let g = Math.round(Math.random() * ((255 - diff) - (0 + diff) + 1) + (0 + diff));
            let b = Math.round(Math.random() * ((255 - diff) - (0 + diff) + 1) + (0 + diff));

            colors.push(`rgba(${r}, ${g}, ${b}, 0.5)`);

            diff += 5;
        }
    }
    return colors;
}