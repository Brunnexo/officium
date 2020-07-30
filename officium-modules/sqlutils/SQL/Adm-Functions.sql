SELECT SUM([Tempo]) AS [Tempo], [Função]
                                FROM [SAT].[dbo].[Relatórios]
                                    GROUP BY [Função]