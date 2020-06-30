// Selecionar navegação
$(".active").removeClass("active");
$("#resume").addClass("active");

const graphFunctions = $("#graphFunctions");
const graphProjects = $("#graphProjects");
const graphExtra = $("#graphExtra");
const graphProjectsHistory = $("#graphProjectsHistory");

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

    var projectHistoryQuery = `SELECT SUM([R].[Tempo]) AS [Tempo], MONTH([R].[Data]) AS [Data], [P].[Projeto]
                                FROM [SAT].[dbo].[Relatórios] AS [R]
                                    INNER JOIN [SAT].[dbo].[WOs] AS [W] ON ([R].[WO] IN ([W].[Administrativo], [W].[Compras], [W].[Eletricista], [W].[Engenheiro], [W].[Ferramentaria], [W].[Mecânico], [W].[Programador], [W].[Projetista]))
                                    LEFT JOIN [SAT].[dbo].[Projetos] AS [P] ON ([W].[ID] = [P].[ID])
                                        GROUP BY MONTH([R].[Data]), [P].[Projeto]`;

    connectSQL(function() {
        selectSQL(functionsQuery, (data) => {
            makeGraphFunctions(data, graphFunctions);
            selectSQL(projectsQuery, (data) => {
                makeGraphProjects(data, graphProjects);
                selectSQL(extraQuery, (data) => {
                    makeGraphExtra(data, graphExtra);
                    selectSQL(projectHistoryQuery, (data) => {
                        makeGraphProjectsHistory(data, graphProjectsHistory);
                    });
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

// Variável de gráfico de histórico de projetos
var renderGraphProjectsHistory;
// Renderizar o gráfico de histórico de projetos
function makeGraphProjectsHistory(data, div) {
    div.hide();

    let months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    let labelsValues = [];
    let dataValues = [];

    data.forEach(function(d) {
        labelsValues.push(months[6]);
        dataValues.push({
            label: d.Projeto.value,
            data: d.Tempo.value,
            borderColor: randomColors(1),
            borderWidth: 1
        });
    });

    if (!(typeof(renderGraphProjectsHistory) == 'undefined')) {
        renderGraphProjectsHistory.destroy();
    }

    renderGraphProjectsHistory = new Chart(div, {
        type: 'line',
        data: {
            labels: labelsValues,
            datasets: dataValues
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            legend: {
                position: 'bottom'
            },
            title: {
                display: true,
                text: 'Trabalho dos projetos no ano'
            }
        }
    });
    div.fadeIn('slow');
}

// Retorna cores aleatórias
function randomColors(num) {
    let colors = [];

    // Math.random() * (max - min) + min;

    if (num == 1) {
        let colorValue = Math.round(Math.random() * (191 - 52) + 52);
        let r = colorValue;
        let g = colorValue + 6;
        let b = colorValue + 12;
        return `rgba(${r}, ${g}, ${b}, 1)`;
    } else {
        for (i = 0; i < num; i++) {
            let colorValue = Math.round(Math.random() * (191 - 52) + 52);
            let r = colorValue;
            let g = colorValue + 6;
            let b = colorValue + 12;
            colors.push(`rgba(${r}, ${g}, ${b}, 1)`);
        }
        return colors;
    }
}