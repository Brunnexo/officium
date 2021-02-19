() => {
    document.querySelectorAll('.active').forEach((elmnt) => {
        elmnt.classList.remove('active');
    });
    document.getElementById('nav-reg').classList.add('active');

    WorkerLabor.clear();

    let btn_sr = document.getElementById('btn-sr'),
        btn_activities = document.getElementById('btn-activities');

    btn_sr.onclick = () => {
        HTML.load('reg-sr');
    }
    btn_activities.onclick = () => {
        HTML.load('reg-function');
    }
}