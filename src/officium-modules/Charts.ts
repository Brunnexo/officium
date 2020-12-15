import { Chart } from 'chart.js';
import { remote } from 'electron';
import { Labor } from './Labor';
import { MSSQL } from './MSSQL';

const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

const dateFormat = (d: string) => `${d.split('-')[2]}/${d.split('-')[1]}/${d.split('-')[0]}`;

interface Components {
    title?: string,
    historyTable?: string,
    laborChart?: string,
    totalChart?: string,
    extraChart?: string,
    notification?: string
}

class Charts {
    private components: Components;
    protected MSSQL: MSSQL;

    protected renderChartTotal: Chart;
    protected renderChartLabor: Chart;
    protected renderChartExtra: Chart;
    
    constructor(comp: Components) {
        this.components = comp;
        this.MSSQL = new MSSQL();
    }

    updateInfo(comp: Components) {
        Object.keys(comp)
            .forEach((val) => {
                this.components[val] = comp[val];
        });
    }

    render(data: Labor) {
        let _components = this.components,
            _data = data.data,
            _remainTime = data.remainTime,
            _laborTime = data.laborTime;

        let elements = {
            title: document.getElementById(_components.title),
            historyTable: document.getElementById(_components.historyTable),
            laborChart: document.getElementById(_components.laborChart),
            totalChart: document.getElementById(_components.totalChart),
            extraChart: document.getElementById(_components.extraChart),
            notification: document.getElementById(_components.notification)
        }
        
        // Tabela de Resumo
        if (elements.historyTable != null && elements.title != null) {
            elements.title.innerHTML = `Resumo de ${dateFormat(data.date)}`;
            elements.historyTable.innerHTML = '';

            let tbody = document.createElement('tbody');
            if (!(Object.keys(_data.history).length === 0)) {
                let thead = document.createElement('thead'),
                    table = document.createElement('table');
                
                table.classList.add('table');

                thead.innerHTML = `
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Função</th>
                            <th scope="col">WO</th>
                            <th scope="col">Descrição</th>
                            <th scope="col">Tempo</th>
                            <th scope="col">Extra</th>
                        </tr>
                    </thead>`;

                table.appendChild(thead);

                _data.history.forEach((data: any) => {
                    let tr = document.createElement('tr');
                    tr.innerHTML = `
                        <th scope="row">${data['ID'].value}</th>
                        <th>${data['Função'].value}</th>
                        <th>${data['WO'].value}</th>
                        <th>${data['Descrição'].value}</th>
                        <th>${data['Tempo'].value}</th>
                        <th>${data['Extra'].value}</th>`;
                    tbody.appendChild(tr);
                });

                table.appendChild(tbody);
                elements.historyTable.appendChild(table);

                var id: number,
                elmnt: HTMLElement;
                // Menu
                const menu = new Menu();
                const menuItem = new MenuItem({
                    label: 'Apagar',
                    click: () => {
                        this.MSSQL.execute(`DELETE FROM [Relatórios] WHERE [ID] = ${id}`).then(() => {
                            elmnt.style.transitionDuration = '1s';
                            elmnt.style.opacity = '0';
                            setTimeout(() => { elmnt.style.display = 'none' }, 1000);
                        });
                    }
                });
                menu.append(menuItem);
                // Menu de contexto
                tbody.oncontextmenu = (ev: MouseEvent) => {
                    ev.preventDefault();
                    elmnt = (ev.target as HTMLElement).parentElement;
                    id = Number(elmnt.getElementsByTagName("th")[0].innerHTML);
                    menu.popup();
                }
            } else elements.historyTable.innerHTML = '<h5 class="display-4 text-center">Não há registros para mostrar...</h5>';
        }

        // Gráfico de tempo apontado
        if (elements.laborChart != null) {
            let splitData = {
                times: [],
                projects: []
            }

            _data.labor.forEach((data: any) => {
                if (data.Extra.value == 'NÃO') {
                    splitData.times.push(data.Tempo.value);
                    splitData.projects.push(data.Projeto.value);
                }
            });

            if (_remainTime.common > 0) {
                splitData.times.push(_remainTime.common);
                splitData.projects.push('RESTANTE');
            }

            if (typeof(_laborTime) !== 'undefined') {
                if (_laborTime.common > 0) {
                    splitData.times.push(_laborTime.common);
                    splitData.projects.push('SEU REGISTRO');
                }
            }

            let colors = randomColors(splitData.projects.length);

            this.renderChartLabor;
            if (!(typeof (this.renderChartLabor) == 'undefined'))
                this.renderChartLabor.destroy();

            this.renderChartLabor = new Chart((elements.laborChart as HTMLCanvasElement), {
                type: 'pie',
                data: {
                    labels: splitData.projects,
                    datasets: [
                        {
                            data: splitData.times,
                            backgroundColor: colors,
                            borderColor: colors,
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: false,
                    aspectRatio: 1,
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Tempo registrado'
                    },
                    tooltips: {
                        mode: "point"
                    }
                }
            });
        }
        
        // Gráfico de tempo extra
        if (elements.extraChart != null) {
            let splitData = {
                times: [],
                projects: []
            }

            _data.labor.forEach((data: any) => {
                if (data.Extra.value == 'SIM') {
                    splitData.times.push(data.Tempo.value);
                    splitData.projects.push(data.Projeto.value);
                }
            });

            if(_remainTime.extra > 0) {
                splitData.times.push(_remainTime.extra);
                splitData.projects.push('RESTANTE');
            }

            if (typeof(_laborTime) !== 'undefined') {
                if (_laborTime.extra > 0) {
                    splitData.times.push(_laborTime.extra);
                    splitData.projects.push('SEU REGISTRO');
                }
            }

            let colors = randomColors(splitData.projects.length);

            this.renderChartExtra;
            if (!(typeof (this.renderChartExtra) == 'undefined'))
                this.renderChartExtra.destroy();

            this.renderChartExtra = new Chart((elements.extraChart as HTMLCanvasElement), {
                type: 'pie',
                data: {
                    labels: splitData.projects,
                    datasets: [
                        {
                            data: splitData.times,
                            backgroundColor: colors,
                            borderColor: colors,
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: false,
                    aspectRatio: 1,
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Tempo extra'
                    },
                    tooltips: {
                        mode: "point"
                    }
                }
            });
        }

        // Gráfico de barras de total apontado
        if (elements.totalChart != null) {
             let splitData = {
                 dates: [],
                 times: [],
                 projects: [],
                 colors: randomColors(_data.total.length)
             }

             _data.total.forEach((data: any) => {
                splitData.dates.push(data.Data.value);
                splitData.times.push(data.Tempo.value);
                splitData.projects.push(data.Projeto.value);
             });

             this.renderChartTotal;

            if (!(typeof (this.renderChartTotal) === 'undefined')) {
                this.renderChartTotal.destroy();
            }

            this.renderChartTotal = new Chart((elements.totalChart as HTMLCanvasElement), {
                type: 'bar',
                data: {
                    labels: splitData.dates,
                    datasets: [
                        {
                            data: splitData.times,
                            backgroundColor: splitData.colors,
                            borderColor: splitData.colors,
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    maintainAspectRatio: false,
                    responsive: false,
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Últimos 15 registros'
                    }
                }      
            });
        }
    }
}

function randomColors(num) {
    let colors = new Array;
    let getRandomColor = function () {
        var letters = 'ABC'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * letters.length)];
        }
        return color;
    }

    for (let i = 0; i < num; i++) {
        colors.push(getRandomColor());
    }
    return colors;
}

export { Charts };

