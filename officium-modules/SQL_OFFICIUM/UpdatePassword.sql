DECLARE @Registro BIGINT;
DECLARE @Nome VARCHAR(MAX);
DECLARE @Senha VARCHAR(MAX);

SET @Registro = @VAR0;
SET @Nome = '@VAR1';
SET @Senha = '@VAR2';

IF EXISTS (SELECT * FROM [Colaboradores] AS [C]
			INNER JOIN [Logins] AS [L] ON ([C].[Registro] = [L].[Registro])
			WHERE [C].[Registro] = @Registro AND [C].[Nome] = @Nome)
	BEGIN
		UPDATE [Logins] SET [Senha] = HASHBYTES('sha2_512', @Senha) WHERE [Registro] = @Registro
		SELECT 'TRUE' AS [Atualizado]
	END
ELSE
	BEGIN
		SELECT 'FALSE' AS [Atualizado]
	END