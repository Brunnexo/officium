const $ = require('jquery');
const fs = require('fs');
const { remote } = require('electron');

module.exports.Pages = class {
    constructor() {
        this.General = {
            data: remote.getGlobal('sql').general,
            loadScript: () => {
                // Preenche as funções do colaborador
                var functionNames = {
                    "E": "Eletricista",
                    "M": "Mecânico",
                    "P": "Programador",
                    "R": "Projetista",
                    "N": "Engenheiro",
                    "A": "Administrativo"
                }
                WORKER.functions.split('').forEach((f) => {
                    if (typeof(functionNames[f]) != "undefined")
                        $('#register-general-function').append(`<option index="${f}">${functionNames[f]}</option>`);
                });
                var selectedFunction = $('#register-general-function :selected').text();

                // Preenche a lista de projetos
                this.General.data.forEach((g) => {
                    $('#register-general-project').append(`
                        <option
                            index="${g.ID.value}"
                            wo="${g[selectedFunction].value}">
                            ${g.Descrição.value}
                        </option>`);
                });

                // Preenche o WO
                var selectedWO = $('#register-general-project :selected').attr('wo');
                $('#register-general-wo').val(selectedWO == 'null' ? '' : selectedWO);

                var inputDelay;

                // Alteração de WO
                $('#register-general-wo').keyup((e) => {
                    clearTimeout(inputDelay);
                    inputDelay = setTimeout(() => {
                        selectedWO = $('#register-general-wo').val();
                        $(`#register-general-project option[wo=${selectedWO}`).prop('selected', true);
                    });
                });

                // Alteração de projeto
                $('#register-general-project').change(() => {
                    selectedWO = $('#register-general-project :selected').attr('wo');
                    $('#register-general-wo').val(selectedWO == 'null' ? '' : selectedWO);
                });

                // Alteração da função
                $('#register-general-function').change(() => {
                    selectedFunction = $('#register-general-function :selected').text();
                    $('#register-general-project option').remove();
                    this.General.data.forEach((g) => {
                        $('#register-general-project').append(`
                        <option index="${g.ID.value}"
                        wo="${g[selectedFunction].value}">
                        ${g.Descrição.value}</option>`);
                    });
                    selectedWO = $('#register-general-project :selected').attr('wo');
                    $('#register-general-wo').val(selectedWO == 'null' ? '' : selectedWO);
                });
            }
        };

        this.Projects = {
            // Preenche as funções do colaborador
            data: remote.getGlobal('sql').projects,
            loadScript: () => {
                // Preenche as funções do colaborador
                var functionNames = {
                    "E": "Eletricista",
                    "M": "Mecânico",
                    "P": "Programador",
                    "R": "Projetista",
                    "N": "Engenheiro",
                    "A": "Administrativo"
                }
                WORKER.functions.split('').forEach((f) => {
                    if (typeof(functionNames[f]) != "undefined")
                        $('#register-project-function').append(`<option index="${f}">${functionNames[f]}</option>`);
                });
                var selectedFunction = $('#register-project-function :selected').text();

                // Atividades do colaborador
                Object.keys(remote.getGlobal('data').activities[selectedFunction]).forEach((f) => {
                    $('#register-project-activity').append(`<option>${f}</option>`);
                });
                var selectedActivity = $('#register-project-activity :selected').text();
                remote.getGlobal('data').activities[selectedFunction][selectedActivity].forEach((a) => {
                    $('#register-project-description').append(`<option>${a}</option>`);
                });

                // Clientes
                remote.getGlobal('data').clients.forEach((c) => {
                    $("#register-project-client").append(`<option>${c}</option>`);
                });
                var selectedClient = $("#register-project-client").val();

                // Projetos
                this.Projects.data.forEach((p) => {
                    if (p.Cliente.value.includes(selectedClient))
                        $("#register-project-project").append(`
                            <option
                                index="${p.ID.value}"
                                client="${remote.getGlobal('data').clients.indexOf(p.Cliente.value)}"
                                proj="${p.Projeto.value}"
                                wo="${p[selectedFunction].value}">
                                ${p.Descrição.value}
                            </option>`);
                });

                // WO
                var selectedWo = $("#register-project-project :selected").attr('wo');
                $('#register-project-wo').val(
                    selectedWo == 'null' || typeof(selectedWo) == 'undefined' ? '' : selectedWo
                )
            }
        };
    }
}