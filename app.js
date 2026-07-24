// ============================================================
// app.js — منطق الشات بوت الصوتي (يعمل في المتصفح)
// ============================================================

const micBtn = document.getElementById("micBtn");
const micIcon = document.getElementById("micIcon");
const chatLog = document.getElementById("chatLog");
const statusText = document.getElementById("statusText");

// ✅ تم تحديث الاسم بعد تغيير chat.php إلى process.php
const BACKEND_URL = "process.php";

// اللغة المستخدمة للتعرف على الصوت والنطق
const LANG = "ar-SA";

let isListening = false;

// --------------------------------------------------------
// 1) إعداد التعرف على الصوت (Speech-to-Text)
// --------------------------------------------------------
// ✅ تمت إضافة || الناقصة
const SpeechRecognitionAPI =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognitionAPI) {
  statusText.textContent =
    "متصفحك لا يدعم التعرف على الصوت. جرّب Chrome أو Edge.";
  micBtn.disabled = true;
} else {
  const recognition = new SpeechRecognitionAPI();

  recognition.lang = LANG;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  micBtn.addEventListener("click", () => {
    if (isListening) {
      recognition.stop();
      return;
    }

    try {
      recognition.start();
    } catch (err) {
      console.error(err);
    }
  });

  recognition.onstart = () => {
    isListening = true;
    micBtn.classList.add("listening");
    micIcon.textContent = "⏹️";
    statusText.textContent = "أستمع الآن... تحدث بحرية";
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.classList.remove("listening");
    micIcon.textContent = "🎤";
    statusText.textContent = "اضغط على الميكروفون وابدأ الحديث";
  };

  recognition.onerror = (event) => {
    console.error(event.error);
    statusText.textContent = "حدث خطأ في التعرف على الصوت";
  };

  recognition.onresult = async (event) => {
    const userText = event.results[0][0].transcript;

    if (!userText) return;

    addMessage("user", userText);

    const thinkingEl = addMessage("bot", "...يفكر", {
      thinking: true,
    });

    try {
      const reply = await askGemini(userText);

      thinkingEl.remove();

      addMessage("bot", reply);

      speak(reply);
    } catch (err) {
      console.error(err);

      thinkingEl.remove();

      // ✅ يعرض تفاصيل الخطأ الحقيقية بدل رسالة عامة ثابتة
      addMessage("bot", "حدث خطأ: " + err.message);
    }
  };
}

// --------------------------------------------------------
// 2) إرسال الطلب إلى process.php
// --------------------------------------------------------
async function askGemini(prompt) {
  const res = await fetch(BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: prompt,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    // ✅ تمت إضافة || الناقصة
    throw new Error(data.error || "حدث خطأ غير معروف");
  }

  return data.reply || "لم يصل رد من الخادم.";
}

// --------------------------------------------------------
// 3) تحويل النص إلى كلام
// --------------------------------------------------------
function speak(text) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = LANG;
  utterance.rate = 1;

  window.speechSynthesis.speak(utterance);
}

// --------------------------------------------------------
// أدوات واجهة الدردشة
// --------------------------------------------------------
function addMessage(role, text, opts = {}) {
  const el = document.createElement("div");

  // ✅ تم تحويلها لـ template literal حقيقي (backticks بدل علامات اقتباس عادية)
  el.className = 'message ${ role }${ opts.thinking ? " thinking" : "" }';

  const p = document.createElement("p");

  p.textContent = text;

  el.appendChild(p);

  chatLog.appendChild(el);

  chatLog.scrollTop = chatLog.scrollHeight;

  return el;
}