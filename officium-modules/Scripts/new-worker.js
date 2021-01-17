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

    chk_monthly.onchange = chk

    btn_save.onclick = () => {
        ipc.send('show-dialog', {
            title: ``,
            type: 'yes-no',
            content: ``
        });
    }

    btn_back.onclick = () => {
        HTML.load('manage-workers');
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