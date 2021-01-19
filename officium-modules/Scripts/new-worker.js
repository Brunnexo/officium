() => {
    const chkID = {
        'chk-adm': 'A',
        'chk-eng': 'N',
        'chk-ele': 'E',
        'chk-mec': 'M',
        'chk-prog': 'P',
        'chk-proj': 'R',
        'chk-hourly': 'H',
        'chk-monthly': 'M'
    }

    let input_name = document.getElementById('input-name'),
        input_reg = document.getElementById('input-reg'),
        input_email = document.getElementById('input-email');

    let chk_adm = document.getElementById('chk-adm'),
        chk_eng = document.getElementById('chk-eng'),
        chk_ele = document.getElementById('chk-ele'),
        chk_mec = document.getElementById('chk-mec'),
        chk_proj = document.getElementById('chk-proj'),
        chk_prog = document.getElementById('chk-prog'),
        chk_hourly = document.getElementById('chk-hourly'),
        chk_monthly = document.getElementById('chk-monthly');

    let btn_back = document.getElementById('btn-back'),
        btn_save = document.getElementById('btn-save');

    let journey_query = '',
        functions_query = '';

    chk_adm.onchange = chk_eng.onchange = chk_ele.onchange =
        chk_mec.onchange = chk_proj.onchange = chk_prog.onchange =
        chkFunction;

    chk_monthly.onchange = chk_hourly.onchange = chkJourney;

    btn_back.onclick = () => {
        HTML.load('manage-workers');
    }

    btn_save.onclick = () => {
        functions_query = `${chk_adm.checked ? 'A' : ' '}${chk_eng.checked ? 'N' : ' '}${chk_ele.checked ? 'E' : ' '}${chk_mec.checked ? 'M' : ' '}${chk_prog.checked ? 'P' : ' '}${chk_proj.checked ? 'R' : ' '}`;
        journey_query = `${chk_hourly.checked ? 'H' : chk_monthly.checked ? 'M' : 'H'}`;

        let functions_validated = (functions_query.trim(' ').length > 0),
            name_validated = (input_name.value.trim(' ').length > 0),
            registry_validated = (input_reg.value != '' && Number(input_reg.value) > 0);

        let all_validated = (functions_validated && name_validated && registry_validated);

        let new_worker = false;

        let worker_data = [];

        SQL_DRIVER.select(MSSQL.QueryBuilder('Worker', input_reg.value), data => {
            worker_data.push(data);
        }).then(() => {
            new_worker = !(Object.keys(worker_data).length > 0);

            if (new_worker) {
                ipc.send('show-dialog', {
                    title: (all_validated ? 'Confirmar inserção' : 'Opa!'),
                    type: (all_validated ? 'yes-no' : 'info'),
                    content: (all_validated ? `Confirmar inserção de ${input_name.value}?${chk_adm.checked ? ' A senha administrativa inicial é "1234".' : ''}` : 'Não está faltando alguma informação? O e-mail é opcional!')
                });

                ipc.once('dialog-reply', (evt, arg) => {
                    if (arg && all_validated) {
                        SQL_DRIVER.execute(MSSQL.QueryBuilder('InsertWorker', input_reg.value, input_email.value, input_name.value, functions_query, journey_query))
                            .then(() => {
                                HTML.load('manage-workers');
                                ipc.send('show-dialog', {
                                    title: 'Sucesso!',
                                    type: 'info',
                                    content: `${input_name.value} está no time!`
                                });
                            });
                    }
                });
            } else {
                ipc.send('show-dialog', {
                    title: 'Recebeu uma promoção?',
                    type: 'info',
                    content: `${worker_data[0]['Nome'].value} já existe no banco de dados!`
                });
            }
        });
    }

    function chkJourney(ev) {
        let elmnt = ev.target;
        journey_query = (elmnt.checked ? chkID[elmnt.id] : '');
    }

    function chkFunction(ev) {
        let elmnt = ev.target;
        functions_query += (elmnt.checked ? chkID[elmnt.id] : ' ');
    }
}