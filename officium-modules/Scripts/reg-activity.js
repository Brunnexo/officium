() => {
    back_page = 'reg-activity';
    let department = remote.getGlobal('sql').department;

    let list_activities = document.getElementById('list-activities'),
        list_descriptions = document.getElementById('list-descriptions');

    let nextbutton = document.querySelectorAll('[btn-next]')[0],
        backbutton = document.querySelectorAll('[btn-back]')[0];

    let function_activities = remote.getGlobal('activities')['Activities'][WorkerLabor.info.function];

    Object.keys(function_activities).forEach(d => {
        let option = document.createElement('option');
        if (function_activities[d]['Project']) option.setAttribute('project', function_activities[d]['Project']);
        if (function_activities[d]['WO each']) option.setAttribute('wo-each', function_activities[d]['WO each']);
        if (function_activities[d]['WO as']) option.setAttribute('wo-as', function_activities[d]['WO as']);
        option.innerHTML = `${d}`;
        list_activities.appendChild(option);
    });

    list_activities.onchange = () => {
        let activity = list_activities.selectedOptions[0].value;
        list_descriptions.innerHTML = '';
        function_activities[activity]['Descriptions'].forEach(e => {
            let option = document.createElement('option');
            option.innerHTML = e;
            list_descriptions.appendChild(option);
        });
    };

    list_activities.onchange();

    backbutton.onclick = () => { HTML.load('reg-function') };
    nextbutton.onclick = () => {
        let is_project = list_activities.selectedOptions[0].hasAttribute('project'),
            wo_each = list_activities.selectedOptions[0].hasAttribute('wo-each'),
            wo_as = list_activities.selectedOptions[0].getAttribute('wo-as');

        if (is_project) {
            WorkerLabor.updateInfo({
                description: list_descriptions.selectedOptions[0].value
            });
            HTML.load('reg-projects');
        } else {
            if (wo_each) {
                let description = list_descriptions.selectedOptions[0].value;
                let wo = department.filter(d => { return d['Descrição'].value.toUpperCase() == description.toUpperCase() })[0][WorkerLabor['info']['function']]['value'];
                WorkerLabor.updateInfo({
                    description: description,
                    wo: wo
                });
                HTML.load('reg-time');
            } else {
                let wo = department.filter(d => { return d['Descrição'].value.toUpperCase() == wo_as.toUpperCase() })[0][WorkerLabor['info']['function']]['value'];
                WorkerLabor.updateInfo({
                    description: list_descriptions.selectedOptions[0].value,
                    wo: wo
                });
                HTML.load('reg-time');
            }
        }
    };
}