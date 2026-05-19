document.documentElement.classList.add("is-loaded");

const revealTargets = [
  ".hero > div",
  ".hero > aside",
  ".stage > div",
  ".stage > .panel",
  ".landing-band",
  ".screen-card",
  ".feature",
  ".step",
  ".mini",
  ".compare > div",
  ".script-box",
  ".interaction-panel",
  ".footer-nav"
].join(",");

document.querySelectorAll(revealTargets).forEach((node, index) => {
  node.classList.add("reveal-item");
  node.style.setProperty("--reveal-index", String(index % 6));
  if (node.matches(".hero > div, .stage > div")) node.classList.add("reveal-left");
  if (node.matches(".hero > aside, .stage > .panel")) node.classList.add("reveal-right");
});

const showRevealNode = (node) => node.classList.add("is-visible");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      showRevealNode(entry.target);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll(".reveal-item").forEach((node) => revealObserver.observe(node));
} else {
  document.querySelectorAll(".reveal-item").forEach(showRevealNode);
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const source = document.querySelector(button.dataset.copy);
    const text = source ? source.innerText.trim() : "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      const original = button.textContent;
      button.textContent = "COPIED";
      window.setTimeout(() => {
        button.textContent = original;
      }, 1200);
    } catch {
      button.textContent = "COPY FAILED";
    }
  });
});

document.querySelectorAll("[data-toggle-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(button.dataset.toggleTarget);
    if (!target) return;
    target.classList.toggle("is-active");
    button.setAttribute("aria-pressed", String(target.classList.contains("is-active")));
  });
});

document.querySelectorAll("[data-cycle]").forEach((button) => {
  const target = document.querySelector(button.dataset.cycle);
  if (!target) return;
  const states = JSON.parse(button.dataset.states || "[]");
  let index = 0;
  button.addEventListener("click", () => {
    index = (index + 1) % states.length;
    target.textContent = states[index];
  });
});

document.querySelectorAll("[data-activate-target]").forEach((button) => {
  const target = document.querySelector(button.dataset.activateTarget);
  if (!target) return;
  const original = button.textContent;
  button.addEventListener("click", () => {
    const active = target.classList.toggle("is-activated");
    target.querySelectorAll(".status-cell").forEach((cell) => {
      cell.classList.toggle("is-active", active);
    });
    button.classList.toggle("is-complete", active);
    button.setAttribute("aria-pressed", String(active));
    button.textContent = active ? (button.dataset.activeLabel || "ACTIVE") : original;
  });
});

const fanSignal = document.querySelector("[data-fan-signal]");
if (fanSignal) {
  const fanModes = {
    stuck: {
      score: "72%",
      state: "反馈延迟",
      caption: "你不是没努力，是错误藏得太久。先把“哪里不会”暴露出来。",
      block: "看懂但不会用",
      next: "用一句话复述",
      radius: "20 MIN",
      live: "READY",
      foot: "fan mode: stuck"
    },
    ready: {
      score: "93%",
      state: "开始回路",
      caption: "现在别换视频。拿一个概念，做一题、讲一遍、交付一个小结果。",
      block: "输入已接入",
      next: "立刻做一次输出",
      radius: "08 MIN",
      live: "ONLINE",
      foot: "fan mode: practice"
    },
    share: {
      score: "100%",
      state: "可转发",
      caption: "把这句话发给同学：学习速度 = 暴露错误的速度。",
      block: "金句已生成",
      next: "分享给一个人",
      radius: "01 MIN",
      live: "SHARE",
      foot: "fan mode: shareable"
    }
  };
  const setText = (selector, text) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = text;
  };
  document.querySelectorAll("[data-fan-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      const mode = fanModes[button.dataset.fanMode];
      if (!mode) return;
      fanSignal.classList.add("is-awake");
      document.querySelectorAll("[data-fan-mode]").forEach((item) => item.classList.toggle("is-active", item === button));
      setText("[data-fan-score]", mode.score);
      setText("[data-fan-state]", mode.state);
      setText("[data-fan-caption]", mode.caption);
      setText("[data-fan-block]", mode.block);
      setText("[data-fan-next]", mode.next);
      setText("[data-fan-radius]", mode.radius);
      setText("[data-fan-live]", mode.live);
      setText("[data-fan-foot]", mode.foot);
    });
  });
}

document.querySelectorAll("[data-signal-console]").forEach((consoleNode) => {
  const nodes = Array.from(consoleNode.querySelectorAll("[data-signal-step]"));
  const state = consoleNode.querySelector("[data-signal-state]");
  const index = consoleNode.querySelector("[data-signal-index]");
  const line = consoleNode.querySelector("[data-signal-line]");
  const readout = consoleNode.querySelector("[data-signal-readout]");
  const live = consoleNode.querySelector("[data-signal-live]");
  const cells = Array.from(consoleNode.querySelectorAll("[data-signal-cell]"));
  let activeIndex = 0;
  let autoTimer = null;

  const setSignal = (nextIndex) => {
    activeIndex = (nextIndex + nodes.length) % nodes.length;
    const active = nodes[activeIndex];
    nodes.forEach((node, nodeIndex) => node.classList.toggle("is-active", nodeIndex === activeIndex));
    if (state) state.textContent = active.dataset.state || "READY";
    if (index) index.textContent = String(activeIndex + 1).padStart(2, "0");
    if (line) line.textContent = active.dataset.line || "";
    if (readout) readout.textContent = active.dataset.readout || "signal locked";
    if (live) live.textContent = activeIndex === nodes.length - 1 ? "ONLINE" : "ARMED";
    cells.forEach((cell, cellIndex) => {
      const isLit = cellIndex <= Math.min(activeIndex, cells.length - 1);
      cell.parentElement?.classList.toggle("is-active", isLit);
      if (isLit && cellIndex === 2) cell.textContent = "反馈回路在线";
    });
  };

  nodes.forEach((node, nodeIndex) => {
    node.addEventListener("click", () => {
      if (autoTimer) window.clearInterval(autoTimer);
      autoTimer = null;
      consoleNode.classList.add("is-activated");
      setSignal(nodeIndex);
    });
  });

  consoleNode.querySelectorAll("[data-signal-launch]").forEach((button) => {
    const original = button.textContent;
    button.addEventListener("click", () => {
      consoleNode.classList.add("is-activated");
      button.classList.add("is-complete");
      button.textContent = button.dataset.activeLabel || "ENGINE ONLINE";
      setSignal(0);
      if (autoTimer) window.clearInterval(autoTimer);
      autoTimer = window.setInterval(() => setSignal(activeIndex + 1), 1400);
      window.setTimeout(() => {
        if (autoTimer) window.clearInterval(autoTimer);
        autoTimer = null;
        setSignal(nodes.length - 1);
        button.textContent = original;
        button.classList.remove("is-complete");
      }, 5900);
    });
  });

  consoleNode.querySelectorAll("[data-signal-random]").forEach((button) => {
    button.addEventListener("click", () => {
      if (autoTimer) window.clearInterval(autoTimer);
      autoTimer = null;
      consoleNode.classList.add("is-activated");
      setSignal(activeIndex + 1);
    });
  });

  if (nodes.length) setSignal(0);
});

document.querySelectorAll("[data-run-meters]").forEach((button) => {
  const target = document.querySelector(button.dataset.runMeters);
  if (!target) return;
  const original = button.textContent;
  button.addEventListener("click", () => {
    const active = !target.classList.contains("is-activated");
    target.classList.toggle("is-activated", active);
    target.querySelectorAll("[data-meter-bar]").forEach((bar) => {
      bar.style.setProperty("--w", active ? bar.dataset.active : bar.dataset.idle);
    });
    target.querySelectorAll("[data-meter-label]").forEach((label) => {
      if (!label.dataset.idle) label.dataset.idle = label.textContent;
      label.textContent = active ? label.dataset.active : label.dataset.idle;
    });
    button.classList.toggle("is-complete", active);
    button.textContent = active ? (button.dataset.activeLabel || "COMPLETE") : original;
  });
});

document.querySelectorAll("[data-choice-group]").forEach((group) => {
  group.querySelectorAll("[data-choice-result]").forEach((button) => {
    button.addEventListener("click", () => {
      group.querySelectorAll("[data-choice-result]").forEach((item) => item.classList.remove("is-selected"));
      document.querySelectorAll(".choice-result").forEach((result) => result.classList.remove("is-active"));
      button.classList.add("is-selected");
      const result = document.querySelector(button.dataset.choiceResult);
      if (result) result.classList.add("is-active");
    });
  });
});

document.querySelectorAll("[data-stepper]").forEach((button) => {
  const target = document.querySelector(button.dataset.stepper);
  if (!target) return;
  const items = Array.from(target.querySelectorAll("[data-step-item]"));
  const label = button.dataset.stepLabel ? document.querySelector(button.dataset.stepLabel) : null;
  if (!items.length) return;
  let index = Math.max(0, items.findIndex((item) => item.classList.contains("is-active")));

  const syncStep = () => {
    items.forEach((item, itemIndex) => item.classList.toggle("is-active", itemIndex === index));
    const current = items[index];
    const title = current.querySelector("h3, b")?.textContent?.trim() || `STEP ${index + 1}`;
    if (label) label.textContent = `${String(index + 1).padStart(2, "0")} // ${title}`;
  };

  syncStep();
  button.addEventListener("click", () => {
    index = (index + 1) % items.length;
    syncStep();
  });
});

document.querySelectorAll("[data-countdown]").forEach((button) => {
  const target = document.querySelector(button.dataset.countdown);
  if (!target) return;
  const original = button.textContent;
  const total = Number(button.dataset.seconds || 1200);
  let remaining = total;
  let timerId = null;

  const render = () => {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    target.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  button.addEventListener("click", () => {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
      button.classList.remove("is-complete");
      button.textContent = original;
      return;
    }
    button.classList.add("is-complete");
    button.textContent = button.dataset.activeLabel || "RUNNING";
    timerId = window.setInterval(() => {
      remaining = Math.max(0, remaining - 1);
      render();
      if (remaining === 0) {
        window.clearInterval(timerId);
        timerId = null;
        button.textContent = "DELIVER NOW";
      }
    }, 1000);
  });

  render();
});
