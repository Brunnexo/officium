SELECT SUM([R].[Tempo]) AS [Tempo], [R].[WO], 'SR' AS [Projeto], (CASE WHEN [R].[Extra] <> 0 THEN 'SIM' ELSE 'NÃO' END) AS [Extra]
	FROM [Relatórios] AS [R]
	INNER JOIN [SRs] AS [S] ON ([S].[WO] = [R].[WO])
		WHERE [R].[Registro] = @VAR0
			AND [R].[Data] = '@VAR1'
			GROUP BY [R].[WO], [R].[Extra]