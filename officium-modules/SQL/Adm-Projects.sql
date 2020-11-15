SELECT TOP(10) SUM([R].[Tempo]) AS [Tempo], [P].[Projeto]
                            FROM [SAT].[dbo].[Relatórios] AS [R]
                                INNER JOIN [SAT].[dbo].[WOs] AS [W] ON ([R].[WO] IN ([W].[Administrativo], [W].[Compras], [W].[Eletricista], [W].[Engenheiro], [W].[Ferramentaria], [W].[Mecânico], [W].[Programador], [W].[Projetista]))
                                    LEFT JOIN [SAT].[dbo].[Projetos] AS [P] ON ([W].[ID] = [P].[ID])
                                        GROUP BY [P].[Projeto]