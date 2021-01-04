() => {
    charts.updateInfo({
        title: 'title',
        historyTable: 'history-table',
        laborChart: 'labor-chart',
        totalChart: 'total-chart',
        extraChart: 'extra-chart',
    });
    WorkerLabor.getData();
};