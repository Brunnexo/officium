SELECT [CC], [CLIENTE] AS [Cliente], [PROJETO] AS [Projeto], [CLASSE] AS [Classe], [DESCRICAO] AS [Descrição], [EQUIPAMENTO] AS [Equipamento], [OS],
		[WOCOMPRAS] AS [Compras], [WOADM] AS [Administrativo], [WOELETRICISTA] AS [Eletricista], [WOMECANICO] AS [Mecânico],
			[WOENGENHEIRO] AS [Engenheiro], [WOPROJETISTA] AS [Projetista], [WOPROGRAMADOR] AS [Programador],
				[WOFERRAMENTARIA] AS [Ferramentaria]
    FROM [relger].[dbo].[PROJETOS]
        WHERE [CLIENTE] LIKE '%AUTOMAÇÃO%'