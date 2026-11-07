import { useEffect, useRef } from "react";

// Animated smoke/cloud background drawn with fractal noise on a tiny canvas,
// then scaled up and blurred with CSS (cheap enough for phones).
export default function Sky() {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    const cx = cv.getContext("2d");
    const W = innerWidth < 700 ? 110 : 180;
    const H = Math.round((W * innerHeight) / innerWidth) || 100;
    cv.width = W;
    cv.height = H;
    const img = cx.createImageData(W, H);

    const P = new Uint8Array(512);
    const p = [...Array(256).keys()].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 512; i++) P[i] = p[i & 255];
    const fade = (t) => t * t * (3 - 2 * t);
    const vn = (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, X = xi & 255, Y = yi & 255;
      const a = P[P[X] + Y], b = P[P[X + 1] + Y], c = P[P[X] + Y + 1], d = P[P[X + 1] + Y + 1];
      const u = fade(xf), v = fade(yf);
      return ((a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v) / 255;
    };
    const fbm = (x, y) => {
      let s = 0, a = 0.5;
      for (let o = 0; o < 4; o++) { s += a * vn(x, y); x *= 2.03; y *= 2.03; a *= 0.5; }
      return s;
    };

    let raf, last = 0;
    const frame = (t) => {
      raf = requestAnimationFrame(frame);
      if (t - last < 55) return; // ~18 fps
      last = t;
      const sc = scrollY / innerHeight;
      const tm = t / 9000, sh = sc * 0.6, sx = (3 / W) * 1.4;
      let i = 0;
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const nx = x * sx, ny = y * sx + sh;
          const q = fbm(nx + tm, ny - tm * 0.6);
          const r = fbm(nx + 3.2 * q + 1.7 - tm * 0.4, ny + 3.2 * q + 9.2 + tm * 0.3);
          let v = r * r * 1.9 + 0.12;
          const dx = x / W - 0.5, dy = y / H - 0.25;
          v += Math.max(0, 0.45 - Math.hypot(dx, dy * 1.3)) * Math.max(0, 1 - sc) * 1.4;
          v = Math.min(1, Math.max(0, v));
          const g = 40 + v * 215;
          img.data[i++] = g; img.data[i++] = g; img.data[i++] = g * 0.99; img.data[i++] = 255;
        }
      cx.putImageData(img, 0, 0);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas id="sky" ref={ref} />;
}
