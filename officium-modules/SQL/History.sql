SELECT [ID], [Função], [WO], [Descrição], [Tempo], (CASE WHEN [Extra] <> 0 THEN 'SIM' ELSE 'NÃO' END) AS [Extra] FROM [Relatórios]
    WHERE [Registro] = @VAR0
        AND [Data] = '@VAR1'