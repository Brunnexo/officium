DECLARE @Registro BIGINT;
SET @Registro = @VAR1;

SELECT (CASE WHEN [Senha] = HASHBYTES('sha2_512', '@VAR0') AND [Registro] = @Registro
    THEN 'TRUE' ELSE 'FALSE' END) AS [Autenticado] FROM [Logins]
		WHERE [Registro] = @Registro