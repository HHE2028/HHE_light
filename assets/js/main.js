// 广州氢氦照明设计有限公司
(function () {
  // 手机导航
  var btn = document.getElementById('menuBtn');
  var nav = document.getElementById('mainNav');
  if (btn && nav) btn.addEventListener('click', function () { nav.classList.toggle('open'); });

  // 轮播
  var hero = document.querySelector('.hero');
  if (hero) {
    var slides = hero.querySelectorAll('.slide');
    var dotsWrap = hero.querySelector('.dots');
    var cur = 0, timer = null;
    for (var i = 0; i < slides.length; i++) {
      (function (idx) {
        var d = document.createElement('span');
        if (idx === 0) d.className = 'on';
        d.addEventListener('click', function () { go(idx); reset(); });
        dotsWrap.appendChild(d);
      })(i);
    }
    var dots = dotsWrap.querySelectorAll('span');
    function go(n) {
      slides[cur].classList.remove('active'); dots[cur].classList.remove('on');
      cur = (n + slides.length) % slides.length;
      slides[cur].classList.add('active'); dots[cur].classList.add('on');
    }
    function reset() { clearInterval(timer); timer = setInterval(function () { go(cur + 1); }, 4000); }
    var prev = hero.querySelector('.prev'), next = hero.querySelector('.next');
    if (prev) prev.addEventListener('click', function () { go(cur - 1); reset(); });
    if (next) next.addEventListener('click', function () { go(cur + 1); reset(); });
    reset();
  }

  // 返回顶部
  var toTop = document.getElementById('toTop');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.style.display = window.pageYOffset > 400 ? 'block' : 'none';
    });
    toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  // 内页方块灯阵：小方块随机渐变亮灭
  var band = document.querySelector('.pixel-band');
  if (band) {
    var cvs = document.createElement('canvas');
    band.appendChild(cvs);
    var ctx = cvs.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, cells = [], t0 = 0;

    function build() {
      W = band.clientWidth; H = band.clientHeight;
      if (W < 10 || H < 10) return;
      cvs.width = Math.round(W * dpr);
      cvs.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var cell = Math.max(10, Math.round(W / 88));
      var cols = Math.floor(W / cell), rows = Math.floor(H / cell);
      cells = [];
      for (var r = 0; r < rows; r++) {
        // 从上往下密度递减（幂次曲线）：顶部 ~98%，底部 ~2%
        var ratio = r / (rows - 1);
        var density = 0.98 * Math.pow(1 - ratio, 2.2) + 0.02;
        for (var c = 0; c < cols; c++) {
          if (Math.random() > density) continue;
          var big = Math.random() < 0.16 && r < rows - 1 && c < cols - 1;
          cells.push({
            x: c * cell + 2, y: r * cell + 2,
            s: big ? cell * 2 - 5 : cell - 4,
            base: 0.18 + Math.random() * 0.82,
            ph: Math.random() * Math.PI * 2,
            sp: 0.35 + Math.random() * 1.6,
            glow: Math.random() < 0.55 ? 5 + Math.random() * 10 : 0,
            warm: Math.random() < 0.22
          });
        }
      }
    }

    function render(t) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < cells.length; i++) {
        var p = cells[i];
        var a = p.base * (0.22 + 0.78 * (0.5 + 0.5 * Math.sin(t * p.sp + p.ph)));
        ctx.globalAlpha = a;
        ctx.shadowBlur = p.glow * dpr;
        ctx.shadowColor = 'rgba(255,255,255,.55)';
        ctx.fillStyle = p.warm ? '#fff4dc' : '#ffffff';
        ctx.fillRect(p.x, p.y, p.s, p.s);
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

    function draw(ts) {
      if (!t0) t0 = ts;
      render((ts - t0) / 1000);
      requestAnimationFrame(draw);
    }

    build();
    render(0);
    requestAnimationFrame(draw);
    var rt = null;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { build(); render(0); t0 = 0; }, 300);
    });
  }

  // 内页英文标签：加粗并两端对齐到下方中文标题宽度
  var bText = document.querySelector('.banner-text');
  if (bText) {
    var bEn = bText.querySelector('.en');
    var bH1 = bText.querySelector('h1');
    if (bEn && bH1) {
      var letters = bEn.textContent.replace(/\s+/g, '').split('');
      bEn.innerHTML = letters.map(function (c) { return '<span>' + c + '</span>'; }).join('');
      bEn.style.display = 'flex';
      bEn.style.justifyContent = 'space-between';
      bEn.style.letterSpacing = '0';
      var fitEn = function () {
        bEn.style.width = 'auto';
        var nat = bEn.scrollWidth;
        var tw = bH1.getBoundingClientRect().width;
        if (nat > tw) {
          bEn.style.width = '';
          bEn.style.justifyContent = 'flex-start';
          bEn.style.letterSpacing = '2px';
        } else {
          bEn.style.justifyContent = 'space-between';
          bEn.style.letterSpacing = '0';
          bEn.style.width = tw + 'px';
        }
      };
      fitEn();
      window.addEventListener('resize', fitEn);
    }
  }

  // 联系页公司地址地图（百度地图 JS API，需填写 Web 端 AK）
  var mapBox = document.getElementById('companyMap');
  if (mapBox) {
    var MAP_AK = 'wF1a2tzO7hxRsEpCtwkAGtRBdZnSgr0P'; // 百度地图开放平台 Web 端 AK
    var LNG = 113.3569, LAT = 23.00645; // 百度坐标（BD09）：番禺大道北383号 海印星玥1栋
    if (!MAP_AK) {
      mapBox.className = 'map-canvas map-empty';
      mapBox.textContent = '地图加载中，请在 assets/js/main.js 中填入百度地图 AK';
    } else {
      window.initCompanyMap = function () {
        var pt = new BMapGL.Point(LNG, LAT);
        var map = new BMapGL.Map('companyMap');
        map.centerAndZoom(pt, 17);
        map.enableScrollWheelZoom(true);
        map.addOverlay(new BMapGL.Marker(pt));
        var info = new BMapGL.InfoWindow('<div style="line-height:1.7;font-size:13px"><b>广州氢氦照明设计有限公司</b><br>广州市番禺区南村镇番禺大道北383号写字楼1栋1106房</div>');
        map.openInfoWindow(info, pt);
      };
      var s = document.createElement('script');
      s.src = 'https://api.map.baidu.com/api?v=1.0&type=webgl&ak=' + MAP_AK + '&callback=initCompanyMap';
      document.body.appendChild(s);
    }
  }

  // 首页背景音乐（自动播放被浏览器拦截时，首次点击/按键后开始播放）
  var bgm = document.getElementById('bgm');
  var bgmBtn = document.getElementById('bgmBtn');
  if (bgm && bgmBtn) {
    var syncBgm = function () { bgmBtn.classList.toggle('on', !bgm.paused); };
    var playBgm = function () { var pr = bgm.play(); if (pr && pr.catch) { pr.catch(function () {}); } };
    bgmBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (bgm.paused) { playBgm(); } else { bgm.pause(); }
      syncBgm();
    });
    bgm.addEventListener('play', syncBgm);
    bgm.addEventListener('pause', syncBgm);
    playBgm();
    var startOnce = function () { if (bgm.paused) { playBgm(); } };
    document.addEventListener('click', startOnce, { once: true });
    document.addEventListener('keydown', startOnce, { once: true });
  }
})();

/* ===== Publii 主题追加功能 ===== */
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') { fn(); }
    else { document.addEventListener('DOMContentLoaded', fn); }
  }

  ready(function () {
    // 1. 菜单英文映射：按中文名填充 .en（已有内容则跳过）
    var EN_MAP = {
      '首页': 'HOME',
      '关于我们': 'ABOUT US',
      '案例中心': 'CASES',
      '灯光动画': 'ANIMATION',
      '新闻动态': 'NEWS',
      '人才招聘': 'CAREERS',
      '联系我们': 'CONTACT US'
    };
    var navRoot = document.querySelector('.nav');
    if (navRoot) {
      var cnItems = navRoot.querySelectorAll('.cn');
      for (var i = 0; i < cnItems.length; i++) {
        var enEl = cnItems[i].parentNode.querySelector('.en');
        if (!enEl || enEl.textContent.replace(/\s/g, '') !== '') continue;
        var label = cnItems[i].textContent.replace(/\s/g, '');
        if (EN_MAP[label]) enEl.textContent = EN_MAP[label];
      }
    }

    // 2. 数字分页
    function pageUrl(k) {
      var p = location.pathname;
      var m = p.match(/^(.*\/)page\/(\d+)(?:\/)?$/);
      if (m) {
        var base = m[1];
        return k === 1 ? base : base + 'page/' + k + '/';
      }
      if (/\.html?$/.test(p) && !/index\.html$/.test(p)) {
        return k === 1 ? p : p + '?page=' + k;
      }
      var base2 = p.replace(/index\.html$/, '');
      if (base2.charAt(base2.length - 1) !== '/') base2 += '/';
      return k === 1 ? base2 : base2 + 'page/' + k + '/';
    }

    var pag = document.querySelector('.pagination[data-pages]');
    if (pag && !pag.getAttribute('data-built')) {
      var total = parseInt(pag.getAttribute('data-pages'), 10) || 0;
      var current = parseInt(pag.getAttribute('data-current'), 10) || 1;
      if (total > 1) {
        pag.setAttribute('data-built', '1');
        var prevLink = pag.querySelector('a.pg-edge[rel="prev"]');
        var nextLink = pag.querySelector('a.pg-edge[rel="next"]');
        var prevUrl = prevLink ? prevLink.href : '';
        var nextUrl = nextLink ? nextLink.href : '';
        var html = '';
        html += current <= 1
          ? '<span class="pg-edge off">首页</span>'
          : '<a class="pg-edge" href="' + pageUrl(1) + '">首页</a>';
        html += prevUrl
          ? '<a class="pg-edge" href="' + prevUrl + '" rel="prev">上一页</a>'
          : '<span class="pg-edge off">上一页</span>';

        var start, end;
        if (total <= 9) {
          start = 1; end = total;
        } else {
          start = Math.max(1, current - 2);
          end = Math.min(total, current + 2);
          if (start > 1) {
            html += '<a class="pg-num" href="' + pageUrl(1) + '">1</a>';
            if (start > 2) html += '<span class="pg-num pg-dots">…</span>';
          }
        }
        for (var k = start; k <= end; k++) {
          html += (k === current)
            ? '<span class="pg-num cur">' + k + '</span>'
            : '<a class="pg-num" href="' + pageUrl(k) + '">' + k + '</a>';
        }
        if (end < total && total > 9) {
          if (end < total - 1) html += '<span class="pg-num pg-dots">…</span>';
          html += '<a class="pg-num" href="' + pageUrl(total) + '">' + total + '</a>';
        }

        html += nextUrl
          ? '<a class="pg-edge" href="' + nextUrl + '" rel="next">下一页</a>'
          : '<span class="pg-edge off">下一页</span>';
        html += current >= total
          ? '<span class="pg-edge off">末页</span>'
          : '<a class="pg-edge" href="' + pageUrl(total) + '">末页</a>';
        pag.innerHTML = html;
      }
    }

    // 3. 分类页签高亮：与当前路径匹配的页签加 active
    var tabs = document.querySelectorAll('.cat-tabs a');
    if (tabs.length) {
      var curPath = location.pathname.replace(/\/+$/, '');
      for (var t = 0; t < tabs.length; t++) {
        var tu = '';
        try {
          tu = new URL(tabs[t].getAttribute('href'), location.href).pathname.replace(/\/+$/, '');
        } catch (e) {
          tu = '';
        }
        if (!tu) continue;
        if (curPath === tu || curPath.indexOf(tu + '/') === 0) tabs[t].classList.add('active');
      }
    }

    // 4. 菜单当前项：只取路径匹配最长的一项作为 active，首页仅精确匹配
    var navLinks = document.querySelectorAll('.nav a');
    var norm = function (p) { return p.replace(/\/index\.html$/, '').replace(/\/+$/, ''); };
    var cur = norm(location.pathname);
    var logo = document.querySelector('.header .logo');
    var homePath = '';
    if (logo) {
      try {
        homePath = norm(new URL(logo.getAttribute('href'), location.href).pathname);
      } catch (e) {
        homePath = '';
      }
    }
    var bestLi = null, bestLen = -1;
    for (var n = 0; n < navLinks.length; n++) {
      var nu = '';
      try {
        nu = norm(new URL(navLinks[n].getAttribute('href'), location.href).pathname);
      } catch (e) {
        nu = '';
      }
      var isActive = false;
      if (nu === cur) {
        isActive = true;
      } else if (nu && nu !== homePath && cur.indexOf(nu + '/') === 0) {
        isActive = true;
      }
      if (!isActive || nu.length <= bestLen) continue;
      var li = navLinks[n].parentNode;
      while (li && li.tagName !== 'LI' && li !== navRoot) li = li.parentNode;
      if (li && li.tagName === 'LI') {
        bestLen = nu.length;
        bestLi = li;
      }
    }
    if (bestLi) bestLi.classList.add('active');
  });
})();

// 灯光动画页：前端分页（12 个视频一页，样式与案例中心分页一致）
(function () {
  var grid = document.getElementById('videoGrid');
  var pager = document.getElementById('videoPagination');
  if (!grid || !pager) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.video-card'));
  var perPage = parseInt(pager.getAttribute('data-per-page') || '12', 10);
  var totalPages = Math.ceil(cards.length / perPage);
  if (totalPages < 2) return;

  var current = 1;

  function render() {
    var html = '';
    html += '<a class="pg-edge' + (current === 1 ? ' off' : '') + '" data-page="1">首页</a>';
    html += '<a class="pg-edge' + (current === 1 ? ' off' : '') + '" data-page="' + (current - 1) + '">上一页</a>';
    for (var p = 1; p <= totalPages; p++) {
      html += '<a class="pg-num' + (p === current ? ' cur' : '') + '" data-page="' + p + '">' + p + '</a>';
    }
    html += '<a class="pg-edge' + (current === totalPages ? ' off' : '') + '" data-page="' + (current + 1) + '">下一页</a>';
    html += '<a class="pg-edge' + (current === totalPages ? ' off' : '') + '" data-page="' + totalPages + '">末页</a>';
    pager.innerHTML = html;
  }

  function show(page) {
    current = page;
    cards.forEach(function (c, i) {
      c.style.display = (i >= (page - 1) * perPage && i < page * perPage) ? '' : 'none';
    });
    render();
    var top = grid.getBoundingClientRect().top + window.pageYOffset - 120;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  pager.addEventListener('click', function (e) {
    var t = e.target;
    while (t && t !== pager && !(t.tagName === 'A')) t = t.parentNode;
    if (!t || t.tagName !== 'A') return;
    if (t.classList && t.classList.contains('off')) return;
    e.preventDefault();
    var p = parseInt(t.getAttribute('data-page'), 10);
    if (p < 1 || p > totalPages || p === current) return;
    show(p);
  });

  show(1);
})();

// 灯光动画页：视频点击触发播放，默认不加载/不自动播放，避免整页视频同时播放造成混乱
(function () {
  var grid = document.getElementById('videoGrid');
  if (!grid) return;
  var cards = grid.querySelectorAll('.video-card');
  for (var i = 0; i < cards.length; i++) {
    (function (card) {
      var iframe = card.querySelector('iframe');
      if (!iframe) return;
      var src = iframe.getAttribute('src');
      if (!src || card.getAttribute('data-video-ready')) return;
      card.setAttribute('data-video-ready', '1');

      // 暂存原始地址并清空 src，阻止页面加载时自动播放/加载
      iframe.setAttribute('data-src', src);
      iframe.removeAttribute('src');

      var host = card.querySelector('.post__iframe') || card;
      host.style.position = 'relative';
      card.classList.add('video-pending');

      var trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'video-trigger';
      trigger.setAttribute('aria-label', '点击播放视频');
      trigger.innerHTML = '<span class="video-trigger__play"></span><span class="video-trigger__txt">点击播放</span>';

      trigger.addEventListener('click', function () {
        if (!iframe.getAttribute('src')) {
          var sep = src.indexOf('?') > -1 ? '&' : '?';
          iframe.setAttribute('src', src + sep + 'autoplay=1');
        }
        card.classList.remove('video-pending');
        card.classList.add('video-playing');
        trigger.style.display = 'none';
      });

      host.appendChild(trigger);
    })(cards[i]);
  }
})();
