// Selecionar navegação
$(".active").removeClass("active");
$("#resume").addClass("active");

const history = $("#history");

const graphRemain = $("#graphRemain");
const graphTotal = $("#graphTotal");

getHistory(graphRemain, graphTotal);

// Evento de mudança de data
var inputDelay;
$("#inDate").change(function() {
    // Função ao alterar data
    clearTimeout(inputDelay);
    inputDelay = setTimeout(function() {
        getHistory(graphRemain, graphTotal);
    }, 500);
});

// Histórico do colaborador
function getHistory(graphRemain, graphTotal) {

}

// Variável do gráfico de tempo restante
var renderGraphRemain;

// Renderizar gráfico de tempo restante
function makeGraphRemain(dados, div) {
    div.hide();

    let tempos = [];
    let projetos = [];

    let restante = 0;

    // Adiciona os valores a um array
    dados.forEach(function(d) {
        tempos.push(d.Tempo.value);
        projetos.push(d.Projeto.value);
        restante += Number(d.Tempo.value);
    });

    restante = ((380 - restante) < 0) ? 0 : (380 - restante);

    if (restante != 0) {
        projetos.push("Restante");
        tempos.push(restante);
    }

    // Cores aleatórias


    let colors = randomColors(projetos.length);

    if (!(typeof(renderGraphRemain) == 'undefined')) {
        renderGraphRemain.destroy();
    }

    renderGraphRemain = new Chart(div, {
        type: 'pie',
        data: {
            labels: projetos,
            datasets: [{
                data: tempos,
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
            },
            tooltips: {
                mode: "point"
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
    let projects = [];
    let colors = randomColors(dados.length);

    dados.forEach(function(d) {
        dates.push(d.Data.value);
        times.push(d.Tempo.value);
        projects.push(d.Projeto.value);
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
                text: 'Últimos 15 registros'
            },
            tooltips: {
                label: (tooltipItem, data) => {
                    console.log(data.datasets);
                    // return projects[tooltipItem.datasetIndex];
                }
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
        let colorValue = Math.round(Math.random() * (191 - 52) + 52);
        let r = colorValue;
        let g = colorValue + 6;
        let b = colorValue + 12;
        colors.push(`rgba(${r}, ${g}, ${b}, 1)`);
    }

    return colors;
}