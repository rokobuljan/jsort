class JSort {
    constructor(el, options) {
        this.elParentGrab = el;
        this.handlerClass = this.elParentGrab.dataset.sortHandler ?? ".sort-handler";
        this.duration = this.elParentGrab.dataset.sortDuration ?? 450;
        this.easing = this.elParentGrab.dataset.sortEasing ?? "cubic-bezier(0.6, 0, 0.6, 1)";
        this.groupGrab = this.elParentGrab.dataset.sortGroup;
        this.pointerStart = {};
        this.MAX_ZINDEX = this.elParentGrab.dataset.sortMaxZIndex ?? 0x7FFFFFFF; // Maximum 32-bit signed integer
        this.init(options);
    }

    appendGhost({ clientX, clientY }) {
        this.isFirstMove = true;
        this.elGhost = this.elActive.cloneNode(true);
        const { top, left, width, height } = this.elActive.getBoundingClientRect();
        Object.assign(this.pointerStart, { clientX, clientY });
        Object.assign(this.elGhost.style, {
            top: `${top}px`,
            left: `${left}px`,
            width: `${width}px`,
            height: `${height}px`,
            position: "fixed",
            pointerEvents: "none",
            zIndex: this.MAX_ZINDEX,
            opacity: 0.8,
        });
        this.elGhost.classList.add("sort-ghost");
        this.elParentGrab.append(this.elGhost);
    }

    animateItem = ({ el, x, y }) => {
        const { left, top } = el.getBoundingClientRect();
        if (x === left && y === top) return;
        el.classList.add("is-sort-animated");
        
        const keyframes = el === this.elActive ?
            [
                { zIndex: 1, translate: `${x - left}px ${y - top}px`, opacity: 0.9 },
                { zIndex: 1, translate: "0", opacity: 1 },
            ] :
            [
                { scale: 1.0, translate: `${x - left}px ${y - top}px` },
                { scale: 0.85 },
                { scale: 1.0, translate: "0" },
            ];
        el.animate(keyframes, { duration: this.duration, easing: this.easing })
            .addEventListener("finish", (ev) => {
                ev.target.effect.target.classList.remove("is-sort-animated");
            });
    }

    grab = ({ pointerId, target }) => {
        if (this.elActive) return;
        const elClosestItem = target.closest(".sort-item");
        if (!elClosestItem) return;
        const hasHandler = Boolean(elClosestItem.querySelector(this.handlerClass));
        const elHandler = target.closest(this.handlerClass);
        if (hasHandler && !elHandler) return;
        this.elActive = elClosestItem;
        this.elActive.setPointerCapture(pointerId);
    }

    move = ({ pointerId, clientX, clientY }) => {
        if (!this.elActive?.hasPointerCapture(pointerId)) return;
        this.elActive.classList.add("is-sort-active");
        !this.isFirstMove && this.appendGhost({ clientX, clientY });

        // Move ghost element
        this.elGhost.style.translate = `${clientX - this.pointerStart.clientX}px ${clientY - this.pointerStart.clientY}px`;

        const elFromPoint = document.elementFromPoint(clientX, clientY);
        this.elTarget?.classList.remove("is-sort-target");
        this.elTarget = elFromPoint?.closest(".sort-item, .sortable");
        this.elTarget?.classList.add("is-sort-target");
    }

    drop = (ev) => {
        if (!this.elActive?.hasPointerCapture(ev.pointerId)) return;

        this.elActive?.classList.remove("is-sort-active");
        this.elTarget?.classList.remove("is-sort-target");

        const elFromPoint = document.elementFromPoint(ev.clientX, ev.clientY);
        this.elTarget = elFromPoint?.closest(".sort-item, .sortable");
        this.elParentDrop = elFromPoint?.closest(`.sortable`);
        const isSameParent = this.elParentDrop === this.elParentGrab;
        const isDroppedOntoParent = Boolean(this.elTarget && this.elParentDrop && this.elTarget === this.elParentDrop);
        let rangeData = [];
        let targetIndex = 0;
        let activeIndex = 0;
        let isLowerIndex = false;

        const ghostRect = this.elGhost?.getBoundingClientRect();

        const groupDrop = this.elParentDrop?.dataset.sortGroup;
        const isValidGroup = !isSameParent && Boolean(groupDrop && this.groupGrab === groupDrop);
        const isValidDrop =
            this.elTarget &&
            this.elParentDrop &&
            isValidGroup || isSameParent;

        if (isValidDrop) {
            let siblings = [];

            if (isSameParent) {
                siblings = [...this.elParentDrop.children];
                activeIndex = siblings.indexOf(this.elActive);
                targetIndex = siblings.indexOf(this.elTarget);
                const indexMin = isDroppedOntoParent ? activeIndex : Math.min(targetIndex, activeIndex);
                const indexMax = isDroppedOntoParent ? siblings.length - 1 : Math.max(targetIndex, activeIndex);
                siblings = siblings.slice(indexMin, indexMax + 1);
            }
            // Not same parent
            else {
                const siblingsGrab = [...this.elParentGrab.children];
                const siblingsDrop = [...this.elParentDrop.children];
                activeIndex = siblingsGrab.indexOf(this.elActive);
                targetIndex = siblingsDrop.indexOf(this.elTarget);
                siblings = [...siblingsGrab.slice(activeIndex)];
                if (!isDroppedOntoParent) {
                    siblings.push(...siblingsDrop.slice(targetIndex));
                }
            }

            // 1. Remember positions before appending to DOM
            rangeData = siblings.map((el) => {
                const { x, y } = el.getBoundingClientRect();
                return { el, x, y };
            });

            // 2. Append to DOM
            if (isDroppedOntoParent) {
                this.elParentDrop.append(this.elActive);
            } else if (isSameParent) {
                isLowerIndex = targetIndex < activeIndex;
                this.elParentDrop.insertBefore(this.elActive, isLowerIndex ? this.elTarget : this.elTarget.nextSibling);
            } else {
                this.elParentDrop.insertBefore(this.elActive, this.elTarget);
            }
        }

        // Animate other elements
        rangeData.filter(({ el }) => el !== this.elActive).forEach(this.animateItem);
        // Animate active element
        ghostRect && this.animateItem({ el: this.elActive, x: ghostRect.left, y: ghostRect.top });
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
