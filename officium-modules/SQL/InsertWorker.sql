DECLARE @Nome VARCHAR(MAX);
DECLARE @Registro BIGINT;
DECLARE @Email VARCHAR(MAX);
DECLARE @Funções NCHAR(6);
DECLARE @Jornada NCHAR(1);

SET @Registro = @VAR0;
SET @Email = '@VAR1';
SET @Nome = '@VAR2';
SET @Funções = '@VAR3';
SET @Jornada = '@VAR4';

INSERT INTO [Colaboradores] ([Registro], [Nome], [Funções], [Jornada])
	VALUES (@Registro, @Nome, @Funções, @Jornada)

IF @Funções LIKE '%A%'
	BEGIN
		BEGIN
			IF NOT EXISTS (SELECT * FROM [Logins] WHERE [Registro] = @Registro)
				BEGIN
					INSERT INTO [Logins] ([Registro], [Senha], [Email]) VALUES (@Registro, HASHBYTES('sha2_512', '1234'), @Email)
				END
		END
	END