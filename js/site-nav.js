document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header");
    if (!header) return;

    const toggle = header.querySelector(".nav-toggle");
    const items = header.querySelectorAll(".nav-item");

    function closeItems(except) {
        items.forEach((item) => {
            if (item === except) return;
            item.classList.remove("is-open");
            const btn = item.querySelector(".nav-trigger");
            if (btn) btn.setAttribute("aria-expanded", "false");
        });
    }

    function closeMenu() {
        closeItems();
        header.classList.remove("nav-open");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
    }

    items.forEach((item) => {
        const btn = item.querySelector(".nav-trigger");
        if (!btn) return;

        btn.addEventListener("click", (event) => {
            event.stopPropagation();
            const open = !item.classList.contains("is-open");
            closeItems(item);
            item.classList.toggle("is-open", open);
            btn.setAttribute("aria-expanded", String(open));
        });

        item.addEventListener("mouseenter", () => {
            if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
            closeItems(item);
            item.classList.add("is-open");
            btn.setAttribute("aria-expanded", "true");
        });

        item.addEventListener("mouseleave", () => {
            if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
            item.classList.remove("is-open");
            btn.setAttribute("aria-expanded", "false");
        });
    });

    if (toggle) {
        toggle.addEventListener("click", (event) => {
            event.stopPropagation();
            const open = header.classList.toggle("nav-open");
            toggle.setAttribute("aria-expanded", String(open));
            if (!open) closeItems();
        });
    }

    document.addEventListener("click", (event) => {
        if (!header.contains(event.target)) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
    });
});
