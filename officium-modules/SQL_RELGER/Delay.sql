SELECT COUNT(CASE WHEN (DATEDIFF(dd, [R].[Data], [R].[Efetuado]) > 1) THEN 1 END) AS [Atrasos], FORMAT([R].[Data], 'MM/yyyy') AS [Data]
	FROM [Relatórios] AS [R]
		GROUP BY FORMAT([R].[Data], 'MM/yyyy')