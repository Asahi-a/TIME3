//注意！！！！べき乗の記号は^ではなく**を用いること！！！！長らく解決しなかったバグの原因がこれでした！！！！！！！！！！！！！！！！...てか前バージョンのときもべき乗周りがバグってたからかVh*Vhみたいにしてて草()

(function V5multi() {

//計算関数
function calc({ Ak, Ag, Vd, K, Fr, Vs, Vh, Vf, Xe, S, Xe15, Xesum, NorK, Xgbef }) {

    //基本的なパラメータ
    var Tk;//加速時間
    var Tg;//減速時間
    var Xk;//加速距離
    var Xg;//減速距離

    //等躍度運動近似加速度自動補正システムに必要なパラメータ
    var J;//躍度(加加速度)
    var A0;//加速度に係る定数
    var T0s;//停車状態から初速度まで加速する場合の時間
    var T0h;//停車状態から最高速度まで加速する場合の時間
    var Vl;//躍度と勾配によってこれ以上加速ができなくなる速度

    //その他
    var Ts;//駅間所要時間
    var Tss;//Tssはver3.1バグ回避用
    var kusomusi = 0;//空走無視をするかどうか(するなら1,しないなら0)
    var Agr;//空走無視補正もしくは勾配補正後の実質減速度
    var Err = 0;

    //数値取得

    //未入力判定
    if (Ak == "" || Ag == "" || Vs == "" || Vf == "" || Vh == "" || Vd == "" || Xe == "" || S == "" || K == "" || Fr == "") {
        Err = 6;
    } else {

        //入力値の数値化(未入力判定の前にやると0のとき未入力となってしまう)
        Ak = parseFloat(Ak);
        Ag = parseFloat(Ag);
        Vs = parseFloat(Vs);
        Vf = parseFloat(Vf);
        Vh = parseFloat(Vh);
        Vd = parseFloat(Vd);
        Xe = parseFloat(Xe);
        S = parseFloat(S);
        K = parseFloat(K);
        Fr = parseFloat(Fr);

        //下りの計算の時は勾配の値を反転
        if (NorK == 0) {
            S = -1 * S;
        }


        //入力値の単位をm,sに換算
        Ak = Ak / 3.6;
        Ag = Ag / 3.6;
        Vs = Vs / 3.6;
        Vf = Vf / 3.6;
        Vd = Vd / 3.6;
        Vh = Vh / 3.6;

        //設計最高速度より大きな入力がないか判定(Ver4.0以前のErr1を廃止しこちらに置き換え)
        if (Vd < Vs || Vd < Vf || Vd < Vh) {
            Err = 1;
        }

        //最高速度より大きな入力がないか判定
        if (Vh < Vs || Vh < Vf) {
            Err = 3;
        }

        //勾配が急すぎないか判定
        if ((-3.6 * Ak + (S / K)) >= 0) {
            Err = 4;
        }
        if ((3.6 * Ag + (S / K)) <= 0) {
            Err = 5;
        }

        //加速できる最高速度が勾配により低い時の処理
        A0 = Ak - (S / (3.6 * K));
        J = - ((Ak ** 2) / (2 * (Vd + 4)));
        Vl = - (A0 ** 2) / (2 * J);  //(J / 2) * ((-A0 / J) ^ 2) + A0 * (-A0 / J);
        if (Vl < Vf && Vs < Vf) {
            Err = 7;
        } else if (Vl < Vs) {
            Vh = Vs;
        } else if (Vl < Vh) {
            Vh = Vl - 0.001;//ぴったりにしてしまうと加速度0の点を計算に含んでしまいバグるため
        }

        //計算開始
        if (Err !== 1 && Err !== 3 && Err !== 4 && Err !== 5 && Err !== 6 && Err !== 7) {

            //最高速度自動切り下げシステムに必要なパラメータを計算
            //加速距離
            if (Vs == Vh) {
                Xk = 0;//勾配が強い場合普通に計算すると値が出ず最終的に惰行距離の算出に影響が出る
                T0s = 0;
                T0h = 0;//T0s及びT0hはグラフ描画に必要のため
            } else {
                T0h = ((- A0) + Math.sqrt((A0 ** 2) + (2 * J * Vh))) / J;
                T0s = ((- A0) + Math.sqrt((A0 ** 2) + (2 * J * Vs))) / J;
                Xk = (J / 6) * (T0h ** 3 - T0s ** 3) + (A0 / 2) * (T0h ** 2 - T0s ** 2);
            }
            //減速距離
            if (Vf == Vh) {
                Xg = 0;
            } else {
                Xg = (Vf ** 2 - Vh ** 2) / (-2 * (Ag + (S / (3.6 * K)))) + (Vh * Fr);
            }

            //切り下げ開始
            while (Xk + Xg > Xe && Err !== 2) {
                Vh = Vh - 0.01;

                //切り下げ過ぎの時
                if (Vh < Vs || Vh < Vf) {
                    if (Vs >= Vf) {
                        Vh = Vs;
                    } else {
                        Vh = Vf;
                    }

                    //加減速距離の再計算
                    if (Vs == Vh) {
                        Xk = 0;//勾配が強い場合普通に計算すると値が出ず最終的に惰行距離の算出に影響が出る
                        T0s = 0;
                        T0h = 0;
                    } else {
                        T0h = ((- A0) + Math.sqrt((A0 ** 2) + (2 * J * Vh))) / J;
                        T0s = ((- A0) + Math.sqrt((A0 ** 2) + (2 * J * Vs))) / J;
                        Xk = (J / 6) * (T0h ** 3 - T0s ** 3) + (A0 / 2) * (T0h ** 2 - T0s ** 2);
                    }
                    if (Vf == Vh) {
                        Xg = 0;
                    } else {
                        Xg = (Vf ** 2 - Vh ** 2) / (-2 * (Ag + (S / (3.6 * K)))) + (Vh * Fr);
                    }

                    //それでも無理な場合はエラー
                    if (Xk + Xg > Xe) {
                        Err = 2;
                    }
                } else {
                    //切り下げ過ぎでないとき    
                    //加減速距離の再計算
                    if (Vs == Vh) {
                        Xk = 0;//勾配が強い場合普通に計算すると値が出ず最終的に惰行距離の算出に影響が出る
                        T0s = 0;
                        T0h = 0;
                    } else {
                        T0h = ((- A0) + Math.sqrt((A0 ** 2) + (2 * J * Vh))) / J;
                        T0s = ((- A0) + Math.sqrt((A0 ** 2) + (2 * J * Vs))) / J;
                        Xk = (J / 6) * (T0h ** 3 - T0s ** 3) + (A0 / 2) * (T0h ** 2 - T0s ** 2);
                    }
                    if (Vf == Vh) {
                        Xg = 0;
                    } else {
                        Xg = (Vf ** 2 - Vh ** 2) / (-2 * (Ag + (S / (3.6 * K)))) + (Vh * Fr);
                    }
                }
            }

            //Err2(終速度達成不可)のとき、空走無視をすれば終速度まで達成できる場合がある
            if (Err == 2 && Xgbef > 0) {//空走無視は前の区間で減速が行われている場合のみ許容される
                Fr = 0;//空走0とする
                Err = 0;//エラーログをいったんリセット
                kusomusi = 1;//空走無視をする目印
                //再切り下げ開始
                while (Xk + Xg > Xe && Err !== 2) {
                    Vh = Vh - 0.01;

                    //切り下げ過ぎの時
                    if (Vh < Vs || Vh < Vf) {
                        if (Vs >= Vf) {
                            Vh = Vs;
                        } else {
                            Vh = Vf;
                        }

                        //加減速距離の再計算
                        if (Vs == Vh) {
                            Xk = 0;//勾配が強い場合普通に計算すると値が出ず最終的に惰行距離の算出に影響が出る
                            T0s = 0;
                            T0h = 0;
                        } else {
                            T0h = ((- A0) + Math.sqrt((A0 ** 2) + (2 * J * Vh))) / J;
                            T0s = ((- A0) + Math.sqrt((A0 ** 2) + (2 * J * Vs))) / J;
                            Xk = (J / 6) * (T0h ** 3 - T0s ** 3) + (A0 / 2) * (T0h ** 2 - T0s ** 2);
                        }
                        if (Vf == Vh) {
                            Xg = 0;
                        } else {
                            Xg = (Vf ** 2 - Vh ** 2) / (-2 * (Ag + (S / (3.6 * K)))) + (Vh * Fr);
                        }

                        //それでも無理な場合はエラー
                        if (Xk + Xg > Xe) {
                            Err = 2;
                        }
                    } else {
                        //切り下げ過ぎでないとき    
                        //加減速距離の再計算
                        if (Vs == Vh) {
                            Xk = 0;//勾配が強い場合普通に計算すると値が出ず最終的に惰行距離の算出に影響が出る
                            T0s = 0;
                            T0h = 0;
                        } else {
                            T0h = ((- A0) + Math.sqrt((A0 ** 2) + (2 * J * Vh))) / J;
                            T0s = ((- A0) + Math.sqrt((A0 ** 2) + (2 * J * Vs))) / J;
                            Xk = (J / 6) * (T0h ** 3 - T0s ** 3) + (A0 / 2) * (T0h ** 2 - T0s ** 2);
                        }
                        if (Vf == Vh) {
                            Xg = 0;
                        } else {
                            Xg = (Vf ** 2 - Vh ** 2) / (-2 * (Ag + (S / (3.6 * K)))) + (Vh * Fr);
                        }
                    }
                }

            }

            //ここまででエラーが出てないとき、所要時間の計算開始
            if (Err == 0) {
                //減速度補正
                if (kusomusi == 1) {
                    Agr = (Vh ** 2 - Vf ** 2) / (2 * Xe);//空走無視のときの実質減速度
                    //空走無視の減速度補正をしたときの減速距離(グラフ描画用)
                    Xg = (Vf ** 2 - Vh ** 2) / (-2 * (Agr)) + (Vh * Fr);
                } else {
                    Agr = Ag + (S / (3.6 * K));//勾配補正の実質減速度
                }

                //加速時間
                if (Vs == Vh) {
                    Tk = 0;
                } else {
                    Tk = T0h - T0s;
                }

                //減速時間
                if (Vf == Vh) {
                    Tg = 0;
                } else {
                    Tg = (Vf - Vh) / (- Agr) + Fr;
                }

                //所要時間
                Ts = Tk + Tg + ((Xe - Xk - Xg) / Vh);
                Tss = Tk + Tg + ((Xe - Xk - Xg) / Vh) + 0.0001;//0.0001にかんしては各項の末尾がなぜか.999999...になった時に四捨五入のバグが生じる為追加

                //単位換算、四捨五入
                Vh = Vh * 3.6;
                Ts = Math.round(Ts);
                Tss = Math.round(Tss);
                Vh = Math.round(Vh);

                //ver3.1バグ回避用 (たとえば、本来76秒の所が764となったり10倍して4たした数になっていた。)
                if (Ts * 10 > Tss) {
                    Ts = Tss;
                }
            }

        }

        //結果表示(数値は戻り値として返す)
        if (Err == 0) {


            //ver6.0グラフ描画システム
            //グラフのIDをとっておく
            var graph = document.getElementById('graph');
            //Vdを[km/h]に戻しておくことで単位換算を解決
            Vd = Vd * 3.6;
            //これはXesumによって座標がどれだけ変わるかの尺度(75を足すとグラフの原点がずれるので)
            Xesumzahyo = (Xesum * 505 / Xe15);

            //上りの場合のグラフ描画
            if (NorK == 1) {
                //加速区間の描画(1秒毎に区切ってtの媒介変数表示で直線を引く,T0sからT0hまでで計算し、x方向にx(T0s)だけ引く)
                var Tgraphkasoku = T0s;
                while (Tgraphkasoku < T0h) {
                    var Xgparhsitenkasoku = 75 + ((J * (Tgraphkasoku ** 3 - T0s ** 3) / 6 + A0 * (Tgraphkasoku ** 2 - T0s ** 2) / 2) * 505 / Xe15);
                    var Vgparhsitenkasoku = 167 - ((J * (Tgraphkasoku ** 2) / 2 + A0 * Tgraphkasoku) * 3.6 * 160 / Vd);
                    Tgraphkasoku += 1;
                    var Xgparhsyutenkasoku = 75 + ((J * (Tgraphkasoku ** 3 - T0s ** 3) / 6 + A0 * (Tgraphkasoku ** 2 - T0s ** 2) / 2) * 505 / Xe15);
                    var Vgparhsyutenkasoku = 167 - ((J * (Tgraphkasoku ** 2) / 2 + A0 * Tgraphkasoku) * 3.6 * 160 / Vd);
                    graph.innerHTML += '<line x1="' + (Xgparhsitenkasoku + Xesumzahyo) + '" y1="' + Vgparhsitenkasoku + '" x2="' + (Xgparhsyutenkasoku + Xesumzahyo) + '" y2="' + Vgparhsyutenkasoku + '" stroke="rgb(255, 103, 103)" stroke-width="4px"/>';
                }
                //惰行区間の描画
                graph.innerHTML += '<line x1="' + (75 + ((Xk + Xesum) * 505 / Xe15)) + '" y1="' + (167 - (Vh * 160 / Vd)) + '" x2="' + (75 + ((Xe - Xg + Xesum) * 505 / Xe15)) + '" y2="' + (167 - (Vh * 160 / Vd)) + '" stroke="rgb(255, 245, 153)" stroke-width="4px"/>';
                //空走区間の描画
                Xfr = Fr * Vh / 3.6;
                graph.innerHTML += '<line x1="' + (75 + ((Xe - Xg + Xesum) * 505 / Xe15)) + '" y1="' + (167 - (Vh * 160 / Vd)) + '" x2="' + (75 + ((Xe - Xg + Xfr + Xesum) * 505 / Xe15)) + '" y2="' + (167 - (Vh * 160 / Vd)) + '" stroke="rgb(153, 255, 153)" stroke-width="4px"/>';
                //減速区間の描画(こっちはv-xの関係が一つの式になっているが疑似的にvgraphgensokuの媒介変数表示でやる,1m/s毎)
                var Vgraphgensoku = Vh / 3.6;
                while (Vgraphgensoku > Vf) {
                    var Xgraphsitengensoku = 75 + ((Vgraphgensoku ** 2 - (Vh / 3.6) ** 2) / (-2 * (Agr)) + (Xe + Xfr - Xg)) * 505 / Xe15;
                    var Vgraphsitengensoku = 167 - (Vgraphgensoku * 3.6 * 160 / Vd);
                    Vgraphgensoku -= 1;
                    var Xgraphsyutengensoku = 75 + ((Vgraphgensoku ** 2 - (Vh / 3.6) ** 2) / (-2 * (Agr)) + (Xe + Xfr - Xg)) * 505 / Xe15;
                    var Vgraphsyutengensoku = 167 - (Vgraphgensoku * 3.6 * 160 / Vd);
                    graph.innerHTML += '<line x1="' + (Xgraphsitengensoku + Xesumzahyo) + '" y1="' + Vgraphsitengensoku + '" x2="' + (Xgraphsyutengensoku + Xesumzahyo) + '" y2="' + Vgraphsyutengensoku + '" stroke="#00ffff" stroke-width="4px"/>';
                }
            }

            //下りの場合のグラフ描画(x方向の座標に全て590を足す)
            if (NorK == 0) {
                //加速区間の描画(1秒毎に区切ってtの媒介変数表示で直線を引く,T0sからT0hまでで計算し、x方向にx(T0s)だけ引く)
                var Tgraphkasoku = T0s;
                while (Tgraphkasoku < T0h) {
                    var Xgparhsitenkasoku = 75 + ((J * (Tgraphkasoku ** 3 - T0s ** 3) / 6 + A0 * (Tgraphkasoku ** 2 - T0s ** 2) / 2) * 505 / Xe15);
                    var Vgparhsitenkasoku = 167 - ((J * (Tgraphkasoku ** 2) / 2 + A0 * Tgraphkasoku) * 3.6 * 160 / Vd);
                    Tgraphkasoku += 1;
                    var Xgparhsyutenkasoku = 75 + ((J * (Tgraphkasoku ** 3 - T0s ** 3) / 6 + A0 * (Tgraphkasoku ** 2 - T0s ** 2) / 2) * 505 / Xe15);
                    var Vgparhsyutenkasoku = 167 - ((J * (Tgraphkasoku ** 2) / 2 + A0 * Tgraphkasoku) * 3.6 * 160 / Vd);
                    graph.innerHTML += '<line x1="' + (Xgparhsitenkasoku + Xesumzahyo + 590) + '" y1="' + Vgparhsitenkasoku + '" x2="' + (Xgparhsyutenkasoku + Xesumzahyo + 590) + '" y2="' + Vgparhsyutenkasoku + '" stroke="rgb(255, 103, 103)" stroke-width="4px"/>';
                }
                //惰行区間の描画
                graph.innerHTML += '<line x1="' + (75 + ((Xk + Xesum) * 505 / Xe15) + 590) + '" y1="' + (167 - (Vh * 160 / Vd)) + '" x2="' + (75 + ((Xe - Xg + Xesum) * 505 / Xe15) + 590) + '" y2="' + (167 - (Vh * 160 / Vd)) + '" stroke="rgb(255, 245, 153)" stroke-width="4px"/>';
                //空走区間の描画
                Xfr = Fr * Vh / 3.6;
                graph.innerHTML += '<line x1="' + (75 + ((Xe - Xg + Xesum) * 505 / Xe15) + 590) + '" y1="' + (167 - (Vh * 160 / Vd)) + '" x2="' + (75 + ((Xe - Xg + Xfr + Xesum) * 505 / Xe15) + 590) + '" y2="' + (167 - (Vh * 160 / Vd)) + '" stroke="rgb(153, 255, 153)" stroke-width="4px"/>';
                //減速区間の描画(こっちはv-xの関係が一つの式になっているが疑似的にvgraphgensokuの媒介変数表示でやる,1m/s毎)
                var Vgraphgensoku = Vh / 3.6;
                while (Vgraphgensoku > Vf) {
                    var Xgraphsitengensoku = 75 + ((Vgraphgensoku ** 2 - (Vh / 3.6) ** 2) / (-2 * (Agr)) + (Xe + Xfr - Xg)) * 505 / Xe15;
                    var Vgraphsitengensoku = 167 - (Vgraphgensoku * 3.6 * 160 / Vd);
                    Vgraphgensoku -= 1;
                    var Xgraphsyutengensoku = 75 + ((Vgraphgensoku ** 2 - (Vh / 3.6) ** 2) / (-2 * (Agr)) + (Xe + Xfr - Xg)) * 505 / Xe15;
                    var Vgraphsyutengensoku = 167 - (Vgraphgensoku * 3.6 * 160 / Vd);
                    graph.innerHTML += '<line x1="' + (Xgraphsitengensoku + Xesumzahyo + 590) + '" y1="' + Vgraphsitengensoku + '" x2="' + (Xgraphsyutengensoku + Xesumzahyo + 590) + '" y2="' + Vgraphsyutengensoku + '" stroke="#00ffff" stroke-width="4px"/>';
                }
            }

            Xgbef = Xg;//Xgbefを確定
            return [Ts, Vh, Xgbef];
        }

        if (Err == 1) {
            Ts = "Err1";
            Vh = "Err1";
            Xgbef = 0;
            return [Ts, Vh, Xgbef];
        }

        if (Err == 2) {
            Ts = "Err2";
            Vh = "Err2";
            Xgbef = 0;
            return [Ts, Vh, Xgbef];

        }

        if (Err == 3) {
            Ts = "Err3";
            Vh = "Err3";
            Xgbef = 0;
            return [Ts, Vh, Xgbef];
        }

        if (Err == 4) {
            Ts = "Err4";
            Vh = "Err4";
            Xgbef = 0;
            return [Ts, Vh, Xgbef];
        }

        if (Err == 5) {
            Ts = "Err5";
            Vh = "Err5";
            Xgbef = 0;
            return [Ts, Vh, Xgbef];
        }

        if (Err == 7) {
            Ts = "Err7";
            Vh = "Err7";
            Xgbef = 0;
            return [Ts, Vh, Xgbef];
        }

    }

    if (Err == 6) {
        Ts = "--";
        Vh = "--";
        Xgbef = 0;
        return [Ts, Vh, Xgbef];
    }

}



//ver4.0 曲線制限速度計算ツール用関数
function curvecalc() {
    var Rc;//曲線半径
    var Kc;//係数
    var Vc;//曲線制限速度
    var Errc = 0;//エラーの種類

    Rc = document.getElementById("Rc").value;
    Kc = document.getElementById("Kc").value;


    if (Rc == "" || Kc == "") {
        Errc = 1;
    }

    Vc = Kc * Math.sqrt(Rc);

    //5km/h単位に切り捨て
    Vc = Math.floor(Vc / 5) * 5

    if (Errc == 0) {
        var rec = document.getElementById('rec');
        rec.innerHTML = Vc;
    }

    if (Errc == 1) {
        var rec = document.getElementById('rec');
        rec.innerHTML = '--';
    }

}

//multi版の構築用関数
function main() {
    //入力値
    var Ak;//起動加速度
    var Ag;//減速度
    var Vs;//初速度
    var Vf;//終速度
    var Vh;//最高速度(制限速度)
    var Vd;//設計最高速度
    var Xe;//駅間距離
    var S;//勾配
    var K;//定数
    var Fr;//空走時間
    var NorK = 1;//今上りの計算中か下りの計算中か(グラフ描画用)(上りなら1、下りなら0)
    var Xgbef;//前の区間での減速距離(空走距離無視判定用)

    //車両諸元の取得(固定値)
    Ak = document.getElementById("Ak").value;
    Ag = document.getElementById("Ag").value;
    Vd = document.getElementById("Vd").value;
    K = document.getElementById("K").value;
    Fr = document.getElementById("Fr").value;

    //総距離の取得(グラフ用)
    var Xe15;
    Xe1 = document.getElementById("Xe1").value;
    if (Xe1 !== "") {
        Xe15 = parseFloat(Xe1);
    }
    Xe2 = document.getElementById("Xe2").value;
    if (Xe2 !== "") {
        Xe15 = Xe15 + parseFloat(Xe2);
    }
    Xe3 = document.getElementById("Xe3").value;
    if (Xe3 !== "") {
        Xe15 = Xe15 + parseFloat(Xe3);
    }
    Xe4 = document.getElementById("Xe4").value;
    if (Xe4 !== "") {
        Xe15 = Xe15 + parseFloat(Xe4);
    }
    Xe5 = document.getElementById("Xe5").value;
    if (Xe5 !== "") {
        Xe15 = Xe15 + parseFloat(Xe5);
    }

    //グラフを描画するためのSVG要素を生成
    var grapharea = document.getElementById('grapharea');
    grapharea.innerHTML = '<svg width="1180" height="200" id="graph"></svg>';
    //グラフのIDをとっておく
    var graph = document.getElementById('graph');
    if (Vd <= 200) {
        //速度の補助線を10km/h毎に引く、50km/h毎に太線と数値表示(svg上ではVdがy=7,原点がy=167である)
        var vline = 10;
        while (vline <= Vd) {
            var vlinenoyzahyo = 167 - (vline * 160 / Vd);
            if (vline % 50 == 0) {
                graph.innerHTML += '<line x1="50" y1="' + vlinenoyzahyo + '" x2="590" y2="' + vlinenoyzahyo + '" stroke="#aaaaaa" stroke-width="1.5px"/>';
                graph.innerHTML += '<text x="50" y="' + vlinenoyzahyo + '" class = "small">' + vline + '</text>';
                graph.innerHTML += '<line x1="640" y1="' + vlinenoyzahyo + '" x2="1180" y2="' + vlinenoyzahyo + '" stroke="#aaaaaa" stroke-width="1.5px"/>';
                graph.innerHTML += '<text x="640" y="' + vlinenoyzahyo + '" class = "small">' + vline + '</text>';
            } else {
                graph.innerHTML += '<line x1="50" y1="' + vlinenoyzahyo + '" x2="590" y2="' + vlinenoyzahyo + '" stroke="#888888" stroke-width="1px"/>';
                graph.innerHTML += '<line x1="640" y1="' + vlinenoyzahyo + '" x2="1180" y2="' + vlinenoyzahyo + '" stroke="#888888" stroke-width="1px"/>';
            }
            vline += 10;
        }
    } else {
        //設計最高速度が201km/h以上の時線を半分に間引く
        var vline = 20;
        while (vline <= Vd) {
            var vlinenoyzahyo = 167 - (vline * 160 / Vd);
            if (vline % 100 == 0) {
                graph.innerHTML += '<line x1="50" y1="' + vlinenoyzahyo + '" x2="590" y2="' + vlinenoyzahyo + '" stroke="#aaaaaa" stroke-width="1.5px"/>';
                graph.innerHTML += '<text x="50" y="' + vlinenoyzahyo + '" class = "small">' + vline + '</text>';
                graph.innerHTML += '<line x1="640" y1="' + vlinenoyzahyo + '" x2="1180" y2="' + vlinenoyzahyo + '" stroke="#aaaaaa" stroke-width="1.5px"/>';
                graph.innerHTML += '<text x="640" y="' + vlinenoyzahyo + '" class = "small">' + vline + '</text>';
            } else {
                graph.innerHTML += '<line x1="50" y1="' + vlinenoyzahyo + '" x2="590" y2="' + vlinenoyzahyo + '" stroke="#888888" stroke-width="1px"/>';
                graph.innerHTML += '<line x1="640" y1="' + vlinenoyzahyo + '" x2="1180" y2="' + vlinenoyzahyo + '" stroke="#888888" stroke-width="1px"/>';
            }
            vline += 20;
        }
    }
    if (Xe15 <= 5000) {
        //距離の補助線を100m毎に引く、500m毎に太線と数値表示(svg上では上りはXeがx=580,原点がx=75、下りはそれぞれに590を足す)
        var xline = 100;
        while (xline <= Xe15) {
            var xlinenoyzahyo = 75 + (xline * 505 / Xe15);//以降線を追加していくため(上書きではなく)graph.innerHTML の後は += とすること。;
            if (xline % 500 == 0) {
                graph.innerHTML += '<line x1="' + xlinenoyzahyo + '" y1="0" x2="' + xlinenoyzahyo + '" y2="185" stroke="#aaaaaa" stroke-width="1.5px"/>';
                graph.innerHTML += '<text class = "small" x="' + xlinenoyzahyo + '" y="182" text-anchor = "middle">' + xline + '</text>';
                graph.innerHTML += '<line x1="' + (xlinenoyzahyo + 590) + '" y1="0" x2="' + (xlinenoyzahyo + 590) + '" y2="185" stroke="#aaaaaa" stroke-width="1.5px"/>';
                graph.innerHTML += '<text class = "small" x="' + (xlinenoyzahyo + 590) + '" y="182" text-anchor = "middle">' + xline + '</text>';
            } else {
                graph.innerHTML += '<line x1="' + xlinenoyzahyo + '" y1="0" x2="' + xlinenoyzahyo + '" y2="185" stroke="#888888" stroke-width="1px"/>';
                graph.innerHTML += '<line x1="' + (xlinenoyzahyo + 590) + '" y1="0" x2="' + (xlinenoyzahyo + 590) + '" y2="185" stroke="#888888" stroke-width="1px"/>';
            }
            xline += 100;
        }
    } else {
        //総距離が5001m以上の時線を半分に間引く
        var xline = 200;
        while (xline <= Xe15) {
            var xlinenoyzahyo = 75 + (xline * 505 / Xe15);//以降線を追加していくため(上書きではなく)graph.innerHTML の後は += とすること。;
            if (xline % 1000 == 0) {
                graph.innerHTML += '<line x1="' + xlinenoyzahyo + '" y1="0" x2="' + xlinenoyzahyo + '" y2="185" stroke="#aaaaaa" stroke-width="1.5px"/>';
                graph.innerHTML += '<text class = "small" x="' + xlinenoyzahyo + '" y="182" text-anchor = "middle">' + xline + '</text>';
                graph.innerHTML += '<line x1="' + (xlinenoyzahyo + 590) + '" y1="0" x2="' + (xlinenoyzahyo + 590) + '" y2="185" stroke="#aaaaaa" stroke-width="1.5px"/>';
                graph.innerHTML += '<text class = "small" x="' + (xlinenoyzahyo + 590) + '" y="182" text-anchor = "middle">' + xline + '</text>';
            } else {
                graph.innerHTML += '<line x1="' + xlinenoyzahyo + '" y1="0" x2="' + xlinenoyzahyo + '" y2="185" stroke="#888888" stroke-width="1px"/>';
                graph.innerHTML += '<line x1="' + (xlinenoyzahyo + 590) + '" y1="0" x2="' + (xlinenoyzahyo + 590) + '" y2="185" stroke="#888888" stroke-width="1px"/>';
            }
            xline += 200;
        }
    }
    //運転曲線の軸とラベルの描画
    var graph = document.getElementById('graph');
    graph.innerHTML += '<line x1="75" y1="0" x2="75" y2="200" stroke="white" stroke-width="2px"/><line X1="25" y1="167" x2 = "590" y2="167" stroke="white" stroke-width="2px"/><text x="50" y="182">0</text><text x="300" y="197">距離</text><text class = "small" x="570" y="197">[m]</text><line x1="75" y1="0" x2="67" y2="8" stroke="white" stroke-width="2px"/><line x1="75" y1="0" x2="83" y2="8" stroke="white" stroke-width="2px"/><text x="25" y="83">速</text><text x="25" y="100">度</text><text class="small" x="25" y="10">[km/h]</text><line x1="590" y1="167" x2="582" y2="159" stroke="white" stroke-width="2px"/><line x1="590" y1="167" x2="582" y2="175" stroke="white" stroke-width="2px"/><text x="10"y="49" class="small">上</text><text x="10" y="66" class="small">り</text><text x="10" y="83" class="small">運</text><text x="10" y="100" class="small">転</text><text x="10" y="117" class="small">曲</text><text x="10" y="134" class="small">線</text><line x1="665" y1="0" x2="665" y2="200" stroke="white" stroke-width="2px"/><line X1="615" y1="167" x2 = "1180" y2="167" stroke="white" stroke-width="2px"/><text x="640" y="182">0</text><text x="890" y="197">距離</text><text class = "small" x="1160" y="197">[m]</text><line x1="665" y1="0" x2="657" y2="8" stroke="white" stroke-width="2px"/><line x1="665" y1="0" x2="673" y2="8" stroke="white" stroke-width="2px"/><text x="615" y="83">速</text><text x="615" y="100">度</text><text class="small" x="615" y="10">[km/h]</text><line x1="1180" y1="167" x2="1172" y2="159" stroke="white" stroke-width="2px"/><line x1="1180" y1="167" x2="1172" y2="175" stroke="white" stroke-width="2px"/><text x="600"y="49" class="small">下</text><text x="600" y="66" class="small">り</text><text x="600" y="83" class="small">運</text><text x="600" y="100" class="small">転</text><text x="600" y="117" class="small">曲</text><text x="600" y="134" class="small">線</text>';



    //前区間までの累計距離(グラフ用)を初期化
    var Xesum = 0;
    //上り1区間目の渡す区間値を取得
    Vs = document.getElementById("Vn1").value;
    Vf = document.getElementById("Vn2").value;
    Vh = document.getElementById("Vh1").value;
    Xe = document.getElementById("Xe1").value;
    S = document.getElementById("S1").value;
    //上り1区間目の計算と数値取得
    var resultn1 = calc({ Ak, Ag, Vd, K, Fr, Vs, Vh, Vf, Xe, S, Xe15, Xesum, NorK, Xgbef });
    //結果表示
    var ResultTsn1 = document.getElementById('ResultTsn1');
    ResultTsn1.innerHTML = resultn1[0];
    var ResultVhn1 = document.getElementById('ResultVhn1');
    ResultVhn1.innerHTML = resultn1[1];
    //Xgbefを更新
    Xgbef = resultn1[2];
    //上り1区間目の距離を累計距離に加算
    if (Xe1 !== "") {
        Xesum += parseFloat(Xe1);
    }

    //上り2区間目の渡す区間値を取得
    Vs = document.getElementById("Vn2").value;
    Vf = document.getElementById("Vn3").value;
    Vh = document.getElementById("Vh2").value;
    Xe = document.getElementById("Xe2").value;
    S = document.getElementById("S2").value;
    //上り2区間目の計算と数値取得
    var resultn2 = calc({ Ak, Ag, Vd, K, Fr, Vs, Vh, Vf, Xe, S, Xe15, Xesum, NorK, Xgbef });
    //結果表示
    var ResultTsn2 = document.getElementById('ResultTsn2');
    ResultTsn2.innerHTML = resultn2[0];
    var ResultVhn2 = document.getElementById('ResultVhn2');
    ResultVhn2.innerHTML = resultn2[1];
    //Xgbefを更新
    Xgbef = resultn2[2];
    //上り2区間目の距離を累計距離に加算
    if (Xe2 !== "") {
        Xesum += parseFloat(Xe2);
    }

    //上り3区間目の渡す区間値を取得
    Vs = document.getElementById("Vn3").value;
    Vf = document.getElementById("Vn4").value;
    Vh = document.getElementById("Vh3").value;
    Xe = document.getElementById("Xe3").value;
    S = document.getElementById("S3").value;
    //上り3区間目の計算と数値取得
    var resultn3 = calc({ Ak, Ag, Vd, K, Fr, Vs, Vh, Vf, Xe, S, Xe15, Xesum, NorK, Xgbef });
    //結果表示
    var ResultTsn3 = document.getElementById('ResultTsn3');
    ResultTsn3.innerHTML = resultn3[0];
    var ResultVhn3 = document.getElementById('ResultVhn3');
    ResultVhn3.innerHTML = resultn3[1];
    //Xgbefを更新
    Xgbef = resultn3[2];
    //上り3区間目の距離を累計距離に加算
    if (Xe3 !== "") {
        Xesum += parseFloat(Xe3);
    }

    //上り4区間目の渡す区間値を取得
    Vs = document.getElementById("Vn4").value;
    Vf = document.getElementById("Vn5").value;
    Vh = document.getElementById("Vh4").value;
    Xe = document.getElementById("Xe4").value;
    S = document.getElementById("S4").value;
    //上り4区間目の計算と数値取得
    var resultn4 = calc({ Ak, Ag, Vd, K, Fr, Vs, Vh, Vf, Xe, S, Xe15, Xesum, NorK, Xgbef });
    //結果表示
    var ResultTsn4 = document.getElementById('ResultTsn4');
    ResultTsn4.innerHTML = resultn4[0];
    var ResultVhn4 = document.getElementById('ResultVhn4');
    ResultVhn4.innerHTML = resultn4[1];
    //Xgbefを更新
    Xgbef = resultn4[2];
    //上り4区間目の距離を累計距離に加算
    if (Xe4 !== "") {
        Xesum += parseFloat(Xe4);
    }

    //上り5区間目の渡す区間値を取得
    Vs = document.getElementById("Vn5").value;
    Vf = document.getElementById("Vn6").value;
    Vh = document.getElementById("Vh5").value;
    Xe = document.getElementById("Xe5").value;
    S = document.getElementById("S5").value;
    //上り5区間目の計算と数値取得
    var resultn5 = calc({ Ak, Ag, Vd, K, Fr, Vs, Vh, Vf, Xe, S, Xe15, Xesum, NorK, Xgbef });
    //結果表示
    var ResultTsn5 = document.getElementById('ResultTsn5');
    ResultTsn5.innerHTML = resultn5[0];
    var ResultVhn5 = document.getElementById('ResultVhn5');
    ResultVhn5.innerHTML = resultn5[1];


    NorK = 0;//下りの計算に切り替え
    Xgbef = 0;//Xgbefの初期化
    //前区間までの累計距離(グラフ用)を初期化
    Xesum = 0;
    //下り5区間目の渡す区間値を取得
    Vs = document.getElementById("Vk6").value;
    Vf = document.getElementById("Vk5").value;
    Vh = document.getElementById("Vh5").value;
    Xe = document.getElementById("Xe5").value;
    S = document.getElementById("S5").value;
    //下り5区間目の計算と数値取得
    var resultk5 = calc({ Ak, Ag, Vd, K, Fr, Vs, Vh, Vf, Xe, S, Xe15, Xesum, NorK, Xgbef });
    //結果表示
    var ResultTsk5 = document.getElementById('ResultTsk5');
    ResultTsk5.innerHTML = resultk5[0];
    var ResultVhk5 = document.getElementById('ResultVhk5');
    ResultVhk5.innerHTML = resultk5[1];
    //Xgbefを更新
    Xgbef = resultk5[2];
    //下り5区間目の距離を累計距離に加算
    if (Xe5 !== "") {
        Xesum += parseFloat(Xe5);
    }

    //下り4区間目の渡す区間値を取得
    Vs = document.getElementById("Vk5").value;
    Vf = document.getElementById("Vk4").value;
    Vh = document.getElementById("Vh4").value;
    Xe = document.getElementById("Xe4").value;
    S = document.getElementById("S4").value;
    //下り4区間目の計算と数値取得
    var resultk4 = calc({ Ak, Ag, Vd, K, Fr, Vs, Vh, Vf, Xe, S, Xe15, Xesum, NorK, Xgbef });
    //結果表示
    var ResultTsk4 = document.getElementById('ResultTsk4');
    ResultTsk4.innerHTML = resultk4[0];
    var ResultVhk4 = document.getElementById('ResultVhk4');
    ResultVhk4.innerHTML = resultk4[1];
    //Xgbefを更新
    Xgbef = resultk4[2];
    //下り4区間目の距離を累計距離に加算
    if (Xe4 !== "") {
        Xesum += parseFloat(Xe4);
    }

    //下り3区間目の渡す区間値を取得
    Vs = document.getElementById("Vk4").value;
    Vf = document.getElementById("Vk3").value;
    Vh = document.getElementById("Vh3").value;
    Xe = document.getElementById("Xe3").value;
    S = document.getElementById("S3").value;
    //下り3区間目の計算と数値取得
    var resultk3 = calc({ Ak, Ag, Vd, K, Fr, Vs, Vh, Vf, Xe, S, Xe15, Xesum, NorK, Xgbef });
    //結果表示
    var ResultTsk3 = document.getElementById('ResultTsk3');
    ResultTsk3.innerHTML = resultk3[0];
    var ResultVhk3 = document.getElementById('ResultVhk3');
    ResultVhk3.innerHTML = resultk3[1];
    //Xgbefを更新
    Xgbef = resultk3[2];
    //下り3区間目の距離を累計距離に加算
    if (Xe3 !== "") {
        Xesum += parseFloat(Xe3);
    }

    //下り2区間目の渡す区間値を取得
    Vs = document.getElementById("Vk3").value;
    Vf = document.getElementById("Vk2").value;
    Vh = document.getElementById("Vh2").value;
    Xe = document.getElementById("Xe2").value;
    S = document.getElementById("S2").value;
    //下り2区間目の計算と数値取得
    var resultk2 = calc({ Ak, Ag, Vd, K, Fr, Vs, Vh, Vf, Xe, S, Xe15, Xesum, NorK, Xgbef });
    //結果表示
    var ResultTsk2 = document.getElementById('ResultTsk2');
    ResultTsk2.innerHTML = resultk2[0];
    var ResultVhk2 = document.getElementById('ResultVhk2');
    ResultVhk2.innerHTML = resultk2[1];
    //Xgbefを更新
    Xgbef = resultk2[2];
    //下り2区間目の距離を累計距離に加算
    if (Xe2 !== "") {
        Xesum += parseFloat(Xe2);
    }

    //下り1区間目の渡す区間値を取得
    Vs = document.getElementById("Vk2").value;
    Vf = document.getElementById("Vk1").value;
    Vh = document.getElementById("Vh1").value;
    Xe = document.getElementById("Xe1").value;
    S = document.getElementById("S1").value;
    //下り1区間目の計算と数値取得
    var resultk1 = calc({ Ak, Ag, Vd, K, Fr, Vs, Vh, Vf, Xe, S, Xe15, Xesum, NorK, Xgbef });
    //結果表示
    var ResultTsk1 = document.getElementById('ResultTsk1');
    ResultTsk1.innerHTML = resultk1[0];
    var ResultVhk1 = document.getElementById('ResultVhk1');
    ResultVhk1.innerHTML = resultk1[1];
}


//空走時間の参考値表示機能の関数
function kusojikan() {
    const clickBtn = document.getElementById('click-btn');
    const popupWrapper = document.getElementById('popup-wrapper');
    const close = document.getElementById('close');

    // ボタンをクリックしたときにポップアップを表示させる
    clickBtn.addEventListener('click', () => {
        popupWrapper.style.display = "block";
    });

    // ポップアップの外側又は「x」のマークをクリックしたときポップアップを閉じる
    popupWrapper.addEventListener('click', e => {
        if (e.target.id === popupWrapper.id || e.target.id === close.id) {
            popupWrapper.style.display = 'none';
        }
    });
}

//自動更新システム
timestamp = 0;
var updateinterval = 10;//更新間隔,デフォルトは10フレームごと

function update() {

    timestamp++;
    window.requestAnimationFrame(update);

    if (timestamp % updateinterval == 0) {
        main();
        curvecalc();
        kusojikan();
        //更新間隔の変更を反映
        updateinterval = document.getElementById("updateinterval").value;
        if (updateinterval == "" || updateinterval <= 0) {
            updateinterval = 10; //デフォルト値
        }
    }

}

update();

})();
