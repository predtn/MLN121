document.addEventListener("DOMContentLoaded", () => {
  const timelineContainer = document.getElementById("timeline-items-container");
  const modal = document.getElementById("detail-modal");
  const modalContent = document.getElementById("modal-content");
  
  // -------- Study Cart (State & Drag & Drop) --------
  const studyList = new Set(JSON.parse(localStorage.getItem("studyList") || "[]"));
  const badgeEl = document.getElementById("study-cart-badge");

  function updateStudyBadge() {
    if (badgeEl) {
      badgeEl.textContent = studyList.size;
    }
  }

  function addToStudyList(id) {
    if (!studyList.has(id)) {
      studyList.add(id);
      localStorage.setItem("studyList", JSON.stringify(Array.from(studyList)));
      clearQuizState(); // Clear progress since pool changed
      updateStudyBadge();
      
      // Update visual button state if it exists in DOM
      const addBtn = document.querySelector(`.card-add-btn[data-id="${id}"]`);
      if (addBtn) {
        addBtn.textContent = "-";
        addBtn.title = "Xóa khỏi phần học tập";
        addBtn.classList.add("added");
      }
      
      // Visual pulse effect on badge
      if (badgeEl) {
        badgeEl.classList.remove("pulse-add", "pulse-remove");
        void badgeEl.offsetWidth; // Trigger reflow to restart animation
        badgeEl.classList.add("pulse-add");
      }
    }
  }

  function removeFromStudyList(id) {
    if (studyList.has(id)) {
      studyList.delete(id);
      localStorage.setItem("studyList", JSON.stringify(Array.from(studyList)));
      clearQuizState(); // Clear progress since pool changed
      updateStudyBadge();
      
      // Update visual button state if it exists in DOM
      const addBtn = document.querySelector(`.card-add-btn[data-id="${id}"]`);
      if (addBtn) {
        addBtn.textContent = "+";
        addBtn.title = "Thêm vào phần học tập";
        addBtn.classList.remove("added");
      }
      
      // Visual pulse effect on badge
      if (badgeEl) {
        badgeEl.classList.remove("pulse-add", "pulse-remove");
        void badgeEl.offsetWidth; // Trigger reflow to restart animation
        badgeEl.classList.add("pulse-remove");
      }
    }
  }

  // Clean up animation classes on end
  if (badgeEl) {
    badgeEl.addEventListener("animationend", () => {
      badgeEl.classList.remove("pulse-add", "pulse-remove");
    });
  }

  // Initial update
  updateStudyBadge();

  // Render timeline elements dynamically from data.js
  function renderTimeline() {
    timelineData.forEach((item, index) => {
      const isOdd = index % 2 !== 0;
      
      const itemElement = document.createElement("div");
      itemElement.className = "timeline-item scroll-animate";
      
      // Card color border highlight (uses pastel colors defined in dataset)
      const borderStyle = `border-color: ${item.color}`;
      const yearBgStyle = `background-color: ${item.color}`;
      const nodeBorderStyle = `border-color: ${item.color}`;
      
      const isAdded = studyList.has(String(item.id));
      const btnText = isAdded ? "-" : "+";
      const btnTitle = isAdded ? "Xóa khỏi phần học tập" : "Thêm vào phần học tập";
      const btnClass = isAdded ? "card-add-btn added" : "card-add-btn";
      
      itemElement.innerHTML = `
        <div class="timeline-node" style="${nodeBorderStyle}" data-id="${item.id}">
          ${item.icon}
        </div>
        <div class="timeline-card" style="${borderStyle}" data-id="${item.id}" draggable="true">
          <div class="${btnClass}" data-id="${item.id}" title="${btnTitle}">${btnText}</div>
          <span class="timeline-year" style="${yearBgStyle}">${item.year}</span>
          <h3 class="timeline-title">${item.title}</h3>
          <p class="timeline-desc">${item.shortDesc}</p>
          <div class="timeline-tooltip">💡 Nhấp để xem chi tiết mốc lịch sử này!</div>
        </div>
      `;
      
      timelineContainer.appendChild(itemElement);
    });
  }
  
  renderTimeline();

  // Scroll Triggered Animations for Timeline Items
  const animatedElements = document.querySelectorAll(".scroll-animate");
  
  const observerOptions = {
    root: null,
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  }, observerOptions);
  
  animatedElements.forEach(el => observer.observe(el));

  // Dynamic drawing of the timeline line based on scroll progress
  const timelineSection = document.querySelector(".timeline-section");
  const timelineActiveLine = document.querySelector(".timeline-line-active");

  function adjustTimelineLine() {
    const nodes = document.querySelectorAll(".timeline-node");
    if (nodes.length > 0 && timelineActiveLine) {
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      
      const firstItem = firstNode.closest(".timeline-item");
      const lastItem = lastNode.closest(".timeline-item");
      
      const lineTop = firstItem.offsetTop + (firstItem.offsetHeight / 2);
      const lineBottom = lastItem.offsetTop + (lastItem.offsetHeight / 2);
      
      const container = timelineActiveLine.parentElement;
      container.style.top = `${lineTop}px`;
      container.style.height = `${lineBottom - lineTop}px`;
      container.style.bottom = "auto";
    }
  }

  function updateTimelineLine() {
    if (!timelineSection || !timelineActiveLine) return;
    
    const container = timelineActiveLine.parentElement;
    const containerRect = container.getBoundingClientRect();
    const containerHeight = containerRect.height;
    
    // Calculate how much of the timeline line container is scrolled through
    const viewportMiddle = window.innerHeight / 1.5;
    const scrollStart = containerRect.top - viewportMiddle;
    
    let progress = 0;
    if (scrollStart < 0) {
      progress = Math.abs(scrollStart) / containerHeight;
    }
    
    // Clamp progress between 0% and 100%
    const percentage = Math.min(Math.max(progress * 100, 0), 100);
    timelineActiveLine.style.height = `${percentage}%`;
  }

  // Adjust on load and resize to ensure correct geometry
  adjustTimelineLine();
  window.addEventListener("scroll", updateTimelineLine);
  window.addEventListener("resize", () => {
    adjustTimelineLine();
    updateTimelineLine();
  });
  window.addEventListener("load", () => {
    adjustTimelineLine();
    updateTimelineLine();
  });
  updateTimelineLine();

  // Parallax Background Shapes
  const shapes = document.querySelectorAll(".shape");
  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    shapes.forEach((shape, index) => {
      const speed = (index + 1) * 0.08;
      shape.style.transform = `translateY(${scrollY * speed}px)`;
    });
  });

  // Modal Open/Close Logic
  function openModal(id) {
    const item = timelineData.find(d => d.id == id);
    if (!item) return;
    
    const modalHeroImage = modal.querySelector(".modal-hero-image");
    const modalBody = modal.querySelector(".modal-body");
    
    modalHeroImage.src = item.image;
    modalHeroImage.alt = item.title;
    
    modalBody.innerHTML = `
      <div class="modal-header-info">
        <div class="modal-icon">${item.icon}</div>
        <span class="modal-year-tag" style="background-color: ${item.color}">${item.year}</span>
      </div>
      <h2 class="modal-title">${item.title}</h2>
      <p class="modal-desc">${item.longDesc}</p>
      <button class="modal-back-btn" id="close-modal-btn">
        Quay lại timeline
      </button>
    `;
    
    // Open Modal with Transitions
    modal.classList.add("open");
    document.body.style.overflow = "hidden"; // Disable background scrolling
    
    // Attach close handler inside the dynamically created button
    document.getElementById("close-modal-btn").addEventListener("click", closeModal);
  }

  function closeModal() {
    modal.classList.remove("open");
    document.body.style.overflow = ""; // Enable background scrolling
  }

  // Listeners for cards and nodes
  timelineContainer.addEventListener("click", (e) => {
    // If click is on add-button, prevent opening the card detail modal
    if (e.target.closest(".card-add-btn")) {
      return;
    }
    
    const card = e.target.closest(".timeline-card");
    const node = e.target.closest(".timeline-node");
    
    if (card) {
      openModal(card.dataset.id);
    } else if (node) {
      openModal(node.dataset.id);
    }
  });

  // Close modal when clicking on background wrapper or close 'X' button
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest(".modal-close-btn")) {
      closeModal();
    }
  });

  // Support ESC key to close modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });

  // Theme Toggle (Dark Mode / Light Mode)
  const themeToggleBtn = document.getElementById("theme-toggle");
  const currentTheme = localStorage.getItem("theme");

  function updateToggleIcon(isDark) {
    const sunIcon = themeToggleBtn.querySelector(".sun-icon");
    const moonIcon = themeToggleBtn.querySelector(".moon-icon");
    if (isDark) {
      sunIcon.style.display = "block";
      moonIcon.style.display = "none";
    } else {
      sunIcon.style.display = "none";
      moonIcon.style.display = "block";
    }
  }

  // Apply saved theme on load
  if (currentTheme === "dark") {
    document.body.classList.add("dark-theme");
    updateToggleIcon(true);
  }

  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    const isDark = document.body.classList.contains("dark-theme");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateToggleIcon(isDark);
  });

  // -------- Sticker Quote Bubbles --------
  const marxQuotes = [
    "\"Lịch sử của mọi xã hội tồn tại từ trước đến nay là lịch sử của đấu tranh giai cấp.\"",
    "\"Các triết gia đã chỉ giải thích thế giới theo nhiều cách khác nhau; vấn đề là phải thay đổi nó.\"",
    "\"Lao động là nguồn gốc của mọi của cải vật chất.\"",
    "\"Từ mỗi người theo năng lực của mình — cho mỗi người theo nhu cầu của mình.\"",
    "\"Tôn giáo là tiếng thở dài của chúng sinh bị áp bức, là trái tim của thế giới vô tâm.\""
  ];

  const leninQuotes = [
    "\"Học, học nữa, học mãi.\"",
    "\"Không có lý luận cách mạng thì không thể có phong trào cách mạng.\"",
    "\"Tin tưởng là tốt, nhưng kiểm soát còn tốt hơn.\"",
    "\"Chủ nghĩa đế quốc là giai đoạn tột cùng của chủ nghĩa tư bản.\"",
    "\"Kẻ nào không làm việc, kẻ đó không được ăn.\""
  ];

  function showQuoteBubble(stickerEl, quotes) {
    // Remove any existing bubble on this sticker
    const existing = stickerEl.querySelector(".sticker-quote-bubble");
    if (existing) existing.remove();

    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    const bubble = document.createElement("div");
    bubble.className = "sticker-quote-bubble";
    bubble.textContent = quote;
    stickerEl.appendChild(bubble);

    // Trigger fade-in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bubble.classList.add("visible");
      });
    });

    // Fade-out after 4s
    setTimeout(() => {
      bubble.classList.remove("visible");
      bubble.addEventListener("transitionend", () => bubble.remove(), { once: true });
    }, 4000);
  }

  document.querySelector(".marx-sticker").addEventListener("click", function () {
    showQuoteBubble(this, marxQuotes);
  });

  document.querySelector(".lenin-sticker").addEventListener("click", function () {
    showQuoteBubble(this, leninQuotes);
  });

  // Plus/Minus button click handlers
  timelineContainer.addEventListener("click", (e) => {
    const addBtn = e.target.closest(".card-add-btn");
    if (addBtn) {
      e.stopPropagation();
      const cardId = addBtn.dataset.id;
      if (studyList.has(cardId)) {
        removeFromStudyList(cardId);
      } else {
        addToStudyList(cardId);
      }
    }
  });

  // Drag and Drop Event Listeners
  timelineContainer.addEventListener("dragstart", (e) => {
    const card = e.target.closest(".timeline-card");
    if (card) {
      card.classList.add("dragging");
      e.dataTransfer.setData("text/plain", card.dataset.id);
      e.dataTransfer.effectAllowed = "copy";
    }
  });

  // Drag and Drop Event Listeners
  timelineContainer.addEventListener("dragend", (e) => {
    const card = e.target.closest(".timeline-card");
    if (card) {
      card.classList.remove("dragging");
    }
  });

  const studyCartBtn = document.getElementById("study-cart-btn");
  if (studyCartBtn) {
    studyCartBtn.addEventListener("dragover", (e) => {
      e.preventDefault();
      studyCartBtn.classList.add("drag-over");
      e.dataTransfer.dropEffect = "copy";
    });

    studyCartBtn.addEventListener("dragleave", () => {
      studyCartBtn.classList.remove("drag-over");
    });

    studyCartBtn.addEventListener("drop", (e) => {
      e.preventDefault();
      studyCartBtn.classList.remove("drag-over");
      const id = e.dataTransfer.getData("text/plain");
      if (id) {
        addToStudyList(id);
      }
    });
  }

  // -------- Quiz Modal Logic --------
  const quizModal = document.getElementById("quiz-modal");
  const quizEmptyState = document.getElementById("quiz-empty-state");
  const quizQuestionState = document.getElementById("quiz-question-state");
  const quizResultState = document.getElementById("quiz-result-state");
  
  const quizCurrentIndexEl = document.getElementById("quiz-current-index");
  const quizTotalQuestionsEl = document.getElementById("quiz-total-questions");
  const quizProgressFillEl = document.getElementById("quiz-progress-fill");
  const quizQuestionTextEl = document.getElementById("quiz-question-text");
  const quizOptionsGridEl = document.getElementById("quiz-options-grid");
  const quizFeedbackTextEl = document.getElementById("quiz-feedback-text");
  const quizNextBtn = document.getElementById("quiz-next-btn");
  const quizPrevBtn = document.getElementById("quiz-prev-btn");
  
  const quizCorrectScoreEl = document.getElementById("quiz-correct-score");
  const quizTotalScoreEl = document.getElementById("quiz-total-score");
  const quizResultMessageEl = document.getElementById("quiz-result-message");
  const quizResultIconEl = document.getElementById("quiz-result-icon");

  let quizPool = [];
  let currentQuestionIdx = 0;
  let correctCount = 0;
  let userAnswers = [];

  function saveQuizState() {
    const state = {
      studyList: Array.from(studyList),
      quizPool: quizPool,
      currentQuestionIdx: currentQuestionIdx,
      userAnswers: userAnswers,
      correctCount: correctCount,
      isQuizActive: true
    };
    localStorage.setItem("savedQuizState", JSON.stringify(state));
  }

  function loadQuizState() {
    const saved = localStorage.getItem("savedQuizState");
    if (!saved) return null;
    try {
      const state = JSON.parse(saved);
      const savedList = state.studyList || [];
      if (savedList.length !== studyList.size) return null;
      
      const allMatch = savedList.every(id => studyList.has(String(id)));
      if (!allMatch) return null;
      
      return state;
    } catch (e) {
      return null;
    }
  }

  function clearQuizState() {
    localStorage.removeItem("savedQuizState");
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function compileQuiz() {
    quizPool = [];
    studyList.forEach(id => {
      const eventItem = timelineData.find(item => String(item.id) === String(id));
      if (eventItem && eventItem.questions) {
        eventItem.questions.forEach(q => {
          quizPool.push({ ...q });
        });
      }
    });
    shuffleArray(quizPool);
  }

  function startQuiz() {
    const savedState = loadQuizState();
    
    if (savedState && savedState.isQuizActive) {
      quizPool = savedState.quizPool;
      currentQuestionIdx = savedState.currentQuestionIdx;
      userAnswers = savedState.userAnswers;
      correctCount = savedState.correctCount;
    } else {
      compileQuiz();
      currentQuestionIdx = 0;
      correctCount = 0;
      userAnswers = new Array(quizPool.length).fill(null);
      saveQuizState();
    }
    
    quizEmptyState.style.display = "none";
    quizResultState.style.display = "none";
    quizQuestionState.style.display = "flex";
    
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    if (quizPool.length === 0) return;
    
    const q = quizPool[currentQuestionIdx];
    quizCurrentIndexEl.textContent = currentQuestionIdx + 1;
    quizTotalQuestionsEl.textContent = quizPool.length;
    
    const answeredCount = userAnswers.filter(ans => ans !== null).length;
    const progressPct = (answeredCount / quizPool.length) * 100;
    quizProgressFillEl.style.width = `${progressPct}%`;
    
    quizQuestionTextEl.textContent = q.question;
    quizOptionsGridEl.innerHTML = "";
    quizFeedbackTextEl.textContent = "";
    
    // Set navigation buttons visibility
    if (currentQuestionIdx > 0) {
      quizPrevBtn.style.visibility = "visible";
    } else {
      quizPrevBtn.style.visibility = "hidden";
    }
    
    const savedAnswer = userAnswers[currentQuestionIdx];
    const hasBeenAnswered = savedAnswer !== null;
    
    if (hasBeenAnswered) {
      quizNextBtn.style.visibility = "visible";
      if (currentQuestionIdx === quizPool.length - 1) {
        quizNextBtn.textContent = "Hoàn thành ➔";
      } else {
        quizNextBtn.textContent = "Sang câu tiếp ➔";
      }
    } else {
      quizNextBtn.style.visibility = "hidden";
    }

    q.options.forEach((optText, index) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option-btn";
      btn.textContent = optText;
      
      if (hasBeenAnswered) {
        btn.disabled = true;
        if (index === q.correct) {
          btn.classList.add("correct-choice");
        } else if (index === savedAnswer) {
          btn.classList.add("wrong-choice");
        }
      } else {
        btn.addEventListener("click", () => handleAnswer(index, btn));
      }
      
      quizOptionsGridEl.appendChild(btn);
    });
    
    if (hasBeenAnswered) {
      if (savedAnswer === q.correct) {
        quizFeedbackTextEl.textContent = "✓ Chính xác!";
        quizFeedbackTextEl.style.color = "var(--pastel-green)";
      } else {
        quizFeedbackTextEl.textContent = "✗ Chưa đúng!";
        quizFeedbackTextEl.style.color = "var(--pastel-red)";
      }
    }
  }

  function handleAnswer(selectedIndex, clickedBtn) {
    const q = quizPool[currentQuestionIdx];
    userAnswers[currentQuestionIdx] = selectedIndex;
    
    const optionBtns = quizOptionsGridEl.querySelectorAll(".quiz-option-btn");
    optionBtns.forEach(btn => btn.disabled = true);
    
    if (selectedIndex === q.correct) {
      clickedBtn.classList.add("correct-choice");
      quizFeedbackTextEl.textContent = "✓ Chính xác!";
      quizFeedbackTextEl.style.color = "var(--pastel-green)";
      correctCount++;
    } else {
      clickedBtn.classList.add("wrong-choice");
      optionBtns[q.correct].classList.add("correct-choice");
      quizFeedbackTextEl.textContent = "✗ Chưa đúng!";
      quizFeedbackTextEl.style.color = "var(--pastel-red)";
    }
    
    const answeredCount = userAnswers.filter(ans => ans !== null).length;
    const progressPct = (answeredCount / quizPool.length) * 100;
    quizProgressFillEl.style.width = `${progressPct}%`;
    
    quizNextBtn.style.visibility = "visible";
    if (currentQuestionIdx === quizPool.length - 1) {
      quizNextBtn.textContent = "Hoàn thành ➔";
    } else {
      quizNextBtn.textContent = "Sang câu tiếp ➔";
    }
    
    saveQuizState();
  }

  function showQuizResults() {
    quizQuestionState.style.display = "none";
    quizResultState.style.display = "flex";
    
    quizCorrectScoreEl.textContent = correctCount;
    quizTotalScoreEl.textContent = quizPool.length;
    
    const pct = (correctCount / quizPool.length) * 100;
    if (pct === 100) {
      quizResultIconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="56" height="56"><path fill-rule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.798 49.798 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z" clip-rule="evenodd" /></svg>`;
      quizResultMessageEl.textContent = "Quá xuất sắc! Bạn đã trả lời đúng toàn bộ câu hỏi ôn tập.";
    } else if (pct >= 70) {
      quizResultIconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="56" height="56"><path fill-rule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clip-rule="evenodd" /></svg>`;
      quizResultMessageEl.textContent = "Rất tốt! Bạn nắm khá vững kiến thức lịch sử rồi đấy.";
    } else {
      quizResultIconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="56" height="56"><path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" /></svg>`;
      quizResultMessageEl.textContent = "Cố lên nhé! Hãy ôn luyện kỹ hơn để củng cố kiến thức.";
    }
    
    clearQuizState();
  }

  function closeQuizModal() {
    quizModal.classList.remove("open");
    document.body.style.overflow = "";
  }

  // Open Quiz Modal
  if (studyCartBtn) {
    studyCartBtn.addEventListener("click", () => {
      quizModal.classList.add("open");
      document.body.style.overflow = "hidden";
      
      if (studyList.size === 0) {
        quizQuestionState.style.display = "none";
        quizResultState.style.display = "none";
        quizEmptyState.style.display = "flex";
      } else {
        startQuiz();
      }
    });
  }

  // Event listeners for closing
  document.getElementById("quiz-modal-close").addEventListener("click", closeQuizModal);
  document.getElementById("quiz-empty-close-btn").addEventListener("click", closeQuizModal);
  document.getElementById("quiz-result-close-btn").addEventListener("click", closeQuizModal);
  
  quizModal.addEventListener("click", (e) => {
    if (e.target === quizModal) {
      closeQuizModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && quizModal.classList.contains("open")) {
      closeQuizModal();
    }
  });

  // Next question
  quizNextBtn.addEventListener("click", () => {
    if (currentQuestionIdx < quizPool.length - 1) {
      currentQuestionIdx++;
      saveQuizState();
      renderQuizQuestion();
    } else {
      showQuizResults();
    }
  });

  // Previous question
  quizPrevBtn.addEventListener("click", () => {
    if (currentQuestionIdx > 0) {
      currentQuestionIdx--;
      saveQuizState();
      renderQuizQuestion();
    }
  });

  // Retry
  document.getElementById("quiz-retry-btn").addEventListener("click", () => {
    startQuiz();
  });

  // -------- Bottom Scroll Progress Bar Logic --------
  const scrollProgressFill = document.getElementById("scroll-progress-fill");
  
  function updateScrollProgress() {
    if (!scrollProgressFill) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgressFill.style.width = `${progress}%`;
  }
  
  window.addEventListener("scroll", updateScrollProgress);
  window.addEventListener("resize", updateScrollProgress);
  updateScrollProgress();
});

