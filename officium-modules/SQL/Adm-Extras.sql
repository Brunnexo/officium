SELECT TOP(10) SUM([R].[Tempo]) AS [Tempo], MONTH([R].[Data]) AS [Data]
                        FROM [SAT].[dbo].[Relatórios] AS [R]
                            WHERE [R].[Extra] = 'TRUE'
                                GROUP BY MONTH([R].[Data])