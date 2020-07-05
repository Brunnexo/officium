// Caminhos de imagens de logo das clientes
var clientLogos = {
    "GM": `${__dirname}/../res/images/generalmotors.png`,
    "VW": `${__dirname}/../res/images/vw.png`,
    "FORD": `${__dirname}/../res/images/ford.png`,
    "FCA": `${__dirname}/../res/images/fca.png`,
    "RENAULT": `${__dirname}/../res/images/renault.png`,
    "HONDA": `${__dirname}/../res/images/honda.png`,
    "NISSAN": `${__dirname}/../res/images/nissan.png`,
    "TOYOTA": `${__dirname}/../res/images/toyota.png`,
    "HYUNDAI": `${__dirname}/../res/images/hyundai.png`,
    "MERCEDES": `${__dirname}/../res/images/mercedes.png`,
    "PSA": `${__dirname}/../res/images/psa.png`,
    "MAN": `${__dirname}/../res/images/man.png`
};

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

var função = $('#inFunction').val();

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
    var cliente = $('#inClient').val();
    if (p.Cliente.value.includes(cliente)) {
        $("#inProject").append(`<option index="${p.ID.value}" client="${clients.indexOf(p.Cliente.value)}" proj="${p.Projeto.value}" wo="${p[função].value}">${p.Descrição.value}</option>`);
    }
});

// WO
getWO();

$(".functionSelected").hide()
    .html(`<h5>${função}</h5>`)
    .fadeIn('slow');

$(".descriptionSelected").hide()
    .html(`<h5>${$("#inDescription").val()}</h5>`)
    .fadeIn('slow');

$(".clientLogo").hide()
    .html(`<img src="${clientLogos[$("#inClient").val()]}" alt="${$("#inClient").val()}" width="128" height="128">`)
    .fadeIn('slow');

$(".projectSelected").hide()
    .html(`<h6>${$("#inProject").val()}</h6>`)
    .fadeIn('slow');

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

                $(".woSelected").hide()
                    .html(`<h5>${wo}</h5>`)
                    .fadeIn('slow');

                $(".clientLogo").hide()
                    .html(`<img src="${clientLogos[$("#inClient").val()]}" alt="${$("#inClient").val()}" width="128" height="128">`)
                    .fadeIn('slow');
            } else {
                $(".woSelected").hide()
                    .html(`<h5 class="text-danger">WO inexistente</h5>`)
                    .fadeIn('slow');
            }
        }
    }, 500);
});

// Projeto -> WO
$("#inProject").change(function() {
    getWO();

    $(".projectSelected").hide()
        .html(`<h6>${$("#inProject").val()}</h6>`)
        .fadeIn('slow');
});

// Cliente -> Projeto && WO
$("#inClient").change(function() {
    $(".clientLogo").hide()
        .html(`<img src="${clientLogos[$("#inClient").val()]}" alt="${$("#inClient").val()}" width="128" height="128">`)
        .fadeIn('slow');

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

    if ($("#inProject option").length == 0) {
        $(".projectSelected").hide()
            .html(`<h6>Não há projetos</h6>`)
            .fadeIn('slow');
    } else {
        $(".projectSelected").hide()
            .html(`<h6>${$("#inProject").val()}</h6>`)
            .fadeIn('slow');
    }


    // WO do projeto selecionado
    getWO();
});

// Função -> tudo
$("#inFunction").change(function() {
    var função = $('#inFunction').val();

    $(".functionSelected").hide()
        .html(`<h5>${função}</h5>`)
        .fadeIn('slow');

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

    $(".descriptionSelected").hide()
        .html(`<h5>${$("#inDescription").val()}</h5>`)
        .fadeIn('slow');

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

    $(".descriptionSelected").hide()
        .html(`<h5>${$("#inDescription").val()}</h5>`)
        .fadeIn('slow');
});

// Descrição
$("#inDescription").change(function() {
    $(".descriptionSelected").hide()
        .html(`<h5>${$("#inDescription").val()}</h5>`)
        .fadeIn('slow');
});

// Retorna WO ou espaço em branco
function getWO() {
    // WO
    var wo = $("#inProject :selected").attr('wo');
    if (wo == 'null' || typeof(wo) == 'undefined') {
        $("#inWO").val('');

        $(".woSelected").hide()
            .html(`<h5 class="text-danger">Sem WO</h5>`)
            .fadeIn('slow');

        showErrorLog("Não há WO deste projeto para esta função!");
    } else {
        $("#inWO").val(wo);

        $(".woSelected").hide()
            .html(`<h5>${wo}</h5>`)
            .fadeIn('slow');
    }
}