// Debug 開關
let showDebugOnScreen = false; // 是否顯示左上角與縮圖的 debug 訊息（預設關閉）
// 多動畫設定
let animations = {
  // 靜止狀態
  stop: { img: null, srcCandidates: ['1/stop/0.png'], frameWidth: 46, frameHeight: 47, totalFrames: 1, frameDelay: 8, displayWidth: 92, displayHeight: 94 },
  // 四個移動方向的動畫
  goUp: { img: null, srcCandidates: ['1/go/all.png'], frameWidth: 51, frameHeight: 51, totalFrames: 4, frameDelay: 6, displayWidth: 102, displayHeight: 102 },
  goDown: { img: null, srcCandidates: ['1/go/all.png'], frameWidth: 51, frameHeight: 51, totalFrames: 4, frameDelay: 6, displayWidth: 102, displayHeight: 102 },
  goLeft: { img: null, srcCandidates: ['1/go/all.png'], frameWidth: 51, frameHeight: 51, totalFrames: 4, frameDelay: 6, displayWidth: 102, displayHeight: 102 },
  goRight: { img: null, srcCandidates: ['1/go/all.png'], frameWidth: 51, frameHeight: 51, totalFrames: 4, frameDelay: 6, displayWidth: 102, displayHeight: 102 },
  // 特殊動作
  punch: { img: null, srcCandidates: ['1/打/all.png'], frameWidth: 60, frameHeight: 60, totalFrames: 13, frameDelay: 5, displayWidth: 120, displayHeight: 120 },

  // 新增：左邊的第二個角色（精靈表）
  // 加入常見可能路徑，確保 preload 有更多嘗試來源
  leftChar: { img: null, srcCandidates: ['2/stop_2.png', '2/stop_2/stop_2.png', '2/stop_2/all.png'], frameWidth: 40, frameHeight: 35, totalFrames: 3, frameDelay: 8, displayWidth: 80, displayHeight: 70 },
  // 新增：右邊的第三個角色（精靈表，3/stop_3 資料夾，12 幀，整張圖 343x24）
  // 新增：角色2的注視動畫 (150x39, 5幀)
  leftCharLook: { img: null, srcCandidates: ['2/look.png', '2/look/look.png', '2/look/all.png'], frameWidth: 30, frameHeight: 39, totalFrames: 5, frameDelay: 8, displayWidth: 60, displayHeight: 78 },
  // 新增：角色2的生氣動畫 (709x36, 17幀)
  leftCharAnger: { img: null, srcCandidates: ['2/生氣.png', '2/生氣/all.png'], frameWidth: 41, frameHeight: 36, totalFrames: 17, frameDelay: 5, displayWidth: 82, displayHeight: 72 },
  // 說明：
  //  - frameWidth/frameHeight：來源精靈格的寬/高（如果不正確，程式會在 runtime 自動計算）
  //  - displayWidth/displayHeight：畫面上要顯示的大小（可在此直接調整）
  rightChar: { img: null, srcCandidates: ['3/stop_3.png', '3/stop_3/stop_3.png', '3/stop_3/all.png'], frameWidth: 49, frameHeight: 24, totalFrames: 12, frameDelay: 6, displayWidth: 112, displayHeight: 96},
  // 新增：角色3的說話動畫 (256x39, 9幀)
  rightCharSpeak: { img: null, srcCandidates: ['3/speak.png', '3/speak/speak.png', '3/speak/all.png'], frameWidth: 28, frameHeight: 39, totalFrames: 9, frameDelay: 6, displayWidth: 56, displayHeight: 78 },
  // 新增：角色3的跌倒動畫 (769x39, 18幀)
  rightCharFall: { img: null, srcCandidates: ['3/跌倒.png', '3/跌倒/all.png'], frameWidth: 42, frameHeight: 39, totalFrames: 18, frameDelay: 5, displayWidth: 84, displayHeight: 78 },
  // 新增：角色4 (4/站, 203x62, 5 frames)
  char4Stand: { img: null, srcCandidates: ['4/站.png', '4/站/all.png'], frameWidth: 50, frameHeight: 62, totalFrames: 4, frameDelay: 10, displayWidth: 100, displayHeight: 124 },
  // 新增：角色5 (5/站著, 199x40, 5 frames)
  char5Stand: { img: null, srcCandidates: ['5/站著.png', '5/站著/all.png'], frameWidth: 50, frameHeight: 40, totalFrames: 4, frameDelay: 10, displayWidth: 100, displayHeight: 80 },
  // 新增：左下角禮物角色 (147x42, 5 frames)
  giftChar: { img: null, srcCandidates: ['禮物/all.png', '禮物.png', '禮物/禮物.png'], frameWidth: 29, frameHeight: 42, totalFrames: 5, frameDelay: 10, displayWidth: 58, displayHeight: 84 }
};
let currentAnim = 'stop';
let currentFrame = 0;
let animateSprite = true; // 是否播放動畫；若為 false，角色會停在 idleFrame
let idleFrame = 0; // 默認靜止幀

// player movement
let playerX, playerY, velocityX = 0, speed = 5;
let keyRightPressed = false, keyLeftPressed = false, keyUpPressed = false, keyDownPressed = false;
let facingLeft = false;
let movementAllowed = true; // false while playing one-shot punch
let oneShotAnimName = null;
let oneShotStartFrame = 0;

// NPC 狀態管理 (角色2)
let char2State = 'idle'; // 'idle', 'hit'
let char2StateStartFrame = 0;
// 新增：角色2的對話狀態管理
let char2ConversationState = 'idle'; // 'idle', 'asking', 'waitingInput', 'greeting', 'quizQuestion', 'quizCorrect', 'quizIncorrect', 'givingReward', 'postQuizIdle'
let char2GreetingEndFrame = 0; // 用於控制問候語顯示時長
let playerName = ''; // 儲存玩家輸入的暱稱
let nameInput = null; // 儲存 p5.js 的 input 物件
let quizButtons = []; // 儲存選擇題按鈕
let rose = {
  state: 'none', // 'none', 'onGround', 'withPlayer'
  x: 0,
  y: 0,
  pickupRadius: 80,
};
let hamburger = {
  state: 'none', // 'none', 'onGround', 'withPlayer'
  x: 0,
  y: 0,
  pickupRadius: 80,
};
let hasReceivedRose = false; // 是否曾經獲得玫瑰
let hasReceivedHamburger = false; // 新增：是否曾經獲得漢堡
let hasLostRoseToChar3 = false; // 是否曾經在角色3處失去玫瑰
let hasAttackedNPC = false; // 新增：是否攻擊過NPC (角色2或3)
let char4Gift = null; // 新增：送給角色4的禮物
let char5Gift = null; // 新增：送給角色5的禮物
let isBackpackOpen = false; // 新增：背包是否開啟
let quizTimer = { active: false, startTime: 0, duration: 10 }; // 新增：倒數計時器 (10秒)
// NPC 狀態管理

// --- 新增：對話管理器 ---
let dialogManager = {
  isActive: false,
  fullText: '',
  visibleText: '',
  visibleLength: 0,
  speed: 2, // 每隔幾幀顯示一個字
  lastUpdateFrame: 0,
  character: null, // 正在說話的角色物件 {x, y, anim}
};
let char3ConversationState = 'idle'; // 'idle', 'seesRose', 'startsQuiz', 'asksQuestion', 'quizQuestion_char3', 'quizIncorrect_char3'
let char3DialogTimer = 0;

let char3State = 'idle'; // 'idle', 'falling', 'down'
let char3StateStartFrame = 0;
let char3DownDuration = 60; // 倒在地上停留的影格數 (120 frames ≈ 2 秒 @ 60fps)
let char3Alpha = 255; // 新增：角色3透明度
let char3FadingOut = false; // 新增：角色3是否正在淡出
let gameEnded = false; // 新增：遊戲是否結束
let gameEndFrame = 0; // 新增：遊戲結束時的幀數
let endScreenAlpha = 0; // 新增：結局畫面透明度
let finalImageAlpha = 0; // 新增：最終圖片淡入透明度
let finalSceneDialogueStep = 0; // 新增：最終場景對話步驟
let finalSceneTimer = 0; // 新增：最終場景對話計時器
let bgImage5678; // 新增：結局後的背景圖
let gameStartTime = 0; // 新增：遊戲開始時間
let gameStarted = false; // 新增：遊戲開始狀態
let showWarning = false; // 新增：是否顯示警告畫面
let warningStartTime = 0; // 新增：警告畫面開始時間
let char4Pos = { x: 0, y: 0, initialized: false }; // 新增：角色4的位置與追逐狀態
let char4State = 'normal'; // 新增：角色4狀態
let char4StunEndFrame = 0; // 新增：角色4暈眩結束時間
let char4WasAttacked = false; // 新增：角色4是否被攻擊過
let char5Pos = { x: 0, y: 0, initialized: false }; // 新增：角色5的位置
let behaviorismQuestions = [
  { q: "拿掉厭惡的刺激以增加行為反應，稱為什麼？", options: ["正增強", "負增強", "施予式懲罰"], answer: "負增強", hint: "移除不喜歡的事物" },
  { q: "班杜拉提出的「替代學習」是指？", options: ["親身經歷S-R聯結", "觀察別人行為後果而學習", "透過操作制約學習"], answer: "觀察別人行為後果而學習", hint: "看著別人做" },
  { q: "「下課時必須留在教室」屬於哪種行為改變技術？", options: ["正增強", "負增強", "撤離式懲罰"], answer: "撤離式懲罰", hint: "拿走喜歡的時間" },
  { q: "班杜拉的社會學習論強調哪三者的互動？", options: ["環境、個人、行為", "刺激、反應、後果", "本我、自我、超我"], answer: "環境、個人、行為", hint: "交互決定論" },
  { q: "「給予想要的刺激」以增加反應，稱為什麼？", options: ["正增強", "負增強", "施予式懲罰"], answer: "正增強", hint: "給糖吃" },
  { q: "華生進行的「小艾伯特實驗」是關於什麼？", options: ["古典制約", "操作制約", "社會學習"], answer: "古典制約", hint: "白鼠與巨大聲響" },
  { q: "桑代克提出的學習定律中，強調反應後果影響連結強度的是？", options: ["練習律", "準備律", "效果律"], answer: "效果律", hint: "滿意的結果會增強連結" },
  { q: "史金納箱主要用來研究什麼？", options: ["古典制約", "操作制約", "觀察學習"], answer: "操作制約", hint: "壓桿得食" },
  { q: "古典制約中，原本不會引起反應的刺激稱為？", options: ["非制約刺激", "制約刺激", "中性刺激"], answer: "中性刺激", hint: "一開始沒反應" },
  { q: "下列何者不是班杜拉提出的模仿方式？", options: ["直接模仿", "綜合模仿", "潛意識模仿"], answer: "潛意識模仿", hint: "班杜拉強調認知過程" }
];
let char5Questions = [
  { q: "兒童做完較不喜歡的活動後，可做較喜歡的活動，這是？", options: ["普力馬原則", "彼得原則", "帕累托法則"], answer: "普力馬原則", hint: "老祖母的法則" },
  { q: "消弱初期，行為頻率反而增加的現象稱為？", options: ["消弱陡增", "自然恢復", "類化作用"], answer: "消弱陡增", hint: "迴光返照" },
  { q: "樂透屬於哪種強化時程？", options: ["固定時距", "變動時距", "變動比率"], answer: "變動比率", hint: "次數不固定" },
  { q: "「暫停法」屬於哪種懲罰？", options: ["呈現型懲罰", "撤離型懲罰", "體罰"], answer: "撤離型懲罰", hint: "隔離" },
  { q: "逐步增強接近目標行為的反應，稱為？", options: ["塑造", "類化", "辨別"], answer: "塑造", hint: "一步步來" },
  { q: "桑代克的效果律是指刺激反應的聯結視什麼而定？", options: ["練習次數", "身心準備", "反應後的獎賞"], answer: "反應後的獎賞", hint: "結果決定連結" },
  { q: "金錢、成績屬於哪種類型的增強物？", options: ["原級增強物", "次級增強物", "內在增強物"], answer: "次級增強物", hint: "學習來的價值" },
  { q: "一朝被蛇咬，十年怕井繩，是古典制約的什麼現象？", options: ["類化", "辨別", "消弱"], answer: "類化", hint: "類似的都怕" }
];
let availableQuestions = []; // 新增：尚未出過的題目池
let availableQuestionsChar5 = []; // 新增：角色5的可用題目池
let currentChar4Question = null; // 儲存當前隨機抽取的題目
let char4CorrectCount = 0; // 新增：角色4問答答對題數
let char4QuestionCount = 0; // 新增：角色4已問題數
let char5CorrectCount = 0; // 新增：角色5問答答對題數
let char5QuestionCount = 0; // 新增：角色5已問題數
let currentChar5Question = null; // 新增：角色5的題目
let selectedFinalItem = null; // 新增：最終選擇的物品
let showStatsScreen = false; // 新增：是否顯示統計畫面
let statsScreenStartFrame = 0; // 新增：統計畫面開始幀
let statsText1 = "";
let statsText2 = "";
let statsText3 = "";
let statsText4 = ""; // 新增：特殊成就文字
let gameSpeed = 1; // 新增：遊戲速度倍率
let gameFrameCount = 0; // 新增：受速度影響的遊戲幀數
let speedBtn; // 新增：速度調整按鈕

function preload() {
  bgImage5678 = loadImage('背景/5678.jpg');
  // 載入所有動畫的圖檔 (每個動畫可能有多個候選來源)
  for (const key in animations) {
    const anim = animations[key];
    // if directly a src string, treat it as single candidate
    const candidates = anim.srcCandidates || (anim.src ? [anim.src] : []);
    const tryLoad = (idx) => {
      if (idx >= candidates.length) {
        console.warn(`No sprite loaded for ${key}`);
        return;
      }
      const src = candidates[idx];
      loadImage(src, (img) => {
        anim.img = img;
        console.log(`${key} sprite loaded OK from`, src);
      }, (err) => {
        console.warn(`${key} sprite load failed from`, src, err);
        tryLoad(idx + 1);
      });
    };
    tryLoad(0);
  }
}

function setup() {
  console.log('setup() called');
  const cnv = createCanvas(windowWidth, windowHeight);
  // 讓 p5 的 canvas 背景透明，顯示 CSS 背景圖
  cnv.elt.style.background = 'transparent';
  cnv.style('position', 'fixed'); // 與 CSS canvas 設定一致
  cnv.style('left', '0');
  cnv.style('top', '0');
  // 如果不希望 canvas 攔截滑鼠事件，可開啟下一行
  // cnv.elt.style.pointerEvents = 'none';
  // 初始化玩家位置與速度
  playerX = width / 2;
  playerY = height / 2;
  velocityX = 0;
  speed = 5;
  keyRightPressed = false;
  keyLeftPressed = false;
  keyUpPressed = false;
  keyDownPressed = false;
  // 確認動畫圖檔資訊 (如無載入會在 draw 時被跳過)
  
  // 初始化可用題目池
  availableQuestions = [...char5Questions]; // 角色4 改用 char5Questions
  availableQuestionsChar5 = [...behaviorismQuestions]; // 角色5 改用 behaviorismQuestions
  
  // 新增：速度調整按鈕
  speedBtn = createButton('速度: 1x');
  speedBtn.position(width - 100, 20);
  speedBtn.mousePressed(() => {
    if (gameSpeed === 1) {
      gameSpeed = 2;
      speedBtn.html('速度: 2x');
    } else {
      gameSpeed = 1;
      speedBtn.html('速度: 1x');
    }
  });
  speedBtn.style('font-size', '16px');
  speedBtn.style('padding', '5px 10px');
  speedBtn.style('background-color', '#fff');
  speedBtn.style('border', '2px solid #000');
  speedBtn.style('border-radius', '5px');
  speedBtn.style('cursor', 'pointer');
  
  console.log('setup finished, canvas size', width, height);
}

function draw() {
  // 不要使用 background(...)，改用 clear() 來清除繪圖層（保留透明）
  clear();
  
  // --- 新增：更新遊戲幀數 (根據速度倍率) ---
  gameFrameCount += gameSpeed;

  // --- 新增：開始畫面 ---
  if (!gameStarted) {
    if (showWarning) {
      let elapsed = millis() - warningStartTime;
      if (elapsed > 3000) {
        gameStarted = true;
        gameStartTime = millis();
      }
      // 淡入效果：前 1 秒從 0 到 255
      let alpha = constrain(map(elapsed, 0, 1000, 0, 255), 0, 255);
      drawWarningOverlay(alpha); 
      return;
    }
    push();
    fill(0, 180); // 半透明黑色背景
    noStroke();
    rect(0, 0, width, height);
    
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(48);
    text("點擊畫面開始遊戲", width / 2, height / 2);
    textSize(24);
    if (gameFrameCount % 60 < 40) text("- Click to Start -", width / 2, height / 2 + 60);
    textSize(20);
    text("按←↑↓→鍵移動，'空格'鍵攻擊", width / 2, height / 2 + 100);
    pop();
    return; // 暫停執行後續遊戲邏輯
  }

  // --- 新增：角色3答錯或攻擊懲罰時的背景特效 ---
  if (char3ConversationState === 'quizIncorrect_char3' || char3ConversationState === 'punishing' || char2ConversationState === 'punishing') {
    push();
    // 紅色閃爍效果：利用 sin 函數讓透明度在 100~200 之間變化
    let alphaVal = map(sin(gameFrameCount * 0.2), -1, 1, 100, 200); 
    fill(80, 0, 0, alphaVal); // 深紅色遮罩
    noStroke();
    rect(0, 0, width, height);
    pop();
  }

  // --- 新增：更新對話管理器 ---
  updateDialog();
  
  // --- 新增：繪製倒數計時器 ---
  drawQuizTimer();

  // 決定當前 animation: one-shot > movement > stop
  if (oneShotAnimName) {
    currentAnim = oneShotAnimName;
  } else if (keyUpPressed) {
    currentAnim = 'goUp';
  } else if (keyDownPressed) {
    currentAnim = 'goDown';
  } else if (keyLeftPressed) { // 當按下左鍵
    currentAnim = 'goLeft';
    facingLeft = false; // 不翻轉，使用素材原始的朝左方向
  } else if (keyRightPressed) { // 當按下右鍵
    currentAnim = 'goRight';
    facingLeft = true; // 翻轉素材，使其朝右
  } else {
    currentAnim = 'stop';
  }
  const anim = animations[currentAnim];
  if (!anim || !anim.img) {
    // 如果資源沒載入就畫一個 placeholder（方便確認 playerX/Y 是否正確）
    fill(255, 0, 255);
    noStroke();
    ellipse(playerX, playerY, 32, 32);
    return;
  }

  // --- 動畫邏輯 ---
  const cols = max(1, floor(anim.img.width / anim.frameWidth));
  const rows = max(1, floor(anim.img.height / anim.frameHeight));
  const actualFrames = cols * rows;
  const framesCount = min(anim.totalFrames, actualFrames);
  
  if (oneShotAnimName === currentAnim) {
    // one-shot animation plays from its start until finished then stops
    const elapsed = gameFrameCount - oneShotStartFrame; // 經過的幀數
    const frameIndex = floor(elapsed / anim.frameDelay);
    if (frameIndex >= framesCount) {
      // finished
      oneShotAnimName = null;
      movementAllowed = true;
      currentAnim = 'stop';
      currentFrame = 0;
    } else {
      currentFrame = frameIndex;
    }
  } else if (animateSprite) {
    currentFrame = floor(gameFrameCount / anim.frameDelay) % framesCount;
  } else {
    currentFrame = idleFrame; // 站在原地（靜止）
  }
  
  // 計算要繪製的精靈位置
  let sx = (currentFrame % cols) * anim.frameWidth;
  let sy = floor(currentFrame / cols) * anim.frameHeight;
  
  // --- 玩家移動邏輯 ---
  let velocityY = 0;
  if (!movementAllowed || isBackpackOpen || ((finalSceneDialogueStep === 11 || finalSceneDialogueStep === 12 || finalSceneDialogueStep === 13) && char4State !== 'stunned') || finalSceneDialogueStep >= 27) {
    // during one-shot animation or if backpack is open, freeze movement
    velocityX = 0;
    velocityY = 0;
  } else if (keyRightPressed) {
    velocityX = speed * gameSpeed; // 乘上遊戲速度
    // facingLeft 的設定移到上面動畫選擇區塊，這裡只管速度
  } else if (keyLeftPressed) {
    velocityX = -speed * gameSpeed; // 乘上遊戲速度
    // facingLeft 的設定移到上面動畫選擇區塊，這裡只管速度
  } else {
    velocityX = 0;
  }
  
  if (movementAllowed && !isBackpackOpen) {
      if (keyUpPressed) {
        velocityY = -speed * gameSpeed; // 乘上遊戲速度
      } else if (keyDownPressed) {
        velocityY = speed * gameSpeed; // 乘上遊戲速度
      }
  }

  playerX += velocityX;
  playerY += velocityY;
  
  playerX = constrain(playerX, anim.frameWidth / 2, width - anim.frameWidth / 2);
  playerY = constrain(playerY, anim.frameHeight / 2, height - anim.frameHeight / 2);

  // --- 新增：如果輸入框存在，則更新其位置以跟隨玩家 ---
  if (nameInput) {
    nameInput.position(playerX - 75, playerY - 60);
  }
  // --- 新增：如果選擇題按鈕存在，更新位置跟隨玩家 ---
  if (quizButtons.length > 0) {
    quizButtons.forEach((btn, index) => {
      btn.position(playerX - 75, playerY + 20 + index * 35);
    });
  }

  // 在畫布 playerX/playerY 繪製動畫

  // --- Y-Sort 繪圖順序調整 ---
  // 建立一個包含所有要繪製角色的陣列
  let drawables = [];

  // 1. 加入玩家角色
  drawables.push({
    y: playerY,
    draw: () => {
      imageMode(CENTER);
      push();
      translate(playerX, playerY);
      if (facingLeft) scale(-1, 1);
      
      const pW = anim.displayWidth || anim.frameWidth;
      const pH = anim.displayHeight || anim.frameHeight;
      image(anim.img, 0, 0, pW, pH, sx, sy, anim.frameWidth, anim.frameHeight);
      pop();

      // --- 新增：如果玩家有玫瑰，且還沒拿到漢堡（拿到漢堡後就收進背包），就在這裡畫出來 ---
      if (rose.state === 'withPlayer' && hamburger.state !== 'withPlayer') {
        push();
        translate(playerX, playerY); // 再次移動到玩家位置
        textSize(48); // 調整 emoji 大小
        // 讓玫瑰在角色頭旁邊，並根據朝向調整位置
        const roseXOffset = facingLeft ? (pW / 2 + 5) : -(pW / 2 + 5); // 根據翻轉方向調整
        text('🌹', roseXOffset, -pH / 2 - 5); // 顯示在頭頂
        pop();
      }
    }
  });

  // 新增：如果玫瑰在地上，也加入繪製列表
  if (rose.state === 'onGround') {
    drawables.push({
      y: rose.y,
      draw: () => {
        push();
        textSize(48);
        textAlign(CENTER, CENTER);
        // 彈跳效果：利用 sin 函數讓 Y 軸上下浮動
        let bounceY = sin(gameFrameCount * 0.15) * 5;
        text('🌹', rose.x, rose.y + bounceY);
        pop();
      }
    });
  }

  // 新增：如果漢堡在地上，也加入繪製列表
  if (hamburger.state === 'onGround') {
    drawables.push({
      y: hamburger.y,
      draw: () => {
        push();
        textSize(48);
        textAlign(CENTER, CENTER);
        // 彈跳效果
        let bounceY = sin(gameFrameCount * 0.15) * 5;
        text('🍔', hamburger.x, hamburger.y + bounceY);
        pop();
      }
    });
  }

  // 2. 加入左邊角色 (角色2)
  const leftAnim = animations.leftChar;
  if (leftAnim && leftAnim.img) {
    const fixedX = width - 500; // 原本角色3的位置
    const fixedY = height * 0.5;
    drawables.push({
      y: fixedY,
      draw: () => {
        // --- 互動邏輯 ---
        const triggerDistance = 200;
        const d = dist(playerX, playerY, fixedX, fixedY);
        const isLooking = d < triggerDistance;

        // --- 修正：先決定當前動畫，再繪製對話框 ---
        let activeAnim;
        let currentFrameIndex;

        // 根據角色狀態決定動畫
        if (char2State === 'hit') {
          const angerAnim = animations.leftCharAnger;
          activeAnim = angerAnim;
          const elapsed = gameFrameCount - char2StateStartFrame;
          currentFrameIndex = floor(elapsed / angerAnim.frameDelay);
          if (currentFrameIndex >= angerAnim.totalFrames) {
            // 動畫播放完畢，恢復 idle 狀態
            char2State = 'idle';
          }
        } else { // 'idle' 狀態
          const lookAnim = animations.leftCharLook;
          activeAnim = (isLooking && lookAnim && lookAnim.img) ? lookAnim : leftAnim;
          currentFrameIndex = floor(gameFrameCount / activeAnim.frameDelay) % activeAnim.totalFrames;
        }
        if (!activeAnim) activeAnim = leftAnim; // 確保 activeAnim 永遠有值

        // --- 新增：對話流程控制 ---
        if (char2State === 'idle') { // 只有在非戰鬥狀態下才能對話
          if (isLooking && hamburger.state === 'withPlayer' && rose.state === 'withPlayer') {
            // 最終結局對話流程：當玩家同時擁有漢堡和玫瑰時觸發
            if (char2ConversationState !== 'finalGreeting' && 
                char2ConversationState !== 'finalPreQuestion' && 
                char2ConversationState !== 'finalAsk' && 
                char2ConversationState !== 'finalQuestion' &&
                char2ConversationState !== 'finalAnswered_Happy' &&
                char2ConversationState !== 'finalAnswered_Unhappy_1' &&
                char2ConversationState !== 'finalAnswered_Unhappy_2' &&
                char2ConversationState !== 'finalAnswered_Unhappy_3') {
                char2ConversationState = 'finalGreeting';
                char2GreetingEndFrame = gameFrameCount + 180; // 3秒
            } else if (char2ConversationState === 'finalGreeting' && gameFrameCount > char2GreetingEndFrame) {
                char2ConversationState = 'finalPreQuestion';
                char2GreetingEndFrame = gameFrameCount + 180; // 3秒
            } else if (char2ConversationState === 'finalPreQuestion' && gameFrameCount > char2GreetingEndFrame) {
                char2ConversationState = 'finalAsk';
                char2GreetingEndFrame = gameFrameCount + 120; // 2秒
            } else if (char2ConversationState === 'finalAsk' && gameFrameCount > char2GreetingEndFrame) {
                char2ConversationState = 'finalQuestion';
            } else if (char2ConversationState === 'finalAnswered_Unhappy_1' && gameFrameCount > char2GreetingEndFrame) {
                char2ConversationState = 'finalAnswered_Unhappy_2';
                char2GreetingEndFrame = gameFrameCount + 180; // 3秒
            } else if (char2ConversationState === 'finalAnswered_Unhappy_2' && gameFrameCount > char2GreetingEndFrame) {
                char2ConversationState = 'finalAnswered_Unhappy_3';
                char2GreetingEndFrame = gameFrameCount + 180; // 3秒
            } else if ((char2ConversationState === 'finalAnswered_Happy' || char2ConversationState === 'finalAnswered_Unhappy_3') && gameFrameCount > char2GreetingEndFrame) {
                // 當最後一句話說完後，觸發遊戲結束
                if (!gameEnded) {
                    gameEnded = true;
                    gameEndFrame = gameFrameCount; // 記錄結束時間
                }
            }
          } else if (isLooking && char2ConversationState === 'idle' && !playerName) {
            // 1. 玩家靠近，且尚未問過姓名 -> 開始詢問
            char2ConversationState = 'asking';
          } else if (isLooking && char2ConversationState === 'greeting') {
            // 2. 如果問候語顯示完畢，切換到準備提問的狀態
            if (gameFrameCount > char2GreetingEndFrame) {
              char2ConversationState = 'quizQuestion';
              startQuizTimer(); // 開始計時
            }
          } else if (isLooking && char2ConversationState === 'quizCorrect') {
            // 答對後，切換到給予獎勵的狀態
            if (gameFrameCount > char2GreetingEndFrame) {
              char2ConversationState = 'givingReward';
              char2GreetingEndFrame = gameFrameCount + 180; // 獎勵台詞顯示3秒
            }
          } else if (isLooking && char2ConversationState === 'quizIncorrect') {
            // 3. 如果答錯提示顯示完畢，回到提問狀態
            if (gameFrameCount > char2GreetingEndFrame) {
              char2ConversationState = 'quizQuestion';
              startQuizTimer(); // 重新開始計時
            }
          } else if (isLooking && (char2ConversationState === 'postQuizIdle' || char2ConversationState === 'idle') && hasReceivedRose && rose.state === 'none') {
            // 新增：如果曾經拿過玫瑰但現在沒了（被收走），觸發再次挑戰
            char2ConversationState = 'roseLost_fail';
            char2GreetingEndFrame = gameFrameCount + 120;
          } else if (!isLooking) {
            // 4. 玩家離開，重置對話狀態 (如果還沒輸入完)
            if (char2ConversationState !== 'idle') {
              char2ConversationState = (rose.state !== 'none') ? 'postQuizIdle' : (playerName ? 'postQuizIdle' : 'idle');
              dialogManager.isActive = false; // 玩家離開，關閉對話
              stopQuizTimer(); // 停止計時
              if (nameInput) {
                nameInput.remove();
                nameInput = null;
              }
            }
          }
        }

        // --- 繪製對話框 (根據對話狀態) ---
        const characterInfo = { x: fixedX, y: fixedY, anim: activeAnim };
        if (isLooking && finalSceneDialogueStep === 0) {
          if (char2ConversationState === 'punishing') {
            startDialog("你怎麼可以這樣?我要懲罰你", characterInfo);
          } else if (char2ConversationState === 'finalGreeting') {
            startDialog("你完成了我們的旅程", characterInfo);
          } else if (char2ConversationState === 'finalPreQuestion') {
            startDialog("接下來是最後一個問題了", characterInfo);
          } else if (char2ConversationState === 'finalAsk') {
            startDialog("請問......", characterInfo);
          } else if (char2ConversationState === 'finalQuestion') {
            startDialog("你今天開心嗎?", characterInfo);
            if (!nameInput) startNameInput(); // 顯示輸入框
          } else if (char2ConversationState === 'finalAnswered_Happy') {
            startDialog("那希望你能天天開心!", characterInfo);
          } else if (char2ConversationState === 'finalAnswered_Unhappy_1') {
            startDialog("如果雨季遲遲沒有結束......", characterInfo);
          } else if (char2ConversationState === 'finalAnswered_Unhappy_2') {
            startDialog("我會陪你一起淋雨", characterInfo);
          } else if (char2ConversationState === 'finalAnswered_Unhappy_3') {
            startDialog("希望你能開心起來", characterInfo);
          } else if (char2ConversationState === 'asking' || char2ConversationState === 'waitingInput') {
            startDialog("你好，請問怎麼稱呼你？", characterInfo);
            if (char2ConversationState === 'asking') {
              char2ConversationState = 'waitingInput'; // 切換狀態
              startNameInput(); // 建立輸入框
            }
          } else if (char2ConversationState === 'greeting') {
            startDialog(`${playerName}你好，很高興認識你`, characterInfo);
          } else if (char2ConversationState === 'quizQuestion') {
            if (hasReceivedRose) {
              startDialog("正常人的在鮑氏囊中的濾液，不應含有下列哪種物質？", characterInfo);
            } else {
              startDialog("肺臟為人體的重要的呼吸器官也是排泄器官，請問肺臟排泄出的廢物主要是經由人體細胞內的哪一項構造所製造的？", characterInfo);
            }
            
            // 檢查計時器：若超時則視為答錯
            checkQuizTimer(() => {
               if (nameInput) { nameInput.remove(); nameInput = null; }
               char2ConversationState = 'quizIncorrect';
               char2GreetingEndFrame = gameFrameCount + 90;
            });

            // 只有在沒有輸入框時才建立，防止重複
            if (!nameInput) {
              startNameInput();
            }
          } else if (char2ConversationState === 'quizCorrect') {
            startDialog("回答正確!!", characterInfo);
          } else if (char2ConversationState === 'givingReward') {
            let rewardText = hasLostRoseToChar3 ? "加油吧，去戰勝他" : "你通過了我的考驗，這是給你的獎勵。按下A領取你的獎勵吧";
            startDialog(rewardText, characterInfo);
            if (rose.state === 'none') { // 只掉落一次
              rose.state = 'onGround';
              rose.x = fixedX;
              rose.y = fixedY + (activeAnim.displayHeight || activeAnim.img.height) / 2;
              hasReceivedRose = true; // 標記已獲得過
            }
          } else if (char2ConversationState === 'quizIncorrect') {
            startDialog("再想想吧......", characterInfo);
          } else if (char2ConversationState === 'roseLost_fail') {
            startDialog("看來你失敗了......", characterInfo);
            if (gameFrameCount > char2GreetingEndFrame) {
              char2ConversationState = 'roseLost_retry';
              char2GreetingEndFrame = gameFrameCount + 120;
            }
          } else if (char2ConversationState === 'roseLost_retry') {
            startDialog("沒關係!我還能再給你一次機會!", characterInfo);
            if (gameFrameCount > char2GreetingEndFrame) {
              char2ConversationState = 'quizQuestion';
              startQuizTimer(); // 開始計時
            }
          } else if ((char2ConversationState === 'idle' || char2ConversationState === 'postQuizIdle') && char2State === 'idle') {
            // 恢復原本的對話
            let dialogText;
            if (playerName) {
              dialogText = `哈囉，${playerName}！`;
            } else {
              dialogText = "你好，請問怎麼稱呼你？";
            }
            startDialog(dialogText, characterInfo);
          }
        } else {
          if (dialogManager.character === characterInfo) dialogManager.isActive = false;
          // 玩家離開時，確保輸入框被移除
          if (nameInput) nameInput.remove(); nameInput = null;
        }

        // --- 動畫幀計算 ---
        const preciseFrameWidth = activeAnim.img.width / activeAnim.totalFrames;
        const sourceFrameWidth = floor(preciseFrameWidth); // 切割時仍用整數
        const sx = currentFrameIndex * preciseFrameWidth;
        const sy = 0; // 假設角色2的動畫都是單行

        // --- 繪製角色 ---
        if (activeAnim && activeAnim.img) {
          push();
          imageMode(CENTER);
          const dispW = activeAnim.displayWidth || sourceFrameWidth;
          const dispH = activeAnim.displayHeight || activeAnim.img.height;
          image(activeAnim.img, fixedX, fixedY, dispW, dispH, sx, sy, sourceFrameWidth, activeAnim.img.height);
          pop();
        }
      }
    });
  }

  // 3.5 加入左下角禮物角色
  const giftAnim = animations.giftChar;
  if (giftAnim && giftAnim.img) {
    // 判斷提示內容
    let currentHint = "";

    // 檢查角色2問答
    if (char2ConversationState === 'quizQuestion') {
      currentHint = hasReceivedRose ? "大分子無法通過" : "細胞的能量工廠";
    }
    // 檢查角色3問答
    else if (char3ConversationState === 'quizQuestion_char3') {
      currentHint = hasLostRoseToChar3 ? "表示對象" : "誇張的描述";
    }
    // 注意：角色4和5的問答在最終場景(gameEnded區塊)，這裡的邏輯主要處理第一場景

    const giftX = 80; // 左下角 X
    const giftY = height - 80; // 左下角 Y
    drawables.push({
      y: giftY,
      draw: () => {
        const currentFrameIndex = floor(gameFrameCount / giftAnim.frameDelay) % giftAnim.totalFrames;
        const preciseFrameWidth = giftAnim.img.width / giftAnim.totalFrames;
        const sx = currentFrameIndex * preciseFrameWidth;
        
        const dispW = giftAnim.displayWidth || preciseFrameWidth;
        const dispH = giftAnim.displayHeight || giftAnim.img.height;

        push();
        imageMode(CENTER);
        image(giftAnim.img, giftX, giftY, dispW, dispH, sx, 0, preciseFrameWidth, giftAnim.img.height);
        pop();

        // --- 新增：互動提示 ---
        const d = dist(playerX, playerY, giftX, giftY);
        if (d < 150 && currentHint) { // 當玩家靠近且有提示時
            drawDialog(giftX, giftY, currentHint, giftAnim);
        }
      }
    });
  }

  // 3. 加入右邊角色 (角色3)
  const rightAnim = animations.rightChar;
  if (rightAnim && rightAnim.img) {
    const fixedX = 500; // 原本角色2的位置
    const fixedY = height * 0.5;
    drawables.push({
      y: fixedY,
      draw: () => {
        // --- 新增：淡出邏輯 ---
        if (char3FadingOut) {
          char3Alpha -= 2 * gameSpeed; // 每幀減少透明度 (乘上速度)
        }
        if (char3Alpha <= 0) return; // 如果完全透明，就不再繪製或互動

        // --- 互動邏輯 ---
        const triggerDistance = 200;
        const d = dist(playerX, playerY, fixedX, fixedY);
        const isSpeaking = d < triggerDistance;

        // --- 角色3的對話狀態機 ---
        if (char3State === 'idle' && isSpeaking) {
          // 如果玩家有玫瑰，且是第一次觸發，且還沒拿到漢堡（拿到漢堡代表已通關）
          if (rose.state === 'withPlayer' && hamburger.state !== 'withPlayer' && char3ConversationState === 'idle') {
            char3ConversationState = 'seesRose';
            char3DialogTimer = gameFrameCount; // 開始計時
          }
          // 根據計時器推進對話
          if (char3ConversationState === 'seesRose' && gameFrameCount > char3DialogTimer + 180) { // 3秒後
            char3ConversationState = 'startsQuiz';
            char3DialogTimer = gameFrameCount;
          }
          if (char3ConversationState === 'startsQuiz' && gameFrameCount > char3DialogTimer + 180) { // 再3秒後
            char3ConversationState = 'asksQuestion';
            char3DialogTimer = gameFrameCount;
          }
          if (char3ConversationState === 'asksQuestion' && gameFrameCount > char3DialogTimer + 120) { // 再2秒後
            char3ConversationState = 'quizQuestion_char3';
            startQuizTimer(); // 開始計時
          }
          // 如果答錯，顯示一段時間後恢復正常
          if (char3ConversationState === 'quizIncorrect_char3' && gameFrameCount > char3DialogTimer + 180) { // 3秒後
            char3ConversationState = 'idle';
          }
          // 如果是懲罰狀態，顯示一段時間後恢復
          if (char3ConversationState === 'punishing' && gameFrameCount > char3DialogTimer + 300) { // 5秒後
            char3ConversationState = 'idle';
          }
        } else if (!isSpeaking) {
          char3ConversationState = 'idle'; // 玩家離開，重置對話
          removeQuizButtons(); // 離開時移除按鈕
          stopQuizTimer(); // 停止計時
        }

        let activeAnim;
        let currentFrameIndex;

        const fallAnim = animations.rightCharFall;

        // --- 根據角色狀態決定動畫 ---
        if (char3State === 'falling') {
          activeAnim = fallAnim;
          const elapsed = gameFrameCount - char3StateStartFrame;
          currentFrameIndex = floor(elapsed / fallAnim.frameDelay);
          // 當動畫播放到最後一幀時
          if (currentFrameIndex >= fallAnim.totalFrames - 1) {
            char3State = 'down'; // 切換到 'down' 狀態
            char3StateStartFrame = gameFrameCount; // 重置計時器
            currentFrameIndex = fallAnim.totalFrames - 1; // 停在最後一幀
          }
        } else if (char3State === 'down') {
          activeAnim = fallAnim; // 繼續使用跌倒動畫的圖
          currentFrameIndex = fallAnim.totalFrames - 1; // 保持在最後一幀
          const elapsed = gameFrameCount - char3StateStartFrame;
          // 如果停留時間已過
          if (elapsed >= char3DownDuration) {
            char3State = 'idle'; // 恢復 'idle' 狀態
          }
        } else {
          // 'idle' 狀態的預設互動邏輯
          const speakAnim = animations.rightCharSpeak;
          activeAnim = (isSpeaking && speakAnim && speakAnim.img) ? speakAnim : rightAnim;
          currentFrameIndex = floor(gameFrameCount / activeAnim.frameDelay) % activeAnim.totalFrames;
        }

        // --- 動畫幀計算 ---
        if (!activeAnim) activeAnim = rightAnim; // 避免 activeAnim 為空
        const preciseFrameWidth = activeAnim.img.width / activeAnim.totalFrames;
        const sourceFrameWidth = floor(preciseFrameWidth);
        const sx = currentFrameIndex * preciseFrameWidth;
        const sy = 0; // 假設動畫都是單行

        // --- 繪製角色 ---
        const dispW = activeAnim.displayWidth || sourceFrameWidth;
        const dispH = activeAnim.displayHeight || activeAnim.img.height;
        // 確保動畫資源已載入
        if (activeAnim && activeAnim.img) {
            push();
            imageMode(CENTER);
            tint(255, char3Alpha); // 應用透明度
            image(activeAnim.img, fixedX, fixedY, dispW, dispH, sx, sy, sourceFrameWidth, activeAnim.img.height);
            pop();
        }

        // --- 新增：繪製對話框 (僅在靠近時) ---
        // 只有在 idle 狀態且靠近時才顯示對話框
        const characterInfo = { x: fixedX, y: fixedY, anim: activeAnim };
        if (char3State === 'idle' && isSpeaking && activeAnim !== fallAnim && finalSceneDialogueStep === 0) {
          let dialogText = "";
          // 根據對話狀態決定說什麼
          switch (char3ConversationState) {
            case 'seesRose':
              dialogText = hasLostRoseToChar3 ? "看來你想清楚了" : "喔天哪，你拿到玫瑰了!";
              break;
            case 'startsQuiz':
              dialogText = hasLostRoseToChar3 ? "請問!" : "那就換我來考考你吧，聰明的朋友";
              break;
            case 'asksQuestion':
              dialogText = hasLostRoseToChar3 ? "請問!" : "請問...";
              break;
            case 'quizQuestion_char3':
              dialogText = hasLostRoseToChar3 ? "'今之眾人，其下聖人也亦遠矣，而恥學於師'中的⌈於⌋是什麼意思?" : "早發白帝城中的「千里江陵一日還」用了什麼修辭手法?";
              if (quizButtons.length === 0) startQuizButtons(); // 顯示選擇題按鈕
              checkQuizTimer(() => handleQuizAnswer("TIMEOUT")); // 檢查計時
              break;
            case 'quizCorrect_char3':
              if (hamburger.state === 'withPlayer' && rose.state === 'withPlayer') {
                dialogText = "按下B打開驚喜吧!";
              } else {
                dialogText = "恭喜你，這是你應得的獎勵";
                if (hamburger.state === 'none') {
                  hamburger.state = 'onGround';
                  hamburger.x = fixedX;
                  hamburger.y = fixedY + (activeAnim.displayHeight || activeAnim.img.height) / 2;
                  hasReceivedHamburger = true;
                }
              }
              break;
            case 'quizIncorrect_char3':
              dialogText = "看來你沒有繼續的能力";
              break;
            case 'punishing':
              dialogText = "你怎麼可以這樣?我要懲罰你";
              break;
            default: // 'idle'
              if (hamburger.state === 'withPlayer' && rose.state === 'withPlayer') {
                dialogText = "該去其他旅程了，親愛的";
                char3FadingOut = true; // 觸發淡出
              } else if (rose.state === 'withPlayer') dialogText = "喔天哪，你拿到玫瑰了!";
              // 如果沒有玫瑰，就說預設問候語
              else dialogText = "你好，我的朋友，今天過得好嗎?";
          }

          if (dialogText) {
            startDialog(dialogText, characterInfo);
          }

        } else {
          if (dialogManager.character && dialogManager.character.x === fixedX) dialogManager.isActive = false;
        }
      }
    });
  }

  // 4. 根據 Y 座標排序
  drawables.sort((a, b) => a.y - b.y);

  // 5. 依照排序後的順序繪製所有角色
  for (const drawable of drawables) {
    drawable.draw();
  }

  // 6. 繪製背包 UI (如果開啟，會覆蓋在所有東西之上)
  if (isBackpackOpen) {
    drawBackpack();
    dialogManager.isActive = false; // 打開背包時，關閉對話
  }

  // --- 新增：真正的結局畫面 (The End) ---
  if (gameEnded) {
    // 背景變黑需要 255 幀 (endScreenAlpha += 1)，完全黑之後再過 2 秒 (120 幀) 才開始故障
    // 故障維持 4 秒 (240 幀)，之後完全黑掉
    let glitchStartFrame = gameEndFrame + 375;
    let glitchEndFrame = glitchStartFrame + 240;
    // 故障結束後，先黑屏 3 秒 (180 幀)，再開始淡入圖片
    let imageFadeStartFrame = glitchEndFrame + 180;
    
    let isGlitching = (gameFrameCount > glitchStartFrame && gameFrameCount < glitchEndFrame);
    let isFinalBlackout = (gameFrameCount >= glitchEndFrame);

    if (endScreenAlpha < 255) endScreenAlpha += 1 * gameSpeed; // 慢慢變黑
    
    push();
    
    // 如果已經完全黑掉，就只畫全黑背景並結束
    if (isFinalBlackout) {
      // --- 新增：統計畫面 ---
      if (showStatsScreen) {
        // 初始化統計數據 (只執行一次)
        if (statsScreenStartFrame === 0) {
           statsScreenStartFrame = gameFrameCount;
           
           let duration = floor((millis() - gameStartTime) / 1000);
           let m = floor(duration / 60);
           let s = duration % 60;
           let timeStr = nf(m, 2) + ":" + nf(s, 2);

           let achievements = [];
           let specialAchievements = []; // 新增：特殊成就列表

           if (selectedFinalItem) achievements.push('交友大師');
           if (hasReceivedRose) achievements.push('數學專家');
           if (hasReceivedHamburger) achievements.push('國文小老師');
           if (char4Gift === 'rose') achievements.push('浪漫天才');
           if (char4Gift === 'hamburger') achievements.push('餓很久');
           if (char5Gift === 'rose') achievements.push('浪漫錯人了');
           if (char5Gift === 'hamburger') achievements.push('兄友弟恭');
           
           if (hasAttackedNPC) specialAchievements.push('情緒過激'); // 移至特殊成就
           if (char4WasAttacked) specialAchievements.push('你還真敢打?'); // 新增特殊成就

           if (achievements.length === 0) achievements.push('無');
           if (specialAchievements.length === 0) specialAchievements.push('無');
           
           statsText1 = "THE END";
           statsText2 = `通關時間: ${timeStr}`;
           statsText3 = `所得成就: ${achievements.join('、')}`;
           statsText4 = `特殊成就: ${specialAchievements.join('、')}`;
        }

        // 繪製背景圖 (保持在背景圖之上)
        if (bgImage5678) {
          imageMode(CORNER);
          tint(255, 255); // 確保不透明
          image(bgImage5678, 0, 0, width, height);
        }
        
        // 半透明黑底
        fill(0, 200);
        rect(0, 0, width, height);

        // 打字機效果計算
        let typeSpeed = 5; // 每5幀顯示一個字
        let pauseDuration = 30; // 行與行之間停頓30幀
        let elapsed = gameFrameCount - statsScreenStartFrame;
        
        let len1 = statsText1.length;
        let len2 = statsText2.length;
        let len3 = statsText3.length;
        
        // 第一行
        let showLen1 = min(len1, floor(elapsed / typeSpeed));
        
        // 第二行
        let elapsed2 = elapsed - (len1 * typeSpeed + pauseDuration);
        let showLen2 = 0;
        if (elapsed2 > 0) showLen2 = min(len2, floor(elapsed2 / typeSpeed));
        
        // 第三行
        let elapsed3 = elapsed2 - (len2 * typeSpeed + pauseDuration);
        let showLen3 = 0;
        if (elapsed3 > 0) showLen3 = min(len3, floor(elapsed3 / typeSpeed));

        // 第四行 (特殊成就)
        let elapsed4 = elapsed3 - (len3 * typeSpeed + pauseDuration);
        let showLen4 = 0;
        if (elapsed4 > 0) showLen4 = min(statsText4.length, floor(elapsed4 / typeSpeed));

        // 顯示文字
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(50);
        text(statsText1.substring(0, showLen1), width / 2, height / 2 - 120);
        
        textSize(32);
        text(statsText2.substring(0, showLen2), width / 2, height / 2 - 40);
        text(statsText3.substring(0, showLen3), width / 2, height / 2 + 20);
        fill(255, 215, 0); // 金色
        text(statsText4.substring(0, showLen4), width / 2, height / 2 + 80);
        
        pop();
        return;
      }

      // 進入最終場景時，強制關閉之前的對話（避免角色2的對話框殘留）
      if (finalSceneDialogueStep === 0) {
        dialogManager.isActive = false;
      }

      // 先畫全黑背景
      fill(0);
      noStroke();
      rect(0, 0, width, height);

      // 如果過了等待時間，開始淡入圖片
      if (gameFrameCount > imageFadeStartFrame && bgImage5678) {
        if (finalImageAlpha < 255) finalImageAlpha += 1 * gameSpeed; // 淡入速度
        tint(255, finalImageAlpha);
        imageMode(CORNER);
        image(bgImage5678, 0, 0, width, height);

        if (finalImageAlpha < 255) {
          // 淡入過程中，繪製靜止的角色在畫面正中間
          const charAnim = animations.stop;
          if (charAnim && charAnim.img) {
            push();
            imageMode(CENTER);
            tint(255, finalImageAlpha);
            image(charAnim.img, width / 2, height / 2, charAnim.frameWidth, charAnim.frameHeight, 0, 0, charAnim.frameWidth, charAnim.frameHeight);
            pop();
          }
          // 強制同步玩家座標到中心，以免控制權回來時跳動
          playerX = width / 2;
          playerY = height / 2;
        } else {
          // 畫面完全顯示後，繪製可移動的玩家 (使用當前動畫狀態)
          if (anim && anim.img) {
            push();
            imageMode(CENTER);
            translate(playerX, playerY);
            if (facingLeft) scale(-1, 1);
            // 不設透明度，完全顯示
            
            const pW = anim.displayWidth || anim.frameWidth;
            const pH = anim.displayHeight || anim.frameHeight;
            image(anim.img, 0, 0, pW, pH, sx, sy, anim.frameWidth, anim.frameHeight);
            pop();
          }

          // --- 繪製禮物角色 (最終場景) ---
          const giftAnim = animations.giftChar;
          if (giftAnim && giftAnim.img) {
             const giftX = 80;
             const giftY = height - 80;
             
             let currentHint = "";
             if (finalSceneDialogueStep === 13 && currentChar4Question) {
               currentHint = currentChar4Question.hint || "沒有提示";
             } else if (finalSceneDialogueStep === 28 && currentChar5Question) {
               currentHint = currentChar5Question.hint || "沒有提示";
             }

             const currentFrameIndex = floor(gameFrameCount / giftAnim.frameDelay) % giftAnim.totalFrames;
             const preciseFrameWidth = giftAnim.img.width / giftAnim.totalFrames;
             const sx = currentFrameIndex * preciseFrameWidth;
             const dispW = giftAnim.displayWidth || preciseFrameWidth;
             const dispH = giftAnim.displayHeight || giftAnim.img.height;

             push();
             imageMode(CENTER);
             image(giftAnim.img, giftX, giftY, dispW, dispH, sx, 0, preciseFrameWidth, giftAnim.img.height);
             
             // 互動提示
             const d = dist(playerX, playerY, giftX, giftY);
             if (d < 150 && currentHint) {
                drawDialog(giftX, giftY, currentHint, giftAnim);
             }
             pop();
          }

          // --- 最終場景對話邏輯 ---
          const playerInfo = { x: playerX, y: playerY, anim: anim };
          if (finalSceneDialogueStep === 0) {
            finalSceneDialogueStep = 1;
            finalSceneTimer = gameFrameCount;
          }

          if (finalSceneDialogueStep === 1) {
            startDialog('這是哪裡......', playerInfo);
            if (gameFrameCount > finalSceneTimer + 180) { // 3秒
              finalSceneDialogueStep = 2;
              finalSceneTimer = gameFrameCount;
            }
          } else if (finalSceneDialogueStep === 2) {
            startDialog('剛剛發生了什麼......?', playerInfo);
            if (gameFrameCount > finalSceneTimer + 180) { // 3秒
              finalSceneDialogueStep = 3;
              dialogManager.isActive = false; // 結束對話
              finalSceneTimer = gameFrameCount; // 開始等待計時
            }
          } else if (finalSceneDialogueStep === 3) {
            // 等待 2 秒 (120 frames)
            if (gameFrameCount > finalSceneTimer + 120) {
              finalSceneDialogueStep = 4;
            }
          }

          // 初始化或獲取角色4的位置
          if (!char4Pos.initialized) {
            char4Pos.x = width * 0.2;
            char4Pos.y = height / 2;
            char4Pos.initialized = true;
          }
          const c4X = char4Pos.x;
          const c4Y = char4Pos.y;

          // 步驟 4：等待玩家靠近角色4的位置
          if (finalSceneDialogueStep === 4) {
            const d = dist(playerX, playerY, c4X, c4Y);
            if (d < 200) { // 當距離小於 200 時觸發
              finalSceneDialogueStep = 5;
              finalSceneTimer = gameFrameCount;
            }
          }

          // 步驟 5+：顯示角色4並開始對話
          if (finalSceneDialogueStep >= 5) {
            const c4Anim = animations.char4Stand;
            if (c4Anim && c4Anim.img) {
              const sourceFrameWidth = c4Anim.frameWidth; // 使用設定的整數寬度 (40)，避免除法產生的浮點數誤差
              const currentFrameIndex = floor(gameFrameCount / c4Anim.frameDelay) % c4Anim.totalFrames;
              const sx = currentFrameIndex * sourceFrameWidth;
              
              const dispW = c4Anim.displayWidth || sourceFrameWidth;
              const dispH = c4Anim.displayHeight || c4Anim.img.height;
              push();
              translate(c4X, c4Y);
              
              // --- 新增：受傷閃爍效果 ---
              if (char4State === 'stunned') {
                if (gameFrameCount % 10 < 5) tint(255, 0, 0); // 紅色閃爍
                
                // 檢查是否結束暈眩
                if (gameFrameCount > char4StunEndFrame) {
                  char4State = 'normal';
                }
              }

              // 根據追逐或移動狀態決定面朝方向
              let facingDir = -1; // 預設面朝右 (-1)
              if (finalSceneDialogueStep === 21) {
                // 步驟 21：移動回起始點 (width * 0.2)
                // 如果目標在左邊，面朝左 (1)；否則面朝右 (-1)
                facingDir = (width * 0.2 < c4X) ? 1 : -1;
              } else if (finalSceneDialogueStep >= 10) {
                // 追逐時：如果玩家在右邊，面朝右(-1, 1)；在左邊，面朝左(1, 1)
                facingDir = (playerX > c4X) ? -1 : 1;
              } else {
                facingDir = -1; // 對話時固定面朝右
              }
              
              scale(facingDir, 1);
              imageMode(CENTER);
              image(c4Anim.img, 0, 0, dispW, dispH, sx, 0, sourceFrameWidth, c4Anim.img.height);

              // 如果是步驟 21 (帶著玫瑰離開)，在角色身上畫玫瑰
              if (finalSceneDialogueStep === 21 && selectedFinalItem === 'rose') {
                scale(facingDir, 1); // 再次翻轉以還原文字方向
                textSize(48);
                textAlign(CENTER, CENTER);
                text('🌹', -facingDir * 20, 10); // 畫在角色前方
              }
              pop();

              // 對話邏輯
              const char4Info = { x: c4X, y: c4Y, anim: c4Anim };
              if (finalSceneDialogueStep === 5) {
                startDialog("幾年不回家......", char4Info);
                if (gameFrameCount > finalSceneTimer + 180) { // 3秒
                  finalSceneDialogueStep = 6;
                  finalSceneTimer = gameFrameCount;
                }
              } else if (finalSceneDialogueStep === 6) {
                startDialog("都不知道家長什麼樣了?", char4Info);
                if (gameFrameCount > finalSceneTimer + 180) { // 3秒
                  finalSceneDialogueStep = 7;
                  finalSceneTimer = gameFrameCount;
                }
              } else if (finalSceneDialogueStep === 7) {
                startDialog("接下來......給你點小小的懲罰", char4Info);
                if (gameFrameCount > finalSceneTimer + 180) { // 3秒
                  finalSceneDialogueStep = 8; // 改為進入追逐預告
                  dialogManager.isActive = false; // 結束對話
                  finalSceneTimer = gameFrameCount;
                }
              } else if (finalSceneDialogueStep === 11) {
                startDialog("抓到你了", char4Info);
                if (gameFrameCount > finalSceneTimer + 120) {
                  finalSceneDialogueStep = 12; // 2秒後切換
                  finalSceneTimer = gameFrameCount; // 重置計時器
                }
              } else if (finalSceneDialogueStep === 12) {
                startDialog("接受懲罰吧", char4Info);
                if (gameFrameCount > finalSceneTimer + 120) { // 2秒後
                  finalSceneDialogueStep = 13; // 進入問答環節
                  finalSceneTimer = gameFrameCount;
                  currentChar4Question = pickNewQuestion(); // 從題庫抽取新題目
                }
              } else if (finalSceneDialogueStep === 13) {
                // 題目：行為主義之父是誰?
                if (!currentChar4Question) currentChar4Question = pickNewQuestion(); // 確保題目已選取
                if (currentChar4Question) startDialog(currentChar4Question.q, char4Info);
                if (quizButtons.length === 0) startQuizButtons();
              } else if (finalSceneDialogueStep === 14) {
                // 答對過渡 (還沒滿3題)
                startDialog("還不錯... 繼續吧", char4Info);
                if (gameFrameCount > finalSceneTimer + 120) {
                   finalSceneDialogueStep = 13; // 回到問答
                   finalSceneTimer = gameFrameCount;
                   currentChar4Question = pickNewQuestion(); // 換下一題
                }
              } else if (finalSceneDialogueStep === 15) {
                // 答錯
                startDialog("不對!看來這幾年你也沒什麼長進", char4Info);
                if (gameFrameCount > finalSceneTimer + 180) {
                   finalSceneDialogueStep = 8; // 進入追逐預告
                   finalSceneTimer = gameFrameCount;
                }
              } else if (finalSceneDialogueStep === 16) {
                startDialog("行吧......饒你一命", char4Info);
                if (gameFrameCount > finalSceneTimer + 180) {
                   finalSceneDialogueStep = 17;
                   finalSceneTimer = gameFrameCount;
                }
              } else if (finalSceneDialogueStep === 17) {
                startDialog("這次出去有帶什麼東西回來嗎?", char4Info);
                if (gameFrameCount > finalSceneTimer + 180) {
                   // 檢查是否有物品
                   if (rose.state !== 'withPlayer' && hamburger.state !== 'withPlayer') {
                     finalSceneDialogueStep = 20; // 沒物品的結局
                     finalSceneTimer = gameFrameCount;
                   } else {
                     finalSceneDialogueStep = 18; // 進入選擇物品環節
                     dialogManager.isActive = false; // 角色不再說話
                   }
                }
              } else if (finalSceneDialogueStep === 18) {
                // 等待玩家打開背包並點擊物品，不顯示對話
              } else if (finalSceneDialogueStep === 19) {
                // 根據選擇的物品給予回應
                let text = "";
                if (selectedFinalItem === 'rose') text = "一朵玫瑰?行吧，去旁邊玩吧......";
                else if (selectedFinalItem === 'hamburger') text = "嗤，無聊，還是這麼幼稚";
                startDialog(text, char4Info);
                if (gameFrameCount > finalSceneTimer + 180) {
                  finalSceneDialogueStep = 21; // 進入離開動畫
                  dialogManager.isActive = false; // 停止對話
                }
              } else if (finalSceneDialogueStep === 20) {
                startDialog("兩手空空? 真令人失望...", char4Info);
                if (gameFrameCount > finalSceneTimer + 180) {
                  gameEnded = true;
                  gameEndFrame = gameFrameCount;
                }
              } else if (finalSceneDialogueStep === 21) {
                // 角色4 移動回起始位置
                const targetX = width * 0.2;
                const targetY = height / 2;
                const dx = targetX - char4Pos.x;
                const dy = targetY - char4Pos.y;
                const distToTarget = sqrt(dx*dx + dy*dy);
                const moveSpeed = 2;

                if (distToTarget > 5) {
                  char4Pos.x += (dx / distToTarget) * moveSpeed * gameSpeed;
                  char4Pos.y += (dy / distToTarget) * moveSpeed * gameSpeed;
                } else {
                  finalSceneDialogueStep = 22;
                  finalSceneTimer = gameFrameCount;
                }
              }
            }
          }

          // 步驟 22：角色1 說話
          if (finalSceneDialogueStep === 22) {
            startDialog("呼......逃過一劫了", playerInfo);
            if (gameFrameCount > finalSceneTimer + 180) {
              finalSceneDialogueStep = 23;
              finalSceneTimer = gameFrameCount;
              dialogManager.isActive = false; // 結束對話
            }
          }

          // 步驟 23：顯示角色5
          if (finalSceneDialogueStep >= 23) {
            // 初始化角色5位置
            if (!char5Pos.initialized) {
              char5Pos.x = width * 0.8;
              char5Pos.y = height / 2;
              char5Pos.initialized = true;
            }

            const c5Anim = animations.char5Stand;
            if (c5Anim && c5Anim.img) {
               const c5X = char5Pos.x;
               const c5Y = char5Pos.y;
               const sourceFrameWidth = c5Anim.frameWidth;
               const currentFrameIndex = floor(gameFrameCount / c5Anim.frameDelay) % c5Anim.totalFrames;
               const sx = currentFrameIndex * sourceFrameWidth;
               const dispW = c5Anim.displayWidth || sourceFrameWidth;
               const dispH = c5Anim.displayHeight || c5Anim.img.height;
               
               // 移動邏輯：在步驟 25 和 26 時走向玩家
               if (finalSceneDialogueStep === 25 || finalSceneDialogueStep === 26) {
                 const targetX = playerX + 60; // 停在玩家當前位置的右側
                 const dx = targetX - char5Pos.x;
                 // 增加移動速度以跟上玩家
                 if (Math.abs(dx) > 3) {
                   char5Pos.x += (dx > 0 ? 3 : -3) * gameSpeed;
                 }
               }

               imageMode(CENTER);
               image(c5Anim.img, c5X, c5Y, dispW, dispH, sx, 0, sourceFrameWidth, c5Anim.img.height);

               // 對話邏輯
               const char5Info = { x: c5X, y: c5Y, anim: c5Anim };
               if (finalSceneDialogueStep === 23) {
                 startDialog("哈!笨蛋回來了!", char5Info);
                 if (gameFrameCount > finalSceneTimer + 180) { // 3秒
                   finalSceneDialogueStep = 24;
                   finalSceneTimer = gameFrameCount;
                 }
               } else if (finalSceneDialogueStep === 24) {
                 startDialog("我、我才不是笨蛋!", playerInfo);
                 if (gameFrameCount > finalSceneTimer + 180) { // 3秒
                   finalSceneDialogueStep = 25;
                   finalSceneTimer = gameFrameCount;
                 }
               } else if (finalSceneDialogueStep === 25) {
                 startDialog("是嘛......?", char5Info);
                 if (gameFrameCount > finalSceneTimer + 120) { // 2秒
                   finalSceneDialogueStep = 26;
                   finalSceneTimer = gameFrameCount;
                 }
               } else if (finalSceneDialogueStep === 26) {
                 startDialog("那就讓我來考考你", char5Info);
                 if (gameFrameCount > finalSceneTimer + 180) { // 3秒
                   finalSceneDialogueStep = 27; // 準備進入測驗
                   finalSceneTimer = gameFrameCount;
                   dialogManager.isActive = false;
                 }
               } else if (finalSceneDialogueStep === 27) {
                 // 等待 1 秒
                 if (gameFrameCount > finalSceneTimer + 60) {
                   finalSceneDialogueStep = 28;
                   finalSceneTimer = gameFrameCount;
                   currentChar5Question = pickNewQuestionChar5(); // 從角色5題庫抽取新題目
                 }
               } else if (finalSceneDialogueStep === 28) {
                 // 角色5提問
                 if (!currentChar5Question) currentChar5Question = pickNewQuestionChar5();
                 if (currentChar5Question) startDialog(currentChar5Question.q, char5Info);
                 if (quizButtons.length === 0) startQuizButtons();
               } else if (finalSceneDialogueStep === 29) {
                 // 答對
                 startDialog("哼，還算有點常識", char5Info);
                 if (gameFrameCount > finalSceneTimer + 120) {
                   if (char5CorrectCount < 5) {
                     finalSceneDialogueStep = 28; // 下一題
                     finalSceneTimer = gameFrameCount;
                     currentChar5Question = pickNewQuestionChar5();
                   } else {
                     finalSceneDialogueStep = 32; // 結束測驗，直接進入下一段對話
                     finalSceneTimer = gameFrameCount;
                   }
                 }
               } else if (finalSceneDialogueStep === 30) {
                 // 答錯
                 startDialog("錯了！果然是廢物!哈哈!", char5Info);
                 if (gameFrameCount > finalSceneTimer + 120) {
                   finalSceneDialogueStep = 28; // 答錯繼續出題，直到答對5題為止
                   finalSceneTimer = gameFrameCount;
                   currentChar5Question = pickNewQuestionChar5();
                 }
               } else if (finalSceneDialogueStep === 32) {
                 startDialog("行吧，勉勉強強", char5Info);
                 if (gameFrameCount > finalSceneTimer + 120) {
                   finalSceneDialogueStep = 33;
                   finalSceneTimer = gameFrameCount;
                 }
               } else if (finalSceneDialogueStep === 33) {
                 startDialog("那有我的禮物嗎?", char5Info);
                 if (gameFrameCount > finalSceneTimer + 180) {
                   // 檢查是否有物品
                   if (rose.state !== 'withPlayer' && hamburger.state !== 'withPlayer') {
                     finalSceneDialogueStep = 37; // 沒物品
                     finalSceneTimer = gameFrameCount;
                   } else {
                     finalSceneDialogueStep = 35; // 進入選擇物品環節
                     dialogManager.isActive = false; // 角色不再說話
                   }
                 }
               } else if (finalSceneDialogueStep === 35) {
                 // 等待玩家打開背包並點擊物品 (同步驟 18)
               } else if (finalSceneDialogueStep === 36) {
                 // 根據選擇的物品給予回應
                 let text = "";
                 if (selectedFinalItem === 'rose') text = "玫瑰？無聊死了，廢物";
                 else if (selectedFinalItem === 'hamburger') text = "漢堡!？嗯......也行吧，看來你也沒有那麼廢物";
                 startDialog(text, char5Info);
                 if (gameFrameCount > finalSceneTimer + 180) {
                  showStatsScreen = true; // 顯示統計畫面
                 }
               } else if (finalSceneDialogueStep === 37) {
                 startDialog("什麼都沒有？真小氣...", char5Info);
                 if (gameFrameCount > finalSceneTimer + 180) {
                  showStatsScreen = true; // 顯示統計畫面
                 }
               }
            }
          }

          // 步驟 8：顯示追逐預告
          if (finalSceneDialogueStep === 8) {
            push();
            textAlign(CENTER, CENTER);
            textSize(60);
            fill(255, 0, 0);
            stroke(0);
            strokeWeight(4);
            text("三秒後追逐開始", width / 2, height / 2);
            
            // 顯示 1 秒後進入倒數
            if (gameFrameCount > finalSceneTimer + 60) {
              finalSceneDialogueStep = 9;
              finalSceneTimer = gameFrameCount;
            }
            pop();
          }

          // 步驟 9：倒數計時 (3, 2, 1)
          if (finalSceneDialogueStep === 9) {
            let elapsed = gameFrameCount - finalSceneTimer;
            let count = 3 - floor(elapsed / 60); // 每 60 幀 (1秒) 減 1
            
            if (count <= 0) {
              finalSceneDialogueStep = 10; // 倒數結束，開始追逐
            } else {
              push();
              textAlign(CENTER, CENTER);
              textSize(100);
              fill(255, 0, 0);
              stroke(0);
              strokeWeight(5);
              text(count, width / 2, height / 2);
              pop();
            }
          }

          // 步驟 10：追逐開始
          if (finalSceneDialogueStep === 10) {
            let dx = playerX - char4Pos.x;
            let dy = playerY - char4Pos.y;
            let d = sqrt(dx*dx + dy*dy);
            
            if (d < 50) { // 距離過近，被抓到了
              finalSceneDialogueStep = 11;
              finalSceneTimer = gameFrameCount; // 開始對話計時
            } else if (char4State !== 'stunned' && d > 10) {
              // 如果沒暈眩且距離大於 10，繼續追逐
              let chaseSpeed = char4WasAttacked ? 4 : 2; 
              char4Pos.x += (dx / d) * chaseSpeed * gameSpeed;
              char4Pos.y += (dy / d) * chaseSpeed * gameSpeed;
            }
          }

          // 新增：步驟 11/12 逃脫檢測
          if (finalSceneDialogueStep === 11 || finalSceneDialogueStep === 12) {
             let d = dist(playerX, playerY, char4Pos.x, char4Pos.y);
             if (d > 50) {
                finalSceneDialogueStep = 10; // 恢復追逐狀態
                dialogManager.isActive = false; // 關閉「抓到你了」對話
             }
          }
        }
      }

      // 確保對話框顯示在最終場景之上
      updateDialog();

      // --- 新增：在最終場景繪製背包 ---
      if (isBackpackOpen) {
        drawBackpack();
        dialogManager.isActive = false; // 打開背包時，關閉對話
      }

      pop();
      return;
    }

    fill(0, endScreenAlpha);
    noStroke();
    rect(0, 0, width, height);

    // --- 故障特效 ---
    if (isGlitching) {
      // 隨機繪製干擾色條
      if (random(1) > 0.7) {
        fill(random(255), random(255), random(255), 150);
        let h = random(5, 50);
        let y = random(height);
        rect(0, y, width, h);
      }
      // 偶爾全螢幕閃爍
      if (random(1) > 0.9) {
        fill(255, 200);
        rect(0, 0, width, height);
      }
    }
    
    if (endScreenAlpha > 150) { // 當背景夠黑時顯示文字
      fill(255);
      if (isGlitching && random(1) > 0.6) fill(255, 0, 0); // 故障時偶爾變紅
      textAlign(CENTER, CENTER);
      textSize(60);
      let tx = width / 2 + (isGlitching ? random(-10, 10) : 0); // 故障時文字抖動
      let ty = height / 2 + (isGlitching ? random(-10, 10) : 0);
      text("The End", tx, ty);
    }
    pop();
  }

  // --- 新增：警告畫面淡出效果 ---
  if (showWarning && gameStarted) {
    let elapsed = millis() - gameStartTime;
    let alpha = map(elapsed, 0, 1000, 255, 0); // 1秒內從 255 淡出至 0
    if (alpha <= 0) {
      showWarning = false;
    } else {
      drawWarningOverlay(alpha);
    }
  }

  // --- Debug 資訊 ---
  if (showDebugOnScreen) {
    // 顯示目前狀態小提示（方便測試）
    fill(255);
    noStroke();
    textSize(14);
    text(`Use arrows to move; SPACE: punch; D: debug`, 10, 20);
    text(`Current: ${currentAnim}  frame:${currentFrame}`, 10, 52);

    // Debug: 顯示目前的幀與裁切座標
    if (anim && anim.img) {
      const debugSx = sx;
      const debugSy = sy;
      // 顯示一個縮小的整張 sprite sheet，在右下角
      const thumbsScale = 0.18; // 縮放比例，可調整
      const thumbW = anim.img.width * thumbsScale;
      const thumbH = anim.img.height * thumbsScale;
      const thumbX = width - thumbW - 10;
      const thumbY = height - thumbH - 10;
      imageMode(CORNER);
      image(anim.img, thumbX, thumbY, thumbW, thumbH);
      // 以紅框畫出當前裁切區（先把 sx,sy 轉成縮放座標）
      noFill();
      stroke(255, 0, 0);
      strokeWeight(2);
      const rectX = thumbX + debugSx * thumbsScale;
      const rectY = thumbY + debugSy * thumbsScale;
      const rectW = anim.frameWidth * thumbsScale;
      const rectH = anim.frameHeight * thumbsScale;
      rect(rectX, rectY, rectW, rectH);
      // 恢復 imageMode
      text(`frame ${currentFrame} sx:${debugSx}, sy:${debugSx}`, 10, height - 10);
    }
  }
}

// 鍵盤按下事件
function keyPressed() {
  if (!gameStarted) return; // 新增：如果遊戲未開始，忽略按鍵

  // 優先處理輸入框：如果輸入框存在，則只響應 Enter 鍵，並阻止所有其他遊戲按鍵
  if (nameInput) {
    if (keyCode === ENTER) {
      submitInput();
    }
    return;
  }

  // 其次處理背包：如果背包打開，只響應 B 鍵，並阻止所有遊戲按鍵
  if (isBackpackOpen) {
    if (keyCode === 66) { // 'B' 鍵
      isBackpackOpen = false;
    }
    return; // 結束函式
  }
  if (keyCode === 32) { // SPACE 鍵
    // 發動攻擊動作（若目前不是攻擊動畫時）
    if (currentAnim !== 'punch') {
      oneShotAnimName = 'punch';
      oneShotStartFrame = gameFrameCount;
      movementAllowed = false;

      // --- 新增：檢查與角色3的距離，只有靠近時才觸發 "hit" 狀態 ---
      const char3X = 500; // 角色3的X座標
      const char3Y = height * 0.5; // 角色3的Y座標
      const attackRange = 200; // 攻擊的有效範圍，可以比對話距離稍大
      const d = dist(playerX, playerY, char3X, char3Y);

      if (d < attackRange) {
        hasAttackedNPC = true;
        char3State = 'falling';
        char3StateStartFrame = gameFrameCount;
        char3ConversationState = 'punishing';
        char3DialogTimer = gameFrameCount; // 設定懲罰對話計時器
        // 只收走一個物品：優先收走漢堡，如果沒有漢堡才收走玫瑰
        if (hamburger.state === 'withPlayer') {
          hamburger.state = 'none';
        } else if (rose.state === 'withPlayer') {
          rose.state = 'none';
        }
      }

      // --- 新增：檢查與角色2的距離，只有靠近時才觸發 "hit" 狀態 ---
      const char2X = width - 500; // 角色2的X座標
      const char2Y = height * 0.5; // 角色2的Y座標
      const d2 = dist(playerX, playerY, char2X, char2Y);

      if (d2 < attackRange) {
        hasAttackedNPC = true;
        char2State = 'hit';
        char2StateStartFrame = gameFrameCount;
        char2ConversationState = 'punishing';
        char2GreetingEndFrame = gameFrameCount + 300; // 設定懲罰對話顯示 5 秒
        // 只收走一個物品：優先收走漢堡，如果沒有漢堡才收走玫瑰
        if (hamburger.state === 'withPlayer') {
          hamburger.state = 'none';
        } else if (rose.state === 'withPlayer') {
          rose.state = 'none';
        }
      }

      // --- 新增：檢查與角色4的距離 ---
      if (char4Pos.initialized) {
        const d4 = dist(playerX, playerY, char4Pos.x, char4Pos.y);
        if (d4 < attackRange) {
          char4State = 'stunned';
          char4StunEndFrame = gameFrameCount + 60; // 1秒
          char4WasAttacked = true;
        }
      }
    }
  } else if (keyCode === 68) { // D 鍵
    // 切換 Debug 開關
    showDebugOnScreen = !showDebugOnScreen;
  } else if (keyCode === 65) { // A 鍵
    // 新增：撿起玫瑰的邏輯
    if (rose.state === 'onGround') {
      const d = dist(playerX, playerY, rose.x, rose.y);
      if (d < rose.pickupRadius) {
        rose.state = 'withPlayer';
      }
    }
    // 新增：撿起漢堡的邏輯
    if (hamburger.state === 'onGround') {
      const d = dist(playerX, playerY, hamburger.x, hamburger.y);
      if (d < hamburger.pickupRadius) {
        hamburger.state = 'withPlayer';
      }
    }
  } else if (keyCode === 66) { // B 鍵
    // 開關背包
    isBackpackOpen = !isBackpackOpen;
  } else if (keyCode === RIGHT_ARROW) {
    keyRightPressed = true;
  } else if (keyCode === LEFT_ARROW) {
    keyLeftPressed = true;
  } else if (keyCode === UP_ARROW) {
    keyUpPressed = true;
  } else if (keyCode === DOWN_ARROW) {
    keyDownPressed = true;
  }
}

// 鍵盤放開事件
function keyReleased() {
  if (!gameStarted) return; // 新增：如果遊戲未開始，忽略按鍵
  if (keyCode === RIGHT_ARROW) {
    keyRightPressed = false;
  } else if (keyCode === LEFT_ARROW) {
    keyLeftPressed = false;
  } else if (keyCode === UP_ARROW) {
    keyUpPressed = false;
  } else if (keyCode === DOWN_ARROW) {
    keyDownPressed = false;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (speedBtn) speedBtn.position(width - 100, 20); // Update position
}

// --- 新增：對話與輸入框相關函式 ---

/**
 * 啟動一個新的對話，會重置打字機效果
 * @param {string} text - 要顯示的完整文字
 * @param {object} character - 說話的角色資訊 {x, y, anim}
 */
function startDialog(text, character) {
  // 更新角色資訊 (確保對話框跟隨移動中的角色)
  dialogManager.character = character;

  // 如果對話內容和角色都沒變，就不要重置打字機
  if (dialogManager.isActive && dialogManager.fullText === text) {
    return;
  }

  dialogManager.fullText = text;
  dialogManager.visibleLength = 0;
  dialogManager.visibleText = '';
  dialogManager.lastUpdateFrame = gameFrameCount;
  dialogManager.isActive = true;
  dialogManager.character = character;
}

/**
 * 在每一幀更新並繪製對話框
 */
function updateDialog() {
  if (!dialogManager.isActive || !dialogManager.character) {
    return;
  }

  // 呼叫繪圖函式
  // 直接顯示完整文字，移除打字機效果
  drawDialog(dialogManager.character.x, dialogManager.character.y, dialogManager.fullText, dialogManager.character.anim);
}

/**
 * 繪製對話框的輔助函式
 * @param {number} x - 角色中心 X 座標
 * @param {number} y - 角色中心 Y 座標
 * @param {string} textContent - 對話內容
 * @param {object} anim - 角色的動畫物件，用於計算偏移
 */
function drawDialog(x, y, textContent, anim) {
  const textPadding = 10;
  const boxHeight = 40;
  const dispH = anim.displayHeight || anim.img.height;
  const boxYOffset = dispH / 2 + boxHeight / 2 + 10;

  push();
  textAlign(CENTER, CENTER);
  textSize(16);
  const boxWidth = textWidth(textContent) + textPadding * 2;
  fill(255, 255, 255, 220);
  noStroke();
  rectMode(CENTER);
  rect(x, y - boxYOffset, boxWidth, boxHeight, 10);
  fill(0);
  text(textContent, x, y - boxYOffset);
  pop();
}

/**
 * 建立並顯示姓名輸入框
 */
function startNameInput() {
  if (nameInput) return; // 如果已存在則不重複建立
  nameInput = createInput('');
  nameInput.position(playerX - 75, playerY - 60); // 顯示在玩家頭上
  nameInput.size(150);
  nameInput.style('border-radius', '5px');
  nameInput.style('padding', '5px');
  nameInput.elt.focus(); // 自動聚焦
}

/**
 * 建立並顯示選擇題按鈕 (角色3)
 */
function startQuizButtons() {
  if (quizButtons.length > 0) return;
  
  let options = [];
  if (finalSceneDialogueStep === 13) {
    // 角色4的題目 (行為主義)
    options = currentChar4Question ? currentChar4Question.options : [];
  } else if (finalSceneDialogueStep === 28) {
    // 角色5的題目 (行為主義)
    options = currentChar5Question ? currentChar5Question.options : [];
  } else {
    // 角色3的題目
    options = hasLostRoseToChar3 ? ['因為', '和', '向'] : ["擬人", "視覺摹寫", "誇飾"];
  }
  
  options.forEach((opt, index) => {
    let btn = createButton(opt);
    btn.size(150);
    btn.position(playerX - 75, playerY + 20 + index * 35); // 立即設定位置
    btn.mousePressed(() => handleQuizAnswer(opt));
    quizButtons.push(btn);
  });
}

/**
 * 移除所有選擇題按鈕
 */
function removeQuizButtons() {
  quizButtons.forEach(btn => btn.remove());
  quizButtons = [];
}

function handleQuizAnswer(answer) {
  removeQuizButtons(); // 作答後移除按鈕
  stopQuizTimer(); // 停止計時
  
  // --- 新增：角色4的問答邏輯 ---
  if (finalSceneDialogueStep === 13) {
    char4QuestionCount++; // 增加出題數
    if (currentChar4Question && answer === currentChar4Question.answer) {
      char4CorrectCount++;
      if (char4CorrectCount >= 3) {
        finalSceneDialogueStep = 16; // 答對3題，進入通關對話
      } else {
        finalSceneDialogueStep = 14; // 答對但未滿3題，繼續
      }
      finalSceneTimer = gameFrameCount; // 重置計時器
    } else {
      finalSceneDialogueStep = 15; // 答錯
      finalSceneTimer = gameFrameCount;
      currentChar4Question = null; // 清空當前題目，確保下次被抓到時會選新題目
    }
    return;
  }

  // --- 新增：角色5的問答邏輯 ---
  if (finalSceneDialogueStep === 28) {
    char5QuestionCount++;
    if (currentChar5Question && answer === currentChar5Question.answer) {
      char5CorrectCount++;
      finalSceneDialogueStep = 29; // 答對
    } else {
      finalSceneDialogueStep = 30; // 答錯
    }
    finalSceneTimer = gameFrameCount;
    return;
  }

  // --- 原有：角色3的問答邏輯 ---
  let isCorrect = false;
  if (hasLostRoseToChar3) {
    if (answer === '向') isCorrect = true;
  } else {
    if (answer === "誇飾") isCorrect = true;
  }

  if (isCorrect) {
    char3ConversationState = 'quizCorrect_char3';
  } else {
    char3ConversationState = 'quizIncorrect_char3';
    rose.state = 'none'; // 答錯懲罰
    hasLostRoseToChar3 = true; // 標記已失去過
    char3DialogTimer = gameFrameCount; // 開始計時，用於自動恢復
  }
}

/**
 * 提交輸入框內容（通用函式）
 */
function submitInput() {
  if (!nameInput) return;

  const inputValue = nameInput.value();
  nameInput.remove();
  nameInput = null;

  if (char2ConversationState === 'waitingInput') {
    // 這是提交姓名的情況
    playerName = inputValue;
    char2ConversationState = 'greeting';
    char2GreetingEndFrame = gameFrameCount + 120; // 問候語顯示 2 秒
  } else if (char2ConversationState === 'quizQuestion') {
    // 這是提交答案的情況
    stopQuizTimer(); // 停止計時
    let isCorrect = false;
    if (hasReceivedRose) {
      // 第二次機會的答案 (脂肪酸)
      if (inputValue.trim() === '脂肪酸') isCorrect = true;
    } else {
      // 第一次機會的答案 (粒線體)
      if (inputValue.trim() === '粒線體') isCorrect = true;
    }

    if (isCorrect) {
      char2ConversationState = 'quizCorrect';
      char2GreetingEndFrame = gameFrameCount + 60; // "回答正確"顯示1秒
    } else {
      char2ConversationState = 'quizIncorrect';
      char2GreetingEndFrame = gameFrameCount + 90; // 提示顯示 1.5 秒
    }
  } else if (char2ConversationState === 'finalQuestion') {
    // 這是最後一題的回答
    // 簡單判斷負面關鍵字
    if (inputValue.includes('不開心') || inputValue.includes('難過') || inputValue.includes('不好') || inputValue.includes('累') || inputValue.includes('痛苦')) {
      char2ConversationState = 'finalAnswered_Unhappy_1';
      char2GreetingEndFrame = gameFrameCount + 180; // 3秒
    } else {
      char2ConversationState = 'finalAnswered_Happy';
      char2GreetingEndFrame = gameFrameCount + 180; // 3秒
    }
  } else if (char3ConversationState === 'quizQuestion_char3') {
    // 這是角色3提交答案的情況
    if (inputValue.trim() !== '誇飾') {
      char3ConversationState = 'quizIncorrect_char3';
      rose.state = 'none'; // 收走玫瑰
      hasLostRoseToChar3 = true; // 標記已失去過
    }
  }
}

// --- 新增：繪製背包介面的函式 ---

/**
 * 繪製背包 UI
 */
function drawBackpack() {
  const backpackWidth = 400;
  const backpackHeight = 300;
  const x = (width - backpackWidth) / 2;
  const y = (height - backpackHeight) / 2;
  const cornerRadius = 15;

  push();
  // 繪製半透明背景
  fill(0, 0, 0, 180);
  noStroke();
  rect(x, y, backpackWidth, backpackHeight, cornerRadius);

  // 繪製標題
  fill(255);
  textSize(24);
  textAlign(CENTER, TOP);
  text("Backpack", x + backpackWidth / 2, y + 20);

  // 繪製分隔線
  stroke(255, 100);
  strokeWeight(1);
  line(x + 20, y + 60, x + backpackWidth - 20, y + 60);

  // 檢查並顯示物品
  let itemY = y + 120;
  let hasItem = false;

  // 輔助函式：檢查滑鼠是否懸停在物品上
  const isHover = (iy) => {
    return mouseX > x + 20 && mouseX < x + backpackWidth - 20 && 
           mouseY > iy - 30 && mouseY < iy + 30;
  };

  if (rose.state === 'withPlayer') {
    // 如果在最終選擇階段且滑鼠懸停，顯示高亮背景
    if ((finalSceneDialogueStep === 18 || finalSceneDialogueStep === 35) && isHover(itemY)) {
      fill(255, 255, 255, 50);
      rect(x + 20, itemY - 30, backpackWidth - 40, 60, 10);
    }

    // 顯示玫瑰花
    fill(255);
    textSize(48);
    textAlign(LEFT, CENTER);
    text('🌹', x + 40, itemY);
    textSize(20);
    text("Rose", x + 100, itemY);
    itemY += 60;
    hasItem = true;
  }
  if (hamburger.state === 'withPlayer') {
    // 如果在最終選擇階段且滑鼠懸停，顯示高亮背景
    if ((finalSceneDialogueStep === 18 || finalSceneDialogueStep === 35) && isHover(itemY)) {
      fill(255, 255, 255, 50);
      rect(x + 20, itemY - 30, backpackWidth - 40, 60, 10);
    }

    fill(255);
    textSize(48);
    textAlign(LEFT, CENTER);
    text('🍔', x + 40, itemY);
    textSize(20);
    text("Hamburger", x + 100, itemY);
    hasItem = true;
  }

  if (!hasItem) {
    // 如果沒有物品
    fill(180);
    textSize(18);
    textAlign(CENTER, CENTER);
    text("Your backpack is empty.", x + backpackWidth / 2, y + backpackHeight / 2 + 20);
  }
  pop();
}

// --- 新增：計時器相關函式 ---

function startQuizTimer() {
  quizTimer.active = true;
  quizTimer.startTime = millis();
}

function stopQuizTimer() {
  quizTimer.active = false;
}

function checkQuizTimer(callback) {
  if (!quizTimer.active) return;
  // 檢查是否超過時間 (duration 秒)
  if ((millis() - quizTimer.startTime) / 1000 >= quizTimer.duration) {
    stopQuizTimer();
    if (callback) callback();
  }
}

function drawQuizTimer() {
  if (!quizTimer.active) return;
  let remaining = Math.ceil(quizTimer.duration - (millis() - quizTimer.startTime) / 1000);
  if (remaining < 0) remaining = 0;
  
  push();
  textAlign(CENTER, TOP);
  textSize(30);
  fill(255, 50, 50); // 紅色文字
  stroke(0);
  strokeWeight(3);
  text(`剩餘時間: ${remaining}`, width / 2, 50);
  pop();
}

function mousePressed() {
  if (!gameStarted) {
    if (!showWarning) {
      showWarning = true;
      warningStartTime = millis();
    }
    return;
  }

  // 處理背包物品點擊 (僅在最終選擇階段有效)
  if (isBackpackOpen && (finalSceneDialogueStep === 18 || finalSceneDialogueStep === 35)) {
    const backpackWidth = 400;
    const backpackHeight = 300;
    const x = (width - backpackWidth) / 2;
    const y = (height - backpackHeight) / 2;
    let itemY = y + 120;

    // 檢查玫瑰
    if (rose.state === 'withPlayer') {
      if (mouseX > x + 20 && mouseX < x + backpackWidth - 20 && mouseY > itemY - 30 && mouseY < itemY + 30) {
        handleFinalItemSelection('rose');
        return;
      }
      itemY += 60;
    }

    // 檢查漢堡
    if (hamburger.state === 'withPlayer') {
      if (mouseX > x + 20 && mouseX < x + backpackWidth - 20 && mouseY > itemY - 30 && mouseY < itemY + 30) {
        handleFinalItemSelection('hamburger');
        return;
      }
    }
  }
}

// --- 新增：從可用題庫中抽取題目的函式 ---
function pickNewQuestion() {
  if (availableQuestions.length === 0) {
    // 如果題目用完了，重新填充 (避免崩潰，雖然理論上題目夠多)
    availableQuestions = [...char5Questions]; // 角色4 題庫來源
  }
  // 隨機選一個索引
  const idx = floor(random(availableQuestions.length));
  // 取出題目
  const q = availableQuestions[idx];
  // 從陣列中移除該題目 (確保不重複，且答錯後不再出現)
  availableQuestions.splice(idx, 1);
  return q;
}

function handleFinalItemSelection(item) {
  if (item === 'rose') rose.state = 'none';
  if (item === 'hamburger') hamburger.state = 'none';

  selectedFinalItem = item;
  isBackpackOpen = false; // 關閉背包
  if (finalSceneDialogueStep === 18) {
    char4Gift = item;
    finalSceneDialogueStep = 19; // 角色4的回應階段
  } else if (finalSceneDialogueStep === 35) {
    char5Gift = item;
    finalSceneDialogueStep = 36; // 角色5的回應階段
  }
  finalSceneTimer = gameFrameCount;
}

// --- 新增：從角色5可用題庫中抽取題目的函式 ---
function pickNewQuestionChar5() {
  if (availableQuestionsChar5.length === 0) {
    // 如果題目用完了，重新填充
    availableQuestionsChar5 = [...behaviorismQuestions]; // 角色5 題庫來源
  }
  // 隨機選一個索引
  const idx = floor(random(availableQuestionsChar5.length));
  // 取出題目
  const q = availableQuestionsChar5[idx];
  // 從陣列中移除該題目
  availableQuestionsChar5.splice(idx, 1);
  return q;
}

// --- 新增：繪製警告畫面的輔助函式 ---
function drawWarningOverlay(alpha) {
  push();
  fill(0, alpha);
  noStroke();
  rectMode(CORNER);
  rect(0, 0, width, height); // 繪製背景
  
  fill(255, alpha);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("警告：請在遊戲前閱讀", width / 2, height / 2 - 180);
  
  textSize(20);
  rectMode(CENTER);
  let msg = "當暴露在特定光影圖案或閃光光亮下時，有極小部分人群會引發癲癇。\n\n" +
            "這種情形可能是由於某些未查出的癲癇症狀引起，即使該人員並沒有患癲癇病史也有可能造成此類病症。\n\n" +
            "如果您的家人或任何家庭成員曾有過類似症狀，請在進行遊戲前咨詢您的醫生或醫師。\n\n" +
            "如果您在遊戲中出現任何自己無法控制的動作，請立即停止遊戲並在繼續遊戲前咨詢您的醫生或醫師。";
  text(msg, width / 2, height / 2 + 20, width * 0.8, 600);
  pop();
}