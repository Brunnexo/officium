const { ipcRenderer } = require('electron');

const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

window.jQuery = window.$ = require('jquery');

let SQLP = `SELECT [P].[ID], [P].[CC], [P].[Cliente], [P].[Projeto], [P].[Classe], [P].[Descrição], [P].[Equipamento], [P].[OS],
[W].[Administrativo], [W].[Compras], [W].[Eletricista], [W].[Engenheiro], [W].[Ferramentaria], [W].[Mecânico], [W].[Programador], [W].[Projetista]
    FROM [SAT].[dbo].[Projetos] AS [P] RIGHT JOIN [SAT].[dbo].[WOs] AS [W] ON [W].[ID] = [P].[ID] 
        WHERE [P].[Cliente] NOT LIKE '%-%' AND [P].[Cliente] NOT LIKE '%AUTOMAÇÃO%'
            ORDER BY [P].[ID]`;

let SQLSR = `SELECT [SR], [WO], [Descrição], [Solicitante], [Responsável], [Tipo]
    FROM [SAT].[dbo].[SRs]`;

$(document).ready(function() {
    connectSQL(() => {
        selectSQL(SQLP, (projects) => {
            console.log("[SPLASH]: Carregando projetos...");
            log("Carregando projetos...");
            remote.getGlobal("defs").projetos = projects;
            selectSQL(SQLSR, (srs) => {
                console.log("[SPLASH]: Carregando SRs...");
                log("Carregando SRs...");
                remote.getGlobal("defs").srs = srs;
                ipc.send('ready');
            });
        });
    });
});

function log(val) {
    $("#description").html(val);
}