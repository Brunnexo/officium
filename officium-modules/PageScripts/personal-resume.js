const infos = {
    title: '#title',
    registry: worker.Registro.value,
    journey: worker.Jornada.value,
    charts: {
        history: 'history',
        remain: 'graphRemain',
        total: 'graphTotal'
    }
}

new PersonalResume(infos)
    .getData('06-11-2020');