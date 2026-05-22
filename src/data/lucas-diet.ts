import type { DietPlan } from '../types/diet'

export const lucasDietPlan: DietPlan = {
  id: 'lucas-monteiro-22-05-26',
  patientName: 'Lucas Monteiro',
  date: '22/05/2026',
  nutritionist: {
    name: 'Gabriel Paes',
    whatsapp: '(85) 9 8179-4055',
    email: 'gabrielpaesnutri@gmail.com',
  },
  macros: {
    energyKcal: 1620,
    carbsG: 203,
    proteinG: 148,
    lipidsG: 24,
    fiberG: 26,
    weightKg: 66.7,
  },
  menus: [
    {
      id: 'menu-1',
      title: 'Cardápio 1',
      subtitle: 'Dias de semana',
      meals: [
        {
          id: 'm1-desjejum',
          name: 'Desjejum',
          time: '06:00',
          preparations: [
            {
              name: 'Fruta',
              foods: [{ name: 'Banana', quantity: '1 unidade média (80g)' }],
            },
            {
              name: 'Musculação — Sanduíche de Frango e Queijo + Café',
              foods: [
                { name: 'Pão de Forma', quantity: '2 fatias (50g)' },
                { name: 'Frango Desfiado', quantity: '2 colheres de sopa (50g)' },
                { name: 'Queijo Coalho', quantity: '2 fatias (30g)' },
                { name: 'Café c/ Adoçante', quantity: '1 xícara (150ml)' },
              ],
            },
          ],
        },
        {
          id: 'm1-lanche-manha',
          name: 'Lanche',
          time: '08:00 – 08:30',
          preparations: [
            {
              name: 'Iogurte com Banana, Aveia e Whey',
              foods: [
                { name: 'Iogurte Grego Tradicional', quantity: '1 potinho (100g)' },
                { name: 'Banana', quantity: '1 unidade pequena (60g)' },
                { name: 'Aveia em Flocos', quantity: '1 colher de sopa (15g)' },
                { name: 'Whey Protein 3W', quantity: '1 colher de sopa (15g)' },
              ],
            },
          ],
        },
        {
          id: 'm1-almoco',
          name: 'Almoço',
          time: '12:30 – 13:00',
          preparations: [
            {
              name: 'Salada Crua',
              foods: [
                {
                  name: 'Alface, Tomate e Cenoura Ralada',
                  quantity: 'À vontade',
                },
              ],
            },
            {
              name: 'Prato principal + bebida',
              foods: [
                { name: 'Arroz Branco', quantity: '8 colheres de sopa (160g)' },
                { name: 'Feijão', quantity: '3 colheres de servir (105g)' },
                { name: 'Peito de Frango Grelhado', quantity: '3 filés médios (120g)' },
                { name: 'Refrigerante Zero', quantity: '1 copo (200ml)' },
              ],
            },
          ],
          notes:
            'Você pode substituir as 120g de frango grelhado por 90g de carne ao molho ou 120g de peixe (tilápia ou pescada) grelhado. Você pode substituir as 135g de arroz por 300g de batata inglesa cozida ou 220g de batata na airfryer (pesar antes de assar). Caso não consiga consumir as 50g de frango desfiado na refeição de 08:30, aumente a proteína do almoço para 160g (4 filés médios).',
        },
        {
          id: 'm1-lanche1',
          name: 'Lanche 1',
          time: '14:00',
          preparations: [
            {
              name: 'Fruta (escolha uma)',
              foods: [
                { name: 'Tangerina', quantity: '1 unidade pequena (80g)' },
                { name: 'Uvas s/ Semente', quantity: '20 unidades (80g)' },
              ],
            },
          ],
        },
        {
          id: 'm1-lanche2',
          name: 'Lanche 2',
          time: '16:00',
          preparations: [
            {
              name: 'Shake de Proteína',
              foods: [
                { name: 'Whey Protein 3W', quantity: '1 medidor (31g)' },
                { name: 'Banana', quantity: '1 unidade média (80g)' },
                { name: 'Aveia em Flocos', quantity: '3 colheres de sobremesa (21g)' },
                { name: 'Leite Semidesnatado', quantity: '1 copo grande (300ml)' },
              ],
            },
          ],
        },
        {
          id: 'm1-jantar',
          name: 'Jantar',
          time: '19:00 – 20:00',
          preparations: [
            {
              name: 'Salada Crua',
              foods: [
                {
                  name: 'Alface, Tomate e Cenoura Ralada',
                  quantity: 'À vontade',
                },
              ],
            },
            {
              name: 'Prato principal',
              foods: [
                { name: 'Arroz Branco', quantity: '5 colheres de sopa (100g)' },
                { name: 'Feijão', quantity: '3 colheres de servir (105g)' },
                { name: 'Peito de Frango Grelhado', quantity: '2 filés grandes (100g)' },
              ],
            },
          ],
          notes:
            'Você pode substituir as 100g de frango grelhado por 75g de carne ao molho ou 100g de peixe (tilápia ou pescada) grelhado. Você pode substituir as 60g de arroz por 160g de batata inglesa cozida ou 120g de batata na airfryer (pesar antes de assar).',
        },
      ],
    },
    {
      id: 'menu-2',
      title: 'Cardápio 2',
      subtitle: 'Dias de semana',
      meals: [
        {
          id: 'm2-desjejum',
          name: 'Desjejum',
          time: '06:00',
          preparations: [
            {
              name: 'Fruta',
              foods: [{ name: 'Uvas s/ Semente', quantity: '25 unidades (100g)' }],
            },
            {
              name: 'Musculação',
              foods: [],
            },
          ],
        },
        {
          id: 'm2-lanche-manha',
          name: 'Lanche',
          time: '08:00 – 08:30',
          preparations: [
            {
              name: 'Sanduíche de Patê de Atum + Café',
              foods: [
                { name: 'Pão de Forma', quantity: '2 fatias (50g)' },
                { name: 'Patê de Atum com Requeijão', quantity: '2 colheres de sobremesa (30g)' },
                { name: 'Café c/ Adoçante', quantity: '1 xícara (150ml)' },
              ],
            },
          ],
          notes:
            'Para preparar o patê de atum misture atum e requeijão light na proporção de 2 para 1 (20g de atum para cada 10g de requeijão). Além do atum e requeijão, pode incrementar o patê com cenoura ralada e temperar da forma que preferir.',
        },
        {
          id: 'm2-almoco',
          name: 'Almoço',
          time: '12:30 – 13:00',
          preparations: [
            {
              name: 'Salada Crua',
              foods: [
                {
                  name: 'Alface, Tomate e Cenoura Ralada',
                  quantity: 'À vontade',
                },
              ],
            },
            {
              name: 'Prato principal + bebida',
              foods: [
                { name: 'Arroz Branco', quantity: '7 colheres de sopa (140g)' },
                { name: 'Feijão', quantity: '3 colheres de servir (105g)' },
                { name: 'Lagarto ao Molho', quantity: '3 bifes pequenos (120g)' },
                { name: 'Refrigerante Zero', quantity: '1 copo (200ml)' },
              ],
            },
          ],
          notes:
            'Você pode substituir as 120g de carne ao molho por 150g de frango grelhado ou 150g de peixe grelhado. Você pode substituir as 100g de arroz por 220g de batata inglesa cozida ou 180g de batata na airfryer (pesar antes de assar).',
        },
        {
          id: 'm2-lanche1',
          name: 'Lanche 1',
          time: '14:00',
          preparations: [
            {
              name: 'Fruta (escolha uma)',
              foods: [
                { name: 'Maçã', quantity: '1 unidade pequena (90g)' },
                { name: 'Tangerina', quantity: '1 unidade média (135g)' },
                { name: 'Uvas s/ Semente', quantity: '25 unidades (100g)' },
              ],
            },
          ],
        },
        {
          id: 'm2-lanche2',
          name: 'Lanche 2',
          time: '16:00',
          preparations: [
            {
              name: 'Iogurte com Aveia e Whey',
              foods: [
                { name: 'Iogurte Grego Tradicional', quantity: '1 potinho (100g)' },
                { name: 'Aveia em Flocos', quantity: '3 colheres de sobremesa (21g)' },
                { name: 'Whey Protein 3W', quantity: '1 medidor (31g)' },
              ],
            },
          ],
        },
        {
          id: 'm2-jantar',
          name: 'Jantar',
          time: '19:00 – 20:00',
          preparations: [
            {
              name: 'Salada Crua',
              foods: [
                {
                  name: 'Alface, Tomate e Cenoura Ralada',
                  quantity: 'À vontade',
                },
              ],
            },
            {
              name: 'Prato principal + bebida',
              foods: [
                { name: 'Arroz Branco', quantity: '5 colheres de sopa (100g)' },
                { name: 'Feijão', quantity: '3 colheres de servir (105g)' },
                { name: 'Lagarto ao Molho', quantity: '3 bifes pequenos (120g)' },
                { name: 'Refrigerante Zero', quantity: '1 copo (200ml)' },
              ],
            },
          ],
          notes:
            'Você pode substituir as 120g de carne ao molho por 150g de frango grelhado ou 150g de peixe grelhado. Você pode substituir as 60g de arroz por 150g de batata inglesa cozida ou 120g de batata na airfryer (pesar antes de assar).',
        },
      ],
    },
    {
      id: 'menu-3',
      title: 'Cardápio 3',
      subtitle: 'Final de semana',
      meals: [
        {
          id: 'm3-desjejum',
          name: 'Desjejum',
          time: '08:00 – 09:00',
          preparations: [
            {
              name: 'Panqueca de Banana e Aveia, com Mel',
              foods: [
                { name: 'Banana', quantity: '1 unidade média (80g)' },
                { name: 'Aveia em Flocos', quantity: '5 colheres de sobremesa (35g)' },
                { name: 'Ovo', quantity: '1 unidade (50g)' },
                { name: 'Mel de Abelha', quantity: '1 colher de sobremesa (9g)' },
              ],
            },
            {
              name: 'Creme de Whey + Café + Fruta',
              foods: [
                { name: 'Whey Protein 3W', quantity: '3 colheres de sobremesa (45g)' },
                { name: 'Leite Semidesnatado', quantity: '50ml' },
                { name: 'Café c/ Adoçante', quantity: '1 xícara (150ml)' },
                { name: 'Melancia', quantity: '1 fatia média (150g)' },
              ],
            },
          ],
          notes:
            'Para preparar a panqueca, basta amassar bem a banana e misturar com a aveia (pode usar o farelo de aveia ao invés dos flocos também) e o ovo até obter uma massa homogênea. Leve para a frigideira untada, em fogo baixo, por cerca de 2 a 3 minutos em cada lado. Você pode adicionar umas gotinhas de adoçante na massa para ficar mais doce.',
        },
        {
          id: 'm3-almoco',
          name: 'Almoço',
          time: '13:00 – 14:00',
          preparations: [
            {
              name: 'Salada Cozida',
              foods: [
                {
                  name: 'Batata, Cenoura e Beterraba Cozidas',
                  quantity: '6 colheres de servir (180g)',
                },
              ],
            },
            {
              name: 'Prato principal + bebida',
              foods: [
                { name: 'Arroz Branco', quantity: '10 colheres de sopa (200g)' },
                { name: 'Feijão', quantity: '3 colheres de servir (105g)' },
                { name: 'Peito de Frango Grelhado', quantity: '4 filés médios (160g)' },
                { name: 'Refrigerante Zero', quantity: '1 copo (200ml)' },
              ],
            },
          ],
          notes:
            'Você pode substituir as 160g de frango grelhado por 120g de carne ao molho ou 160g de peixe (tilápia ou pescada) grelhado. Você pode substituir as 135g de arroz por 300g de batata inglesa cozida ou 220g de batata na airfryer (pesar antes de assar).',
        },
        {
          id: 'm3-jantar',
          name: 'Jantar',
          time: '19:00 – 20:00',
          preparations: [
            {
              name: 'Hambúrguer Caseiro',
              foods: [
                { name: 'Pão Brioche', quantity: '1 unidade (50g)' },
                { name: 'Hambúrguer de Patinho (peso cru)', quantity: '100g' },
                { name: 'Queijo Coalho', quantity: '1 fatia (15g)' },
                { name: 'Alface e Tomate', quantity: 'À vontade' },
                { name: 'Ketchup Zero', quantity: '1 colher de sopa (20g)' },
                { name: 'Refrigerante Zero', quantity: '1 copo (200ml)' },
              ],
            },
          ],
        },
      ],
    },
  ],
  supplements: [
    {
      name: 'Creatina',
      dose: '5g (1 colher de café) por dia',
      recommendation:
        'Tomar a creatina diluída em água próximo de alguma refeição (ou logo antes ou logo depois)',
      options:
        'Creatina Monohidratada, podendo ser de diversas marcas (Growth, IntegralMédica, Max Titanium, Probiótica etc.)',
    },
  ],
  generalRecommendations: [
    'Beber pelo menos 2,0 litros de água ao dia e ir aumentando o consumo diário em 500ml por semana até atingir uma total de 3,0 a 3,5 litros/dia.',
    'Sempre dê preferência a preparações com pouca gordura (assadas, grelhadas, cozidas, Airfryer).',
    'Evite o consumo de doces e açúcar com frequência, experimente o uso de adoçantes (boas opções são o sucralose e o stevia).',
    'Evite o consumo de refrigerantes e se for consumir escolha a versão zero calorias.',
    'Estão liberadas 2 refeições livres por semana.',
  ],
}
