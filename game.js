const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 575,
  backgroundColor: '#222',
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

let score = 0;
let timeLeft = 60;
let tempoParaNovoAlvo = 1000;
let tempoDeVidaDoAlvo = 2000;
let alvoGroup = [];
let alvoTimer;
let scoreText, timerText;
let jogoComecou = false;
let textoInicial, botaoComecar;
let vidas = 5;
let coracoes = [];
let musica;
let somHit;

function preload() {
  this.load.image('alvo', 'assets/alvo.png');
  this.load.image('cenario', 'assets/cenario.png');
  this.load.image('heart', 'assets/heart.png');
  this.load.audio('musica', 'assets/musicafundo.mp3');
  this.load.audio('hit', 'assets/acerto.mp3');
}

function create() {
  textoInicial = this.add.text(125, 225, 'Bem-vindo ao jogo dos alvos🎯', {
    fontSize: '32px',
    fill: '#fff'
  });

  botaoComecar = this.add.text(300, 300, 'COMEÇAR', {
    fontSize: '28px',
    backgroundColor: '#fff',
    color: '#000',
    padding: { x: 20, y: 10 }
  }).setInteractive();

  botaoComecar.on('pointerdown', () => iniciarJogo.call(this));
}

function iniciarJogo() {
  textoInicial.setVisible(false);
  botaoComecar.setVisible(false);
  jogoComecou = true;

  this.add.image(400, 285, 'cenario').setDepth(-1);

  score = 0;
  timeLeft = 60;
  vidas = 5;
  tempoParaNovoAlvo = 1000;
  tempoDeVidaDoAlvo = 2000;
  alvoGroup = [];

  scoreText = this.add.text(10, 10, 'Pontos: 0', { fontSize: '30px', fill: 'black' });
  timerText = this.add.text(630, 10, 'Tempo: 60', { fontSize: '30px', fill: 'black' });

  coracoes.forEach(coracao => coracao.destroy());
  coracoes = [];
  for (let i = 0; i < vidas; i++) {
    let coracao = this.add.image(740 - i * 35, 60, 'heart').setScale(0.05);
    coracoes.push(coracao);
  }

  this.time.addEvent({
    delay: 1000,
    callback: () => {
      timeLeft--;
      timerText.setText('Tempo: ' + timeLeft);

      if (timeLeft === 45) {
        tempoParaNovoAlvo = 800;
        tempoDeVidaDoAlvo = 1600;
        reiniciarTimerDeAlvo.call(this);
      }
      if (timeLeft === 30) {
        tempoParaNovoAlvo = 600;
        tempoDeVidaDoAlvo = 1200;
        reiniciarTimerDeAlvo.call(this);
      }
      if (timeLeft === 15) {
        tempoParaNovoAlvo = 400;
        tempoDeVidaDoAlvo = 900;
        reiniciarTimerDeAlvo.call(this);
      }

      if (timeLeft <= 0) {
        fimDeJogo.call(this, 'FIM DO TEMPO!');
      }
    },
    loop: true
  });

  alvoTimer = this.time.addEvent({
    delay: tempoParaNovoAlvo,
    callback: () => criarAlvo.call(this),
    loop: true
  });

  musica = this.sound.add('musica', { loop: true });
  musica.setVolume(0.1);
  musica.play();

  somHit = this.sound.add('hit', { volume: 0.05 });
}

function reiniciarTimerDeAlvo() {
  if (alvoTimer) alvoTimer.remove();
  alvoTimer = this.time.addEvent({
    delay: tempoParaNovoAlvo,
    callback: () => criarAlvo.call(this),
    loop: true
  });
}

function criarAlvo() {
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(100, 550);
  const alvo = this.add.image(x, y, 'alvo').setInteractive();
  alvo.setScale(0.3);

  const alvoData = {
    sprite: alvo,
    tempoRestante: tempoDeVidaDoAlvo
  };

  alvo.on('pointerdown', () => {
    score += 10;
    scoreText.setText('Pontos: ' + score);
    somHit.play(); // som instantâneo
    alvo.destroy();
    alvoGroup = alvoGroup.filter(a => a !== alvoData); // remove do grupo
  });

  alvoGroup.push(alvoData);
}

function update(_, delta) {
  if (!jogoComecou) return;

  alvoGroup = alvoGroup.filter(alvoData => {
    alvoData.tempoRestante -= delta;
    if (alvoData.tempoRestante > 0) {
      const scale = Phaser.Math.Clamp(alvoData.tempoRestante / tempoDeVidaDoAlvo, 0, 1);
      alvoData.sprite.setScale(scale * 0.3);
      return true;
    } else {
      alvoData.sprite.destroy();
      perderVida.call(this);
      return false;
    }
  });
}

function perderVida() {
  vidas--;
  if (coracoes[vidas]) coracoes[vidas].destroy();

  if (vidas <= 0) {
    fimDeJogo.call(this, 'FIM DAS VIDAS!');
  }
}

function fimDeJogo(mensagem) {
  jogoComecou = false;
  if (alvoTimer) alvoTimer.remove();
  alvoGroup.forEach(alvo => alvo.sprite.destroy());
  alvoGroup = [];
  musica.stop();

  this.add.text(300, 250, mensagem, { fontSize: '32px', fill: '#ff0' });
  this.add.text(300, 200, 'PONTUAÇÃO: ' + score, { fontSize: '32px', fill: 'red' });

  const botaoTentarNovamente = this.add.text(300, 320, 'TENTE NOVAMENTE', {
    fontSize: '26px',
    backgroundColor: '#fff',
    color: '#000',
    padding: { x: 20, y: 10 }
  }).setInteractive();

  botaoTentarNovamente.on('pointerdown', () => {
    this.scene.restart();
  });
}
