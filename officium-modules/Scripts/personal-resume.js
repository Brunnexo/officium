() => {
    document.querySelectorAll('.active').forEach((elmnt) => {
        elmnt.classList.remove('active');
    });
    document.getElementById('nav-resume').classList.add('active');

    charts.updateInfo({
        title: 'title',
        historyTable: 'history-table',
        laborChart: 'labor-chart',
        totalChart: 'total-chart',
        extraChart: 'extra-chart',
    });
    WorkerLabor.getData();
};