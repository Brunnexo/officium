// Selecionar navegação
$(".active").removeClass("active");
$("#register").addClass("active");

// Alterações de campo
// WO
var inputDelay;
$("#inWO").keyup(function(e) {
    clearTimeout(inputDelay);
    inputDelay = setTimeout(function() {
        let wo = Number($("#inWO").val());
        if (!isNaN(wo) && wo != 0) {
            let found = false;
            srs.forEach(function(s) {
                if (s.WO.value == wo) {
                    $("#inSR").val(s.SR.value);
                    $("#inService").val(s.Descrição.value);

                    $("#srRequester").attr('value', s.Solicitante.value);
                    $("#srResponsible").attr('value', s.Responsável.value);
                    $("#srType").attr('value', s.Tipo.value);

                    $("#btn").removeClass("invisible");

                    found = true;
                }
            });
            if (!found) {
                $("#inSR").val('');
                $("#inService").val('');

                $("#srRequester").removeAttr('value');
                $("#srResponsible").removeAttr('value');
                $("#srType").removeAttr('value');

                $("#btn").addClass("invisible");
            }
        } else {
            $("#inSR").val('');
            $("#inService").val('');

            $("#srRequester").removeAttr('value');
            $("#srResponsible").removeAttr('value');
            $("#srType").removeAttr('value');

            $("#btn").addClass("invisible");
        }
    }, 500);
});

// SR
$("#inSR").keyup(function(e) {
    clearTimeout(inputDelay);
    inputDelay = setTimeout(function() {
        let sr = Number($("#inSR").val());
        if (!isNaN(sr) && sr != 0) {
            let found = false;
            srs.forEach(function(s) {
                if (s.SR.value == sr) {
                    $("#inWO").val(s.WO.value);
                    $("#inService").val(s.Descrição.value);

                    $("#srRequester").attr('value', s.Solicitante.value);
                    $("#srResponsible").attr('value', s.Responsável.value);
                    $("#srType").attr('value', s.Tipo.value);

                    found = true;

                    $("#btn").removeClass("invisible");
                }
            });
            if (!found) {
                $("#inWO").val('');
                $("#inService").val('');

                $("#srRequester").removeAttr('value');
                $("#srResponsible").removeAttr('value');
                $("#srType").removeAttr('value');

                $("#btn").addClass("invisible");
            }
        } else {
            $("#inWO").val('');
            $("#inService").val('');

            $("#srRequester").removeAttr('value');
            $("#srResponsible").removeAttr('value');
            $("#srType").removeAttr('value');

            $("#btn").addClass("invisible");
        }
    }, 500);
});