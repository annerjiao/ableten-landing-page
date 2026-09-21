/**
 * Homepage: job chips swap media; Save/File/Plan swap chapters.
 * Guided cursor tours the stills until Take control (same idea as the
 * preview lock pointer). Drop ableten-loop-trip.mp4 to upgrade the trip loop.
 */
(function () {
    var loop = document.querySelector(".hp-loop");
    if (!loop) return;

    var CHAPTERS = [
        { id: "save", start: 0, end: 10 },
        { id: "file", start: 10, end: 20 },
        { id: "plan", start: 20, end: 34 }
    ];

    var TOUR = [
        { chapter: "save", hotspot: "highlight", wait: 1800 },
        { chapter: "save", hotspot: "saved", wait: 2000, click: true },
        { chapter: "file", hotspot: "card-1", wait: 1500 },
        { chapter: "file", hotspot: "card-2", wait: 1400 },
        { chapter: "file", hotspot: "card-3", wait: 1600 },
        { chapter: "plan", hotspot: "cite", wait: 2800, click: true }
    ];

    var jobButtons = loop.querySelectorAll("[data-job]");
    var chapterButtons = loop.querySelectorAll(".hp-chapter[data-chapter]");
    var frames = loop.querySelectorAll(".hp-frame");
    var caption = loop.querySelector("[data-loop-caption]");
    var jobCopy = loop.querySelectorAll("[data-job-copy]");
    var videoStage = loop.querySelector(".hp-video-stage");
    var video = loop.querySelector("[data-loop-player]");
    var stage = loop.querySelector(".hp-stage");
    var cursor = loop.querySelector("[data-demo-cursor]");
    var takeBtn = loop.querySelector("[data-take-control]");
    var videoReady = false;
    var ignoreTimeupdate = false;
    var touring = false;
    var tourStep = 0;
    var tourTimer = 0;
    var clickTimer = 0;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var coarsePointer = window.matchMedia("(pointer: coarse)").matches;

    function currentJob() {
        return loop.getAttribute("data-job") || "trip";
    }

    function currentChapter() {
        return loop.getAttribute("data-chapter") || "save";
    }

    function chapterByTime(t) {
        for (var i = CHAPTERS.length - 1; i >= 0; i--) {
            if (t >= CHAPTERS[i].start) return CHAPTERS[i].id;
        }
        return "save";
    }

    function chapterMeta(id) {
        for (var i = 0; i < CHAPTERS.length; i++) {
            if (CHAPTERS[i].id === id) return CHAPTERS[i];
        }
        return CHAPTERS[0];
    }

    function visibleFrame() {
        var job = currentJob();
        var chapter = currentChapter();
        for (var i = 0; i < frames.length; i++) {
            var frame = frames[i];
            if (
                frame.getAttribute("data-job-panel") === job &&
                frame.getAttribute("data-chapter") === chapter
            ) {
                return frame;
            }
        }
        return null;
    }

    function updateCaption() {
        if (!caption) return;
        var frame = visibleFrame();
        caption.textContent = frame
            ? frame.getAttribute("data-caption") || ""
            : "";
    }

    function showFrames() {
        var job = currentJob();
        var chapter = currentChapter();
        frames.forEach(function (frame) {
            var match =
                frame.getAttribute("data-job-panel") === job &&
                frame.getAttribute("data-chapter") === chapter;
            frame.classList.toggle("is-visible", match);
            frame.hidden = !match;
        });
        updateCaption();
        document.querySelectorAll("[data-demo-hotspot].is-demo-target").forEach(function (el) {
            el.classList.remove("is-demo-target");
        });
    }

    function setJob(job, options) {
        options = options || {};
        if (!options.fromTour) takeControl();
        loop.setAttribute("data-job", job);
        jobButtons.forEach(function (btn) {
            if (!btn.classList.contains("hp-chip")) return;
            var on = btn.getAttribute("data-job") === job;
            btn.classList.toggle("is-active", on);
            btn.setAttribute("aria-selected", String(on));
        });
        jobCopy.forEach(function (el) {
            el.hidden = el.getAttribute("data-job-copy") !== job;
        });
        if (video && videoReady && job === "trip") {
            loop.classList.add("is-video");
            if (videoStage) videoStage.hidden = false;
        } else {
            loop.classList.remove("is-video");
            if (videoStage) videoStage.hidden = true;
            if (video && job !== "trip") video.pause();
        }
        showFrames();
    }

    function setChapter(id, options) {
        options = options || {};
        if (!options.fromTour) takeControl();
        loop.setAttribute("data-chapter", id);
        chapterButtons.forEach(function (btn) {
            var on = btn.getAttribute("data-chapter") === id;
            btn.classList.toggle("is-active", on);
            btn.setAttribute("aria-selected", String(on));
        });
        showFrames();

        if (videoReady && currentJob() === "trip" && video && !options.skipVideo) {
            var meta = chapterMeta(id);
            ignoreTimeupdate = true;
            try {
                video.currentTime = meta.start;
            } catch (e) {}
            if (options.play !== false && !touring) {
                video.play().catch(function () {});
            }
            window.setTimeout(function () {
                ignoreTimeupdate = false;
            }, 80);
        }
    }

    function hotspotEl(name) {
        var frame = visibleFrame();
        if (!frame) return null;
        return frame.querySelector('[data-demo-hotspot="' + name + '"]');
    }

    function moveCursorTo(el) {
        if (!cursor || !stage || !el) return;
        var stageBox = stage.getBoundingClientRect();
        var box = el.getBoundingClientRect();
        var x = box.left - stageBox.left + Math.min(box.width * 0.62, box.width - 8);
        var y = box.top - stageBox.top + box.height * 0.4;
        cursor.style.setProperty("--cx", Math.max(12, x) + "px");
        cursor.style.setProperty("--cy", Math.max(12, y) + "px");
    }

    function pulseClick() {
        if (!cursor) return;
        cursor.style.setProperty("--cs", "0.86");
        window.clearTimeout(clickTimer);
        clickTimer = window.setTimeout(function () {
            cursor.style.setProperty("--cs", "1");
        }, 180);
    }

    function clearTourTimers() {
        window.clearTimeout(tourTimer);
        window.clearTimeout(clickTimer);
    }

    function canTour() {
        if (reduceMotion || coarsePointer) return false;
        if (videoReady && currentJob() === "trip") return false;
        return true;
    }

    function takeControl() {
        if (!touring && loop.classList.contains("is-control")) return;
        touring = false;
        clearTourTimers();
        loop.classList.remove("is-touring");
        loop.classList.add("is-control");
        if (cursor) cursor.hidden = true;
        if (takeBtn) takeBtn.textContent = "Watch demo";
        document.querySelectorAll("[data-demo-hotspot].is-demo-target").forEach(function (el) {
            el.classList.remove("is-demo-target");
        });
        if (video) video.pause();
    }

    function runTourStep() {
        if (!touring) return;
        var step = TOUR[tourStep];
        setChapter(step.chapter, { fromTour: true, skipVideo: true, play: false });
        window.requestAnimationFrame(function () {
            var el = hotspotEl(step.hotspot);
            if (el) {
                el.classList.add("is-demo-target");
                moveCursorTo(el);
                if (step.click) pulseClick();
            }
            tourTimer = window.setTimeout(function () {
                tourStep = (tourStep + 1) % TOUR.length;
                runTourStep();
            }, step.wait);
        });
    }

    function startTour() {
        if (!canTour()) {
            loop.classList.add("is-control");
            if (takeBtn) takeBtn.hidden = true;
            return;
        }
        touring = true;
        tourStep = 0;
        loop.classList.add("is-touring");
        loop.classList.remove("is-control");
        if (cursor) {
            cursor.hidden = false;
            cursor.style.setProperty("--cx", "64px");
            cursor.style.setProperty("--cy", "80px");
            cursor.style.setProperty("--cs", "1");
        }
        if (takeBtn) {
            takeBtn.hidden = false;
            takeBtn.textContent = "Take control";
        }
        runTourStep();
    }

    jobButtons.forEach(function (btn) {
        if (!btn.classList.contains("hp-chip")) return;
        btn.addEventListener("click", function () {
            setJob(btn.getAttribute("data-job"));
        });
    });

    chapterButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            setChapter(btn.getAttribute("data-chapter"), { play: true });
        });
    });

    if (takeBtn) {
        takeBtn.addEventListener("click", function (event) {
            event.stopPropagation();
            if (touring) takeControl();
            else startTour();
        });
    }

    if (stage) {
        stage.addEventListener("pointerdown", function (event) {
            if (event.target.closest("[data-take-control]")) return;
            if (touring) takeControl();
        });
    }

    if (video) {
        video.addEventListener("loadeddata", function () {
            if (!video.duration || video.duration < 1) return;
            videoReady = true;
            if (currentJob() === "trip") {
                loop.classList.add("is-video");
                if (videoStage) videoStage.hidden = false;
                takeControl();
            }
        });
        video.addEventListener("error", function () {
            videoReady = false;
            loop.classList.remove("is-video");
            if (videoStage) videoStage.hidden = true;
        });
        video.addEventListener("timeupdate", function () {
            if (ignoreTimeupdate || currentJob() !== "trip") return;
            var id = chapterByTime(video.currentTime);
            if (id !== currentChapter()) {
                setChapter(id, { skipVideo: true, fromTour: true });
            }
            var meta = chapterMeta(currentChapter());
            if (video.currentTime >= meta.end - 0.15 && !video.paused) {
                var idx = CHAPTERS.findIndex(function (c) { return c.id === meta.id; });
                if (idx === CHAPTERS.length - 1) {
                    video.pause();
                }
            }
        });
    }

    var hashLocked = false;

    function applyHash() {
        var hash = (window.location.hash || "").replace("#", "");
        if (hash === "file" || hash === "save" || hash === "plan") {
            hashLocked = true;
            takeControl();
            setChapter(hash, { play: false, fromTour: true });
        }
    }

    applyHash();
    window.addEventListener("hashchange", applyHash);

    /* Lightbox */
    var dialog = document.querySelector("[data-lightbox-dialog]");
    var dialogBody = document.querySelector("[data-lightbox-body]");
    var closeBtn = document.querySelector("[data-lightbox-close]");

    function closeLightbox() {
        if (!dialog) return;
        if (dialogBody) dialogBody.innerHTML = "";
        if (typeof dialog.close === "function") dialog.close();
    }

    document.querySelectorAll("[data-lightbox]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            takeControl();
            if (!dialog || !dialogBody) return;
            dialogBody.innerHTML = "";
            var clone = btn.cloneNode(true);
            clone.removeAttribute("data-lightbox");
            clone.removeAttribute("aria-label");
            clone.setAttribute("tabindex", "-1");
            clone.style.cursor = "default";
            dialogBody.appendChild(clone);
            if (typeof dialog.showModal === "function") dialog.showModal();
        });
    });

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (dialog) {
        dialog.addEventListener("click", function (event) {
            if (event.target === dialog) closeLightbox();
        });
        dialog.addEventListener("cancel", closeLightbox);
    }

    setJob(currentJob(), { fromTour: true });
    setChapter(currentChapter(), { skipVideo: true, fromTour: true });

    if ("IntersectionObserver" in window) {
        var started = false;
        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting || started) return;
                    started = true;
                    if (hashLocked || loop.classList.contains("is-control")) return;
                    startTour();
                    observer.disconnect();
                });
            },
            { threshold: 0.4 }
        );
        observer.observe(loop);
    } else {
        startTour();
    }
})();

(function () {
    var root = document.querySelector("[data-rotate]");
    var word = document.querySelector("[data-rotate-word]");
    if (!root || !word) return;

    var phrases = [
        "trip plans",
        "side projects",
        "co-authored articles",
        "shared journals"
    ];
    var index = 0;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function measure(phrase) {
        var prev = word.textContent;
        word.textContent = phrase;
        root.style.width = "auto";
        var w = Math.ceil(word.getBoundingClientRect().width);
        word.textContent = prev;
        return Math.max(w, 1);
    }

    var widths = phrases.map(measure);

    function fit(i) {
        root.style.width = widths[i] + "px";
    }

    function setPhrase(next) {
        word.textContent = phrases[next];
        root.setAttribute("aria-label", phrases[next]);
        fit(next);
    }

    setPhrase(0);
    window.addEventListener("resize", function () {
        widths = phrases.map(measure);
        fit(index);
    });
    if (reduceMotion) return;

    window.setInterval(function () {
        var next = (index + 1) % phrases.length;
        word.classList.remove("is-in");
        word.classList.add("is-out");
        window.setTimeout(function () {
            index = next;
            setPhrase(index);
            word.classList.remove("is-out");
            word.classList.add("is-in");
        }, 360);
    }, 2800);
})();
