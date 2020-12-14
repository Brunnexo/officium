SELECT [R].[Tempo], [R].[WO], 'SR' AS [Projeto], (CASE WHEN [R].[Extra] <> 0 THEN 'SIM' ELSE 'NÃO' END) AS [Extra]
	FROM [SAT].[dbo].[Relatórios] AS [R]
		INNER JOIN [SAT].[dbo].[SRs] AS [S]
			ON ([R].[WO] = [S].[WO])
				WHERE [R].[Registro] = @VAR0
					AND [R].[Data] = '@VAR1'