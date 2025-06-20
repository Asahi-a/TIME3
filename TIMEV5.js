//注意！！！！べき乗の記号は^ではなく**を用いること！！！！長らく解決しなかったバグの原因がこれでした！！！！！！！！！！！！！！！！...てか前バージョンのときもべき乗周りがバグってたからかVh*Vhみたいにしてて草()

(function V5() {

function calc() {

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

    //その他基本的なパラメータ
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
    var Err = 0;//エラーの種類
    var Ts;//駅間所要時間
    var Ts2;//Ts2はver3.1バグ回避用

    //数値取得
    Ak = document.getElementById("Ak").value;
    Ag = document.getElementById("Ag").value;
    Vs = document.getElementById("Vs").value;
    Vf = document.getElementById("Vf").value;
    Vh = document.getElementById("Vh").value;
    Vd = document.getElementById("Vd").value;
    Xe = document.getElementById("Xe").value;
    S = document.getElementById("S").value;
    K = document.getElementById("K").value;
    Fr = document.getElementById("Fr").value;

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

            //ここまででエラーが出てないとき、所要時間の計算開始
            if (Err == 0) {
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
                    Tg = (Vf - Vh) / (- (Ag + (S / (3.6 * K)))) + Fr;
                }

                //所要時間
                Ts = Tk + Tg + ((Xe - Xk - Xg) / Vh);
                Ts2 = Tk + Tg + ((Xe - Xk - Xg) / Vh) + 0.0001;//0.0001にかんしては各項の末尾がなぜか.999999...になった時に四捨五入のバグが生じる為追加

                //単位換算、四捨五入
                Vh = Vh * 3.6;
                Ts = Math.round(Ts);
                Ts2 = Math.round(Ts2);
                Vh = Math.round(Vh);

                //ver3.1バグ回避用 (たとえば、本来76秒の所が764となったり10倍して4たした数になっていた。)
                if (Ts * 10 > Ts2) {
                    Ts = Ts2;
                }
            }

        }

        //結果表示
        if (Err == 0) {
            var hTs = document.getElementById('hTs');
            hTs.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">' + Ts + '</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">' + Vh + '</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div>';

            //ver6.0グラフ描画システム
            //グラフ描画のためのSVG要素を生成
            var grapharea = document.getElementById('grapharea');
            grapharea.innerHTML = '<p class ="trbd2">運　転　曲　線</p><svg id = "graph" width = "480" height="270"></svg>';
            //グラフのIDをとっておく
            var graph = document.getElementById('graph');

            if (Vd <= 200){
            //速度の補助線を10km/h毎に引く、50km/h毎に太線と数値表示(svg上ではVdがy=7,原点がy=237である)
            Vd = Vd * 3.6;
            var vline = 10;
            while (vline <= Vd) {
                var vlinenoyzahyo = 237 - (vline * 230 / Vd);
                if (vline % 50 == 0) {
                    graph.innerHTML += '<line x1="0" y1="' + vlinenoyzahyo + '" x2="480" y2="' + vlinenoyzahyo + '" stroke="#aaaaaa" stroke-width="1.5px"/>';
                    graph.innerHTML += '<text x="25" y="' + vlinenoyzahyo + '" class = "small">' + vline + '</text>';
                } else {
                    graph.innerHTML += '<line x1="0" y1="' + vlinenoyzahyo + '" x2="480" y2="' + vlinenoyzahyo + '" stroke="#888888" stroke-width="1px"/>';
                }
                vline += 10;
            }
            }else{//201㌔以上で半分に間引く
            Vd = Vd * 3.6;
            var vline = 20;
            while (vline <= Vd) {
                var vlinenoyzahyo = 237 - (vline * 230 / Vd);
                if (vline % 100 == 0) {
                    graph.innerHTML += '<line x1="0" y1="' + vlinenoyzahyo + '" x2="480" y2="' + vlinenoyzahyo + '" stroke="#aaaaaa" stroke-width="1.5px"/>';
                    graph.innerHTML += '<text x="25" y="' + vlinenoyzahyo + '" class = "small">' + vline + '</text>';
                } else {
                    graph.innerHTML += '<line x1="0" y1="' + vlinenoyzahyo + '" x2="480" y2="' + vlinenoyzahyo + '" stroke="#888888" stroke-width="1px"/>';
                }
                vline += 20;
            }
            }

            if (Xe <= 5000){
            //距離の補助線を100m毎に引く、500m毎に太線と数値表示(svg上ではXeがx=470,原点がx=50である)
            var xline = 100;
            while (xline <= Xe) {
                var xlinenoyzahyo = 50 + (xline * 420 / Xe);//以降線を追加していくため(上書きではなく)graph.innerHTML の後は += とすること。;
                if (xline % 500 == 0) {
                    graph.innerHTML += '<line x1="' + xlinenoyzahyo + '" y1="0" x2="' + xlinenoyzahyo + '" y2="270" stroke="#aaaaaa" stroke-width="1.5px"/>';
                    graph.innerHTML += '<text class = "small" x="' + xlinenoyzahyo + '" y="252" text-anchor = "middle">' + xline + '</text>';
                } else {
                    graph.innerHTML += '<line x1="' + xlinenoyzahyo + '" y1="0" x2="' + xlinenoyzahyo + '" y2="270" stroke="#888888" stroke-width="1px"/>';
                }
                xline += 100;
            }
            }else{//5001m以上の時半分に間引く
            var xline = 200;
            while (xline <= Xe) {
                var xlinenoyzahyo = 50 + (xline * 420 / Xe);//以降線を追加していくため(上書きではなく)graph.innerHTML の後は += とすること。;
                if (xline % 1000 == 0) {
                    graph.innerHTML += '<line x1="' + xlinenoyzahyo + '" y1="0" x2="' + xlinenoyzahyo + '" y2="270" stroke="#aaaaaa" stroke-width="1.5px"/>';
                    graph.innerHTML += '<text class = "small" x="' + xlinenoyzahyo + '" y="252" text-anchor = "middle">' + xline + '</text>';
                } else {
                    graph.innerHTML += '<line x1="' + xlinenoyzahyo + '" y1="0" x2="' + xlinenoyzahyo + '" y2="270" stroke="#888888" stroke-width="1px"/>';
                }
                xline += 200;
            }
            }
            
            //グラフの軸とラベルの描画
            graph.innerHTML += '<line x1="50" y1="0" x2="50" y2="270" stroke="white" stroke-width="2px"/><line X1="0" y1="237" x2 = "480" y2="237" stroke="white" stroke-width="2px"/><text x="35" y="252">0</text><text x="267" y="267">距離</text><text class = "small" x="460" y="267">[m]</text><line x1="50" y1="0" x2="42" y2="8" stroke="white" stroke-width="2px"/><line x1="50" y1="0" x2="58" y2="8" stroke="white" stroke-width="2px"/><text x="0" y="125">速</text><text x="0" y="142">度</text><text class="small" x="0" y="10">[km/h]</text><line x1="480" y1="237" x2="472" y2="229" stroke="white" stroke-width="2px"/><line x1="480" y1="237" x2="472" y2="245" stroke="white" stroke-width="2px"/>';
            //加速区間の描画(1秒毎に区切ってtの媒介変数表示で直線を引く,T0sからT0hまでで計算し、x方向にx(T0s)だけ引く)
            var Tgraphkasoku = T0s;
            while (Tgraphkasoku < T0h) {
                var Xgparhsitenkasoku = 50 + ((J * (Tgraphkasoku ** 3 - T0s ** 3) / 6 + A0 * (Tgraphkasoku ** 2 - T0s ** 2) / 2) * 420 / Xe);
                var Vgparhsitenkasoku = 237 - ((J * (Tgraphkasoku ** 2) / 2 + A0 * Tgraphkasoku) * 3.6 * 230 / Vd);
                Tgraphkasoku += 1;
                var Xgparhsyutenkasoku = 50 + ((J * (Tgraphkasoku ** 3 - T0s ** 3) / 6 + A0 * (Tgraphkasoku ** 2 - T0s ** 2) / 2) * 420 / Xe);
                var Vgparhsyutenkasoku = 237 - ((J * (Tgraphkasoku ** 2) / 2 + A0 * Tgraphkasoku) * 3.6 * 230 / Vd);
                graph.innerHTML += '<line x1="' + Xgparhsitenkasoku + '" y1="' + Vgparhsitenkasoku + '" x2="' + Xgparhsyutenkasoku + '" y2="' + Vgparhsyutenkasoku + '" stroke="rgb(255, 103, 103)" stroke-width="4px"/>';
            }
            //惰行区間の描画
            graph.innerHTML += '<line x1="' + (50 + (Xk * 420 / Xe)) + '" y1="' + (237 - (Vh * 230 / Vd)) + '" x2="' + (50 + ((Xe - Xg) * 420 / Xe)) + '" y2="' + (237 - (Vh * 230 / Vd)) + '" stroke="rgb(255, 245, 153)" stroke-width="4px"/>';
            //空走区間の描画
            Xfr = Fr * Vh / 3.6;
            graph.innerHTML += '<line x1="' + (50 + ((Xe - Xg) * 420 / Xe)) + '" y1="' + (237 - (Vh * 230 / Vd)) + '" x2="' + (50 + ((Xe - Xg + Xfr) * 420 / Xe)) + '" y2="' + (237 - (Vh * 230 / Vd)) + '" stroke="rgb(153, 255, 153)" stroke-width="4px"/>';
            //減速区間の描画(こっちはv-xの関係が一つの式になっているが疑似的にvgraphgensokuの媒介変数表示でやる,1m/s毎)
            var Vgraphgensoku = Vh/ 3.6;
            while (Vgraphgensoku > Vf) {
                var Xgraphsitengensoku = 50 + ((Vgraphgensoku ** 2 - (Vh/3.6) ** 2) / (-2 * (Ag + (S / (3.6 * K)))) + (Xe+Xfr-Xg)) * 420 / Xe;
                var Vgraphsitengensoku = 237 - (Vgraphgensoku * 3.6 * 230 / Vd);
                Vgraphgensoku -= 1;
                var Xgraphsyutengensoku = 50 + ((Vgraphgensoku ** 2 - (Vh/3.6) ** 2) / (-2 * (Ag + (S / (3.6 * K)))) + (Xe+Xfr-Xg)) * 420 / Xe; 
                var Vgraphsyutengensoku = 237 - (Vgraphgensoku * 3.6 * 230 / Vd);
                graph.innerHTML += '<line x1="' + Xgraphsitengensoku + '" y1="' + Vgraphsitengensoku + '" x2="' + Xgraphsyutengensoku + '" y2="' + Vgraphsyutengensoku + '" stroke="#00ffff" stroke-width="4px"/>';
            }
        }

        if (Err == 1) {
            var hTs = document.getElementById('hTs');
            hTs.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div><h2 style="color:rgb(255, 103, 103);">!error!</h2><h3>初速度または終速度もしくは制限速度を設計最高速度よりも大きく設定しないでください！</h3>';
            var grapharea = document.getElementById('grapharea');
            grapharea.innerHTML = '';
        }

        if (Err == 2) {
            var hTs = document.getElementById('hTs');
            hTs.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div><h2 style="color:rgb(255, 103, 103);">!error!</h2><h3>所定キョリ内で終速度まで減速又は加速できません！</h3><h4>値を設定し直してください。もしくは次の区間と統合するなどしてください。</h4>';
            var grapharea = document.getElementById('grapharea');
            grapharea.innerHTML = '';
        }

        if (Err == 3) {
            var hTs = document.getElementById('hTs');
            hTs.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div><h2 style="color:rgb(255, 103, 103);">!error!</h2><h3>初速度または終速度を制限速度よりも大きく設定しないでください！</h3>';
            var grapharea = document.getElementById('grapharea');
            grapharea.innerHTML = '';
        }

        if (Err == 4) {
            var hTs = document.getElementById('hTs');
            hTs.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div><h2 style="color:rgb(255, 103, 103);">!error!</h2><h3>勾配がきつすぎて登れません！</h3><h4>加速度を大きくしてください。</h4>';
            var grapharea = document.getElementById('grapharea');
            grapharea.innerHTML = '';
        }

        if (Err == 5) {
            var hTs = document.getElementById('hTs');
            hTs.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div><h2 style="color:rgb(255, 103, 103);">!error!</h2><h3>勾配がきつすぎて止まれません！</h3><h4>減速度を大きくしてください。</h4>';
            var grapharea = document.getElementById('grapharea');
            grapharea.innerHTML = '';
        }

        if (Err == 7) {
            var hTs = document.getElementById('hTs');
            hTs.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div><h2 style="color:rgb(255, 103, 103);">!error!</h2><h3>勾配がきつすぎて終速度まで到達できません！</h3><h4>終速度を小さくしてください。</h4>';
            var grapharea = document.getElementById('grapharea');
            grapharea.innerHTML = '';
        }

    }

    if (Err == 6) {
        var hTs = document.getElementById('hTs');
        hTs.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div><h2 style="color:rgb(255, 103, 103);">!error!</h2><h3>「車両諸元」と「区間データ」には全ての数値を入力してください！</h3>';
        var grapharea = document.getElementById('grapharea');
        grapharea.innerHTML = '';
    }

}



//ver4.0 曲線制限速度計算ツール用
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

//自動更新システム
timestamp = 0;

function update() {

    timestamp++;
    window.requestAnimationFrame(update);

    if (timestamp % 10 == 0) {
        calc();
        curvecalc();
    }

})update();

}

V5();
