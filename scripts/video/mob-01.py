# Rendert MOB-01 (90/90 Hüftwechsel) nach docs/video-prompt.md als Rohframes auf stdout.
# Aufruf: python3 scripts/video/mob-01.py '{"l1": 2.961, ...}' | ffmpeg -f rawvideo -pix_fmt rgb24 -s 720x1280 -r 30 -i - ...
# (JSON = Länge der Sprachclips l1–l9 in s, für die Untertitel; benötigt Pillow + numpy)
import math, sys, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS, DUR = 720, 1280, 30, 90.0
NF = int(DUR * FPS)
FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FR = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

def hexc(h): return tuple(int(h[i:i+2], 16) for i in (1, 3, 5))
CYAN, PINK, AMBER, WHITE = hexc('#2CCED5'), hexc('#E94F7C'), hexc('#E8B038'), (255, 255, 255)
BODY, PANTS, FEET = hexc('#EDEBF5'), hexc('#453D77'), hexc('#3B3467')
SUB, TRACK, OUTL = hexc('#9C98B8'), hexc('#2E2D3C'), (20, 16, 44)

# ---------------- Zeitplan ----------------
# (start, ende, typ)
PHASES = [(0, 30, 'A'), (30, 45, 'P'), (45, 75, 'A'), (75, 90, 'P')]
INTRO_END, LOS_END = 4.2, 5.2
REP = 5.0
I1 = (5.0, 30.0, 5)   # Start, Ende, Anzahl Wechsel
I2 = (45.0, 75.0, 6)

SPEECH = [  # Datei, Start, Untertitel
    ('l1', 0.1, '90/90 Hüftwechsel. Setz dich aufrecht hin.'),
    ('l2', 4.2, 'Los!'),
    ('l3', 6.5, 'Beide Sitzbeinhöcker möglichst am Boden lassen.'),
    ('l4', 16.0, 'Langsam und kontrolliert von Seite zu Seite.'),
    ('l5', 30.3, 'Pause, locker lassen. Gleich folgt die zweite Runde.'),
    ('l6', 45.3, "Weiter geht's. Kein Ziehen oder Schmerz im Knie zulassen."),
    ('l7', 56.0, 'Bewegung langsam und kontrolliert.'),
    ('l8', 65.3, 'Noch zwei Wechsel.'),
    ('l9', 75.3, 'Pause, locker lassen.'),
]
DURS = {}  # wird von außen gesetzt

def ease(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * x * (x * (x * 6 - 15) + 10)

def interval_state(t, iv):
    s, e, n = iv
    k = min(int((t - s) // REP), n - 1)
    p = (t - (s + k * REP)) / REP
    a = -1.0 if k % 2 == 0 else 1.0
    th = a + (-a - a) * ease(p)
    done = k + (1 if p >= 0.92 else 0)
    return th, done, n

def pose_theta(t):
    """θ: -1 Knie links, +1 Knie rechts, 0 Knie oben (entspannt). breath 0..1"""
    if t < I1[0]:
        return -1.0, 0.0
    if t < I1[1]:
        return interval_state(t, I1)[0], 0.0
    if t < 45:
        if t < 31.5:
            return 1.0 - ease((t - 30) / 1.5), 0.0
        if t < 43:
            return 0.0, 1.0
        return -ease((t - 43) / 2.0), 0.0
    if t < I2[1]:
        return interval_state(t, I2)[0], 0.0
    if t < 76.5:
        return -1.0 + ease((t - 75) / 1.5), 0.0
    return 0.0, 1.0

def phase_at(t):
    for s, e, k in PHASES:
        if s <= t < e:
            return s, e, k
    return PHASES[-1]

def glow_color(t):
    if t < INTRO_END: return AMBER
    if t < 30: return CYAN
    if t < 45: return AMBER
    if t < 75: return CYAN
    return AMBER

def mix(c1, c2, a):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * a) for i in range(3))

def glow_color_smooth(t):
    # 0,5 s Überblendung an jedem Farbwechsel
    for b in (INTRO_END, 30, 45, 75):
        if b <= t < b + 0.5:
            return mix(glow_color(b - 0.01), glow_color(b), (t - b) / 0.5)
    return glow_color(t)

# ---------------- 3D-Figur ----------------
def v(*a): return np.array(a, dtype=float)
def norm(a): return a / np.linalg.norm(a)

HIP_W, THIGH, SHIN = 0.10, 0.42, 0.42
FOOT_L, FOOT_R = v(-0.33, 0.045, 0.40), v(0.33, 0.045, 0.40)
PHI_MAX = math.radians(82)

def knee_pos(hip, foot, th):
    d = foot - hip
    L = np.linalg.norm(d)
    u = d / L
    x = (THIGH ** 2 - SHIN ** 2 + L * L) / (2 * L)
    r = math.sqrt(max(THIGH ** 2 - x * x, 1e-6))
    c = hip + u * x
    up = v(0, 1, 0)
    v1 = norm(up - u * up.dot(u))
    v2 = np.cross(u, v1)
    if v2[0] < 0: v2 = -v2
    phi = th * PHI_MAX
    return c + r * (math.cos(phi) * v1 + math.sin(phi) * v2)

def rot_y(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])

def rot_x(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])

def two_bone(a, b, l1, l2, pole):
    d = b - a
    L = min(np.linalg.norm(d), l1 + l2 - 1e-4)
    u = norm(d)
    x = (l1 * l1 - l2 * l2 + L * L) / (2 * L)
    r = math.sqrt(max(l1 * l1 - x * x, 0))
    p = norm(pole - u * pole.dot(u))
    return a + u * x + p * r

def skeleton(th, breath, t):
    pelvis = v(0, 0.10, 0)
    yaw = -0.22 * th
    br = 0.012 * math.sin(t * 2 * math.pi / 4.0) * breath
    R = rot_y(yaw) @ rot_x(-0.16)
    def tor(p): return pelvis + R @ p
    hipL, hipR = v(-HIP_W, 0.10, 0), v(HIP_W, 0.10, 0)
    j = {
        'hipL': hipL, 'hipR': hipR,
        'waistL': tor(v(-0.115, 0.13, 0)), 'waistR': tor(v(0.115, 0.13, 0)),
        'shL': tor(v(-0.16, 0.50 + br, 0)), 'shR': tor(v(0.16, 0.50 + br, 0)),
        'neck': tor(v(0, 0.53 + br, 0)), 'head': tor(v(0, 0.66 + br, 0.0)),
        'footL': FOOT_L, 'footR': FOOT_R,
    }
    op = 0.35 * (1 - abs(th))  # in der Mitte fallen die Knie leicht nach außen
    j['kneeL'] = knee_pos(hipL, FOOT_L, th - op)
    j['kneeR'] = knee_pos(hipR, FOOT_R, th + op)
    for s, sx in (('L', -1), ('R', 1)):
        hand = v(sx * 0.27, 0.015, -0.17)
        j['hand' + s] = hand
        j['elb' + s] = two_bone(j['sh' + s], hand, 0.27, 0.26, v(sx, 0, -0.6))
    return j

PITCH = math.radians(40)
CP, SP = math.cos(PITCH), math.sin(PITCH)
BASE_SCALE = 580.0
ORIGIN = (360.0, 830.0)

def proj(p, cam):
    sc, ox, oy = cam
    return (ox + p[0] * sc, oy - (p[1] * CP - p[2] * SP) * sc)

def depth(p): return p[2] * CP + p[1] * SP

# ---------------- Zeichnen ----------------
SS = 2
FZ_TOP, FZ_BOT = 260, 1040

def font(path, size): return ImageFont.truetype(path, size)
_fc = {}
def F(path, size):
    k = (path, size)
    if k not in _fc: _fc[k] = font(path, size)
    return _fc[k]

def text_oblique(img, xy, txt, size, color, anchor='mm', alpha=255, maxw=None):
    """Fett-kursiv: DejaVu Sans Bold mit 12° Scherung."""
    f = F(FB, size)
    if maxw:
        while f.getlength(txt) * 1.05 > maxw and size > 20:
            size -= 2; f = F(FB, size)
    bb = f.getbbox(txt)
    tw, th = bb[2] + 20, bb[3] + 20
    m = Image.new('L', (tw + int(th * 0.25) + 10, th), 0)
    ImageDraw.Draw(m).text((10, 0), txt, font=f, fill=alpha)
    sh = 0.21
    m = m.transform(m.size, Image.AFFINE, (1, sh, -sh * th * 0.75, 0, 1, 0), resample=Image.BICUBIC)
    mb = m.getbbox() or (0, 0, 1, 1)
    m = m.crop(mb)
    x, y = xy
    if anchor[0] == 'm': x -= m.width / 2
    if anchor[1] == 'm': y -= m.height / 2
    layer = Image.new('RGBA', m.size, color + (0,))
    layer.putalpha(m)
    img.alpha_composite(layer, (int(round(x)), int(round(y))))
    return m.width

def text_plain(d, xy, txt, size, color, anchor='mm'):
    d.text(xy, txt, font=F(FR, size), fill=color, anchor=anchor)

def capsule(d, a, b, w, color, outline=True):
    if outline:
        _cap(d, a, b, w + 6 * SS, OUTL)
    _cap(d, a, b, w, color)

def _cap(d, a, b, w, color):
    d.line([a, b], fill=color, width=int(w))
    r = w / 2
    for p in (a, b):
        d.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=color)

def S(p, cam):  # Bildschirm -> Supersampling-Ebene (Figur-Zone)
    x, y = proj(p, cam)
    return (x * SS, (y - FZ_TOP) * SS)

def draw_figure(j, cam, phase_col, knee_trails, show_motion):
    sc = cam[0] / BASE_SCALE
    L = Image.new('RGBA', (W * SS, (FZ_BOT - FZ_TOP) * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(L)
    k = SS * sc
    prims = []  # (depth, fn)

    def limb(a, b, w, col, pants_frac=0.0):
        def fn():
            pa, pb = S(j[a], cam), S(j[b], cam)
            capsule(d, pa, pb, w * k, BODY)
            if pants_frac:
                pm = (pa[0] + (pb[0] - pa[0]) * pants_frac, pa[1] + (pb[1] - pa[1]) * pants_frac)
                _cap(d, pa, pm, w * k + 2 * k, PANTS)
        prims.append(((depth(j[a]) + depth(j[b])) / 2, fn))

    for s in 'LR':
        limb('sh' + s, 'elb' + s, 30, BODY)
        limb('elb' + s, 'hand' + s, 26, BODY)
        limb('hip' + s, 'knee' + s, 54, BODY, pants_frac=0.42)
        limb('knee' + s, 'foot' + s, 42, BODY)

        def foot(s=s):
            a = j['foot' + s]
            kn = j['knee' + s]
            side = kn - (j['hip' + s] + a) / 2
            side[1] = 0; side[2] = 0
            tip = a + v(0, -0.01, 0.10) + side * 0.25
            pa, pb = S(a, cam), S(tip, cam)
            capsule(d, pa, pb, 30 * k, FEET)
        prims.append((depth(j['foot' + s]) + 0.02, foot))

    def torso():
        pts = [S(j[n], cam) for n in ('waistL', 'shL', 'shR', 'waistR')]
        sl, sr = pts[1], pts[2]
        d.polygon(_grow(pts, 3 * k), fill=OUTL)
        d.polygon(pts, fill=BODY)
        for p in (sl, sr):
            r = 15 * k
            d.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=BODY)
        # Hose (Becken)
        wl, wr = S(j['waistL'], cam), S(j['waistR'], cam)
        hl, hr = S(j['hipL'] + v(-0.02, -0.05, 0), cam), S(j['hipR'] + v(0.02, -0.05, 0), cam)
        poly = [wl, wr, hr, hl]
        d.polygon(poly, fill=PANTS)
        for p in (hl, hr):
            r = 26 * k
            d.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=PANTS)
        # Hals und Kopf
        n, h = S(j['neck'], cam), S(j['head'], cam)
        _cap(d, n, (n[0] + (h[0] - n[0]) * 0.5, n[1] + (h[1] - n[1]) * 0.5), 26 * k, BODY)
        r = 48 * k
        d.ellipse([h[0] - r - 3 * k, h[1] - r - 3 * k, h[0] + r + 3 * k, h[1] + r + 3 * k], fill=OUTL)
        d.ellipse([h[0] - r, h[1] - r, h[0] + r, h[1] + r], fill=BODY)
    prims.append((depth(v(0, 0.3, -0.02)), torso))

    prims.sort(key=lambda x: x[0])
    for _, fn in prims:
        fn()

    if show_motion:
        G = Image.new('RGBA', L.size, (0, 0, 0, 0))
        gd = ImageDraw.Draw(G)
        for s in 'LR':
            tr = knee_trails[s]
            n = len(tr)
            for i, p in enumerate(tr):
                a = (i + 1) / n
                q = S(p, cam)
                r = (10 + 12 * a) * k
                gd.ellipse([q[0] - r, q[1] - r, q[0] + r, q[1] + r], fill=phase_col + (int(110 * a * a),))
            q = S(j['knee' + s], cam)
            r = 34 * k
            gd.ellipse([q[0] - r, q[1] - r, q[0] + r, q[1] + r], fill=phase_col + (150,))
        G = G.filter(ImageFilter.GaussianBlur(9 * SS))
        L.alpha_composite(G)
        # heller Kern auf dem Knie
        d2 = ImageDraw.Draw(L)
        for s in 'LR':
            q = S(j['knee' + s], cam)
            r = 9 * k
            d2.ellipse([q[0] - r, q[1] - r, q[0] + r, q[1] + r], fill=mix(phase_col, WHITE, 0.6) + (230,))
    return L.resize((W, FZ_BOT - FZ_TOP), Image.LANCZOS)

def _grow(pts, g):
    cx = sum(p[0] for p in pts) / len(pts); cy = sum(p[1] for p in pts) / len(pts)
    out = []
    for x, y in pts:
        dx, dy = x - cx, y - cy
        l = math.hypot(dx, dy) or 1
        out.append((x + dx / l * g, y + dy / l * g))
    return out

def guide_paths(cam, col):
    """Gepunktete Bahn beider Knie (40 % Deckkraft)."""
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(L)
    hip = {'L': v(-HIP_W, 0.10, 0), 'R': v(HIP_W, 0.10, 0)}
    foot = {'L': FOOT_L, 'R': FOOT_R}
    for s in 'LR':
        for i in range(0, 41):
            th = -1 + 2 * i / 40
            p = proj(knee_pos(hip[s], foot[s], th), cam)
            d.ellipse([p[0] - 2.2, p[1] - 2.2, p[0] + 2.2, p[1] + 2.2], fill=col + (102,))
    return L

# ---------------- Hintergrund ----------------
yy = np.linspace(0, 1, H)[:, None, None]
BG = (np.array(hexc('#0A081E'))[None, None, :] * (1 - yy) + np.array(hexc('#150B28'))[None, None, :] * yy) * np.ones((1, W, 1))
gy, gx = np.mgrid[0:H, 0:W]
GLOW_C = (360, 700)
GLOW = np.clip(1 - np.sqrt(((gx - GLOW_C[0]) / 400.0) ** 2 + ((gy - GLOW_C[1]) / 470.0) ** 2), 0, 1) ** 1.6
GLOW = GLOW[:, :, None]

rng = random.Random(7)
BOKEH = []
for _ in range(26):
    BOKEH.append(dict(x=rng.uniform(0, W), y=rng.uniform(0, H), r=rng.uniform(10, 34),
                      a=rng.uniform(0.10, 0.25), vx=rng.uniform(-4, 4), vy=rng.uniform(-9, -3),
                      c=rng.choice([CYAN, PINK, AMBER, (200, 190, 255)]), ph=rng.uniform(0, 6.28)))
SPR = {}
def sprite(r):
    r = int(r)
    if r not in SPR:
        s = r * 3
        yy2, xx2 = np.mgrid[0:2 * s, 0:2 * s]
        dd = np.sqrt((xx2 - s) ** 2 + (yy2 - s) ** 2) / r
        SPR[r] = np.clip(np.exp(-(dd ** 2) * 1.6), 0, 1)
    return SPR[r]

def background(t, gcol):
    img = BG.copy()
    img += GLOW * np.array(gcol)[None, None, :] * 0.35
    for b in BOKEH:
        x = (b['x'] + b['vx'] * t) % (W + 120) - 60
        y = (b['y'] + b['vy'] * t) % (H + 120) - 60
        a = b['a'] * (0.75 + 0.25 * math.sin(t * 0.6 + b['ph']))
        sp = sprite(b['r']); s = sp.shape[0] // 2
        x0, y0 = int(x) - s, int(y) - s
        xa, ya, xb, yb = max(x0, 0), max(y0, 0), min(x0 + 2 * s, W), min(y0 + 2 * s, H)
        if xa >= xb or ya >= yb: continue
        m = sp[ya - y0:yb - y0, xa - x0:xb - x0][:, :, None] * a
        img[ya:yb, xa:xb] = img[ya:yb, xa:xb] * (1 - m) + np.array(b['c'])[None, None, :] * m
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).convert('RGBA')

# ---------------- Overlay-Elemente ----------------
def subtitle_at(t):
    for name, st, txt in SPEECH:
        if st <= t < st + DURS[name] + 0.3:
            return txt
    return None

def wrap(txt, f, maxw):
    words, lines, cur = txt.split(), [], ''
    for w_ in words:
        c = (cur + ' ' + w_).strip()
        if f.getlength(c) <= maxw: cur = c
        else: lines.append(cur); cur = w_
    lines.append(cur)
    return lines

def draw_subtitle(img, txt):
    f = F(FR, 26)
    lines = wrap(txt, f, 560)
    lh = 34
    bw = max(f.getlength(l) for l in lines) + 36
    bh = lh * len(lines) + 18
    cy = 1215
    box = Image.new('RGBA', img.size, (0, 0, 0, 0))
    ImageDraw.Draw(box).rounded_rectangle([360 - bw / 2, cy - bh / 2, 360 + bw / 2, cy + bh / 2], 8, fill=(0, 0, 0, 115))
    img.alpha_composite(box)
    d = ImageDraw.Draw(img)
    y0 = cy - lh * (len(lines) - 1) / 2
    for i, l in enumerate(lines):
        d.text((360, y0 + i * lh), l, font=f, fill=WHITE, anchor='mm')

def draw_counter(img, n, N, col, dim=False):
    a = 120 if dim else 255
    c = col if not dim else mix(col, (40, 36, 60), 0.45)
    num = str(n)
    f64 = F(FB, 64)
    w_num = f64.getlength(num) * 1.05 + 6
    w_den = F(FB, 32).getlength(f'/ {N}')
    total = w_num + 10 + w_den
    x0 = 360 - total / 2
    text_oblique(img, (x0 + w_num / 2, 1092), num, 64, c, alpha=255)
    d = ImageDraw.Draw(img)
    d.text((x0 + w_num + 10, 1108), f'/ {N}', font=F(FB, 32), fill=SUB if not dim else (100, 97, 125), anchor='ls')
    d.text((360, 1140), 'Wechsel', font=F(FR, 16), fill=SUB, anchor='mm')

def draw_check(img, p):
    d = ImageDraw.Draw(img)
    r = 40 * (0.6 + 0.4 * ease(p * 3))
    cx, cy = 360, 1103
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=AMBER)
    s = r / 40
    d.line([(cx - 17 * s, cy + 1 * s), (cx - 5 * s, cy + 13 * s), (cx + 18 * s, cy - 12 * s)], fill=hexc('#150B28'), width=int(8 * s), joint='curve')

CONF = []
crng = random.Random(3)
for _ in range(90):
    CONF.append(dict(x=crng.uniform(20, 700), y=crng.uniform(-300, -10), vy=crng.uniform(160, 300), vx=crng.uniform(-40, 40),
                     rot=crng.uniform(0, 6.28), vr=crng.uniform(-6, 6), c=crng.choice([CYAN, PINK, AMBER, WHITE]),
                     w=crng.uniform(8, 14), h=crng.uniform(4, 7)))

def draw_confetti(img, dt):
    L = Image.new('RGBA', img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(L)
    for c in CONF:
        x = c['x'] + c['vx'] * dt + 12 * math.sin(dt * 3 + c['rot'])
        y = c['y'] + c['vy'] * dt + 140 * (1 - math.exp(-dt))
        if y > 1050: continue
        a = c['rot'] + c['vr'] * dt
        cw, ch = c['w'] / 2, c['h'] / 2 * abs(math.cos(a * 0.7)) + 1
        ca, sa = math.cos(a), math.sin(a)
        pts = [(x + px * ca - py * sa, y + px * sa + py * ca) for px, py in ((-cw, -ch), (cw, -ch), (cw, ch), (-cw, ch))]
        d.polygon(pts, fill=c['c'] + (235,))
    img.alpha_composite(L)

def draw_ring(img, cam, col):
    L = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(L)
    sc = cam[0]
    c = proj(v(0, 0, 0.14), cam)
    rx, ry = 0.54 * sc, 0.40 * sc * SP
    d.line([((c[0] - 330) * SS, (c[1] - ry) * SS), ((c[0] + 330) * SS, (c[1] - ry) * SS)], fill=TRACK + (255,), width=3 * SS)
    box = [(c[0] - rx) * SS, (c[1] - ry) * SS, (c[0] + rx) * SS, (c[1] + ry) * SS]
    glow = Image.new('RGBA', L.size, (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse(box, outline=col + (170,), width=10 * SS)
    glow = glow.filter(ImageFilter.GaussianBlur(8 * SS))
    L.alpha_composite(glow)
    d.ellipse(box, fill=(14, 10, 30, 210), outline=col + (255,), width=3 * SS)
    img.alpha_composite(L.resize((W, H), Image.LANCZOS))

# ---------------- Frame ----------------
def camera(t):
    z = 1.0 + 0.08 * ease((t - INTRO_END) / 1.2)
    cx, cy = 360.0, 700.0
    sc = BASE_SCALE * z
    ox = cx + (ORIGIN[0] - cx) * z
    oy = cy + (ORIGIN[1] - cy) * z
    return (sc, ox, oy)

def frame(i):
    t = i / FPS
    s, e, kind = phase_at(t)
    gcol = glow_color_smooth(t)
    img = background(t, gcol)
    cam = camera(t)
    working = (I1[0] <= t < I1[1]) or (I2[0] <= t < I2[1])
    pcol = CYAN if t >= INTRO_END and (t < 30 or 45 <= t < 75) else AMBER
    ring_col = gcol

    draw_ring(img, cam, ring_col)
    if working:
        img.alpha_composite(guide_paths(cam, CYAN))
    th, breath = pose_theta(t)
    j = skeleton(th, breath, t)
    trails = {'L': [], 'R': []}
    if working:
        for back in range(8, 0, -1):
            tb = t - back * 0.045
            if tb < (I1[0] if t < 30 else I2[0]): continue
            jb = skeleton(pose_theta(tb)[0], 0, tb)
            trails['L'].append(jb['kneeL']); trails['R'].append(jb['kneeR'])
    fig = draw_figure(j, cam, CYAN, trails, working)
    img.alpha_composite(fig, (0, FZ_TOP))

    d = ImageDraw.Draw(img)
    # Fortschrittsbalken
    d.rounded_rectangle([28, 24, 692, 32], 4, fill=TRACK)
    fw = 28 + (692 - 28) * (t / DUR)
    if fw > 36:
        d.rounded_rectangle([28, 24, fw, 32], 4, fill=pcol if t < 75 else AMBER)

    if t < INTRO_END:
        a = 1.0 if t < INTRO_END - 0.3 else (INTRO_END - t) / 0.3
        text_oblique(img, (360, 182), '90/90 Hüftwechsel', 72, WHITE, alpha=int(255 * a), maxw=660)
        tl = Image.new('RGBA', img.size, (0, 0, 0, 0))
        ImageDraw.Draw(tl).text((360, 238), '2 Runden à 30 Sekunden', font=F(FR, 22), fill=hexc('#C9C5E0') + (int(255 * a),), anchor='mm')
        img.alpha_composite(tl)
    else:
        text_oblique(img, (28, 52), '90/90 Hüftwechsel', 30, WHITE, anchor='lt')
        d.text((28, 92), 'Mobilisation', font=F(FR, 18), fill=SUB, anchor='lm')
        if t < LOS_END:
            head, hc = 'Los!', CYAN
        elif t < 30 or 45 <= t < 75:
            head, hc = 'Wechseln', CYAN
        elif t < 45:
            head, hc = ('Pause', AMBER) if t < 42 else (str(45 - int(t)), AMBER)
        elif t < 86:
            head, hc = 'Locker lassen', WHITE
        else:
            head, hc = 'Sauber gemacht!', AMBER
        text_oblique(img, (360, 190), head, 72, hc, maxw=660)

        if I1[0] > t >= INTRO_END:
            draw_counter(img, 0, I1[2], CYAN)
        elif t < 30:
            draw_counter(img, interval_state(t, I1)[1], I1[2], CYAN)
        elif t < 45:
            draw_counter(img, I1[2], I1[2], CYAN, dim=True)
        elif t < 75:
            draw_counter(img, interval_state(t, I2)[1], I2[2], CYAN)
        elif t < 86:
            draw_counter(img, I2[2], I2[2], CYAN, dim=True)
        else:
            draw_check(img, (t - 86) / 4)
    if t >= 86:
        draw_confetti(img, t - 86)

    sub = subtitle_at(t)
    if sub:
        draw_subtitle(img, sub)
    return img.convert('RGB').tobytes()

def init(durs):
    DURS.update(durs)

if __name__ == '__main__':
    import json
    from multiprocessing import Pool
    durs = json.loads(sys.argv[1])
    only = [int(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 else None
    init(durs)
    if only:
        for i in only:
            Image.frombytes('RGB', (W, H), frame(i)).save(f'frame_{i:04d}.png')
        sys.exit()
    out = sys.stdout.buffer
    with Pool(4, initializer=init, initargs=(durs,)) as p:
        for b in p.imap(frame, range(NF), chunksize=8):
            out.write(b)
