class JSort {
    constructor(el, options) {
        this.elParentGrab = el;
        this.classItems = this.elParentGrab.dataset.jsortClassItems ?? ".jsort-item";
        this.classHandler = this.elParentGrab.dataset.jsortClassHandler ?? ".jsort-handler";
        this.duration = this.elParentGrab.dataset.jsortDuration ?? 450;
        this.swap = this.elParentGrab.dataset.jsortSwap === "true";
        this.easing = this.elParentGrab.dataset.jsortEasing ?? "cubic-bezier(0.6, 0, 0.6, 1)";
        this.scale = this.elParentGrab.dataset.jsortScale ?? "1.1";
        this.zIndex = this.elParentGrab.dataset.jsortZindex ?? 0x7FFFFFFF; // Maximum 32-bit signed integer
        this.group = this.elParentGrab.dataset.jsortGroup;
        this.init(options);        
    }

    appendGhost() {
        const { x, y, width, height } = this.elGrabbed.getBoundingClientRect();
        this.elGhost = this.elGrabbed.cloneNode(true);
        Object.assign(this.elGhost.style, {
            position: "fixed",
            left: `${x}px`,
            top: `${y}px`,
            width: `${width}px`,
            height: `${height}px`,
            pointerEvents: "none",
            zIndex: this.zIndex,
            opacity: 0.8,
        });
        this.elGhost.classList.add("jsort-ghost");
        // Animate scale ghost
        this.elGhost.animate([
            { scale: this.scale }
        ], {
            duration: 250,
            easing: this.easing,
            fill: "forwards"
        });
        this.elParentGrab.append(this.elGhost);
    }

    animateItem({ el, x, y }) {
        const { left, top } = el.getBoundingClientRect();
        if (x === left && y === top) return;
        el.classList.add("is-jsort-animated");
        const keyframes = el === this.elGrabbed ?
            [
                { position: "relative", zIndex: 1, translate: `${x - left}px ${y - top}px`, opacity: 0.9, scale: this.scale },
                { position: "relative", zIndex: 1, translate: "0", opacity: 1, scale: 1 },
            ] : [
                { position: "relative", zIndex: 0, scale: 1.0, translate: `${x - left}px ${y - top}px` },
                { position: "relative", zIndex: 0, scale: 2 - this.scale },
                { position: "relative", zIndex: 0, scale: 1.0, translate: "0" },
            ];
        const anim = el.animate(keyframes, {
            duration: this.duration,
            easing: this.easing,
            fill: "forwards"
        });
        anim.addEventListener("finish", () => {
            el.classList.remove("is-jsort-animated");
            anim.cancel(); // Fixes nested sortable
        });
    }

    closestElement(el, elTarget) {
        while (el && el !== elTarget) el = el.parentElement;
        return el === elTarget ? el : null;
    }

    checkValidity({ clientX, clientY }) {
        const elFromPoint = document.elementFromPoint(clientX, clientY);
        const elTarget = elFromPoint?.closest(`${this.classItems}, .jsort`);
        const elParentDrop = elFromPoint?.closest(`.jsort`);
        const isOntoSelf = elTarget && this.closestElement(elTarget, this.elGrabbed) === this.elGrabbed;
        const isSameParent = elParentDrop === this.elParentGrab;
        const groupDrop = elParentDrop?.dataset.jsortGroup;
        const isValidGroup = !isSameParent && Boolean(groupDrop && this.group === groupDrop);
        const isValid =
            !isOntoSelf &&
            elTarget &&
            elParentDrop &&
            isValidGroup || isSameParent;
        return isValid;
    }

    grab = (ev) => {
        if (this.elGrabbed) return;
        const elClosestItem = ev.target.closest(`${this.classItems}`);

        if (!elClosestItem) return;
        if (elClosestItem.parentElement !== this.elParentGrab) return; // Does not belongs to this sortable

        const hasHandler = Boolean(elClosestItem.querySelector(this.classHandler));
        const elHandler = ev.target.closest(this.classHandler);
        if (hasHandler && !elHandler) return;

        const { clientX, clientY } = ev;
        Object.assign(this.pointerStart, { clientX, clientY });
        this.elParentGrab.style.userSelect = "none";
        this.elGrabbed = elClosestItem;
        this.elGrabbed.setPointerCapture(ev.pointerId);
        this.indexGrab = [...this.elParentGrab.children].indexOf(this.elGrabbed);
        // Notify
        this.onGrab?.call(this, ev);
    }

    move = (ev) => {
        const { pointerId, clientX, clientY } = ev;
        if (!this.elGrabbed?.hasPointerCapture(pointerId)) return;

        if (!this.isFirstMove) {
            this.isFirstMove = true;
            this.appendGhost({ clientX, clientY });
            this.elGrabbed.classList.add("is-jsort-grabbed");
        }

        const isValid = this.checkValidity({ clientX, clientY });
        this.elGhost.style.translate = `${clientX - this.pointerStart.clientX}px ${clientY - this.pointerStart.clientY}px`;
        this.elGhost.classList.toggle("is-jsort-invalid", !isValid);
        this.elGrabbed.style.cursor = isValid ? "grab" : "not-allowed";
        const elFromPoint = document.elementFromPoint(clientX, clientY);
        const elTarget = elFromPoint?.closest(`${this.classItems}, .jsort`);

        if (elTarget !== this.elTarget) {
            this.elTarget?.classList.remove("is-jsort-target");
            if (isValid) {
                this.elTarget = elTarget;
                this.elTarget?.classList.add("is-jsort-target");
            }
        }

        // Notify
        this.onMove?.call(this, ev);
    }

    drop = (ev) => {
        const { pointerId, clientX, clientY } = ev;
        if (!this.elGrabbed?.hasPointerCapture(pointerId)) return;
        this.elParentGrab.style.removeProperty("user-select");
        this.elGrabbed.style.removeProperty("cursor");
        this.elGrabbed?.classList.remove("is-jsort-grabbed");
        this.elTarget?.classList.remove("is-jsort-target");
        const elFromPoint = document.elementFromPoint(clientX, clientY);
        this.elTarget = elFromPoint?.closest(`${this.classItems}, .jsort`);
        this.elParentDrop = elFromPoint?.closest(`.jsort`);
        const isSameParent = this.elParentDrop === this.elParentGrab;
        const isDroppedOntoParent = Boolean(this.elTarget && this.elParentDrop && this.elTarget === this.elParentDrop);

        // 1. Store the positions of ghost element
        this.elGhost?.animate([{ scale: 1.0 }], { duration: 0, fill: "forwards" });
        const ghostRect = this.elGhost?.getBoundingClientRect();

        if (this.checkValidity({ clientX, clientY })) {
            const siblingsGrab = [...this.elParentGrab.children].filter(el => el !== this.elGhost);
            this.indexGrab = siblingsGrab.indexOf(this.elGrabbed);

            if (this.swap) {
                this.affectedItems = [this.elTarget];
            }
            else if (isSameParent) {
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
            if (this.swap) {
                if (!isDroppedOntoParent) {
                    const elNext = this.elGrabbed.nextSibling;
                    this.elParentDrop.insertBefore(this.elGrabbed, this.elTarget.nextSibling);
                    this.elParentGrab.insertBefore(this.elTarget, elNext);
                }
            } else {
                if (isDroppedOntoParent) {
                    this.elParentDrop.append(this.elGrabbed);
                } else if (isSameParent) {
                    this.elParentDrop.insertBefore(this.elGrabbed, this.indexDrop < this.indexGrab ? this.elTarget : this.elTarget.nextSibling);
                } else {
                    this.elParentDrop.insertBefore(this.elGrabbed, this.elTarget);
                }
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

    handleTouchAction = (ev) => {
        const elItem = ev.target.closest(`${this.classItems}`);
        if (!elItem) return;
        ev.preventDefault();
        elItem.style.touchAction = "none";
    }

    reset() {
        // Cleanup
        this.elGrabbed?.style.removeProperty("touch-action");
        this.elGrabbed = null;
        this.elGhost?.remove();
        this.elGhost = null;
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
        this.reset();
        this.elParentGrab.addEventListener("touchstart", this.handleTouchAction);
        this.elParentGrab.addEventListener("pointerdown", this.grab);
        this.elParentGrab.addEventListener("pointermove", this.move);
        this.elParentGrab.addEventListener("pointerup", this.drop);
        this.elParentGrab.addEventListener("pointercancel", this.drop);
    }

    destroy() {
        this.elParentGrab.removeEventListener("touchstart", this.handleTouchAction);
        this.elParentGrab.removeEventListener("pointerdown", this.grab);
        this.elParentGrab.removeEventListener("pointermove", this.move);
        this.elParentGrab.removeEventListener("pointerup", this.drop);
        this.elParentGrab.removeEventListener("pointercancel", this.drop);
    }
}

export default JSort;
