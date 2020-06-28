const Chart = require('chart.js');

class Graph {
    constructor(canvas) {
        this.canvas = canvas;
        this.graphType = 'bar';
        this.graphResponsive = false;
        this.graphBuilt = false;
        this.graphLegend = {
            display: false
        }
    }

    // Métodos de parametrização
    // Tipo do gráfico
    setType(type) {
        let types = ['line', 'bar', 'radar', 'doughnut', 'pie', 'polarArea', 'bubble', 'scatter'];
        let typeFound = false;
        types.forEach((types) => {
            if (type == types) {
                typeFound = true;
            }
        });
        if (typeFound) {
            this.graphType = type;
        } else {
            throw `Graph type '${type}' not found!`;
        }
        return this;
    }

    // Legendas
    setLegend(disp, posi = 'bottom') {
        if (!disp == false) {
            this.graphLegend = {
                position: posi,
                display: true
            }
        }
        return this;
    }

    // Dados
    setData(data) {
        this.graphData = data;
        return this;
    }

    // Etiquetas
    setLabels(labels) {
        this.graphLabels = labels;
        return this;
    }

    // Título
    setTitle(title) {
        this.graphTitle = {
            display: true,
            text: title
        };
        return this;
    }

    // Cores dos gráficos
    setGraphColors(colors = 'random') {
        if (colors == 'random') {
            let e = this.graphData.length;
            let c = [];
            for (var i = 0; i < e; i++) {
                let r = Math.round(Math.random() * (255 + 1 - 0) + 0);
                let g = Math.round(Math.random() * (255 + 1 - 0) + 0);
                let b = Math.round(Math.random() * (255 + 1 - 0) + 0);
                c.push(`rgba(${r}, ${g}, ${b}, 1)`);
            }
            this.graphColors = c;
        } else {
            this.graphColors = colors;
        }
        return this;
    }

    // Responsivo
    setResponsive(responsive) {
        this.graphResponsive = responsive;
        return this;
    }

    // Construir
    build() {
        if (this.graphBuilt) {
            this.graph.destroy();
        }
        this.graph = new Chart(this.canvas, {
            type: this.graphType,
            data: {
                labels: this.graphLabels,
                datasets: [{
                    data: this.graphData,
                    backgroundColor: this.graphColors,
                    borderColor: this.graphColors,
                    borderWidth: 1
                }]
            },
            options: {
                maintainAspectRatio: false,
                responsive: this.graphResponsive,
                legend: this.graphLegend,
                title: this.graphTitle
            }
        });
        this.graphBuilt = true;
    }

    // Destruir
    kill() {
        this.graph.destroy();
    }
}