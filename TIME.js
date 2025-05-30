function calc() {

  var Ak;//加速度
  var RAk;//実質加速度
  var Ag;//減速度
  var RAg;//実質減速度
  var Vs;//初速度
  var Vf;//終速度
  var Vh;//最高速度(制限速度)
  var Xe;//駅間距離
  var Ts;//駅間所要時間
  var S;//勾配
  var K;//定数
  var Fr;//空走時間
  var Err = 0;//エラーの種類

  var Ts2;//Ts2はver3.1バグ回避用
  
  Ak = document.getElementById("Ak").value;
  Ag = document.getElementById("Ag").value;
  Vs = document.getElementById("Vs").value;
  Vf = document.getElementById("Vf").value;
  Vh = document.getElementById("Vh").value;
  Xe = document.getElementById("Xe").value;
  S = document.getElementById("S").value;
  K = document.getElementById("K").value;
  Fr = document.getElementById("Fr").value;

  if (Ak == "" || Ag == "" || Vs == "" || Vf == "" || Vh == "" || Xe == "" || S == "" || K == "" || Fr == "") {
    Err = 6;

  } else {

    Ak = Ak / 3.6;
    Ag = Ag / 3.6;
    Vs = Vs / 3.6;
    Vf = Vf / 3.6;
    Vh = Vh / 3.6;



    //Err1の必要性に関しては要審議(Err2に包含される可能性)
    if (Vs > Vf && Xe < ((1.8 * ((Vs * Vs) - (Vf * Vf))) / (3.6 * Ag + (S) / K)) + Vh * Fr) {
      Err = 1;
    }

    if (Vh < Vs || Vh < Vf) {
      Err = 3;
    }

    if ((-3.6 * Ak + (S / K)) >= 0) {
      Err = 4;
    }

    if ((3.6 * Ag + (S / K)) <= 0) {
      Err = 5;
    }

    if (Err !== 1 && Err !== 3 && Err !== 4 && Err !== 5 && Err !== 6) {

      var Xk = ((1.8 * ((Vs * Vs) - (Vh * Vh))) / (-3.6 * Ak + (S / K)));
      //Xgに関しては空走距離も含んでいるのでそのままだと減速なしの時も距離が0でなくなる。質が悪い場合だとそれでXk+Xg>Xeとなってしまう。
      if (Vh == Vf) {
        var Xg = 0;
      } else {
        var Xg = ((1.8 * ((Vh * Vh) - (Vf * Vf))) / (3.6 * Ag + (S / K))) + (Vh * Fr);
      }

      //Err=2の状態のまま繰り返したら困る
      while (Xk + Xg > Xe && Err !== 2) {
        Vh = Vh - 0.01;
        Xk = ((1.8 * ((Vs * Vs) - (Vh * Vh))) / (-3.6 * Ak + (S / K)));
        if (Vh == Vf) {
          Xg = 0;
        } else {
          Xg = ((1.8 * ((Vh * Vh) - (Vf * Vf))) / (3.6 * Ag + (S / K))) + (Vh * Fr);
        }

        if (Vh < Vs || Vh < Vf) {
          if (Vs >= Vf) {
            Vh = Vs;
          } else {
            Vh = Vf;
          }

          Xk = ((1.8 * ((Vs * Vs) - (Vh * Vh))) / (-3.6 * Ak + (S / K)));
          if (Vh == Vf) {
            Xg = 0;
          } else {
            Xg = ((1.8 * ((Vh * Vh) - (Vf * Vf))) / (3.6 * Ag + (S / K))) + (Vh * Fr);
          }

          if (Xk + Xg <= Xe) {
            ;
          } else {
            Err = 2;
          }
        }
      }


      if (Err == 0) {
        if (Vs == Vh || Xk == 0) {
          RAk = 1;
        } else {
          RAk = ((Vh * Vh) - (Vs * Vs)) / (2 * Xk);
        }

        if (Vf == Vh || Xg == 0) {
          RAg = 1;
        } else {
          RAg = ((Vh * Vh) - (Vf * Vf)) / (2 * (Xg - (Fr * Vh)));
        }

        Ts = ((Vh - Vs) / RAk) + ((Vh - Vf) / RAg) + ((Xe - Xk - Xg) / Vh) + Fr;
        Ts2 = ((Vh - Vs) / RAk + 0.0001) + ((Vh - Vf) / RAg + 0.0001) + ((Xe - Xk - Xg) / Vh + 0.0001) + Fr;//0.0001にかんしては各項の末尾がなぜか.999999...になった時に四捨五入のバグが生じる為追加

        
        //実装予定 600メートル条項検知用
        //var Xg600;//Vhから完全停車するための距離
        //Xg600 = ((1.8 * ((Vh * Vh))) / (3.6 * Ag + (S / K))) + (Vh * Fr);
        //if (Xg600 > 600){
        //  Err = 7;
        //  var Vh600;//600mで止まれる最高速度
        //  Vh600 = ( Math.sqrt(( Fr * Fr ) - 4 * ( 1.8 / ( 3.6 * Ag + (S / K) ) ) * ( -600 ) ) - Fr ) / (2 * 1.8 / ( 3.6 * Ag + (S / K) ));
        //}

        //m/s→km/h、四捨五入
        Vh = Vh * 3.6;
        //Vh600 = Vh600 * 3.6;
        Ts = Math.round(Ts);
        Ts2 = Math.round(Ts2);
        Vh = Math.round(Vh);
        //Vh600 = Math.round(Vh600); //ver4.1
        //Xg600 = Math.round(Xg600); //ver4.1

        //ver3.1バグ回避用 (たとえば、本来76秒の所が764となったり10倍して4たした数になっていた。)
        if (Ts*10 > Ts2){
          Ts = Ts2;
        }


      }
    }



    if (Err == 0) {
      var hTs = document.getElementById('hTs');
      hTs.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">' + Ts + '</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">' + Vh + '</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div>';
    }

    //実装予定 600メートル条項用
    //if (Err == 7) {
    //  var hTs = document.getElementById('hTs');
    //  hTs.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">' + Ts + '</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">' + Vh + '</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div><h2 style="color:rgb(255, 255, 0);">!attention!</h2><h4>最高速度から停車するまでに' + Xg600 + 'mが必要です。</h4><h4>600メートル条項を適用する場合で車両性能や勾配を変えないとき、最高速度を' + Vh600 + 'km/h以下に設定してください。</h4>';
    //}

    if (Err == 1) {
      var hTs = document.getElementById('hTs');
      hTs.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div><h2 style="color:rgb(255, 103, 103);">!error!</h2><h3>所定キョリ内で終速度まで減速できません！</h3><h4>初速度をもう少し低く設定するか、次の区間と統合するなどしてください。また、計算の長時間化を避ける為最高速度が極度に大きい場合もこのエラーが出る可能性があります。</h4>';
    }

    if (Err == 2) {
      var hTs = document.getElementById('hTs');
      hTs.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div><h2 style="color:rgb(255, 103, 103);">!error!</h2><h3>所定キョリ内で終速度まで減速又は加速できません！</h3><h4>値を設定し直してください。もしくは次の区間と統合するなどしてください。</h4>';
    }

    if (Err == 3) {
      var hTs = document.getElementById('hTs');
      hTs.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div><h2 style="color:rgb(255, 103, 103);">!error!</h2><h3>初速度または終速度を最高速度よりも大きく設定しないでください！</h3>';
    }

    if (Err == 4) {
      var hTs = document.getElementById('hTs');
      hTs.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div><h2 style="color:rgb(255, 103, 103);">!error!</h2><h3>勾配がきつすぎて登れません！</h3><h4>加速度を大きくしてください。</h4>';
    }

    if (Err == 5) {
      var hTs = document.getElementById('hTs');
      hTs.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div><h2 style="color:rgb(255, 103, 103);">!error!</h2><h3>勾配がきつすぎて止まれません！</h3><h4>減速度を大きくしてください。</h4>';
    }

  }

  if (Err == 6) {
    var hTs = document.getElementById('hTs');
    hTs.innerHTML = '<div style = "display: flex; height :50%;align-items: flex-end;"></br><table><tr><td width = 150px><div style ="font-size:30px;border: 0;">所要時間</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">秒</div></td></tr><tr><td width = 150px><div style ="font-size:30px;border: 0;">最高速度</div></td><td width = 150px style="text-align: end;font-family: Impact;color:rgb(255, 103, 103);"><div style ="font-size:30px;border: 0;">--</div></td><td><div style ="font-size:25px;border: 0;">km/h</div></td></tr></table></div><h2 style="color:rgb(255, 103, 103);">!error!</h2><h3>全ての数値を入力してください！</h3>';
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

let text_form = document.getElementById('container');

timestamp = 0;

function update() {

  timestamp++;
  window.requestAnimationFrame(update);

  if (timestamp % 10 == 0) {
    calc();
    curvecalc();
  }

}



update();
