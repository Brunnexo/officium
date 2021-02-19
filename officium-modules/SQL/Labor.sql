SELECT [R].[TEMPO] AS [Tempo], [R].[WO], [P].[PROJETO] AS [Projeto], (CASE WHEN [R].[HE] <> 0 THEN 'SIM' ELSE 'NÃO' END) AS [Extra]
    FROM [RELATORIOS] AS [R]
        INNER JOIN [PROJETOS] AS [P] 
            ON ([R].[WO] IN ([P].[WOADM], [P].[WOCOMPRAS], [P].[WOELETRICISTA], [P].[WOENGENHEIRO], [P].[WOFERRAMENTARIA], [P].[WOMECANICO], [P].[WOPROGRAMADOR], [P].[WOPROJETISTA]))
                WHERE [R].[CRACHA] = @VAR0
                AND [Data] = '@VAR1'
                GROUP BY [R].[TEMPO], [R].[WO], [P].[PROJETO], [R].[DATA], [R].[HE]
                ORDER BY [R].[DATA]