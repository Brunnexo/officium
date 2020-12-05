import { Chart } from 'chart.js';
import { remote } from 'electron';
import { MSSQL } from './MSSQL';

const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

const borderColor = 'rgba(255, 255, 255, 0.5)';

interface Information {
    title?: string,
    registry?: number | string,
    journey?: 'H' | 'M',
    charts?: {
        history?: string,
        remain?: string,
        total?: string,
        extra?: string
    },
    workTime?: {
        hourly?: number,
        monthly?: number,
        dailyExtra?: number,
        weekendExtra?: number
    },
    infos?: {
        common?: 'registered-common-time',
        extra?: 'registered-extra-time'
    },
    notification?: string;
}

interface Data {
    resume?: Array<object>,
    remain?: Array<object>,
    total?: Array<object>,
    extra?: Array<object>
}

class RenderResume {
    protected info: Information;
    protected MSSQL: MSSQL;

    private data?: Data;
    private renderGraphTotal: Chart;
    private renderGraphExtra: Chart;
    private renderGraphRemain: Chart;

    constructor(value: Information) {
        this.info = value;
        this.data = {
            resume: new Array,
            remain: new Array,
            total: new Array
        }
        this.MSSQL = new MSSQL(remote.getGlobal('parameters')['sql'].config);
    }

    async getData(date: string | Date) {
        let registry = this.info.registry,
            journey = this.info.journey,
            workTime = this.info.workTime,
            resumeData = this.data.resume,
            remainData = this.data.remain,
            remainChart = document.getElementById(this.info.charts.remain),
            totalData = this.data.total,
            totalChart = document.getElementById(this.info.charts.total),
            extraData = this.data.extra,
            extraChart = document.getElementById(this.info.charts.extra),
            history = document.getElementById(this.info.charts.history),
            title = document.getElementById(this.info.title);

        let chartDate = new Date(date);
        let isWeekend = (chartDate.getDay() >= 6);

        resumeData = [];
        remainData = [];
        totalData = [];
        extraData = [];

        await this.MSSQL.select(MSSQL.QueryBuilder('History', registry, date), (data: any) => {
            resumeData.push(data)
        }).then(() => {
            history.style.display = 'none';
            title.style.display = 'none';
            title.innerHTML = `Resumo de ${dateFormat(date)}<hr>`;

            let tbody = document.createElement('tbody');
            if (!(Object.keys(resumeData).length === 0)) {
                let thead = document.createElement('thead');
                let table = document.createElement('table');
                table.classList.add('table');
                table.innerHTML = `
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

                resumeData.forEach((arr: any) => {
                    // Dados da tabela
                    let tr = document.createElement('tr');
                    // Conteúdo HTML da tabela
                    tr.innerHTML = `
                        <th scope="row">${arr.ID.value}</th>
                        <th>${arr.Função.value}</th>
                        <th>${arr.WO.value}</th>
                        <th>${arr.Descrição.value}</th>
                        <th>${arr.Tempo.value}</th>
                        <th>${arr.Extra.value}</th>`;
                    tbody.appendChild(tr);
                });
                table.appendChild(tbody);
                history.innerHTML = '';
                history.appendChild(table);
                history.style.display = 'unset';
                title.style.display = 'unset';
            } else {
                history.innerHTML = '<h5 class="display-4 text-center">Não há registros para mostrar...</h5>';
                history.style.display = 'unset';
                title.style.display = 'unset';
            }
            /*
                Adicionar menu de contexto para apagar linhas
                aqui
            */
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
        });

        await this.MSSQL.select(MSSQL.QueryBuilder('Remain', registry, date), (data: any) => {
            remainData.push(data);
        }).then(() => {
            /*
               Gerar gráfico em pizza para tempo restante
           */
            remainChart.style.display = 'none';

            let times = new Array;
            let projects = new Array;
            let remain = 0;

            // Adiciona os valores a um array
            remainData.forEach(function (d: any) {
                times.push(d.Tempo.value);
                projects.push(d.Projeto.value);
                remain += Number(d.Tempo.value);
            });

            if (journey == 'H')
                remain = ((workTime.hourly - remain) < 0) ? 0 : (workTime.hourly - remain);
            else
                remain = ((workTime.monthly - remain) < 0) ? 0 : (workTime.monthly - remain);


            if (remain != 0) {
                projects.push("RESTANTE");
                times.push(remain);
            }

            // Cores aleatórias
            let colors = randomColors(projects.length);

            this.renderGraphRemain;
            if (!(typeof (this.renderGraphRemain) == 'undefined'))
                this.renderGraphRemain.destroy();

            this.renderGraphRemain = new Chart((remainChart as HTMLCanvasElement), {
                type: 'pie',
                data: {
                    labels: projects,
                    datasets: [
                        {
                            data: times,
                            backgroundColor: colors,
                            borderColor: borderColor,
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
                        text: 'Seu tempo no dia'
                    },
                    tooltips: {
                        mode: "point"
                    }
                }
            });
            remainChart.style.display = 'unset';
        });

        await this.MSSQL.select(MSSQL.QueryBuilder('Total', registry), (data: any) => {
            totalData.push(data);
        }).then(() => {
            /*
               Gerar gráfico em pizza para tempo total
           */
            totalChart.style.display = 'none';

            let dates = [],
                times = [],
                projects = [],
                colors = randomColors(totalData.length);

            totalData.forEach((d: any) => {
                dates.push(d.Data.value);
                times.push(d.Tempo.value);
                projects.push(d.Projeto.value);
            })

            this.renderGraphTotal;

            if (!(typeof (this.renderGraphTotal) === 'undefined')) {
                this.renderGraphTotal.destroy();
            }

            this.renderGraphTotal = new Chart((totalChart as HTMLCanvasElement), {
                type: 'bar',
                data: {
                    labels: dates,
                    datasets: [
                        {
                            data: times,
                            backgroundColor: colors,
                            borderColor: borderColor,
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

            totalChart.style.display = 'unset';
        });

        await this.MSSQL.select(MSSQL.QueryBuilder('RemainExtra', registry, date), (row: any) => {
            extraData.push(row);
        }).then(() => {
            let extraTimes = new Array,
                extraProjects = new Array;

            let extraSumTime = 0,
                extraRemain: number;

            let extraWorkTime = (isWeekend ? this.info.workTime.weekendExtra : this.info.workTime.dailyExtra);

            extraData.forEach((d: any) => {
                extraTimes.push(d.Tempo.value);
                extraProjects.push(d.Projeto.value);
                extraSumTime += Number(d.Tempo.value);
            });

            extraRemain = Math.max(0, (extraWorkTime - extraSumTime));

            if (extraRemain > 0) {
                extraProjects.push('RESTANTE');
                extraTimes.push(extraRemain);
            }

            let extraColors = randomColors(extraProjects.length);

            this.renderGraphExtra;
            if (!(typeof (this.renderGraphExtra) == 'undefined'))
                this.renderGraphExtra.destroy();

            this.renderGraphExtra = new Chart((extraChart as HTMLCanvasElement), {
                type: 'pie',
                data: {
                    labels: extraProjects,
                    datasets: [
                        {
                            data: extraTimes,
                            backgroundColor: extraColors,
                            borderColor: borderColor,
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
                        text: `Seu tempo extra no dia`
                    },
                    tooltips: {
                        mode: "point"
                    }
                }
            });
        });
    }
}

class RenderSR {
    protected info: Information;
    protected MSSQL: MSSQL;
    private data?: Data;

    private renderGraphRemain: Chart;
    private renderGraphRemainExtra: Chart;

    constructor(value: Information) {
        this.info = value;
        this.MSSQL = new MSSQL(remote.getGlobal('parameters')['sql'].config);
        this.data = {
            total: new Array
        }
    }
    async getData(date: string | Date, time: number = 0, returnTime: Function) {
        let chartDate = new Date(date);
        let isWeekend = (chartDate.getDay() >= 6);
        let registry = this.info.registry,
            journey = this.info.journey,
            workTime = (journey == 'H' ? this.info.workTime.hourly : this.info.workTime.monthly);
        let extra = 0,
            sumTime = 0,
            remain = 0;

        this.data.remain = [];
        await this.MSSQL.select(MSSQL.QueryBuilder('Remain', registry, date), (row: any) => {
            this.data.remain.push(row);
        }).then(() => {
            let remainData = this.data.remain;
            let remainChart = document.getElementById(this.info.charts.remain);
            let times = new Array,
                projects = new Array;
            // Adiciona os valores a um array
            remainData.forEach((d: any) => {
                times.push(d.Tempo.value);
                projects.push(d.Projeto.value);
                sumTime += Number(d.Tempo.value);
            });
            remain = Math.max(0, (workTime - sumTime));
            if (time > 0) {
                if (((remain - time) < 0) && (remain > 0)) {
                    projects.push('SEU REGISTRO');
                    times.push(remain);
                    if (typeof(returnTime) === 'function') returnTime({common: remain});
                    extra = !isWeekend ? Math.abs((remain - time)) : time;
                } else if ((remain - time) >= 0) {
                    projects.push('SEU REGISTRO');
                    times.push(time);
                    if (typeof(returnTime) === 'function') returnTime({common: time});
                }
            } else {
                if (typeof(returnTime) === 'function') returnTime({common: 0});
            }
            if (remain > 0 && (remain - time) > 0) {
                projects.push("RESTANTE");
                times.push(remain - time);
            }
            let colors = randomColors(projects.length);
            this.renderGraphRemain;
            if (!(typeof (this.renderGraphRemain) == 'undefined'))
                this.renderGraphRemain.destroy();
            this.renderGraphRemain = new Chart((remainChart as HTMLCanvasElement), {
                type: 'pie',
                data: {
                    labels: projects,
                    datasets: [
                        {
                            data: times,
                            backgroundColor: colors,
                            borderColor: borderColor,
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
                        text: `Tempo do dia (máx. de ${workTime} minutos)`
                    },
                    tooltips: {
                        mode: "point"
                    }
                }
            });
            if (isWeekend) remainChart.style.display = 'none';
        });

        this.data.extra = [];
        await this.MSSQL.select(MSSQL.QueryBuilder('RemainExtra', registry, date), (row: any) => {
            this.data.extra.push(row);
        }).then(() => {
            let remainExtraData = this.data.extra;
            let remainExtraChart = document.getElementById(this.info.charts.extra),
                notification = document.getElementById(this.info.notification);
            function notify(elmnt: HTMLElement, text: string) {
                elmnt.textContent = text;
                elmnt.classList.add('show');
                setTimeout(() => { elmnt.classList.remove('show') }, 3000);
            }
            let extraTimes = new Array,
                extraProjects = new Array;
            let extraSumTime = 0,
                extraRemain: number;
            let extraWorkTime = (isWeekend ? this.info.workTime.weekendExtra : this.info.workTime.dailyExtra);
            remainExtraData.forEach((d: any) => {
                extraTimes.push(d.Tempo.value);
                extraProjects.push(d.Projeto.value);
                extraSumTime += Number(d.Tempo.value);
            });
            extraRemain = Math.max(0, (extraWorkTime - extraSumTime));
            if (extra > 10) {
                if (extra > extraRemain && (extraRemain >= extraWorkTime)) {
                    extraProjects.push('SEU REGISTRO');
                    extraTimes.push(extraRemain);
                    if (typeof(returnTime) === 'function') returnTime({extra: extraRemain});
                    notify(notification, 'Seu registro ultrapassa o tempo de H.E.');
                } else if ((extraRemain - extra) >= 0) {
                    extraProjects.push('SEU REGISTRO');
                    extraTimes.push(extra);
                    if (typeof(returnTime) === 'function') returnTime({extra: extra});
                    notify(notification, 'Seu registro contém tempo de H.E.');
                }
            } else if (extra > 0 && extra <= 10 && extraRemain >= 10) {
                if (typeof(returnTime) === 'function') returnTime({extra: 0});
                notify(notification, 'H.E. menor que 10 minutos é desconsiderada!');
            } else {
                if (typeof(returnTime) === 'function') returnTime({extra: 0});
            }
            if (extra > 0 && extraRemain <= 0) {
                notify(notification, 'Não há tempo restante para H.E.!');
                if (typeof(returnTime) === 'function') returnTime({extra: 0});
            }

            extra = (extra > 10 ? extra : 0);

            if (extraRemain > 0 && (extraRemain - extra) > 0) {
                extraProjects.push("RESTANTE");
                extraTimes.push(extraRemain - extra);
            }

            let extraColors = randomColors(extraProjects.length);
            this.renderGraphRemainExtra;
            if (!(typeof (this.renderGraphRemainExtra) == 'undefined'))
                this.renderGraphRemainExtra.destroy();
            this.renderGraphRemainExtra = new Chart((remainExtraChart as HTMLCanvasElement), {
                type: 'pie',
                data: {
                    labels: extraProjects,
                    datasets: [
                        {
                            data: extraTimes,
                            backgroundColor: extraColors,
                            borderColor: borderColor,
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
                        text: `Tempo extra do dia (máx. de ${extraWorkTime} minutos)`
                    },
                    tooltips: {
                        mode: "point"
                    }
                }
            });
        });
    }
}

function dateFormat(date, separator = '/') {
    let get: string;
    switch (separator) {
        case '/':
            get = date.split('-');
            return `${get[2]}/${get[1]}/${get[0]}`;
        case '-':
            get = date.split('/');
            return `${get[2]}-${get[1]}-${get[0]}`;
    }
}

function randomColors(num) {
    let colors = new Array;
    let getRandomColor = function () {
        var letters = 'ABCDE'.split('');
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

export { RenderResume, RenderSR };

