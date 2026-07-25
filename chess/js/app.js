window.addEventListener('load', function () {
	// Ensure chess board table is created if it hasn't initialized yet
	if (typeof $ !== 'undefined' && $.fn && $.fn.chess && document.querySelectorAll('#game table').length === 0) {
		$('#game').chess();
	}

	var isGameOver = false;
	var lastBoardState = '';
	var lastBoardArray = null;
	var positionHistory = [];
	var staleCount = 0;
	var moveCount = 0;
	var fullMoveCount = 1;

	var WHITE_KING = '\u2654';
	var WHITE_QUEEN = '\u2655';
	var WHITE_ROOK = '\u2656';
	var WHITE_BISHOP = '\u2657';
	var WHITE_KNIGHT = '\u2658';
	var WHITE_PAWN = '\u2659';
	var BLACK_KING = '\u265A';
	var BLACK_QUEEN = '\u265B';
	var BLACK_ROOK = '\u265C';
	var BLACK_BISHOP = '\u265D';
	var BLACK_KNIGHT = '\u265E';
	var BLACK_PAWN = '\u265F';

	var whitePieces = [WHITE_KING, WHITE_QUEEN, WHITE_ROOK, WHITE_BISHOP, WHITE_KNIGHT, WHITE_PAWN];
	var blackPieces = [BLACK_KING, BLACK_QUEEN, BLACK_ROOK, BLACK_BISHOP, BLACK_KNIGHT, BLACK_PAWN];

	var initialPieces = {};
	initialPieces[WHITE_PAWN] = 8;
	initialPieces[WHITE_ROOK] = 2;
	initialPieces[WHITE_KNIGHT] = 2;
	initialPieces[WHITE_BISHOP] = 2;
	initialPieces[WHITE_QUEEN] = 1;
	initialPieces[WHITE_KING] = 1;
	initialPieces[BLACK_PAWN] = 8;
	initialPieces[BLACK_ROOK] = 2;
	initialPieces[BLACK_KNIGHT] = 2;
	initialPieces[BLACK_BISHOP] = 2;
	initialPieces[BLACK_QUEEN] = 1;
	initialPieces[BLACK_KING] = 1;

	// Parse the board into an 8x8 grid
	function parseBoard(cells) {
		var board = [];
		for (var r = 0; r < 8; r++) {
			board[r] = [];
			for (var c = 0; c < 8; c++) {
				var txt = cells[r * 8 + c].textContent.trim();
				board[r][c] = txt || '';
			}
		}
		return board;
	}

	function isWhite(p) { return whitePieces.indexOf(p) !== -1; }
	function isBlack(p) { return blackPieces.indexOf(p) !== -1; }
	function inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

	// Check if a square is attacked by a given color
	function isAttackedBy(board, row, col, byWhite) {
		var r, c, dr, dc, d;
		// Knight attacks
		var knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
		var knight = byWhite ? WHITE_KNIGHT : BLACK_KNIGHT;
		for (d = 0; d < knightMoves.length; d++) {
			r = row + knightMoves[d][0]; c = col + knightMoves[d][1];
			if (inBounds(r, c) && board[r][c] === knight) return true;
		}

		// Pawn attacks (to attack (row,col), a White pawn must be at row+1, Black pawn at row-1)
		if (byWhite) {
			if (inBounds(row + 1, col - 1) && board[row + 1][col - 1] === WHITE_PAWN) return true;
			if (inBounds(row + 1, col + 1) && board[row + 1][col + 1] === WHITE_PAWN) return true;
		} else {
			if (inBounds(row - 1, col - 1) && board[row - 1][col - 1] === BLACK_PAWN) return true;
			if (inBounds(row - 1, col + 1) && board[row - 1][col + 1] === BLACK_PAWN) return true;
		}

		// King attacks (adjacent squares)
		var king = byWhite ? WHITE_KING : BLACK_KING;
		for (dr = -1; dr <= 1; dr++) {
			for (dc = -1; dc <= 1; dc++) {
				if (dr === 0 && dc === 0) continue;
				r = row + dr; c = col + dc;
				if (inBounds(r, c) && board[r][c] === king) return true;
			}
		}

		// Sliding pieces: Rook/Queen on straights, Bishop/Queen on diagonals
		var rook = byWhite ? WHITE_ROOK : BLACK_ROOK;
		var queen = byWhite ? WHITE_QUEEN : BLACK_QUEEN;
		var bishop = byWhite ? WHITE_BISHOP : BLACK_BISHOP;

		// Straight lines
		var straights = [[0, 1], [0, -1], [1, 0], [-1, 0]];
		for (d = 0; d < straights.length; d++) {
			dr = straights[d][0]; dc = straights[d][1];
			r = row + dr; c = col + dc;
			while (inBounds(r, c)) {
				if (board[r][c] !== '') {
					if (board[r][c] === rook || board[r][c] === queen) return true;
					break;
				}
				r += dr; c += dc;
			}
		}

		// Diagonals
		var diags = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
		for (d = 0; d < diags.length; d++) {
			dr = diags[d][0]; dc = diags[d][1];
			r = row + dr; c = col + dc;
			while (inBounds(r, c)) {
				if (board[r][c] !== '') {
					if (board[r][c] === bishop || board[r][c] === queen) return true;
					break;
				}
				r += dr; c += dc;
			}
		}

		return false;
	}

	function findKing(board, kingChar) {
		for (var r = 0; r < 8; r++)
			for (var c = 0; c < 8; c++)
				if (board[r][c] === kingChar) return { r: r, c: c };
		return null;
	}

	function hasAnyLegalMoves(board, forWhite) {
		for (var r = 0; r < 8; r++) {
			for (var c = 0; c < 8; c++) {
				var piece = board[r][c];
				if (piece === '') continue;
				if (forWhite ? isWhite(piece) : isBlack(piece)) {
					var moves = getLegalMoves(board, r, c);
					if (moves.length > 0) return true;
				}
			}
		}
		return false;
	}

	function isInsufficientMaterial(cleanPieces) {
		if (cleanPieces.length <= 2) return true; // Only Kings left
		if (cleanPieces.length === 3) {
			if (cleanPieces.indexOf(WHITE_BISHOP) !== -1 || cleanPieces.indexOf(BLACK_BISHOP) !== -1 ||
				cleanPieces.indexOf(WHITE_KNIGHT) !== -1 || cleanPieces.indexOf(BLACK_KNIGHT) !== -1) {
				return true;
			}
		}
		return false;
	}

	// Rigorous checkmate detection
	function isCheckmate(board, kingIsWhite) {
		var king = kingIsWhite ? WHITE_KING : BLACK_KING;
		var attackedByWhite = !kingIsWhite;
		var pos = findKing(board, king);
		if (!pos) return false;

		// Is the king currently in check?
		if (!isAttackedBy(board, pos.r, pos.c, attackedByWhite)) return false;

		// Can ANY friendly piece make a legal move that escapes the check?
		for (var r = 0; r < 8; r++) {
			for (var c = 0; c < 8; c++) {
				var piece = board[r][c];
				if (piece === '') continue;
				if (kingIsWhite ? isWhite(piece) : isBlack(piece)) {
					var moves = getLegalMoves(board, r, c);
					for (var m = 0; m < moves.length; m++) {
						var move = moves[m];
						
						// Simulate move
						var clonedBoard = [];
						for (var i = 0; i < 8; i++) clonedBoard[i] = board[i].slice();
						clonedBoard[move.r][move.c] = piece;
						clonedBoard[r][c] = '';
						
						var newPos = findKing(clonedBoard, king);
						if (newPos && !isAttackedBy(clonedBoard, newPos.r, newPos.c, attackedByWhite)) {
							return false; // Found a valid escape/block/capture!
						}
					}
				}
			}
		}
		
		return true; // No moves left, king is checkmated
	}

	function showGameOver(msg) {
		isGameOver = true;
		var popup = document.getElementById('gameOverPopup');
		document.getElementById('gameOverMessage').textContent = msg;
		document.getElementById('gameOverSubtext').textContent = 'Game Over';
		popup.style.display = 'flex';
	}

	function checkBoardState() {
		if (isGameOver) return;

		var table = document.querySelector('#game table');
		if (!table) return;

		var cells = table.querySelectorAll('td');
		if (cells.length < 64) return;

		// Collect piece characters (use '.' for empty squares so any board movement changes the string)
		var boardPieces = '';
		for (var i = 0; i < cells.length; i++) {
			var txt = cells[i].textContent.trim();
			boardPieces += (txt || '.');
		}
		if (boardPieces.length < 64) return;

		// Detect board changes for stalemate detection and move history
		if (boardPieces === lastBoardState) {
			staleCount++;
		} else {
			var board = parseBoard(cells);
			if (lastBoardState !== '' && lastBoardArray) {
				moveCount++;

				// Calculate what moved
				var movedPiece = '';
				var fromSq = '';
				var toSq = '';
				var isCapture = false;
				var pieceColor = 'w';

				for (var r = 0; r < 8; r++) {
					for (var c = 0; c < 8; c++) {
						if (board[r][c] !== lastBoardArray[r][c]) {
							var oldP = lastBoardArray[r][c];
							var newP = board[r][c];

							// FROM square: the piece left this square (it is now empty)
							if (oldP !== '' && newP === '') {
								fromSq = String.fromCharCode(97 + c) + (8 - r);
								movedPiece = oldP;
								pieceColor = isWhite(oldP) ? 'w' : 'b';
							}
							// TO square: the piece arrived at this square
							if (newP !== '') {
								toSq = String.fromCharCode(97 + c) + (8 - r);
								if (oldP !== '') isCapture = true;
							}
						}
					}
				}

				if (fromSq && toSq) {
					var moveStr = movedPiece + (isCapture ? 'x' : '') + toSq;

					// Castling Notation
					if ((movedPiece === WHITE_KING || movedPiece === BLACK_KING) && Math.abs(fromSq.charCodeAt(0) - toSq.charCodeAt(0)) === 2) {
						moveStr = (toSq.charAt(0) === 'g') ? 'O-O' : 'O-O-O';
					}

					var historyList = document.getElementById('moveHistoryList');
					if (pieceColor === 'w') {
						var row = document.createElement('div');
						row.style.display = 'flex';
						row.style.justifyContent = 'space-between';
						row.style.padding = '4px 8px';
						row.style.borderRadius = '6px';
						row.style.background = 'rgba(255, 255, 255, 0.3)';
						row.id = 'move-row-' + fullMoveCount;

						row.innerHTML = '<span style="opacity:0.5;width:25px;font-weight:bold;">' + fullMoveCount + '.</span>' +
							'<span style="flex:1;text-align:left;font-family:\'Noto Sans Symbols 2\',\'Noto Sans Symbols\',\'Segoe UI Symbol\',sans-serif;">' + moveStr + '</span>' +
							'<span class="black-move" style="flex:1;text-align:left;font-family:\'Noto Sans Symbols 2\',\'Noto Sans Symbols\',\'Segoe UI Symbol\',sans-serif;"></span>';
						historyList.appendChild(row);
					} else {
						var row = document.getElementById('move-row-' + fullMoveCount);
						if (row) {
							var blackSpan = row.querySelector('.black-move');
							if (blackSpan) blackSpan.innerHTML = moveStr;
						}
						fullMoveCount++;
					}
					historyList.scrollTop = historyList.scrollHeight;
				}
			}
			staleCount = 0;
			lastBoardState = boardPieces;
			lastBoardArray = board;
			positionHistory.push(boardPieces);

			// Always wipe move highlights on any board state change
			for (var ci = 0; ci < cells.length; ci++) {
				cells[ci].classList.remove('move-highlight', 'capture-highlight');
			}
		}

		// King capture detection
		var hasWhiteKing = boardPieces.indexOf(WHITE_KING) !== -1;
		var hasBlackKing = boardPieces.indexOf(BLACK_KING) !== -1;

		if (!hasWhiteKing) { showGameOver('Black Wins!'); }
		if (!hasBlackKing) { showGameOver('White Wins!'); }

		// Checkmate & Draw / Stalemate Detection (only after at least 2 moves)
		if (!isGameOver && moveCount >= 2) {
			var board = parseBoard(cells);
			if (isCheckmate(board, true)) {
				showGameOver('Black Wins by Checkmate!');
				return;
			} else if (isCheckmate(board, false)) {
				showGameOver('White Wins by Checkmate!');
				return;
			}

			var cleanPieces = boardPieces.replace(/\./g, '');

			// 1. Insufficient Material Draw
			if (isInsufficientMaterial(cleanPieces)) {
				showGameOver('Draw by Insufficient Material!');
				return;
			}

			// 2. Threefold Repetition Draw
			var repCount = 0;
			for (var p = 0; p < positionHistory.length; p++) {
				if (positionHistory[p] === boardPieces) repCount++;
			}
			if (repCount >= 3) {
				showGameOver('Draw by Threefold Repetition!');
				return;
			}

			// 3. Stalemate (No legal moves left, but King is NOT in check)
			var wKing = findKing(board, WHITE_KING);
			if (wKing && !isAttackedBy(board, wKing.r, wKing.c, false) && !hasAnyLegalMoves(board, true)) {
				showGameOver('Stalemate! Game Draw!');
				return;
			}
			var bKing = findKing(board, BLACK_KING);
			if (bKing && !isAttackedBy(board, bKing.r, bKing.c, true) && !hasAnyLegalMoves(board, false)) {
				showGameOver('Stalemate! Game Draw!');
				return;
			}

			// 4. 50-Move Inactivity Draw
			if (staleCount >= 100) {
				showGameOver('Draw by 50-Move Rule!');
				return;
			}
		}

		// Track Captured Pieces
		var currentCounts = {};
		for (var j = 0; j < boardPieces.length; j++) {
			var ch = boardPieces[j];
			if (initialPieces[ch] !== undefined) {
				currentCounts[ch] = (currentCounts[ch] || 0) + 1;
			}
		}

		var capturedWhiteHtml = '';
		var capturedBlackHtml = '';

		for (var piece in initialPieces) {
			var initial = initialPieces[piece];
			var current = currentCounts[piece] || 0;
			var captured = initial - current;

			for (var k = 0; k < captured; k++) {
				if (whitePieces.indexOf(piece) !== -1) {
					capturedWhiteHtml += '<span style="text-shadow: 0 1px 3px rgba(0,0,0,0.2);">' + piece + '</span>';
				} else {
					capturedBlackHtml += '<span style="text-shadow: 0 1px 3px rgba(0,0,0,0.2);">' + piece + '</span>';
				}
			}
		}

		document.getElementById('capturedPieces').innerHTML = capturedWhiteHtml + capturedBlackHtml;
	}

	// --- Legal Move Highlighting & Pin Validation ---
	function getPseudoLegalMoves(board, row, col) {
		var piece = board[row][col];
		if (!piece) return [];
		var moves = [];
		var pw = isWhite(piece);

		function tryAdd(r, c) {
			if (!inBounds(r, c)) return false;
			var t = board[r][c];
			if (pw && isWhite(t)) return false;
			if (!pw && isBlack(t)) return false;
			var cap = t !== '';
			moves.push({ r: r, c: c, cap: cap });
			return !cap;
		}

		function slide(dr, dc) {
			var r = row + dr, c = col + dc;
			while (inBounds(r, c)) {
				var t = board[r][c];
				if (pw && isWhite(t)) break;
				if (!pw && isBlack(t)) break;
				var cap = t !== '';
				moves.push({ r: r, c: c, cap: cap });
				if (cap) break;
				r += dr; c += dc;
			}
		}

		// Pawn
		if (piece === WHITE_PAWN) {
			if (inBounds(row - 1, col) && board[row - 1][col] === '') {
				moves.push({ r: row - 1, c: col, cap: false });
				if (row === 6 && board[row - 2][col] === '')
					moves.push({ r: row - 2, c: col, cap: false });
			}
			if (inBounds(row - 1, col - 1) && isBlack(board[row - 1][col - 1]))
				moves.push({ r: row - 1, c: col - 1, cap: true });
			if (inBounds(row - 1, col + 1) && isBlack(board[row - 1][col + 1]))
				moves.push({ r: row - 1, c: col + 1, cap: true });
		} else if (piece === BLACK_PAWN) {
			if (inBounds(row + 1, col) && board[row + 1][col] === '') {
				moves.push({ r: row + 1, c: col, cap: false });
				if (row === 1 && board[row + 2][col] === '')
					moves.push({ r: row + 2, c: col, cap: false });
			}
			if (inBounds(row + 1, col - 1) && isWhite(board[row + 1][col - 1]))
				moves.push({ r: row + 1, c: col - 1, cap: true });
			if (inBounds(row + 1, col + 1) && isWhite(board[row + 1][col + 1]))
				moves.push({ r: row + 1, c: col + 1, cap: true });
		}
		// Knight
		else if (piece === WHITE_KNIGHT || piece === BLACK_KNIGHT) {
			var km = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
			for (var i = 0; i < km.length; i++) tryAdd(row + km[i][0], col + km[i][1]);
		}
		// Bishop
		else if (piece === WHITE_BISHOP || piece === BLACK_BISHOP) {
			slide(1, 1); slide(1, -1); slide(-1, 1); slide(-1, -1);
		}
		// Rook
		else if (piece === WHITE_ROOK || piece === BLACK_ROOK) {
			slide(0, 1); slide(0, -1); slide(1, 0); slide(-1, 0);
		}
		// Queen
		else if (piece === WHITE_QUEEN || piece === BLACK_QUEEN) {
			slide(0, 1); slide(0, -1); slide(1, 0); slide(-1, 0);
			slide(1, 1); slide(1, -1); slide(-1, 1); slide(-1, -1);
		}
		// King
		else if (piece === WHITE_KING || piece === BLACK_KING) {
			for (var dr = -1; dr <= 1; dr++)
				for (var dc = -1; dc <= 1; dc++)
					if (dr !== 0 || dc !== 0) tryAdd(row + dr, col + dc);

			// Castling Suggestions
			if (pw && row === 7 && col === 4) { // White King at e1
				// Kingside (O-O)
				if (board[7][7] === WHITE_ROOK && board[7][5] === '' && board[7][6] === '') {
					if (!isAttackedBy(board, 7, 4, false) && !isAttackedBy(board, 7, 5, false) && !isAttackedBy(board, 7, 6, false)) {
						moves.push({ r: 7, c: 6, cap: false, isCastle: 'K' });
					}
				}
				// Queenside (O-O-O)
				if (board[7][0] === WHITE_ROOK && board[7][1] === '' && board[7][2] === '' && board[7][3] === '') {
					if (!isAttackedBy(board, 7, 4, false) && !isAttackedBy(board, 7, 3, false) && !isAttackedBy(board, 7, 2, false)) {
						moves.push({ r: 7, c: 2, cap: false, isCastle: 'Q' });
					}
				}
			}
		}

		return moves;
	}

	function getLegalMoves(board, row, col) {
		var piece = board[row][col];
		if (!piece) return [];
		var pw = isWhite(piece);
		var kingChar = pw ? WHITE_KING : BLACK_KING;
		var enemyColor = !pw;

		var pseudo = getPseudoLegalMoves(board, row, col);
		var legal = [];

		for (var i = 0; i < pseudo.length; i++) {
			var m = pseudo[i];
			// Simulate move on a cloned board
			var cloned = [];
			for (var r = 0; r < 8; r++) cloned[r] = board[r].slice();
			cloned[m.r][m.c] = piece;
			cloned[row][col] = '';

			if (m.isCastle === 'K') {
				cloned[row][5] = cloned[row][7];
				cloned[row][7] = '';
			} else if (m.isCastle === 'Q') {
				cloned[row][3] = cloned[row][0];
				cloned[row][0] = '';
			}

			var kpos = findKing(cloned, kingChar);
			if (kpos && !isAttackedBy(cloned, kpos.r, kpos.c, enemyColor)) {
				legal.push(m);
			}
		}
		return legal;
	}

	function highlightMoves() {
		var table = document.querySelector('#game table');
		if (!table) return;
		var cells = table.querySelectorAll('td');
		if (cells.length < 64) return;

		// Clear old highlights
		for (var i = 0; i < cells.length; i++) {
			cells[i].classList.remove('move-highlight', 'capture-highlight');
		}

		// Find selected cell (lang="0")
		var selectedCell = table.querySelector('td[lang="0"]');
		if (!selectedCell) return;

		// Find its row/col index
		var selIdx = -1;
		for (var j = 0; j < cells.length; j++) {
			if (cells[j] === selectedCell) { selIdx = j; break; }
		}
		if (selIdx < 0) return;

		var selRow = Math.floor(selIdx / 8);
		var selCol = selIdx % 8;

		// Parse board and get moves
		var board = parseBoard(cells);
		var piece = board[selRow][selCol];

		// Only show highlights for the player's (White) pieces
		if (!isWhite(piece)) return;

		var moves = getLegalMoves(board, selRow, selCol);

		// Apply highlights
		for (var m = 0; m < moves.length; m++) {
			var idx = moves[m].r * 8 + moves[m].c;
			if (idx >= 0 && idx < cells.length) {
				cells[idx].classList.add(moves[m].cap ? 'capture-highlight' : 'move-highlight');
			}
		}
	}

	// Respond to clicks instantly (engine rebuilds DOM, then we highlight)
	var gameEl = document.getElementById('game');
	if (gameEl) {
		gameEl.addEventListener('click', function (e) {
			// Ignore simulated clicks from the computer AI
			if (e && !e.isTrusted) return;

			// Intercept Castling moves for White King (e1 -> g1 or c1)
			var targetTd = e.target ? e.target.closest('td') : null;
			var selectedCell = document.querySelector('#game td[lang="0"]');
			if (selectedCell && targetTd) {
				var selId = selectedCell.getAttribute('data-id');
				var clickedId = targetTd.getAttribute('data-id');

				if (selId === '95') { // White King at e1
					if (clickedId === '97') { // g1 - Kingside Castle
						e.stopPropagation();
						I[97] = I[95]; I[95] = 0;
						I[96] = I[98]; I[98] = 0;
						var c95 = document.getElementById('c95'); if (c95) c95.innerHTML = '&#9;';
						var c97 = document.getElementById('c97'); if (c97) c97.innerHTML = '&#9812;';
						var c98 = document.getElementById('c98'); if (c98) c98.innerHTML = '&#9;';
						var c96 = document.getElementById('c96'); if (c96) c96.innerHTML = '&#9814;';
						setTimeout(function () { F(0, y, 1, 0); }, 50);
						return;
					} else if (clickedId === '93') { // c1 - Queenside Castle
						e.stopPropagation();
						I[93] = I[95]; I[95] = 0;
						I[94] = I[91]; I[91] = 0;
						var c95 = document.getElementById('c95'); if (c95) c95.innerHTML = '&#9;';
						var c93 = document.getElementById('c93'); if (c93) c93.innerHTML = '&#9812;';
						var c91 = document.getElementById('c91'); if (c91) c91.innerHTML = '&#9;';
						var c94 = document.getElementById('c94'); if (c94) c94.innerHTML = '&#9814;';
						setTimeout(function () { F(0, y, 1, 0); }, 50);
						return;
					}
				}
			}

			// Capture board state synchronously BEFORE any move processing occurs
			var stateAtClick = lastBoardState;

			setTimeout(function () {
				var table = document.querySelector('#game table');
				if (!table) return;
				var cells = table.querySelectorAll('td');

				// Immediately clear any existing highlights on every click
				for (var i = 0; i < cells.length; i++) {
					cells[i].classList.remove('move-highlight', 'capture-highlight');
				}

				var currentPieces = '';
				for (var i = 0; i < cells.length; i++) {
					var txt = cells[i].textContent.trim();
					currentPieces += (txt || '.');
				}
				// If board state changed relative to click time, a move occurred (do not highlight)
				if (currentPieces !== stateAtClick) {
					return;
				}
				highlightMoves();
			}, 50);
		});
	}

	// Use MutationObserver with debouncing (clearTimeout) to wait until all 64 squares finish updating
	// This prevents evaluating intermediate half-updated boards while the engine loops through the squares
	var checkDebounceTimer = null;
	var observer = new MutationObserver(function (mutations) {
		if (checkDebounceTimer) clearTimeout(checkDebounceTimer);
		checkDebounceTimer = setTimeout(checkBoardState, 30);
	});

	var gameContainer = document.getElementById('game');
	if (gameContainer) {
		observer.observe(gameContainer, { childList: true, subtree: true, characterData: true });
	}

	// Initial check
	setTimeout(checkBoardState, 1000);
});
