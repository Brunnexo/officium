SELECT TOP(15) FORMAT([R].[Data], 'dd/MM/yyyy') AS [Data], SUM([R].[Tempo]) AS [Tempo], [P].[Projeto]
    FROM [SAT].[dbo].[Relatórios] AS [R]
        INNER JOIN [SAT].[dbo].[WOs] AS [W] ON ([R].[WO] IN ([W].[Administrativo], [W].[Compras], [W].[Eletricista], [W].[Engenheiro], [W].[Ferramentaria], [W].[Mecânico], [W].[Programador], [W].[Projetista]))
        LEFT JOIN [SAT].[dbo].[Projetos] AS [P] ON ([W].[ID] = [P].[ID])
        WHERE [Registro] = @VAR0
            AND [WO] != 0
                GROUP BY [R].[Data], [P].[Projeto]
                ORDER BY [Data] ASC