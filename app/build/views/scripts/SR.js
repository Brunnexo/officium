// Alterações de campo
// WO
$("#inWO").keyup(function(e) {
    clearTimeout(inputDelay);
    var inputDelay = setTimeout(function() {
        var wo = $("#inWO").val();
        if (!(isNaN(Number(wo)))) {
            srs.forEach(function(s) {
                if (s.WO.value == wo) {
                    $("#inSR").val(s.SR.value);
                    $("#inService").val(s.Descrição.value);
                }
            });
        } else {
            $("#inSR").val('');
            $("#inService").val('');
        }
    }, 500);
});

// SR
$("#inSR").keyup(function(e) {
    clearTimeout(inputDelay);
    var inputDelay = setTimeout(function() {
        var sr = $("#inSR").val();
        if (!(isNaN(Number(sr)))) {
            srs.forEach(function(s) {
                if (s.SR.value == sr) {
                    $("#inWO").val(s.WO.value);
                    $("#inService").val(s.Descrição.value);
                }
            });
        }
    }, 500);
});