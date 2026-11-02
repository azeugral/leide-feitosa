# Leide Feitosa · Nail Designer e Formadora

Prévia de site para a **Leide Feitosa** ([@leidefeitosanails](https://www.instagram.com/leidefeitosanails/)), nail designer e formadora em Braga (Portugal), com cursos também em Espanha.

- Prévia: https://azeugral.github.io/leide-feitosa/ (`noindex`, ainda não divulgada)
- Feito em 02/11/2026 a partir do Instagram (18,7 mil seguidores, 204 posts lidos). Ela ainda não foi contactada.
- Texto em PT-PT.

## Estrutura

- `index.html`: página única com topo (logo oficial), Sobre (retrato, história e linha do tempo), serviços e trabalhos, "Cada etapa conta", cursos e turmas, pedido pelo WhatsApp e rodapé.
- `assets/js/brilho.js`: shader do topo. Desenha a foto `hero.webp` e acrescenta por cima uma faixa de luz que atravessa o cetim e glitter champanhe a cintilar. Só o tecido recebe o efeito; mão e unhas ficam como na foto.
- `assets/js/site.js`: menu, revelação ao rolar, hero vivo e montagem da mensagem do WhatsApp.
  - O hero vivo é WebGL no rato e MP4 no toque. Se o WebGL falhar, fica a foto parada.
  - A mensagem do WhatsApp tem duas abas, Atendimento e Formação. O botão "Pedir vaga" de cada curso já abre a aba com o curso escolhido.
- `assets/video/hero-pe.mp4` e `hero-quadrado.mp4`: o mesmo shader renderizado em loop de 14 s, sem emenda, por `tools/gerar_video.py`.
- `assets/img/logo.webp` (logo completa) e `logo-lf.webp` (só o monograma, para a nav), mais `favicon.png` e `apple-touch-icon.png`: saem da logo oficial enviada (`../_ref/logo/oficial/logo-oficial.webp`, dourado com fundo transparente) por `../tools/logo_oficial.py`.
- `tools/gerar_og.py`: imagem de partilha com o conteúdo ao centro, porque o WhatsApp recorta em quadrado.
- As fotos saem de `../_ref/ig` por `../tools/processar.py`. A foto do topo recebe acerto de branco, porque o cetim original puxava para o azul.

### Parâmetros de conferência

- `?fase=0.35` congela um quadro do shader.
- `?parado` mostra só a foto.
- `?video` força o MP4 no desktop.

### Identidade

- **Cores:** cetim `#ece8e3`, verniz `#141011` e champanhe `#c9a66b`. O champanhe vem do logo dourado dela.
- **Fontes:** Gilda Display (títulos) e Figtree (texto). A marca é a logo oficial dela.
- **Botões:** retos, com reflexo de verniz a correr no hover.

## CONFIRMAR antes de publicar

- [x] **Logo oficial**: recebida e aplicada no topo, na nav, no rodapé, no favicon e na imagem de partilha. Se houver versão em SVG ou PNG maior, trocar em `_ref/logo/oficial` e correr `tools/logo_oficial.py`.
- [ ] **Morada do estúdio em Braga**: hoje o site diz só "Braga, Portugal". O destaque "localização" tem 234 semanas, é da época do Brasil, e não foi aberto.
- [ ] **Serviços e valores**: a lista foi tirada das legendas (acrílico, gel, fibra, manutenção, banho, esmaltação). Falta confirmar se faz pés e se tem remoção.
- [ ] **Cursos**: os nomes vieram dos destaques e das legendas (Curso VIP, Acrílico Elite, Fiber Class, Work Day, formação de equipa).
  - [ ] Confirmar quais estão ativos em Portugal e Espanha.
  - [ ] Duração, carga horária, valor, se o material está incluído (no post de 25/09/2025 ficou "informar se não está") e próximas datas das turmas.
  - [ ] Em que cidade de Espanha acontecem os cursos.
- [ ] **Depoimentos das alunas**: os destaques "feedback", "Alunas PT" e "alunas" não foram abertos, porque abrir regista a visualização da @lrgz.sites antes do contacto. Pedir prints ou textos e criar a secção. Até lá, nenhum depoimento foi inventado.
- [ ] **Números**: "+2.000 alunas" vem da bio; "mais de mil no Brasil" vem do post de 29/11/2024.
- [ ] **Percurso "De Pernambuco a Braga"**: Pernambuco foi deduzido das hashtags #candeiasjaboatão e #unhasdegelrecife e das lojas do Recife nas legendas. Também falta saber o ano em que começou e o ano em que começou a ensinar.
- [ ] **Parcerias**: Pluri Cosmética (out/2026) e Onail (broca, cupom Leide100). Confirmar se quer o cupom no site.
- [ ] **Fotos**: várias têm a marca d'água dela. Pedir originais em alta, sobretudo turmas em Portugal, porque as fotos de turma no site são do Brasil, de 2023.
- [ ] Antes do domínio: tirar o `noindex` e o `robots.txt`, pôr o canonical e o URL absoluto no og.

---
Site por [L R G Z](https://lrgz.com.br)
