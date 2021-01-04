() => {
    let btn_save = document.getElementById('btn-save'),
        btn_reset = document.getElementById('btn-reset'),
        input_email = document.getElementById('input-email'),
        input_password = document.getElementById('input-password'),
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
        input_password.value = '';
    };

    btn_save.onclick = () => {
        workMan.updateWorker();
    };
}