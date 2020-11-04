// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

// Extensões internas
const { ColorMode } = require('../../officium-modules/colormode');
const { CLoader } = require('../../officium-modules/pageloader');

// Dependências
window.jQuery = window.$ = require('jquery');
require('bootstrap');

// Instâncias
const HTML = new CLoader();
const worker = remote.getGlobal('data').worker;
const { PersonalResume } = require('../../officium-modules/ws-pages');


// Variáveis remotas globais
const srs = remote.getGlobal('sql').srs;

// Funções ao carregar a página
$(document).ready(function() {
    // Esquema de cores
    ColorMode(localStorage.getItem('colorMode'));
    // Nome do colaborador
    $('#nav-name').text(worker.Nome.value);
    // Carrega data atual
    document.getElementById("date").valueAsDate = new Date();
    // Carrega inicialmente o resumo pessoal
    Pages.load('personal-resume');
});

// Alteração de data
$("#date").change(function() {
    // Função ao alterar data
    clearTimeout(this.inputDelay);
    this.inputDelay = setTimeout(function() {
        Pages.update();
    }, 500);
});

// Navegar para o resumo
$('#nav-resume').click(() => {
    Pages.load('personal-resume');
    $('.active').removeClass('active');
    $('#nav-resume').addClass('active');
});

// Navegar para o registro
$('#nav-reg').click(() => {
    Pages.load('reg-service');
});

// Abrir preferências
$('#prefs').click(() => {
    ipc.send('open-preferences');
});

// Voltar ao início
$('#home').click(() => {
    ipc.send('back-main');
});

// Botões de janela
$('.close-btn').click(() => {
    remote.getCurrentWindow().close();
});

// Páginas modulares
const Pages = {
    Resume: {
        Personal: new PersonalResume({
            title: '#title',
            registry: worker.Registro.value,
            journey: worker.Jornada.value,
            charts: {
                history: '#history',
                remain: '#graphRemain',
                total: '#graphTotal'
            }
        })
    },
    lastPage: {},
    load: (pageName) => {
        switch (pageName) {
            // Carregar resumo pessoal
            case 'personal-resume':
                changeListener.disconnect();
                HTML.c_load(pageName, () => {
                    Pages.Resume.Personal.getData(
                        document.getElementById('date').value);
                });
                Pages.lastPage = {
                    name: pageName,
                    updateable: true
                };
                break;
            case 'reg-service':
                changeListener.observe(document, {
                    attributes: false,
                    childList: true,
                    subtree: true
                });
                HTML.c_load(pageName);
                Pages.lastPage = {
                    name: pageName,
                    updateable: false
                };
                break;
        }
    },
    update: () => {
        if (Pages.lastPage.updateable) {
            changeListener.disconnect();
            Pages.load(Pages.lastPage.name);
        }
    }
};

// Observador de alterações
const changeListener = new MutationObserver(() => {
    // Botões de seleção
    $('#btn-sr').click(() => {
        HTML.r_load('reg-sr');
    });

    // Botão voltar
    $('[btn-back]').click((e) => {
        HTML.r_previous();
    });

    // Barra de índice
    $('.indexbar .pop').click((e) => {
        HTML.r_goto(
            Number($(e.currentTarget).attr('index'))
        );
    });


    /* Página de SR
     *
     *
     */

    // Alterações de campo
    // WO
    $("#input-wo").keyup(function(e) {
        clearTimeout(this.inputDelay);
        this.inputDelay = setTimeout(function() {
            let wo = Number($("#input-wo").val());
            if (!isNaN(wo) && wo != 0) {
                let found = false;
                srs.forEach(function(s) {
                    if (s.WO.value == wo) {
                        $("#input-sr").val(s.SR.value);
                        $("#input-service").val(s.Descrição.value);
                        $(".btn-next").show();

                        found = true;
                    }
                });
                if (!found) {
                    $("#input-sr").val('');
                    $("#input-service").val('');
                    $(".btn-next").hide();
                }
            } else {
                $("#input-sr").val('');
                $("#input-service").val('');
                $(".btn-next").hide();
            }
        }, 500);
    });

    // SR
    $("#input-sr").keyup(function(e) {
        clearTimeout(this.inputDelay);
        this.inputDelay = setTimeout(function() {
            let sr = Number($("#input-sr").val());
            if (!isNaN(sr) && sr != 0) {
                let found = false;
                srs.forEach(function(s) {
                    if (s.SR.value == sr) {
                        $("#input-wo").val(s.WO.value);
                        $("#input-service").val(s.Descrição.value);
                        $(".btn-next").show();
                        found = true;
                    }
                });
                if (!found) {
                    $("#input-wo").val('');
                    $("#input-service").val('');
                    $(".btn-next").hide();
                }
            } else {
                $("#input-wo").val(s.WO.value);
                $("#input-service").val(s.Descrição.value);
                $(".btn-next").hide();
            }
        }, 500);
    });
});