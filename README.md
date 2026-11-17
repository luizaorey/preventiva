# Preventiva
PWA de campo: para cada ponto da faixa de **pressão** (0/25/50/75/100 %) mostra a pressão a aplicar no gerador, a leitura no Trex e a indicação no painel.

- Pressão a aplicar = LRV + %·(URV−LRV), convertida para a unidade do gerador.
- Saída do transmissor: linear em ΔP (sinal = %) ou já proporcional à vazão (sinal = √%).
- Painel: Linear (LRVp + sinal·span) ou Raiz quadrada (LRVp + √sinal·span).
- Exemplo (0–200 m³/h, saída linear em ΔP, painel Raiz): 25 % → 100; 50 % → 141,4.
- Raiz dupla e linear/linear com ΔP geram aviso.

`node --test test/`
