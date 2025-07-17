class JSort {
    constructor(el, options) {
        this.elParentGrab = el;
        this.handlerClass = this.elParentGrab.dataset.sortHandler ?? ".sort-handler";
        this.duration = this.elParentGrab.dataset.sortDuration ?? 450;
        this.easing = this.elParentGrab.dataset.sortEasing ?? "cubic-bezier(0.6, 0, 0.6, 1)";
        this.groupGrab = this.elParentGrab.dataset.sortGroup;
        this.zIndex = this.elParentGrab.dataset.zindex ?? 0x7FFFFFFF; // Maximum 32-bit signed integer
        this.init(options);
    }

    appendGhost({ clientX, clientY }) {
        this.isFirstMove = true;
        this.elGhost = this.elActive.cloneNode(true);
        const { x, y, width, height } = this.elActive.getBoundingClientRect();
        Object.assign(this.pointerStart, { clientX, clientY });
        Object.assign(this.elGhost.style, {
            left: `${x}px`,
            top: `${y}px`,
            width: `${width}px`,
            height: `${height}px`,
            position: "fixed",
            pointerEvents: "none",
            zIndex: this.zIndex,
            opacity: 0.8,
        });
        this.elGhost.classList.add("sort-ghost");
        this.elParentGrab.append(this.elGhost);
    }

    animateItem({ el, x, y }) {
        const { left, top } = el.getBoundingClientRect();
        if (x === left && y === top) return;
        el.classList.add("is-sort-animated");
        const keyframes = el === this.elActive ?
            [
                { zIndex: 1, translate: `${x - left}px ${y - top}px`, opacity: 0.9 },
                { zIndex: 1, translate: "0", opacity: 1 },
            ] : [
                { scale: 1.0, translate: `${x - left}px ${y - top}px` },
                { scale: 0.85 },
                { scale: 1.0, translate: "0" },
            ];
        el.animate(keyframes, { duration: this.duration, easing: this.easing })
            .addEventListener("finish", (ev) => { ev.target.effect.target.classList.remove("is-sort-animated"); });
    }

    grab = (ev) => {
        const { pointerId, target } = ev;
        if (this.elActive) return;
        const elClosestItem = target.closest(".sort-item");
        if (!elClosestItem) return;
        const hasHandler = Boolean(elClosestItem.querySelector(this.handlerClass));
        const elHandler = target.closest(this.handlerClass);
        if (hasHandler && !elHandler) return;
        this.elActive = elClosestItem;
        this.elActive.setPointerCapture(pointerId);
        this.indexGrab = [...this.elParentGrab.children].indexOf(this.elActive);
        // Notify
        this.onGrab?.call(this, ev);
    }

    checkValidity({ clientX, clientY }) {
        const elFromPoint = document.elementFromPoint(clientX, clientY);
        const elTarget = elFromPoint?.closest(".sort-item, .sortable");
        const elParentDrop = elFromPoint?.closest(`.sortable`);
        const isSameParent = elParentDrop === this.elParentGrab;
        const groupDrop = elParentDrop?.dataset.sortGroup;
        const isValidGroup = !isSameParent && Boolean(groupDrop && this.groupGrab === groupDrop);
        const isValid =
            elTarget &&
            elParentDrop &&
            isValidGroup || isSameParent;
        return isValid;
    }

    move = (ev) => {
        const { pointerId, clientX, clientY } = ev;
        if (!this.elActive?.hasPointerCapture(pointerId)) return;
        this.elActive.classList.add("is-sort-active");
        !this.isFirstMove && this.appendGhost({ clientX, clientY });

        const isValid = this.checkValidity({ clientX, clientY });

        // Move ghost element
        this.elGhost.style.translate = `${clientX - this.pointerStart.clientX}px ${clientY - this.pointerStart.clientY}px`;
        this.elGhost.classList.toggle("is-sort-invalid", !isValid);

        this.elTarget?.classList.remove("is-sort-target");
        if (isValid) {
            this.elTarget = document.elementFromPoint(clientX, clientY)?.closest(".sort-item, .sortable");
            this.elTarget?.classList.add("is-sort-target");
        }

        // Notify
        this.onMove?.call(this, ev);
    }

    drop = (ev) => {
        const { pointerId, clientX, clientY } = ev;
        if (!this.elActive?.hasPointerCapture(pointerId)) return;

        this.elActive?.classList.remove("is-sort-active");
        this.elTarget?.classList.remove("is-sort-target");
        const elFromPoint = document.elementFromPoint(clientX, clientY);
        this.elTarget = elFromPoint?.closest(".sort-item, .sortable");
        this.elParentDrop = elFromPoint?.closest(`.sortable`);
        const isSameParent = this.elParentDrop === this.elParentGrab;
        const isDroppedOntoParent = Boolean(this.elTarget && this.elParentDrop && this.elTarget === this.elParentDrop);

        // 1. Store the positions of ghost element
        const ghostRect = this.elGhost?.getBoundingClientRect();

        if (this.checkValidity({ clientX, clientY })) {
            const siblingsGrab = [...this.elParentGrab.children].filter(el => el !== this.elGhost);
            this.indexGrab = siblingsGrab.indexOf(this.elActive);

            if (isSameParent) {
                this.indexDrop = isDroppedOntoParent ? Math.max(0, siblingsGrab.length - 1) : siblingsGrab.indexOf(this.elTarget);
                const indexMin = isDroppedOntoParent ? this.indexGrab : Math.min(this.indexDrop, this.indexGrab);
                const indexMax = isDroppedOntoParent ? siblingsGrab.length - 1 : Math.max(this.indexDrop, this.indexGrab);
                this.affectedItems = siblingsGrab.slice(indexMin, indexMax + 1);
            } else {
                const siblingsDrop = [...this.elParentDrop.children];
                this.indexDrop = isDroppedOntoParent ? Math.max(0, siblingsDrop.length) : siblingsDrop.indexOf(this.elTarget);
                this.affectedItems = [...siblingsGrab.slice(this.indexGrab), ...siblingsDrop.slice(this.indexDrop)];
            }

            // 2. Store initial positions of all affected elements (before DOM manipulation)
            const affectedItemsData = this.affectedItems.map((el) => {
                const { x, y } = el.getBoundingClientRect();
                return { el, x, y };
            });

            // 3. Append to DOM
            if (isDroppedOntoParent) {
                this.elParentDrop.append(this.elActive);
            } else if (isSameParent) {
                this.elParentDrop.insertBefore(this.elActive, this.indexDrop < this.indexGrab ? this.elTarget : this.elTarget.nextSibling);
            } else {
                this.elParentDrop.insertBefore(this.elActive, this.elTarget);
            }

            // 4. Animate other elements
            affectedItemsData.forEach((data) => {
                if (data.el === this.elActive) return; // We'll animate the active element later
                this.animateItem(data);
            });
        }

        // 5. Always animate active element
        ghostRect && this.animateItem({ el: this.elActive, x: ghostRect.left, y: ghostRect.top });
        // Notify
        this.onDrop?.call(this, ev);
        // Cleanup
        this.reset();
    }

    reset() {
        // Cleanup
        this.elGhost?.remove();
        this.elGhost = null;
        this.elActive = null;
        this.elTarget = null;
        this.isFirstMove = false;
        this.elParentDrop = null;
        this.indexGrab = -1;
        this.indexDrop = -1;
        this.affectedItems = [];
        this.pointerStart = {};
    }

    init(options) {
        Object.assign(this, options);
        this.elParentGrab.style.touchAction = "none";
        this.elParentGrab.addEventListener("pointerdown", this.grab);
        this.elParentGrab.addEventListener("pointermove", this.move);
        this.elParentGrab.addEventListener("pointerup", this.drop);
        this.elParentGrab.addEventListener("pointercancel", this.drop);
        this.reset();
    }

    destroy() {
        this.elParentGrab.style.removeProperty("touch-action");
        this.elParentGrab.removeEventListener("pointerdown", this.grab);
        this.elParentGrab.removeEventListener("pointermove", this.move);
        this.elParentGrab.removeEventListener("pointerup", this.drop);
        this.elParentGrab.removeEventListener("pointercancel", this.drop);
    }
}

export default JSort;
