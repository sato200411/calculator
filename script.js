class CalcNumber {
    constructor(number = '0', previousNumber = null) {
        this.previousNumber = previousNumber; // 前の数値（演算の左辺）
        this.number = number;                 // 現在の数値（演算の右辺）
    }

    // 数値を指定の桁数（デフォルト10桁）で丸める
    round(number, digits = 10) {
        const factor = Math.pow(10, digits);
        return Math.round(parseFloat(number) * factor) / factor;
    }

    // 足し算
    add() {
        const total = parseFloat(this.previousNumber) + parseFloat(this.number);
           if (isNaN(total)) {
                this.setNumber('Error');
            } else {
                this.setNumber(String(this.round(total)));
            }
    }

    // 引き算
    sub() {
        const total = parseFloat(this.previousNumber) - parseFloat(this.number);
            if (isNaN(total)) {
                this.setNumber('Error');
            } else {
                this.setNumber(String(this.round(total)));
            }
    }

    // 掛け算
    multiply() {
        const total = parseFloat(this.previousNumber) * parseFloat(this.number);
            if (isNaN(total)) {
                this.setNumber('Error');
            } else {
                this.setNumber(String(this.round(total)));
            }
    }

    // 割り算
    divide() {
        const divisor = parseFloat(this.number);
        if (divisor === 0 || isNaN(divisor)) {
            this.setNumber('Error'); // 0除算や無効な数値ならエラー
        } else {
            const total = parseFloat(this.previousNumber) / divisor;
            if (isNaN(total) || !isFinite(total)) {
                this.setNumber('Error');
            } else {
                this.setNumber(String(this.round(total)));
            }
        }
    }

    // 全リセット（0とnullに戻す）
    reset() {
        this.number = '0';
        this.previousNumber = null;
        this.setScreen();
    }

    // 数字を後ろに追加
    addstring(number) {
        this.number += number;
        this.setScreen();
    }

    // 最後の文字を1文字削除（←処理）
    substring() {
        if (this.number.length === 1 || this.number === '-')
            this.number = '0';
        else
            this.number = this.number.slice(0, -1);
        this.setScreen();
    }

    // 数値を直接設定
    set(number) {
        this.number = number;
        this.setScreen();
    }

    // 数値を設定して画面を更新
    setNumber(value) {
        this.number = value;
        this.setScreen();
    }

    // 画面に式（currentExpression）を表示
    setScreen() {
        document.querySelector('.screen').value = currentExpression;
    }

    // 現在の数値を取得
    get() {
        return this.number;
    }

    // 現在の数値を previousNumber に保存し、number を空に
    setPreviousNumber() {
        if (this.number !== 'Error') {
            this.previousNumber = this.number;
            this.number = '';
        }
    }

    // 計算処理（現在の演算子に応じて）
    calc(symb) {
        if (!symb || this.previousNumber === null) return;

        const prev = parseFloat(this.previousNumber);
        const curr = parseFloat(this.number);
        if (!isFinite(prev) || !isFinite(curr)) {
            this.setNumber('Error');
            return;
        }

        // 演算子に応じた処理を実行
        switch (symb) {
            case '+': this.add(); break;
            case '-': this.sub(); break;
            case '×': this.multiply(); break;
            case '÷': this.divide(); break;
        }
    }
}

class Symb {
    constructor(symbol = null) {
        this.symbol = symbol; // 演算子（+ - × ÷）
    }

    // 演算子をクリア
    reset() {
        this.symbol = null;
    }

    // 演算子をセット
    set(symbol) {
        this.symbol = symbol;
    }

    // 演算子を取得
    get() {
        return this.symbol;
    }
}

// --- 初期化処理 ---
const number = new CalcNumber(); // 数値管理クラス
const symb = new Symb();         // 演算子管理クラス
let currentExpression = '';      // 式（画面に表示する内容）

// ボタンクリック時の処理
function buttonClick(value) {
    if (value === '−') value = '-'; // 負号（全角）を半角に変換

    if (isNaN(value) && value !== '.') {
        handleSymbol(value); // 演算子や記号の処理
    } else {
        handleNumber(value); // 数字と小数点の処理
    }
    updateExpression(); // 画面更新
}

// 記号ボタン（C, =, ←, + - × ÷）が押されたときの処理
function handleSymbol(symbol) {
    switch (symbol) {
        case 'C':
            number.reset();
            symb.reset();
            currentExpression = '';
            break;

        case '=':
            number.calc(symb.get());
            symb.reset();

            if (number.get() !== 'Error') {
                number.previousNumber = null;
                number.set(number.get());
            }

            currentExpression = number.get();
            updateExpression();
            break;

        case '←':
            number.substring();
            currentExpression = currentExpression.slice(0, -1);
            updateExpression();
            break;

        case '+':
        case '-':
        case '×':
        case '÷':
            // 入力が空のとき、マイナスのみ許可
            if (currentExpression === '' && symbol === '-') {
                number.set('-');
                currentExpression = '-';
                updateExpression();
                return;
            }

            // 入力が空、かつ '-' 以外の演算子は無視
            if (currentExpression === '') return;

            // ----- 重要： ×- → - に置き換え（演算子変更） -----
            if (/[+\-×÷]-$/.test(currentExpression)) {
                // 例：「6×-」→「6-」に置き換える（記号2つを削除して - を追加）
                currentExpression = currentExpression.slice(0, -2) + symbol;
                symb.set(symbol);

                // number.number が "-..." ならその "-" を削除して状態を修正
                if (number.get().startsWith('-')) {
                    number.set(number.get().slice(1));  // 例："-3" → "3"
                }

                updateExpression();
                return;
            }

            // 直前が演算子だったら（例：6+）、場合によって処理
            if (/[+\-×÷]$/.test(currentExpression)) {
                if (symbol === '-') {
                    currentExpression += '-';
                    number.addstring('-');
                    updateExpression();
                    return;
                } else {
                    // 例：6+ を 6× に変更
                    currentExpression = currentExpression.slice(0, -1) + symbol;
                    symb.set(symbol);
                    updateExpression();
                    return;
                }
            }

            // 通常の演算子処理
            if (symb.get() && number.previousNumber !== null) {
                number.calc(symb.get());

                if (number.get() === 'Error') {
                    symb.reset();
                    return;
                }

                currentExpression = number.get();
            }

            currentExpression += symbol;
            number.setPreviousNumber();
            symb.set(symbol);
            updateExpression();
            break;
    }
}

// 数字や小数点が押されたときの処理
function handleNumber(value) {
    // 小数点がすでにある場合は無視
    if (value === '.' && number.get().includes('.')) return;

    // マイナスの重複を防止
    if (value === '-' && (number.get() === '-' || number.get() === '0')) return;

    // エラー状態からの復帰
    if (number.get() === 'Error') {
        number.set('0');
        currentExpression = '';
    }

    // 0 または空のときは上書き、それ以外は追加
    if (number.get() === '0' || number.get() === '') {
        number.set(value);
    } else {
        number.addstring(value);
    }


    currentExpression += value; // 式に数値を追加
}

// 画面に currentExpression を表示
function updateExpression() {
    document.querySelector('.screen').value = currentExpression;
}

// ボタン全体にイベントを登録
document.querySelectorAll('.buttons button').forEach(btn => {
    btn.addEventListener('click', function () {
        buttonClick(this.value);
    });
});
