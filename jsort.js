class JSort {
    constructor(el, options) {
        this.elParentGrab = el;
        this.group = this.elParentGrab.dataset.jsortGroup;
        this.classHandler = this.elParentGrab.dataset.jsortClassHandler ?? ".sort-handler";
        this.duration = this.elParentGrab.dataset.jsortDuration ?? 450;
        this.easing = this.elParentGrab.dataset.jsortEasing ?? "cubic-bezier(0.6, 0, 0.6, 1)";
        this.zIndex = this.elParentGrab.dataset.jsortZindex ?? 0x7FFFFFFF; // Maximum 32-bit signed integer
        this.init(options);
    }

    appendGhost({ clientX, clientY }) {
        this.isFirstMove = true;
        this.elGhost = this.elGrabbed.cloneNode(true);
        const { x, y, width, height } = this.elGrabbed.getBoundingClientRect();
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
        this.elGhost.classList.add("jsort-ghost");
        this.elParentGrab.append(this.elGhost);
    }

    animateItem({ el, x, y }) {
        const { left, top } = el.getBoundingClientRect();
        if (x === left && y === top) return;
        el.classList.add("is-jsort-animated");
        const keyframes = el === this.elGrabbed ?
            [
                { zIndex: 1, translate: `${x - left}px ${y - top}px`, opacity: 0.9 },
                { zIndex: 1, translate: "0", opacity: 1 },
            ] : [
                { scale: 1.0, translate: `${x - left}px ${y - top}px` },
                { scale: 0.85 },
                { scale: 1.0, translate: "0" },
            ];
        el.animate(keyframes, { duration: this.duration, easing: this.easing })
            .addEventListener("finish", (ev) => { ev.target.effect.target.classList.remove("is-jsort-animated"); });
    }

    grab = (ev) => {
        const { pointerId, target } = ev;
        if (this.elGrabbed) return;
        const elClosestItem = target.closest(".jsort-item");
        if (!elClosestItem) return;
        const hasHandler = Boolean(elClosestItem.querySelector(this.classHandler));
        const elHandler = target.closest(this.classHandler);
        if (hasHandler && !elHandler) return;
        this.elGrabbed = elClosestItem;
        this.elGrabbed.setPointerCapture(pointerId);
        this.indexGrab = [...this.elParentGrab.children].indexOf(this.elGrabbed);
        // Notify
        this.onGrab?.call(this, ev);
    }

    checkValidity({ clientX, clientY }) {
        const elFromPoint = document.elementFromPoint(clientX, clientY);
        const elTarget = elFromPoint?.closest(".jsort-item, .jsort");
        const elParentDrop = elFromPoint?.closest(`.jsort`);
        const isSameParent = elParentDrop === this.elParentGrab;
        const groupDrop = elParentDrop?.dataset.jsortGroup;
        const isValidGroup = !isSameParent && Boolean(groupDrop && this.group === groupDrop);
        const isValid =
            elTarget &&
            elParentDrop &&
            isValidGroup || isSameParent;
        return isValid;
    }

    move = (ev) => {
        const { pointerId, clientX, clientY } = ev;
        if (!this.elGrabbed?.hasPointerCapture(pointerId)) return;
        this.elGrabbed.classList.add("is-jsort-grabbed");
        !this.isFirstMove && this.appendGhost({ clientX, clientY });

        const isValid = this.checkValidity({ clientX, clientY });

        // Move ghost element
        this.elGhost.style.translate = `${clientX - this.pointerStart.clientX}px ${clientY - this.pointerStart.clientY}px`;
        this.elGhost.classList.toggle("is-jsort-invalid", !isValid);

        this.elTarget?.classList.remove("is-jsort-target");
        if (isValid) {
            this.elTarget = document.elementFromPoint(clientX, clientY)?.closest(".jsort-item, .jsort");
            this.elTarget?.classList.add("is-jsort-target");
        }

        // Notify
        this.onMove?.call(this, ev);
    }

    drop = (ev) => {
        const { pointerId, clientX, clientY } = ev;
        if (!this.elGrabbed?.hasPointerCapture(pointerId)) return;

        this.elGrabbed?.classList.remove("is-jsort-grabbed");
        this.elTarget?.classList.remove("is-jsort-target");
        const elFromPoint = document.elementFromPoint(clientX, clientY);
        this.elTarget = elFromPoint?.closest(".jsort-item, .jsort");
        this.elParentDrop = elFromPoint?.closest(`.jsort`);
        const isSameParent = this.elParentDrop === this.elParentGrab;
        const isDroppedOntoParent = Boolean(this.elTarget && this.elParentDrop && this.elTarget === this.elParentDrop);

        // 1. Store the positions of ghost element
        const ghostRect = this.elGhost?.getBoundingClientRect();

        if (this.checkValidity({ clientX, clientY })) {
            const siblingsGrab = [...this.elParentGrab.children].filter(el => el !== this.elGhost);
            this.indexGrab = siblingsGrab.indexOf(this.elGrabbed);

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
                this.elParentDrop.append(this.elGrabbed);
            } else if (isSameParent) {
                this.elParentDrop.insertBefore(this.elGrabbed, this.indexDrop < this.indexGrab ? this.elTarget : this.elTarget.nextSibling);
            } else {
                this.elParentDrop.insertBefore(this.elGrabbed, this.elTarget);
            }

            // 4. Animate other elements
            affectedItemsData.forEach((data) => {
                if (data.el === this.elGrabbed) return; // We'll animate the grabbed item later
                this.animateItem(data);
            });
        }

        // 5. Always animate grabbed element
        ghostRect && this.animateItem({ el: this.elGrabbed, x: ghostRect.left, y: ghostRect.top });
        // Notify
        this.onDrop?.call(this, ev);
        // Cleanup
        this.reset();
    }

    reset() {
        // Cleanup
        this.elGhost?.remove();
        this.elGhost = null;
        this.elGrabbed = null;
        this.elTarget = null;
        this.elParentDrop = null;
        this.indexGrab = -1;
        this.indexDrop = -1;
        this.affectedItems = [];
        this.pointerStart = {};
        this.isFirstMove = false;
    }

    init(options) {
        this.destroy();
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
