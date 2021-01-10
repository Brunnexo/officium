() => {
    back_page = 'reg-sr';
    let inputwo = document.getElementById('input-wo'),
        inputsr = document.getElementById('input-sr'),
        inputservice = document.getElementById('input-service'),
        searchbutton = document.getElementById('btn-service-search'),
        nextbutton = document.querySelectorAll('[btn-next]')[0],
        backbutton = document.querySelectorAll('[btn-back]')[0];

    backbutton.onclick = () => { HTML.load('reg-type') };

    searchbutton.onclick = () => {
        ipc.send('sr-search');
        ipc.once('sr-fill', (evt, arg) => {
            inputwo.value = arg.wo;
            inputsr.value = arg.sr;
            inputservice.value = arg.description;
            nextbutton.removeAttribute('disabled');
        });
    };

    nextbutton.onclick = () => {
        WorkerLabor.updateInfo({
            function: `SR ${inputsr.value}`,
            wo: inputwo.value,
            description: inputservice.value,
            date: document.getElementById("date").value,
            workTime: workTime
        });
        HTML.load('reg-time');
    }

    inputwo.onkeyup = function() {
        nextbutton.setAttribute('disabled', '');
        clearTimeout(this.inputDelay);
        this.inputDelay = setTimeout(() => {
            let wo = Number(inputwo.value);
            if (!isNaN(wo) && wo !== 0) {
                let wosearch = srs.filter((val) => { return val.WO.value == wo; })[0];
                if (typeof(wosearch) !== 'undefined') {
                    inputsr.value = wosearch.SR.value;
                    inputservice.value = wosearch.Descrição.value;
                    nextbutton.removeAttribute('disabled');
                } else {
                    inputsr.value = '';
                    inputservice.value = '';
                    nextbutton.setAttribute('disabled', '');
                }
            } else {
                inputsr.value = '';
                inputservice.value = '';
                nextbutton.setAttribute('disabled', '');
            }
        }, 500);
    };

    inputsr.onkeyup = function() {
        nextbutton.setAttribute('disabled', '');
        clearTimeout(this.inputDelay);
        this.inputDelay = setTimeout(() => {
            let sr = Number(inputsr.value);
            if (!isNaN(sr) && sr !== 0) {
                let srsearch = srs.filter((val) => { return val.SR.value == sr; })[0];
                if (typeof(srsearch) !== 'undefined') {
                    inputwo.value = srsearch.WO.value;
                    inputservice.value = srsearch.Descrição.value;
                    if (srsearch.WO.value !== '') nextbutton.removeAttribute('disabled');
                } else {
                    inputwo.value = '';
                    inputservice.value = '';
                    nextbutton.setAttribute('disabled', '');
                }
            } else {
                inputwo.value = '';
                inputservice.value = '';
                nextbutton.setAttribute('disabled', '');
            }
        }, 500);
    };

    inputwo.value = (typeof(WorkerLabor.info.wo) === 'undefined' ? '' : WorkerLabor.info.wo);
    inputwo.onkeyup();
}