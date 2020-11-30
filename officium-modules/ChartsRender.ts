import { Chart } from 'chart.js';
import { remote } from 'electron';
import { MSSQL } from './MSSQL';

const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

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
    }
}

interface Data {
    resume?: Array <object>,
    remain?: Array <object>,
    total?: Array <object>,
    extra?: Array <object>
}

class RenderResume {
    protected info : Information;
    protected MSSQL : MSSQL;
    
    private data?: Data;
    private renderGraphTotal: Chart;
    private renderGraphRemain: Chart;

    constructor(value : Information) {
        this.info = value;

        this.data = {
            resume: new Array,
            remain: new Array,
            total: new Array
        }

        this.MSSQL = new MSSQL(remote.getGlobal('sql').config);
    }

    async getData(date : string | Date) {
        let registry = this.info.registry,
            journey = this.info.journey,
            workTime = this.info.workTime,
            resumeData = this.data.resume,
            remainData = this.data.remain,
            remainChart = document.getElementById(this.info.charts.remain),
            totalData = this.data.total,
            totalChart = document.getElementById(this.info.charts.total),
            history = document.getElementById(this.info.charts.history),
            title = document.getElementById(this.info.title);

        resumeData = [];
        remainData = [];
        totalData = [];

        await this.MSSQL.select(MSSQL.QueryBuilder('History', registry, date), (data : any) => {
            resumeData.push(data)
        }).then(() => {
            history.style.display = 'none';
            title.style.display = 'none';
            title.innerHTML = `Resumo de ${
                dateFormat(date)
            }
                                <hr>`;
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

                resumeData.forEach((arr : any) => {
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
                        setTimeout(() => {elmnt.style.display = 'none'}, 1000);
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
            if (!(typeof(this.renderGraphRemain) == 'undefined')) 
                this.renderGraphRemain.destroy();

            this.renderGraphRemain = new Chart((remainChart as HTMLCanvasElement), {
                type: 'pie',
                data: {
                    labels: projects,
                    datasets: [
                        {
                            data: times,
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
            
            if (!(typeof(this.renderGraphTotal) === 'undefined')) {
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
                            borderColor: colors,
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
    }
}

class RenderSR {
    protected info: Information;
    protected MSSQL : MSSQL;
    private data?: Data;

    private renderGraphRemain: Chart;
    private renderGraphRemainExtra: Chart;

    constructor(value: Information) {
        this.info = value;
        this.MSSQL = new MSSQL(remote.getGlobal('sql').config);
        this.data = {
            total: new Array
        }
    }
    async getData(date: string | Date, time: number = 0) {
        let chartDate = new Date(date);
        let isWeekend = (chartDate.getDay() >= 6);
        
        let registry = this.info.registry,
            journey = this.info.journey,
            workTime = (journey == 'H' ? this.info.workTime.hourly : this.info.workTime.monthly);

        let extra = 0;

            this.data.remain = [];
            await this.MSSQL.select(MSSQL.QueryBuilder('Remain', registry, date), (row: any) => {
                this.data.remain.push(row);
            }).then(() => {
                let remainData = this.data.remain;
                let remainChart = document.getElementById(this.info.charts.remain);

                let times = new Array,
                    projects = new Array;

                let sumTime = 0,
                    remain: number;
    
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
                        extra = !isWeekend ? Math.abs((remain - time)) : time;
                    } else if ((remain - time) >= 0) {
                        projects.push('SEU REGISTRO');
                        times.push(time);
                    }
                }

                if (remain > 0 && (remain - time) > 0) {
                    projects.push("RESTANTE");
                    times.push(remain - time);
                }

                let colors = randomColors(projects.length);

                this.renderGraphRemain;
                if (!(typeof(this.renderGraphRemain) == 'undefined')) 
                    this.renderGraphRemain.destroy();
                   remainChart 
                this.renderGraphRemain = new Chart((remainChart as  HTMLCanvasElement), {
                    type: 'pie',
                    data: {
                        labels: projects,
                        datasets: [
                            {
                                data: times,
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
            }).then(() =>{
                let remainExtraData = this.data.extra;
                let remainExtraChart = document.getElementById(this.info.charts.extra);
                
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

                if (extra > 0) {
                    if (extra > extraRemain && (extraRemain >= extraWorkTime)) {
                        extraProjects.push('SEU REGISTRO');
                        extraTimes.push(extraRemain);
                    } else if ((extraRemain - extra) >= 0) {
                        extraProjects.push('SEU REGISTRO');
                        extraTimes.push(extra);
                    }
                }

                if (extraRemain > 0 && (extraRemain - extra) > 0) {
                    extraProjects.push("RESTANTE");
                    extraTimes.push(extraRemain - extra);
                }

                let extraColors = randomColors(extraProjects.length);

                this.renderGraphRemainExtra;
                
                if (!(typeof(this.renderGraphRemainExtra) == 'undefined')) 
                    this.renderGraphRemainExtra.destroy();
                    
                this.renderGraphRemainExtra = new Chart((remainExtraChart as  HTMLCanvasElement), {
                    type: 'pie',
                    data: {
                        labels: extraProjects,
                        datasets: [
                            {
                                data: extraTimes,
                                backgroundColor: extraColors,
                                borderColor: extraColors,
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

/* function randomColors(num) {
    let colors = new Array;
    this.randDarkColor = function () {
        var lum = -0.25;
        var hex = String('#' + Math.random().toString(16).slice(2, 8).toUpperCase()).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        var rgb = "#",
            c,
            i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i * 2, 2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00" + c).substr(c.length);
        }
        return rgb;
    }

    for (let i = 0; i < num; i ++) {
        colors.push(this.randDarkColor());
    }
    return colors;
}*/

function randomColors(num) {
    let colors = [];

    // Math.random() * (max - min) + min;

    let diff = 0;
    for (let i = 0; i < num; i++) {
        if (i <= 51) {
            let r = Math.round(Math.random() * ((255 - diff) - (0 + diff) + 1) + (0 + diff));
            let g = Math.round(Math.random() * ((255 - diff) - (0 + diff) + 1) + (0 + diff));
            let b = Math.round(Math.random() * ((255 - diff) - (0 + diff) + 1) + (0 + diff));

            colors.push(`rgba(${r}, ${g}, ${b}, 0.5)`);

            diff += 5;
        }
    }
    return colors;
}

export { RenderResume, RenderSR };

