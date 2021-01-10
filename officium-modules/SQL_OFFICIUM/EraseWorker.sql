DECLARE @Registro BIGINT;
SET @Registro = @VAR0;

DELETE FROM [Relatórios] WHERE [Registro] = @Registro
DELETE FROM [Logins] WHERE [Registro] = @Registro
DELETE FROM [Colaboradores] WHERE [Registro] = @Registro