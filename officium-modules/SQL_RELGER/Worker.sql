SELECT [NOME] AS [Nome], [CRACHA] AS [Registro],
	  (CASE WHEN [ELE] = 'TRUE' THEN 'E' ELSE ' ' END +
	  CASE WHEN [MEC] = 'TRUE' THEN 'M' ELSE ' ' END +
	  CASE WHEN [PROJ] = 'TRUE' THEN 'R' ELSE ' ' END +
	  CASE WHEN [PROG] = 'TRUE' THEN 'P' ELSE ' ' END +
	  CASE WHEN [ENG] = 'TRUE' THEN 'N' ELSE ' ' END +
	  CASE WHEN [ADM] = 'TRUE' THEN 'A' ELSE ' ' END) AS [Funções],
	  (CASE WHEN [HORISTA] <> 0 THEN 'H' ELSE 'M' END) AS [Jornada]
  FROM [relger].[dbo].[FUNCIONARIOS]
	WHERE [CRACHA] = @VAR0