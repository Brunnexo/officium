const { ipcRenderer } = require('electron');

const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

window.jQuery = window.$ = require('jquery');

let QueryProjetos = `SELECT [P].[ID], [P].[CC], [P].[Cliente], [P].[Projeto], [P].[Classe], [P].[Descrição], [P].[Equipamento], [P].[OS],
[W].[Administrativo], [W].[Compras], [W].[Eletricista], [W].[Engenheiro], [W].[Ferramentaria], [W].[Mecânico], [W].[Programador], [W].[Projetista]
    FROM [SAT].[dbo].[Projetos] AS [P] RIGHT JOIN [SAT].[dbo].[WOs] AS [W] ON [W].[ID] = [P].[ID] 
        WHERE [P].[Cliente] NOT LIKE '%-%' AND [P].[Cliente] NOT LIKE '%AUTOMAÇÃO%'
            ORDER BY [P].[ID]`;

let QuerySRs = `SELECT [SR], [WO], [Descrição], [Solicitante], [Responsável], [Tipo]
    FROM [SAT].[dbo].[SRs]`;

$(document).ready(function() {
    connectSQL(() => {
        selectSQL(QueryProjetos, (projects) => {
            log("Carregando projetos...");
            remote.getGlobal("defs").projetos = projects;
            selectSQL(QuerySRs, (srs) => {
                log("Carregando SRs...");
                remote.getGlobal("defs").srs = srs;
                ipc.send('ready');
            });
        });
    });
});

function log(val) {
    console.log(`[SPLASH]: ${val}`);
    $("#description").html(val);
}