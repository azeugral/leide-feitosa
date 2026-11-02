"""Renderiza o hero (assets/js/brilho.js sobre assets/img/hero.webp) quadro a quadro num Edge headless
e gera os MP4 das telas de toque. O loop fecha sem emenda (fase 0 -> 2π).
CICLO tem que bater com o de assets/js/site.js e o foco com o data-foco do .hero-arte.
Uso: python tools/gerar_video.py [nome ...]"""
import os, sys, subprocess, base64
from playwright.sync_api import sync_playwright
import imageio_ffmpeg

AQUI = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.dirname(AQUI)
VID = os.path.join(SITE, 'assets', 'video')
FPS, CICLO, FOCO = 30, 14, (0.5, 0.33)
# nome, largura, altura, escala do glitter
VERSOES = [('hero-pe', 720, 960, 1.5), ('hero-quadrado', 1080, 1080, 1.3)]

def renderizar(pg, nome, w, h, esc):
    q = FPS * CICLO
    mp4 = os.path.join(VID, nome + '.mp4')
    enc = subprocess.Popen([imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'png', '-i', '-',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', '-an', mp4], stdin=subprocess.PIPE)
    pg.set_viewport_size({'width': w, 'height': h})
    pg.evaluate(f"""(() => {{ const c = document.getElementById('c');
        window.T = brilhoGL(c, document.getElementById('i'), {{preserveDrawingBuffer: true, foco: [{FOCO[0]}, {FOCO[1]}]}}); T.tamanho({w}, {h}, {esc}); }})()""")
    for i in range(q):
        png = base64.b64decode(pg.evaluate(f"(T.desenhar({i / q * 6.283185307179586}), document.getElementById('c').toDataURL('image/png'))").split(',', 1)[1])
        enc.stdin.write(png)
    enc.stdin.close(); enc.wait()
    print(mp4, round(os.path.getsize(mp4) / 1e6, 2), 'MB', flush=True)

if __name__ == '__main__':
    so = set(sys.argv[1:])
    os.makedirs(VID, exist_ok=True)
    img = base64.b64encode(open(os.path.join(SITE, 'assets', 'img', 'hero.webp'), 'rb').read()).decode()
    with sync_playwright() as p:
        b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        pg = b.new_page()
        pg.set_content(f'<body style="margin:0;background:#000"><canvas id="c"></canvas><img id="i" src="data:image/webp;base64,{img}" style="display:none"></body>')
        pg.wait_for_function("document.getElementById('i').complete && document.getElementById('i').naturalWidth > 0")
        pg.add_script_tag(content=open(os.path.join(SITE, 'assets', 'js', 'brilho.js'), encoding='utf-8').read())
        for v in VERSOES:
            if not so or v[0] in so: renderizar(pg, *v)
        b.close()
