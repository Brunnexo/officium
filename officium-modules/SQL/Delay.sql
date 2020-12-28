DECLARE @StartDate DATETIME, @EndDate DATETIME
SET @StartDate = DATEADD(mm, DATEDIFF(mm, 0, GETDATE()) - 1, 0)    
SET @EndDate = DATEADD(dd, -1, DATEADD(mm, 1, @StartDate))

SELECT COUNT(CASE WHEN [R].[Data] < [R].[Efetuado] THEN 1 END) AS [Atrasos], FORMAT([R].[Data], 'MM/yyyy') AS [Data]
	FROM [Relatórios] AS [R]
		GROUP BY FORMAT([R].[Data], 'MM/yyyy')