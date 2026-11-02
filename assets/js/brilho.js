/* Hero: a foto das unhas (assets/img/hero.webp) desenhada no shader, com duas coisas vivas por cima:
   um brilho largo que atravessa o cetim na diagonal (como a luz a correr num tecido) e pontos de
   glitter champanhe que cintilam presos ao tecido, cada um no seu tempo. Só o cetim recebe efeito:
   mão e unhas ficam como na foto.
   O loop fecha sem emenda: tudo depende de uFase (0 -> 2π) com frequências inteiras, e a faixa de
   brilho nasce e morre fora da imagem.
   brilhoGL(canvas, imagem, {foco:[x,y]}) -> {tamanho(w,h,escala), desenhar(fase)}
   foco = ponto da foto (0-1, y a partir do topo) que fica no centro quando a caixa corta a imagem.
   O mesmo arquivo gera os MP4 do toque em tools/gerar_video.py. */
(function (g) {
  const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const FS = `
precision highp float;
uniform sampler2D uImg; uniform vec2 uRes; uniform float uAR; uniform vec2 uFoco;
uniform float uFase; uniform float uEsc;
#define TAU 6.28318530718
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
vec2 h22(vec2 p){float n=h21(p);return vec2(n,h21(p+n*19.19));}
float ruido(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*ruido(p);p=mat2(.8,-.6,.6,.8)*p*2.02+3.1;a*=.5;}return s;}

void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  float ca=uRes.x/uRes.y;
  /* "cover" com ponto de foco; a textura sobe com FLIP_Y, então y=1 é o topo da foto */
  vec2 im;
  if(ca>uAR){float vh=uAR/ca;float cy=clamp(1.-uFoco.y,vh*.5,1.-vh*.5);im=vec2(uv.x,(uv.y-.5)*vh+cy);}
  else{float vw=ca/uAR;float cx=clamp(uFoco.x,vw*.5,1.-vw*.5);im=vec2((uv.x-.5)*vw+cx,uv.y);}
  vec3 col=texture2D(uImg,im).rgb;

  /* máscara do cetim: claro e quase sem cor */
  float L=dot(col,vec3(.299,.587,.114));
  float sat=max(col.r,max(col.g,col.b))-min(col.r,min(col.g,col.b));
  float cetim=smoothstep(.6,.84,L)*(1.-smoothstep(.07,.17,sat));

  vec2 c=vec2(cos(uFase),sin(uFase));
  /* as dobras respiram devagar */
  float n=fbm(im*vec2(2.6*uAR,2.6)+c*.32);
  col*=1.+(n-.5)*.07*cetim;

  /* faixa de luz atravessando na diagonal, torta pelas dobras */
  float d=dot(im*vec2(uAR*1.6,1.),normalize(vec2(.75,-.66)))+(n-.5)*.3;
  float t=uFase/TAU;
  float pos=mix(-1.05,1.25,t);
  float faixa=exp(-pow((d-pos)/.16,2.));
  col+=vec3(1.,.95,.88)*faixa*cetim*.13;
  col=mix(col,col*vec3(1.02,1.,.97),faixa*cetim);

  /* glitter preso ao tecido: uma chance por célula, piscar com frequência inteira */
  vec2 gp=im*vec2(uAR,1.)*92.;
  vec2 id=floor(gp);
  float P=ca>uAR?uRes.y*ca/uAR:uRes.y;
  float brilho=0.;
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
    vec2 cel=id+vec2(i,j);
    float hh=h21(cel+7.3);
    if(hh<.17){
      vec2 p0=cel+.2+.6*h22(cel);
      float k=1.+floor(h21(cel+3.7)*3.);
      float pisca=pow(max(0.,sin(uFase*k+h21(cel+1.1)*TAU)),18.);
      /* distância em pixels de tela (P = pixels por altura da foto) */
      vec2 px=(gp-p0)/92.*P;
      float s=uEsc;
      float nucleo=exp(-dot(px,px)/(1.3*s*s));
      float raio=exp(-abs(px.x)/(.5*s))*exp(-abs(px.y)/(3.2*s))+exp(-abs(px.y)/(.5*s))*exp(-abs(px.x)/(3.2*s));
      brilho+=pisca*(nucleo*1.1+raio*.3)*(.6+.4*hh/.17);
    }
  }
  col+=vec3(1.,.88,.66)*brilho*cetim*.85;

  col+=(fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))))-.5)*.004;
  gl_FragColor=vec4(clamp(col,0.,1.),1.);
}`;

  g.brilhoGL = function (cv, img, op = {}) {
    const gl = cv.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: !!op.preserveDrawingBuffer, powerPreference: 'high-performance' });
    if (!gl) return null;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    const tx = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tx);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    /* imagem não potência de 2: sem mipmap, borda presa */
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const u = n => gl.getUniformLocation(pr, n);
    const uR = u('uRes'), uF = u('uFase'), uE = u('uEsc');
    gl.uniform1i(u('uImg'), 0);
    gl.uniform1f(u('uAR'), img.naturalWidth / img.naturalHeight || img.width / img.height);
    const foco = op.foco || [.5, .33];
    gl.uniform2f(u('uFoco'), foco[0], foco[1]);
    let esc = 1;
    return {
      gl,
      tamanho(w, h, e = 1) { cv.width = w; cv.height = h; esc = e; },
      desenhar(fase) {
        gl.viewport(0, 0, cv.width, cv.height);
        gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uF, fase); gl.uniform1f(uE, esc);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    };
  };
})(window);
