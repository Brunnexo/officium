 SELECT [ID], [DATA] AS [Data], [CRACHA] AS [Registro], [FUNCAO] AS [Função], [WO], [DESCRICAO] AS [Descrição], [TEMPO] AS [Tempo], (CASE WHEN [HE] <> 0 THEN 'SIM' ELSE 'NÃO' END) AS [Extra]
  FROM [relger].[dbo].[RELATORIOS]
    WHERE [CRACHA] = @VAR0
        AND [DATA] = '@VAR1'

