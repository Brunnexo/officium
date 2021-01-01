SELECT [P].[ID], [P].[CC], [P].[Cliente], [P].[Projeto], [P].[Classe], [P].[Descrição], [P].[Equipamento], [P].[OS],
                    [W].[Administrativo], [W].[Compras], [W].[Eletricista], [W].[Engenheiro], [W].[Ferramentaria], [W].[Mecânico], [W].[Programador], [W].[Projetista]
                        FROM [Projetos] AS [P] RIGHT JOIN [WOs] AS [W] ON [W].[ID] = [P].[ID] 
                            WHERE [P].[Cliente] LIKE '%AUTOMAÇÃO%'
                                ORDER BY [P].[ID]