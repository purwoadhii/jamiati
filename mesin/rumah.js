/* ===== Kejutan ulang tahun "Jalan-jalan ke Rumah" (gaya anime) =====
   Yang berulang tahun (tokoh cowok atau cewek) berjalan melewati halaman rumput & bunga ke rumah.
   Kotak surat di depan rumah berisi surat yang diketik lewat admin/. Kotak surat, pintu, dan pohon diklik sendiri (tanpa tombol). Pintu:
   layar gelap beberapa detik, lalu lampu menyala dan pasangannya (lawan jenis) memberi kejutan.
   Di depan kue: menulis wish, hitung mundur 3-2-1, lalu tiup lilin. Lantai 2 berisi kado & foto.
   Tidak ada jalan otomatis: tokoh hanya bergerak dengan kursor/sentuhan, joystick, atau tombol panah. */
(function () {
  var D = window.ULTAH || {};
  var T = 16, OUT = "#3d2633";
  var WARNA = ["#ff6b9a", "#ffd166", "#6cc3f0", "#b48cf2", "#7ed6a0", "#ff9f6b", "#ffffff"];
  var SENTUH = !!(window.matchMedia && matchMedia("(pointer:coarse)").matches);

  /* ---------- Alat bantu gambar ---------- */
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function paragraf(s) { return String(s || "").split(/\n\s*\n/).map(function (p) { return "<p>" + esc(p.trim()).replace(/\n/g, "<br>") + "</p>"; }).join(""); }
  function acak(x, y, k) { var n = Math.sin(x * 127.1 + y * 311.7 + (k || 0) * 74.7) * 43758.5453; return n - Math.floor(n); }
  function kotak(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }
  function garis(g, w, c) { g.strokeStyle = c || OUT; g.lineWidth = w || .5; g.stroke(); }
  function elips(g, cx, cy, rx, ry, c, tepi) { g.beginPath(); g.ellipse(cx, cy, Math.max(.01, rx), Math.max(.01, ry), 0, 0, 6.2832); if (c) { g.fillStyle = c; g.fill(); } if (tepi) garis(g, tepi === true ? .5 : tepi); }
  function lingkaran(g, cx, cy, r, c, tepi) { elips(g, cx, cy, r, r, c, tepi); }
  function jalurBulat(g, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function bulatIsi(g, x, y, w, h, r, c, tepi) { jalurBulat(g, x, y, w, h, r); if (c) { g.fillStyle = c; g.fill(); } if (tepi) garis(g, tepi === true ? .5 : tepi); }
  function poligon(g, titik, c, tepi) { g.beginPath(); titik.forEach(function (p, i) { if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.closePath(); if (c) { g.fillStyle = c; g.fill(); } if (tepi) garis(g, tepi === true ? .5 : tepi); }
  function gradV(g, y0, y1, a, b) { var gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, a); gr.addColorStop(1, b); return gr; }
  function cahaya(g, cx, cy, r, rgb, kuat) { if (r <= 0) return; var gr = g.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, "rgba(" + rgb + "," + kuat + ")"); gr.addColorStop(1, "rgba(" + rgb + ",0)"); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, 6.2832); g.fill(); }
  function bayangan(g, cx, cy, rx, ry, a) { elips(g, cx, cy, rx, ry, "rgba(40,25,30," + (a || .2) + ")"); }
  function bunga(g, x, y, r, warna, tengah) { for (var i = 0; i < 5; i++) { var a = i * 1.2566 + x; lingkaran(g, x + Math.cos(a) * r, y + Math.sin(a) * r, r * .85, warna); } lingkaran(g, x, y, r * .55, tengah || "#ffd84d"); }
  function hati(g, x, y, s, c, tepi) { g.beginPath(); g.moveTo(x, y + s); g.bezierCurveTo(x - s * 1.6, y, x - s * .8, y - s * 1.1, x, y - s * .3); g.bezierCurveTo(x + s * .8, y - s * 1.1, x + s * 1.6, y, x, y + s); g.fillStyle = c; g.fill(); if (tepi) garis(g, tepi === true ? .4 : tepi); }
  function bintang(g, x, y, r, c, sudut) { g.beginPath(); for (var i = 0; i < 10; i++) { var a = (sudut || 0) - Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fillStyle = c; g.fill(); }
  function kilau(g, x, y, r, a) { g.fillStyle = "rgba(255,255,255," + a + ")"; g.beginPath(); g.moveTo(x, y - r); g.quadraticCurveTo(x, y, x + r, y); g.quadraticCurveTo(x, y, x, y + r); g.quadraticCurveTo(x, y, x - r, y); g.quadraticCurveTo(x, y, x, y - r); g.fill(); }

  /* =====================================================================
     TOKOH (chibi semi-realistis). Kaki di (0,0), tinggi sekitar 31.
     Cewek: rambut cokelat dicepol, sweater kuning mustard, rok gelap, sandal.
     Cowok: rambut hitam berantakan, hoodie abu-abu, celana gelap, sneakers.
     o: {jenis, arah: bawah|atas|kiri|kanan, jalan, anim, pose, mata, mulut, tulis, skala, tanpaBayangan}
     ===================================================================== */
  var GAYA = {
    cewek: { kulit: "#f7dcc6", kulitG: "#e9b89c", rambut: "#6e4632", rambutT: "#a0704f", rambutG: "#45291d", baju: "#d9a33b", bajuT: "#efc66a", bajuG: "#ab7a22", bawah: "#3d3c44", bawahG: "#28272e", kaki: "#f2d2bb", sepatu: "#7b5336", sol: "#5a3a26", mata: "#6a3d22" },
    cowok: { kulit: "#f5d6bd", kulitG: "#e1b096", rambut: "#272224", rambutT: "#575159", rambutG: "#121011", baju: "#9ea4aa", bajuT: "#bfc4c9", bajuG: "#787e85", bawah: "#363b47", bawahG: "#232731", sepatu: "#ecebe6", sol: "#bdb9b0", mata: "#5a3420" }
  };
  var TEPI = "rgba(58,34,26,.82)";
  function tepi(g, w) { g.strokeStyle = TEPI; g.lineWidth = w || .36; g.lineJoin = "round"; g.stroke(); }
  /* kurva halus lewat titik; titik dengan [x,y,1] dibuat lancip */
  function halus(g, pts) {
    var n = pts.length; function mid(a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
    var m0 = mid(pts[0], pts[1]); g.beginPath(); g.moveTo(m0[0], m0[1]);
    for (var i = 1; i <= n; i++) { var p = pts[i % n], q = pts[(i + 1) % n], m = mid(p, q); if (p[2]) { g.lineTo(p[0], p[1]); g.lineTo(m[0], m[1]); } else g.quadraticCurveTo(p[0], p[1], m[0], m[1]); }
    g.closePath();
  }
  function isiHalus(g, pts, warna, garisW) { halus(g, pts); g.fillStyle = warna; g.fill(); if (garisW !== 0) tepi(g, garisW); }
  function gradX(g, x0, x1, a, b, c) { var gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, a); gr.addColorStop(.5, b); gr.addColorStop(1, c); return gr; }

  function gambarOrang(g, o, x, y, t) {
    var P = GAYA[o.jenis] || GAYA.cewek, cewek = o.jenis !== "cowok", sk = o.skala || 1;
    var gaun = cewek && o.baju === "gaun", jas = !cewek && o.baju === "jas";
    if (gaun) P = Object.assign({}, P, { baju: "#34457f", bajuT: "#5266a8", bajuG: "#1f2a59", bawah: "#34457f", bawahG: "#1f2a59", sepatu: "#c9a45a", sol: "#9a7a3a" });
    if (jas) P = Object.assign({}, P, { baju: "#2b2c33", bajuT: "#474952", bajuG: "#1a1b20", bawah: "#25262c", bawahG: "#16171b", sepatu: "#1e1b1a", sol: "#0e0d0c" });
    var ay = o.jalan ? Math.sin(o.anim * 1.25) : 0, naik = o.jalan ? Math.abs(Math.sin(o.anim * 1.25)) * .7 : Math.sin(t * 2.2 + x) * .15;
    var samping = o.arah === "kiri" || o.arah === "kanan", belakang = o.arah === "atas", depan = !samping && !belakang;
    var pose = o.pose || "", duduk = pose === "duduk";
    if (!o.tanpaBayangan) { var bg = g.createRadialGradient(x, y, 0, x, y, 6.5 * sk); bg.addColorStop(0, "rgba(30,24,18,.32)"); bg.addColorStop(1, "rgba(30,24,18,0)"); g.fillStyle = bg; g.beginPath(); g.ellipse(x, y, 6.5 * sk, 2.3 * sk, 0, 0, 6.2832); g.fill(); }
    g.save(); g.translate(x, y - naik * sk); g.scale(sk, sk);
    if (o.arah === "kiri") g.scale(-1, 1);
    var hy = -20.6, hr = 7.7;

    /* --- kaki --- */
    function kakiSatu(kx, angkat, lebar) {
      var y0 = duduk ? -3.6 : cewek ? -5.6 : -7.2, y1 = -1.3 - angkat;
      if (cewek) {
        bulatIsi(g, kx - 1.05, y0, 2.1, y1 - y0 + .4, 1, gradX(g, kx - 1, kx + 1, P.kaki, P.kaki, P.kulitG), true);
        elips(g, kx + (samping ? .5 : 0), -.7 - angkat, lebar * .55, .85, P.sol, .3);
        g.strokeStyle = P.sepatu; g.lineWidth = .55; g.beginPath(); g.moveTo(kx - 1, -1.3 - angkat); g.lineTo(kx + 1, -1.3 - angkat); g.stroke();
      } else {
        bulatIsi(g, kx - 1.45, y0, 2.9, y1 - y0 + .6, .9, gradX(g, kx - 1.5, kx + 1.5, P.bawah, P.bawah, P.bawahG), true);
        bulatIsi(g, kx - lebar / 2 + (samping ? .5 : 0), -2.2 - angkat, lebar, 2.2, 1, P.sepatu, true);
        kotak(g, kx - lebar / 2 + .3 + (samping ? .5 : 0), -.75 - angkat, lebar - .6, .55, P.sol);
      }
    }
    if (samping) { kakiSatu(-1 - ay * 1.9, Math.max(0, -ay) * .6, 3.8); kakiSatu(1 + ay * 1.9, Math.max(0, ay) * .6, 3.8); }
    else { kakiSatu(-1.8, Math.max(0, ay), 3.2); kakiSatu(1.8, Math.max(0, -ay), 3.2); }
    if (duduk) { [-1.8, 1.8].forEach(function (kx) { bulatIsi(g, kx - 1.5, -6.2, 3, 3.2, 1.2, cewek ? P.bawah : gradX(g, kx - 1.5, kx + 1.5, P.bawah, P.bawah, P.bawahG), true); }); g.translate(0, 2.4); }

    /* --- badan --- */
    var bw = samping ? 7.2 : 9.2, bahu = -14.4;
    if (cewek) {
      // rok
      var rt = -9.2, rb = gaun ? -1 : -5.2, rw = samping ? (gaun ? 10 : 8) : (gaun ? 14 : 10.6);
      poligon(g, [[-bw / 2 + .2, rt], [bw / 2 - .2, rt], [rw / 2, rb], [-rw / 2, rb]], gradX(g, -rw / 2, rw / 2, P.bawah, P.bawah, P.bawahG), true);
      g.strokeStyle = "rgba(0,0,0,.28)"; g.lineWidth = .25; for (var pl = -2; pl <= 2; pl++) { g.beginPath(); g.moveTo(pl * 1.5, rt + .6); g.lineTo(pl * 2.1, rb - .2); g.stroke(); }
      // sweater
      isiHalus(g, [[-bw / 2 + .6, bahu], [0, bahu - .5], [bw / 2 - .6, bahu], [bw / 2 + .3, bahu + 2], [bw / 2 + .5, -8.4, 1], [-bw / 2 - .5, -8.4, 1], [-bw / 2 - .3, bahu + 2]], gradX(g, -bw / 2, bw / 2, P.bajuT, P.baju, P.bajuG));
      g.save(); halus(g, [[-bw / 2 + .6, bahu], [0, bahu - .5], [bw / 2 - .6, bahu], [bw / 2 + .3, bahu + 2], [bw / 2 + .5, -8.4, 1], [-bw / 2 - .5, -8.4, 1], [-bw / 2 - .3, bahu + 2]]); g.clip();
      if (gaun) { for (var kl = 0; kl < 9; kl++) lingkaran(g, -bw / 2 + acak(kl, 5) * bw, bahu + 1 + acak(5, kl) * 5, .25, "rgba(255,240,200,.8)"); }
      else g.strokeStyle = "rgba(120,80,20,.22)"; g.lineWidth = .22; for (var rb2 = -bw / 2; rb2 < bw / 2 && !gaun; rb2 += .9) { g.beginPath(); g.moveTo(rb2, bahu); g.lineTo(rb2 * 1.06, -8.4); g.stroke(); }
      if (!gaun) kotak(g, -bw, -9.6, bw * 2, 1.2, "rgba(140,95,25,.28)"); else kotak(g, -bw, -9.4, bw * 2, .8, "#c9a45a");
      g.restore();
      if (!belakang) { g.beginPath(); g.ellipse(samping ? 1.6 : 0, bahu + .1, samping ? 1.6 : 2.4, .9, 0, 0, Math.PI); g.fillStyle = P.kulitG; g.fill(); g.strokeStyle = P.bajuG; g.lineWidth = .5; g.stroke(); }
    } else {
      isiHalus(g, [[-bw / 2 + .6, bahu], [0, bahu - .5], [bw / 2 - .6, bahu], [bw / 2 + .4, bahu + 2], [bw / 2 + .6, -6.3, 1], [-bw / 2 - .6, -6.3, 1], [-bw / 2 - .4, bahu + 2]], gradX(g, -bw / 2, bw / 2, P.bajuT, P.baju, P.bajuG));
      kotak(g, -bw / 2 - .4, -7.4, bw + .8, 1.1, "rgba(70,74,80,.35)");
      if (depan && jas) {
        poligon(g, [[-2.2, bahu - .2], [2.2, bahu - .2], [0, bahu + 5.4]], "#f4f2ee"); poligon(g, [[-1.6, bahu + .8], [0, bahu + 1.6], [-1.6, bahu + 2.4]], "#7a2232"); poligon(g, [[1.6, bahu + .8], [0, bahu + 1.6], [1.6, bahu + 2.4]], "#7a2232");
        lingkaran(g, 0, bahu + 7, .35, "#0e0e10"); lingkaran(g, 0, bahu + 8.8, .35, "#0e0e10");
      } else if (depan) {
        bulatIsi(g, -3.2, -11, 6.4, 3.3, 1.2, "rgba(120,126,133,.55)"); g.strokeStyle = "rgba(70,74,80,.6)"; g.lineWidth = .25; jalurBulat(g, -3.2, -11, 6.4, 3.3, 1.2); g.stroke();
        g.strokeStyle = "#f2f2ef"; g.lineWidth = .32; g.lineCap = "round";
        [-1, 1].forEach(function (s) { g.beginPath(); g.moveTo(s * 1, bahu + .7); g.quadraticCurveTo(s * 1.2, bahu + 2.4, s * 1.05 + Math.sin(t * 2 + s) * .1, bahu + 3.6); g.stroke(); kotak(g, s * 1.05 - .25, bahu + 3.5, .5, .7, "#c9c9c4"); });
      } else if (belakang) {
        isiHalus(g, [[-3.6, bahu - .4], [0, bahu - 1], [3.6, bahu - .4], [2.8, bahu + 3.4], [0, bahu + 4.4], [-2.8, bahu + 3.4]], P.bajuG, .3);
      }
      // tudung di leher
      if (!belakang && !jas) { g.beginPath(); g.ellipse(samping ? -1 : 0, bahu + .2, samping ? 3.2 : 4.4, 1.5, 0, Math.PI, 0); g.fillStyle = P.bajuG; g.fill(); tepi(g, .3); }
    }

    /* --- lengan --- */
    function lengan(lx, ly, sudut, panjang) {
      g.save(); g.translate(lx, ly); g.rotate(sudut || 0); panjang = panjang || 5.6;
      bulatIsi(g, -1.3, -.2, 2.6, panjang, 1.25, gaun ? gradX(g, -1.3, 1.3, P.kulit, P.kulit, P.kulitG) : gradX(g, -1.3, 1.3, P.bajuT, P.baju, P.bajuG), true);
      kotak(g, -1.2, panjang - 1.4, 2.4, .7, "rgba(0,0,0,.12)");
      lingkaran(g, 0, panjang + .2, 1.15, P.kulit, .3); g.restore();
    }
    var sw = o.jalan ? ay * .45 : 0, lb = bahu + .9;
    if (samping) lengan(.2, lb, -sw, 5.4);
    else if (pose === "hore") { lengan(-bw / 2 + .1, lb, 2.55 + Math.sin(t * 10) * .14, 5.4); lengan(bw / 2 - .1, lb, -2.55 - Math.sin(t * 10) * .14, 5.4); }
    else if (pose === "doa") { lengan(-bw / 2 + .4, lb, -.78, 4.5); lengan(bw / 2 - .4, lb, .78, 4.5); }
    else if (duduk) { lengan(-bw / 2 + .2, lb, -.35, 5.2); lengan(bw / 2 - .2, lb, .35, 5.2); }
    else if (pose === "sapu") { lengan(-bw / 2 + .3, lb, -.95 + Math.sin(t * 14) * .4, 5); lengan(bw / 2 - .3, lb, .95 - Math.sin(t * 14 + 1.4) * .4, 5); }
    else if (pose === "tulis") { lengan(-bw / 2 + .4, lb, -.92, 4.7); lengan(bw / 2 - .4, lb, .56 + Math.sin(t * 16) * .12, 4.7); }
    else { lengan(-bw / 2 - .2, lb, .1 + sw, 5.6); lengan(bw / 2 + .2, lb, -.1 - sw, 5.6); }
    if (pose === "tulis" && depan) {
      g.save(); g.translate(0, -9.8); g.rotate(-.08); bulatIsi(g, -3.4, -2.2, 6.8, 4.4, .5, "#fffaf0", true);
      for (var li = 0; li < 3; li++) kotak(g, -2.6, -1.2 + li * 1.2, Math.min(5.2, Math.max(0, (o.tulis || 0) * 16 - li * 5.2)), .32, "#8a5a6a");
      g.restore();
      g.save(); g.translate(1.6 + Math.sin(t * 16) * 1.2, -11.2); g.rotate(.5); kotak(g, -.35, -3, .7, 3.6, "#e8c25a"); kotak(g, -.35, .6, .7, .6, "#3a2a20"); g.restore();
    }

    /* --- cepol di belakang kepala (cewek) --- */
    function cepol(cx, cy) {
      lingkaran(g, cx, cy, 3.3, P.rambut, true);
      g.strokeStyle = P.rambutG; g.lineWidth = .3; g.beginPath(); g.arc(cx, cy, 2.1, .4, 4.2); g.stroke(); g.beginPath(); g.arc(cx + .3, cy + .2, 1, 2, 5.6); g.stroke();
      g.strokeStyle = P.rambutT; g.lineWidth = .45; g.beginPath(); g.arc(cx, cy, 2.6, 3.6, 4.6); g.stroke();
      elips(g, cx, cy + 3, 2.2, .75, P.bajuG);
    }
    if (cewek && !belakang) cepol(samping ? -2.2 : .4, hy - hr - 1.4);

    /* --- kepala --- */
    if (!samping || true) { [-1, 1].forEach(function (s) { if (samping && s > 0) return; elips(g, samping ? -1.2 : s * 7.3, hy + 1.2, 1.3, 1.7, P.kulit, .3); }); }
    var gk = g.createRadialGradient(-1.5, hy - 1, 1, 0, hy, hr + 1); gk.addColorStop(0, P.kulit); gk.addColorStop(.75, P.kulit); gk.addColorStop(1, P.kulitG);
    halus(g, [[-hr, hy - 1], [-hr + .4, hy - hr + 1], [0, hy - hr], [hr - .4, hy - hr + 1], [hr, hy - 1], [hr - .9, hy + 4.4], [samping ? 3 : 0, hy + 7.1], [-hr + .9, hy + 4.4]]);
    g.fillStyle = gk; g.fill(); tepi(g, .38);
    if (o.mulut === "tiup" && depan) { elips(g, -4.6, hy + 3.4, 2.1, 1.8, P.kulit); elips(g, 4.6, hy + 3.4, 2.1, 1.8, P.kulit); }

    /* --- wajah --- */
    if (!belakang) {
      var mataX = samping ? [3.5] : [-3, 3], my = hy + 1.7;
      mataX.forEach(function (ex) {
        if (o.mata === "pejam" || o.mata === "senang") {
          g.beginPath(); if (o.mata === "senang") g.arc(ex, my + .9, 1.5, Math.PI * 1.15, Math.PI * 1.85); else g.arc(ex, my - .3, 1.5, Math.PI * .15, Math.PI * .85);
          g.strokeStyle = "#2b1a12"; g.lineWidth = .7; g.lineCap = "round"; g.stroke();
          if (cewek && o.mata === "pejam") { g.beginPath(); g.moveTo(ex + (ex < 0 ? -1.5 : 1.5), my + .2); g.lineTo(ex + (ex < 0 ? -2.1 : 2.1), my - .2); g.lineWidth = .45; g.stroke(); }
        } else {
          var kedip = (Math.sin(t * 1.3 + (cewek ? 1 : 0)) > .985) ? .14 : 1, rx = samping ? 1.25 : 1.78, ry = 2.3 * kedip;
          elips(g, ex, my, rx, ry, "#fffaf6");
          var gr = g.createLinearGradient(0, my - 2.2, 0, my + 2.2); gr.addColorStop(0, "#26140c"); gr.addColorStop(.5, P.mata); gr.addColorStop(1, "#c08a5a");
          elips(g, ex + (samping ? .25 : 0), my + .18, rx * .86, ry * .9, gr);
          elips(g, ex + (samping ? .25 : 0), my + .1, rx * .4, ry * .42, "#1c0e08");
          if (kedip > .5) { lingkaran(g, ex - rx * .32, my - .8, .62, "#ffffff"); lingkaran(g, ex + rx * .35, my + .95, .3, "rgba(255,255,255,.85)"); elips(g, ex, my + 1.4, rx * .5, .35, "rgba(255,220,180,.35)"); }
          g.beginPath(); g.ellipse(ex, my + .1, rx + .2, ry + .2, 0, Math.PI * 1.06, Math.PI * 1.94); g.strokeStyle = "#2b1a12"; g.lineWidth = .78; g.lineCap = "round"; g.stroke();
          if (cewek) { var luar = ex + (ex < 0 ? -rx : rx); g.beginPath(); g.moveTo(luar, my - .9); g.lineTo(luar + (ex < 0 ? -.75 : .75), my - 1.6); g.lineWidth = .45; g.stroke(); }
          g.beginPath(); g.ellipse(ex, my + .2, rx * .8, ry * .95, 0, Math.PI * .3, Math.PI * .7); g.strokeStyle = "rgba(120,70,50,.45)"; g.lineWidth = .25; g.stroke();
        }
      });
      // pipi
      (samping ? [2.6] : [-4.6, 4.6]).forEach(function (bx) { var pg = g.createRadialGradient(bx, hy + 4.1, 0, bx, hy + 4.1, 1.9); pg.addColorStop(0, "rgba(240,128,118,.42)"); pg.addColorStop(1, "rgba(240,128,118,0)"); g.fillStyle = pg; g.beginPath(); g.ellipse(bx, hy + 4.1, 1.9, 1.1, 0, 0, 6.2832); g.fill(); });
      // hidung & mulut
      if (samping) { g.beginPath(); g.moveTo(hr - .2, hy + 2.4); g.quadraticCurveTo(hr + .7, hy + 3.4, hr - .3, hy + 3.8); g.strokeStyle = P.kulitG; g.lineWidth = .35; g.stroke(); }
      else { g.beginPath(); g.moveTo(.1, hy + 3.6); g.lineTo(.35, hy + 4.1); g.strokeStyle = P.kulitG; g.lineWidth = .35; g.stroke(); }
      var mx = samping ? 4.6 : 0, myy = hy + 5.4;
      if (o.mulut === "tiup") elips(g, mx, myy, .62, .72, "#a34a48", .3);
      else if (o.mulut === "buka") { g.beginPath(); g.moveTo(mx - 1.15, myy - .4); g.quadraticCurveTo(mx, myy + 1.9, mx + 1.15, myy - .4); g.closePath(); g.fillStyle = "#9c3f3e"; g.fill(); tepi(g, .3); elips(g, mx, myy + .7, .5, .3, "#e98a86"); }
      else { g.beginPath(); g.moveTo(mx - .85, myy - .3); g.quadraticCurveTo(mx, myy + .5, mx + .85, myy - .3); g.strokeStyle = "#8f4a42"; g.lineWidth = .36; g.lineCap = "round"; g.stroke(); }
    }

    /* --- rambut --- */
    var R1 = P.rambut;
    function kilauRambut(a0, a1, r) { g.beginPath(); g.arc(0, hy - .6, r || hr - 1.4, a0, a1); g.strokeStyle = P.rambutT; g.globalAlpha = .7; g.lineWidth = .9; g.lineCap = "round"; g.stroke(); g.globalAlpha = 1; }
    if (cewek) {
      if (belakang) {
        isiHalus(g, [[-hr - .5, hy], [-hr, hy - hr + .8], [0, hy - hr - .9], [hr, hy - hr + .8], [hr + .5, hy], [hr - .6, hy + 4.6], [0, hy + 6.2], [-hr + .6, hy + 4.6]], R1);
        g.strokeStyle = P.rambutG; g.lineWidth = .28; [-5, -2.5, 0, 2.5, 5].forEach(function (lx) { g.beginPath(); g.moveTo(lx, hy + 5); g.quadraticCurveTo(lx * .6, hy - 2, 0, hy - hr - .2); g.stroke(); });
        cepol(0, hy - hr - .9); kilauRambut(Math.PI * 1.2, Math.PI * 1.45);
      } else if (samping) {
        isiHalus(g, [[-hr - .5, hy + 4], [-hr - .4, hy - 2], [-hr + .6, hy - hr + .6], [0, hy - hr - .8], [hr - 1, hy - hr + 1.4], [hr + .3, hy - 2.2], [hr - 1.2, hy - 1.6], [hr - 2.8, hy - .6], [3.6, hy - 2, 1], [1.4, hy - .2], [-.4, hy + 1.5], [-1, hy + 5], [-3.2, hy + 6.2]], R1);
        isiHalus(g, [[hr - 2.4, hy - 1], [hr - .6, hy + 2.8], [hr - 1.2, hy + 6.6, 1], [hr - 2.6, hy + 2.6]], R1, .3);
        kilauRambut(Math.PI * 1.25, Math.PI * 1.55);
      } else {
        isiHalus(g, [[-hr - .6, hy + 3.4], [-hr - .3, hy - 3], [-hr + 1.2, hy - hr + .4], [0, hy - hr - .9], [hr - 1.2, hy - hr + .4], [hr + .3, hy - 3], [hr + .6, hy + 3.4], [hr - .6, hy + 3.6, 1], [hr - 1.2, hy - .6], [hr - 2.6, hy - 1.6], [2.4, hy - 2.9], [1, hy - 1.2, 1], [-.6, hy - 3.2], [-2.6, hy - 1.4, 1], [-4.2, hy - 2.6], [-hr + 1.6, hy - .8], [-hr + .6, hy + 3.6, 1]], R1);
        [-1, 1].forEach(function (s) { isiHalus(g, [[s * (hr - 1.2), hy - 1], [s * (hr - .1), hy + 2.6], [s * (hr - .6), hy + 6.8, 1], [s * (hr - 1.5), hy + 3]], R1, .3); });
        kilauRambut(Math.PI * 1.18, Math.PI * 1.4); kilauRambut(Math.PI * 1.55, Math.PI * 1.66);
      }
    } else {
      if (belakang) {
        isiHalus(g, [[-hr - .8, hy + 1], [-hr - 1.4, hy - 2.6, 1], [-hr + .2, hy - hr + .6], [-2.6, hy - hr - 1.6, 1], [0, hy - hr - .6], [3, hy - hr - 1.8, 1], [hr - .2, hy - hr + .8], [hr + 1.4, hy - 2.6, 1], [hr + .8, hy + 1], [hr - .4, hy + 4.4], [2, hy + 4.2, 1], [0, hy + 5.6], [-2, hy + 4.2, 1], [-hr + .4, hy + 4.4]], R1);
        kilauRambut(Math.PI * 1.25, Math.PI * 1.55);
      } else if (samping) {
        isiHalus(g, [[-hr - .7, hy + 4.2], [-hr - 1.2, hy - 2, 1], [-hr + .3, hy - hr + .4], [-2, hy - hr - 1.8, 1], [1, hy - hr - .8], [4.4, hy - hr - .4, 1], [hr - .3, hy - hr + 2], [hr + 1.4, hy - 2.4, 1], [hr - 1.2, hy - 1.4], [hr - 2, hy + .2, 1], [hr - 3.2, hy - 1.2], [3.4, hy - .2, 1], [1.6, hy - 1.4], [-.6, hy + 2.2], [-1.4, hy + 4.4, 1], [-3.4, hy + 3.6]], R1);
        kilauRambut(Math.PI * 1.3, Math.PI * 1.6);
      } else {
        isiHalus(g, [[-hr - .9, hy + 2.8], [-hr - 1.8, hy - 1.8, 1], [-hr - .8, hy - 5.4], [-hr + .6, hy - hr - 1.6, 1], [-3.2, hy - hr - 2.2], [-.6, hy - hr - 3.4, 1], [2.4, hy - hr - 2.4], [hr - 1.4, hy - hr - 1.2, 1], [hr + .6, hy - 4.8], [hr + 1.8, hy - 1.4, 1], [hr + .7, hy + 2.8], [hr - .6, hy + 1.2, 1], [hr - 1.6, hy - 1.4], [4, hy + .6, 1], [3, hy - 1.8], [1.6, hy + .4, 1], [.4, hy - 2], [-1, hy + .5, 1], [-2.2, hy - 1.8], [-3.6, hy + .7, 1], [-4.6, hy - 1.6], [-hr + 1.4, hy + 1.2, 1], [-hr + .6, hy - .2]], R1);
        kilauRambut(Math.PI * 1.2, Math.PI * 1.38); kilauRambut(Math.PI * 1.55, Math.PI * 1.7);
      }
    }
    // alis (tipis, terlihat dari balik poni)
    if (!belakang && o.mata !== "pejam") {
      g.strokeStyle = cewek ? "rgba(80,48,34,.75)" : "rgba(30,24,26,.75)"; g.lineWidth = .4; g.lineCap = "round";
      (samping ? [3.4] : [-3, 3]).forEach(function (ex) { g.beginPath(); g.moveTo(ex - 1.1, hy - 1.5); g.quadraticCurveTo(ex, hy - 2.1, ex + 1.1, hy - 1.6); g.stroke(); });
    }
    g.restore();
  }
  function potret(cv, jenis, opsi) {
    var g = cv.getContext("2d"), s = cv.width / 18; opsi = opsi || {};
    g.clearRect(0, 0, cv.width, cv.height); g.save(); g.scale(s, s);
    if (opsi.penuh) { g.translate(9, cv.height / s - 2.2); g.scale(.52, .52); } else g.translate(9, 29.5);
    gambarOrang(g, { jenis: jenis, arah: "bawah", jalan: false, anim: 0, mata: opsi.mata, mulut: opsi.mulut, pose: opsi.pose, baju: opsi.baju, tanpaBayangan: !opsi.penuh }, 0, 0, 0);
    g.restore();
  }

  /* ---------- Benda ---------- */
  function balon(g, x, y, r, warna, ax, ay, bentuk) {
    if (ax != null) { g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = .35; g.beginPath(); g.moveTo(x, y + r * 1.15); g.quadraticCurveTo(x + (ax - x) * .2 + 2, (y + ay) / 2, ax, ay); g.stroke(); }
    if (bentuk === "hati") { hati(g, x, y + r * .1, r * 1.05, warna, "rgba(0,0,0,.15)"); kilau(g, x - r * .45, y - r * .25, r * .3, .7); return; }
    var gr = g.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r * 1.1); gr.addColorStop(0, "rgba(255,255,255,.55)"); gr.addColorStop(.35, warna); gr.addColorStop(1, warna);
    g.beginPath(); g.ellipse(x, y, r * .88, r * 1.05, 0, 0, 6.2832); g.fillStyle = gr; g.fill(); g.strokeStyle = "rgba(0,0,0,.14)"; g.lineWidth = .35; g.stroke();
    poligon(g, [[x - .9, y + r * 1.2], [x + .9, y + r * 1.2], [x, y + r * 1.0]], warna);
    kilau(g, x - r * .38, y - r * .45, r * .28, .8);
  }
  function kumpulanBalon(g, x, y, t, jml, fase, tinggi, hatiSaja) {
    tinggi = tinggi || 30;
    bayangan(g, x, y, 4, 1.4); hati(g, x, y - 1.6, 1.8, "#e85d8f");
    for (var i = 0; i < jml; i++) {
      var a = (i / jml - .5) * 1.7, r = 5 + acak(i, fase) * 1.6;
      var bx = x + Math.sin(a) * 10 + Math.sin(t * 1.1 + i + fase) * 1.4, by = y - tinggi + Math.cos(a) * 4 - acak(fase, i) * 9 + Math.sin(t * 1.6 + i * 2 + fase) * 1.3;
      balon(g, bx, by, r, hatiSaja ? ["#ff5f8f", "#ff8fb1", "#ffffff", "#e83f6f"][i % 4] : WARNA[(i + fase) % WARNA.length], x, y - 2, hatiSaja || (i + fase) % 4 === 0 ? "hati" : null);
    }
  }
  function hadiahKotak(g, x, y, w, h, warna, pitaW) {
    bayangan(g, x + w / 2, y + h, w * .6, 1.6);
    kotak(g, x, y, w, h, warna); kotak(g, x + w * .62, y, w * .38, h, "rgba(0,0,0,.1)"); kotak(g, x - .6, y - 2.6, w + 1.2, 3, warna); kotak(g, x - .6, y - 2.6, w + 1.2, 1, "rgba(255,255,255,.3)");
    kotak(g, x + w / 2 - 1, y - 2.6, 2, h + 2.6, pitaW); kotak(g, x, y + h * .4, w, 1.5, pitaW);
    elips(g, x + w / 2 - 2.2, y - 3.9, 2.4, 1.5, pitaW, .35); elips(g, x + w / 2 + 2.2, y - 3.9, 2.4, 1.5, pitaW, .35);
    g.strokeStyle = OUT; g.lineWidth = .4; g.strokeRect(x - .6, y - 2.6, w + 1.2, h + 2.6);
  }
  function hurufFoil(g, teks, cx, y, ukuran, t, warna) {
    g.font = "700 " + ukuran + "px Fredoka, Nunito, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    var lebar = teks.split("").map(function (h) { return h === " " ? ukuran * .35 : g.measureText(h).width + ukuran * .1; }), total = lebar.reduce(function (a, b) { return a + b; }, 0), x = cx - total / 2;
    teks.split("").forEach(function (h, i) {
      if (h !== " ") {
        var hx = x + lebar[i] / 2, hy = y + Math.sin(t * 1.3 + i) * .5;
        g.save(); g.translate(hx, hy); g.rotate(Math.sin(t * .9 + i * 1.7) * .06);
        var gr = g.createLinearGradient(0, -ukuran / 2, 0, ukuran / 2);
        (warna || ["#fff6cf", "#e9c25a", "#fff3c0", "#c89a35"]).forEach(function (c, k, arr) { gr.addColorStop(k / (arr.length - 1), c); });
        g.lineJoin = "round"; g.lineWidth = ukuran * .16; g.strokeStyle = "rgba(90,60,30,.55)"; g.strokeText(h, 0, 0);
        g.fillStyle = gr; g.fillText(h, 0, 0); kilau(g, -ukuran * .18, -ukuran * .22, ukuran * .12, .8);
        g.restore();
      }
      x += lebar[i];
    });
  }
  function lampuHias(g, t, x0, x1, y) {
    g.strokeStyle = "rgba(60,40,30,.55)"; g.lineWidth = .4; g.beginPath(); g.moveTo(x0, y);
    for (var x = x0; x < x1; x += 20) g.quadraticCurveTo(x + 10, y + 5, Math.min(x1, x + 20), y); g.stroke();
    for (var i = 0, xx = x0 + 5; xx < x1; xx += 10, i++) { var on = (Math.sin(t * 3 + i * 1.3) + 1) / 2, yy = y + (i % 2 ? 3.4 : 2.4); cahaya(g, xx, yy + 1, 4.5, "255,226,140", .25 + on * .4); lingkaran(g, xx, yy + 1, .95, on > .5 ? "#fff3b0" : "#ffd36e"); }
  }
  function benderaSegitiga(g, t, x0, x1, y) {
    g.strokeStyle = "rgba(90,60,60,.6)"; g.lineWidth = .4; g.beginPath(); g.moveTo(x0, y); g.quadraticCurveTo((x0 + x1) / 2, y + 10, x1, y); g.stroke();
    var n = Math.round((x1 - x0) / 9);
    for (var i = 1; i < n; i++) { var u = i / n, x = x0 + u * (x1 - x0), yy = y + 4 * 2 * u * (1 - u) * 5 - .4, sw = Math.sin(t * 2 + i) * .5; poligon(g, [[x - 3, yy], [x + 3, yy], [x + sw, yy + 6]], WARNA[i % 6]); }
  }

  /* ---------- Kue ulang tahun dengan lilin angka ---------- */
  var KUE = { padam: false, angin: 0 };
  function kue(g, cx, y, t, opsi) {
    opsi = opsi || KUE;
    // alas emas
    elips(g, cx, y + .6, 25, 6.6, "rgba(0,0,0,.35)");
    elips(g, cx, y, 24, 6.2, gradX(g, cx - 24, cx + 24, "#8a6420", "#e2b44c", "#9a7026"));
    elips(g, cx, y - .7, 22.6, 5.4, gradX(g, cx - 22, cx + 22, "#b08a35", "#f3d277", "#b8903a"));
    // badan kue cokelat
    var atas = y - 21, bw = 17.5;
    elips(g, cx, y - 2, bw, 4.3, "#1c0f0a");
    kotak(g, cx - bw, atas, bw * 2, y - 2 - atas, gradX(g, cx - bw, cx + bw, "#1f110b", "#4a2a1c", "#22130c"));
    kotak(g, cx - bw, y - 7, bw * 2, 5, gradX(g, cx - bw, cx + bw, "#14100e", "#2c2420", "#14100e"));
    for (var s = 0; s < 60; s++) { var sx = cx - bw + acak(s, 7) * bw * 2, sy = y - 6.6 + acak(7, s) * 4.6; kotak(g, sx, sy, .45, .45, acak(s, 8) > .5 ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.4)"); }
    elips(g, cx, y - 2, bw, 4.3, null); g.save(); g.beginPath(); g.ellipse(cx, y - 2, bw, 4.3, 0, 0, Math.PI); g.fillStyle = "#14100e"; g.fill(); g.restore();
    // ganache meleleh
    elips(g, cx, atas, bw, 4.3, "#2a160e");
    g.fillStyle = "#2f1a10";
    for (var d = 0; d < 15; d++) { var dx = cx - bw + .8 + d * (bw * 2 - 1.6) / 14, pj = 2.2 + acak(d, 3) * 5.4, dy = atas + Math.sin(Math.acos(Math.max(-1, Math.min(1, (dx - cx) / bw)))) * 4.1; g.beginPath(); g.moveTo(dx - 1.25, dy - 1); g.lineTo(dx - 1, dy + pj); g.arc(dx, dy + pj, 1, Math.PI, 0, true); g.lineTo(dx + 1.25, dy - 1); g.fill(); }
    g.save(); g.beginPath(); g.ellipse(cx, atas, bw, 4.3, 0, 0, Math.PI); g.lineTo(cx - bw, atas - 1); g.fillStyle = "#2f1a10"; g.fill(); g.restore();
    elips(g, cx, atas, bw - .6, 3.8, gradX(g, cx - bw, cx + bw, "#2b170f", "#4a2b1b", "#2b170f"));
    g.strokeStyle = "rgba(255,220,190,.22)"; g.lineWidth = .6; g.beginPath(); g.ellipse(cx, atas, bw - 1.4, 3.2, 0, Math.PI * 1.1, Math.PI * 1.45); g.stroke();
    kotak(g, cx + 6, atas + 4, 1.2, y - atas - 10, "rgba(255,220,190,.10)");
    // stroberi di pinggir (belakang dulu)
    function stroberi(a) {
      var x = cx + Math.cos(a) * (bw - 3.4), yy = atas + Math.sin(a) * 2.7 - 1.4;
      g.save(); g.translate(x, yy); g.rotate(Math.cos(a) * .4);
      g.beginPath(); g.moveTo(-2.2, -.8); g.quadraticCurveTo(-2.4, 2.2, 0, 3.6); g.quadraticCurveTo(2.4, 2.2, 2.2, -.8); g.quadraticCurveTo(0, -2.2, -2.2, -.8);
      g.fillStyle = gradX(g, -2.4, 2.4, "#8e1418", "#d1302f", "#9b1a1b"); g.fill();
      for (var b = 0; b < 5; b++) kotak(g, -1.2 + (b % 3) * 1.1, .2 + Math.floor(b / 3) * 1.4, .3, .3, "#f3d27a");
      poligon(g, [[-1.8, -1.2], [0, -.4], [1.8, -1.2], [0, -2.4]], "#3f7a2c"); elips(g, -.9, 0, .5, .9, "rgba(255,255,255,.4)");
      g.restore();
    }
    var sudut = []; for (var i = 0; i < 10; i++) sudut.push(i / 10 * 6.2832 + .3);
    sudut.filter(function (a) { return Math.sin(a) < 0; }).forEach(stroberi);
    // lilin tipis bergaris
    [[-8.4, 11, -1.4], [-4.2, 12.5, .6], [0, 13.5, -.4], [4.2, 12, .8], [8.4, 10.5, -1]].forEach(function (c, j) {
      var lx = cx + c[0], ly = atas + c[2], h = c[1];
      kotak(g, lx - .65, ly - h, 1.3, h, gradX(g, lx - .7, lx + .7, "#d9cdb4", "#fff6e2", "#cdbf9f"));
      g.strokeStyle = "rgba(190,40,50,.75)"; g.lineWidth = .35; for (var k = 0; k < h / 2.2; k++) { g.beginPath(); g.moveTo(lx - .65, ly - 1 - k * 2.2); g.lineTo(lx + .65, ly - 2 - k * 2.2); g.stroke(); }
      kotak(g, lx - .1, ly - h - 1, .2, 1, "#2a1a10");
      nyala(g, lx, ly - h - 1, t + j * .7, opsi);
    });
    sudut.filter(function (a) { return Math.sin(a) >= 0; }).forEach(stroberi);
  }
  function nyala(g, x, y, t, opsi) {
    if (opsi.padam) return;
    var ang = opsi.angin || 0, f = Math.sin(t * 13) * .35, miring = ang * 3.2 + Math.sin(t * 30) * ang, kecil = 1 - ang * .55;
    cahaya(g, x, y - 2.5, 8 * kecil, "255,200,90", .4 * kecil);
    g.fillStyle = "#ffb43a"; g.beginPath(); g.moveTo(x + miring, y - 5 * kecil + f); g.quadraticCurveTo(x + 1.9 * kecil, y - 1.6, x, y); g.quadraticCurveTo(x - 1.9 * kecil, y - 1.6, x + miring, y - 5 * kecil + f); g.fill();
    g.fillStyle = "#fff4b8"; g.beginPath(); g.moveTo(x + miring * .7, y - 3.1 * kecil + f); g.quadraticCurveTo(x + .8, y - 1.2, x, y - .4); g.quadraticCurveTo(x - .8, y - 1.2, x + miring * .7, y - 3.1 * kecil + f); g.fill();
  }

  /* =====================================================================
     ADEGAN (satuan piksel dunia; 1 petak = 16)
     ===================================================================== */
  var fotoGaleri = (D.galeri || []).slice(0, 6).map(function (src) { var im = new Image(); im.src = src; return im; });
  /* ---------- Gaya lukisan untuk bagian luar (tanpa garis tepi, cahaya dari kanan atas) ---------- */
  var DAUN = ["#1c3519", "#24431f", "#2f5627", "#3c6b2f", "#4f8236", "#689a42", "#86b04f", "#a9c766", "#cfdd8c"];
  function warnaDaun(b) { return DAUN[Math.max(0, Math.min(DAUN.length - 1, Math.round(b * (DAUN.length - 1))))]; }
  function dab(g, x, y, rx, ry, rot, c) { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 6.2832); g.fillStyle = c; g.fill(); }
  /* gumpalan daun: titik-titik kuas; sisi kanan atas lebih terang */
  function dedaunan(g, cx, cy, rx, ry, n, k, terang, ukuran) {
    terang = terang == null ? 0 : terang; ukuran = ukuran || 1;
    dab(g, cx - rx * .05, cy + ry * .08, rx, ry, 0, "rgba(22,40,20,.92)");
    for (var i = 0; i < n; i++) {
      var a = acak(i, k) * 6.2832, r = Math.sqrt(acak(k, i)), x = cx + Math.cos(a) * r * rx, y = cy + Math.sin(a) * r * ry;
      var b = .5 + ((x - cx) / rx * .45 - (y - cy) / ry * .6) * .55 + (acak(i, k, 3) - .5) * .35 + terang;
      if (r > .85) b -= .12;
      dab(g, x, y, (1.4 + acak(i, k, 4) * 1.8) * ukuran, (.8 + acak(i, k, 5) * 1) * ukuran, acak(i, k, 6) * 3, warnaDaun(b * .85 + .05));
    }
  }
  function rumputLukis(g, x0, y0, w, h, k) {
    g.fillStyle = gradV(g, y0, y0 + h, "#6c9a43", "#5c8a3a"); g.fillRect(x0, y0, w, h);
    for (var p = 0; p < w * h / 2600; p++) { var px = x0 + acak(p, k, 1) * w, py = y0 + acak(k, p, 2) * h; cahaya(g, px, py, 14 + acak(p, k, 3) * 26, acak(p, k, 4) > .5 ? "150,190,90" : "50,90,40", .18); }
    var war = ["#577f35", "#668f3d", "#76a046", "#86ad51", "#4c7530", "#93b85c"];
    for (var i = 0; i < w * h / 9; i++) { var x = x0 + acak(i, k, 7) * w, y = y0 + acak(k, i, 8) * h; dab(g, x, y, 1.2 + acak(i, k, 9) * 1.6, .6 + acak(i, k, 10) * .6, acak(i, k, 11) * .6 - .3, war[i % 6]); }
    g.lineWidth = .4; g.lineCap = "round";
    for (var j = 0; j < w * h / 7; j++) { var bx = x0 + acak(j, k, 12) * w, by = y0 + acak(k, j, 13) * h, c = acak(j, k, 14); g.strokeStyle = c > .6 ? "rgba(170,205,110,.55)" : c > .3 ? "rgba(60,100,40,.5)" : "rgba(110,150,70,.5)"; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + (c - .5) * 1.6, by - 1.6 - c * 1.6); g.stroke(); }
  }
  function bungaKecil(g, x, y, k) {
    var w = ["#f4f1e6", "#f3d26b", "#e9a0a8", "#c9b6e4"][k % 4];
    g.strokeStyle = "#4f7a33"; g.lineWidth = .35; g.beginPath(); g.moveTo(x, y + 2.6); g.lineTo(x + .2, y); g.stroke();
    for (var i = 0; i < 5; i++) { var a = i * 1.2566 + k; dab(g, x + Math.cos(a) * .7, y + Math.sin(a) * .7, .62, .62, 0, w); }
    dab(g, x, y, .38, .38, 0, "#e3b23c");
  }
  function semak(g, cx, cy, rx, ry, k, bunga) {
    elips(g, cx - 3, cy + ry * .7, rx * 1.05, ry * .4, "rgba(20,40,15,.28)");
    dedaunan(g, cx, cy, rx, ry, Math.round(rx * ry * 1.4), k, .05, .8);
    if (bunga) for (var i = 0; i < bunga; i++) { var a = acak(i, k, 20) * 6.28, r = Math.sqrt(acak(k, i, 21)) * .8; dab(g, cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r - .5, .7, .7, 0, ["#f6f2e8", "#f2c9cf", "#f5dc85"][(i + k) % 3]); }
  }

  var JALUR = null;
  function buatLuar() {
    var W = 360, H = 414, M = 170;
    var A = { id: "luar", W: W, H: H, M: M, latar: "#0d1220", padat: [], sprite: [], tempat: [], pindah: [], benda: [], lokasi: "Depan rumah", tinggi: 17.5 };
    function blok(x, y, w, h) { A.padat.push([x, y, w, h]); }
    blok(0, 0, W, 216);
    blok(0, 216, 96, 28); blok(18, 244, 48, 26);            // bawah pohon & batang
    blok(118, 216, 56, 10); blok(206, 216, 58, 10);          // bedeng bunga depan teras
    blok(90, 257, 30, 7);                                    // bangku kayu
    blok(286, 228, 34, 18);                                  // pot tanaman pojok
    blok(0, 306, 174, 30); blok(206, 306, W - 206, 30);      // pagar
    blok(224, 336, 6, 5);                                    // tiang kotak surat
    blok(117, 361, 7, 6); blok(317, 361, 7, 6);              // tiang lampu jalan
    [[168, 248], [212, 248], [168, 290], [212, 290]].forEach(function (l) { blok(l[0] - 2, l[1] - 3, 4, 3); });   // lampu taman
    blok(0, 370, W, H - 370);                                // jalan raya

    var POHON = { x: 42, y: 270 };
    A.lantai = function (g) {
      // halaman (melebar ke kiri-kanan agar layar lebar tetap terisi)
      rumputLukis(g, -M, 40, W + M * 2, 300, 3);
      // rimbun di belakang rumah & tetangga
      for (var i = 0; i < 46; i++) { var bx = -M + i * ((W + M * 2) / 45), by = 26 + acak(i, 2) * 30; dedaunan(g, bx, by, 26 + acak(i, 3) * 10, 30 + acak(3, i) * 8, 260, i + 40, -.1, 1.1); }
      // pagar tembok tetangga di kanan + semak
      for (var hb = 0; hb < 10; hb++) dedaunan(g, 282 + hb * 24, 150 + acak(hb, 8) * 10, 20, 28, 420, hb + 120, -.05, 1);
      elips(g, 330, 196, 40, 8, "rgba(20,35,15,.3)"); dedaunan(g, 334, 120, 44, 46, 1300, 150, .05, 1.1);
      for (var s = 0; s < 9; s++) semak(g, 286 + s * 26, 204 + acak(s, 9) * 6, 15, 11, s + 70, s % 3 === 0 ? 5 : 0);
      // bayangan pohon & cahaya yang menembus daun
      g.save(); g.beginPath(); g.ellipse(POHON.x - 30, 236, 190, 66, -.05, 0, 6.2832); g.clip();
      g.fillStyle = "rgba(20,45,20,.38)"; g.fillRect(-M, 150, 420, 200);
      for (var d = 0; d < 90; d++) { var lx = POHON.x - 200 + acak(d, 31) * 360, ly = 180 + acak(31, d) * 120; cahaya(g, lx, ly, 3 + acak(d, 32) * 6, "255,240,170", .35); }
      g.restore();
      // jalan setapak (lempeng batu) dari gerbang ke teras
      for (var py = 226; py < 306; py += 11) {
        var o = (py / 11) % 2 ? 1 : -1;
        elips(g, 190 + o, py + 5, 13, 4.2, "rgba(30,40,20,.25)");
        bulatIsi(g, 177 + o, py, 26, 8.5, 2.4, "#b9b2a4"); bulatIsi(g, 177 + o, py, 26, 7, 2.4, "#d2ccbf");
        for (var q = 0; q < 10; q++) dab(g, 179 + o + acak(q, py) * 22, py + 1 + acak(py, q) * 5, .9, .5, 0, acak(q, py, 2) > .5 ? "rgba(255,255,255,.25)" : "rgba(90,85,70,.2)");
      }
      gambarRumah(g);
      // bedeng bunga biasa di depan teras
      [[118, 174], [206, 264]].forEach(function (s, j) {
        bulatIsi(g, s[0], 216, s[1] - s[0], 11, 3, "#6a4e38"); kotak(g, s[0], 224, s[1] - s[0], 2.5, "#8d7b66");
        for (var x2 = s[0] + 5; x2 < s[1] - 2; x2 += 7) semak(g, x2, 216, 5.4, 4.6, x2 + j * 7, 3);
      });
      // pot di pojok kanan
      [[294, 236, 9], [310, 240, 7], [302, 246, 6]].forEach(function (p, j) {
        elips(g, p[0] - 2, p[1] + 2, p[2] * .8, 2, "rgba(20,30,15,.3)");
        poligon(g, [[p[0] - p[2] * .55, p[1] - p[2] * .6], [p[0] + p[2] * .55, p[1] - p[2] * .6], [p[0] + p[2] * .42, p[1] + 1], [p[0] - p[2] * .42, p[1] + 1]], gradX(g, p[0] - p[2], p[0] + p[2], "#9c5534", "#bd6c43", "#d48a5c"));
        semak(g, p[0], p[1] - p[2] * 1.1, p[2] * .75, p[2] * .65, 90 + j, j === 1 ? 4 : 0);
      });
      // bunga liar kecil di rumput
      for (var f = 0; f < 70; f++) { var fx = 70 + acak(f, 51) * 280, fy = 232 + acak(51, f) * 70; if (Math.abs(fx - 190) < 20 || (fx > 84 && fx < 124 && fy > 250 && fy < 268) || (fx > 280 && fy < 250)) continue; bungaKecil(g, fx, fy, f); }
      gambarBatang(g);
      gambarPagar(g);
      gambarJalan(g);
    };

    function gambarRumah(g) {
      // bayangan rumah jatuh ke kiri bawah
      poligon(g, [[118, 210], [262, 210], [252, 224], [104, 224]], "rgba(20,35,15,.28)");
      // atap atas (genteng)
      var atap = [[116, 86], [264, 86], [238, 28], [142, 28]];
      poligon(g, atap, gradX(g, 116, 264, "#7f4330", "#a3583a", "#c0714a"));
      g.save(); poligon(g, atap); g.clip();
      for (var sy = 30; sy < 88; sy += 4.6) { kotak(g, 100, sy + 3.4, 180, 1.2, "rgba(60,25,15,.35)"); for (var sx = 100 + (sy % 9.2); sx < 280; sx += 9.2) kotak(g, sx, sy, .6, 4.4, "rgba(60,25,15,.22)"); }
      for (var w = 0; w < 160; w++) dab(g, 116 + acak(w, 61) * 148, 30 + acak(61, w) * 56, 1.6, .9, 0, acak(w, 62) > .5 ? "rgba(255,200,160,.12)" : "rgba(50,20,10,.12)");
      poligon(g, [[190, 28], [238, 28], [264, 86], [210, 86]], "rgba(255,220,180,.10)");
      g.restore();
      kotak(g, 142, 26, 96, 3.4, "#6e3826");
      kotak(g, 114, 86, 152, 3, "#efe9dc"); kotak(g, 114, 89, 152, 1, "rgba(0,0,0,.2)");
      // dinding lantai 2
      kotak(g, 128, 89, 124, 46, gradX(g, 128, 252, "#ddd3bf", "#ebe3d1", "#f4eee0"));
      kotak(g, 128, 89, 124, 6, "rgba(40,30,20,.18)");
      [[142, 96, 24, 30], [214, 96, 24, 30]].forEach(function (j) { jendela(g, j[0], j[1], j[2], j[3]); });
      jendela(g, 183, 98, 14, 22, false, true);
      // atap teras / lantai 1
      var atap2 = [[110, 154], [270, 154], [258, 134], [122, 134]];
      poligon(g, atap2, gradX(g, 110, 270, "#7f4330", "#a3583a", "#c0714a"));
      g.save(); poligon(g, atap2); g.clip(); for (var ty = 135; ty < 155; ty += 4.4) kotak(g, 100, ty + 3.2, 180, 1.1, "rgba(60,25,15,.35)"); g.restore();
      kotak(g, 108, 154, 164, 3, "#efe9dc"); kotak(g, 108, 157, 164, 1, "rgba(0,0,0,.2)");
      // dinding lantai 1
      kotak(g, 120, 157, 140, 50, gradX(g, 120, 260, "#d9cfbb", "#e8e0cd", "#f2ebdc"));
      kotak(g, 120, 157, 140, 7, "rgba(40,30,20,.2)");
      jendela(g, 132, 166, 34, 26); jendela(g, 214, 166, 34, 26);
      // pintu kayu (bingkai; daunnya digambar sebagai sprite)
      kotak(g, 177, 160, 26, 47, "#cfc5b2"); kotak(g, 179, 162, 22, 45, "#1b1410");
      // lampu dinding, nomor rumah
      kotak(g, 170, 172, 3, 5, "#3b3530"); bulatIsi(g, 169.4, 168, 4.2, 5, 1, "#f1ead2"); kotak(g, 169.4, 172, 4.2, .8, "#3b3530");
      bulatIsi(g, 206, 170, 8, 5, .8, "#3d4a3f"); g.font = "600 3.6px Nunito, sans-serif"; g.fillStyle = "#f1ead2"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("12", 210, 172.7);
      // plint & lantai teras
      kotak(g, 118, 204, 144, 4, "#9a948a");
      kotak(g, 114, 207, 152, 9, gradV(g, 207, 216, "#cdc4b3", "#b8ae9c")); for (var tx = 114; tx < 266; tx += 9.5) kotak(g, tx, 207, .5, 9, "rgba(80,70,55,.25)");
      kotak(g, 176, 216, 28, 4, "#bdb4a3"); kotak(g, 176, 219.5, 28, .8, "rgba(0,0,0,.2)");
      bulatIsi(g, 182, 209.5, 16, 5, 1, "#7a5a3c"); // keset
      // dua pot di samping pintu
      [171, 209].forEach(function (px) { poligon(g, [[px - 3, 202], [px + 3, 202], [px + 2.4, 208], [px - 2.4, 208]], "#b0623d"); semak(g, px, 199, 4.2, 4.4, px, 0); });
    }
    function jendela(g, x, y, w, h, tanpaTirai, kecil) {
      kotak(g, x - 1.6, y - 1.6, w + 3.2, h + 3.2, "#6e4a30"); kotak(g, x - 1.6, y + h + .6, w + 3.2, 1.8, "#cfc5b2");
      var gr = g.createLinearGradient(x, y, x + w * .4, y + h); gr.addColorStop(0, "#ffe2a0"); gr.addColorStop(.5, "#f1bf6c"); gr.addColorStop(1, "#c98a46");
      kotak(g, x, y, w, h, gr);
      if (!kecil) { kotak(g, x, y, w * .26, h, "rgba(250,226,180,.9)"); kotak(g, x + w * .74, y, w * .26, h, "rgba(250,226,180,.9)"); for (var c = 0; c < 3; c++) { kotak(g, x + c * w * .085 + 1, y, .4, h, "rgba(150,140,120,.35)"); kotak(g, x + w * .76 + c * w * .085, y, .4, h, "rgba(150,140,120,.35)"); } }
      kotak(g, x + w / 2 - .7, y, 1.4, h, "#6e4a30"); if (!kecil) kotak(g, x, y + h * .42, w, 1.2, "#6e4a30");
      poligon(g, [[x + w * .3, y + h], [x + w * .55, y], [x + w * .66, y], [x + w * .41, y + h]], "rgba(255,255,255,.16)");
    }
    function gambarBatang(g) {
      var x = POHON.x, y = POHON.y;
      elips(g, x - 6, y + 4, 40, 9, "rgba(20,30,15,.35)");
      // akar papan menjalar di tanah (pipih, meruncing)
      function akar(x0, y0, x1, y1, cxp, cyp, w0) {
        var kiri = [], kanan = [];
        for (var i = 0; i <= 12; i++) {
          var u = i / 12, m = 1 - u, px = m * m * x0 + 2 * m * u * cxp + u * u * x1, py = m * m * y0 + 2 * m * u * cyp + u * u * y1, w = w0 * (1 - u * .92);
          kiri.push([px, py - w * .55]); kanan.unshift([px, py + w * .35]);
        }
        poligon(g, kiri.concat(kanan), "#4a3c2f"); g.strokeStyle = "rgba(170,150,115,.45)"; g.lineWidth = .7; g.beginPath(); kiri.forEach(function (p, i) { if (i) g.lineTo(p[0], p[1] + .4); else g.moveTo(p[0], p[1] + .4); }); g.stroke();
      }
      [[-1, 40, 6], [-1, 28, -4], [1, 36, 6], [1, 24, -3], [-1, 20, 11], [1, 18, 10]].forEach(function (r) { akar(x + r[0] * 10, y - 3, x + r[0] * r[1], y + r[2], x + r[0] * r[1] * .55, y + r[2] * .1 - 1, 9); });
      // batang: banyak serat yang terpilin
      var bawah = y + 2, atas = 150;
      g.fillStyle = "#3f3328"; g.beginPath(); g.moveTo(x - 26, bawah); g.bezierCurveTo(x - 13, y - 22, x - 18, 200, x - 26, atas); g.lineTo(x + 24, atas); g.bezierCurveTo(x + 14, 200, x + 12, y - 22, x + 26, bawah); g.closePath(); g.fill();
      for (var s = 0; s < 24; s++) {
        var u = s / 23, bx = x - 22 + u * 44, tx = x - 24 + u * 48 + Math.sin(s * 1.7) * 3, lw = 1.8 + acak(s, 5) * 1.8;
        var cbx = x - 26 + acak(s, 6) * 52;
        [["rgba(40,32,24,.8)", lw + 1], [["#4c3e31", "#594a3b", "#665543"][s % 3], lw], [u > .55 ? "rgba(200,180,140,.35)" : "rgba(140,120,95,.22)", lw * .3]].forEach(function (st, l) {
          g.strokeStyle = st[0]; g.lineWidth = st[1]; g.beginPath(); g.moveTo(bx + (l === 2 ? lw * .2 : 0), bawah - 2); g.bezierCurveTo(cbx, y - 24, x - 18 + acak(s, 7) * 36, 212, tx + (l === 2 ? lw * .2 : 0), atas); g.stroke();
        });
      }
      // cahaya matahari dari kanan & lumut
      g.save(); g.beginPath(); g.moveTo(x - 26, bawah); g.bezierCurveTo(x - 13, y - 22, x - 18, 200, x - 26, atas); g.lineTo(x + 24, atas); g.bezierCurveTo(x + 14, 200, x + 12, y - 22, x + 26, bawah); g.closePath(); g.clip();
      var sinar = g.createLinearGradient(x - 24, 0, x + 24, 0); sinar.addColorStop(0, "rgba(10,10,5,.35)"); sinar.addColorStop(.55, "rgba(0,0,0,0)"); sinar.addColorStop(1, "rgba(255,230,170,.25)"); g.fillStyle = sinar; g.fillRect(x - 30, atas, 60, bawah - atas);
      for (var m = 0; m < 50; m++) dab(g, x - 22 + acak(m, 81) * 44, atas + acak(81, m) * (bawah - atas), 1.6, 1, 0, acak(m, 82) > .5 ? "rgba(110,140,60,.35)" : "rgba(255,235,180,.22)");
      g.restore();
      // akar gantung yang sudah menyentuh tanah di samping batang
      [[x - 30, 6], [x + 30, 4], [x + 36, 2]].forEach(function (a, j) { g.strokeStyle = "rgba(70,56,42,.85)"; g.lineWidth = 1.2 + j * .2; g.beginPath(); g.moveTo(a[0] + 4, 196); g.quadraticCurveTo(a[0] - 2, 230, a[0], y + a[1]); g.stroke(); });
    }
    function gambarPagar(g) {
      // daun pintu gerbang (terbuka ke dalam, menempel di pagar)
      [[174, 150], [206, 230]].forEach(function (d) {
        var x0 = Math.min(d[0], d[1]), x1 = Math.max(d[0], d[1]);
        kotak(g, x0, 296, x1 - x0, 1.6, "#24221f"); kotak(g, x0, 306, x1 - x0, 1.6, "#24221f");
        for (var b = x0 + 1; b < x1; b += 3) kotak(g, b, 296, .9, 12, "#2f2c28");
      });
      // tembok pagar rendah + jeruji besi
      [[-M, 162], [218, W + M]].forEach(function (s) {
        var x0 = s[0], w = s[1] - s[0];
        kotak(g, x0, 300, w, 1.3, "#1f1d1b"); for (var b = x0 + 1; b < s[1]; b += 4) kotak(g, b, 300, 1, 12, "#2a2724");
        kotak(g, x0, 310, w, 5, gradV(g, 310, 315, "#d7d0c2", "#bdb5a5"));
        kotak(g, x0, 315, w, 17, gradV(g, 315, 332, "#e7e0d1", "#cfc6b4"));
        for (var n = 0; n < w / 3; n++) dab(g, x0 + acak(n, 91) * w, 316 + acak(91, n) * 15, 1.4, .6, 0, acak(n, 92) > .5 ? "rgba(255,255,255,.18)" : "rgba(90,80,60,.14)");
        kotak(g, x0, 331, w, 3, "rgba(30,25,20,.25)");
      });
      // pilar gerbang
      [[162, 174], [206, 218]].forEach(function (p) {
        kotak(g, p[0], 294, p[1] - p[0], 38, gradX(g, p[0], p[1], "#cfc6b4", "#e2dbcc", "#f0eadc"));
        kotak(g, p[0] - 1.4, 290, p[1] - p[0] + 2.8, 5, "#a59d8e"); kotak(g, p[0] - 1.4, 290, p[1] - p[0] + 2.8, 1.4, "#c8c0b0");
        kotak(g, p[0], 331, p[1] - p[0], 3, "rgba(30,25,20,.25)");
      });
    }
    function gambarJalan(g) {
      // trotoar
      kotak(g, -M, 334, W + M * 2, 32, "#b9b4aa");
      for (var ty = 334; ty < 366; ty += 10.7) for (var tx = -M + ((ty / 10.7) % 2) * 5; tx < W + M; tx += 10.7) {
        kotak(g, tx + .4, ty + .4, 10, 10, acak(tx, ty) > .5 ? "#c4bfb5" : "#bdb8ad");
        if (acak(ty, tx) > .8) dab(g, tx + 5, ty + 5, 2.4, 1.4, 0, "rgba(80,75,65,.12)");
      }
      kotak(g, -M, 334, W + M * 2, 3, "rgba(30,30,20,.22)");
      // trotoar masuk ke gerbang
      kotak(g, 174, 330, 32, 6, "#c6c1b7");
      // kerb
      kotak(g, -M, 366, W + M * 2, 3, "#dcd8cf"); kotak(g, -M, 369, W + M * 2, 2.5, "#8f8b84");
      for (var kx = -M; kx < W + M; kx += 16) kotak(g, kx, 366, .6, 5.5, "rgba(60,60,55,.35)");
      // aspal
      kotak(g, -M, 371.5, W + M * 2, H - 371.5, gradV(g, 371, H, "#55575a", "#4b4d50"));
      for (var a = 0; a < 2600; a++) dab(g, -M + acak(a, 101) * (W + M * 2), 372 + acak(101, a) * (H - 372), .5 + acak(a, 102) * .8, .4, 0, acak(a, 103) > .5 ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.12)");
      kotak(g, -M, 377, W + M * 2, 1.4, "rgba(235,235,225,.75)");
      for (var lx = -M; lx < W + M; lx += 30) kotak(g, lx, 404, 16, 1.8, "rgba(235,235,225,.8)");
      // saluran air
      for (var sx = 24; sx < W; sx += 140) { kotak(g, sx, 371.5, 14, 3, "#2c2d2f"); for (var sb = 0; sb < 7; sb++) kotak(g, sx + 1 + sb * 2, 372, .7, 2.2, "#6d6e70"); }
    }

    /* pintu (bisa terbuka) */
    var bukaPintu = 0;
    A.setPintu = function (v) { bukaPintu = v; };
    A.sprite.push({ y: 0, gambar: function (g) {
      var w = 22 * (1 - bukaPintu);
      if (bukaPintu > 0) kotak(g, 179, 162, 22, 45, "#0a0806");
      if (w > .5) {
        kotak(g, 179, 162, w, 45, gradX(g, 179, 179 + w, "#5e3a22", "#7a4b2c", "#8a5834"));
        g.strokeStyle = "rgba(40,22,12,.6)"; g.lineWidth = .5; g.strokeRect(179 + w * .16, 166, w * .68, 16); g.strokeRect(179 + w * .16, 186, w * .68, 17);
        for (var s = 0; s < 6; s++) kotak(g, 179 + w * (.18 + s * .12), 162, .3, 45, "rgba(30,15,8,.18)");
        lingkaran(g, 179 + w * .84, 186, .9, "#c9b07a"); kotak(g, 179 + w * .84 - .3, 188, .6, 1.4, "#3a2a1a");
      }
    } });
    /* bangku kayu di bawah pohon */
    A.sprite.push({ y: 264, gambar: function (g) {
      elips(g, 103, 265, 16, 2.6, "rgba(20,30,15,.3)");
      kotak(g, 91, 254, 26, 2.2, "#6a4a30"); kotak(g, 91, 251, 26, 1.6, "#7d5a3a");
      kotak(g, 90, 258, 28, 3, "#8b6440"); kotak(g, 90, 258, 28, .8, "#a77c52");
      [92, 114].forEach(function (lx) { kotak(g, lx, 254, 1.6, 10, "#4f3622"); });
    } });
    /* kotak surat di samping pilar gerbang */
    A.sprite.push({ y: 340, gambar: function (g, t) {
      var x = 227;
      elips(g, x - 2, 340, 6, 1.6, "rgba(20,20,15,.3)");
      kotak(g, x - 1, 324, 2, 16, "#3a3733"); kotak(g, x - .2, 324, .5, 16, "rgba(255,255,255,.2)");
      bulatIsi(g, x - 7.5, 312, 15, 13, 2.2, gradX(g, x - 7.5, x + 7.5, "#2f4637", "#3e5a47", "#4f6f58"));
      kotak(g, x - 7.5, 316.5, 15, .7, "rgba(0,0,0,.2)");
      kotak(g, x - 4.6, 319, 9.2, 1.3, "#1b231d"); kotak(g, x - 4.6, 319, 9.2, .4, "rgba(255,255,255,.18)");
      g.font = "700 2.3px Nunito, sans-serif"; g.fillStyle = "rgba(240,232,210,.85)"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("SURAT", x, 322.6);
      kotak(g, x - 7, 312.6, 14, 1, "rgba(255,255,255,.18)");
      var bendera = suratDibaca ? 0 : 1;
      g.save(); g.translate(x + 7.5, 318); g.rotate(bendera ? -1.45 : 0); kotak(g, -.4, -5, .9, 5, "#a8322c"); kotak(g, -.4, -5, 2.4, 1.8, "#c4423a"); g.restore();
    } });
    /* lampu jalan */
    var LAMPU_JALAN = [120, 320], LAMPU_TAMAN = [[168, 248], [212, 248], [168, 290], [212, 290]];
    LAMPU_JALAN.forEach(function (lx) { A.sprite.push({ y: 367, gambar: function (g) {
      var x = lx - 1;
      elips(g, x - 3, 367, 5, 1.4, "rgba(20,20,15,.3)");
      kotak(g, x, 290, 2.4, 77, gradX(g, x, x + 2.4, "#3b3e42", "#5a5e63", "#2f3236"));
      kotak(g, x - 1, 362, 4.4, 5, "#3b3e42");
      g.strokeStyle = "#3b3e42"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x + 1.2, 292); g.quadraticCurveTo(x + 2, 282, x + 13, 282); g.stroke();
      bulatIsi(g, x + 9, 280, 10, 3.2, 1.4, "#45484c"); kotak(g, x + 10, 283, 8, 1.1, "#fff4cf");
    } }); });
    LAMPU_TAMAN.forEach(function (l) { A.sprite.push({ y: l[1], gambar: function (g) {
      elips(g, l[0], l[1], 3, 1, "rgba(0,0,0,.3)");
      kotak(g, l[0] - 1, l[1] - 9, 2, 9, gradX(g, l[0] - 1, l[0] + 1, "#2e3033", "#4a4d51", "#26282b"));
      bulatIsi(g, l[0] - 1.8, l[1] - 12.6, 3.6, 3.8, 1, "#fff0c4"); kotak(g, l[0] - 2.2, l[1] - 13.4, 4.4, 1.2, "#2e3033");
    } }); });

    /* ---------- tajuk pohon (di atas tokoh) ---------- */
    A.atas = { x: -M, y: -10, w: 330, h: 262, gambar: function (g) {
      var cx = POHON.x - 34, cy = 104;
      // dahan besar yang mengintip di sela daun
      g.lineCap = "round";
      [[POHON.x - 2, 160, POHON.x - 90, 70, 9], [POHON.x + 6, 160, POHON.x + 70, 96, 7], [POHON.x, 160, POHON.x - 20, 40, 8], [POHON.x + 4, 160, POHON.x + 110, 150, 5]].forEach(function (d) {
        g.strokeStyle = "#3a2f26"; g.lineWidth = d[4]; g.beginPath(); g.moveTo(d[0], d[1]); g.quadraticCurveTo((d[0] + d[2]) / 2 + 6, (d[1] + d[3]) / 2 + 10, d[2], d[3]); g.stroke();
        g.strokeStyle = "rgba(160,140,110,.4)"; g.lineWidth = d[4] * .3; g.beginPath(); g.moveTo(d[0] + 2, d[1]); g.quadraticCurveTo((d[0] + d[2]) / 2 + 8, (d[1] + d[3]) / 2 + 10, d[2] + 1, d[3]); g.stroke();
      });
      // gumpalan daun, dari belakang (atas) ke depan (bawah)
      var gump = [];
      for (var i = 0; i < 26; i++) { var a = acak(i, 201) * 6.2832, r = Math.sqrt(acak(201, i)); gump.push({ x: cx + Math.cos(a) * r * 150, y: cy + Math.sin(a) * r * 82, r: 30 + acak(i, 202) * 22, k: i }); }
      gump.push({ x: POHON.x + 78, y: 150, r: 30, k: 40 }, { x: POHON.x + 104, y: 128, r: 24, k: 41 }, { x: POHON.x + 30, y: 176, r: 30, k: 42 }, { x: POHON.x - 40, y: 184, r: 34, k: 43 }, { x: POHON.x - 110, y: 178, r: 34, k: 44 });
      gump.sort(function (p, q) { return p.y - q.y; });
      gump.forEach(function (c, j) {
        // dahan kecil antar gumpalan
        if (j % 4 === 1) { g.strokeStyle = "rgba(50,40,30,.8)"; g.lineWidth = 2; g.beginPath(); g.moveTo(c.x - c.r * .6, c.y + c.r * .5); g.quadraticCurveTo(c.x, c.y + c.r * .2, c.x + c.r * .5, c.y + c.r * .7); g.stroke(); }
        dedaunan(g, c.x, c.y, c.r, c.r * .82, Math.round(c.r * c.r * 1.25), c.k + 300, (c.y - 150) / -400, 1);
      });
      // akar gantung (ciri pohon beringin)
      for (var k = 0; k < 46; k++) {
        var ax = POHON.x - 150 + acak(k, 211) * 270, ay = 170 + acak(211, k) * 34, pj = 14 + acak(k, 212) * 46;
        if (ax > POHON.x + 90) continue;
        g.strokeStyle = "rgba(" + (80 + Math.round(acak(k, 213) * 30)) + ",64,48," + (.55 + acak(k, 214) * .35) + ")"; g.lineWidth = .35 + acak(k, 215) * .55;
        g.beginPath(); g.moveTo(ax, ay); g.bezierCurveTo(ax + 1.5, ay + pj * .4, ax - 1.5, ay + pj * .7, ax + .5, ay + pj); g.stroke();
      }
    } };

    /* ---------- benda yang bisa diklik (tanpa label/tombol) ---------- */
    // kolam ikan hias dengan kodok kecil & jangkrik (pojok kanan halaman)
    var KOLAM = { x: 300, y: 266, rx: 30, ry: 12 }, kodok = { dari: 0, ke: 0, t0: -9, akhir: 0 };
    var titikKodok = [[KOLAM.x - 18, KOLAM.y + 2.4], [KOLAM.x - 31, KOLAM.y + 9], [KOLAM.x + 14, KOLAM.y + 4.4]];
    blok(KOLAM.x - KOLAM.rx, KOLAM.y - KOLAM.ry + 3, KOLAM.rx * 2, KOLAM.ry * 2 - 5);
    A.kodokLompat = function () { if (waktu - kodok.t0 < .6) return; kodok.dari = kodok.ke; do { kodok.ke = Math.floor(Math.random() * titikKodok.length); } while (kodok.ke === kodok.dari); kodok.t0 = waktu; };
    function gambarKodok(g, x, y, lompat, t) {
      elips(g, x, y + .9, 1.9, .5, "rgba(0,0,0,.3)");
      var naik = lompat > 0 ? Math.sin(lompat * Math.PI) * 4 : 0; y -= naik;
      g.save(); g.translate(x, y);
      if (naik) { kotak(g, -2.2, -.2, 1.2, .5, "#4a7a2e"); kotak(g, 1, -.2, 1.2, .5, "#4a7a2e"); }
      else { elips(g, -1.5, .3, .9, .5, "#4a7a2e"); elips(g, 1.5, .3, .9, .5, "#4a7a2e"); }
      elips(g, 0, -.4, 1.7, 1.15, "#5f9438"); elips(g, 0, .1, 1.1, .6, "#b9c97a");
      lingkaran(g, -.75, -1.35, .55, "#6ea544"); lingkaran(g, .75, -1.35, .55, "#6ea544");
      lingkaran(g, -.75, -1.4, .3, "#1b1a12"); lingkaran(g, .75, -1.4, .3, "#1b1a12");
      lingkaran(g, -.68, -1.5, .1, "#fff"); lingkaran(g, .82, -1.5, .1, "#fff");
      var leher = .35 + Math.max(0, Math.sin(t * 5)) * .35; if (!naik) elips(g, 0, -.15, .7 * leher + .3, .45 * leher, "rgba(230,230,170,.8)");
      g.restore();
    }
    // pancuran batu bertingkat di tepi belakang kolam: guci di puncak menuang air ke dua mangkuk batu lalu ke kolam
    blok(315, 247, 14, 9);
    A.sprite.push({ y: 256, gambar: function (g, t) {
      g.save(); g.translate(10, 0);
      function batu(x, y, w, h, gelap) {
        kotak(g, x, y, w, h, gradX(g, x, x + w, gelap ? "#5e5a54" : "#7d7972", gelap ? "#76726b" : "#96928a", gelap ? "#4f4b46" : "#6a665f"));
        g.strokeStyle = "rgba(40,36,32,.45)"; g.lineWidth = .22;
        for (var yy = y + 2.4, bar = 0; yy < y + h - .3; yy += 2.4, bar++) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.stroke(); for (var xx = x + (bar % 2 ? 1.6 : 3.2); xx < x + w - .5; xx += 3.2) { g.beginPath(); g.moveTo(xx, yy - 2.4); g.lineTo(xx, yy); g.stroke(); } }
        kotak(g, x, y, w, .5, "rgba(255,255,255,.14)");
      }
      function mangkuk(x, y, rx) {
        poligon(g, [[x - rx, y], [x + rx, y], [x + rx * .55, y + 2.4], [x - rx * .55, y + 2.4]], gradV(g, y, y + 2.4, "#88847c", "#5c5852"));
        elips(g, x, y, rx, rx * .36, "#6c6862"); elips(g, x, y + .1, rx * .78, rx * .26, "#2c4a4c"); elips(g, x - rx * .3, y - .1, rx * .3, rx * .08, "rgba(220,240,240,.35)");
      }
      function aliran(x0, y0, x1, y1, lebar) {
        g.strokeStyle = "rgba(200,232,236,.55)"; g.lineWidth = lebar; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 - .8, (y0 + y1) / 2 - 1, x1, y1); g.stroke();
        g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = lebar * .35; g.setLineDash([.8, 1.6]); g.lineDashOffset = -t * 14; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 - .8, (y0 + y1) / 2 - 1, x1, y1); g.stroke(); g.setLineDash([]); g.lineCap = "butt";
      }
      elips(g, 312, 256, 8, 1.6, "rgba(0,0,0,.3)");
      batu(305.5, 249.5, 13, 6.5, true);            // bak dasar
      batu(309, 229, 7, 21, false);                // tiang bata batu
      kotak(g, 308.4, 228, 8.2, 1.4, "#8e8a82");   // tutup tiang
      // guci miring di puncak
      g.save(); g.translate(312.6, 224.6); g.rotate(-.55);
      bulatIsi(g, -3, -3.2, 6, 6.4, 2.6, gradX(g, -3, 3, "#6e6a63", "#9a968e", "#5a5650")); elips(g, -3.1, 0, 1, 1.9, "#4a4742"); elips(g, -3.2, 0, .6, 1.3, "#2a2826");
      g.strokeStyle = "rgba(40,36,32,.35)"; g.lineWidth = .2; g.beginPath(); g.moveTo(-2.4, -2); g.lineTo(2.4, -2); g.moveTo(-2.4, 2); g.lineTo(2.4, 2); g.stroke();
      g.restore();
      mangkuk(306.6, 236.4, 3.2); mangkuk(305.4, 243.4, 3.6);
      aliran(309.6, 226.3, 306.9, 236.2, .9);
      aliran(303.6, 237.2, 302.6, 243.2, 1);
      aliran(302.2, 244.4, 301.8, 258.6, 1.1);
      // percikan di permukaan kolam
      for (var c = 0; c < 3; c++) { var ph = (t * 1.6 + c / 3) % 1; g.strokeStyle = "rgba(220,240,240," + (.55 * (1 - ph)) + ")"; g.lineWidth = .25; g.beginPath(); g.ellipse(301.8, 259, .6 + ph * 3.2, .25 + ph * 1.1, 0, 0, Math.PI * 2); g.stroke(); }
      for (var d = 0; d < 4; d++) { var q = (t * 2.3 + d * .27) % 1; lingkaran(g, 301.8 + Math.cos(d * 1.9) * q * 2.2, 258.6 - Math.sin(q * Math.PI) * 1.4, .18, "rgba(255,255,255," + (.8 * (1 - q)) + ")"); }
      g.restore();
    } });
    A.sprite.push({ y: KOLAM.y + KOLAM.ry - 1, gambar: function (g, t) {
      var k = KOLAM;
      elips(g, k.x, k.y + 1.5, k.rx + 4, k.ry + 3, "rgba(0,0,0,.25)");
      for (var i = 0; i < 28; i++) { var a = i / 28 * Math.PI * 2, bx = k.x + Math.cos(a) * (k.rx + 1.2), by = k.y + Math.sin(a) * (k.ry + 1.2); elips(g, bx, by + .4, 3.3 + acak(i, 61) * 1.4, 2 + acak(61, i) * .8, "rgba(0,0,0,.3)"); elips(g, bx, by, 3.2 + acak(i, 61) * 1.4, 1.9 + acak(61, i) * .8, ["#77736a", "#8a857a", "#68645c"][i % 3]); elips(g, bx - .6, by - .6, 1.4, .6, "rgba(255,255,255,.12)"); }
      g.save(); g.beginPath(); g.ellipse(k.x, k.y, k.rx, k.ry, 0, 0, Math.PI * 2); g.clip();
      g.fillStyle = gradV(g, k.y - k.ry, k.y + k.ry, "#0d2629", "#1f4d4a"); g.fillRect(k.x - k.rx, k.y - k.ry, k.rx * 2, k.ry * 2);
      elips(g, k.x, k.y - k.ry + 1.5, k.rx, 2.2, "rgba(0,0,0,.35)");
      [[0, "#ef7b3c", 1, 1], [2.1, "#f4f0e6", .85, -1], [4.2, "#dc4a30", .95, 1], [1.2, "#f1b443", .75, -1], [3.3, "#f4f0e6", .7, 1]].forEach(function (f, i) {
        var sp = (.28 + i * .05) * f[3], a = t * sp + f[0], rx = k.rx * (.42 + i * .09), ry = k.ry * (.35 + (i % 2) * .2);
        var x = k.x + Math.cos(a) * rx + Math.sin(t * .7 + i) * 1.5, y = k.y + Math.sin(a) * ry + 1, ang = Math.atan2(Math.cos(a) * ry * f[3], -Math.sin(a) * rx * f[3]), sz = f[2], ek = Math.sin(t * 7 + i * 2) * .5;
        g.save(); g.translate(x, y); g.rotate(ang); g.globalAlpha = .9;
        poligon(g, [[-2 * sz, 0], [-3.8 * sz, -1.2 * sz + ek], [-3.4 * sz, ek * .3], [-3.8 * sz, 1.2 * sz + ek]], f[1]);
        elips(g, 0, 0, 2.5 * sz, .95 * sz, f[1]);
        if (f[1] === "#f4f0e6") { elips(g, .6 * sz, -.1, .8 * sz, .5 * sz, "#e0552f"); elips(g, -1 * sz, .2, .5 * sz, .35 * sz, "#2a2a2a"); }
        elips(g, 1.2 * sz, -.2 * sz, .5 * sz, .25 * sz, "rgba(255,255,255,.35)");
        g.restore();
      });
      g.globalAlpha = 1;
      for (var r = 0; r < 3; r++) { var ph = (t * .35 + r * .33) % 1, rx2 = k.x - 14 + r * 13, ry2 = k.y - 3 + (r % 2) * 5; g.strokeStyle = "rgba(200,235,225," + (.4 * (1 - ph)) + ")"; g.lineWidth = .3; g.beginPath(); g.ellipse(rx2, ry2, .8 + ph * 5, .4 + ph * 2, 0, 0, Math.PI * 2); g.stroke(); }
      elips(g, k.x + 9, k.y - 5, 11, 1.1, "rgba(255,230,180,.13)"); elips(g, k.x - 6, k.y + 6, 7, .7, "rgba(200,220,255,.08)");
      g.restore();
      [[k.x - 18, k.y + 3, 3.6, .3], [k.x + 14, k.y + 5, 3.1, 2.2], [k.x + 21, k.y - 4, 2.4, 4], [k.x - 6, k.y - 6, 2, 1.1]].forEach(function (d) { g.save(); g.translate(d[0], d[1]); g.scale(1, .45); g.rotate(d[3]); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, d[2], .3, Math.PI * 2 - .05); g.closePath(); g.fillStyle = "#3e7a38"; g.fill(); g.strokeStyle = "rgba(20,50,20,.5)"; g.lineWidth = .3; g.stroke(); g.restore(); });
      lingkaran(g, k.x + 14.8, k.y + 4.3, 1, "#f3c6d2"); lingkaran(g, k.x + 14.8, k.y + 4.3, .45, "#f7e3a0");
      // kodok: kadang melompat sendiri
      if (t - kodok.t0 > 7 + acak(Math.floor(kodok.t0), 3) * 5) A.kodokLompat();
      var u = Math.min(1, (t - kodok.t0) / .55), p0 = titikKodok[kodok.dari], p1 = titikKodok[kodok.ke];
      gambarKodok(g, p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u, u < 1 ? u : 0, t);
      // jangkrik kecil di rumput sekitar kolam
      [[262, 281, 1], [339, 260, -1], [323, 285, 1], [274, 250, -1]].forEach(function (j, i) {
        var f = (t * .25 + i * .37) % 1, loncat = f < .05 ? Math.sin(f / .05 * Math.PI) * 1.6 : 0, x = j[0] + (f < .05 ? f / .05 * 1.5 * j[2] : 0) + Math.floor((t * .25 + i * .37)) % 3 * j[2], y = j[1] - loncat;
        elips(g, x, j[1] + .5, 1, .25, "rgba(0,0,0,.3)");
        g.save(); g.translate(x, y); g.scale(j[2], 1);
        g.strokeStyle = "#2a2014"; g.lineWidth = .18; g.beginPath(); g.moveTo(.9, -.2); g.quadraticCurveTo(2, -1.4, 2.8, -1 + Math.sin(t * 6 + i) * .2); g.moveTo(.9, -.2); g.quadraticCurveTo(1.8, -1.1, 2.6, -.6); g.stroke();
        g.beginPath(); g.moveTo(-.3, 0); g.lineTo(-.8, -.7); g.lineTo(-1.3, .3); g.lineWidth = .22; g.stroke();
        elips(g, 0, -.1, 1.1, .4, "#4a3820"); elips(g, -.1, -.25, .8, .2, "#6a5232"); lingkaran(g, .95, -.15, .3, "#3a2c18");
        g.restore();
      });
    } });
    A.benda.push({ key: "kolam", x: KOLAM.x - KOLAM.rx - 2, y: KOLAM.y - KOLAM.ry - 2, w: KOLAM.rx * 2 + 4, h: KOLAM.ry * 2 + 4, ax: KOLAM.x, ay: KOLAM.y + KOLAM.ry + 6, r: 32 });
    A.benda.push({ key: "surat", x: 218, y: 308, w: 22, h: 34, ax: 227, ay: 346, r: 34 });
    A.benda.push({ key: "pintu", x: 177, y: 158, w: 26, h: 52, ax: 190, ay: 224, r: 30 });
    A.benda.push({ key: "bangku", x: 86, y: 246, w: 36, h: 20, ax: 104, ay: 272, r: 26 });
    A.benda.push({ key: "pohon", x: 10, y: 150, w: 68, h: 124, ax: 46, ay: 284, r: 52 });
    A.awal = { x: 340, y: 352, arah: "kiri" };

    /* ---------- efek: tajuk bergoyang, daun gugur, surat jatuh, mobil lewat ---------- */
    var daun = [], goyang = 0, mobil = null, tMobil = 4;
    A.suratPohon = null;
    A.goyangPohon = function () {
      goyang = 1;
      for (var i = 0; i < 9; i++) daun.push({ x: POHON.x - 60 + Math.random() * 130, y: 160 + Math.random() * 40, vy: 10 + Math.random() * 8, p: Math.random() * 6, umur: 4 + Math.random() * 2 });
      if (D.suratPohon && !A.suratPohon) A.suratPohon = { x0: POHON.x + 30, y0: 186, x: POHON.x + 30, y: 186, ke: 292, t: 0, diam: false };
    };
    A.cahaya = function (g) {
      kotak(g, -M - 40, -40, W + M * 2 + 80, H + 80, "rgba(10,16,42,.64)");
      g.globalCompositeOperation = "destination-out";
      LAMPU_JALAN.forEach(function (lx) { cahaya(g, lx + 13, 330, 62, "0,0,0", .85); });
      LAMPU_TAMAN.forEach(function (l) { cahaya(g, l[0], l[1] - 4, 22, "0,0,0", .8); });
      cahaya(g, 300, 266, 42, "0,0,0", .6);   // kolam
      [[149, 179, 30], [231, 179, 30], [154, 111, 22], [226, 111, 22], [190, 109, 14], [171, 178, 22], [190, 214, 34]].forEach(function (c) { cahaya(g, c[0], c[1], c[2], "0,0,0", .75); });
      g.globalCompositeOperation = "source-over";
    };
    var kunang = []; for (var kk = 0; kk < 14; kk++) kunang.push({ x: -60 + acak(kk, 1) * 200, y: 200 + acak(1, kk) * 90, p: kk * 1.3 });
    A.malam = function (g, t) {
      if (A.gambarCahaya) g.drawImage(A.gambarCahaya, A.kotakCahaya.x, A.kotakCahaya.y, A.kotakCahaya.w, A.kotakCahaya.h);
      g.globalCompositeOperation = "lighter";
      LAMPU_JALAN.forEach(function (lx) { cahaya(g, lx + 13, 284, 16, "255,220,150", .5); cahaya(g, lx + 13, 330, 50, "255,200,120", .12); });
      LAMPU_TAMAN.forEach(function (l) { cahaya(g, l[0], l[1] - 11, 8, "255,215,140", .55); cahaya(g, l[0], l[1] - 2, 18, "255,200,120", .1); });
      [[149, 179], [231, 179], [154, 111], [226, 111]].forEach(function (c) { cahaya(g, c[0], c[1], 22, "255,190,110", .12); });
      cahaya(g, 171, 170, 8, "255,225,160", .45);
      kunang.forEach(function (f) { var fx = f.x + Math.sin(t * .4 + f.p) * 16, fy = f.y + Math.sin(t * .6 + f.p * 2) * 10, a = .35 + Math.sin(t * 2.2 + f.p) * .3; if (a > 0) { cahaya(g, fx, fy, 4, "220,255,140", a); lingkaran(g, fx, fy, .45, "rgba(240,255,200," + a + ")"); } });
      if (mobil) { var arah = mobil.v > 0 ? 1 : -1; cahaya(g, mobil.x + arah * 34, mobil.y - 8, 26, "255,240,190", .25); }
      g.globalCompositeOperation = "source-over";
    };
    A.efek = function (g, t, dt) {
      dt = dt || .016;
      goyang = Math.max(0, goyang - dt * 1.2);
      var ox = Math.sin(t * .7) * .35 + Math.sin(t * 22) * goyang * 1.6, oy = Math.cos(t * .5) * .2;
      if (A.gambarAtas) g.drawImage(A.gambarAtas, A.atas.x + ox, A.atas.y + oy, A.atas.w, A.atas.h);
      if (Math.random() < dt * .35) daun.push({ x: POHON.x - 120 + Math.random() * 200, y: 170 + Math.random() * 30, vy: 7 + Math.random() * 6, p: Math.random() * 6, umur: 6 });
      daun = daun.filter(function (d) { return d.umur > 0; });
      daun.forEach(function (d) {
        d.umur -= dt; d.y = Math.min(d.y + d.vy * dt, 300); d.x += Math.sin(t * 2 + d.p) * 8 * dt;
        g.save(); g.translate(d.x, d.y); g.rotate(Math.sin(t * 3 + d.p) * 1.2); g.globalAlpha = Math.min(1, d.umur);
        dab(g, 0, 0, 1.6, .8, 0, d.p > 3 ? "#9bb552" : "#c9a24a"); g.restore();
      });
      var s = A.suratPohon;
      if (s) {
        if (!s.diam) {
          s.t += dt; var u = Math.min(1, s.t / 2.6);
          s.y = s.y0 + (s.ke - s.y0) * u; s.x = s.x0 + Math.sin(s.t * 3.2) * 9 * (1 - u) + u * 8;
          if (u >= 1) { s.diam = true; A.benda.push({ key: "suratPohon", x: s.x - 9, y: s.y - 9, w: 18, h: 14, ax: s.x, ay: s.y + 6, r: 34 }); }
        }
        var rot = s.diam ? -.15 : Math.sin(s.t * 3.2) * .6;
        g.save(); g.translate(s.x, s.y);
        if (s.diam) { elips(g, .5, 3.2, 6.5, 1.4, "rgba(20,30,15,.3)"); if (!suratPohonDibaca) cahaya(g, 0, 0, 10 + Math.sin(t * 3) * 2, "255,245,200", .35); }
        g.rotate(rot);
        bulatIsi(g, -5.5, -3.6, 11, 7.2, .6, "#f3ecdc"); kotak(g, -5.5, -3.6, 11, 7.2, "rgba(0,0,0,0)");
        poligon(g, [[-5.5, -3.6], [5.5, -3.6], [0, .6]], "#e4dac4"); g.strokeStyle = "rgba(120,100,70,.5)"; g.lineWidth = .3; g.strokeRect(-5.5, -3.6, 11, 7.2);
        lingkaran(g, 0, .4, 1.3, "#a8322c");
        g.restore();
      }
      // mobil sesekali lewat di jalan
      tMobil -= dt;
      if (!mobil && tMobil <= 0) { var kanan = Math.random() < .5; mobil = { x: kanan ? -M - 50 : W + M + 50, y: kanan ? 396 : 418, v: (kanan ? 1 : -1) * (60 + Math.random() * 25), w: ["#d9d6cf", "#8c2f2a", "#3d4a5c", "#b9bcc0"][Math.floor(Math.random() * 4)] }; }
      if (mobil) {
        mobil.x += mobil.v * dt; gambarMobil(g, mobil);
        if (mobil.x < -M - 80 || mobil.x > W + M + 80) { mobil = null; tMobil = 9 + Math.random() * 10; }
      }
      A.malam(g, t);
    };
    function gambarMobil(g, m) {
      g.save(); g.translate(m.x, m.y); if (m.v < 0) g.scale(-1, 1);
      elips(g, 0, 1, 26, 4, "rgba(0,0,0,.35)");
      bulatIsi(g, -24, -14, 48, 13, 4, m.w);
      bulatIsi(g, -12, -23, 26, 11, 4, m.w);
      bulatIsi(g, -10, -21.5, 10, 8, 1.6, "#5d7178"); bulatIsi(g, 2, -21.5, 10, 8, 1.6, "#6e848b");
      kotak(g, -24, -8, 48, 1, "rgba(0,0,0,.18)"); kotak(g, -24, -14, 48, 1.4, "rgba(255,255,255,.25)");
      [-14, 14].forEach(function (wx) { lingkaran(g, wx, -1.5, 4, "#1d1d1f"); lingkaran(g, wx, -1.5, 1.8, "#8a8c90"); });
      kotak(g, 22, -12, 2, 2.4, "#f4ecc8"); kotak(g, -24, -12, 1.6, 2.4, "#c2332b");
      g.restore();
    }
    return A;
  }

  /* ---------- Ruang dalam: temaram, hangat, gaya lukisan ---------- */
  function lantaiKayuGelap(g, x0, y0, w, h, k) {
    kotak(g, x0, y0, w, h, gradV(g, y0, y0 + h, "#3a271d", "#4a3226"));
    for (var y = y0, r = 0; y < y0 + h; y += 8, r++) {
      for (var x = x0 + (r % 3) * 24 - 30; x < x0 + w; x += 72) {
        kotak(g, x, y, 72, 8, acak(x, y, k) > .5 ? "rgba(255,200,150,.04)" : "rgba(0,0,0,.08)");
        kotak(g, x, y, .5, 8, "rgba(10,5,2,.45)");
        for (var s = 0; s < 3; s++) kotak(g, x + 4 + acak(s, x, y) * 60, y + 2 + s * 2, 8 + acak(x, s) * 14, .3, "rgba(20,10,5,.25)");
      }
      kotak(g, x0, y, w, .5, "rgba(10,5,2,.5)"); kotak(g, x0, y + .5, w, .8, "rgba(255,210,170,.05)");
    }
  }
  function dindingGelap(g, x0, x1, tinggi) {
    kotak(g, x0, 0, x1 - x0, tinggi, gradV(g, 0, tinggi, "#252c36", "#2d3540"));
    kotak(g, x0, tinggi - 30, x1 - x0, 30, "#2a313b");
    for (var px = x0 + 6; px < x1 - 20; px += 34) { g.strokeStyle = "rgba(255,255,255,.06)"; g.lineWidth = .7; g.strokeRect(px, tinggi - 26, 28, 20); g.strokeStyle = "rgba(0,0,0,.3)"; g.strokeRect(px + .7, tinggi - 25.3, 28, 20); }
    kotak(g, x0, tinggi - 31, x1 - x0, 2, "#3a424e"); kotak(g, x0, tinggi - 3, x1 - x0, 3, "#1b2027");
    kotak(g, x0, 0, x1 - x0, 3, "#1e242c");
  }
  function lampuTali(g, t, x0, x1, y, lengkung, n, k) {
    g.strokeStyle = "rgba(20,15,10,.8)"; g.lineWidth = .35; g.beginPath(); g.moveTo(x0, y); g.quadraticCurveTo((x0 + x1) / 2, y + lengkung * 2, x1, y); g.stroke();
    for (var i = 1; i < n; i++) {
      var u = i / n, x = x0 + (x1 - x0) * u, yy = y + lengkung * 4 * u * (1 - u) + 1.4, kedip = .75 + Math.sin(t * 2 + i * 1.7 + k) * .12;
      cahaya(g, x, yy, 6, "255,190,100", .28 * kedip); lingkaran(g, x, yy, .9, "rgba(255,226,160," + kedip + ")"); lingkaran(g, x, yy - .2, .4, "#fff6dc");
    }
  }
  function sofa(g, x, y, w, h, warna, bantal) {
    elips(g, x + w / 2, y + h + 1, w * .55, 3, "rgba(0,0,0,.35)");
    bulatIsi(g, x, y, w, h * .55, 3, gradV(g, y, y + h * .55, "#3a3f46", warna));
    bulatIsi(g, x + 2, y + h * .4, w - 4, h * .6, 2.5, gradV(g, y + h * .4, y + h, "#41474f", "#2a2e33"));
    bulatIsi(g, x - 1, y + h * .25, 6, h * .75, 2.5, "#2c3036"); bulatIsi(g, x + w - 5, y + h * .25, 6, h * .75, 2.5, "#31353b");
    (bantal || []).forEach(function (b) { g.save(); g.translate(x + b[0], y + b[1]); g.rotate(b[3] || 0); bulatIsi(g, -4.5, -3.6, 9, 7.2, 2.4, b[2]); kotak(g, -3.6, -3, 7.2, .8, "rgba(255,255,255,.12)"); g.restore(); });
  }
  function bingkai(g, x, y, w, h, isi) {
    kotak(g, x - 1.4, y - 1.4, w + 2.8, h + 2.8, "#15120f"); kotak(g, x, y, w, h, isi || "#cfc4ae");
    kotak(g, x - 1.4, y + h + 1.4, w + 2.8, 1.2, "rgba(0,0,0,.35)");
  }
  function lampuBerdiri(g, x, y, t) {
    elips(g, x, y, 5, 1.6, "rgba(0,0,0,.4)"); kotak(g, x - 3, y - 1.4, 6, 1.4, "#1e1a16");
    kotak(g, x - .5, y - 44, 1, 43, "#2a2420");
    poligon(g, [[x - 5, y - 44], [x + 5, y - 44], [x + 7, y - 54], [x - 7, y - 54]], gradV(g, y - 54, y - 44, "#f7dca0", "#e8b768"));
    poligon(g, [[x - 5, y - 44], [x + 5, y - 44], [x + 4.4, y - 45.2], [x - 4.4, y - 45.2]], "rgba(255,250,220,.9)");
  }

  function buatLantai1() {
    var A = { id: "lantai1", W: 320, H: 224, latar: "#120e10", padat: [], sprite: [], tempat: [], pindah: [], benda: [], lokasi: "Ruang tengah" };
    function blok(x, y, w, h) { A.padat.push([x, y, w, h]); }
    blok(0, 0, 258, 80); blok(306, 0, 14, 224); blok(0, 0, 8, 224);
    blok(0, 212, 144, 12); blok(176, 212, 144, 12);
    blok(250, 76, 8, 96); blok(100, 124, 60, 16); blok(10, 82, 60, 30); blok(72, 86, 12, 8); blok(238, 92, 10, 8);
    blok(12, 180, 20, 14);
    A.lantai = function (g) {
      dindingGelap(g, 0, 320, 80);
      // jendela malam bertirai
      bingkai(g, 20, 10, 38, 40, gradV(g, 10, 50, "#16233a", "#2c4566"));
      for (var s = 0; s < 8; s++) lingkaran(g, 23 + acak(s, 3) * 32, 13 + acak(3, s) * 20, .35, "rgba(255,255,255,.7)");
      lingkaran(g, 49, 18, 3, "rgba(240,236,210,.9)"); cahaya(g, 49, 18, 8, "220,230,255", .25);
      kotak(g, 38.3, 10, 1.4, 40, "#15120f"); kotak(g, 20, 29.3, 38, 1.4, "#15120f");
      [[12, 22], [56, 66]].forEach(function (c) { kotak(g, c[0], 6, c[1] - c[0], 54, gradX(g, c[0], c[1], "#1f3b3e", "#2d5054", "#1a3235")); for (var f = c[0] + 2; f < c[1]; f += 2.6) kotak(g, f, 6, .6, 54, "rgba(0,0,0,.25)"); });
      kotak(g, 10, 5, 58, 1.6, "#4a3a2a");
      // bingkai foto & poster HAPPY BIRTHDAY
      bingkai(g, 112, 14, 36, 26, "#e9e0cc");
      g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#2a2420"; g.font = "700 5.2px Nunito, sans-serif"; g.fillText("HAPPY", 130, 23); g.fillText("BIRTHDAY", 130, 29.5);
      g.font = "600 3px Nunito, sans-serif"; g.fillStyle = "#8a6a40"; g.fillText(String(D.nama || "").toUpperCase().slice(0, 14), 130, 35);
      bingkai(g, 86, 18, 18, 14, gradV(g, 18, 32, "#6a7a6a", "#3a4a3e")); bingkai(g, 156, 20, 16, 20, gradV(g, 20, 40, "#7a5a4a", "#3e2e28")); bingkai(g, 90, 38, 12, 10, "#5a5048");
      // rak buku
      kotak(g, 194, 4, 44, 68, "#2a1d16"); kotak(g, 196, 6, 40, 64, "#1a120e");
      for (var r = 0; r < 4; r++) {
        var ry = 6 + r * 16; kotak(g, 196, ry + 14, 40, 2, "#3a2a1f");
        for (var bk = 0, bx = 197; bx < 234; bk++) { var bw = 2 + acak(bk, r) * 2.4, bh = 8 + acak(r, bk) * 5; if (acak(bk, r, 2) > .82) { bx += 4; continue; } kotak(g, bx, ry + 14 - bh, bw, bh, ["#6a3a2e", "#3e4a5a", "#7a6a4a", "#4a5a44", "#8a7a64", "#5a3a4a"][(bk + r) % 6]); bx += bw + .3; }
      }
      cahaya(g, 216, 38, 14, "255,190,110", .35); lingkaran(g, 216, 36, 2.4, "#f7d79a");
      // lantai kayu & karpet
      lantaiKayuGelap(g, 8, 80, 298, 132, 5);
      // tangga ke atas: sama dengan tangga lantai 2 (anak tangga kayu, makin jauh makin gelap)
      kotak(g, 258, 70, 48, 104, "#120d0b");
      for (var t2 = 0; t2 < 9; t2++) { var ty = 72 + t2 * 11.2, kk = 8 - t2; kotak(g, 260, ty, 44, 8.7, "rgb(" + (120 - kk * 10) + "," + (92 - kk * 8) + "," + (66 - kk * 6) + ")"); kotak(g, 260, ty + 8.7, 44, 2.5, "rgba(0,0,0,.45)"); }
      bulatIsi(g, 76, 112, 116, 64, 4, "#4a3e3a"); bulatIsi(g, 80, 116, 108, 56, 3, "#5a4a44");
      g.strokeStyle = "rgba(200,170,130,.25)"; g.lineWidth = .7; jalurBulat(g, 84, 120, 100, 48, 3); g.stroke();
      for (var p = 0; p < 300; p++) dab(g, 80 + acak(p, 41) * 108, 116 + acak(41, p) * 56, .8, .4, 0, acak(p, 42) > .5 ? "rgba(255,230,200,.05)" : "rgba(0,0,0,.08)");
      kotak(g, 0, 0, 8, 224, "#1a1e24"); kotak(g, 306, 0, 14, 224, "#1a1e24");
      kotak(g, 0, 212, 144, 12, "#1d2228"); kotak(g, 176, 212, 144, 12, "#1d2228"); kotak(g, 144, 216, 32, 8, "#2a221c");
      bulatIsi(g, 146, 205, 28, 9, 2, "#5a4636");
    };
    A.sprite.push({ y: 0, gambar: function (g, t) {
      lampuTali(g, t, 0, 130, 3, 6, 11, 0); lampuTali(g, t, 128, 258, 3, 7, 11, 3); lampuTali(g, t, 70, 190, 2, 12, 12, 7);
      [[100, 30, "#2a2a30"], [108, 36, "#b07a5e"]].forEach(function (b, i) {
        var bx = b[0] + Math.sin(t * .8 + i) * .5, by = b[1] + Math.cos(t + i) * .4;
        g.strokeStyle = "rgba(200,190,170,.5)"; g.lineWidth = .25; g.beginPath(); g.moveTo(bx, by + 6); g.quadraticCurveTo(bx + 2, by + 18, bx + 1, by + 30); g.stroke();
        var gr = g.createRadialGradient(bx - 1.6, by - 2, .5, bx, by, 6); gr.addColorStop(0, i ? "#e4b296" : "#5a5a66"); gr.addColorStop(1, b[2]); elips(g, bx, by, 5, 6, gr);
      });
    } });
    A.sprite.push({ y: 112, gambar: function (g) {
      sofa(g, 10, 82, 60, 30, "#30353b", [[12, 10, "#b0674a", -.2], [48, 10, "#c98b6a", .2], [30, 11, "#3e4a4e", 0]]);
    } });
    A.sprite.push({ y: 94, gambar: function (g) {
      elips(g, 78, 94, 7, 1.8, "rgba(0,0,0,.4)"); kotak(g, 71, 84, 14, 9, "#3a2619"); kotak(g, 71, 84, 14, 1.2, "#5a3a26");
      kotak(g, 77.4, 76, 1.2, 8, "#2a2420"); poligon(g, [[74, 76], [82, 76], [83.4, 70], [72.6, 70]], gradV(g, 70, 76, "#f7dca0", "#e0ad5e"));
    } });
    A.sprite.push({ y: 100, gambar: function (g, t) { lampuBerdiri(g, 243, 99, t); } });
    A.sprite.push({ y: 194, gambar: function (g) {
      elips(g, 22, 193, 10, 2.4, "rgba(0,0,0,.4)");
      poligon(g, [[15, 182], [29, 182], [27, 193], [17, 193]], gradX(g, 15, 29, "#3a3430", "#5a524a", "#2e2a26"));
      [[22, 168, 9, 8], [17, 174, 6, 5], [27, 173, 6, 5]].forEach(function (d, j) { dedaunan(g, d[0], d[1], d[2], d[3], 120, 400 + j, -.25, .8); });
    } });
    A.sprite.push({ y: 140, gambar: function (g, t) {
      var ty = 128;
      elips(g, 130, ty + 14, 34, 4, "rgba(0,0,0,.45)");
      kotak(g, 102, ty + 6, 3, 9, "#2a1810"); kotak(g, 155, ty + 6, 3, 9, "#2a1810");
      bulatIsi(g, 98, ty - 6, 64, 14, 3, gradV(g, ty - 6, ty + 8, "#7a4c2e", "#5a3520"));
      bulatIsi(g, 98, ty + 5, 64, 3.4, 1.4, "#3a2214");
      for (var gk = 0; gk < 6; gk++) kotak(g, 100 + gk * 10.5, ty - 5, 7 + acak(gk, 4) * 3, .3, "rgba(30,15,8,.3)");
      // cangkir & piring
      elips(g, 107, ty + 1, 4.6, 1.8, "#e9e2d6"); bulatIsi(g, 104.6, ty - 4.4, 4.8, 5, 1.2, gradX(g, 104.6, 109.4, "#d9b8b0", "#f4e6e0", "#c9a8a0")); elips(g, 107, ty - 4.3, 2.4, .8, "#4a2a1c");
      g.strokeStyle = "#e4cfc8"; g.lineWidth = .6; g.beginPath(); g.arc(110, ty - 2, 1.3, -1.4, 1.4); g.stroke();
      elips(g, 153, ty + 1, 5.4, 2, "#ece6da"); elips(g, 153, ty + .8, 3.6, 1.2, "#ddd5c6"); kotak(g, 156, ty - 1.6, 5, .5, "#bdbdbd");
      g.save(); g.translate(130, ty + 1.5); g.scale(.74, .74); kue(g, 0, 0, t); g.restore();
    } });
    A.sprite.push({ y: 172, gambar: function (g) {
      for (var y = 80; y < 172; y += 8) kotak(g, 253.6, y - 10, 1, 10, "#3a2a1f");
      bulatIsi(g, 250, 68, 6, 104, 2, gradX(g, 250, 256, "#5a3e2a", "#7a5638", "#4a3222"));
    } });
    // cahaya ruangan: gelap merata, terang di sekitar lampu
    A.cahaya = function (g) {
      kotak(g, -40, -40, A.W + 80, A.H + 80, "rgba(8,6,16,.5)");
      g.globalCompositeOperation = "destination-out";
      [[243, 52, 70, .9], [282, 130, 46, .55], [78, 74, 52, .85], [216, 38, 30, .6], [130, 108, 62, .7], [130, 10, 90, .35], [40, 30, 26, .3]].forEach(function (c) { cahaya(g, c[0], c[1], c[2], "0,0,0", c[3]); });
      g.globalCompositeOperation = "source-over";
    };
    A.efek = function (g, t) {
      if (A.gambarCahaya) g.drawImage(A.gambarCahaya, A.kotakCahaya.x, A.kotakCahaya.y, A.kotakCahaya.w, A.kotakCahaya.h);
      g.globalCompositeOperation = "lighter";
      cahaya(g, 243, 50, 46, "255,170,80", .16); cahaya(g, 78, 72, 30, "255,170,80", .14);
      if (!KUE.padam) cahaya(g, 130, 104, 40, "255,170,80", .14 + Math.sin(t * 9) * .02);
      g.globalCompositeOperation = "source-over";
    };
    A.tempat.push({ key: "kue", nama: "Kue", x: 96, y: 142, w: 66, h: 24, lx: 130, ly: 76, tanpaLabel: true });
    A.benda.push({ key: "kue", x: 108, y: 92, w: 44, h: 46, ax: 130, ay: 152, r: 30 });
    A.benda.push({ key: "pot", x: 10, y: 156, w: 26, h: 38, ax: 24, ay: 200, r: 30 });
    A.benda.push({ key: "dia", ikut: true, x: 0, y: 0, w: 18, h: 36, ax: 0, ay: 0, r: 40 });
    A.pindah.push({ x: 260, y: 66, w: 44, h: 18, ke: "lantai2", pos: { x: 282, y: 88, arah: "bawah" }, teks: "Naik ke lantai 2" });
    A.pindah.push({ x: 144, y: 214, w: 32, h: 10, ke: "luar", pos: { x: 190, y: 228, arah: "bawah" }, teks: "Keluar" });
    return A;
  }

  /* ---------- Lantai 2: kamar tidur malam dengan plafon langit berbintang ---------- */
  var titikNight = null;
  function hurufBunga() {
    if (titikNight) return titikNight;
    var c = document.createElement("canvas"); c.width = 240; c.height = 80; var x = c.getContext("2d");
    x.font = "700 64px Arial, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = "#000"; x.fillText("night", 120, 42);
    var d = x.getImageData(0, 0, 240, 80).data, t = [];
    for (var yy = 0; yy < 80; yy += 5) for (var xx = (yy / 5 % 2) * 2.5; xx < 240; xx += 5) if (d[(yy * 240 + Math.round(xx)) * 4 + 3] > 120) t.push([xx / 240, yy / 80]);
    return (titikNight = t);
  }
  function buatLantai2() {
    var A = { id: "lantai2", W: 320, H: 200, latar: "#0b0d18", padat: [], sprite: [], tempat: [], pindah: [], benda: [], lokasi: "Kamar" };
    function blok(x, y, w, h) { A.padat.push([x, y, w, h]); }
    blok(0, 0, 320, 80); blok(0, 0, 8, 200); blok(306, 0, 14, 200); blok(0, 190, 320, 10);
    blok(44, 62, 64, 64); blok(114, 70, 26, 14); blok(158, 92, 24, 12); blok(198, 76, 44, 6); blok(250, 92, 8, 92);
    A.selimut = 0; A.selimutKe = 0; A.bersih = 0; A.tidur = false; A.diSofa = false;
    var fotoD = D.fotoDinding ? Object.assign(new Image(), { src: D.fotoDinding }) : null, fotoM = D.fotoMeja ? Object.assign(new Image(), { src: D.fotoMeja }) : null;
    function rasio(im, awal) { return im && im.complete && im.naturalWidth ? im.naturalWidth / im.naturalHeight : awal; }
    // bingkai kayu + passe-partout krem; ukurannya mengikuti bentuk foto supaya foto tampil utuh
    function bingkaiFoto(g, im, x, y, w, h, tebal, isi) {
      kotak(g, x + .8, y + .8, w, h, "rgba(0,0,0,.25)");
      kotak(g, x, y, w, h, "#2a2018"); kotak(g, x + tebal * .3, y + tebal * .3, w - tebal * .6, h - tebal * .6, "#4a3a2a");
      kotak(g, x, y, w, tebal * .25, "rgba(255,230,190,.12)");
      kotak(g, x + tebal, y + tebal, w - tebal * 2, h - tebal * 2, "#ece2cc");
      var m = tebal * 1.45; gambarFoto(g, im, x + m, y + m, w - m * 2, h - m * 2, isi);
      kotak(g, x + m, y + m, w - m * 2, .3, "rgba(0,0,0,.18)");
    }
    function gambarFoto(g, im, x, y, w, h, isi) {
      if (im && im.complete && im.naturalWidth) { var r = Math.max(w / im.naturalWidth, h / im.naturalHeight), sw = w / r, sh = h / r; g.drawImage(im, (im.naturalWidth - sw) / 2, (im.naturalHeight - sh) / 2, sw, sh, x, y, w, h); }
      else { kotak(g, x, y, w, h, gradV(g, y, y + h, isi[0], isi[1])); lingkaran(g, x + w * .35, y + h * .45, h * .16, "rgba(255,240,220,.6)"); poligon(g, [[x, y + h], [x + w * .45, y + h * .5], [x + w, y + h]], "rgba(40,30,30,.35)"); }
    }
    A.lantai = function (g) {
      // plafon langit malam (seperti mural) + lampu tersembunyi
      kotak(g, 0, 0, 320, 18, gradV(g, 0, 18, "#081236", "#1d3c86"));
      for (var s = 0; s < 70; s++) { var sx = acak(s, 61) * 320, sy = acak(61, s) * 16; lingkaran(g, sx, sy, .2 + acak(s, 62) * .45, "rgba(255,255,255," + (.5 + acak(s, 63) * .5) + ")"); }
      for (var m = 0; m < 6; m++) { g.strokeStyle = "rgba(220,235,255,.45)"; g.lineWidth = .3; var mx = 30 + m * 50 + acak(m, 3) * 20; g.beginPath(); g.moveTo(mx, 0); g.lineTo(mx - 10, 12); g.stroke(); }
      cahaya(g, 160, 18, 70, "200,220,255", .35);
      lingkaran(g, 262, 7, 4, "#f4f0d8"); lingkaran(g, 264, 6, 3.6, "#13286a");
      kotak(g, 0, 18, 320, 2.4, "#e9e2d2"); kotak(g, 0, 20.4, 320, 1.4, "rgba(255,240,210,.8)");
      // dinding krem hangat
      kotak(g, 0, 22, 320, 58, gradV(g, 22, 80, "#e4d3b3", "#c9b28a"));
      for (var wv = 0; wv < 400; wv++) dab(g, acak(wv, 71) * 320, 22 + acak(71, wv) * 56, 1.2, .5, 0, acak(wv, 72) > .5 ? "rgba(255,250,235,.08)" : "rgba(120,90,50,.06)");
      kotak(g, 0, 76, 320, 4, "#efe8da"); kotak(g, 0, 79, 320, 1, "rgba(0,0,0,.2)");
      // pintu kamar mandi
      kotak(g, 11, 30, 26, 47, "#efe9de"); kotak(g, 13, 32, 22, 45, gradX(g, 13, 35, "#f7f3ea", "#ffffff", "#e5ddcf"));
      g.strokeStyle = "rgba(150,130,100,.35)"; g.lineWidth = .4; g.strokeRect(16, 36, 16, 16); g.strokeRect(16, 56, 16, 17); lingkaran(g, 32, 56, .9, "#b89a5a");
      // karpet krem
      kotak(g, 8, 80, 298, 110, gradV(g, 80, 190, "#cdb796", "#b9a17d"));
      for (var c = 0; c < 2600; c++) dab(g, 8 + acak(c, 81) * 298, 80 + acak(81, c) * 110, .7, .35, acak(c, 82), acak(c, 83) > .5 ? "rgba(255,245,225,.08)" : "rgba(90,70,40,.08)");
      bulatIsi(g, 128, 130, 110, 46, 6, "rgba(240,230,210,.35)");
      kotak(g, 0, 0, 8, 200, "#2a2620"); kotak(g, 306, 0, 14, 200, "#2a2620"); kotak(g, 0, 190, 320, 10, "#3a332a");
      // tangga turun
      kotak(g, 258, 92, 48, 90, "#120d0b");
      for (var t2 = 0; t2 < 8; t2++) { var ty = 94 + t2 * 11; kotak(g, 260, ty, 44, 8.5, "rgb(" + (120 - t2 * 10) + "," + (92 - t2 * 8) + "," + (66 - t2 * 6) + ")"); kotak(g, 260, ty + 8.5, 44, 2.5, "rgba(0,0,0,.45)"); }
    };
    // jendela bertirai tertutup
    A.sprite.push({ y: 1, gambar: function (g, t) {
      kotak(g, 136, 22, 56, 2, "#5a4632");
      for (var k = 0; k < 2; k++) {
        var x0 = 138 + k * 26;
        kotak(g, x0, 24, 26, 54, gradX(g, x0, x0 + 26, "#c9b48c", "#e6d4ae", "#bfa77c"));
        for (var f = 0; f < 6; f++) kotak(g, x0 + 2 + f * 4.2, 24, 1.1, 54, "rgba(110,85,50,.22)");
      }
      kotak(g, 163.6, 24, .8, 54, "rgba(255,240,200,.6)"); cahaya(g, 164, 50, 10, "190,210,255", .18);
      // bingkai foto besar di dinding, di samping lemari
      var rd = rasio(fotoD, 4 / 3), hd = 38, wd = hd * rd; if (wd > 54) { wd = 54; hd = wd / rd; }
      var xd = 275 - wd / 2, yd = 24 + (38 - hd) / 2;
      bingkaiFoto(g, fotoD, xd, yd, wd, hd, 1.9, ["#7a8aa8", "#3a4058"]);
      if (bendaFotoD) { bendaFotoD.x = xd - 1; bendaFotoD.y = yd - 1; bendaFotoD.w = wd + 2; bendaFotoD.h = hd + 2; }
      // lemari
      elips(g, 220, 81, 26, 2.4, "rgba(0,0,0,.3)");
      kotak(g, 198, 20, 44, 61, gradX(g, 198, 242, "#e7dfcf", "#f6f1e6", "#d6ccb8")); kotak(g, 219.6, 22, .8, 58, "rgba(120,100,70,.4)");
      kotak(g, 198, 20, 44, 2.4, "#cfc4ae"); kotak(g, 216.6, 44, .9, 9, "#b89a5a"); kotak(g, 222.4, 44, .9, 9, "#b89a5a");
    } });
    // kasur
    A.sprite.push({ y: 126, gambar: function (g, t) {
      A.selimut += (A.selimutKe - A.selimut) * .08;
      var u = A.selimut;
      elips(g, 76, 126, 36, 4, "rgba(0,0,0,.3)");
      bulatIsi(g, 44, 44, 64, 24, 5, gradV(g, 44, 68, "#efe6d6", "#d9ccb4")); for (var b = 0; b < 4; b++) bulatIsi(g, 48 + b * 14.5, 48, 12.5, 16, 3, "rgba(255,255,255,.12)");
      bulatIsi(g, 42, 62, 68, 62, 4, "#cdbf9f");
      bulatIsi(g, 44, 62, 64, 58, 3, gradV(g, 62, 120, "#fbf8f2", "#ebe4d6"));
      bulatIsi(g, 49, 64, 25, 11, 4, gradV(g, 64, 75, "#ffffff", "#e7e0d2")); bulatIsi(g, 78, 64, 25, 11, 4, gradV(g, 64, 75, "#ffffff", "#e7e0d2"));
      // bunga bertuliskan "night" di atas seprai
      if (u > .05 && A.bersih < 1) {
        var tt = hurufBunga();
        g.save(); g.globalAlpha = Math.min(1, u * 1.4) * (1 - A.bersih);
        tt.forEach(function (p, i) { var x = 47 + p[0] * 58, y = 79 + p[1] * 24; dab(g, x, y, 1.05, .95, 0, i % 6 ? "#a8233a" : "#f0d8da"); if (i % 3 === 0) dab(g, x - .3, y - .3, .4, .4, 0, "rgba(255,255,255,.4)"); });
        [[50, 104], [58, 108], [96, 104], [90, 109], [74, 110]].forEach(function (p, i) { dab(g, p[0], p[1], 1.6, .9, i, "#4d7a3a"); dab(g, p[0] + 1, p[1] - 1, 1.2, 1.2, 0, "#c0364c"); });
        g.restore();
      }
      // yang berulang tahun sedang tiduran (kepala di bantal)
      if (A.tidur && pemain) gambarOrang(g, { jenis: jenisKu, baju: pemain.baju, arah: "bawah", tanpaBayangan: true, skala: .9 }, 76, 91.5, t);
      // selimut (tersingkap ke bawah saat diklik)
      var atas = (A.tidur ? 80 : 78) + u * 30;
      bulatIsi(g, 43, atas, 66, 122 - atas, 3, gradV(g, atas, 122, "#f2ece0", "#d9cfbd"));
      kotak(g, 43, atas, 66, 4, "#ffffff"); kotak(g, 43, atas + 4, 66, .8, "rgba(120,100,70,.25)");
      for (var f = 0; f < 5; f++) kotak(g, 48 + f * 13, atas + 6, .5, 116 - atas - 6, "rgba(150,130,100,.12)");
      kotak(g, 43, 118, 66, 6, "#b9aa8a");
    } });
    // lampu dinding menggantung di atas meja
    A.sprite.push({ y: 2, gambar: function (g) {
      kotak(g, 126, 30, 3, 6, "#6b5236"); kotak(g, 126.4, 30.4, 2.2, 5.2, "#8a6a44");
      g.strokeStyle = "#4a3a2a"; g.lineWidth = .7; g.beginPath(); g.moveTo(127.5, 32); g.quadraticCurveTo(128, 26.5, 133, 28); g.stroke();
      kotak(g, 132.8, 28, .35, 9, "#3a3028");
      poligon(g, [[130.6, 37], [135.4, 37], [137.4, 43], [128.6, 43]], gradV(g, 37, 43, "#fff1cf", "#e9c07a")); elips(g, 133, 43, 4.4, .7, "#fff6dc"); kotak(g, 132.2, 35.8, 1.6, 1.4, "#b89a5a");
    } });
    // meja persegi: bingkai foto, album, remote
    A.sprite.push({ y: 84, gambar: function (g) {
      elips(g, 127, 84, 16, 1.8, "rgba(0,0,0,.3)");
      kotak(g, 115, 72, 2, 12, "#8f7656"); kotak(g, 137, 72, 2, 12, "#7d664a"); kotak(g, 117, 72, 20, 2.4, "#a68a66");
      kotak(g, 114, 60, 26, 12.4, gradV(g, 60, 72.4, "#d9c7a8", "#c7b18c")); kotak(g, 114, 60, 26, .8, "#efe3cb"); kotak(g, 114, 72, 26, 1.6, "#9a7f5c");
      // bingkai foto berdiri
      var rm = rasio(fotoM, 3 / 4), hm = 8, wm = Math.max(4.5, Math.min(11, hm * rm)); hm = Math.min(9.5, wm / rm);
      kotak(g, 119.8 - wm / 2 - .2, 60.2, wm + .4, 1, "rgba(0,0,0,.25)"); bingkaiFoto(g, fotoM, 119.8 - wm / 2, 60.4 - hm, wm, hm, .55, ["#b58a7a", "#5a4048"]);
      // album foto tebal tergeletak (hilang saat dibawa ke sofa)
      if (!A.albumDibawa) {
        kotak(g, 125.4, 64.4, 9, 3, "rgba(0,0,0,.25)"); kotak(g, 125, 63.6, 9, 2.9, "#6e3326"); kotak(g, 125.5, 64.5, 8.2, 1.5, "#f2ead8");
        for (var lb = 0; lb < 4; lb++) kotak(g, 125.5, 64.75 + lb * .35, 8.2, .12, "rgba(150,130,100,.5)");
        kotak(g, 125, 63.4, 9, .9, "#8a4636"); kotak(g, 127.8, 63.6, 3.4, .35, "#d8b46a");
      }
      if (!A.remoteDibawa) { g.save(); g.translate(136.4, 66.5); g.rotate(.35); bulatIsi(g, -1.2, -3, 2.4, 6, .8, "#1f1f22"); lingkaran(g, 0, -1.8, .45, "#c23a30"); for (var tb = 0; tb < 3; tb++) kotak(g, -.7, -.5 + tb * 1.1, 1.4, .5, "#5a5a60"); g.restore(); }
    } });
    // sofa bean bag di samping meja (bagian belakang & bibir depan terpisah supaya tokoh bisa duduk di dalamnya)
    A.sprite.push({ y: 93, gambar: function (g) {
      elips(g, 170, 104, 15, 2.6, "rgba(0,0,0,.3)");
      halus(g, [[156, 100], [155, 88], [160, 81], [170, 78.5], [180, 81], [185, 88], [184, 100]]); g.fillStyle = gradV(g, 78, 104, "#cfc5b9", "#a69a8d"); g.fill();
      g.strokeStyle = "rgba(110,98,86,.35)"; g.lineWidth = .35; g.beginPath(); g.moveTo(170, 79); g.quadraticCurveTo(169, 85, 170, 89); g.moveTo(161, 83); g.quadraticCurveTo(165, 87, 168, 90); g.moveTo(179, 83); g.quadraticCurveTo(175, 87, 172, 90); g.stroke();
      dab(g, 164, 83, 4, 1.6, -.4, "rgba(255,250,240,.22)");
      elips(g, 170, 93, 8.5, 4.2, gradV(g, 89, 97, "#a3978a", "#b8ad9f"));
    } });
    A.sprite.push({ y: 105, gambar: function (g) {
      halus(g, [[155.5, 96], [162, 94.5], [170, 95.5], [178, 94.5], [184.5, 96], [184, 102], [170, 104.5], [156, 102]]); g.fillStyle = gradV(g, 94, 104, "#c9beb1", "#9d9184"); g.fill();
      elips(g, 170, 103.4, 13.6, 1.7, "#8b8d91"); elips(g, 170, 102.8, 13, .7, "rgba(255,255,255,.12)");
      dab(g, 162, 97, 3.4, 1, -.1, "rgba(255,250,240,.2)"); dab(g, 177, 97, 3.4, 1, .1, "rgba(255,250,240,.16)");
      // album terbuka di pangkuan saat duduk membaca
      if (A.diSofa && A.albumDibawa) { kotak(g, 165, 91, 10, 4.6, "#6e3326"); kotak(g, 165.6, 91.4, 4.3, 3.8, "#f4ecdc"); kotak(g, 170.1, 91.4, 4.3, 3.8, "#efe6d4"); kotak(g, 166.2, 92, 3, 2.4, "#9fb0c4"); kotak(g, 170.7, 92, 3, 2.4, "#c4a99f"); }
    } });
    A.sprite.push({ y: 184, gambar: function (g) {
      for (var y = 96; y < 184; y += 8) kotak(g, 253.6, y - 10, 1, 10, "#3a2a1f");
      bulatIsi(g, 250, 86, 6, 98, 2, gradX(g, 250, 256, "#5a3e2a", "#7a5638", "#4a3222"));
    } });
    A.cahaya = function (g) {
      kotak(g, -40, -40, A.W + 80, A.H + 80, "rgba(8,12,40,.58)");
      g.globalCompositeOperation = "destination-out";
      cahaya(g, 160, 16, 110, "0,0,0", .55); cahaya(g, 132, 52, 46, "0,0,0", .85); cahaya(g, 170, 94, 26, "0,0,0", .35); cahaya(g, 76, 92, 46, "0,0,0", .35);
      g.globalCompositeOperation = "source-over";
    };
    A.efek = function (g, t) {
      if (A.gambarCahaya) g.drawImage(A.gambarCahaya, A.kotakCahaya.x, A.kotakCahaya.y, A.kotakCahaya.w, A.kotakCahaya.h);
      g.globalCompositeOperation = "lighter";
      cahaya(g, 133, 46, 26, "255,190,110", .24); cahaya(g, 160, 22, 90, "120,150,255", .06);
      g.globalCompositeOperation = "source-over";
    };
    A.benda.push({ key: "kasur", x: 42, y: 60, w: 68, h: 66, ax: 76, ay: 100, r: 48 });
    var bendaFotoD = { key: "fotoDinding", x: 249, y: 23, w: 50, h: 38, ax: 268, ay: 90, r: 44 }; A.benda.push(bendaFotoD);
    A.benda.push({ key: "meja", x: 112, y: 50, w: 30, h: 36, ax: 127, ay: 92, r: 30 });
    A.benda.push({ key: "sofa", x: 154, y: 77, w: 32, h: 29, ax: 170, ay: 112, r: 28 });
    A.benda.push({ key: "jendela", x: 136, y: 22, w: 56, h: 58, ax: 164, ay: 88, r: 30 });
    A.benda.push({ key: "lemari", x: 196, y: 18, w: 48, h: 64, ax: 220, ay: 90, r: 30 });
    A.pindah.push({ x: 262, y: 134, w: 40, h: 48, ke: "lantai1", pos: { x: 282, y: 184, arah: "bawah" }, teks: "Turun ke lantai 1" });
    A.pindah.push({ x: 12, y: 80, w: 24, h: 6, ke: "kamarMandi", pos: { x: 85, y: 124, arah: "atas" }, teks: "Kamar mandi" });
    return A;
  }

  /* ---------- Kamar mandi kecil (krem keabu-abuan) ---------- */
  function hatiJalur(g, cx, cy, s) { g.beginPath(); g.moveTo(cx, cy + s); g.bezierCurveTo(cx - s * 1.7, cy - s * .1, cx - s * .9, cy - s * 1.3, cx, cy - s * .4); g.bezierCurveTo(cx + s * .9, cy - s * 1.3, cx + s * 1.7, cy - s * .1, cx, cy + s); }
  /* cermin berembun: titik-titik air, latar kabur dengan bayangan diri samar,
     hati besar dan tulisan tangan yang "dihapus" jari */
  function lukisCermin(c) {
    var W = c.width, H = c.height, g = c.getContext("2d");
    function latar() {
      var b = document.createElement("canvas"); b.width = W; b.height = H; var x = b.getContext("2d");
      var gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#8d969c"); gr.addColorStop(.42, "#b9b6a8"); gr.addColorStop(.58, "#e4dcc4"); gr.addColorStop(.75, "#9da69a"); gr.addColorStop(1, "#6f7b74"); x.fillStyle = gr; x.fillRect(0, 0, W, H);
      [[.75, .18, 40, "255,200,150"], [.68, .38, 34, "255,170,160"], [.85, .5, 30, "255,190,170"], [.22, .85, 46, "255,200,140"], [.6, .9, 30, "255,220,180"]].forEach(function (k) { cahaya(x, k[0] * W, k[1] * H, k[2] * W / 600, k[3], .55); });
      var p = document.createElement("canvas"); p.width = 180; p.height = 180; potret(p, jenisKu || "cewek", { baju: pemain ? pemain.baju : "" });
      var kecil = document.createElement("canvas"); kecil.width = 16; kecil.height = 16; kecil.getContext("2d").drawImage(p, 0, 0, 16, 16);
      var bay = document.createElement("canvas"); bay.width = W; bay.height = H; var by = bay.getContext("2d"); by.imageSmoothingEnabled = true;
      by.drawImage(kecil, W * .5 - H * .5, H * .1, H, H); by.globalCompositeOperation = "destination-in";
      var rg = by.createRadialGradient(W / 2, H * .5, H * .1, W / 2, H * .5, H * .48); rg.addColorStop(0, "rgba(0,0,0,1)"); rg.addColorStop(1, "rgba(0,0,0,0)"); by.fillStyle = rg; by.fillRect(0, 0, W, H);
      x.save(); x.globalAlpha = .45; x.drawImage(bay, 0, 0); x.restore();
      return b;
    }
    function topeng() {
      var m = document.createElement("canvas"); m.width = W; m.height = H; var x = m.getContext("2d");
      x.strokeStyle = "#000"; x.fillStyle = "#000"; x.lineCap = "round"; x.lineJoin = "round";
      var s = H * .42, cx = W / 2, cy = H * .5;
      x.beginPath(); x.moveTo(cx, cy + s * 1.08); x.bezierCurveTo(cx - s * 1.9, cy - s * .05, cx - s * 1.05, cy - s * 1.45, cx, cy - s * .55); x.bezierCurveTo(cx + s * 1.05, cy - s * 1.45, cx + s * 1.9, cy - s * .05, cx, cy + s * 1.08);
      x.lineWidth = W / 140; x.stroke();
      var baris = String(D.tulisanCermin || "I love\nyou").split(/\n/).slice(0, 3), uk = H * (baris.length > 2 ? .12 : .16);
      x.font = "700 " + Math.round(uk) + 'px "Dancing Script", "Segoe Script", "Brush Script MT", cursive'; x.textAlign = "center"; x.textBaseline = "middle"; x.lineWidth = W / 220;
      baris.forEach(function (t, i) { var y = cy - (baris.length - 1) * uk * .45 + i * uk * .95; x.save(); x.translate(cx, y); x.rotate(-.06); x.strokeText(t, 0, 0); x.fillText(t, 0, 0); x.restore(); });
      return m;
    }
    function lukis() {
      var b = latar(), m = topeng();
      // kaca berembun = latar yang lebih pudar
      g.drawImage(b, 0, 0); g.fillStyle = "rgba(225,228,226,.38)"; g.fillRect(0, 0, W, H);
      // titik-titik air
      for (var i = 0; i < W * H / 220; i++) {
        var x = acak(i, 31) * W, y = acak(31, i) * H, r = (.6 + Math.pow(acak(i, 32), 3) * 4.2) * W / 600;
        lingkaran(g, x + r * .25, y + r * .3, r, "rgba(40,50,55,.28)"); lingkaran(g, x, y, r, "rgba(235,238,236,.55)"); lingkaran(g, x - r * .35, y - r * .35, r * .32, "rgba(255,255,255,.85)");
      }
      // bekas jari: kaca bening di garis hati & tulisan
      var bersih = document.createElement("canvas"); bersih.width = W; bersih.height = H; var bx = bersih.getContext("2d");
      bx.drawImage(b, 0, 0); bx.fillStyle = "rgba(30,34,40,.28)"; bx.fillRect(0, 0, W, H); bx.globalCompositeOperation = "destination-in"; bx.drawImage(m, 0, 0);
      g.drawImage(bersih, 0, 0);
    }
    lukis();
    if (document.fonts && document.fonts.load) document.fonts.load('700 40px "Dancing Script"').then(function () { if (c.isConnected) lukis(); }, function () {});
  }
  function bakMandi(g, A, t) {
    var cx = 98, cy = 50, rx = 44, ry = 13;
    elips(g, cx, cy, rx + 4, ry + 4, gradV(g, cy - ry, cy + ry, "#e9e5de", "#c9c3b9"));
    elips(g, cx, cy + .6, rx, ry, gradV(g, cy - ry, cy + ry, "#bdb7ad", "#d6d1c8"));
    var u = A.air;
    if (A.surat && u < .98) { g.save(); g.translate(cx + 8, cy + 3); g.rotate(-.18 + Math.sin(t * 1.4) * .05 * u); bulatIsi(g, -6, -3.6, 12, 7.2, .6, "#efe7d4"); kotak(g, -4.4, -1.6, 8.8, .4, "rgba(90,70,50,.4)"); kotak(g, -4.4, 0, 7, .4, "rgba(90,70,50,.4)"); lingkaran(g, 4, 2, .9, "#a8322c"); g.restore(); }
    if (u > .02) {
      g.save(); g.beginPath(); g.ellipse(cx, cy + .6, rx * (.86 + u * .14), ry * (.8 + u * .2), 0, 0, 6.2832); g.clip();
      g.fillStyle = "rgba(150,196,190," + (.35 + u * .4) + ")"; g.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
      for (var w = 0; w < 5; w++) { g.strokeStyle = "rgba(255,255,255,.22)"; g.lineWidth = .4; g.beginPath(); g.ellipse(cx - 10 + w * 6 + Math.sin(t + w) * 2, cy - 2 + (w % 2) * 3, 8, 1.4, 0, 0, 6.2832); g.stroke(); }
      g.restore();
    }
    if (A.busa) {
      if (A.berendam) {
        g.save(); g.beginPath(); g.ellipse(cx, cy, rx + 2, ry + 30, 0, Math.PI, 0); g.lineTo(cx + rx + 2, cy + 2); g.lineTo(cx - rx - 2, cy + 2); g.clip();
        gambarOrang(g, { jenis: jenisKu, baju: pemain.baju, arah: "bawah", mata: "senang", tanpaBayangan: true }, cx - 14, cy + 15, t);
        g.restore();
      }
      for (var b = 0; b < 70; b++) { var a = acak(b, 51) * 6.28, r = Math.sqrt(acak(51, b)); var bx = cx + Math.cos(a) * r * (rx - 3), by = cy + Math.sin(a) * r * (ry - 2); if (A.berendam && Math.abs(bx - cx + 14) < 5 && by < cy) continue; lingkaran(g, bx, by + .6, 2 + acak(b, 52) * 2.6, "rgba(200,205,210,.9)"); lingkaran(g, bx - .4, by, 1.8 + acak(b, 52) * 2.4, "#f6f6f4"); }
      var dx = cx + 18 + Math.sin(t * .8) * 4, dy = cy - 2 + Math.cos(t * 1.1) * 1.2;
      elips(g, dx, dy + 1.4, 4, 1.2, "rgba(0,0,0,.12)"); elips(g, dx, dy, 3.6, 2.2, "#f2c63a"); lingkaran(g, dx + 2, dy - 2.4, 1.8, "#f2c63a"); poligon(g, [[dx + 3.4, dy - 2.6], [dx + 5.2, dy - 2.2], [dx + 3.4, dy - 1.6]], "#e8792e"); lingkaran(g, dx + 2.4, dy - 3, .3, "#2a1a10");
    }
    // keran & penutup pembuangan di ujung kiri
    kotak(g, cx - rx - 2, cy - 4, 3, 2, "#8f9396"); lingkaran(g, cx - rx + 4, cy + 1, 1.2, A.air < .5 ? "#3a3a3a" : "#a7abae");
  }
  function buatKamarMandi() {
    var A = { id: "kamarMandi", W: 170, H: 140, latar: "#1a1714", padat: [], sprite: [], tempat: [], pindah: [], benda: [], lokasi: "Kamar mandi", tinggi: 12 };
    function blok(x, y, w, h) { A.padat.push([x, y, w, h]); }
    blok(0, 0, 170, 30); blok(36, 24, 128, 52); blok(0, 0, 24, 104); blok(164, 0, 6, 140); blok(0, 132, 70, 8); blok(100, 132, 70, 8); blok(140, 104, 18, 14);
    A.air = 1; A.surat = true; A.busa = false; A.berendam = false;
    A.lantai = function (g) {
      kotak(g, 0, 0, 170, 34, gradV(g, 0, 34, "#d6d0c6", "#c4bdb2"));
      for (var tx = 0; tx < 170; tx += 12) kotak(g, tx, 0, .4, 34, "rgba(110,100,85,.18)"); for (var ty = 6; ty < 34; ty += 12) kotak(g, 0, ty, 170, .4, "rgba(110,100,85,.18)");
      // jendela kecil bertirai
      kotak(g, 84, 4, 28, 20, "#a9a397"); for (var b = 0; b < 9; b++) kotak(g, 85, 5 + b * 2.1, 26, 1.5, b % 2 ? "#e2ddd3" : "#d3cdc2");
      // lantai keramik abu-krem
      kotak(g, 6, 30, 158, 102, gradV(g, 30, 132, "#cdc6ba", "#b9b1a4"));
      for (var fx = 6; fx < 164; fx += 20) kotak(g, fx, 30, .5, 102, "rgba(90,80,65,.2)"); for (var fy = 30; fy < 132; fy += 20) kotak(g, 6, fy, 158, .5, "rgba(90,80,65,.2)");
      poligon(g, [[60, 132], [80, 30], [92, 30], [72, 132]], "rgba(255,255,255,.1)");
      // panggung bak lonjong
      kotak(g, 36, 22, 128, 54, gradV(g, 22, 76, "#dcd7cf", "#c7c0b5")); kotak(g, 36, 74, 128, 3, "rgba(0,0,0,.12)");
      bulatIsi(g, 40, 76, 120, 8, 3, gradV(g, 76, 84, "#d8d2c8", "#bdb5a8"));
      g.save(); jalurBulat(g, 38, 2, 124, 80, 18); g.strokeStyle = "rgba(255,244,215,.8)"; g.lineWidth = 1; g.stroke(); g.restore();
      cahaya(g, 100, 10, 50, "255,240,210", .18);
      kotak(g, 142, 26, 18, 6, "#bdb6aa"); [144, 148.5, 153, 157].forEach(function (x, i) { bulatIsi(g, x, 27 - i % 2, 2.6, 4 + i % 2, .8, ["#5a5a5c", "#e1dbcf", "#a8894e", "#8b9396"][i]); });
      // dinding kiri: meja wastafel menempel samping (terlihat dari samping)
      kotak(g, 0, 0, 6, 140, "#2a2620");
      kotak(g, 6, 30, 18, 74, gradX(g, 6, 24, "#bfb8ad", "#cbc5bb", "#d5cfc5"));
      kotak(g, 6, 36, 4, 38, "#9aa3a6"); kotak(g, 7, 37, 2.4, 36, "rgba(235,238,236,.75)"); kotak(g, 6, 36, 4, 1, "#7d7a74");
      kotak(g, 10, 56, 14, 44, gradX(g, 10, 24, "#cfc9bf", "#d9d4cb", "#e3ded5")); kotak(g, 22, 56, 2, 44, "rgba(0,0,0,.1)");
      elips(g, 16.5, 78, 4.2, 9, "#b8b2a8"); elips(g, 16.8, 78, 3.2, 7.4, gradX(g, 14, 20, "#9ea4a5", "#b8bcbb", "#d2d4d1")); kotak(g, 10.4, 76, 3.6, 1.2, "#8f9396");
      // keset
      kotak(g, 54, 92, 46, 16, "#a69e90"); for (var r = 0; r < 8; r++) kotak(g, 54, 93 + r * 2, 46, .6, "rgba(70,60,50,.35)");
      kotak(g, 164, 0, 6, 140, "#2a2620"); kotak(g, 0, 132, 70, 8, "#3a332a"); kotak(g, 100, 132, 70, 8, "#3a332a");
    };
    A.sprite.push({ y: 76, gambar: function (g, t) { bakMandi(g, A, t); } });
    A.sprite.push({ y: 118, gambar: function (g) {
      elips(g, 149, 118, 9, 2, "rgba(0,0,0,.2)");
      poligon(g, [[141, 104], [157, 104], [155.5, 118], [142.5, 118]], gradX(g, 141, 157, "#8d9295", "#b4b9bb", "#7c8184"));
      elips(g, 149, 104, 8, 2.4, "#a2a7a9"); elips(g, 149, 103.4, 8, 2.2, gradX(g, 141, 157, "#9aa0a3", "#c3c7c9", "#8a8f92")); kotak(g, 146, 116, 6, 2, "#5d6264");
    } });
    A.cahaya = function (g) { kotak(g, -40, -40, A.W + 80, A.H + 80, "rgba(30,24,18,.16)"); };
    A.efek = function (g) { if (A.gambarCahaya) g.drawImage(A.gambarCahaya, A.kotakCahaya.x, A.kotakCahaya.y, A.kotakCahaya.w, A.kotakCahaya.h); };
    A.benda.push({ key: "cermin", x: 4, y: 32, w: 22, h: 70, ax: 32, ay: 80, r: 24 });
    A.benda.push({ key: "bak", x: 46, y: 30, w: 112, h: 46, ax: 98, ay: 92, r: 34 });
    A.benda.push({ key: "sampah", x: 138, y: 96, w: 22, h: 24, ax: 146, ay: 126, r: 22 });
    A.pindah.push({ x: 70, y: 133, w: 30, h: 7, ke: "lantai2", pos: { x: 24, y: 94, arah: "bawah" }, teks: "Kembali ke kamar" });
    return A;
  }

  /* ---------- teka-teki bak mandi: buang airnya dulu, baru suratnya bisa diambil ---------- */
  function bukaBak() {
    var A = ADEGAN.kamarMandi;
    if (A.berendam) { selesaiBerendam(); return; }
    if (!A.surat) { tawarBerendam(); return; }
    var w = el("div", null, '<div class="kicker">Bak mandi</div><p class="pelan petunjuk-bak">Ada sesuatu di dasar bak…</p><canvas class="kanvas-bak" width="720" height="420" aria-label="Bak mandi berisi air"></canvas>');
    var c = w.querySelector("canvas"), k = c.getContext("2d"), info = w.querySelector(".petunjuk-bak"), buka = true, surut = false, goyang = 0;
    var SUMBAT = { x: 108, y: 210, r: 34 }, SURAT = { x: 380, y: 240, w: 150, h: 96 };
    function lukis() {
      if (!buka) return;
      var kini = performance.now(); if (surut && A.air > 0) A.air = Math.max(0, A.air - (kini - (lukis.t || kini)) / 2600); lukis.t = kini;
      goyang = Math.max(0, goyang - .04);
      var u = A.air, t = waktu;
      k.setTransform(1, 0, 0, 1, 0, 0); k.fillStyle = "#c9c2b6"; k.fillRect(0, 0, 720, 420);
      k.fillStyle = "#e3ded6"; k.beginPath(); k.ellipse(360, 210, 340, 190, 0, 0, 6.3); k.fill();
      var gr = k.createRadialGradient(360, 190, 40, 360, 210, 320); gr.addColorStop(0, "#e6e1d9"); gr.addColorStop(1, "#b7b0a5"); k.fillStyle = gr; k.beginPath(); k.ellipse(360, 214, 300, 160, 0, 0, 6.3); k.fill();
      // surat di dasar
      k.save(); k.translate(SURAT.x + SURAT.w / 2 + Math.sin(t * 9) * goyang * 8, SURAT.y + SURAT.h / 2); k.rotate(-.12 + Math.sin(t * 1.3) * .04 * u);
      k.fillStyle = "#efe6d0"; k.fillRect(-SURAT.w / 2, -SURAT.h / 2, SURAT.w, SURAT.h); k.strokeStyle = "rgba(120,100,70,.4)"; k.lineWidth = 2; k.strokeRect(-SURAT.w / 2, -SURAT.h / 2, SURAT.w, SURAT.h);
      k.beginPath(); k.moveTo(-SURAT.w / 2, -SURAT.h / 2); k.lineTo(0, 6); k.lineTo(SURAT.w / 2, -SURAT.h / 2); k.stroke();
      k.fillStyle = "#a8322c"; k.beginPath(); k.arc(0, 8, 9, 0, 6.3); k.fill(); k.restore();
      // sumbat pembuangan
      k.fillStyle = "#8f9396"; k.beginPath(); k.arc(SUMBAT.x, SUMBAT.y, SUMBAT.r * .7, 0, 6.3); k.fill();
      k.fillStyle = surut ? "#2c2c2c" : "#c7cbcd"; k.beginPath(); k.arc(SUMBAT.x, SUMBAT.y, SUMBAT.r * .55, 0, 6.3); k.fill();
      if (!surut) { k.strokeStyle = "#6d7174"; k.lineWidth = 5; k.beginPath(); k.moveTo(SUMBAT.x, SUMBAT.y - 18); k.lineTo(SUMBAT.x, SUMBAT.y - 34); k.stroke(); k.fillStyle = "#6d7174"; k.beginPath(); k.arc(SUMBAT.x, SUMBAT.y - 36, 6, 0, 6.3); k.fill(); }
      // air
      if (u > 0) {
        k.save(); k.beginPath(); k.ellipse(360, 214, 300 * (.9 + u * .1), 160 * (.86 + u * .14), 0, 0, 6.3); k.clip();
        k.fillStyle = "rgba(120,180,175," + (.35 + u * .5) + ")"; k.fillRect(0, 0, 720, 420);
        for (var i = 0; i < 9; i++) { k.strokeStyle = "rgba(255,255,255,.18)"; k.lineWidth = 3; k.beginPath(); k.ellipse(200 + i * 40 + Math.sin(t * 1.4 + i) * 20, 140 + (i % 3) * 60, 60, 8, 0, 0, 6.3); k.stroke(); }
        if (surut) { k.strokeStyle = "rgba(255,255,255,.4)"; k.lineWidth = 3; for (var s = 0; s < 3; s++) { k.beginPath(); k.arc(SUMBAT.x, SUMBAT.y, 14 + s * 12, t * 6 + s, t * 6 + s + 3.6); k.stroke(); } }
        k.restore();
      }
      requestAnimationFrame(lukis);
    }
    c.addEventListener("click", function (e) {
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) * 720 / r.width, y = (e.clientY - r.top) * 420 / r.height;
      if (Math.hypot(x - SUMBAT.x, y - SUMBAT.y) < SUMBAT.r + 14) { if (!surut) { surut = true; info.textContent = "Blub… airnya mulai surut."; suaraAirBuang(2.6 * A.air); } return; }
      if (x > SURAT.x - 10 && x < SURAT.x + SURAT.w + 10 && y > SURAT.y - 10 && y < SURAT.y + SURAT.h + 10) {
        if (A.air > .02) { goyang = 1; info.textContent = A.air > .5 ? "Suratnya terendam air, tidak bisa diambil. Coba cari cara membuang airnya." : "Airnya belum habis…"; return; }
        A.surat = false; buka = false;
        bukaModal('<div class="surat surat-bak"><div class="kicker">Dari dasar bak mandi</div>' + paragraf(D.suratBak || "…") + (D.pengirim ? '<div class="ttd">— ' + esc(D.pengirim) + '</div>' : '') + '</div>', "tempat-surat", tawarBerendam);
      }
    });
    bukaModal(w, "tempat-bak", function () { buka = false; });
    requestAnimationFrame(lukis);
  }
  function tawarBerendam() {
    var w = el("div", null, '<div class="kicker">Bak mandi</div><h2>Ingin berendam?</h2><p class="pelan">Air hangat, banyak busa, dan seekor bebek karet sudah menunggu.</p><div class="baris-tombol"><button class="tombol garis" type="button">Nanti saja</button><button class="tombol" type="button">Berendam</button></div>');
    var tb = w.querySelectorAll("button");
    tb[0].addEventListener("click", tutupModal);
    tb[1].addEventListener("click", function () {
      var A = ADEGAN.kamarMandi; tutupModal();
      A.air = 1; A.busa = true; A.berendam = true; pemain.x = 98; pemain.y = 92; pemain.arah = "bawah";
      kabar("Hangatnya… Klik bak lagi atau gerakkan tokoh untuk keluar.");
    });
    setTimeout(function () { bukaModal(w, "tempat-isian"); }, 200);
  }
  function selesaiBerendam() { var A = ADEGAN.kamarMandi; A.berendam = false; pemain.x = 98; pemain.y = 92; pemain.arah = "bawah"; }

  /* =====================================================================
     PERMAINAN
     ===================================================================== */
  var ADEGAN = {}, adegan = null, cv, g, S = 3, R = 3, cam = { x: 0, y: 0 }, pemain = null, dia = null, jenisKu = "";
  var abaikanKlik = 0, audioLatar = null, tombolMusik = null, musikMati = false, laguSekarang = "", posisiLagu = {}, pudarTimer = null, input = { x: 0, y: 0 }, kunci = {}, tahan = null, waktu = 0, sibuk = false, main = false, layarTerbuka = false;
  var kunjungan = {}, terakhir = null, kunciPindah = false, kotakLabel = [], sudahMasuk = false, kejutanSelesai = false, kueSelesai = false;
  var konfeti = [], asap = [], gelapRuang = 0, gelembung = null, suratDibaca = false, suratPohonDibaca = false, sudahNgobrol = false;

  function prarender(A) {
    var M = A.M || 0, c = document.createElement("canvas"); c.width = Math.ceil((A.W + M * 2) * R); c.height = Math.ceil(A.H * R);
    var gg = c.getContext("2d"); gg.scale(R, R); gg.translate(M, 0); A.lantai(gg); A.gambarLantai = c;
    if (A.atas) {
      var a = document.createElement("canvas"); a.width = Math.ceil(A.atas.w * R); a.height = Math.ceil(A.atas.h * R);
      var ag = a.getContext("2d"); ag.scale(R, R); ag.translate(-A.atas.x, -A.atas.y); A.atas.gambar(ag); A.gambarAtas = a;
    }
    if (A.cahaya) {
      var kc = A.kotakCahaya = { x: -(A.M || 0) - 40, y: -40, w: A.W + (A.M || 0) * 2 + 80, h: A.H + 80 };
      var c2 = document.createElement("canvas"), r2 = Math.min(R, 2); c2.width = Math.ceil(kc.w * r2); c2.height = Math.ceil(kc.h * r2);
      var cg = c2.getContext("2d"); cg.scale(r2, r2); cg.translate(-kc.x, -kc.y); A.cahaya(cg); A.gambarCahaya = c2;
    }
  }
  function skala() { return Math.max(2, Math.min(innerWidth / (T * 10.5), innerHeight / (T * (adegan && adegan.tinggi || 15)))); }
  function ukur() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    S = skala() * dpr;
  }
  function solid(x, y) {
    if (x < 0 || y < 0 || x >= adegan.W || y >= adegan.H) return true;
    for (var i = 0; i < adegan.padat.length; i++) { var b = adegan.padat[i]; if (x >= b[0] && x < b[0] + b[2] && y >= b[1] && y < b[1] + b[3]) return true; }
    return false;
  }
  /* ---------- ketuk tujuan: cari jalan (BFS di grid 4 satuan) lalu luruskan ---------- */
  var tujuan = null;
  function garisBebas(a, b) { var d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.ceil(d / 2); for (var i = 1; i <= n; i++) if (!bisaDi(a.x + (b.x - a.x) * i / n, a.y + (b.y - a.y) * i / n)) return false; return true; }
  function cariJalur(tx, ty) {
    var st = 4, W = Math.ceil(adegan.W / st), H = Math.ceil(adegan.H / st), N = W * H, sel = new Uint8Array(N), asal = new Int32Array(N).fill(-1);
    function ok(i) { if (!sel[i]) sel[i] = bisaDi((i % W) * st + st / 2, Math.floor(i / W) * st + st / 2) ? 1 : 2; return sel[i] === 1; }
    var si = Math.max(0, Math.min(W - 1, Math.floor(pemain.x / st))), sj = Math.max(0, Math.min(H - 1, Math.floor(pemain.y / st))), s0 = sj * W + si;
    var antre = [s0], kepala = 0, terbaik = s0, dBaik = 1e9; asal[s0] = s0;
    while (kepala < antre.length) {
      var c = antre[kepala++], ci = c % W, cj = (c - ci) / W, dc = Math.hypot(ci * st + st / 2 - tx, cj * st + st / 2 - ty);
      if (dc < dBaik) { dBaik = dc; terbaik = c; }
      for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) {
        if (!a && !b) continue; var ni = ci + a, nj = cj + b; if (ni < 0 || nj < 0 || ni >= W || nj >= H) continue;
        var n = nj * W + ni; if (asal[n] >= 0 || !ok(n)) continue;
        if (a && b && (!ok(cj * W + ni) || !ok(nj * W + ci))) continue;
        asal[n] = c; antre.push(n);
      }
    }
    var titik = [], c2 = terbaik; while (c2 !== s0) { titik.unshift({ x: (c2 % W) * st + st / 2, y: Math.floor(c2 / W) * st + st / 2 }); c2 = asal[c2]; }
    if (bisaDi(tx, ty) && (!titik.length || garisBebas(titik[titik.length - 1], { x: tx, y: ty }))) titik.push({ x: tx, y: ty });
    if (!titik.length) return null;
    var lurus = [], dari = { x: pemain.x, y: pemain.y }, i = 0;
    while (i < titik.length) { var j = titik.length - 1; while (j > i && !garisBebas(dari, titik[j])) j--; lurus.push(titik[j]); dari = titik[j]; i = j + 1; }
    return lurus;
  }
  function aturTujuan(cx, cy, bd, tp) {
    var w = keDunia(cx, cy), tx = w.x, ty = w.y + 4, aksi = null;
    if (bd) { bendaIkut(); tx = bd.ax; ty = bd.ay; aksi = function () { if (cukupDekat(bd)) pakaiBenda(bd); }; }
    else if (tp) { tx = tp.x + tp.w / 2; ty = tp.y + tp.h / 2; aksi = function () { if (tempatDekat() === tp) bukaTempat(tp.key); }; }
    var jalur = cariJalur(tx, ty); if (!jalur) { if (aksi) aksi(); return; }
    var akhir = jalur[jalur.length - 1];
    tujuan = { jalur: jalur, aksi: aksi, x: akhir.x, y: akhir.y, t: 0, macet: 0 };
  }
  function bisaDi(x, y) { return !solid(x - 4, y - 3) && !solid(x + 4, y - 3) && !solid(x - 4, y + 1) && !solid(x + 4, y + 1); }
  function dalam(z, x, y) { return x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h; }
  function kamera() {
    var vw = cv.width / S, vh = cv.height / S;
    var x0 = adegan.W <= vw ? (adegan.W - vw) / 2 : Math.max(0, Math.min(adegan.W - vw, cam.x - vw / 2));
    var y0 = adegan.H <= vh ? (adegan.H - vh) / 2 : Math.max(0, Math.min(adegan.H - vh, cam.y - vh / 2));
    return { x0: x0, y0: y0, vw: vw, vh: vh };
  }
  function keDunia(cx, cy) { var k = kamera(), dpr = cv.width / innerWidth; return { x: k.x0 + cx * dpr / S, y: k.y0 + cy * dpr / S }; }

  function gerak(dt) {
    if (otoJalan && pemain) {
      var o = otoJalan, p = o.titik[0], ddx = p.x - pemain.x, ddy = p.y - pemain.y, dd = Math.hypot(ddx, ddy), st = 56 * dt;
      if (dd <= st) { pemain.x = p.x; pemain.y = p.y; o.titik.shift(); if (!o.titik.length) { otoJalan = null; pemain.jalan = false; o.selesai(); } }
      else { pemain.x += ddx / dd * st; pemain.y += ddy / dd * st; pemain.arah = Math.abs(ddx) > Math.abs(ddy) ? (ddx > 0 ? "kanan" : "kiri") : (ddy > 0 ? "bawah" : "atas"); pemain.jalan = true; pemain.anim += dt * 8; }
      return;
    }
    if (!pemain || layarTerbuka || sibuk || !main) { if (pemain) pemain.jalan = false; tujuan = null; return; }
    var vx = input.x, vy = input.y;
    if (kunci.ArrowLeft || kunci.a) vx -= 1; if (kunci.ArrowRight || kunci.d) vx += 1; if (kunci.ArrowUp || kunci.w) vy -= 1; if (kunci.ArrowDown || kunci.s) vy += 1;
    if (vx || vy || tahan) tujuan = null;
    else if (tujuan) {
      var tj = tujuan, p0 = tj.jalur[0], tdx = p0.x - pemain.x, tdy = p0.y - pemain.y, td = Math.hypot(tdx, tdy), langkah = 68 * dt;
      if (tj.px != null && Math.hypot(pemain.x - tj.px, pemain.y - tj.py) < .02) tj.macet += dt; else tj.macet = 0;
      tj.px = pemain.x; tj.py = pemain.y;
      if (tj.macet > .4) { tujuan = null; pemain.jalan = false; return; }
      if (td <= Math.max(langkah, .6)) {
        if (bisaDi(p0.x, p0.y)) { pemain.x = p0.x; pemain.y = p0.y; }
        tj.jalur.shift(); cekTempat(); cekPindah();
        if (!tj.jalur.length) { tujuan = null; pemain.jalan = false; if (tj.aksi && adegan && !layarTerbuka && !sibuk) tj.aksi(); return; }
        if (tujuan !== tj) return;
        p0 = tj.jalur[0]; tdx = p0.x - pemain.x; tdy = p0.y - pemain.y; td = Math.hypot(tdx, tdy);
      }
      if (td > 0) { vx = tdx / td; vy = tdy / td; }
    }
    if (!vx && !vy && tahan) {
      var w = keDunia(tahan.x, tahan.y), dx = w.x - pemain.x, dy = w.y - (pemain.y - 10), d = Math.hypot(dx, dy);
      if (d > 4) { vx = dx / d; vy = dy / d; if (d < 16) { vx *= d / 16; vy *= d / 16; } }
    }
    var len = Math.hypot(vx, vy);
    if (len > 1) { vx /= len; vy /= len; len = 1; }
    if (len > .08 && adegan.berendam) selesaiBerendam();
    if (len > .08 && adegan.diSofa) bangunSofa();
    if (len > .08 && adegan.tidur) bangunKasur();
    if (len > .08) {
      var cepat = 68 * dt, nx = pemain.x + vx * cepat, ny = pemain.y + vy * cepat;
      if (bisaDi(nx, pemain.y)) pemain.x = nx;
      if (bisaDi(pemain.x, ny)) pemain.y = ny;
      pemain.arah = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? "kanan" : "kiri") : (vy > 0 ? "bawah" : "atas");
      pemain.jalan = true; pemain.anim += dt * 8 * Math.min(1, len + .3);
      cekTempat(); cekPindah();
    } else pemain.jalan = false;
  }
  function tempatDekat() { var h = null; adegan.tempat.forEach(function (t) { if (dalam(t, pemain.x, pemain.y)) h = t; }); return h; }
  /* benda yang bisa diklik langsung (bagian luar): harus cukup dekat */
  function bendaIkut() { (adegan.benda || []).forEach(function (b) { if (b.ikut && dia) { b.x = dia.x - 9; b.y = dia.y - 34; b.ax = dia.x; b.ay = dia.y; } }); }
  function bendaDi(wx, wy) { bendaIkut(); var h = null; (adegan.benda || []).forEach(function (b) { if (wx >= b.x && wx <= b.x + b.w && wy >= b.y && wy <= b.y + b.h) h = b; }); return h; }
  function jarakKotak(b) { var dx = Math.max(b.x - pemain.x, 0, pemain.x - (b.x + b.w)), dy = Math.max(b.y - pemain.y, 0, pemain.y - (b.y + b.h)); return Math.hypot(dx, dy); }
  function cukupDekat(b) { return pemain && (Math.hypot(pemain.x - b.ax, pemain.y - b.ay) <= b.r || (!b.ikut && jarakKotak(b) <= 12)); }
  function bendaDekat() { bendaIkut(); var h = null, d0 = 1e9; (adegan.benda || []).forEach(function (b) { var d = Math.hypot(pemain.x - b.ax, pemain.y - b.ay); if (d <= b.r && d < d0) { d0 = d; h = b; } }); return h; }
  function pakaiBenda(b) {
    if (sibuk || layarTerbuka) return;
    pemain.arah = arahKe(pemain, { x: b.x + b.w / 2, y: b.y + b.h / 2 });
    if (adegan.id === "lantai1" && !kejutanSelesai) return;
    if (adegan.diSofa && b.key !== "meja") { tanyaBangun("sofa"); return; }
    if (adegan.tidur) { tanyaBangun("kasur"); return; }
    if (b.key === "pintu") masukRumah();
    else if (b.key === "meja") pilihMeja();
    else if (b.key === "sofa") dudukSofa();
    else if (b.key === "dia") ngobrol();
    else if (b.key === "kue") bukaTempat("kue");
    else if (b.key === "bangku") duduk();
    else if (b.key === "pot") bukaModal(ISI.suratPot(), "tempat-surat");
    else if (b.key === "kasur") { adegan.selimutKe = adegan.selimutKe ? 0 : 1; if (adegan.selimutKe && !adegan.bersih) kabar("Ada sesuatu di balik selimutnya…"); }
    else if (b.key === "fotoDinding") lihatFotoBesar(D.fotoDinding);
    else if (b.key === "jendela") lihatJendela();
    else if (b.key === "lemari") bukaLemari();
    else if (b.key === "cermin") bukaModal(ISI.cermin(), "tempat-foto");
    else if (b.key === "bak") bukaBak();
    else if (b.key === "kolam") { if (adegan.kodokLompat) adegan.kodokLompat(); lihatKolam(); }
    else if (b.key === "sampah") buangSampah();
    else if (b.key === "pohon") { adegan.goyangPohon(); if (!D.suratPohon || adegan.suratPohon && adegan.suratPohon.diam) kabar("Daun-daunnya berguguran pelan…"); }
    else if (b.key === "surat") { if (!D.surat) { kabar("Kotak suratnya masih kosong."); return; } suratDibaca = true; bukaModal(ISI.surat(), "tempat-surat"); }
    else if (b.key === "suratPohon") { suratPohonDibaca = true; bukaModal(ISI.suratPohon(), "tempat-surat"); }
    if (b.key !== "surat" || D.surat) temukan(b.key);
  }
  /* ---------- rahasia: setelah semua ditemukan, muncul pesan penutup dari admin ---------- */
  var ketemu = {}, akhirTampil = false, akhirTunggu = 0;
  function daftarRahasia() {
    return ["surat", "suratPohon", "bangku", "dia", "kue", "pot", "kasur", "fotoDinding", "fotoMeja", "album", "jendela", "lemari", "remote", "cermin", "bak", "sampah"]
      .filter(function (k) { return k === "surat" ? !!D.surat : k === "suratPohon" ? !!D.suratPohon : true; });
  }
  function jumlahKetemu() { return daftarRahasia().filter(function (k) { return ketemu[k]; }).length; }
  function temukan(k) {
    if (ketemu[k] || daftarRahasia().indexOf(k) < 0) return;
    ketemu[k] = true; perbaruiHud();
  }
  function cekAkhir(dt) {
    if (akhirTampil || !D.pesanAkhir || !main || jumlahKetemu() < daftarRahasia().length) return;
    if (layarTerbuka || sibuk || cut || (dlg && !dlg.hidden) || document.querySelector(".layar-video")) { akhirTunggu = 0; return; }
    akhirTunggu += dt; if (akhirTunggu < 1.2) return;
    akhirTampil = true;
    bukaModal('<div class="surat surat-akhir"><div class="perangko">✦</div><div class="kicker">Semua rahasia sudah kamu temukan</div>' + paragraf(D.pesanAkhir) +
      (D.pengirim ? '<div class="ttd">— ' + esc(D.pengirim) + '</div>' : '') + '</div>', "tempat-surat");
  }
  function cekTempat() {
    var t = tempatDekat(), key = t ? t.key : null;
    if (key === terakhir) return; terakhir = key;
    if (t && !kunjungan[key]) bukaTempat(key);
  }
  function cekPindah() {
    var z = null; adegan.pindah.forEach(function (p) { if (dalam(p, pemain.x, pemain.y)) z = p; });
    if (!z) { kunciPindah = false; return; }
    if (!kunciPindah) pindahAdegan(z.ke, z.pos, false);
  }
  function pindahAdegan(ke, pos, lama, lalu) {
    tujuan = null;
    sibuk = true; tahan = null; input.x = input.y = 0; kunci = {};
    var tirai = document.getElementById("gelap");
    tirai.classList.toggle("cepat", !lama); tirai.querySelector("p").textContent = lama ? "…" : "";
    tirai.classList.add("on");
    setTimeout(function () {
      adegan = ADEGAN[ke]; pemain.x = pos.x; pemain.y = pos.y; pemain.arah = pos.arah; pemain.jalan = false;
      cam.x = pemain.x; cam.y = pemain.y - 12; kunciPindah = true; terakhir = null;
      if (adegan.setPintu) adegan.setPintu(0);
      ukur(); perbaruiHud(); aturMusik();
      setTimeout(function () { tirai.classList.remove("on"); if (lalu) lalu(); else sibuk = false; }, lama ? 2600 : 120);
    }, lama ? 950 : 380);
  }
  function masukRumah() {
    if (sibuk || layarTerbuka) return;
    sibuk = true; pemain.arah = "atas";
    var mulai = performance.now();
    (function animPintu(t) {
      var p = Math.min(1, (t - mulai) / 700); ADEGAN.luar.setPintu(p);
      if (p < 1) { requestAnimationFrame(animPintu); return; }
      if (!sudahMasuk) { sudahMasuk = true; gelapRuang = .92; pindahAdegan("lantai1", { x: 160, y: 196, arah: "atas" }, true, kejutan); }
      else pindahAdegan("lantai1", { x: 160, y: 196, arah: "atas" }, false);
    })(mulai);
  }

  /* ---------- Kejutan saat masuk pertama kali ---------- */
  function jenisDia() { return jenisKu === "cowok" ? "cewek" : "cowok"; }
  function halaman(teks) { var h = String(teks || "").split(/\n\s*\n/).map(function (s) { return s.trim(); }).filter(Boolean); return h.length ? h : ["Selamat ulang tahun!"]; }
  function kejutan() {
    sibuk = true; dia.arah = "bawah";
    setTimeout(function () {
      gelapRuang = 0; dia.pose = "hore"; dia.mulut = "buka"; dia.mata = "senang";
      gelembung = { teks: "SURPRISE!!", sampai: waktu + 2.6 }; suaraSurprise();
      semburKonfeti(dia.x, dia.y - 30, 110); semburKonfeti(60, 40, 50); semburKonfeti(220, 40, 50);
      pemain.mulut = "buka";
      setTimeout(function () {
        dia.pose = ""; dia.mulut = ""; dia.mata = ""; pemain.mulut = "";
        kejutanSelesai = true; sibuk = false;
        // ucapan si dia langsung muncul sendiri setelah SURPRISE, halamannya maju sendiri
        if (D.pesanKejutan && !sudahNgobrol) {
          sudahNgobrol = true; dia.arah = arahKe(dia, pemain);
          setTimeout(function () { bicara(D.pengirim || "Si Dia", jenisDia(), halaman(D.pesanKejutan), function () { dia.arah = "bawah"; }, true); }, 500);
        }
      }, 2400);
    }, 900);
  }

  /* ---------- Dialog bergaya anime (kotak bawah dengan potret) ---------- */
  var dlg, dlgTeks, dlgNama, dlgPotret, dlgAntrian = null;
  function bicara(nama, jenis, daftar, selesai, otomatis) {
    layarTerbuka = true; tahan = null; input.x = input.y = 0; kunci = {}; document.body.classList.add("sibuk");
    dlgNama.textContent = nama; potret(dlgPotret, jenis, { mata: "senang", baju: jenis === jenisKu && pemain ? pemain.baju : "" }); dlg.hidden = false;
    dlgAntrian = { daftar: daftar.slice(), i: 0, huruf: 0, selesai: selesai, timer: null, otomatis: !!otomatis, maju: null };
    tampilHalaman();
  }
  function tampilHalaman() {
    var q = dlgAntrian, teks = q.daftar[q.i] || ""; q.huruf = 0; clearInterval(q.timer); clearTimeout(q.maju);
    dlg.classList.remove("siap");
    q.timer = setInterval(function () { q.huruf += 2; dlgTeks.textContent = teks.slice(0, q.huruf); if (q.huruf >= teks.length) { clearInterval(q.timer); dlg.classList.add("siap"); if (q.otomatis) q.maju = setTimeout(function () { if (dlgAntrian === q) lanjutDialog(); }, 1800 + teks.length * 45); } }, 28);
  }
  function lanjutDialog() {
    var q = dlgAntrian; if (!q) return;
    var teks = q.daftar[q.i] || ""; clearTimeout(q.maju);
    if (q.huruf < teks.length) { q.huruf = teks.length; dlgTeks.textContent = teks; clearInterval(q.timer); dlg.classList.add("siap"); if (q.otomatis) q.maju = setTimeout(function () { if (dlgAntrian === q) lanjutDialog(); }, 2500); return; }
    q.i++;
    if (q.i < q.daftar.length) { tampilHalaman(); return; }
    dlg.hidden = true; dlgAntrian = null; layarTerbuka = false; document.body.classList.remove("sibuk"); if (q.selesai) q.selesai();
  }

  /* ---------- Adegan dekat: menulis wish, hitung mundur, tiup lilin ---------- */
  var cut = null;
  function adeganKue() {
    layarTerbuka = true; tahan = null; input.x = input.y = 0; kunci = {}; document.body.classList.add("sibuk");
    var contoh = D.harapan || "Semoga semua impianku terwujud";
    var w = el("div", "cutin", '<canvas class="cut-kanvas" width="720" height="720" aria-hidden="true"></canvas>' +
      '<div class="cut-atas">Make a wish…</div><div class="cut-angka" hidden></div>' +
      '<div class="cut-kartu" hidden><div class="cut-tulisan"></div></div>' +
      '<form class="cut-form"><label>Tulis harapanmu</label><input maxlength="80" placeholder="' + esc(contoh) + '"><button class="tombol" type="submit">Tulis wish ✍️</button></form>');
    document.body.appendChild(w);
    cut = { el: w, kanvas: w.querySelector("canvas"), fase: "siap", tulis: 0, angin: 0, padam: false, pose: "", mata: "", mulut: "", kon: [] };
    var form = w.querySelector("form"), inp = form.querySelector("input");
    if (!SENTUH) setTimeout(function () { inp.focus({ preventScroll: true }); }, 200);
    form.addEventListener("submit", function (e) { e.preventDefault(); form.hidden = true; if (inp.value.trim()) simpanTulisan("Wish (lilin)", inp.value.trim()); mulaiTulis(inp.value.trim() || contoh); });
  }
  function mulaiTulis(wish) {
    var w = cut.el, kartu = w.querySelector(".cut-kartu"), tulisan = w.querySelector(".cut-tulisan"), atas = w.querySelector(".cut-atas"), angka = w.querySelector(".cut-angka");
    cut.fase = "tulis"; cut.pose = "tulis"; cut.mata = "senang"; kartu.hidden = false; atas.textContent = "Menulis wish…";
    var i = 0, tm = setInterval(function () { i++; tulisan.textContent = wish.slice(0, i); cut.tulis = i / wish.length; if (i >= wish.length) { clearInterval(tm); setTimeout(doa, 900); } }, 70);
    function doa() { kartu.classList.add("lipat"); cut.fase = "doa"; cut.pose = "doa"; cut.mata = "pejam"; atas.textContent = "Pejamkan mata… 🙏"; setTimeout(function () { hitung(3); }, 1700); }
    function letup(teks, kelas) { angka.hidden = false; angka.textContent = teks; angka.className = "cut-angka " + (kelas || ""); void angka.offsetWidth; angka.classList.add("pop"); }
    function hitung(n) {
      cut.pose = ""; cut.mata = ""; atas.textContent = "Siap tiup lilin!"; letup(n); suaraHitung(n);
      setTimeout(function () { if (n > 1) hitung(n - 1); else tiup(); }, 950);
    }
    function tiup() {
      letup("Fuuuh~", "kecil"); suaraTiup(); cut.fase = "tiup"; cut.mulut = "tiup"; atas.textContent = "";
      var t0 = waktu;
      (function hembus() { cut.angin = Math.min(1, (waktu - t0) / .9); if (cut.angin < 1) requestAnimationFrame(hembus); else padam(); })();
    }
    function padam() {
      cut.padam = true; KUE.padam = true; cut.mulut = "buka"; cut.mata = "senang"; cut.pose = "hore";
      for (var j = 0; j < 5; j++) asap.push({ x: 130 + (j - 2) * 3.1, y: 105, umur: 2.2, p: j, adegan: "lantai1" });
      letup("Selamat Ulang Tahun!", "judul");
      for (var k = 0; k < 120; k++) cut.kon.push({ x: 50, y: 40, vx: (Math.random() - .5) * 120, vy: -40 - Math.random() * 60, r: Math.random() * 6, w: WARNA[k % 6], umur: 3 });
      setTimeout(function () {
        w.classList.add("tutup");
        setTimeout(function () {
          w.remove(); cut = null; layarTerbuka = false; kueSelesai = true; document.body.classList.remove("sibuk");
          dia.pose = "hore"; dia.mata = "senang"; semburKonfeti(130, 80, 140);
          setTimeout(function () { dia.pose = ""; bicara(D.pengirim || "Si Dia", jenisDia(), halaman(D.pesanSetelahTiup || "Semoga semua harapanmu terkabul ya."), function () { dia.mata = ""; }); }, 900);
        }, 500);
      }, 2800);
    }
  }
  function gambarCut(dt) {
    if (!cut) return;
    var c = cut.kanvas, k = c.getContext("2d"), s = c.width / 100;
    k.setTransform(s, 0, 0, s, 0, 0);
    var gr = k.createRadialGradient(50, 40, 5, 50, 50, 75); gr.addColorStop(0, cut.padam ? "#2e2a34" : "#5a3a2c"); gr.addColorStop(1, "#0f0c10"); k.fillStyle = gr; k.fillRect(0, 0, 100, 100);
    for (var b = 0; b < 14; b++) cahaya(k, acak(b, 1) * 100, acak(1, b) * 70, 6 + acak(b, 2) * 8, b % 2 ? "255,200,140" : "255,226,150", .18 + Math.sin(waktu + b) * .05);
    if (!cut.padam) cahaya(k, 70, 60, 40, "255,190,110", .3);
    // meja
    kotak(k, -10, 100, 120, 14, gradV(k, 100, 114, "#6a4128", "#3a2214")); for (var m = 0; m < 6; m++) kotak(k, -10, 102 + m * 2, 120, .3, "rgba(20,10,5,.3)");
    k.save(); k.translate(33, 104); k.scale(2.5, 2.5);
    gambarOrang(k, { jenis: jenisKu, baju: pemain.baju, arah: "bawah", pose: cut.pose, mata: cut.mata, mulut: cut.mulut, tulis: cut.tulis, tanpaBayangan: true }, 0, 0, waktu);
    k.restore();
    kotak(k, -10, 104, 120, 10, gradV(k, 104, 114, "#5e3a24", "#2e1a10"));
    if (cut.fase === "tiup" && !cut.padam) { k.strokeStyle = "rgba(255,255,255,.85)"; k.lineWidth = .9; k.lineCap = "round"; for (var a = 0; a < 3; a++) { var o = (waktu * 1.8 + a * .33) % 1; k.beginPath(); k.moveTo(40 + o * 18, 62 + (a - 1) * 3); k.quadraticCurveTo(46 + o * 18, 60 + (a - 1) * 3.5, 50 + o * 18, 62 + (a - 1) * 4); k.stroke(); } }
    k.save(); k.translate(72, 104); k.scale(.95, .95); kue(k, 0, 0, waktu, { padam: cut.padam, angin: cut.angin }); k.restore();
    if (cut.padam) for (var j = 0; j < 3; j++) { var u = (waktu * .6 + j * .33) % 1; lingkaran(k, 70 + (j - 1) * 7 + Math.sin(waktu * 2 + j) * 2, 50 - u * 28, 1.6 + u * 3.6, "rgba(230,230,240," + (.5 * (1 - u)) + ")"); }
    cut.kon = cut.kon.filter(function (p) { return p.umur > 0; });
    cut.kon.forEach(function (p) { p.umur -= dt; p.vy += 70 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * 6; k.save(); k.translate(p.x, p.y); k.rotate(p.r); kotak(k, -1, -.5, 2, 1, p.w); k.restore(); });
  }

  /* ---------- konfeti, asap, kabar ---------- */
  function semburKonfeti(x, y, n) { for (var i = 0; i < n; i++) konfeti.push({ x: x + (Math.random() - .5) * 30, y: y, vx: (Math.random() - .5) * 150, vy: -60 - Math.random() * 120, r: Math.random() * 6, vr: (Math.random() - .5) * 10, w: WARNA[i % 6], umur: 2.6 + Math.random() * 1.5, adegan: adegan.id }); }
  function efekPartikel(g, dt) {
    konfeti = konfeti.filter(function (k) { return k.umur > 0; });
    konfeti.forEach(function (k) { k.umur -= dt; if (k.adegan !== adegan.id) return; if (k.y > adegan.H - 4) { k.umur = 0; return; } k.vy += 160 * dt; k.vx *= .98; k.x += k.vx * dt; k.y += k.vy * dt; k.r += k.vr * dt; g.save(); g.translate(k.x, k.y); g.rotate(k.r); g.globalAlpha = Math.min(1, k.umur); kotak(g, -1.5, -.75, 3, 1.5, k.w); g.restore(); });
    asap = asap.filter(function (a) { return a.umur > 0; });
    asap.forEach(function (a) { a.umur -= dt; if (a.adegan !== adegan.id) return; a.y -= 10 * dt; a.x += Math.sin(waktu * 3 + a.p) * 4 * dt; lingkaran(g, a.x, a.y, 1.2 + (2.2 - a.umur) * 1.5, "rgba(225,225,232," + Math.max(0, a.umur / 2.2 * .55) + ")"); });
  }
  var timerKabar;
  function kabar(teks) {
    var lama = document.querySelector(".toast"); if (lama) lama.remove();
    var t = el("div", "toast", esc(teks)); document.body.appendChild(t);
    clearTimeout(timerKabar); timerKabar = setTimeout(function () { t.remove(); }, 3600);
  }

  /* ---------- gambar dunia ---------- */
  function gambar(dt) {
    if (pemain) {
      var ty = pemain.y - 12;
      if (adegan.id === "luar") ty = pemain.y - 44;
      cam.x += (pemain.x - cam.x) * .12; cam.y += (ty - cam.y) * .1;
    }
    var k = kamera(), x0 = k.x0, y0 = k.y0;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = adegan.latar; g.fillRect(0, 0, cv.width, cv.height);
    g.setTransform(S, 0, 0, S, -x0 * S, -y0 * S);
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
    var M = adegan.M || 0; g.drawImage(adegan.gambarLantai, -M, 0, adegan.W + M * 2, adegan.H);
    var daftar = adegan.sprite.slice();
    if (adegan.id === "lantai1" && dia) daftar.push({ y: dia.y, gambar: function (gg, t) { gambarOrang(gg, dia, dia.x, dia.y, t); } });
    if (pemain && !(adegan.id === "kamarMandi" && adegan.berendam) && !adegan.tidur) daftar.push({ y: pemain.y + .01, gambar: function (gg, t) { gambarOrang(gg, pemain, pemain.x, pemain.y, t); } });
    daftar.sort(function (a, b) { return a.y - b.y; });
    if (tujuan && !tujuan.aksi) { var mr = 3 + Math.sin(waktu * 8) * .6; g.strokeStyle = "rgba(255,248,230,.85)"; g.lineWidth = .6; g.beginPath(); g.ellipse(tujuan.x, tujuan.y, mr * 1.4, mr * .6, 0, 0, 6.2832); g.stroke(); }
    daftar.forEach(function (s) { s.gambar(g, waktu); });
    if (adegan.efek) adegan.efek(g, waktu, dt);
    efekPartikel(g, dt);
    if (adegan.id === "lantai1" && gelapRuang > 0) { g.fillStyle = "rgba(8,4,12," + gelapRuang + ")"; g.fillRect(x0, y0, k.vw, k.vh); }
    if (gelembung && waktu < gelembung.sampai && adegan.id === "lantai1") {
      var sk = Math.min(1, (waktu - gelembung.sampai + 2.6) * 6);
      g.save(); g.translate(dia.x, dia.y - 44); g.scale(sk, sk); g.rotate(Math.sin(waktu * 12) * .03);
      var pts = []; for (var i = 0; i < 18; i++) { var a = i / 18 * 6.283, r = i % 2 ? 15 : 21; pts.push([Math.cos(a) * r * 1.6, Math.sin(a) * r * .7]); }
      poligon(g, pts, "#fff36b", .8); g.font = "700 11px Fredoka, Nunito, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
      g.lineWidth = 2.4; g.strokeStyle = "#ffffff"; g.strokeText(gelembung.teks, 0, .5); g.fillStyle = "#e8385f"; g.fillText(gelembung.teks, 0, .5);
      g.restore();
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    kotakLabel = [];
    if (!main) return;
    var px = Math.round(Math.max(14 * (cv.width / innerWidth), S * 4.4)), dekat = pemain ? tempatDekat() : null;
    g.font = "600 " + px + "px Fredoka, Nunito, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    adegan.tempat.forEach(function (tp) {
      if (tp.tanpaLabel || adegan.id === "lantai1" && !kejutanSelesai) return;
      var sudah = kunjungan[tp.key], disini = dekat === tp;
      var sx = (tp.lx - x0) * S, sy = (tp.ly - y0) * S + (sudah && !disini ? 0 : Math.sin(waktu * 3 + tp.lx) * S * .9);
      var teks = tp.nama, tw = g.measureText(teks).width, ik = sudah ? px * 1.05 : 0, w = tw + ik + px * 1.6, h = px * 2;
      var x = sx - w / 2, y = sy - h / 2, warna = "#e85d8f";
      g.shadowColor = "rgba(0,0,0,.28)"; g.shadowBlur = px * .6; g.shadowOffsetY = px * .18;
      g.fillStyle = sudah ? "#fffaf5" : warna; jalurBulat(g, x, y, w, h, h / 2); g.fill();
      g.shadowColor = "transparent"; g.shadowBlur = 0; g.shadowOffsetY = 0;
      g.lineWidth = Math.max(2, px * .16); g.strokeStyle = sudah ? warna : "rgba(255,250,245,.9)"; jalurBulat(g, x + g.lineWidth / 2, y + g.lineWidth / 2, w - g.lineWidth, h - g.lineWidth, h / 2); g.stroke();
      if (!sudah) poligon(g, [[sx - px * .45, y + h - 1], [sx + px * .45, y + h - 1], [sx, y + h + px * .55]], warna);
      else { var cx = x + px * .8 + ik / 2; lingkaran(g, cx, sy, ik * .45, warna); g.strokeStyle = "#fffaf5"; g.lineWidth = Math.max(1.5, px * .13); g.beginPath(); g.moveTo(cx - ik * .2, sy); g.lineTo(cx - ik * .04, sy + ik * .17); g.lineTo(cx + ik * .22, sy - ik * .17); g.stroke(); }
      g.fillStyle = sudah ? warna : "#fffaf5"; g.fillText(teks, sx + ik / 2, sy + px * .06);
      if (disini && sudah && !layarTerbuka) { g.font = "500 " + Math.round(px * .78) + "px Fredoka, Nunito, sans-serif"; g.fillStyle = "rgba(255,250,245,.95)"; g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = px * .4; g.fillText("ketuk untuk membuka", sx, y - px * .7); g.shadowColor = "transparent"; g.shadowBlur = 0; g.font = "600 " + px + "px Fredoka, Nunito, sans-serif"; }
      kotakLabel.push({ tp: tp, x: x, y: y, w: w, h: h });
    });
    adegan.pindah.forEach(function (p) {
      if (!p.teks || !pemain || Math.hypot(pemain.x - (p.x + p.w / 2), pemain.y - (p.y + p.h / 2)) > 46) return;
      var sx = (p.x + p.w / 2 - x0) * S, sy = (p.y + (p.y < 110 ? -4 : p.h + 8) - y0) * S;
      g.font = "500 " + Math.round(px * .8) + "px Fredoka, Nunito, sans-serif"; g.fillStyle = "#fffaf5"; g.shadowColor = "rgba(0,0,0,.7)"; g.shadowBlur = px * .5; g.fillText(p.teks, sx, sy); g.shadowColor = "transparent"; g.shadowBlur = 0;
    });
  }
  var lalu = 0;
  function putar(t) {
    var dt = Math.min(.05, (t - lalu) / 1000 || 0); lalu = t; waktu += dt;
    gerak(dt); gambar(dt); gambarCut(dt); cekAkhir(dt);
    requestAnimationFrame(putar);
  }

  /* ---------- jendela (modal) ---------- */
  var modal, panel, isi, tutupBtn, aksiTutup = null;
  function bukaModal(html, kelas, saatTutup) {
    isi.innerHTML = ""; panel.className = "panel " + (kelas || "");
    if (typeof html === "string") isi.innerHTML = html; else isi.appendChild(html);
    isi.scrollTop = 0; modal.hidden = false; layarTerbuka = true; input.x = input.y = 0; tahan = null; kunci = {}; aksiTutup = saatTutup || null;
    setTimeout(function () { var f = panel.classList.contains("wajib") ? isi.querySelector("button") : tutupBtn; if (f) f.focus({ preventScroll: true }); }, 60);
  }
  function tutupModal() {
    if (modal.hidden) return;
    modal.hidden = true; layarTerbuka = false;
    var a = aksiTutup; aksiTutup = null; if (a) a();
  }
  function arahKe(a, b) { var dx = b.x - a.x, dy = b.y - a.y; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "kanan" : "kiri") : (dy > 0 ? "bawah" : "atas"); }
  function bukaTempat(key) {
    if (adegan.id === "lantai1" && !kejutanSelesai) return;
    kunjungan[key] = true; temukan(key);
    if (key === "kue") { if (!kueSelesai) adeganKue(); else bicara(D.nama || "", jenisKu, ["Lilinnya sudah kutiup dan wish-ku sudah kutulis. Semoga terkabul! 🎂"], null); return; }
    if (key === "dia") { dia.arah = arahKe(dia, pemain); bicara(D.pengirim || "Si Dia", jenisDia(), halaman(D.pesanKejutan), function () { dia.arah = "bawah"; }); return; }
    bukaModal(ISI[key](), "tempat-" + key);
  }
  var ISI = {
    surat: function () {
      return '<div class="surat"><div class="perangko">♥</div><div class="kicker">Untuk ' + esc(D.nama || "kamu") + '</div>' + paragraf(D.surat) +
        (D.pengirim ? '<div class="ttd">— ' + esc(D.pengirim) + '</div>' : '') + '</div>';
    },
    suratPot: function () {
      var daun = ""; [[-14, -10, 30, 0, "#5f8a3e"], [-6, -14, 22, 60, "#7aa04c"], [92, -12, 28, 150, "#4d7a33"], [96, 82, 24, 200, "#6d9844"], [-12, 88, 26, 300, "#88aa55"], [40, -16, 18, 100, "#5f8a3e"]].forEach(function (d) {
        daun += '<svg class="daun-tempel" style="left:' + d[0] + '%;top:' + d[1] + '%;width:' + d[2] + 'px;transform:rotate(' + d[3] + 'deg)" viewBox="0 0 40 20" aria-hidden="true"><path d="M2 10 Q18 -4 38 10 Q18 24 2 10Z" fill="' + d[4] + '"/><path d="M2 10 L36 10" stroke="rgba(255,255,255,.45)" stroke-width="1"/></svg>';
      });
      return '<div class="surat surat-daun">' + daun + '<div class="kicker">Surat di dalam pot</div>' + paragraf(D.suratPot || "Daun-daun ini kupetik untukmu.") +
        (D.pengirim ? '<div class="ttd">— ' + esc(D.pengirim) + '</div>' : '') + '</div>';
    },
    fotoDinding: function () {
      return '<div class="kicker">Di dinding kamar</div>' + (D.fotoDinding ? '<img class="foto-besar" alt="" src="' + esc(D.fotoDinding) + '">' : '<p class="pelan">Fotonya belum diunggah lewat admin.</p>');
    },
    fotoMeja: function () {
      var w = el("div", null, '<div class="kicker">Ketuk fotonya untuk membalik</div><button type="button" class="kartu-balik"><span class="muka"><span class="pp">' +
        (D.fotoMeja ? '<img alt="" src="' + esc(D.fotoMeja) + '">' : '<em>Foto belum diunggah</em>') + '</span></span><span class="belakang"><span class="papan"><i class="jepit a"></i><i class="jepit b"></i><i class="jepit c"></i><i class="jepit d"></i><i class="kaki-bingkai"></i><span class="tulisan-belakang">' + paragraf(D.tulisanFoto || "…") + '</span></span></span></button>');
      var k = w.querySelector(".kartu-balik"), im = k.querySelector("img");
      k.addEventListener("click", function () { k.classList.toggle("dibalik"); });
      // bentuk kartu mengikuti foto supaya foto tampil utuh
      function pas() { if (im.naturalWidth) k.style.setProperty("--r", (im.naturalWidth / im.naturalHeight).toFixed(4)); }
      if (im) { if (im.complete) pas(); else im.addEventListener("load", pas); }
      return w;
    },
    cermin: function () {
      var w = el("div", null, '<div class="kicker">Cermin wastafel</div><canvas class="kanvas-cermin" width="600" height="480" aria-label="Cermin berembun bergambar hati"></canvas>');
      lukisCermin(w.querySelector("canvas"));
      return w;
    },
    suratPohon: function () {
      return '<div class="surat surat-pohon"><div class="perangko">🍃</div><div class="kicker">Jatuh dari pohon</div>' + paragraf(D.suratPohon) +
        (D.pengirim ? '<div class="ttd">— ' + esc(D.pengirim) + '</div>' : '') + '</div>';
    },
    kado: function () {
      var w = el("div");
      w.innerHTML = '<div class="kicker">Kado untukmu</div><h2>Untuk ' + esc(D.nama || "kamu") + ' 🎁</h2>' +
        '<div class="surat">' + paragraf(D.pesanAkhir || "Selamat ulang tahun!") + (D.pengirim ? '<div class="ttd">— ' + esc(D.pengirim) + '</div>' : '') + '</div>' +
        ((D.galeri || []).length ? '<div class="galeri">' + D.galeri.map(function (s) { return '<img loading="lazy" alt="" src="' + esc(s) + '">'; }).join("") + '</div>' : '');
      pasangGaleri(w); setTimeout(function () { semburKonfeti(130, 100, 80); }, 100);
      return w;
    },
    galeri: function () {
      var w = el("div"); w.innerHTML = '<div class="kicker">Kenangan kita</div><h2>Foto Kita 📸</h2><div class="galeri">' + (D.galeri || []).map(function (s) { return '<img loading="lazy" alt="" src="' + esc(s) + '">'; }).join("") + '</div>';
      pasangGaleri(w); return w;
    }
  };
  function pasangGaleri(w) {
    w.querySelectorAll(".galeri img").forEach(function (im) { im.addEventListener("click", function () { var v = el("div", "lihat-foto", '<img alt="" src="' + esc(im.getAttribute("src")) + '">'); v.addEventListener("click", function () { v.remove(); }); document.body.appendChild(v); }); });
  }

  /* ---------- melihat ke luar jendela kamar: halaman, pagar, jalan, rumah seberang (malam) ---------- */
  var latarJendela = null;
  function lukisLatarJendela() {
    if (latarJendela) return latarJendela;
    var c = document.createElement("canvas"); c.width = 960; c.height = 640; var k = c.getContext("2d");
    // langit malam
    k.fillStyle = gradV(k, 0, 200, "#08112e", "#22325e"); k.fillRect(0, 0, 960, 200);
    for (var s = 0; s < 140; s++) lingkaran(k, acak(s, 1) * 960, acak(1, s) * 150, .6 + acak(s, 2) * 1.2, "rgba(255,255,255," + (.4 + acak(s, 3) * .6) + ")");
    lingkaran(k, 760, 60, 22, "#f3efd6"); lingkaran(k, 770, 54, 20, "#13224d"); cahaya(k, 750, 64, 60, "220,230,255", .15);
    // rumah-rumah di seberang jalan
    k.fillStyle = "#121a2c"; k.fillRect(0, 150, 960, 70);
    for (var p = 0; p < 7; p++) dedaunan(k, p * 150 + 40, 150 + acak(p, 4) * 10, 50, 30, 500, 600 + p, -.45, 3);
    [[60, 260, "#8a6a58"], [330, 240, "#6c7280"], [600, 270, "#7a5a4c"], [880, 220, "#6a6f78"]].forEach(function (r, i) {
      var x = r[0], lb = r[1], y = 160, h = 82;
      poligon(k, [[x - 14, y + 26], [x + lb + 14, y + 26], [x + lb - 30, y - 18], [x + 30, y - 18]], gradX(k, x, x + lb, "#3a2620", "#5a3a2c", "#2e1e18"));
      kotak(k, x, y + 26, lb, h - 26, gradX(k, x, x + lb, "#3c3a3e", "#4c4a50", "#333136"));
      for (var j = 0; j < 3; j++) { var wx = x + 22 + j * (lb - 60) / 2, terang = acak(i, j) > .3; kotak(k, wx, y + 44, 34, 26, terang ? gradV(k, y + 44, y + 70, "#ffd88a", "#e8a958") : "#1d2333"); kotak(k, wx + 16, y + 44, 2, 26, "#2a2420"); if (terang) cahaya(k, wx + 17, y + 57, 40, "255,200,120", .18); }
      kotak(k, x + lb / 2 - 14, y + 70, 28, 38, "#2a1e18");
      kotak(k, x - 20, y + 104, lb + 40, 14, "#4a4a4e"); for (var b = x - 20; b < x + lb + 20; b += 8) kotak(k, b, y + 92, 2, 14, "#1c1c20");
    });
    // jalan raya
    k.fillStyle = gradV(k, 278, 360, "#2a2c31", "#3a3c41"); k.fillRect(0, 278, 960, 82);
    k.fillStyle = "#55575c"; k.fillRect(0, 274, 960, 5);
    for (var d = 0; d < 960; d += 70) kotak(k, d, 316, 38, 4, "rgba(230,230,220,.7)");
    for (var a = 0; a < 900; a++) lingkaran(k, acak(a, 9) * 960, 280 + acak(9, a) * 80, .8, acak(a, 8) > .5 ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.15)");
    k.fillStyle = "rgba(8,14,36,.45)"; k.fillRect(0, 0, 960, 360);
    var c2 = document.createElement("canvas"); c2.width = 960; c2.height = 640; k = c2.getContext("2d");
    // trotoar & pagar kita (dilihat dari belakang)
    kotak(k, 0, 360, 960, 24, gradV(k, 360, 384, "#8d8a84", "#a19d95")); kotak(k, 0, 360, 960, 3, "#c8c4bb");
    kotak(k, 0, 384, 960, 40, gradV(k, 384, 424, "#b4ad9f", "#9f9789")); kotak(k, 0, 380, 960, 6, "#c9c1b1");
    for (var f = 0; f < 960; f += 12) kotak(k, f, 340, 4, 42, "#1d1b19"); kotak(k, 0, 338, 960, 5, "#1d1b19");
    kotak(k, 420, 330, 120, 100, "rgba(0,0,0,0)");
    [[400, 430], [530, 560]].forEach(function (pl) { kotak(k, pl[0], 322, pl[1] - pl[0], 104, gradX(k, pl[0], pl[1], "#b8b0a0", "#d0c8b8", "#a8a090")); kotak(k, pl[0] - 4, 316, pl[1] - pl[0] + 8, 10, "#8f887a"); });
    kotak(k, 430, 338, 100, 92, gradV(k, 338, 430, "#2a2c31", "#9c968a"));
    kotak(k, 430, 384, 100, 46, gradV(k, 384, 430, "#8d8a84", "#5a6a48"));
    // kotak surat (dari belakang)
    kotak(k, 572, 330, 6, 60, "#2a2826"); bulatIsi(k, 556, 300, 38, 34, 6, gradX(k, 556, 594, "#24362a", "#2f4637", "#1c2a21"));
    // halaman kita: rumput gelap & jalan setapak menyempit ke arah gerbang
    k.fillStyle = gradV(k, 424, 640, "#1f3420", "#2a4628"); k.fillRect(0, 424, 960, 216);
    for (var r = 0; r < 4000; r++) { var rx = acak(r, 11) * 960, ry = 424 + acak(11, r) * 216; k.strokeStyle = acak(r, 12) > .5 ? "rgba(90,130,70,.35)" : "rgba(10,25,10,.35)"; k.lineWidth = 1 + (ry - 424) / 120; k.beginPath(); k.moveTo(rx, ry); k.lineTo(rx + (acak(r, 13) - .5) * 3, ry - 3 - (ry - 424) / 30); k.stroke(); }
    for (var t = 0; t < 7; t++) { var u = t / 6, yy = 432 + u * u * 190, ww = 70 + u * 150, hh = 8 + u * 22; elips(k, 480, yy + hh * .3, ww / 2 + 4, hh / 2, "rgba(0,0,0,.3)"); elips(k, 480, yy, ww / 2, hh / 2, gradV(k, yy - hh / 2, yy + hh / 2, "#9a968c", "#7a766c")); }
    [[0, 470, 140, 110], [960, 470, 140, 110]].forEach(function (b, i) { dedaunan(k, b[0] + (i ? -50 : 50), b[1], b[2], b[3] * .6, 1600, 700 + i, -.35, 3.4); });
    // tajuk beringin di kiri atas (dekat jendela)
    for (var q = 0; q < 5; q++) dedaunan(k, -20 + q * 60, 20 + q * 70, 120, 90, 2600, 800 + q, -.25, 4.2);
    for (var h = 0; h < 40; h++) { var hx = 10 + acak(h, 21) * 260, hy = 120 + acak(21, h) * 200; k.strokeStyle = "rgba(70,56,42,.7)"; k.lineWidth = 1 + acak(h, 22) * 1.5; k.beginPath(); k.moveTo(hx, hy); k.quadraticCurveTo(hx + 3, hy + 40, hx, hy + 60 + acak(h, 23) * 120); k.stroke(); }
    // gelap malam
    k.globalCompositeOperation = "source-atop"; k.fillStyle = "rgba(8,14,36,.45)"; k.fillRect(0, 0, 960, 640); k.globalCompositeOperation = "source-over";
    return (latarJendela = { belakang: c, depan: c2 });
  }
  function lihatJendela() {
    var w = el("div", null, '<div class="kicker">Dari jendela kamar</div><canvas class="kanvas-jendela" width="960" height="640" aria-label="Pemandangan malam dari jendela kamar: halaman, pagar, jalan, dan rumah di seberang"></canvas>');
    var c = w.querySelector("canvas"), k = c.getContext("2d"), buka = true, mobil = null, tm = 1.5, lalu = performance.now();
    var latar = lukisLatarJendela();
    function lukis() {
      if (!buka) return;
      var kini = performance.now(), dt = Math.min(.05, (kini - lalu) / 1000), t = waktu; lalu = kini;
      k.setTransform(1, 0, 0, 1, 0, 0); k.drawImage(latar.belakang, 0, 0);
      tm -= dt;
      if (!mobil && tm <= 0) { var ka = Math.random() < .5; mobil = { x: ka ? -160 : 1120, v: (ka ? 1 : -1) * (220 + Math.random() * 80), y: ka ? 330 : 302, w: ["#c9c6bf", "#7c2a26", "#3a4658"][Math.floor(Math.random() * 3)], s: ka ? 1.1 : .9 }; }
      if (mobil) {
        mobil.x += mobil.v * dt;
        k.save(); k.translate(mobil.x, mobil.y); k.scale(mobil.s * (mobil.v < 0 ? -1 : 1), mobil.s);
        bulatIsi(k, -70, -30, 140, 26, 10, mobil.w); bulatIsi(k, -36, -54, 72, 28, 10, mobil.w); bulatIsi(k, -30, -50, 28, 20, 4, "#2c3a44"); bulatIsi(k, 4, -50, 28, 20, 4, "#34444e");
        [-44, 44].forEach(function (x) { lingkaran(k, x, -4, 12, "#111"); });
        k.globalCompositeOperation = "lighter"; cahaya(k, 80, -18, 90, "255,240,190", .35); cahaya(k, -72, -18, 20, "255,60,40", .5); k.globalCompositeOperation = "source-over";
        k.restore();
        if (mobil.x < -200 || mobil.x > 1160) { mobil = null; tm = 3 + Math.random() * 4; }
      }
      k.drawImage(latar.depan, 0, 0);
      // lampu jalan kita & seberang, lampu taman
      k.globalCompositeOperation = "lighter";
      [[150, 250, 1], [810, 250, 1], [470, 180, .5]].forEach(function (l) { cahaya(k, l[0], l[1], 20 * l[2] + 8, "255,225,160", .7); cahaya(k, l[0], l[1] + 110 * l[2], 160 * l[2], "255,200,120", .16); });
      [[400, 470, .6], [560, 470, .6], [360, 560, 1], [600, 560, 1]].forEach(function (l) { cahaya(k, l[0], l[1], 14 * l[2], "255,220,150", .8); cahaya(k, l[0], l[1] + 10, 70 * l[2], "255,200,120", .14); });
      for (var f = 0; f < 12; f++) { var a = .4 + Math.sin(t * 2 + f) * .35; if (a > 0) cahaya(k, 80 + f * 70 + Math.sin(t * .5 + f) * 20, 470 + (f % 4) * 35 + Math.cos(t * .7 + f) * 12, 7, "210,255,140", a); }
      k.globalCompositeOperation = "source-over";
      // tiang lampu (siluet)
      [[150, 250, 1], [810, 250, 1]].forEach(function (l) { kotak(k, l[0] + 18, l[1] - 6, 5, 140, "#16181c"); kotak(k, l[0] - 6, l[1] - 8, 30, 6, "#16181c"); });
      [[400, 470, .6], [560, 470, .6], [360, 560, 1], [600, 560, 1]].forEach(function (l) { kotak(k, l[0] - 2 * l[2], l[1] + 6 * l[2], 4 * l[2], 26 * l[2], "#16181c"); });
      // bingkai jendela & tirai
      k.fillStyle = "rgba(200,220,255,.04)"; k.fillRect(0, 0, 960, 640);
      k.fillStyle = "#3b2c20"; k.fillRect(472, 0, 16, 640); k.fillRect(0, 300, 960, 12);
      [[0, 1], [960, -1]].forEach(function (p) { var gr = k.createLinearGradient(p[0], 0, p[0] + p[1] * 150, 0); gr.addColorStop(0, "#c9b48c"); gr.addColorStop(1, "rgba(201,180,140,0)"); k.fillStyle = gr; k.fillRect(Math.min(p[0], p[0] + p[1] * 150), 0, 150, 640); });
      requestAnimationFrame(lukis);
    }
    bukaModal(w, "tempat-jendela", function () { buka = false; });
    requestAnimationFrame(lukis);
  }
  /* ---------- musik per tempat: luar, lantai 1, kamar, kamar mandi (satu elemen audio, dipudarkan saat berganti) ---------- */
  /* ---------- efek suara (Web Audio, dibuat dengan kode; rekaman dari admin bila ada) ---------- */
  var sx = null, sxUtama = null, sxBuf = {}, sxBicaraSiap = false, sxNoise = null;
  function sxBuka() {
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    if (!sx) {
      sx = new AC(); sxUtama = sx.createGain(); sxUtama.gain.value = 1; sxUtama.connect(sx.destination);
      var n = sx.sampleRate * 2, b = sx.createBuffer(1, n, sx.sampleRate), d = b.getChannelData(0); for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; sxNoise = b;
      ["suaraSurprise", "suaraHitung", "suaraAir"].forEach(function (k) {
        if (!D[k]) return;
        fetch(D[k]).then(function (r) { return r.arrayBuffer(); }).then(function (ab) { return new Promise(function (ok, gagal) { sx.decodeAudioData(ab, ok, gagal); }); }).then(function (bf) { sxBuf[k] = bf; }).catch(function () {});
      });
    }
    if (sx.state === "suspended") sx.resume();
    if (!sxBicaraSiap && window.speechSynthesis) { sxBicaraSiap = true; try { var u = new SpeechSynthesisUtterance(" "); u.volume = 0; speechSynthesis.speak(u); } catch (e) {} }
  }
  function sxSenyap() { return !sx || sxMatiUser || document.hidden; }
  var sxMatiUser = false;
  function sxPan(x) { if (!sx.createStereoPanner) return null; var p = sx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, x)); return p; }
  function sxSambung(node, vol, pan) { var g = sx.createGain(); g.gain.value = vol; node.connect(g); var p = pan != null ? sxPan(pan) : null; if (p) { g.connect(p); p.connect(sxUtama); } else g.connect(sxUtama); return g; }
  function sxBunyi(f, t0, dur, vol, tipe, f2) {
    var o = sx.createOscillator(), g = sx.createGain(); o.type = tipe || "sine"; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + Math.min(.01, dur / 4)); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    o.connect(g); g.connect(sxUtama); o.start(t0); o.stop(t0 + dur + .02); return g;
  }
  function sxDesis(t0, dur, vol, tipe, f, q, pan) {
    var s0 = sx.createBufferSource(); s0.buffer = sxNoise; s0.loop = true; var fl = sx.createBiquadFilter(); fl.type = tipe; fl.frequency.value = f; fl.Q.value = q || 1;
    var g = sx.createGain(); g.gain.setValueAtTime(0, t0); s0.connect(fl); fl.connect(g); sxSambung(g, 1, pan); s0.start(t0, Math.random()); s0.stop(t0 + dur + .05);
    return { g: g, f: fl, vol: vol };
  }
  // jangkrik: rangkaian "krik" bernada tinggi; kodok: "kroook" rendah. Hanya di luar, makin keras di dekat kolam.
  var sxBerikut = { jangkrik: 0, kodok: 0 };
  function sxSuasana() {
    if (sxSenyap() || !adegan || adegan.id !== "luar" || !pemain || D.suaraLuar) return;
    var t = sx.currentTime, dk = Math.hypot(pemain.x - 300, pemain.y - 266), dekat = Math.max(0, 1 - dk / 260);
    if (t > sxBerikut.jangkrik) {
      var f = 4200 + Math.random() * 900, n = 3 + Math.floor(Math.random() * 3), vol = .018 + .05 * dekat * Math.random() + .012, pan = Math.random() * 1.6 - .8;
      for (var i = 0; i < n; i++) {
        var o = sx.createOscillator(), g = sx.createGain(), t0 = t + .02 + i * .055; o.type = "triangle"; o.frequency.value = f;
        g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + .008); g.gain.linearRampToValueAtTime(0, t0 + .03);
        o.connect(g); sxSambung(g, 1, pan); o.start(t0); o.stop(t0 + .04);
      }
      sxBerikut.jangkrik = t + .25 + Math.random() * .9;
    }
    if (t > sxBerikut.kodok) {
      var vk = .05 + .22 * dekat, pk = (300 - pemain.x) / -160, kali = Math.random() < .6 ? 2 : 1;
      for (var k = 0; k < kali; k++) {
        var t1 = t + .05 + k * .26, ok = sx.createOscillator(), fk = sx.createBiquadFilter(), gk = sx.createGain(), lfo = sx.createOscillator(), lg = sx.createGain(), base = 95 + Math.random() * 40;
        ok.type = "sawtooth"; ok.frequency.setValueAtTime(base * 1.25, t1); ok.frequency.exponentialRampToValueAtTime(base, t1 + .18);
        fk.type = "bandpass"; fk.frequency.value = 520 + Math.random() * 200; fk.Q.value = 3;
        lfo.frequency.value = 28 + Math.random() * 8; lg.gain.value = .5; lfo.connect(lg); lg.connect(gk.gain);
        gk.gain.setValueAtTime(0, t1); gk.gain.linearRampToValueAtTime(vk, t1 + .02); gk.gain.setValueAtTime(vk, t1 + .14); gk.gain.linearRampToValueAtTime(0, t1 + .2);
        ok.connect(fk); fk.connect(gk); sxSambung(gk, 1, pk); ok.start(t1); ok.stop(t1 + .22); lfo.start(t1); lfo.stop(t1 + .22);
      }
      sxBerikut.kodok = t + 2.2 + Math.random() * 4.5;
    }
    // gemericik air pancuran: tetesan kecil bernada tinggi, terdengar di dekat kolam
    if (dekat > .15) for (var tt = 0; tt < 3; tt++) sxBunyi(900 + Math.random() * 1800, t + Math.random() * .12, .05 + Math.random() * .05, (.012 + Math.random() * .02) * dekat, "sine", 1600 + Math.random() * 2600);
  }
  function sxBicara(teks, opsi) {
    if (!window.speechSynthesis || sxMatiUser) return;
    try {
      var u = new SpeechSynthesisUtterance(teks), v = speechSynthesis.getVoices(), cowok = /male|pria|laki|ardi|david|daniel|alex|fred|guy|james|tom|aaron|rizky|budi|google uk english male/i;
      var pilih = v.filter(function (x) { return /^id/i.test(x.lang) && cowok.test(x.name); })[0] || v.filter(function (x) { return /^id/i.test(x.lang); })[0];
      if (opsi && opsi.inggris) pilih = v.filter(function (x) { return /^en/i.test(x.lang) && cowok.test(x.name); })[0] || pilih;
      if (pilih) { u.voice = pilih; u.lang = pilih.lang; } else u.lang = "id-ID";
      u.pitch = opsi && opsi.pitch || .75; u.rate = opsi && opsi.rate || 1; u.volume = 1; speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch (e) {}
  }
  function sxRekaman(k) { if (!sxBuf[k] || sxSenyap()) return false; var s0 = sx.createBufferSource(); s0.buffer = sxBuf[k]; sxSambung(s0, 1); s0.start(); return true; }
  function suaraSurprise() {
    if (sxSenyap()) return;
    var t = sx.currentTime;
    // letupan party popper + kertas berhamburan
    [0, .12].forEach(function (d, i) { var h = sxDesis(t + d, .25, 0, "highpass", 1200, .7, i ? .5 : -.5); h.g.gain.setValueAtTime(0, t + d); h.g.gain.linearRampToValueAtTime(.5, t + d + .005); h.g.gain.exponentialRampToValueAtTime(.001, t + d + .22); });
    var k = sxDesis(t + .15, 1.4, 0, "bandpass", 5000, .6); k.g.gain.setValueAtTime(0, t + .15); k.g.gain.linearRampToValueAtTime(.06, t + .3); k.g.gain.linearRampToValueAtTime(0, t + 1.5);
    if (!sxRekaman("suaraSurprise")) setTimeout(function () { sxBicara("Surprise!", { inggris: true, pitch: .7, rate: .95 }); }, 120);
  }
  function suaraHitung(n) {
    if (sxSenyap()) return;
    var t = sx.currentTime; sxBunyi(n > 1 ? 660 : 990, t, .35, .18, "sine"); sxBunyi(n > 1 ? 1320 : 1980, t, .2, .04, "sine");
    if (n === 3 && sxRekaman("suaraHitung")) { sxHitungRekam = true; return; }
    if (n === 3) sxHitungRekam = false;
    if (!sxHitungRekam) sxBicara(["", "satu", "dua", "tiga"][n] || String(n), { pitch: .8, rate: 1.05 });
  }
  var sxHitungRekam = false;
  function suaraTiup() {
    if (sxSenyap()) return;
    var t = sx.currentTime, h = sxDesis(t, 1.1, 0, "bandpass", 900, .8); h.g.gain.setValueAtTime(0, t); h.g.gain.linearRampToValueAtTime(.35, t + .15); h.g.gain.linearRampToValueAtTime(.25, t + .7); h.g.gain.linearRampToValueAtTime(0, t + 1.05);
    h.f.frequency.setValueAtTime(700, t); h.f.frequency.linearRampToValueAtTime(1400, t + 1);
  }
  function suaraAirBuang(lama) {
    if (sxSenyap() || sxRekaman("suaraAir")) return;
    var t = sx.currentTime, dur = Math.max(1.2, lama) + .6;
    var h = sxDesis(t, dur, 0, "lowpass", 900, 1.5); h.g.gain.setValueAtTime(0, t); h.g.gain.linearRampToValueAtTime(.32, t + .3); h.g.gain.setValueAtTime(.3, t + dur - .8); h.g.gain.linearRampToValueAtTime(0, t + dur);
    var lfo = sx.createOscillator(), lg = sx.createGain(); lfo.frequency.value = 3.2; lg.gain.value = 260; lfo.connect(lg); lg.connect(h.f.frequency); lfo.start(t); lfo.stop(t + dur);
    for (var i = 0, tb = t + .2; tb < t + dur - .2; i++, tb += .07 + Math.random() * .22) sxBunyi(180 + Math.random() * 260, tb, .09, .12 + Math.random() * .1, "sine", 500 + Math.random() * 500);
    sxBunyi(140, t + dur - .35, .3, .25, "sine", 60); // "glug" terakhir
  }
  function laguAdegan() {
    var id = adegan ? adegan.id : "luar";
    return id === "luar" ? D.suaraLuar || "" : "";
  }
  function pudar(ke, selesai) {
    clearInterval(pudarTimer); var langkah = 0;
    pudarTimer = setInterval(function () {
      langkah++; var v = audioLatar.volume, nv = Math.max(0, Math.min(1, v + (ke > v ? .08 : -.08)));
      try { audioLatar.volume = nv; } catch (e) {}
      if (Math.abs(audioLatar.volume - ke) < .05 || langkah > 14) { clearInterval(pudarTimer); try { audioLatar.volume = ke; } catch (e) {} if (selesai) selesai(); }
    }, 40);
  }
  function aturMusik() {
    if (!audioLatar) return;
    var a = audioLatar, src = musikMati || document.querySelector(".layar-video") ? "" : laguAdegan();
    if (src === laguSekarang && (!src || !a.paused)) return;
    function mulai() {
      if (laguSekarang && a.getAttribute("src") === laguSekarang) posisiLagu[laguSekarang] = a.currentTime || 0;
      laguSekarang = src;
      if (!src) { a.pause(); return; }
      if (a.getAttribute("src") !== src) {
        a.src = src; var pos = posisiLagu[src] || 0;
        if (pos) a.addEventListener("loadedmetadata", function f() { a.removeEventListener("loadedmetadata", f); try { a.currentTime = pos; } catch (e) {} });
      }
      try { a.volume = 0; } catch (e) {}
      var p = a.play(); if (p && p.catch) p.catch(function () { if (a.paused && tombolMusik) { musikMati = true; tombolMusik.classList.add("mati"); laguSekarang = ""; } });
      pudar(1);
    }
    if (!a.paused && laguSekarang) pudar(0, function () { a.pause(); mulai(); }); else mulai();
  }
  /* ---------- foto dinding: layar penuh ---------- */
  function lapisPenuh(kelas, html) {
    var lapis = el("div", "layar-video " + kelas, html), tutup = el("button", "tutup", "&times;"); tutup.type = "button"; tutup.setAttribute("aria-label", "Tutup"); lapis.appendChild(tutup);
    layarTerbuka = true; tahan = null; input.x = input.y = 0; kunci = {}; document.body.classList.add("sibuk");
    function selesai() { lapis.remove(); layarTerbuka = false; document.body.classList.remove("sibuk"); removeEventListener("keydown", esc2); if (lapis.saatTutup) lapis.saatTutup(); }
    function esc2(e) { if (e.key === "Escape") selesai(); }
    tutup.addEventListener("click", selesai); addEventListener("keydown", esc2); document.body.appendChild(lapis);
    return lapis;
  }
  function lihatFotoBesar(src) {
    lapisPenuh("layar-foto", src ? '<div class="bingkai-nyata"><img alt="Foto di dinding kamar" src="' + esc(src) + '"></div>' : '<p>Fotonya belum diunggah lewat admin.</p>');
  }
  /* ---------- album foto: buku yang bisa dibalik per halaman ---------- */
  function lihatAlbum() {
    var foto = (D.album || []).filter(Boolean);
    var html = '<div class="buku"><div class="halaman-buku">' +
      '<div class="lembar sampul-buku" style="z-index:' + (foto.length + 2) + '"><div class="muka"><span>Album</span><b>' + esc(D.nama || "Kita") + '</b><small>' + (foto.length ? "ketuk untuk membuka" : "belum ada foto") + '</small></div><div class="balik"></div></div>' +
      foto.map(function (f, i) { return '<div class="lembar" style="z-index:' + (foto.length - i + 1) + '"><div class="muka"><img alt="" loading="lazy" src="' + esc(f) + '"><i>' + (i + 1) + '</i></div><div class="balik"></div></div>'; }).join("") +
      '<div class="lembar akhir-buku" style="z-index:0"><div class="muka"><span>♥</span></div></div>' +
      '</div></div><div class="nav-buku"><button type="button" class="tombol garis" data-a="-1" aria-label="Halaman sebelumnya">‹</button><span class="no-buku"></span><button type="button" class="tombol" data-a="1" aria-label="Halaman berikutnya">›</button></div>';
    var lapis = lapisPenuh("layar-album", html), lembar = [].slice.call(lapis.querySelectorAll(".lembar")).slice(0, -1), n = 0, no = lapis.querySelector(".no-buku");
    function atur() {
      lembar.forEach(function (l, i) { var b = i < n; l.classList.toggle("dibalik", b); l.style.zIndex = b ? i + 1 : lembar.length - i + 1; });
      no.textContent = n === 0 ? "Sampul" : n > foto.length ? "Selesai" : n + " / " + foto.length;
      lapis.querySelector('[data-a="-1"]').disabled = n === 0; lapis.querySelector('[data-a="1"]').disabled = n >= lembar.length;
    }
    function geser(a) { n = Math.max(0, Math.min(lembar.length, n + a)); atur(); }
    lapis.querySelectorAll(".nav-buku button").forEach(function (b) { b.addEventListener("click", function () { geser(+b.dataset.a); }); });
    lapis.querySelector(".halaman-buku").addEventListener("click", function (e) { var r = this.getBoundingClientRect(); geser(e.clientX - r.left < r.width * .3 ? -1 : 1); });
    var x0 = null; lapis.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lapis.addEventListener("touchend", function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 40) { geser(dx < 0 ? 1 : -1); e.preventDefault(); } });
    function kunci2(e) { if (e.key === "ArrowRight") geser(1); else if (e.key === "ArrowLeft") geser(-1); }
    addEventListener("keydown", kunci2); lapis.saatTutup = function () { removeEventListener("keydown", kunci2); if (lapis.setelah) lapis.setelah(); };
    atur();
    return lapis;
  }
  /* ---------- melihat kolam dari dekat: ikan hias berenang ---------- */
  function lihatKolam() {
    var w = el("div", null, '<div class="kicker">Kolam di halaman</div><canvas class="kanvas-jendela kanvas-kolam" width="960" height="640" aria-label="Kolam dengan ikan hias berenang, daun teratai, dan kodok kecil"></canvas><p class="pelan" style="text-align:center;margin:8px 0 0">Ketuk airnya untuk memberi makan ikan.</p>');
    var c = w.querySelector("canvas"), k = c.getContext("2d"), buka = true, lalu = performance.now(), t = 0, riak = [], makan = [];
    var warna = [["#f07a36", "#fff4e6"], ["#f6f1e8", "#e2522e"], ["#de4a2f", "#f6f1e8"], ["#f2b545", "#f6f1e8"], ["#f6f1e8", "#2a2a2a"], ["#e8662f", "#2a2a2a"], ["#f4d9a8", "#e2522e"]];
    var ikan = warna.map(function (wn, i) { var a = Math.random() * 6.28; return { x: 480 + Math.cos(a) * 200, y: 320 + Math.sin(a) * 120, a: Math.random() * 6.28, v: 40 + Math.random() * 25, s: .8 + Math.random() * .5, wn: wn, f: Math.random() * 6, belok: 0 }; });
    var daun = [[220, 470, 70, .4], [700, 180, 58, 2.2], [790, 430, 46, 4], [330, 190, 40, 1.1], [600, 520, 36, 5.2]];
    var latar = document.createElement("canvas"); latar.width = 960; latar.height = 640; (function () {
      var g = latar.getContext("2d"); g.fillStyle = "#24321f"; g.fillRect(0, 0, 960, 640);
      for (var i = 0; i < 3000; i++) { g.strokeStyle = acak(i, 5) > .5 ? "rgba(90,130,70,.4)" : "rgba(10,25,10,.4)"; g.lineWidth = 2; var x = acak(i, 6) * 960, y = acak(6, i) * 640; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (acak(i, 7) - .5) * 6, y - 8); g.stroke(); }
      g.save(); g.beginPath(); g.ellipse(480, 320, 440, 270, 0, 0, Math.PI * 2); g.fillStyle = "#3a3a38"; g.fill(); g.restore();
      for (var b = 0; b < 46; b++) { var a = b / 46 * Math.PI * 2, bx = 480 + Math.cos(a) * 430, by = 320 + Math.sin(a) * 262; g.fillStyle = ["#7c776c", "#8f897d", "#6a665e"][b % 3]; g.beginPath(); g.ellipse(bx, by, 38 + acak(b, 8) * 14, 26 + acak(8, b) * 10, a, 0, Math.PI * 2); g.fill(); g.fillStyle = "rgba(255,255,255,.1)"; g.beginPath(); g.ellipse(bx - 8, by - 8, 14, 7, a, 0, Math.PI * 2); g.fill(); }
    })();
    function air(g) {
      g.save(); g.beginPath(); g.ellipse(480, 320, 405, 240, 0, 0, Math.PI * 2); g.clip();
      var gr = g.createRadialGradient(480, 300, 40, 480, 320, 420); gr.addColorStop(0, "#2f6a63"); gr.addColorStop(1, "#0f2b2c"); g.fillStyle = gr; g.fillRect(0, 0, 960, 640);
      for (var i = 0; i < 40; i++) { var x = acak(i, 11) * 960, y = 120 + acak(11, i) * 400; g.fillStyle = "rgba(20,40,30,.35)"; g.beginPath(); g.ellipse(x, y, 30 + acak(i, 12) * 40, 12, 0, 0, Math.PI * 2); g.fill(); }
    }
    function gambarIkan(g, f) {
      g.save(); g.translate(f.x, f.y); g.rotate(f.a); g.scale(f.s, f.s);
      var ek = Math.sin(f.f) * .35;
      g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.ellipse(8, 10, 36, 13, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = f.wn[0];
      g.beginPath(); g.moveTo(-26, 0); g.quadraticCurveTo(-46, -18 + ek * 20, -54, -12 + ek * 30); g.quadraticCurveTo(-44, 0, -54, 12 + ek * 30); g.quadraticCurveTo(-46, 18 + ek * 20, -26, 0); g.globalAlpha = .85; g.fill(); g.globalAlpha = 1;
      g.beginPath(); g.moveTo(32, 0); g.bezierCurveTo(28, -14, 0, -15, -28, -2 + ek * 6); g.lineTo(-28, 2 + ek * 6); g.bezierCurveTo(0, 15, 28, 14, 32, 0); g.fill();
      g.fillStyle = f.wn[1]; [[10, -3, 9, 5], [-6, 3, 7, 4], [20, 2, 5, 3]].forEach(function (b) { g.beginPath(); g.ellipse(b[0], b[1], b[2], b[3], .3, 0, Math.PI * 2); g.fill(); });
      g.globalAlpha = .7; g.fillStyle = f.wn[0]; [[6, -11, -1], [6, 11, 1]].forEach(function (p) { g.beginPath(); g.ellipse(p[0], p[1], 9, 4, p[2] * (.8 + ek), 0, Math.PI * 2); g.fill(); }); g.globalAlpha = 1;
      g.fillStyle = "#111"; g.beginPath(); g.arc(25, -5, 1.8, 0, 7); g.arc(25, 5, 1.8, 0, 7); g.fill();
      g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.ellipse(14, -5, 10, 2.5, 0, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    function lukis() {
      if (!buka) return;
      var kini = performance.now(), dt = Math.min(.05, (kini - lalu) / 1000); lalu = kini; t += dt;
      k.drawImage(latar, 0, 0); air(k);
      ikan.forEach(function (f) {
        var tuju = null; makan.forEach(function (m) { var d = Math.hypot(m.x - f.x, m.y - f.y); if (d < 320 && (!tuju || d < tuju.d)) tuju = { x: m.x, y: m.y, d: d }; });
        var ingin = f.a;
        if (tuju) ingin = Math.atan2(tuju.y - f.y, tuju.x - f.x);
        else { f.belok -= dt; if (f.belok <= 0) { f.belok = 1 + Math.random() * 3; f.acakA = (Math.random() - .5) * 1.6; } ingin = f.a + (f.acakA || 0) * dt * 2; }
        var nx = (f.x - 480) / 330, ny = (f.y - 320) / 190; if (nx * nx + ny * ny > 1) ingin = Math.atan2(320 - f.y, 480 - f.x);
        var da = Math.atan2(Math.sin(ingin - f.a), Math.cos(ingin - f.a)); f.a += Math.max(-2.2 * dt, Math.min(2.2 * dt, da));
        var v = f.v * (tuju ? 2.2 : 1); f.x += Math.cos(f.a) * v * dt; f.y += Math.sin(f.a) * v * dt; f.f += dt * (tuju ? 14 : 7);
        makan = makan.filter(function (m) { if (Math.hypot(m.x - f.x, m.y - f.y) < 20 * f.s) { riak.push({ x: m.x, y: m.y, t: 0 }); return false; } return true; });
      });
      ikan.slice().sort(function (a, b) { return a.s - b.s; }).forEach(function (f) { gambarIkan(k, f); });
      makan.forEach(function (m) { m.t += dt; k.fillStyle = "#c79a5a"; for (var i = 0; i < 5; i++) { k.beginPath(); k.arc(m.x + Math.cos(i * 1.3) * 7, m.y + Math.sin(i * 2.1) * 6, 2.4, 0, 7); k.fill(); } });
      makan = makan.filter(function (m) { return m.t < 8; });
      riak.forEach(function (r) { r.t += dt; k.strokeStyle = "rgba(220,240,235," + Math.max(0, .55 - r.t * .4) + ")"; k.lineWidth = 2; k.beginPath(); k.ellipse(r.x, r.y, 6 + r.t * 50, 4 + r.t * 32, 0, 0, Math.PI * 2); k.stroke(); });
      riak = riak.filter(function (r) { return r.t < 1.4; });
      if (Math.random() < dt * .8) riak.push({ x: 200 + Math.random() * 560, y: 160 + Math.random() * 320, t: 0 });
      daun.forEach(function (d) { k.save(); k.translate(d[0] + Math.sin(t * .4 + d[3]) * 3, d[1]); k.rotate(d[3] + Math.sin(t * .3 + d[3]) * .05); k.fillStyle = "rgba(0,0,0,.3)"; k.beginPath(); k.moveTo(6, 8); k.arc(6, 8, d[2], .3, 6.2); k.fill(); k.fillStyle = "#3f7d3a"; k.beginPath(); k.moveTo(0, 0); k.arc(0, 0, d[2], .3, 6.2); k.closePath(); k.fill(); k.strokeStyle = "rgba(20,60,20,.5)"; k.lineWidth = 1.5; for (var r = 0; r < 7; r++) { k.beginPath(); k.moveTo(0, 0); k.lineTo(Math.cos(.5 + r * .85) * d[2] * .9, Math.sin(.5 + r * .85) * d[2] * .9); k.stroke(); } k.restore(); });
      k.fillStyle = "#f3c6d2"; for (var p = 0; p < 8; p++) { k.beginPath(); k.ellipse(700 + Math.cos(p * .785) * 10, 180 + Math.sin(p * .785) * 10, 12, 6, p * .785, 0, 7); k.fill(); } k.fillStyle = "#f7e3a0"; k.beginPath(); k.arc(700, 180, 7, 0, 7); k.fill();
      // kodok di atas daun
      var fx = 220, fy = 452, napas = Math.max(0, Math.sin(t * 4)) * 4;
      k.fillStyle = "#4a7a2e"; k.beginPath(); k.ellipse(fx - 22, fy + 10, 12, 7, -.3, 0, 7); k.ellipse(fx + 22, fy + 10, 12, 7, .3, 0, 7); k.fill();
      k.fillStyle = "#5f9438"; k.beginPath(); k.ellipse(fx, fy, 24, 18, 0, 0, 7); k.fill(); k.fillStyle = "#c6d68a"; k.beginPath(); k.ellipse(fx, fy + 8, 14 + napas, 7 + napas * .6, 0, 0, 7); k.fill();
      k.fillStyle = "#6ea544"; k.beginPath(); k.arc(fx - 11, fy - 14, 8, 0, 7); k.arc(fx + 11, fy - 14, 8, 0, 7); k.fill(); k.fillStyle = "#1b1a12"; k.beginPath(); k.arc(fx - 11, fy - 15, 4.5, 0, 7); k.arc(fx + 11, fy - 15, 4.5, 0, 7); k.fill(); k.fillStyle = "#fff"; k.beginPath(); k.arc(fx - 10, fy - 17, 1.5, 0, 7); k.arc(fx + 12, fy - 17, 1.5, 0, 7); k.fill();
      k.restore && 0;
      // cahaya malam & pantulan bulan
      k.save(); k.beginPath(); k.ellipse(480, 320, 405, 240, 0, 0, Math.PI * 2); k.clip(); k.globalCompositeOperation = "lighter"; cahaya(k, 620, 220, 90, "220,230,255", .12); k.globalCompositeOperation = "source-over"; k.restore();
      k.fillStyle = "rgba(8,14,36,.28)"; k.fillRect(0, 0, 960, 640);
      requestAnimationFrame(lukis);
    }
    c.addEventListener("pointerdown", function (e) {
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 960, y = (e.clientY - r.top) / r.height * 640, nx = (x - 480) / 405, ny = (y - 320) / 240;
      if (nx * nx + ny * ny < 1) { makan.push({ x: x, y: y, t: 0 }); riak.push({ x: x, y: y, t: 0 }); }
    });
    bukaModal(w, "tempat-jendela", function () { buka = false; });
    requestAnimationFrame(lukis);
  }
  /* ---------- remote TV: video layar penuh dari admin ---------- */
  function putarVideo(saatTutup) {
    var lapis = el("div", "layar-video", D.video ? '<video controls autoplay playsinline src="' + esc(D.video) + '"></video>' : '<p>Videonya belum diunggah lewat admin.</p>');
    var tutup = el("button", "tutup", "&times;"); tutup.type = "button"; tutup.setAttribute("aria-label", "Tutup video"); lapis.appendChild(tutup);
    if (audioLatar) { clearInterval(pudarTimer); audioLatar.pause(); }
    layarTerbuka = true; tahan = null; input.x = input.y = 0; kunci = {}; document.body.classList.add("sibuk");
    function selesai() { var v = lapis.querySelector("video"); if (v) v.pause(); if (!lapis.parentNode) return; lapis.remove(); layarTerbuka = false; document.body.classList.remove("sibuk"); removeEventListener("keydown", esc2); aturMusik(); if (saatTutup) setTimeout(saatTutup, 200); }
    function esc2(e) { if (e.key === "Escape") selesai(); }
    tutup.addEventListener("click", selesai); addEventListener("keydown", esc2);
    document.body.appendChild(lapis);
    var v = lapis.querySelector("video"); if (v) { v.addEventListener("ended", function () { setTimeout(selesai, 600); }); var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  }
  /* ---------- meja kecil: pilih album, foto, atau remote ---------- */
  var otoJalan = null;
  function jalanKe(titik, selesai) { sibuk = true; tahan = null; input.x = input.y = 0; otoJalan = { titik: titik, selesai: selesai }; }
  var IKON_MEJA = {
    album: '<svg viewBox="0 0 48 40" aria-hidden="true"><rect x="6" y="6" width="36" height="28" rx="2" fill="#6e3326"/><rect x="9" y="9" width="30" height="22" fill="#f2ead8"/><rect x="12" y="12" width="11" height="9" fill="#9fb0c4"/><rect x="25" y="12" width="11" height="9" fill="#c4a99f"/><path d="M24 9v22" stroke="#b9a988"/></svg>',
    fotoMeja: '<svg viewBox="0 0 48 40" aria-hidden="true"><rect x="13" y="3" width="22" height="30" fill="#3a2a1c"/><rect x="16" y="6" width="16" height="24" fill="#b58a7a"/><circle cx="24" cy="15" r="4" fill="#f3d9c4"/><path d="M16 30q8-10 16 0z" fill="#5a4048"/><path d="M20 33l-3 5M28 33l3 5" stroke="#3a2a1c" stroke-width="2"/></svg>',
    remote: '<svg viewBox="0 0 48 40" aria-hidden="true"><rect x="18" y="3" width="12" height="34" rx="6" fill="#1f1f22"/><circle cx="24" cy="10" r="2.2" fill="#c23a30"/><rect x="21" y="16" width="6" height="2.4" rx="1" fill="#5a5a60"/><rect x="21" y="21" width="6" height="2.4" rx="1" fill="#5a5a60"/><rect x="21" y="26" width="6" height="2.4" rx="1" fill="#5a5a60"/></svg>'
  };
  function pilihMeja() {
    var w = el("div", null, '<div class="kicker">Meja kecil</div><h2>Mau ambil apa?</h2><div class="pilih-meja">' +
      [["album", "Album foto"], ["fotoMeja", "Foto di meja"], ["remote", "Remote TV"]].map(function (p) { return '<button type="button" data-k="' + p[0] + '">' + IKON_MEJA[p[0]] + '<span>' + p[1] + '</span></button>'; }).join("") + '</div>');
    w.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.dataset.k; tutupModal();
        setTimeout(function () { if (k === "album") ambilAlbum(); else if (k === "fotoMeja") { temukan("fotoMeja"); bukaModal(ISI.fotoMeja(), "tempat-foto"); } else ambilRemote(); }, 120);
      });
    });
    bukaModal(w, "tempat-meja");
  }
  function dudukSofa(lalu) {
    var A = adegan;
    jalanKe(Math.hypot(pemain.x - 170, pemain.y - 112) > 2 ? [{ x: 170, y: 112 }, { x: 170, y: 100 }] : [{ x: 170, y: 100 }], function () {
      pemain.pose = "duduk"; pemain.arah = "bawah"; A.diSofa = true;
      setTimeout(function () { sibuk = false; if (lalu) lalu(); }, 450);
    });
  }
  function bangunSofa() { var A = ADEGAN.lantai2; if (!A.diSofa) return; A.diSofa = false; A.albumDibawa = false; pemain.pose = ""; pemain.x = 170; pemain.y = 112; pemain.arah = "bawah"; }
  function bangunKasur() { var A = ADEGAN.lantai2; if (!A.tidur) return; A.tidur = false; A.remoteDibawa = false; A.selimutKe = 1; pemain.pose = ""; pemain.x = 76; pemain.y = 134; pemain.arah = "bawah"; }
  function tanyaBangun(tempat) {
    var sofa = tempat === "sofa";
    var w = el("div", null, '<div class="kicker">' + (sofa ? "Sofa santai" : "Tempat tidur") + '</div><h2>' + (sofa ? "Mau bangun dari sofa?" : "Bangun dari tempat tidur?") + '</h2>' +
      '<div class="dua-tombol"><button class="tombol garis" type="button" data-a="0">' + (sofa ? "Tidak, masih santai" : "Tidak, masih rebahan") + '</button><button class="tombol" type="button" data-a="1">Ya, bangun</button></div>');
    w.querySelectorAll("button").forEach(function (b) { b.addEventListener("click", function () { if (b.dataset.a === "1") { if (sofa) bangunSofa(); else bangunKasur(); } tutupModal(); }); });
    bukaModal(w, "tempat-tanya");
  }
  function ambilAlbum() {
    var A = adegan; temukan("album"); A.albumDibawa = true; kabar("Mengambil album, lalu duduk di sofa…");
    dudukSofa(function () { var l = lihatAlbum(); l.setelah = function () { setTimeout(function () { tanyaBangun("sofa"); }, 250); }; });
  }
  function ambilRemote() {
    var A = adegan;
    if (!A.selimutKe) {
      bukaModal('<div class="larang-remote"><svg viewBox="0 0 120 120" aria-hidden="true"><rect x="47" y="10" width="26" height="100" rx="13" fill="#1f1f22"/><circle cx="60" cy="26" r="4.5" fill="#c23a30"/><rect x="53" y="40" width="14" height="5" rx="2" fill="#5a5a60"/><rect x="53" y="52" width="14" height="5" rx="2" fill="#5a5a60"/><rect x="53" y="64" width="14" height="5" rx="2" fill="#5a5a60"/><path d="M20 22L100 98M100 22L20 98" stroke="#d6403a" stroke-width="9" stroke-linecap="round"/></svg>' +
        '<h2>Harus buka seprei dulu</h2><p class="pelan">Ketuk kasurnya untuk membuka seprei, lalu ambil remote lagi.</p></div>', "tempat-tanya");
      return;
    }
    temukan("remote"); A.remoteDibawa = true;
    kabar(A.bersih ? "Membawa remote ke tempat tidur…" : "Membawa remote, membersihkan bunga di kasur…");
    jalanKe([{ x: 76, y: 134 }], function () {
      pemain.arah = "atas"; pemain.pose = "sapu";
      var mulai = performance.now(), b0 = A.bersih;
      (function sapu() {
        var u = Math.min(1, (performance.now() - mulai) / 1800); A.bersih = Math.max(b0, u);
        if (u < 1 && !b0) return requestAnimationFrame(sapu);
        pemain.pose = ""; A.bersih = 1; A.tidur = true; A.selimutKe = 0;
        setTimeout(function () {
          sibuk = false; kabar("Menyalakan TV…");
          putarVideo(function () { tanyaBangun("kasur"); });
        }, 1500);
      })();
    });
  }
  /* ---------- lemari baju: ganti gaun / jas dengan catatan dari admin ---------- */
  function bukaLemari() {
    var cewek = jenisKu !== "cowok", nama = cewek ? "gaun" : "jas", dipakai = pemain.baju === nama;
    var warna = ["#b7a48a", "#6f7d5c", "#d9cfc0", "#8a5a4a", "#4a5568", "#e6dccb"], baju = "";
    warna.forEach(function (c, i) { baju += '<svg class="gantung" viewBox="0 0 40 70" aria-hidden="true"><path d="M20 2 q4 0 4 4 q0 3 -4 4" fill="none" stroke="#8a7a60" stroke-width="1.5"/><path d="M8 14 L20 10 L32 14 L38 26 L32 28 L31 62 L9 62 L8 28 L2 26 Z" fill="' + c + '"/><path d="M14 12 Q20 18 26 12" fill="none" stroke="rgba(0,0,0,.2)"/></svg>'; });
    var istimewa = cewek ? '<path d="M20 2 q4 0 4 4 q0 3 -4 4" fill="none" stroke="#c9a45a" stroke-width="1.5"/><path d="M13 12 L20 10 L27 12 L26 30 L36 66 L4 66 L14 30 Z" fill="#34457f"/><path d="M14 30 L26 30" stroke="#c9a45a" stroke-width="1.6"/><circle cx="12" cy="50" r=".8" fill="#fff6d8"/><circle cx="24" cy="44" r=".8" fill="#fff6d8"/><circle cx="28" cy="58" r=".8" fill="#fff6d8"/>'
      : '<path d="M20 2 q4 0 4 4 q0 3 -4 4" fill="none" stroke="#c9a45a" stroke-width="1.5"/><path d="M8 14 L20 10 L32 14 L37 30 L32 31 L31 64 L9 64 L8 31 L3 30 Z" fill="#2b2c33"/><path d="M15 12 L20 30 L25 12 Z" fill="#f4f2ee"/><path d="M17 15 L20 17 L23 15 L23 19 L20 17 L17 19 Z" fill="#7a2232"/>';
    var w = el("div", null, '<div class="kicker">Lemari baju</div><div class="lemari"><div class="rel"></div>' + baju +
      '<div class="pilihan"><div class="catatan-gaun">' + paragraf(D.catatanGaun || "Pakai ini malam ini, ya.") + '</div><svg class="gantung istimewa" viewBox="0 0 40 70" aria-hidden="true">' + istimewa + '</svg></div></div>' +
      '<button class="tombol" type="button">' + (dipakai ? "Pakai baju semula" : "Pakai " + nama + " ini") + '</button>');
    w.querySelector(".tombol").addEventListener("click", function () {
      pemain.baju = dipakai ? "" : nama; potret(document.getElementById("avatar"), jenisKu, { baju: pemain.baju }); tutupModal();
      kabar(dipakai ? "Kembali ke baju semula." : (cewek ? "Gaunnya cantik sekali ✨" : "Jasnya pas sekali ✨"));
    });
    bukaModal(w, "tempat-lemari");
  }

  /* ---------- mengobrol dengan si dia: dia bertanya, kamu mengetik jawaban ---------- */
  function ngobrol() {
    var nama = D.pengirim || "Si Dia";
    dia.arah = arahKe(dia, pemain);
    var awal = !sudahNgobrol && D.pesanKejutan ? halaman(D.pesanKejutan) : []; sudahNgobrol = true;
    // pertanyaan pertama + pertanyaan lanjutan dari admin, dijawab satu per satu
    var daftar = [{ tanya: D.tanyaKabar || "Hai… bagaimana keadaanmu?", balas: D.balasKabar || "Apapun yang kamu rasakan, terima kasih sudah mau cerita.\n\nSemoga dengan bertambahnya usiamu ini, menjadi langkah baru untuk kamu menuju kebahagiaan.", judul: "Bagaimana keadaanmu?" }]
      .concat((D.tanyaLanjut || []).filter(function (q) { return q && String(q.tanya || "").trim(); }));
    function tanya(i, pembuka) {
      var q = daftar[i]; if (!q) { dia.arah = "bawah"; return; }
      var hal = halaman(q.tanya), judul = q.judul || hal[hal.length - 1];
      bicara(nama, jenisDia(), (pembuka || []).concat(hal), function () {
        var w = el("div", null, '<div class="kicker">Jawab ' + esc(nama) + '</div><h2>' + esc(judul) + '</h2>' +
          '<form class="isian"><textarea rows="5" maxlength="2000" placeholder="Tulis jawabanmu…"></textarea><button class="tombol" type="submit">Jawab</button></form>');
        var f = w.querySelector("form"), ta = f.querySelector("textarea"), dijawab = false;
        f.addEventListener("submit", function (e) { e.preventDefault(); dijawab = true; tutupModal(); });
        bukaModal(w, "tempat-isian", function () {
          if (!dijawab && !ta.value.trim()) { dia.arah = "bawah"; return; }
          if (ta.value.trim()) simpanTulisan(("Jawaban: " + judul).slice(0, 80), ta.value.trim());
          setTimeout(function () {
            var balas = String(q.balas || "").trim();
            if (balas) bicara(nama, jenisDia(), halaman(balas), function () { setTimeout(function () { tanya(i + 1); }, 300); });
            else tanya(i + 1);
          }, 250);
        });
        if (!SENTUH) setTimeout(function () { ta.focus({ preventScroll: true }); }, 120);
      });
    }
    tanya(0, awal);
  }
  /* ---------- simpan tulisan tamu ke database Supabase (diatur di admin) ---------- */
  function simpanTulisan(bagian, teks) {
    var u = String(D.dbUrl || "").replace(/\/+$/, ""), k = String(D.dbKey || "");
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(u) || !k) return;
    var h = { apikey: k, "Content-Type": "application/json", Prefer: "return=minimal" };
    if (/^eyJ/.test(k)) h.Authorization = "Bearer " + k;
    try {
      fetch(u + "/rest/v1/tulisan", { method: "POST", keepalive: true, headers: h,
        body: JSON.stringify({ bagian: bagian.slice(0, 80), teks: String(teks).slice(0, 3000), nama: String(D.nama || "").slice(0, 80), tokoh: jenisKu || "" }) }).catch(function () {});
    } catch (e) {}
  }
  /* ---------- duduk di bangku & menulis keluh kesah ---------- */
  function duduk() {
    var asal = { x: pemain.x, y: pemain.y };
    pemain.x = 104; pemain.y = 265; pemain.arah = "bawah"; pemain.pose = "duduk"; pemain.jalan = false;
    var w = el("div", null, '<div class="kicker">Bangku di bawah pohon</div><h2>Duduk sebentar</h2><p class="pelan">Tulis keluh kesahmu di sini. Tidak perlu rapi, tulis saja apa adanya.</p>' +
      '<form class="isian"><textarea rows="6" maxlength="2000" placeholder="Hari ini aku merasa…"></textarea><button class="tombol" type="submit">Lepaskan</button></form>');
    var f = w.querySelector("form"), ta = f.querySelector("textarea");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (ta.value.trim()) simpanTulisan("Keluh kesah (bangku)", ta.value.trim());
      var balas = el("div", "balasan", paragraf(D.balasKeluh || "Terima kasih sudah jujur pada dirimu sendiri.\n\nTarik napas pelan-pelan. Yang berat hari ini boleh kamu titipkan di bangku ini.") + '<button class="tombol" type="button">Berdiri lagi</button>');
      balas.querySelector("button").addEventListener("click", tutupModal);
      f.replaceWith(balas); w.querySelector(".pelan").remove();
    });
    sibuk = true;
    setTimeout(function () {
      sibuk = false;
      bukaModal(w, "tempat-isian", function () { pemain.pose = ""; pemain.x = asal.x; pemain.y = Math.max(asal.y, 270); });
      if (!SENTUH) setTimeout(function () { ta.focus({ preventScroll: true }); }, 120);
    }, 1100);
  }

  /* ---------- tempat sampah: menulis hal yang ingin dibuang & dilupakan ---------- */
  function buangSampah() {
    var w = el("div", null, '<div class="kicker">Tempat sampah</div><h2>Buang di sini</h2><p class="pelan">Hal apa yang ingin kamu buang dan lupakan? Tulis di kertas ini, lalu remas dan buang.</p>' +
      '<form class="isian"><textarea rows="5" maxlength="2000" placeholder="Aku ingin membuang…"></textarea><button class="tombol" type="submit">Remas &amp; buang</button></form>');
    var f = w.querySelector("form"), ta = f.querySelector("textarea");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var teks = ta.value.trim(); if (!teks) { ta.focus(); return; }
      simpanTulisan("Dibuang & dilupakan (tempat sampah)", teks);
      var tong = el("div", "tong buang", '<div class="kertas-lecek remas">' + paragraf(teks) + '</div>');
      f.replaceWith(tong); w.querySelector(".pelan").remove();
      setTimeout(function () {
        var balas = el("div", "balasan", paragraf(D.suratSampah || "Sudah terbuang. Yang tadi kamu tulis tidak perlu kamu bawa lagi.") + '<button class="tombol" type="button">Tutup</button>');
        balas.querySelector("button").addEventListener("click", tutupModal);
        tong.after(balas);
      }, 1500);
    });
    bukaModal(w, "tempat-isian");
    if (!SENTUH) setTimeout(function () { ta.focus({ preventScroll: true }); }, 120);
  }

  /* ---------- alur awal ---------- */
  function pilihTokoh() {
    if (D.jenis === "cowok" || D.jenis === "cewek") { jenisKu = D.jenis; mulaiMain(); return; }
    var w = el("div", null, '<div class="kicker">Yang berulang tahun</div><h2>Pilih tokohmu</h2><div class="pilih-tokoh"></div>');
    [["cowok", "Cowok"], ["cewek", "Cewek"]].forEach(function (p) {
      var b = el("button", "kartu-tokoh", '<canvas width="216" height="288"></canvas><span>' + p[1] + '</span>'); b.type = "button";
      potret(b.querySelector("canvas"), p[0], { penuh: true });
      b.addEventListener("click", function () { jenisKu = p[0]; tutupModal(); });
      w.querySelector(".pilih-tokoh").appendChild(b);
    });
    bukaModal(w, "wajib", function () { if (!jenisKu) jenisKu = "cewek"; mulaiMain(); });
  }
  function mulaiMain() {
    var aw = ADEGAN.luar.awal;
    pemain = { x: aw.x, y: aw.y, arah: aw.arah, jalan: false, anim: 0, jenis: jenisKu };
    dia = { x: 178, y: 152, arah: "bawah", jalan: false, anim: 0, jenis: jenisDia() };
    potret(document.getElementById("avatar"), jenisKu);
    main = true; document.body.classList.add("main"); perbaruiHud();
    petunjuk.hidden = false; setTimeout(function () { petunjuk.hidden = true; }, 6000);
    cam.x = aw.x; cam.y = aw.y - 44;
    kabar("Selamat bermain! Jelajahi sekitar rumah, klik apa saja yang menarik perhatianmu.");
  }
  function perbaruiHud() { var s = document.getElementById("hudSisa"); if (s && adegan) s.textContent = adegan.lokasi + (D.pesanAkhir ? " · " + jumlahKetemu() + "/" + daftarRahasia().length + " rahasia" : ""); }

  var petunjuk;
  function pasangKontrol() {
    var joy = el("div", "joy", '<div class="knob"></div>'), knob = joy.firstChild, aktif = null;
    document.body.appendChild(joy);
    petunjuk = el("div", "petunjuk", SENTUH ? "Ketuk tempat atau benda yang dituju, atau geser lingkaran ini" : "Klik tempat atau benda yang dituju, atau pakai tombol panah"); petunjuk.hidden = true; document.body.appendChild(petunjuk);
    function gerakJoy(e) {
      var r = joy.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = e.clientX - cx, dy = e.clientY - cy, max = r.width * .38, d = Math.hypot(dx, dy);
      if (d > max) { dx = dx / d * max; dy = dy / d * max; }
      knob.style.transform = "translate(" + dx + "px," + dy + "px)";
      input.x = Math.abs(dx) > 4 ? dx / max : 0; input.y = Math.abs(dy) > 4 ? dy / max : 0;
    }
    joy.addEventListener("pointerdown", function (e) { aktif = e.pointerId; joy.setPointerCapture(e.pointerId); petunjuk.hidden = true; gerakJoy(e); e.preventDefault(); });
    joy.addEventListener("pointermove", function (e) { if (e.pointerId === aktif) gerakJoy(e); });
    function lepas(e) { if (e.pointerId !== aktif) return; aktif = null; input.x = input.y = 0; knob.style.transform = ""; }
    joy.addEventListener("pointerup", lepas); joy.addEventListener("pointercancel", lepas);
    cv.addEventListener("pointerdown", function (e) {
      if (!pemain || layarTerbuka || !main) return;
      var dp = cv.width / innerWidth, px = e.clientX * dp, py = e.clientY * dp, kena = null;
      kotakLabel.forEach(function (k) { if (px >= k.x - 6 && px <= k.x + k.w + 6 && py >= k.y - 6 && py <= k.y + k.h + 6) kena = k.tp; });
      if (kena && tempatDekat() === kena) { abaikanKlik = performance.now() + 600; bukaTempat(kena.key); return; }
      var wd = keDunia(e.clientX, e.clientY), bd = bendaDi(wd.x, wd.y);
      if (bd && cukupDekat(bd)) { abaikanKlik = performance.now() + 600; e.preventDefault(); pakaiBenda(bd); return; }
      petunjuk.hidden = true;
      tahan = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t0: performance.now(), bd: bd, tp: kena }; try { cv.setPointerCapture(e.pointerId); } catch (er) {}
    });
    // ketukan yang membuka benda jangan ikut "mengklik" isi jendela yang baru terbuka (menutup / membalik)
    document.addEventListener("click", function (e) { if (performance.now() < abaikanKlik && !cv.contains(e.target)) { e.stopPropagation(); e.preventDefault(); } }, true);
    cv.addEventListener("pointermove", function (e) {
      if (tahan && e.pointerId === tahan.id) { tahan.x = e.clientX; tahan.y = e.clientY; return; }
      if (e.pointerType === "mouse" && main) { var w = keDunia(e.clientX, e.clientY), b = bendaDi(w.x, w.y); cv.style.cursor = b && cukupDekat(b) ? "pointer" : ""; }
    });
    function lepasTahan(e) {
      if (!tahan || e.pointerId !== tahan.id) return;
      var h = tahan; tahan = null;
      // ketukan singkat = ketuk tujuan: tokoh berjalan sendiri ke sana (benda/label langsung dibuka saat sampai)
      if (e.type === "pointerup" && performance.now() - h.t0 < 300 && Math.hypot(e.clientX - h.sx, e.clientY - h.sy) < 14 && !layarTerbuka && !sibuk) aturTujuan(h.sx, h.sy, h.bd, h.tp);
    }
    cv.addEventListener("pointerup", lepasTahan); cv.addEventListener("pointercancel", lepasTahan); cv.addEventListener("lostpointercapture", lepasTahan);
    dlg.addEventListener("click", lanjutDialog);
    addEventListener("keydown", function (e) {
      var tag = (e.target || {}).tagName || "";
      if (!dlg.hidden && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); lanjutDialog(); return; }
      if (e.key === "Escape" && !modal.hidden && !panel.classList.contains("wajib")) { tutupModal(); return; }
      if (layarTerbuka || /^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
      if ((e.key === "Enter" || e.key === " ") && pemain && main && !/^(BUTTON|A)$/.test(tag)) {
        var bd = bendaDekat(); if (bd) { e.preventDefault(); pakaiBenda(bd); return; }
        var t = tempatDekat(); if (t) { e.preventDefault(); bukaTempat(t.key); return; }
      }
      var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (/^Arrow|^[wasd]$/.test(k)) { kunci[k] = true; e.preventDefault(); }
    });
    addEventListener("keyup", function (e) { var k = e.key.length === 1 ? e.key.toLowerCase() : e.key; kunci[k] = false; });
    addEventListener("blur", function () { kunci = {}; tahan = null; });
  }

  function mulai() {
    document.title = "Selamat Ulang Tahun " + (D.nama || "");
    cv = el("canvas", "dunia"); cv.setAttribute("role", "img"); cv.setAttribute("aria-label", "Halaman rumah dan pesta kejutan ulang tahun " + (D.nama || ""));
    document.body.appendChild(cv); g = cv.getContext("2d");
    R = Math.max(3, Math.min(4, Math.ceil(skala() * Math.min(window.devicePixelRatio || 1, 2))));
    ADEGAN.luar = buatLuar(); ADEGAN.lantai1 = buatLantai1(); ADEGAN.lantai2 = buatLantai2(); ADEGAN.kamarMandi = buatKamarMandi();
    Object.keys(ADEGAN).forEach(function (k) { prarender(ADEGAN[k]); });
    document.addEventListener("pointerdown", sxBuka, true); document.addEventListener("keydown", sxBuka, true);
    setInterval(function () { if (sx) sxSuasana(); }, 120);
    adegan = ADEGAN.luar; cam.x = 300; cam.y = 330;
    ukur(); addEventListener("resize", ukur);

    document.body.appendChild(el("div", "hud", '<canvas id="avatar" width="96" height="96" aria-hidden="true"></canvas><div class="hud-judul"><b>Happy Birthday, ' + esc(D.nama) + '!</b><small id="hudSisa"></small></div>'));
    {
      audioLatar = new Audio(); audioLatar.loop = true; audioLatar.preload = "auto";
      tombolMusik = el("button", "musik", '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>'); tombolMusik.type = "button"; tombolMusik.setAttribute("aria-label", "Musik");
      tombolMusik.addEventListener("click", function () { musikMati = !musikMati; sxMatiUser = musikMati; tombolMusik.classList.toggle("mati", musikMati); aturMusik(); });
      document.body.appendChild(tombolMusik); window.__musik = function () { musikMati = false; tombolMusik.classList.remove("mati"); aturMusik(); };
    }
    modal = el("div", "modal", '<div class="panel" role="dialog" aria-modal="true"><button type="button" class="tutup" aria-label="Tutup">&times;</button><div class="isi"></div></div>');
    modal.hidden = true; document.body.appendChild(modal);
    panel = modal.firstChild; isi = panel.querySelector(".isi"); tutupBtn = panel.querySelector(".tutup");
    tutupBtn.addEventListener("click", tutupModal);
    modal.addEventListener("click", function (e) { if (e.target === modal && !panel.classList.contains("wajib")) tutupModal(); });
    dlg = el("div", "dialog", '<canvas width="160" height="160" aria-hidden="true"></canvas><div class="dialog-isi"><b></b><p></p><span class="lanjut">▼</span></div>');
    dlg.hidden = true; document.body.appendChild(dlg); dlgPotret = dlg.querySelector("canvas"); dlgNama = dlg.querySelector("b"); dlgTeks = dlg.querySelector("p");
    document.body.appendChild(el("div", "gelap", "<p></p>")).id = "gelap";
    pasangKontrol();

    var sampul = el("div", "sampul",
      '<div class="kartu-sampul"><div class="kecil">Untuk ' + esc(D.nama || "kamu") + '</div><div class="nama">Selamat bermain!</div>' +
      '<p class="ajak">Berjalanlah ke rumah itu. Klik apa saja yang menarik perhatianmu.</p></div>' +
      '<button type="button" class="tombol" id="bukaUndangan">Mulai</button>');
    document.body.appendChild(sampul);
    sampul.querySelector("#bukaUndangan").addEventListener("click", function () {
      sampul.classList.add("buka"); if (window.__musik) window.__musik();
      setTimeout(function () { sampul.remove(); pilihTokoh(); }, 700);
    });
    requestAnimationFrame(putar);
    // untuk pengujian otomatis
    window.__ultah = { temukan: function (k) { temukan(k); },  pemain: function () { return pemain; }, adegan: function () { return adegan.id; }, ke: function (id, x, y) { pindahAdegan(id, { x: x, y: y, arah: "atas" }, false); }, status: function () { return { kejutan: kejutanSelesai, kue: kueSelesai, dialog: !dlg.hidden, modal: !modal.hidden }; }, keLayar: function (x, y) { var k = kamera(), dp = cv.width / innerWidth; return { x: (x - k.x0) * S / dp, y: (y - k.y0) * S / dp }; } };
  }
  function siap() {
    var jalan = false; function go() { if (!jalan) { jalan = true; mulai(); } }
    if (document.fonts && document.fonts.load) Promise.all([document.fonts.load("700 20px Fredoka"), document.fonts.load("600 20px Fredoka")]).then(go, go);
    setTimeout(go, 2500);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", siap); else siap();
})();
