SELECT TOP(15) FORMAT([R].[Data], 'dd/MM/yyyy') AS [Data], SUM([R].[Tempo]) AS [Tempo]
    FROM [SAT].[dbo].[Relatórios] AS [R]
        WHERE [Registro] = @VAR0
            AND [WO] != 0
                GROUP BY [R].[Data]
                ORDER BY [Data] ASC