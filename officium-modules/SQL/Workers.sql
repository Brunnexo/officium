SELECT [C].[Registro], [C].[Nome], [C].[Funções], [C].[Jornada], [L].[Senha], [L].[Email]
	FROM [Colaboradores] AS [C]
		LEFT JOIN [Logins] AS [L] ON ([L].[Registro] = [C].[Registro])