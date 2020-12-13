SELECT [R].[Tempo], [R].[WO], [P].[Projeto]
    FROM [SAT].[dbo].[Relatórios] AS [R]
        INNER JOIN [SAT].[dbo].[WOs] AS [W] 
            ON ([R].[WO] IN ([W].[Administrativo], [W].[Compras], [W].[Eletricista], [W].[Engenheiro], [W].[Ferramentaria], [W].[Mecânico], [W].[Programador], [W].[Projetista]))
            LEFT JOIN [SAT].[dbo].[Projetos] AS [P] ON ([W].[ID] = [P].[ID])
                WHERE [Registro] = @VAR0
                AND [Data] = '@VAR1'
                GROUP BY [R].[Tempo], [R].[WO], [P].[Projeto], [R].[Data]
                ORDER BY [R].[Data]