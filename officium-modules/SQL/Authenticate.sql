SELECT CASE WHEN [Senha] = HASHBYTES('sha2_512', '@VAR0') AND [Registro] = @VAR1
    THEN 'TRUE' ELSE 'FALSE' END AS [Autenticado] FROM [SAT].[dbo].[Logins]