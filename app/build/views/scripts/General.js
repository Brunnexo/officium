// Selecionar navegação
$(".active").removeClass("active");
$("#register").addClass("active");
$("#btn").removeClass("invisible");

// Inserção de dados
//
// Funções do colaborador
// Projetos
// WOs

// Funções do colaborador
colaborador.Funções.value.forEach(function(f) {
    var index = colaborador.Funções.value.indexOf(f);
    $("#inFunction").append(`<option index="${index}">${f}</option>`);
});
var função = $('#inFunction :selected').text();

// Projetos gerais
geral.forEach(function(g) {
    $("#inProject").append(`<option index="${g.ID.value}" proj="${g.Projeto.value}" wo="${g[função].value}">${g.Descrição.value}</option>`);
});

// WO
getWO();

// Alteração dos campos
//
// WO
// Projeto
//
// Função

// WO -> Projeto
$("#inWO").keyup(function(e) {
    clearTimeout(inputDelay);
    var inputDelay = setTimeout(function() {
        var wo = $("#inWO").val();
        if (!(isNaN(Number(wo)))) {
            var hasWO = false;
            geral.forEach(function(g) {
                hasWO = ((g[função].value == wo) || hasWO);
            });
            if (hasWO) {
                $(`#inProject option[wo=${wo}]`).prop("selected", true);
            }
        }
    }, 500);
});

// Projeto -> WO
$("#inProject").change(function() {
    getWO();
});

// Função -> tudo
$("#inFunction").change(function() {
    var função = $('#inFunction :selected').text();

    // Remove projetos da lista
    $("#inProject option").each(function() {
        $(this).remove();
    });

    // Adicionar projetos na lista
    geral.forEach(function(g) {
        $("#inProject").append(`<option index="${g.ID.value}" proj="${g.Projeto.value}" wo="${g[função].value}">${g.Descrição.value}</option>`);
    });

    // WO
    getWO();
});