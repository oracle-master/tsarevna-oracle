/*
=====================================
        ЦАРЕВНА-ОРАКУЛ 2.0
        oracle.js

        Версия: автопробуждение + NFC + автоповтор

=====================================
*/

const OracleState = Object.freeze({
    SLEEP: "sleep",
    LISTENING: "listening",
    THINKING: "thinking",
    PROPHECY: "prophecy"
});

let currentState = OracleState.SLEEP;

// ===============================
// NFC 2.0
// ===============================
let ndefReader = null;
let isScanning = false;
let scanCooldown = false;

async function startNFCListening(){
    if (!("NDEFReader" in window)){
        setStatus("Царевна дремлет");
        return;
    }
    if(isScanning) return;
    try{
        ndefReader = new NDEFReader();
        await ndefReader.scan();
        isScanning = true;
        setStatus("Царевна слушает...");
        ndefReader.onreading = () => {
            if(scanCooldown) return;
            scanCooldown = true;
            handleNFCTouch();
            setTimeout(()=>{ scanCooldown = false; }, 2000);
        };
        ndefReader.onreadingerror = ()=>{
            setStatus("Талисман не услышан...");
        };
    }catch(error){
        setStatus("Царевна дремлет");
        // Автоматически пробуем запустить NFC ещё раз
        setTimeout(() => {
            startNFCListening();
        }, 1000);
        console.log(error);
    }
}

function handleNFCTouch(){
    if(currentState === OracleState.SLEEP){
        wakePrincess();
        return;
    }
    if(currentState === OracleState.LISTENING){
        startThinking();
        return;
    }
}

// ===============================
// КНИГА ПРЕДСКАЗАНИЙ
// ===============================
const positiveAnswers = [
"Быть по-твоему","Звёзды шепчут: да","Добрый знак","Суженое сбудется",
"Сама судьба — за","Удача в кокошнике","Верь, и придёт","Знаки добрые",
"Так тому и быть","Перст судьбы","Путь открыт","Свет впереди",
"Истинно","Не сомневайся","Решено свыше","Благая весть",
"Скоро исполнится","Верный путь","Согласие свыше","Радость близко",
"Успех гарантирован","Мечты сбываются","Счастливый исход","Доверься судьбе"
];

const neutralAnswers = [
"Туман над рекой","Спроси у ветра","Монетка на ребре","Всё в твоих руках",
"Подожди до рассвета","Пока неясно","Судьба играет в прятки","Переменчиво",
"Ни да, ни нет","Зеркало молчит","Повремени","Думы в разброде",
"Загадай иначе","Тайна под замком","Равновесие","Неопределённость",
"Время покажет","Сделай первый шаг","Решение за тобой","Прислушайся к сердцу",
"Всё возможно","Два пути открыты","Нужен совет","Ищи ответ внутри"
];

const negativeAnswers = [
"Не в этот раз","Звёзды хмурятся","Обойди стороной","Не сейчас",
"Путь закрыт","Ложная надежда","Препятствия впереди","Не стоит",
"Отступись","Иллюзия","Холодный ветер","Забудь",
"Не судьба","Ответ — нет","Погасшая искра","Пустые хлопоты",
"Откажись от затеи","Жди другого момента","Не стоит риска","Тщетные надежды",
"Закрытая дверь","Обманчивый свет","Лучше не знать","Тупик"
];

function randomItem(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function getOracleAnswer(){
    const mood=Math.floor(Math.random()*3);
    switch(mood){
        case 0: return { text: randomItem(positiveAnswers), type: "positive" };
        case 1: return { text: randomItem(neutralAnswers), type: "neutral" };
        default: return { text: randomItem(negativeAnswers), type: "negative" };
    }
}

function setText(text) {
    const answer = document.getElementById("answer-text");
    if (!answer) return;
    answer.style.opacity = "0";
    setTimeout(() => { answer.textContent = text; answer.style.opacity = "1"; }, 500);
}

function showFinalAnswer(data) {
    const answer = document.getElementById("answer-text");
    const mirror = document.getElementById("mirrorFrame");
    if (!answer) return;
    if (mirror) { mirror.classList.remove("positive-glow", "neutral-glow", "negative-glow"); }
    let color = "#ffffff";
    let glowClass = "";
    switch(data.type){
        case "positive": color = "#FFD700"; glowClass = "positive-glow"; break;
        case "neutral": color = "#E0E8F0"; glowClass = "neutral-glow"; break;
        case "negative": color = "#D870FF"; glowClass = "negative-glow"; break;
    }
    if (mirror && glowClass) { mirror.classList.add(glowClass); }
    answer.style.opacity = "0";
    setTimeout(() => {
        answer.innerHTML = `<span style="color:${color};font-size:28px;">✨</span>${data.text}<span style="color:${color};font-size:28px;">✨</span>`;
        answer.style.opacity = "0";
        setTimeout(() => { answer.style.opacity = "1"; },100);
    },700);
}

function setStatus(text) {
    const status = document.getElementById("portalStatus");
    if (status) { status.textContent = text; }
}

function setEyes(state) {
    const closed = document.querySelector(".eyes-closed");
    const open = document.querySelector(".eyes-open");
    const glasses = document.querySelector(".glasses");
    if (!closed || !open || !glasses) return;
    closed.style.opacity = state === "closed" ? "1" : "0";
    open.style.opacity = state === "open" ? "1" : "0";
    glasses.style.opacity = state === "glasses" ? "1" : "0";
}

function fadeGlassesToSleep() {
    const closed = document.querySelector(".eyes-closed");
    const glasses = document.querySelector(".glasses");
    if (!closed || !glasses) return;
    closed.style.opacity = "0";
    glasses.style.opacity = "1";
    setTimeout(() => { glasses.style.opacity = "0"; closed.style.opacity = "1"; }, 50);
}

function wakePrincess() {
    if (currentState !== OracleState.SLEEP) return;
    currentState = OracleState.LISTENING;
    setEyes("open");
    setText("Я слушаю...");
    setStatus("Царевна проснулась 👑");
    setTimeout(() => { setText("О чём ты хочешь спросить?"); setStatus("Царевна ждёт..."); }, 1800);
}

function startThinking() {
    if (currentState !== OracleState.LISTENING) return;
    currentState = OracleState.THINKING;
    setText("Ищу ответ...");
    setStatus("Зеркало думает ✨");
    setTimeout(() => { setText("..."); }, 2500);
    const mirror = document.getElementById("mirrorFrame");
    if (mirror) { mirror.classList.add("spin"); }
    setTimeout(() => { setEyes("glasses"); }, 6000);
    setTimeout(() => {
        currentState = OracleState.PROPHECY;
        if (mirror) { mirror.classList.remove("spin"); }
        setText("...");
        setStatus("Пророчество явлено 🔮");
        setTimeout(() => {
            showFinalAnswer(getOracleAnswer());
            setTimeout(() => { returnToSleep(); }, 7000);
        }, 1500);
    }, 10000);
}

function returnToSleep() {
    const fog = document.getElementById("fog");
    if (fog) { fog.style.opacity = "1"; }
    setTimeout(() => {
        currentState = OracleState.SLEEP;
        const mirror = document.getElementById("mirrorFrame");
        if (mirror) { mirror.classList.remove("positive-glow", "neutral-glow", "negative-glow"); }
        fadeGlassesToSleep();
        setStatus("Царевна спит...");
        if (fog) { fog.style.opacity = "0"; }
        setTimeout(() => { wakePrincess(); }, 2000);
    }, 4000);
}

// ===============================
// ЗАПУСК
// ===============================
window.addEventListener("load", () => {
    wakePrincess();
    startNFCListening();
});

document.addEventListener("click", (event) => {
    if (isScanning) return;
    if (event.target !== document.body && event.target !== document.querySelector(".stars-layer")) return;
    startNFCListening();
});

console.log("👑 Oracle 2.0 — готов к магии");
