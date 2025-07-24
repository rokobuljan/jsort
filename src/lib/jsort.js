class JSort {
    constructor(el, options) {
        this.elParentGrab = el;
        this.selectorParent = ".jsort";
        this.selectorItems = ".jsort-item";
        this.selectorHandler = ".jsort-handler";
        this.classAnimated = "is-jsort-animated";
        this.classGrabbed = "is-jsort-grabbed";
        this.classTarget = "is-jsort-target";
        this.classInvalid = "is-jsort-invalid";
        this.duration = 420;
        this.swap = false; 
        this.parentDrop = true;
        this.easing = "cubic-bezier(0.6, 0, 0.6, 1)";
        this.scale = "1.1";
        this.zIndex = 0x7FFFFFFF; // Maximum 32-bit signed integer
        this.scrollSpeed = 10 // pixels per frame
        this.edgeThreshold = 50; // pixels from edge
        this.group = null;
        this.init(options);
    }

    parseDataAttribute(el) {
        return el?.dataset.jsort?.replace(/\s/g, "").replace(/;$/, "").split(/;/).reduce((acc, str) => {
            const [prop, val] = str.split(":");
            acc[prop] = !isNaN(val) ? Number(val) : /^(true|false)$/.test(val) ? JSON.parse(val) : val;
            return acc;
        }, {}) ?? {};
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
        el.classList.add(this.classAnimated);
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
            el.classList.remove(this.classAnimated);
            anim.cancel(); // Fixes nested sortable
        });
    }

    closestElement(el, elTarget) {
        while (el && el !== elTarget) el = el.parentElement;
        return el === elTarget ? el : null;
    }

    checkValidity({ clientX, clientY }) {
        const elFromPoint = document.elementFromPoint(clientX, clientY);
        const elTarget = elFromPoint?.closest(`${this.selectorItems}, ${this.selectorParent}`);
        const elParentDrop = elFromPoint?.closest(this.selectorParent);
        const isParentDrop = elTarget === elParentDrop;
        const isOntoSelf = elTarget && this.closestElement(elTarget, this.elGrabbed) === this.elGrabbed;
        const isSameParent = elParentDrop === this.elParentGrab;
        const groupDrop = elParentDrop?.dataset.jsortGroup;
        const isValidGroup = !isSameParent && Boolean(groupDrop && this.group === groupDrop);

        if (!this.parentDrop && isParentDrop) return false;

        const isValid =
            !isOntoSelf &&
            elTarget &&
            elParentDrop &&
            isValidGroup || isSameParent;

        return isValid;
    }

    engine(cb, fps = 60) {
        const msPerFrame = 1000 / fps;
        let msPrev = 0;
        let id = null;
        const tick = () => {
            id = requestAnimationFrame(tick);
            const msNow = window.performance.now();
            const msPassed = msNow - msPrev;
            if (msPassed < msPerFrame) return;
            const excessTime = msPassed % msPerFrame;
            msPrev = msNow - excessTime;
            cb();
        };
        const start = () => {
            stop();
            msPrev = performance.now();
            id = requestAnimationFrame(tick);
        };
        const stop = () => {
            cancelAnimationFrame(id);
            id = null;
            msPrev = 0;
        };
        return { start, stop, tick };
    }

    findScrollParent(el) {
        while (el && el !== document.documentElement) {
            const style = getComputedStyle(el);
            if (el.scrollHeight > el.clientHeight &&
                /^(auto|scroll)$/.test(style.overflowY)) {
                return el;
            }
            el = el.parentElement;
        }
        return document.documentElement;
    }

    scrollStep() {
        if (!this.scrollDirection) return;
        const scrollSpeed = this.scrollSpeed * (this.edgePressure / Math.max(this.edgeThreshold, 1));
        if (this.scrollDirection === "up") {
            this.scrollParent.scrollTop -= scrollSpeed;
        } else if (this.scrollDirection === "down") {
            this.scrollParent.scrollTop += scrollSpeed;
        } else if (this.scrollDirection === "left") {
            this.scrollParent.scrollLeft -= scrollSpeed;
        } else if (this.scrollDirection === "right") {
            this.scrollParent.scrollLeft += scrollSpeed;
        }
    }

    startEdgeScroll(direction) {
        if (this.scrollDirection !== direction) {
            this.scrollDirection = direction;
            if (!this.scrollAnim) {
                this.scrollAnim = this.engine(this.scrollStep.bind(this));
                this.scrollAnim.start();
            }
        }
    }

    stopEdgeScroll() {
        this.scrollDirection = null;
        if (this.scrollAnim) {
            this.scrollAnim.stop();
            this.scrollAnim = null;
        }
    }

    handleScrollParent(ev) {
        if (!this.scrollParent) {
            this.scrollParent = this.findScrollParent(this.elGrabbed);
        }

        const rect = this.scrollParent.getBoundingClientRect();
        const doc = document.documentElement;
        const isDOC = this.scrollParent === doc;
        const topEdge = isDOC ? 0 : rect.top;
        const bottomEdge = isDOC ? window.innerHeight : rect.bottom;
        const leftEdge = isDOC ? 0 : rect.left;
        const rightEdge = isDOC ? window.innerWidth : rect.left;

        // Check edges with threshold
        if (ev.clientY < topEdge + this.edgeThreshold) {
            this.edgePressure = Math.min(this.edgeThreshold, this.edgeThreshold - (ev.clientY - topEdge));
            this.startEdgeScroll("up");
        } else if (ev.clientY > bottomEdge - this.edgeThreshold) {
            this.edgePressure = Math.min(this.edgeThreshold, this.edgeThreshold - (bottomEdge - ev.clientY));
            this.startEdgeScroll("down");
        } else if (ev.clientX < leftEdge + this.edgeThreshold) {
            this.edgePressure = Math.min(this.edgeThreshold, this.edgeThreshold - (ev.clientX - leftEdge));
            this.startEdgeScroll("left");
        } else if (ev.clientX > rightEdge - this.edgeThreshold) {
            this.edgePressure = Math.min(this.edgeThreshold, this.edgeThreshold - (rightEdge - ev.clientX));
            this.startEdgeScroll("right");
        } else {
            this.stopEdgeScroll();
        }
    }

    grab = (ev) => {
        if (this.elGrabbed) return;
        const elClosestItem = ev.target.closest(`${this.selectorItems}`);

        if (!elClosestItem) return;
        if (elClosestItem.parentElement !== this.elParentGrab) return; // Does not belongs to this sortable

        const foundHandler = elClosestItem.querySelector(this.selectorHandler);
        const isHandlerVisible = foundHandler?.checkVisibility();
        const hasHandler = Boolean(foundHandler);
        const elHandler = ev.target.closest(this.selectorHandler);
        if (hasHandler && isHandlerVisible && !elHandler) return;

        this.pointerStart.clientX = ev.clientX
        this.pointerStart.clientY = ev.clientY;
        this.elGrabbed = elClosestItem;
        this.elGrabbed.setPointerCapture(ev.pointerId);
        this.elParentGrab.style.userSelect = "none";
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
            this.elGrabbed.classList.add(this.classGrabbed);
        }

        const isValid = this.checkValidity({ clientX, clientY });
        this.elGhost.style.translate = `${clientX - this.pointerStart.clientX}px ${clientY - this.pointerStart.clientY}px`;
        this.elGhost.classList.toggle(this.classInvalid, !isValid);
        this.elGrabbed.style.cursor = isValid ? "grab" : "not-allowed";
        const elFromPoint = document.elementFromPoint(clientX, clientY);
        const elTarget = elFromPoint?.closest(`${this.selectorItems}, ${this.selectorParent}`);

        if (elTarget !== this.elTarget) {
            this.elTarget?.classList.remove(this.classTarget);
            if (isValid) {
                this.elTarget = elTarget;
                this.elTarget?.classList.add(this.classTarget);
            }
        }

        this.handleScrollParent(ev);

        // Notify
        this.onMove?.call(this, ev);
    }

    drop = (ev) => {
        this.stopEdgeScroll();
        const { pointerId, clientX, clientY } = ev;
        if (!this.elGrabbed?.hasPointerCapture(pointerId)) return;
        this.elParentGrab.style.removeProperty("user-select");
        this.elGrabbed.style.removeProperty("cursor");
        this.elGrabbed?.classList.remove(this.classGrabbed);
        this.elTarget?.classList.remove(this.classTarget);
        const elFromPoint = document.elementFromPoint(clientX, clientY);
        this.elTarget = elFromPoint?.closest(`${this.selectorItems}, ${this.selectorParent}`);
        this.elParentDrop = elFromPoint?.closest(this.selectorParent);
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
        if (!this.elGrabbed) return;
        ev.preventDefault();
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
        this.scrollParent = null;
        this.scrollDirection = null;
        this.scrollAnim = null;
        this.edgePressure = 0;

        this.onGrab = () => { };
        this.onMove = () => { };
        this.onDrop = () => { };
    }

    init(options) {
        this.destroy();
        const data = this.parseDataAttribute(this.elParentGrab);        
        Object.assign(this, options, data);
        this.reset();
        this.elParentGrab.addEventListener("touchstart", this.handleTouchAction);
        this.elParentGrab.addEventListener("pointerdown", this.grab);
        this.elParentGrab.addEventListener("pointermove", this.move);
        this.elParentGrab.addEventListener("pointerup", this.drop);
        this.elParentGrab.addEventListener("pointercancel", this.drop);
        this.elParentGrab.dataset.jsortGroup = this.group;
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
