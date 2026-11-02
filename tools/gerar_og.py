"""Gera assets/img/og.jpg (1200x630) com as fontes do site. O conteúdo fica no centro porque o
WhatsApp recorta a prévia em quadrado. Precisa do servidor local na porta 8893.
Uso: python tools/gerar_og.py"""
import os
from playwright.sync_api import sync_playwright
SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = """<!doctype html><html><head><link href="https://fonts.googleapis.com/css2?family=Figtree:wght@500&family=Gilda+Display&display=swap" rel="stylesheet">
<style>body{margin:0;width:1200px;height:630px;position:relative;overflow:hidden;background:#ece8e3;font-family:Figtree}
.f{position:absolute;inset:0;background:url(http://localhost:8893/assets/img/hero.webp) 50% 30%/cover}
.p{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:560px;padding:34px 0 34px;background:rgba(236,232,227,.94);text-align:center;border:1px solid rgba(201,166,107,.6)}
.n{display:block;width:300px;height:auto;margin:0 auto}
.t{margin-top:20px;font:400 24px/1.25 'Gilda Display';color:#2a2321}</style></head>
<body><div class="f"></div><div class="p"><img class="n" src="http://localhost:8893/assets/img/logo.webp"><div class="t">Nail designer e formadora<br>Atendimento e cursos em Braga</div></div></body></html>"""
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge'); pg = b.new_page(viewport={'width': 1200, 'height': 630})
    pg.goto('http://localhost:8893/robots.txt')  # mesma origem: a máscara SVG precisa disso
    pg.set_content(HTML, wait_until='networkidle'); pg.wait_for_timeout(800)
    pg.screenshot(path=os.path.join(SITE, 'assets', 'img', 'og.jpg'), type='jpeg', quality=86); b.close()
print('ok')
