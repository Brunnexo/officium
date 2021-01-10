() => {
    let backbutton = document.querySelectorAll('[btn-back]')[0];
    backbutton.onclick = () => { HTML.load('reg-activity') };
    back_page = 'reg-projects';

    document.querySelectorAll('.badge-image').forEach(e => {
        e.onclick = () => {
            ipc.once('reg-time', (evt, arg) => {
                WorkerLabor.updateInfo(arg);
                HTML.load('reg-time');
            });
            ipc.send('select-project', { badge: e.id, info: WorkerLabor.getLabor() });
        };
    });

    document.getElementById('btn-others').onclick = () => {
        ipc.send('select-project', { badge: 'common', info: WorkerLabor.getLabor() });
    }
}