SELECT [R].[Tempo], [R].[WO], [P].[Projeto], (CASE WHEN [R].[Extra] <> 0 THEN 'SIM' ELSE 'NÃO' END) AS [Extra]
    FROM [Relatórios] AS [R]
        INNER JOIN [WOs] AS [W] 
            ON ([R].[WO] IN ([W].[Administrativo], [W].[Compras], [W].[Eletricista], [W].[Engenheiro], [W].[Ferramentaria], [W].[Mecânico], [W].[Programador], [W].[Projetista]))
            LEFT JOIN [Projetos] AS [P] ON ([W].[ID] = [P].[ID])
                WHERE [Registro] = @VAR0
                AND [Data] = '@VAR1'
                GROUP BY [R].[Tempo], [R].[WO], [P].[Projeto], [R].[Data], [R].[Extra]
                ORDER BY [R].[Data]