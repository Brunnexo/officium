const { remote } = require("electron");

() => {
    let btn_save = document.getElementById('btn-save'),
        btn_reset = document.getElementById('btn-reset'),
        btn_erase = document.getElementById('btn-erase'),
        chk_adm = document.getElementById('chk-adm'),
        input_email = document.getElementById('input-email'),
        select = document.getElementById('list-workers');

    const workMan = new WorkerManager({
        list: 'list-workers',
        name: 'input-name',
        registry: 'input-regs',
        email: 'input-email',
        password: 'input-password',
        status: 'loading',
        switches: {
            journey: {
                hourly: 'chk-hourly',
                monthly: 'chk-monthly'
            },
            functions: {
                adm: 'chk-adm',
                eng: 'chk-eng',
                ele: 'chk-ele',
                mec: 'chk-mec',
                prog: 'chk-prog',
                proj: 'chk-proj'
            }
        },
        chart: 'adm-delay-chart'
    });
    workMan.getList();

    btn_reset.onclick = () => {
        select.onchange();
    };

    btn_save.onclick = () => {
            ipc.send('show-dialog', {
                        title: `${worker['Registro'].value == select.selectedOptions[0].getAttribute('reg') ? 'Cuidado com a bagunça!' : 'Confirmação de alteração'}`,
                        type: 'yes-no',
                        content: `${worker['Registro'].value == select.selectedOptions[0].getAttribute('reg') ? 'Você está alterando <b>seus próprios dados!</b>' : `O colaborador ${select.selectedOptions[0].getAttribute('name')} terá seus dados alterados.`} 
            ${chk_adm.checked ? "A função administrativa requer senha para entrar e caso não tenha uma, ela será '1234'." : ''} Confirmar?`
        });

        ipc.once('dialog-reply', (evt, arg) => {
            if (arg) {
                workMan.updateWorker()
                    .then(() => {
                        ipc.send('show-dialog', {
                            title: 'Sucesso!',
                            type: 'info',
                            content: `Alteração bem-sucedida!`
                        })
                    })
                    .catch(() => {
                        ipc.send('show-dialog', {
                            title: 'Opa!',
                            type: 'info',
                            content: `Problema ao alterar as informações!`
                        })
                    });
            }
        });
    };

    btn_erase.onclick = () => {
        if (worker['Registro'].value == select.selectedOptions[0].getAttribute('reg')) {
            ipc.send('show-dialog', {
                title: 'Pediu a conta?',
                type: 'info',
                content: `Infelizmente (ou <i>felizmente</i>) não é possível se remover do banco de dados!`
            });
        } else {
            ipc.send('show-dialog', {
                title: 'Confirmação de exclusão',
                type: 'yes-no',
                content: `Os dados e registros de ${select.selectedOptions[0].getAttribute('name')} serão <b>totalmente apagados</b>, sem possibilidade de reversão! Confirmar?`
            });
            ipc.once('dialog-reply', (evt, arg) => {
                if (arg) {
                    workMan.eraseWorker(select.selectedOptions[0].getAttribute('reg'))
                        .then(() => {
                            ipc.send('show-dialog', {
                                title: 'Adeus!',
                                type: 'info',
                                content: `${select.selectedOptions[0].getAttribute('name')} sumiu do banco de dados!`
                            });
                            ipc.once('dialog-reply', () => { workMan.getList() });
                        })
                        .catch(() => {
                            ipc.send('show-dialog', {
                                title: 'Opa!',
                                type: 'info',
                                content: `${select.selectedOptions[0].getAttribute('name')} é insistente! Contate o desenvolvedor!`
                            })
                        });
                }
            });
        }
    }
}