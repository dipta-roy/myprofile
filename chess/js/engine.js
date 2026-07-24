/* 1KB Chess Engine & jQuery plugin wrapper */
function chessElem(t) {
	return document.getElementById('c' + t)
};
String.prototype.U = String.prototype.charCodeAt;
M = Math.random;
W = setTimeout;
X = 10;
Q = 15;
H = 1e4;
function F(r, E, f, c, w) {
	if (r < 9) {
		r ^= 8;
		for (var t, u, a, p, d, n = 20, m = -1e8, S = f && F(r) > H, q = 78 - c << 9, T = r ? X : -X, e, g, h, v, o, s; n++ < 98;)
			if ((u = I[t = n]) && (e = u & Q ^ r) < 7) {
				s = e-- & 2 ? 8 : 4;
				v = 9 - u & Q ? l[61 + e] : 49;
				do {
					o = I[t += l[v]];
					h = d = e | t + T - E ? 0 : E;
					if (!o && e | s < 3 | h || (1 + o & Q ^ r) > 9 && e | s > 2) {
						if (!(2 - o & 7))
							return q;
						for (p = g = e | I[t - T] - 7 ? u & Q : 6 ^ r; p; p = !p & !S && !(h = t, I[d = t < n ? h - 3 : h + 2] < Q | I[d + n - t] | I[t += t - n])) {
							a = (o && l[o & 7 | 32] * 2 - c - e) + (e ? 0 : g - u & Q ? 110 : (d && 14) + (s < 2) + 1);
							if (f > c || 1 < f & f == c && a > 2 | S) {
								I[t] = g, I[h] = I[d], I[n] = d ? I[d] = 0 : 0;
								a -= F(r, p = e | s > 1 ? 0 : t, f, c + 1, a - m);
								if (!(c | f - 1 | B - n | t - b | a < -H))
									return F(B = b), y = p, r && W('F(8,y,2,0),F(8,y,1,0)', n);
								p = 1 - e | s < 7 | d | !f | o | u < Q || F(r) > H;
								I[n] = u;
								I[t] = o;
								I[d] = I[h];
								d ? I[h] = e ? 0 : 9 ^ r : 0
							};
							if (a > m | !c & a == m & M() * 2)
								if (m = a, f > 1)
									if (c ? w < a : (B = n, b = t, 0))
										return m
						}
					}
				}
				while (!o & e > 2 || (t = n, e | s > 2 | Q < u & !o && ++v * --s))
			};
		return 768 - q < m | S && m
	};
	for (i = 20; i < 98; chessElem(i).innerHTML = '&#' + (I[i] & Q ? 9808 + l[67 + (I[i] & Q)] : 9) + ';')
		chessElem(i += i % X - 8 ? 1 : 3).lang = i - B
};
for (B = y = 0, I = [], l = [];
	B < 120;
	I[B++] = B % X ? B / X % X < 2 | B % X < 2 ? 7 : B / X & 4 ? 0 : l[y++] : 7)l[B] = 'ustvrtsuqqqqqqqqyyyyyyyy}{|~z|{}@G@TSb~?A6J57IKJT576,+-48HLSUmgukgg OJNMLK  IDHGFE'.U(B) - 64;
function randomString() {
	var e = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz', n = 8, t = '';
	for (var r = 0; r < n; r++) {
		var i = Math.floor(Math.random() * e.length);
		t += e.substring(i, i + 1)
	};
	return t;
}

function initChessBoard(target) {
	var container = (typeof target === 'string') ? document.querySelector(target) : (target || document.getElementById('game'));
	if (!container || container.querySelector('table.chessBoard')) return;
	
	var d = ['&#9820;', '&#9822;', '&#9821;', '&#9819;', '&#9818;', '&#9821;', '&#9822;', '&#9820;'],
		o = ['&#9814;', '&#9816;', '&#9815;', '&#9813;', '&#9812;', '&#9815;', '&#9816;', '&#9814;'];
	var r = '<table class="chessBoard"><tbody>';
	for (var i = 1; i < 9; i++) {
		r += '<tr>';
		for (var p = 0; p < 8; p++) {
			var n = ((i * 10) + 11) + p;
			var piece = (i == 1) ? d[p] : (i == 8) ? o[p] : (i == 2) ? '&#9823;' : (i == 7) ? '&#9817;' : '';
			r += '<td data-id="' + n + '" id="c' + n + '">' + piece + '</td>';
		}
		r += '</tr>';
	}
	r += '</tbody></table>';
	container.innerHTML = r;

	container.addEventListener('click', function (evt) {
		var td = evt.target.closest('td');
		if (td && td.getAttribute('data-id')) {
			var id = parseInt(td.getAttribute('data-id'), 10);
			I[b = id] & 8 ? F(B = b) : F(0, y, 1, 0);
		}
	});
}

if (typeof jQuery !== 'undefined') {
	(function (t) {
		t.fn.chess = function () {
			return this.each(function () {
				initChessBoard(this);
			});
		};
	})(jQuery);
}

document.addEventListener('DOMContentLoaded', function () {
	var gameElem = document.getElementById('game');
	if (gameElem && !gameElem.querySelector('table')) {
		initChessBoard(gameElem);
	}
});
window.initChessBoard = initChessBoard;

