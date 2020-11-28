SELECT FORMAT([R].[Data], 'dd/MM/yyyy') AS [Data], SUM([R].[Tempo]) AS [Tempo]
    FROM [SAT].[dbo].[Relatórios] AS [R]
    INNER JOIN [SAT].[dbo].[SRs] AS [S] ON ([R].[WO] = [S].[WO])
        WHERE [R].[Registro] = @VAR
            AND [S].[WO] != 0
        GROUP BY [R].[Data]
        ORDER BY [R].[Data] ASC