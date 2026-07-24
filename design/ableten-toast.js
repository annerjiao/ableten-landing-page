/**
 * Ableten floating toast helper (extension pages + webapp).
 * Popup uses inline .section-status instead — do not use there.
 */
(function (global) {
    const HOST_ID = 'ableten-toast-host';
    const STYLE_ID = 'ableten-toast-critical-styles';
    const DEFAULT_DURATION_MS = 3500;
    const EXTENSION_BAR_DURATION_MS = 8000;

    const CRITICAL_TOAST_CSS = `
:root {
    --ableten-mint: #EDFFE3;
    --ableten-ink: #333;
    --ableten-border: #6b6794;
    --ableten-border-neutral: #ddd;
    --ableten-border-mint: #b5d9a3;
    --ableten-border-lavender: #b0ace8;
    --ableten-lavender-muted: #F0F0FF;
    --ableten-error: #c62828;
    --ableten-error-bg: #ffebee;
    --ableten-error-border: #ef9a9a;
    --ableten-success-bg: var(--ableten-mint);
    --ableten-success-border: var(--ableten-border-mint);
    --ableten-info-bg: var(--ableten-lavender-muted);
    --ableten-info-border: var(--ableten-border-lavender);
    --ableten-font: 'IBM Plex Mono', monospace;
    --ableten-radius-sm: 3px;
    --ableten-radius-lg: 6px;
    --ableten-shadow-white: #c5c2e4;
}
.ableten-toast-host {
    position: fixed;
    z-index: 100000;
    display: flex;
    flex-direction: column;
    gap: 8px;
    pointer-events: none;
}
.ableten-toast-host--top-right {
    top: 20px;
    right: 20px;
    align-items: flex-end;
}
.ableten-toast-host--bottom-center {
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    align-items: center;
}
.ableten-toast {
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    max-width: min(360px, calc(100vw - 32px));
    font-family: var(--ableten-font);
    font-size: 12px;
    line-height: 1.45;
    color: var(--ableten-ink);
    background: #fff;
    border: 1px solid var(--ableten-border-neutral);
    border-radius: var(--ableten-radius-lg);
    box-shadow: 0 4px 16px rgba(51, 51, 51, 0.12);
}
.ableten-toast--success {
    background: var(--ableten-success-bg);
    border-color: var(--ableten-success-border);
}
.ableten-toast--error {
    background: var(--ableten-error-bg);
    border-color: var(--ableten-error-border);
    color: var(--ableten-error);
}
.ableten-toast--info {
    background: var(--ableten-info-bg);
    border-color: var(--ableten-info-border);
}
.ableten-toast--bar {
    color: #fff;
    background: var(--ableten-ink);
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
}
.ableten-toast--bar.ableten-toast--error {
    color: #fff;
    background: var(--ableten-ink);
    border-color: rgba(255, 255, 255, 0.12);
}
.ableten-toast__message {
    flex: 1;
    min-width: 0;
    white-space: pre-wrap;
}
.ableten-toast__action {
    flex-shrink: 0;
    padding: 4px 10px;
    font-family: var(--ableten-font);
    font-size: 10px;
    font-weight: 500;
    color: var(--ableten-ink);
    background: #fff;
    border: 1px solid var(--ableten-border);
    border-radius: var(--ableten-radius-sm);
    box-shadow: 0 1px 0 var(--ableten-shadow-white);
    cursor: pointer;
}
.ableten-toast__action:hover {
    filter: brightness(0.98);
}
.ableten-toast__action:active {
    transform: translateY(1px);
    box-shadow: none;
}
.ableten-toast--bar .ableten-toast__action {
    color: #fff;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.65);
    box-shadow: none;
}
.ableten-toast--bar .ableten-toast__action:hover {
    background: rgba(255, 255, 255, 0.08);
    filter: none;
}
.ableten-toast__link {
    flex-shrink: 0;
    padding: 0;
    margin: 0;
    font-family: var(--ableten-font);
    font-size: inherit;
    font-weight: 500;
    color: inherit;
    background: none;
    border: none;
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;
}
.ableten-toast__link:hover {
    opacity: 0.88;
}
.ableten-toast--bar .ableten-toast__link {
    color: #fff;
}
`;

    function injectToastStylesOnce() {
        if (typeof document === 'undefined') return;
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CRITICAL_TOAST_CSS;
        (document.head || document.documentElement).appendChild(style);
    }

    function normalizeType(type) {
        if (type === 'success' || type === 'error' || type === 'info') {
            return type;
        }
        return 'info';
    }

    function ensureHost(position) {
        injectToastStylesOnce();
        let host = document.getElementById(HOST_ID);
        if (!host) {
            host = document.createElement('div');
            host.id = HOST_ID;
            host.setAttribute('aria-live', 'polite');
            document.body.appendChild(host);
        }
        host.className = `ableten-toast-host ableten-toast-host--${position}`;
        return host;
    }

    function dismiss(toast) {
        if (toast && toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
        const host = document.getElementById(HOST_ID);
        if (host && host.childElementCount === 0) {
            host.remove();
        }
    }

    function show(options) {
        if (typeof document === 'undefined' || !document.body) {
            return null;
        }

        const opts = typeof options === 'string' ? { message: options } : (options || {});
        const message = opts.message || '';
        const type = normalizeType(opts.type);
        const variant = opts.variant || 'default';
        const position = opts.position || 'bottom-center';
        const duration = opts.duration != null ? opts.duration : DEFAULT_DURATION_MS;

        if (!message && !opts.actionLabel) {
            return null;
        }

        const host = ensureHost(position);
        const toast = document.createElement('div');
        const classNames = [`ableten-toast`, `ableten-toast--${type}`];
        if (variant === 'bar') {
            classNames.push('ableten-toast--bar');
        }
        toast.className = classNames.join(' ');
        toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

        const msg = document.createElement('span');
        msg.className = 'ableten-toast__message';
        msg.textContent = message;
        toast.appendChild(msg);

        if (opts.actionLabel && typeof opts.onAction === 'function') {
            const actionBtn = document.createElement('button');
            actionBtn.type = 'button';
            actionBtn.className = opts.actionStyle === 'link'
                ? 'ableten-toast__link'
                : 'ableten-toast__action';
            actionBtn.textContent = opts.actionLabel;
            actionBtn.addEventListener('click', (event) => {
                event.preventDefault();
                opts.onAction();
                dismiss(toast);
            });
            toast.appendChild(actionBtn);
        }

        host.appendChild(toast);

        if (duration > 0) {
            setTimeout(() => dismiss(toast), duration);
        }

        return toast;
    }

    function showSuccess(message, opts) {
        return show({ ...(opts || {}), message, type: 'success' });
    }

    function showError(message, opts) {
        return show({ ...(opts || {}), message, type: 'error' });
    }

    function showInfo(message, opts) {
        return show({ ...(opts || {}), message, type: 'info' });
    }

    const api = {
        show,
        showSuccess,
        showError,
        showInfo,
        dismiss,
        injectToastStylesOnce,
        EXTENSION_BAR_DURATION_MS
    };

    global.AbletenToast = api;

    /** Background script injection fallback */
    global.__abletenShowPageToast = function (message, type) {
        const method = type === 'success' ? 'showSuccess' : 'showError';
        api[method](message, { position: 'top-right' });
    };
})(typeof globalThis !== 'undefined' ? globalThis : window);
