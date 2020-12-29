UPDATE [Colaboradores] SET [Nome] = '@VAR3', [Funções] = '@VAR4', [Jornada] = '@VAR5' WHERE [Registro] = @VAR0

IF NOT EXISTS 
	(SELECT [Registro]
		FROM [Logins]
			WHERE [Registro] = @VAR0)
BEGIN
	INSERT INTO [Logins] 
		([Registro], [Senha], [Email])
			VALUES (@VAR0, HASHBYTES('sha2_512', '@VAR1'), '@VAR2')
END

ELSE

BEGIN
	INSERT INTO [Logins] 
		([Registro], [Senha], [Email])
			VALUES (@VAR0, HASHBYTES('sha2_512', '@VAR1'), '@VAR2')
END