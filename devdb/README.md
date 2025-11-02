# database
> mongodb

```
>> REQUIREMENTS
docker
bash
```

```
>> DATA FORMAT

> users 
{
    "_id": { "$oid": "6904d5849e535e400845d866" },
    "registo": "2025-10-29",
    "ultimo_login": "2025-10-29",
    "nome": "Che Guevara",
    "localizacao": "Atouguia",
    "latitude": "39.646202919394",
    "longitude": "-8.6278194414218",
    "event_scores": [
      { "event_id": 72628, "score": 5 },
      { "event_id": 71765, "score": 5 },
      { "event_id": "d2f86154-67ca-11f0-8d91-dfe49836bdb3", "score": 2 },
      { "event_id": "2e21bd9e-0819-11f0-a5de-3f14ab34c657", "score": 4 },
      { "event_id": "4de781bc-577a-11f0-a554-53424e99db87", "score": 4 },
      { "event_id": "647989dc-8cc9-11f0-8343-2376e2da4bc2", "score": 5 }
    ]
}


> events
    {
      "_id": "6904d584656ce1e8a383234c",
      "tipologia": "Atividades Recreativas/Desportivas",
      "data_inicio": "2025-11-08",
      "data_fim": "2025-11-08",
      "nome_atividade": "Magusto - S.Gens",
      "horario": "16:00:00",
      "custo": "Evento gratuito",
      "sinopse": "<b>Centro Recreativo e Cultural S.Gens</b>\r\n\r\nO magusto do S.Gens é dia 8 de novembro a partir das 16:00h na nossa Sede, dirigido a toda a comunidade.\r\n\r\nUma festa plena de tradição que há anos faz parte do nosso calendário anual.\r\n\r\nTeremos animação musical, serviço de bar, brasas no assador para grelhados na hora e, claro, castanhas assadas e o bom vinho novo da nossa terra.\r\n\r\nEntrada livre",
      "organizacao": "Centro Recreativo e Cultural S.Gens",
      "publico_destinatario": "Público em geral",
      "fotografia": "https://associativismo.cm-ourem.pt/frontend/web/uploads/eventos/evento_1745444042.png",
      "localizacao": "Antiga Escola Primária de Pinhel",
      "latitude": "39.651493005682",
      "longitude": "-8.6131924139576"
    },
    {
      "_id": "6904d584656ce1e8a383234d",
      "tipologia": "Atividades Recreativas/Desportivas",
      "data_inicio": "2025-11-09",
      "data_fim": "2025-11-09",
      "nome_atividade": "Festa da Pipa 2025",
      "horario": "12:30:00",
      "custo": "Evento gratuito",
      "sinopse": "Relembrar hábitos, costumes, vivências e experiências oriundos do meio sociocultural em que os clientes estão inseridos;\r\n- \r\nRelembrar hábitos, costumes, vivências e experiências oriundos do meio sociocultural em que os clientes estão inseridos\r\nAngariação de fundos para a Instituição\r\n",
      "organizacao": "Associação do Bem Estar Cultural e Recreativa da Lourinha e Nossa Senhora da Piedade",
      "publico_destinatario": "População da freguesia;  população em geral",
      "fotografia": "https://associativismo.cm-ourem.pt/frontend/web/uploads/eventos/evento_1759391842.jpg",
      "localizacao": "Salão da Lourinha, Nª Sª da Piedade",
      "latitude": "39.664991165169",
      "longitude": "-8.5755965754496"
    }
  ]
```
