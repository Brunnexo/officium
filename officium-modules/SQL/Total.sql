SELECT TOP(15) FORMAT([R].[DATA], 'dd/MM/yyyy') AS [Data], SUM([R].[Tempo]) AS [Tempo]
    FROM [RELATORIOS] AS [R]
        WHERE [CRACHA] = @VAR0
            AND [WO] != '0'
                GROUP BY [R].[DATA]
                ORDER BY [R].[DATA] DESC