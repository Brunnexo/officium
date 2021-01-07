DECLARE @Nome VARCHAR(MAX);
DECLARE @Registro BIGINT;
DECLARE @Senha VARBINARY(MAX);
DECLARE @Email VARCHAR(MAX);
DECLARE @Funções NCHAR(6);
DECLARE @Jornada NCHAR(1);

SET @Registro = @VAR0;
SET @Senha = HASHBYTES('sha2_512', '@VAR1');
SET @Email = '@VAR2';
SET @Nome = '@VAR3';
SET @Funções = '@VAR4';
SET @Jornada = '@VAR5';

UPDATE [Colaboradores]
	SET [Nome] = @Nome, [Funções] = @Funções, [Jornada] = @Jornada
		WHERE [Registro] = @Registro

IF NOT EXISTS 
	(SELECT *
		FROM [Logins]
			WHERE [Registro] = @Registro)
BEGIN
	INSERT INTO [Logins] 
		([Registro], [Senha], [Email])
			VALUES (@Registro, @Senha, @Email)
END

ELSE

BEGIN
	UPDATE [Logins]
		SET [Senha] = @Senha,
					[Email] = @Email
		WHERE [Registro] = @Registro
END
