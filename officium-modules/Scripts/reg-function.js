() => {
    let nextbutton = document.querySelectorAll('[btn-next]')[0],
        backbutton = document.querySelectorAll('[btn-back]')[0];

    let list_functions = document.getElementById('list-functions');

    worker['Funções'].value.split('').forEach(s => {
        if (s != ' ' && s != 'D') {
            let option = document.createElement('option');
            option.value = s;
            option.innerHTML = `${functions[s]}`
            list_functions.appendChild(option);
        }
    });

    backbutton.onclick = () => { HTML.load('reg-type') };
    nextbutton.onclick = () => {
        WorkerLabor.updateInfo({ function: functions[list_functions.selectedOptions[0].value] });
        HTML.load('reg-activity');
    };
}