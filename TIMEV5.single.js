//注意！！！！べき乗の記号は^ではなく**を用いること！！！！長らく解決しなかったバグの原因がこれでした！！！！！！！！！！！！！！！！...てか前バージョンのときもべき乗周りがバグってたからかVh*Vhみたいにしてて草()

(function V5Sg() {

function calcSg() {

    //入力値
    var AkSg;//起動加速度
    var AgSg;//減速度
    var VsSg;//初速度
    var VfSg;//終速度
    var VhSg;//最高速度(制限速度)
    var VdSg;//設計最高速度
    var XeSg;//駅間距離
    var SSg;//勾配
    var KSg;//定数
    var FrSg;//空走時間

    //その他基本的なパラメータ
    var TkSg;//加速時間
    var TgSg;//減速時間
    var XkSg;//加速距離
    var XgSg;//減速距離

    //等躍度運動近似加速度自動補正システムに必要なパラメータ
    var JSg;//躍度(加加速度)
    var A0Sg;//加速度に係る定数
    var T0sSg;//停車状態から初速度まで加速する場合の時間
    var T0hSg;//停車状態から最高速度まで加速する場合の時間
    var VlSg;//躍度と勾配によってこれ以上加速ができなくなる速度

    //その他
    var ErrSg = 0;//エラーの種類
    var TsSg;//駅間所要時間
    var Ts2Sg;//Ts2はver3.1バグ回避用

    //数値取得
    AkSg = document.getElementById("AkSg").value;
    AgSg = document.getElementById("AgSg").value;
    VsSg = document.getElementById("VsSg").value;
    VfSg = document.getElementById("VfSg").value;
    VhSg = document.getElementById("VhSg").value;
    VdSg = document.getElementById("VdSg").value;
    XeSg = document.getElementById("XeSg").value;
    SSg = document.getElementById("SSg").value;
    KSg = document.getElementById("KSg").value;
    FrSg = document.getElementById("FrSg").value;

    //未入力判定
    if (AkSg == "" || AgSg == "" || VsSg == "" || VfSg == "" || VhSg == "" || VdSg == "" || XeSg == "" || SSg == "" || KSg == "" || FrSg == "") {
        ErrSg = 6;
    } else {

        //入力値の数値化(未入力判定の前にやると0のとき未入力となってしまう)
        AkSg = parseFloat(AkSg);
        AgSg = parseFloat(AgSg);
        VsSg = parseFloat(VsSg);
        VfSg = parseFloat(VfSg);
        VhSg = parseFloat(VhSg);
        VdSg = parseFloat(VdSg);
        XeSg = parseFloat(XeSg);
        SSg = parseFloat(SSg);
        KSg = parseFloat(KSg);
        FrSg = parseFloat(FrSg);


        //入力値の単位をm,sに換算
        AkSg = AkSg / 3.6;
        AgSg = AgSg / 3.6;
        VsSg = VsSg / 3.6;
        VfSg = VfSg / 3.6;
        VdSg = VdSg / 3.6;
        VhSg = VhSg / 3.6;

        //設計最高速度より大きな入力がないか判定(Ver4.0以前のErr1を廃止しこちらに置き換え)
        if (VdSg < VsSg || VdSg < VfSg || VdSg < VhSg) {
            ErrSg = 1;
        }

        //最高速度より大きな入力がないか判定
        if (VhSg < VsSg || VhSg < VfSg) {
            ErrSg = 3;
        }

        //勾配が急すぎないか判定
        if ((-3.6 * AkSg + (SSg / KSg)) >= 0) {
            ErrSg = 4;
        }
        if ((3.6 * AgSg + (SSg / KSg)) <= 0) {
            ErrSg = 5;
        }

        //加速できる最高速度が勾配により低い時の処理
        A0Sg = AkSg - (SSg / (3.6 * KSg));
        JSg = - ((AkSg ** 2) / (2 * (VdSg + 4)));
        VlSg = - (A0Sg ** 2) / (2 * JSg);  //(J / 2) * ((-A0 / J) ^ 2) + A0 * (-A0 / J);
        if (VlSg < VfSg && VsSg < VfSg) {
            ErrSg = 7;
        } else if (VlSg < VsSg) {
            VhSg = VsSg;
        } else if (VlSg < VhSg) {
            VhSg = VlSg - 0.001;//ぴったりにしてしまうと加速度0の点を計算に含んでしまいバグるため
        }

        //計算開始
        if (ErrSg !== 1 && ErrSg !== 3 && ErrSg !== 4 && ErrSg !== 5 && ErrSg !== 6 && ErrSg !== 7) {

            //最高速度自動切り下げシステムに必要なパラメータを計算
            //加速距離
            if (VsSg == VhSg) {
                XkSg = 0;//勾配が強い場合普通に計算すると値が出ず最終的に惰行距離の算出に影響が出る
                T0sSg = 0;
                T0hSg = 0;//T0s及びT0hはグラフ描画に必要のため
            } else {
            T0hSg = ((- A0Sg) + Math.sqrt((A0Sg ** 2) + (2 * JSg * VhSg))) / JSg;
            T0sSg = ((- A0Sg) + Math.sqrt((A0Sg ** 2) + (2 * JSg * VsSg))) / JSg;
            XkSg = (JSg / 6) * (T0hSg ** 3 - T0sSg ** 3) + (A0Sg / 2) * (T0hSg ** 2 - T0sSg ** 2);
            }
            //減速距離
            if (VfSg == VhSg) {
                XgSg = 0;
            } else {
                XgSg = (VfSg ** 2 - VhSg ** 2) / (-2 * (AgSg + (SSg / (3.6 * KSg)))) + (VhSg * FrSg);
            }

            //切り下げ開始
            while (XkSg + XgSg > XeSg && ErrSg !== 2) {
                VhSg = VhSg - 0.01;

                //切り下げ過ぎの時
                if (VhSg < VsSg || VhSg < VfSg) {
                    if (VsSg >= VfSg) {
                        VhSg = VsSg;
                    } else {
                        VhSg = VfSg;
                    }

                    //加減速距離の再計算
                    if (VsSg == VhSg) {
                        XkSg = 0;//勾配が強い場合普通に計算すると値が出ず最終的に惰行距離の算出に影響が出る
                        T0sSg = 0;
                        T0hSg = 0;
                    } else {
                        T0hSg = ((- A0Sg) + Math.sqrt((A0Sg ** 2) + (2 * JSg * VhSg))) / JSg;
                        T0sSg = ((- A0Sg) + Math.sqrt((A0Sg ** 2) + (2 * JSg * VsSg))) / JSg;
                        XkSg = (JSg / 6) * (T0hSg ** 3 - T0sSg ** 3) + (A0Sg / 2) * (T0hSg ** 2 - T0sSg ** 2);
                    }
                    if (VfSg == VhSg) {
                        XgSg = 0;
                    } else {
                        XgSg = (VfSg ** 2 - VhSg ** 2) / (-2 * (AgSg + (SSg / (3.6 * KSg)))) + (VhSg * FrSg);
                    }

                    //それでも無理な場合はエラー
                    if (XkSg + XgSg > XeSg) {
                        ErrSg = 2;
                    }
                } else {
                    //切り下げ過ぎでないとき    
                    //加減速距離の再計算
                    if (VsSg == VhSg) {
                        XkSg = 0;//勾配が強い場合普通に計算すると値が出ず最終的に惰行距離の算出に影響が出る
                        T0sSg = 0;
                        T0hSg = 0;
                    } else {
                        T0hSg = ((- A0Sg) + Math.sqrt((A0Sg ** 2) + (2 * JSg * VhSg))) / JSg;
                        T0sSg = ((- A0Sg) + Math.sqrt((A0Sg ** 2) + (2 * JSg * VsSg))) / JSg;
                        XkSg = (J / 6) * (T0hSg ** 3 - T0sSg ** 3) + (A0Sg / 2) * (T0hSg ** 2 - T0sSg ** 2);
                    }
                    if (VfSg == VhSg) {
                        XgSg = 0;
                    } else {
                        XgSg = (VfSg ** 2 - VhSg ** 2) / (-2 * (AgSg + (SSg / (3.6 * KSg)))) + (VhSg * FrSg);
                    }
                }
            }

            //ここまででエラーが出てないとき、所要時間の計算開始
            if (ErrSg == 0) {
                //加速時間
                if (VsSg == VhSg) {
                    TkSg = 0;
                } else {
                    TkSg = T0hSg - T0sSg;
                }

                //減速時間
                if (VfSg == VhSg) {
                    TgSg = 0;
                } else {
                    TgSg = (VfSg - VhSg) / (- (AgSg + (SSg / (3.6 * KSg)))) + FrSg;
                }

                //所要時間
                TsSg = TkSg + TgSg + ((XeSg - XkSg - XgSg) / VhSg);
                Ts2Sg = TkSg + TgSg + ((XeSg - XkSg - XgSg) / VhSg) + 0.0001;//0.0001にかんしては各項の末尾がなぜか.999999...になった時に四捨五入のバグが生じる為追加

                //単位換算、四捨五入
                VhSg = VhSg * 3.6;
                TsSg = Math.round(TsSg);
                Ts2Sg = Math.round(Ts2Sg);
                VhSg = Math.round(VhSg);

                //ver3.1バグ回避用 (たとえば、本来76秒の所が764となったり10倍して4たした数になっていた。)
                if (TsSg * 10 > Ts2Sg) {
                    TsSg = Ts2Sg;
                }
            }

        }

        //結果表示
        if (ErrSg == 0) {
            var hTsSg = document.getElementById('hTsSg');
            hTsSg.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">' + TsSg + '</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">' + VhSg + '</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div>';

            //ver6.0グラフ描画システム
            //グラフ描画のためのSVG要素を生成
            var graphareaSg = document.getElementById('graphareaSg');
            graphareaSg.innerHTML = '<p class ="trbd2">運　転　曲　線</p><svg id = "graph" width = "480" height="270"></svg>';
            //グラフのIDをとっておく
            var graphSg = document.getElementById('graphSg');

            if (VdSg <= 200){
            //速度の補助線を10km/h毎に引く、50km/h毎に太線と数値表示(svg上ではVdがy=7,原点がy=237である)
            VdSg = VdSg * 3.6;
            var vlineSg = 10;
            while (vlineSg <= VdSg) {
                var vlinenoyzahyoSg = 237 - (vlineSg * 230 / VdSg);
                if (vlineSg % 50 == 0) {
                    graphSg.innerHTML += '<line x1="0" y1="' + vlinenoyzahyoSg + '" x2="480" y2="' + vlinenoyzahyoSg + '" stroke="#aaaaaa" stroke-width="1.5px"/>';
                    graphSg.innerHTML += '<text x="25" y="' + vlinenoyzahyoSg + '" class = "small">' + vlineSg + '</text>';
                } else {
                    graphSg.innerHTML += '<line x1="0" y1="' + vlinenoyzahyoSg + '" x2="480" y2="' + vlinenoyzahyoSg + '" stroke="#888888" stroke-width="1px"/>';
                }
                vlineSg += 10;
            }
            }else{//201㌔以上で半分に間引く
            VdSg = VdSg * 3.6;
            var vlineSg = 20;
            while (vlineSg <= VdSg) {
                var vlinenoyzahyoSg = 237 - (vlineSg * 230 / VdSg);
                if (vlineSg % 100 == 0) {
                    graphSg.innerHTML += '<line x1="0" y1="' + vlinenoyzahyoSg + '" x2="480" y2="' + vlinenoyzahyoSg + '" stroke="#aaaaaa" stroke-width="1.5px"/>';
                    graphSg.innerHTML += '<text x="25" y="' + vlinenoyzahyoSg + '" class = "small">' + vlineSg + '</text>';
                } else {
                    graphSg.innerHTML += '<line x1="0" y1="' + vlinenoyzahyoSg + '" x2="480" y2="' + vlinenoyzahyoSg + '" stroke="#888888" stroke-width="1px"/>';
                }
                vlineSg += 20;
            }
            }

            if (XeSg <= 5000){
            //距離の補助線を100m毎に引く、500m毎に太線と数値表示(svg上ではXeがx=470,原点がx=50である)
            var xlineSg = 100;
            while (xlineSg <= XeSg) {
                var xlinenoyzahyoSg = 50 + (xlineSg * 420 / XeSg);//以降線を追加していくため(上書きではなく)graph.innerHTML の後は += とすること。;
                if (xlineSg % 500 == 0) {
                    graphSg.innerHTML += '<line x1="' + xlinenoyzahyoSg + '" y1="0" x2="' + xlinenoyzahyoSg + '" y2="270" stroke="#aaaaaa" stroke-width="1.5px"/>';
                    graphSg.innerHTML += '<text class = "small" x="' + xlinenoyzahyoSg + '" y="252" text-anchor = "middle">' + xlineSg + '</text>';
                } else {
                    graphSg.innerHTML += '<line x1="' + xlinenoyzahyoSg + '" y1="0" x2="' + xlinenoyzahyoSg + '" y2="270" stroke="#888888" stroke-width="1px"/>';
                }
                xlineSg += 100;
            }
            }else{//5001m以上の時半分に間引く
            var xlineSg = 200;
            while (xlineSg <= XeSg) {
                var xlinenoyzahyoSg = 50 + (xlineSg * 420 / XeSg);//以降線を追加していくため(上書きではなく)graph.innerHTML の後は += とすること。;
                if (xlineSg % 1000 == 0) {
                    graphSg.innerHTML += '<line x1="' + xlinenoyzahyoSg + '" y1="0" x2="' + xlinenoyzahyoSg + '" y2="270" stroke="#aaaaaa" stroke-width="1.5px"/>';
                    graphSg.innerHTML += '<text class = "small" x="' + xlinenoyzahyoSg + '" y="252" text-anchor = "middle">' + xlineSg + '</text>';
                } else {
                    graphSg.innerHTML += '<line x1="' + xlinenoyzahyoSg + '" y1="0" x2="' + xlinenoyzahyoSg + '" y2="270" stroke="#888888" stroke-width="1px"/>';
                }
                xlineSg += 200;
            }
            }
            
            //グラフの軸とラベルの描画
            graphSg.innerHTML += '<line x1="50" y1="0" x2="50" y2="270" stroke="white" stroke-width="2px"/><line X1="0" y1="237" x2 = "480" y2="237" stroke="white" stroke-width="2px"/><text x="35" y="252">0</text><text x="267" y="267">距離</text><text class = "small" x="460" y="267">[m]</text><line x1="50" y1="0" x2="42" y2="8" stroke="white" stroke-width="2px"/><line x1="50" y1="0" x2="58" y2="8" stroke="white" stroke-width="2px"/><text x="0" y="125">速</text><text x="0" y="142">度</text><text class="small" x="0" y="10">[km/h]</text><line x1="480" y1="237" x2="472" y2="229" stroke="white" stroke-width="2px"/><line x1="480" y1="237" x2="472" y2="245" stroke="white" stroke-width="2px"/>';
            //加速区間の描画(1秒毎に区切ってtの媒介変数表示で直線を引く,T0sからT0hまでで計算し、x方向にx(T0s)だけ引く)
            var TgraphkasokuSg = T0sSg;
            while (TgraphkasokuSg < T0hSg) {
                var XgparhsitenkasokuSg = 50 + ((JSg * (TgraphkasokuSg ** 3 - T0sSg ** 3) / 6 + A0Sg * (TgraphkasokuSg ** 2 - T0sSg ** 2) / 2) * 420 / XeSg);
                var VgparhsitenkasokuSg = 237 - ((JSg * (TgraphkasokuSg ** 2) / 2 + A0Sg * TgraphkasokuSg) * 3.6 * 230 / VdSg);
                TgraphkasokuSg += 1;
                var XgparhsyutenkasokuSg = 50 + ((JSg * (TgraphkasokuSg ** 3 - T0sSg ** 3) / 6 + A0Sg * (TgraphkasokuSg ** 2 - T0sSg ** 2) / 2) * 420 / XeSg);
                var VgparhsyutenkasokuSg = 237 - ((JSg * (TgraphkasokuSg ** 2) / 2 + A0Sg * TgraphkasokuSg) * 3.6 * 230 / VdSg);
                graphSg.innerHTML += '<line x1="' + XgparhsitenkasokuSg + '" y1="' + VgparhsitenkasokuSg + '" x2="' + XgparhsyutenkasokuSg + '" y2="' + VgparhsyutenkasokuSg + '" stroke="rgb(255, 103, 103)" stroke-width="4px"/>';
            }
            //惰行区間の描画
            graphSg.innerHTML += '<line x1="' + (50 + (XkSg * 420 / XeSg)) + '" y1="' + (237 - (VhSg * 230 / VdSg)) + '" x2="' + (50 + ((XeSg - XgSg) * 420 / XeSg)) + '" y2="' + (237 - (VhSg * 230 / VdSg)) + '" stroke="rgb(255, 245, 153)" stroke-width="4px"/>';
            //空走区間の描画
            XfrSg = FrSg * VhSg / 3.6;
            graphSg.innerHTML += '<line x1="' + (50 + ((XeSg - XgSg) * 420 / XeSg)) + '" y1="' + (237 - (VhSg * 230 / VdSg)) + '" x2="' + (50 + ((XeSg - XgSg + XfrSg) * 420 / XeSg)) + '" y2="' + (237 - (VhSg * 230 / VdSg)) + '" stroke="rgb(153, 255, 153)" stroke-width="4px"/>';
            //減速区間の描画(こっちはv-xの関係が一つの式になっているが疑似的にvgraphgensokuの媒介変数表示でやる,1m/s毎)
            var VgraphgensokuSg = VhSg/ 3.6;
            while (VgraphgensokuSg > VfSg) {
                var XgraphsitengensokuSg = 50 + ((VgraphgensokuSg ** 2 - (VhSg/3.6) ** 2) / (-2 * (AgSg + (SSg / (3.6 * KSg)))) + (XeSg+XfrSg-XgSg)) * 420 / XeSg;
                var VgraphsitengensokuSg = 237 - (VgraphgensokuSg * 3.6 * 230 / VdSg);
                VgraphgensokuSg -= 1;
                var XgraphsyutengensokuSg = 50 + ((VgraphgensokuSg ** 2 - (VhSg/3.6) ** 2) / (-2 * (AgSg + (SSg / (3.6 * KSg)))) + (XeSg+XfrSg-XgSg)) * 420 / XeSg; 
                var VgraphsyutengensokuSg = 237 - (VgraphgensokuSg * 3.6 * 230 / VdSg);
                graphSg.innerHTML += '<line x1="' + XgraphsitengensokuSg + '" y1="' + VgraphsitengensokuSg + '" x2="' + XgraphsyutengensokuSg + '" y2="' + VgraphsyutengensokuSg + '" stroke="#00ffff" stroke-width="4px"/>';
            }
        }

        if (ErrSg == 1) {
            var hTsSg = document.getElementById('hTsSg');
            hTsSg.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div><h2 style="color:rgb(255, 103, 103);">!error!</h2><h3>初速度または終速度もしくは制限速度を設計最高速度よりも大きく設定しないでください！</h3>';
            var graphareaSg = document.getElementById('graphareaSg');
            graphareaSg.innerHTML = '';
        }

        if (ErrSg == 2) {
            var hTsSg = document.getElementById('hTsSg');
            hTsSg.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div><h2 style="color:rgb(255, 103, 103);">!error!</h2><h3>所定キョリ内で終速度まで減速又は加速できません！</h3><h4>値を設定し直してください。もしくは次の区間と統合するなどしてください。</h4>';
            var graphareaSg = document.getElementById('graphareaSg');
            graphareaSg.innerHTML = '';
        }

        if (ErrSg == 3) {
            var hTsSg = document.getElementById('hTsSg');
            hTsSg.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div><h2 style="color:rgb(255, 103, 103);">!error!</h2><h3>初速度または終速度を制限速度よりも大きく設定しないでください！</h3>';
            var graphareaSg = document.getElementById('graphareaSg');
            graphareaSg.innerHTML = '';
        }

        if (ErrSg == 4) {
            var hTsSg = document.getElementById('hTsSg');
            hTsSg.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div><h2 style="color:rgb(255, 103, 103);">!error!</h2><h3>勾配がきつすぎて登れません！</h3><h4>加速度を大きくしてください。</h4>';
            var graphareaSg = document.getElementById('graphareaSg');
            graphareaSg.innerHTML = '';
        }

        if (ErrSg == 5) {
            var hTsSg = document.getElementById('hTsSg');
            hTsSg.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div><h2 style="color:rgb(255, 103, 103);">!error!</h2><h3>勾配がきつすぎて止まれません！</h3><h4>減速度を大きくしてください。</h4>';
            var graphareaSg = document.getElementById('graphareaSg');
            graphareaSg.innerHTML = '';
        }

        if (ErrSg == 7) {
            var hTsSg = document.getElementById('hTsSg');
            hTsSg.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div><h2 style="color:rgb(255, 103, 103);">!error!</h2><h3>勾配がきつすぎて終速度まで到達できません！</h3><h4>終速度を小さくしてください。</h4>';
            var graphareaSg = document.getElementById('graphareaSg');
            graphareaSg.innerHTML = '';
        }

    }

    if (ErrSg == 6) {
        var hTsSg = document.getElementById('hTsSg');
        hTsSg.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div><h2 style="color:rgb(255, 103, 103);">!error!</h2><h3>「車両諸元」と「区間データ」には全ての数値を入力してください！</h3>';
        var graphareaSg = document.getElementById('graphareaSg');
        graphareaSg.innerHTML = '';
    }

}



//ver4.0 曲線制限速度計算ツール用
function curvecalcSg() {
    var RcSg;//曲線半径
    var KcSg;//係数
    var VcSg;//曲線制限速度
    var ErrcSg = 0;//エラーの種類

    RcSg = documentSg.getElementById("Rc").value;
    KcSg = documentSg.getElementById("Kc").value;


    if (RcSg == "" || KcSg == "") {
        ErrcSg = 1;
    }

    VcSg = KcSg * Math.sqrt(RcSg);

    //5km/h単位に切り捨て
    VcSg = Math.floor(VcSg / 5) * 5

    if (ErrcSg == 0) {
        var recSg = document.getElementById('recSg');
        recSg.innerHTML = VcSg;
    }

    if (ErrcSg == 1) {
        var recSg = document.getElementById('recSg');
        recSg.innerHTML = '--';
    }

}

//自動更新システム
timestampSg = 0;

function updateSg() {

    timestampSg++;
    window.requestAnimationFrame(updateSg);

    if (timestampSg % 10 == 0) {
        calcSg();
        curvecalcSg();
    }

}
    
updateSg();

})();
