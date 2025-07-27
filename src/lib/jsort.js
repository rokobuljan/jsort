/**
 * @class JSort
 * @author Roko C. Buljan <https://github.com/rokobuljan>
 * @license MIT
 * @description Small yet powerful drag and drop sortable library with touch support, smooth animations, for a great UX.
 * @see {@link https://github.com/rokobuljan/jsort}
 */
class JSort {
    static version = __APP_VERSION__;
    constructor(el, options) {
        this.elGrabParent = el;
        this.group = ""; // Link-group parents i.e: "group-a"
        this.swap = false; // Swap items mode (Swap elements on drop)
        this.duration = 420; // Ms items animation duration
        this.easing = "cubic-bezier(0.6, 0, 0.6, 1)"; // Items animation easing
        this.scale = 1.1; // Ghost scale
        this.opacity = 0.8; // Ghost element opacity
        this.grabTimeout = 140; // Ms before grab is considered instead of scroll on touch devices (has no effect for mouse Event)
        this.parentDrop = true; // Can drop item onto parent
        this.dragThreshold = 8; // Px before it's considered a scroll
        this.edgeThreshold = 50; // Pixels from edge to start parent auto-scrolling
        this.scrollSpeed = 10 // Scroll pixels per frame while ghost is near parent edge
        this.zIndex = 0x7FFFFFFF; // Maximum 32-bit signed integer
        this.selectorParent = ".jsort";
        this.selectorItems = ".jsort-item";
        this.selectorHandler = ".jsort-handler";
        this.classGhost = "is-jsort-ghost";
        this.classGrabbed = "is-jsort-grabbed";
        this.classTarget = "is-jsort-target";
        this.classAnimated = "is-jsort-animated"; // Added to all animated elements (on drop)
        this.classAnimatedDrop = "is-jsort-animated-drop"; // Added to the animated grabbed element (on drop)
        this.classInvalid = "is-jsort-invalid";
        this.onBeforeGrab = () => { };
        this.onGrab = () => { };
        this.onMove = () => { };
        this.onBeforeDrop = () => { };
        this.onDrop = () => { };
        this.onAnimationEnd = () => { };
        this.init(options);
    }

    /**
     * Parse `data-jsort` attribute
     * @param {Element} el
     * @returns {Object}
     */
    parseDataAttribute(el) {
        return el?.dataset.jsort?.replace(/\s/g, "").replace(/;$/, "").split(/;/).reduce((acc, str) => {
            const [prop, val] = str.split(":");
            acc[prop] = !isNaN(val) ? Number(val) : /^(true|false)$/.test(val) ? JSON.parse(val) : val;
            return acc;
        }, {}) ?? {};
    }

    /**
     * Append ghost element to grab's parent
     * @returns {void}
     */
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
            opacity: this.opacity,
        });
        this.elGhost.classList.add(this.classGhost);
        this.elGhost.animate([
            { scale: this.scale }
        ], {
            duration: 250,
            easing: this.easing,
            fill: "forwards"
        });
        this.elGrabParent.append(this.elGhost);
    }

    /**
     * Remove ghost element
     * @returns {void}
     */
    removeGhost() {
        if (!this.elGhost) return;
        this.elGhost.remove();
        this.elGhost = null;
    }

    /**
     * Animate item to new position
     * @param {Object} data
     * @param {Element} data.el - the Element to animate
     * @param {number} data.x - the new X position
     * @param {number} data.y - the new Y position
     * @returns {Animation}
     */
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
        return anim;
    }

    /**
     * Find closest element (similar to Element.closest() but without selector string)
     * If not found, returns null, meaning el was not a descendant of elTarget, or elTarget itself
     * @param {Element} el
     * @param {Element} elTarget
     * @returns {Element|null}
     */
    closestElement(el, elTarget) {
        while (el && el !== elTarget) el = el.parentElement;
        return el === elTarget ? el : null;
    }

    /**
     * Check if drop is valid by the given coordinates
     * @param {Object} coordinates
     * @param {number} coordinates.clientX
     * @param {number} coordinates.clientY
     * @returns {boolean} true if can be dropped at coordinates
     */
    checkValidity({ clientX, clientY }) {
        const elFromPoint = document.elementFromPoint(clientX, clientY);
        const elTarget = elFromPoint?.closest(`${this.selectorItems}, ${this.selectorParent}`);
        const elDropParent = elFromPoint?.closest(this.selectorParent);
        const isParentDrop = elTarget === elDropParent;
        const isOntoSelf = elTarget && this.closestElement(elTarget, this.elGrabbed) === this.elGrabbed;
        const isSameParent = elDropParent === this.elGrabParent;
        const groupDrop = elDropParent?.dataset.jsortGroup;
        const isValidGroup = !isSameParent && Boolean(groupDrop && this.group === groupDrop);

        if (!this.parentDrop && isParentDrop) return false;

        const isValid =
            !isOntoSelf &&
            elTarget &&
            elDropParent &&
            isValidGroup || isSameParent;

        return isValid;
    }

    /**
     * Create reusable animation engine
     * @param {Function} cb callback function
     * @param {number} fps desired FPS target (60 frames per second by default)
     * @returns {Object} { start, stop, tick } methods
     */
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

    /**
     * Find closest scrollable element
     * @param {Element} el Start element
     * @returns {Element} Scrollable element
     */
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

    /**
     * Scroll parent element given a this.scrollDirection
     * @returns {void}
     */
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

    /**
     * Start edge scroll engine
     * @param {string} direction
     */
    startEdgeScroll(direction) {
        if (this.scrollDirection !== direction) {
            this.scrollDirection = direction;
            if (!this.scrollAnim) {
                this.scrollAnim = this.engine(this.scrollStep.bind(this));
                this.scrollAnim.start();
            }
        }
    }

    /**
     * Stop edge scroll engine
     */
    stopEdgeScroll() {
        this.scrollDirection = null;
        if (this.scrollAnim) {
            this.scrollAnim.stop();
            this.scrollAnim = null;
        }
    }

    /**
     * Handle parent scroll depending on the position od the dragged item
     * in regards to the closest scrollable parent's edges
     * @param {PointerEvent} ev
     */
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

    /**
     * Grab an item
     * @param {PointerEvent} ev
     */
    grab = (ev) => {
        if (this.elGrabbed) return;

        const elClosestItem = ev.target.closest(`${this.selectorItems}`);

        if (!elClosestItem) return;
        if (elClosestItem.parentElement !== this.elGrabParent) return; // Does not belongs to this sortable

        const foundHandler = elClosestItem.querySelector(this.selectorHandler);
        const isHandlerVisible = foundHandler?.checkVisibility();
        const hasHandler = Boolean(foundHandler);
        const elHandler = ev.target.closest(this.selectorHandler);

        if (hasHandler && isHandlerVisible && !elHandler) return;

        this.pointerStart.clientX = ev.clientX;
        this.pointerStart.clientY = ev.clientY;
        this.elGrabbed = elClosestItem;
        this.elGrabbed.setPointerCapture(ev.pointerId);
        this.elGrabParent.style.userSelect = "none";
        this.indexGrab = [...this.elGrabParent.children].indexOf(this.elGrabbed);

        const isUserValidated = this.onBeforeGrab?.call(this, ev) ?? true;

        if (isUserValidated) {
            this.onGrab?.call(this, ev);
            if (ev.pointerType === "mouse") {
                this.preventScroll = true;
            }
        } else {
            this.reset();
        }
    }

    /**
     * Move an item
     * @param {PointerEvent} ev
     */
    move = (ev) => {
        const { pointerId, clientX, clientY } = ev;

        if (!this.preventScroll || !this.elGrabbed?.hasPointerCapture(pointerId)) return;

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

    /**
     * Called when an item is dropped on pointerUp
     * @param {PointerEvent} ev
     */
    drop = (ev) => {
        this.stopEdgeScroll();
        this.preventScroll = false;
        const { pointerId, clientX, clientY } = ev;
        if (!this.elGrabbed || !this.elGrabbed?.hasPointerCapture(pointerId)) return;
        this.elGrabParent.style.removeProperty("user-select");
        this.elGrabbed.style.removeProperty("cursor");
        this.elGrabbed.classList.remove(this.classGrabbed);
        this.elTarget?.classList.remove(this.classTarget);
        const elFromPoint = document.elementFromPoint(clientX, clientY);
        this.elDrop = elFromPoint?.closest(`${this.selectorItems}, ${this.selectorParent}`);
        this.elDropParent = elFromPoint?.closest(this.selectorParent);

        // 1. Retract ghost scaling and store its position
        // (The order of execution of the two following lines is important!)
        this.elGhost?.animate([{ scale: 1.0 }], { duration: 0, fill: "forwards" });
        const ghostRect = this.elGhost?.getBoundingClientRect();

        if (this.checkValidity({ clientX, clientY })) {
            const isSameParent = this.elDropParent === this.elGrabParent;
            const isDroppedOntoParent = Boolean(this.elDrop && this.elDropParent && this.elDrop === this.elDropParent);

            const siblingsGrab = [...this.elGrabParent.children].filter(el => el !== this.elGhost);
            this.indexGrab = siblingsGrab.indexOf(this.elGrabbed);

            if (this.swap) {
                this.affectedItems = [this.elDrop];
            }
            else if (isSameParent) {
                this.indexDrop = isDroppedOntoParent ? Math.max(0, siblingsGrab.length - 1) : siblingsGrab.indexOf(this.elDrop);
                const indexMin = isDroppedOntoParent ? this.indexGrab : Math.min(this.indexDrop, this.indexGrab);
                const indexMax = isDroppedOntoParent ? siblingsGrab.length - 1 : Math.max(this.indexDrop, this.indexGrab);
                this.affectedItems = siblingsGrab.slice(indexMin, indexMax + 1);
            } else {
                const siblingsDrop = [...this.elDropParent.children];
                this.indexDrop = isDroppedOntoParent ? Math.max(0, siblingsDrop.length) : siblingsDrop.indexOf(this.elDrop);
                this.affectedItems = [...siblingsGrab.slice(this.indexGrab), ...siblingsDrop.slice(this.indexDrop)];
            }

            // 2. Store initial positions of all affected elements (before DOM manipulation)
            const affectedItemsData = this.affectedItems.map((el) => {
                const { x, y } = el.getBoundingClientRect();
                return { el, x, y };
            });

            const isUserValidated = this.onBeforeDrop?.call(this, ev) ?? true;
            if (isUserValidated) {
                // 3. Insert into DOM
                if (this.swap) {
                    if (!isDroppedOntoParent) {
                        const elNext = this.elGrabbed.nextSibling;
                        this.elDropParent.insertBefore(this.elGrabbed, this.elDrop.nextSibling);
                        this.elGrabParent.insertBefore(this.elDrop, elNext);
                    }
                } else {
                    if (isDroppedOntoParent) {
                        this.elDropParent.append(this.elGrabbed);
                    } else if (isSameParent) {
                        this.elDropParent.insertBefore(this.elGrabbed, this.indexDrop < this.indexGrab ? this.elDrop : this.elDrop.nextSibling);
                    } else {
                        this.elDropParent.insertBefore(this.elGrabbed, this.elDrop);
                    }
                }

                // Notify
                this.onDrop?.call(this, ev);
            }

            // 4. Animate other elements
            affectedItemsData.forEach((data) => {
                if (data.el === this.elGrabbed) return; // We'll animate the grabbed item later
                this.animateItem(data);
            });
        }

        // 5. Always animate the grabbed item
        if (ghostRect) {
            const elGrabbed = this.elGrabbed;
            elGrabbed.classList.add(`${this.classAnimatedDrop}`);
            const anim = this.animateItem({ el: elGrabbed, x: ghostRect.left, y: ghostRect.top });
            anim.addEventListener("finish", () => {
                elGrabbed.classList.remove(`${this.classAnimatedDrop}`);
                this.onAnimationEnd?.call(this, ev);
            });
        }

        // Cleanup
        this.removeGhost();
        this.reset();
    }

    /**
     * Handle touch start event - used for scroll-intent
     * @param {TouchEvent} ev
     */
    handleTouchStart = (ev) => {
        if (!this.elGrabbed || this.initialTouch) return;

        const { clientX, clientY } = ev.touches[0];
        this.initialTouch = {
            clientX,
            clientY
        };

        clearTimeout(this.moveTimeout);
        this.moveTimeout = setTimeout(() => {
            // Only activate drag if we haven't moved beyond threshold
            if (!this.hasMoved) {
                this.preventScroll = true;
                this.elGrabbed?.classList.add(this.classGrabbed);
            }
        }, this.grabTimeout);
    }

    /**
     * Handle touch move event - used for scroll-intent
     * @param {TouchEvent} ev
     */
    handleTouchMove = (ev) => {
        if (!this.elGrabbed || !this.initialTouch) return;
        // Handle drag
        if (this.preventScroll) {
            ev.preventDefault();
            return
        }
        // Handle scroll
        const { clientX, clientY } = ev.touches[0];
        const deltaX = clientX - this.initialTouch.clientX;
        const deltaY = clientY - this.initialTouch.clientY;
        const touchMoveDistance = Math.hypot(deltaX, deltaY);
        const isSignificantMove = touchMoveDistance > this.dragThreshold && !this.hasMoved
        if (!this.hasMoved && isSignificantMove) {
            this.hasMoved = true;
            clearTimeout(this.moveTimeout);
            this.moveTimeout = null;
        }
    }

    /**
     * Reset state
     */
    reset() {
        // Cleanup internal-use properties
        this.elGhost = null;
        this.elGrabbed = null;
        this.elTarget = null;
        this.elDrop = null; // Same as elTarget but after drop
        this.elDropParent = null;
        this.indexGrab = -1;
        this.indexDrop = -1;
        this.affectedItems = [];
        this.pointerStart = {};
        this.isFirstMove = false;
        this.scrollParent = null;
        this.scrollDirection = null;
        this.scrollAnim = null;
        this.edgePressure = 0;
        this.moveTimeout = null;
        this.preventScroll = false;
        this.hasMoved = false;
        this.initialTouch = null;
    }

    /**
     * Initialize: pass user options or data attr to constructor, and attach events
     * @param {Object} options
     */
    init(options) {
        this.destroy();
        const data = this.parseDataAttribute(this.elGrabParent);
        Object.assign(this, options, data);
        this.reset();
        this.elGrabParent.addEventListener("touchstart", this.handleTouchStart);
        this.elGrabParent.addEventListener("touchmove", this.handleTouchMove, { cancelable: true });
        this.elGrabParent.addEventListener("pointerdown", this.grab);
        this.elGrabParent.addEventListener("pointermove", this.move);
        this.elGrabParent.addEventListener("pointerup", this.drop);
        this.elGrabParent.addEventListener("pointercancel", this.drop);
        this.elGrabParent.dataset.jsortGroup = this.group;
    }

    /**
     * Destroy: remove event listeners
     */
    destroy() {
        this.removeGhost();
        this.elGrabParent.removeEventListener("touchstart", this.handleTouchStart);
        this.elGrabParent.removeEventListener("touchmove", this.handleTouchMove, { cancelable: true });
        this.elGrabParent.removeEventListener("pointerdown", this.grab);
        this.elGrabParent.removeEventListener("pointermove", this.move);
        this.elGrabParent.removeEventListener("pointerup", this.drop);
        this.elGrabParent.removeEventListener("pointercancel", this.drop);
    }
}

export default JSort;
