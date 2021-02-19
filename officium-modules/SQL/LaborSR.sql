SELECT SUM([R].[TEMPO]) AS [Tempo], [R].[WO], 'SR' AS [Projeto], (CASE WHEN [R].[HE] <> 0 THEN 'SIM' ELSE 'NÃO' END) AS [Extra]
	FROM [RELATORIOS] AS [R]
	INNER JOIN [SRs] AS [S] ON ([S].[WO] = [R].[WO])
		WHERE [R].[CRACHA] = @VAR0
			AND [R].[DATA] = '@VAR1'
			GROUP BY [R].[WO], [R].[HE]