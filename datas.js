"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parameters = exports.clients = exports.activities = void 0;
const activities = {
    "Activities": {
        "Administrativo": {
            "Controle": {
                "Project": false,
                "WO Each": true,
                "Descriptions": [
                    "Controle de Compras",
                    "Controle de Demanda",
                    "Controle de Horas"
                ]
            },
            "Documentação": {
                "Project": false,
                "WO each": false,
                "WO as": "Documentação",
                "Descriptions": [
                    "Documentação de Máquina",
                    "Documentação Geral",
                    "Projeto"
                ]
            },
            "Orçamento e Gestão": {
                "Project": false,
                "WO each": false,
                "WO as": "Gestão de Projeto",
                "Descriptions": [
                    "Orçamento",
                    "Gestão de Projeto",
                    "Follow Up e Demanda"
                ]
            },
            "Retrabalhos e Melhorias": {
                "Project": false,
                "WO each": true,
                "Descriptions": [
                    "Retrabalho Interno",
                    "Retrabalho Externo",
                    "Melhorias"
                ]
            },
            "Geral": {
                "Project": false,
                "WO each": true,
                "Descriptions": [
                    "Testes e Protótipos",
                    "Manutenção",
                    "Almoxarifado",
                    "5S",
                    "Não Produtivos",
                    "Ausência"
                ]
            }
        },
        "Eletricista": {
            "Montagem": {
                "Project": true,
                "Descriptions": [
                    "Montagem de Painel Elétrico",
                    "Montagem de Máquina",
                    "Montagem Geral"
                ]
            },
            "Testes": {
                "Project": true,
                "Descriptions": [
                    "Testes de Sensores",
                    "Testes de Dispositivos",
                    "Testes de Funcionamento da Célula"
                ]
            },
            "Identificação": {
                "Project": true,
                "Descriptions": [
                    "Identificação de Máquinas",
                    "Identificação de Painel Elétrico"
                ]
            },
            "Documentos": {
                "Project": false,
                "WO each": false,
                "WO as": "Documentação",
                "Descriptions": [
                    "Esquema Elétrico",
                    "Lista de Peças",
                    "Documentação"
                ]
            },
            "Orçamento": {
                "Project": false,
                "WO each": false,
                "WO as": "Orçamento",
                "Descriptions": [
                    "Orçamento de Fornecedor",
                    "Orçamento de Peças",
                    "Orçamento de Máquinas"
                ]
            },
            "Gestão e Acompanhamento": {
                "Project": false,
                "WO each": false,
                "WO as": "Gestão de Projeto",
                "Descriptions": [
                    "Gestão de Projeto",
                    "Acompanhamento de S.A.",
                    "Acompanhamento de Produção",
                    "Acompanhamento de Fornecedor",
                    "Acompanhamento de Evento",
                    "Acompanhamento de Montagem"
                ]
            },
            "Retrabalhos e Melhorias": {
                "Project": false,
                "WO each": true,
                "Descriptions": [
                    "Retrabalho Interno",
                    "Retrabalho Externo",
                    "Melhorias"
                ]
            },
            "Geral": {
                "Project": false,
                "WO each": true,
                "Descriptions": [
                    "Testes e Protótipos",
                    "Manutenção",
                    "Almoxarifado",
                    "5S",
                    "Não Produtivos",
                    "Ausência"
                ]
            }
        },
        "Mecânico": {
            "Montagem": {
                "Project": true,
                "Descriptions": [
                    "Montagem Geral",
                    "Montagem de Sistema Pneumático",
                    "Montagem de Componentes"
                ]
            },
            "Usinagem": {
                "Project": true,
                "Descriptions": [
                    "Fresadora",
                    "Torno",
                    "Furadeira",
                    "Geral"
                ]
            },
            "Ajustes": {
                "Project": true,
                "Descriptions": [
                    "Ajuste de Posição de Peça",
                    "Calibração",
                    "Alinhamento"
                ]
            },
            "Caldeiraria": {
                "Project": true,
                "Descriptions": [
                    "Chapas",
                    "Corte",
                    "Dobra",
                    "Solda",
                    "Traçagem"
                ]
            },
            "Documentação": {
                "Project": false,
                "WO each": false,
                "WO as": "Documentação",
                "Descriptions": [
                    "Documentação Geral",
                    "Lista de Materiais"
                ]
            },
            "Orçamento": {
                "Project": false,
                "WO each": false,
                "WO as": "Orçamento",
                "Descriptions": [
                    "Orçamento de Máquina",
                    "Lista de Materiais"
                ]
            },
            "Gestão de Projeto": {
                "Project": false,
                "WO each": false,
                "WO as": "Gestão de Projeto",
                "Descriptions": [
                    "Gestão de Projeto"
                ]
            },
            "Retrabalhos e Melhorias": {
                "Project": false,
                "WO each": true,
                "Descriptions": [
                    "Retrabalho Interno",
                    "Retrabalho Externo",
                    "Melhorias"
                ]
            },
            "Geral": {
                "Project": false,
                "WO each": true,
                "Descriptions": [
                    "Testes e Protótipos",
                    "Manutenção",
                    "Almoxarifado",
                    "5S",
                    "Não Produtivos",
                    "Ausência"
                ]
            }
        },
        "Programador": {
            "Programação": {
                "Project": true,
                "Descriptions": [
                    "Desenvolvimento",
                    "Programação",
                    "Ajustes",
                    "Correções",
                    "Backup"
                ]
            },
            "Projeto Elétrico": {
                "Project": true,
                "Descriptions": [
                    "Desenvolvimento de Projeto",
                    "Correção"
                ]
            },
            "Documentação": {
                "Project": false,
                "WO each": false,
                "WO as": "Documentação",
                "Descriptions": [
                    "Documentação Geral"
                ]
            },
            "Orçamento": {
                "Project": false,
                "WO each": false,
                "WO as": "Orçamento",
                "Descriptions": [
                    "Orçamento"
                ]
            },
            "Gestão de Projeto": {
                "Project": false,
                "WO each": false,
                "WO as": "Gestão de Projeto",
                "Descriptions": [
                    "Gestão de Pojeto"
                ]
            },
            "Retrabalhos e Melhorias": {
                "Project": false,
                "WO each": true,
                "Descriptions": [
                    "Retrabalho Interno",
                    "Retrabalho Externo",
                    "Melhorias"
                ]
            },
            "Geral": {
                "Project": false,
                "WO each": true,
                "Descriptions": [
                    "Testes e Protótipos",
                    "Manutenção",
                    "Almoxarifado",
                    "5S",
                    "Não Produtivos",
                    "Ausência"
                ]
            }
        },
        "Projetista": {
            "Desenvolvimento": {
                "Project": true,
                "Descriptions": [
                    "Desenvolvimento de Projeto",
                    "Controle de Projeto",
                    "Lista de Peças",
                    "Design Review"
                ]
            },
            "Visita Técnica": {
                "Project": false,
                "WO each": false,
                "WO as": "Gestão de Projeto",
                "Descriptions": [
                    "Forneçedor",
                    "Cliente"
                ]
            },
            "Elaboração": {
                "Project": false,
                "WO each": false,
                "WO as": "Documentação",
                "Descriptions": [
                    "Termo de Abertura",
                    "Escopo"
                ]
            },
            "Gestão e Acompanhamento": {
                "Project": false,
                "WO each": false,
                "WO as": "Gestão de Projeto",
                "Descriptions": [
                    "Follow Up e Demanda",
                    "Gestão de Projeto",
                    "Acompanhamento de S.A.",
                    "Acompanhamento de Produção",
                    "Acompanhamento de Fornecedor",
                    "Acompanhamento de Evento",
                    "Acompanhamento de Montagem"
                ]
            },
            "Documentação": {
                "Project": false,
                "WO each": false,
                "WO as": "Docmentação",
                "Descriptions": [
                    "Documentação de Máquina",
                    "Documentação Geral",
                    "Orçamento"
                ]
            },
            "Retrabalhos e Melhorias": {
                "Project": false,
                "WO each": true,
                "Descriptions": [
                    "Retrabalho Interno",
                    "Retrabalho Externo",
                    "Melhorias"
                ]
            },
            "Geral": {
                "Project": false,
                "WO each": true,
                "Descriptions": [
                    "Testes e Protótipos",
                    "Manutenção",
                    "Almoxarifado",
                    "5S",
                    "Não Produtivos",
                    "Ausência"
                ]
            }
        },
        "Engenheiro": {
            "Desenvolvimento": {
                "Project": true,
                "Descriptions": [
                    "Desenvolvimento de Projeto",
                    "Controle de Projeto",
                    "Lista de Peças",
                    "Design Review"
                ]
            },
            "Visita Técnica": {
                "Project": false,
                "WO each": false,
                "WO as": "Gestão de Projeto",
                "Descriptions": [
                    "Forneçedor",
                    "Cliente"
                ]
            },
            "Elaboração": {
                "Project": false,
                "WO each": false,
                "WO as": "Documentação",
                "Descriptions": [
                    "Termo de Abertura",
                    "Escopo"
                ]
            },
            "Gestão e Acompanhamento": {
                "Project": false,
                "WO each": false,
                "WO as": "Gestão de Projeto",
                "Descriptions": [
                    "Follow Up e Demanda",
                    "Gestão de Projeto",
                    "Acompanhamento de S.A.",
                    "Acompanhamento de Produção",
                    "Acompanhamento de Fornecedor",
                    "Acompanhamento de Evento",
                    "Acompanhamento de Montagem"
                ]
            },
            "Documentação": {
                "Project": false,
                "WO each": false,
                "WO as": "Docmentação",
                "Descriptions": [
                    "Documentação de Máquina",
                    "Documentação Geral",
                    "Orçamento"
                ]
            },
            "Retrabalhos e Melhorias": {
                "Project": false,
                "WO each": true,
                "Descriptions": [
                    "Retrabalho Interno",
                    "Retrabalho Externo",
                    "Melhorias"
                ]
            },
            "Geral": {
                "Project": false,
                "WO each": true,
                "Descriptions": [
                    "Testes e Protótipos",
                    "Manutenção",
                    "Almoxarifado",
                    "5S",
                    "Não Produtivos",
                    "Ausência"
                ]
            }
        }
    }
};
exports.activities = activities;
const clients = {
    "Clients": {
        "GM": [
            "General Motors",
            "Chevrolet"
        ],
        "VW": [
            "Volkswagen"
        ],
        "FORD": [
            "Ford"
        ],
        "FCA": [
            "Fiat",
            "Chrysler",
            "Jeep"
        ],
        "RENAULT": [
            "Renault"
        ],
        "HONDA": [
            "Honda"
        ],
        "NISSAN": [
            "Nissan"
        ],
        "TOYOTA": [
            "Toyota"
        ],
        "HYUNDAI": [
            "Hyundai"
        ],
        "MERCEDES": [
            "Mercedes",
            "Mercedes-Benz"
        ],
        "PSA": [
            "Peugeot",
            "Citroen",
            "Citröen",
            "PSA"
        ],
        "MAN": [
            "Man"
        ]
    }
};
exports.clients = clients;
const parameters = {
    "sql": {
        "config": {
            "server": "127.0.0.1",
            "authentication": {
                "type": "default",
                "options": {
                    "userName": "sa",
                    "password": "sa"
                }
            },
            "options": {
                "encrypt": false,
                "database": "relger",
                "enableArithAbort": true,
                "appName": "Officium",
                "useColumnNames": true
            }
        }
    },
    "workTime": {
        "hourly": 528,
        "monthly": 522,
        "dailyExtra": 60,
        "weekendExtra": 660,
        "hourBank": 90
    }
};
exports.parameters = parameters;
