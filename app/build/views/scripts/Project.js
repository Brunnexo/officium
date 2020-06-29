// Selecionar navegação
$(".active").removeClass("active");
$("#register").addClass("active");
$("#btn").removeClass("invisible");

// Inserção de dados
//
// Funções do colaborador
// Atividades do colaborador
// Descrição das atividades do colaborador
// Clientes
// Projetos
// WOs

// Funções do colaborador
colaborador.Funções.value.forEach(function(f) {
    var index = colaborador.Funções.value.indexOf(f);
    $("#inFunction").append(`<option index="${index}">${f}</option>`);
});
var função = $('#inFunction :selected').text();

// Atividades do colaborador
Object.keys(activities[função]).forEach(function(val) {
    $("#inActivity").append(`<option>${val}</option>`);
});

//Descrição das atividades do colaborador
var atividade = $('#inActivity :selected').text();
activities[função][atividade].forEach(function(val) {
    $("#inDescription").append(`<option>${val}</option>`);
});

// Clientes
clients.forEach(function(k) {
    var index = clients.indexOf(k);
    $("#inClient").append(`<option index="${index}">${k}</option>`);
});

// Projetos
projetos.forEach(function(p) {
    var cliente = $('#inClient :selected').text();
    if (p.Cliente.value.includes(cliente)) {
        $("#inProject").append(`<option index="${p.ID.value}" client="${clients.indexOf(p.Cliente.value)}" proj="${p.Projeto.value}" wo="${p[função].value}">${p.Descrição.value}</option>`);
    }
});

// WO
getWO();

// Alteração dos campos
//
// WO
// Projeto
// Cliente
//
// Função
// Atividade

// WO -> Projeto & Cliente
$("#inWO").keyup(function(e) {
    clearTimeout(inputDelay);
    var inputDelay = setTimeout(function() {
        var wo = $("#inWO").val();
        if (!(isNaN(Number(wo)))) {
            var hasWO = false;
            var selClient;
            projetos.forEach(function(p) {
                if (p[função].value == wo) {
                    hasWO = true;
                    selClient = p.Cliente.value;
                }
            });
            if (hasWO) {
                // Remove os projetos da lista atual
                $("#inProject option").each(function() {
                    $(this).remove();
                });
                // Adicionar projetos
                projetos.forEach(function(p) {
                    if (p.Cliente.value.includes(selClient)) {
                        $("#inProject").append(`<option index="${p.ID.value}" client="${clients.indexOf(p.Cliente.value)}" proj="${p.Projeto.value}" wo="${p[função].value}">${p.Descrição.value}</option>`);
                    }
                });
                $(`#inProject option[wo=${wo}]`).prop("selected", true);
                $(`#inClient [index=${$("#inProject :selected").attr("client")}]`).prop("selected", true);
            }
        }
    }, 500);
});

// Projeto -> WO
$("#inProject").change(function() {
    getWO();
});

// Cliente -> Projeto && WO
$("#inClient").change(function() {
    // Remove projetos da lista
    $("#inProject option").each(function() {
        $(this).remove();
    })

    // Adiciona projetos do cliente selecionado na lista
    projetos.forEach(function(p) {
        if (p.Cliente.value.includes($("#inClient").val())) {
            $("#inProject").append(`<option index="${p.ID.value}" client="${clients.indexOf(p.Cliente.value)}" proj="${p.Projeto.value}" wo="${p[função].value}">${p.Descrição.value}</option>`);
        }
    });

    // WO do projeto selecionado
    getWO();
});

// Função -> tudo
$("#inFunction").change(function() {
    var função = $('#inFunction :selected').text();

    // Atividades do colaborador
    // Remove as atividades atuais na lista
    $("#inActivity option").each(function() {
        $(this).remove();
    });

    // Adiciona atividades na lista
    Object.keys(activities[função]).forEach(function(val) {
        $("#inActivity").append(`<option>${val}</option>`);
    });

    // Descrição das atividades do colaborador
    // Remove as descrições da lista
    $("#inDescription option").each(function() {
        $(this).remove();
    });
    var atividade = $('#inActivity :selected').text();

    // Adiciona as atividades
    activities[função][atividade].forEach(function(val) {
        $("#inDescription").append(`<option>${val}</option>`);
    });

    // Projetos
    // Remove os projetos atuais (WO da antiga função selecionada)
    $("#inProject option").each(function() {
        $(this).remove();
    });

    // Adicionar projetos na lista
    projetos.forEach(function(p) {
        var cliente = $('#inClient :selected').text();
        if (p.Cliente.value.includes(cliente)) {
            $("#inProject").append(`<option index="${p.ID.value}" client="${clients.indexOf(p.Cliente.value)}" proj="${p.Projeto.value}" wo="${p[função].value}">${p.Descrição.value}</option>`);
        }
    });

    // WO
    getWO();
});

// Atividade -> descrição
$("#inActivity").change(function() {
    var atividade = $('#inActivity :selected').text();
    var função = $('#inFunction :selected').text();
    // Remove as descrições atuais
    $("#inDescription option").each(function() {
        $(this).remove();
    });
    // Adiciona as novas descrições na lista
    activities[função][atividade].forEach(function(val) {
        $("#inDescription").append(`<option>${val}</option>`);
    });
});