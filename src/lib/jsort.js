// @ts-check

import { version } from '../../package.json';

/**
 * @class JSort
 * @author Roko C. Buljan <https://github.com/rokobuljan>
 * @license MIT
 * @description Small yet powerful drag and drop sortable library with touch support, smooth animations, for a great UX.
 * @see {@link https://github.com/rokobuljan/jsort}
 */
class JSort {

    /** @type {string} */
    static version = version;

    /** @type {HTMLElement | null} */
    elGhost;

    /** @type {HTMLElement | null} */
    elGrabbed;

    /** @type {HTMLElement | null} */
    elTarget;

    /** @type {HTMLElement | null} */
    elDrop;

    /** @type {HTMLElement | null} */
    elDropParent;

    /** @type {number} */
    indexGrab = -1;

    /** @type {number} */
    indexDrop = -1;

    /** @type {HTMLElement[]} */
    affectedElements = [];

    /** @type {PointerEventInit | Object} */
    pointerStart = {};

    /** @type {HTMLElement | null} */
    scrollParent = null;

    /** @type {string | null} */
    scrollDirection = null;

    /** @type {null | { start: Function, stop: Function, tick: Function }} */
    scrollAnim = null;

    /** @type {number} */
    edgePressure = 0;

    /** @type {number | NodeJS.Timeout | undefined} */
    moveTimeout;

    /** @type {boolean} */
    isScrollPrevented = false;

    /** @type {boolean} */
    hasPointerMoved = false;

    /** @type {boolean} */
    hasMoved = false;

    /** @type {null | { clientX: number, clientY: number }} */
    initialTouch = null;

    /**
     * @constructor
     * @param {HTMLElement} el
     * @param {Object} [options]
     * @param {string} [options.group] Link-group parents i.e: "group-a"
     * @param {boolean} [options.swap] Swap items mode (Swap elements on drop)
     * @param {number} [options.duration] Ms items animation duration
     * @param {string} [options.easing] Items animation easing
     * @param {number} [options.scale] Ghost element scale
     * @param {number} [options.opacity] Ghost element opacity
     * @param {number} [options.grabTimeout] Ms before grab is considered instead of scroll on touch devices (has no effect for mouse Event)
     * @param {boolean} [options.parentDrop] Can drop item onto parent
     * @param {number} [options.dragThreshold] Px before it's considered a pointer drag (Allows to click inner links, buttons, inputs, etc)
     * @param {number} [options.scrollThreshold] Px before it's considered a scroll
     * @param {number} [options.edgeThreshold] Pixels from edge to start parent auto-scrolling
     * @param {number} [options.scrollSpeed] Scroll pixels per frame while ghost is near parent edge
     * @param {number} [options.zIndex] Maximum 32-bit signed integer
     * @param {string} [options.selectorParent] Selector for parent elements
     * @param {string} [options.selectorItems] Selector for item elements
     * @param {string} [options.selectorHandler] Selector for handler elements
     * @param {string} [options.classGhost] Class name for ghost element
     * @param {string} [options.classActive] Class name for item on mousedown, pointerdown
     * @param {string} [options.classTouch] Class name for item on touchstart event only
     * @param {string} [options.classGrabbed] Class name for grabbed item
     * @param {string} [options.classTarget] Class name for hovered element (either item or Sort parent)
     * @param {string} [options.classAnimated] Class name for all animated elements (on drop)
     * @param {string} [options.classAnimatedDrop] Class name for the animated grabbed element (on drop)
     * @param {string} [options.classInvalid] Class name for invalid item
     * @param {function} [options.onBeforeGrab] Callback function called before grab (return false to cancel grab)
     * @param {function} [options.onGrab] Callback function called after grab
     * @param {function} [options.onMove] Callback function called on move
     * @param {function} [options.onBeforeDrop] Callback function called before drop (return false to cancel drop)
     * @param {function} [options.onDrop] Callback function called after drop
     * @param {function} [options.onAnimationEnd] Callback function called when animation ends
     */
    constructor(el, options = {}) {
        this.elGrabParent = el;
        this.group = "";
        this.swap = false;
        this.duration = 420;
        this.easing = "cubic-bezier(0.6, 0, 0.6, 1)";
        this.scale = 1.1;
        this.opacity = 0.8;
        this.grabTimeout = 140;
        this.parentDrop = true;
        this.dragThreshold = 2;
        this.scrollThreshold = 8;
        this.edgeThreshold = 50;
        this.scrollSpeed = 10;
        this.zIndex = 0x7FFFFFFF;
        this.selectorParent = ".jsort";
        this.selectorItems = ".jsort-item";
        this.selectorHandler = ".jsort-handler";
        this.classGhost = "is-jsort-ghost";
        this.classActive = "is-jsort-active";
        this.classTouch = "is-jsort-touch";
        this.classGrabbed = "is-jsort-grabbed";
        this.classTarget = "is-jsort-target";
        this.classAnimated = "is-jsort-animated";
        this.classAnimatedDrop = "is-jsort-animated-drop";
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
     * get all child elements of a sortable parent (ignore elGhost, if present)
     * @param {HTMLElement} elParent
     * @returns {HTMLElement[]}
     */
    getChildren(elParent) {
        const children = /** @type {HTMLElement[]} */ ([...elParent.children].filter(el => el !== this.elGhost));
        return children;
    }

    /**
     * Parse `data-jsort` attribute
     * @param {HTMLElement} el
     * @returns {Object}
     */
    parseDataAttribute(el) {
        return el?.dataset.jsort?.replace(/\s/g, "").replace(/;$/, "").split(/;/).reduce((acc, str) => {
            const [prop, val] = str.split(":");
            acc[prop] = !isNaN(Number(val)) ? Number(val) : /^(true|false)$/.test(val) ? JSON.parse(val) : val;
            return acc;
        }, {}) ?? {};
    }

    /**
     * Check if touch or pointer move distance is significant
     * @param {Object} startXY {clientX, clientY} start
     * @param {Object} currentXY {clientX, clientY} current
     * @param {number} distance Distance in px
     * @returns {boolean}
     */
    isSignificantMove(startXY, currentXY, distance) {
        const { clientX, clientY } = currentXY;
        const deltaX = clientX - startXY.clientX;
        const deltaY = clientY - startXY.clientY;
        const touchMoveDistance = Math.hypot(deltaX, deltaY);
        const isSignificant = touchMoveDistance >= distance;
        return isSignificant;
    }

    /**
     * Append ghost element to grab's parent
     * @returns {void}
     */
    appendGhost() {
        if (!this.elGrabbed) return;
        const { x, y, width, height } = this.elGrabbed.getBoundingClientRect();
        this.elGhost = /** @type {HTMLElement} */ (this.elGrabbed.cloneNode(true));
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
        this.elGhost.classList.remove(this.classActive, this.classTarget);
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
     * @returns {Animation|undefined}
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
     * @param {Element|null} el
     * @param {Element|null} elTarget
     * @returns {Element|null}
     */
    closestElement(el, elTarget) {
        while (el && el !== elTarget) el = el.parentElement;
        return el === elTarget ? el : null;
    }

    /**
     * Check if drop is valid by the given coordinates
     * @param {Object} data
     * @param {number} [data.clientX]
     * @param {number} [data.clientY]
     * @param {HTMLElement} [data.el]
     * @returns {boolean} true if can be dropped at coordinates
     */
    checkValidity({ clientX = 0, clientY = 0, el }) {
        const elFromPoint = el ?? document.elementFromPoint(clientX, clientY);
        const elTarget = elFromPoint?.closest(`${this.selectorItems}, ${this.selectorParent}`);
        const elDropParent = /** @type {HTMLElement} */ (elFromPoint?.closest(this.selectorParent));
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
     * @param {Element|null|undefined} el Start element
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
        if (!this.scrollDirection || !this.scrollParent) return;
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
                this.scrollAnim?.start();
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
            this.scrollParent = /** @type {HTMLElement} */ (this.findScrollParent(this.elGrabbed));
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
     * Insert elItem into this JSort parent
     * @param {HTMLElement} elGrabbed
     * @param {HTMLElement} elTarget
     * @returns {boolean} True if insertion was successful
     */
    insert(elGrabbed, elTarget) {
        // Fallback to instance parent
        const elGrabParent = elGrabbed.closest(this.selectorParent);
        const grabChildren = elGrabParent ? [...elGrabParent.children] : [];
        this.indexGrab = grabChildren.indexOf(elGrabbed);
        const grabSiblings = grabChildren.filter((el) => el !== elGrabbed && !el.matches(`.${this.classGhost}`));
        this.elDrop = /** @type {HTMLElement} */ (elTarget?.closest(`${this.selectorItems}, ${this.selectorParent}`));
        const isDroppedOntoParent = this.elDrop?.matches(this.selectorParent);
        this.elDropParent = /** @type {HTMLElement} */ (this.elDrop?.closest(this.selectorParent));
        const dropChildren = this.elDropParent ? [...this.elDropParent.children] : [];
        const isSameParent = elGrabParent === this.elDropParent;

        this.indexDrop = isDroppedOntoParent ?
            Math.max(0, isSameParent ? grabSiblings.length : dropChildren.length) :
            dropChildren.indexOf(this.elDrop);

        // 1. Retract ghost scaling and store its position
        // (The order of execution of the two following lines is important!)
        this.elGhost?.animate([{ scale: 1.0 }], { duration: 0, fill: "forwards" });
        const ghostRect = this.elGhost?.getBoundingClientRect();

        this.affectedElements = [];

        if (this.swap) {
            this.affectedElements = this.elDrop ? [this.elDrop] : [];
        }
        else if (isSameParent) {
            const indexMin = isDroppedOntoParent ? this.indexGrab : Math.min(this.indexDrop, this.indexGrab);
            const indexMax = isDroppedOntoParent ? grabSiblings.length - 1 : Math.max(this.indexDrop, this.indexGrab);
            this.affectedElements = /** @type {HTMLElement[]} */ (grabSiblings.slice(indexMin, indexMax + 1));
        }
        else {
            this.affectedElements = /** @type {HTMLElement[]} */ ([...grabSiblings.slice(this.indexGrab), ...dropChildren.slice(this.indexDrop)]);
        }

        // 2. Store initial positions of all affected elements (before DOM manipulation)
        const affectedElementsData = this.affectedElements.map((el) => {
            const { x, y } = el.getBoundingClientRect();
            return { el, x, y };
        });

        const isValidDrop = this.checkValidity({ el: elTarget });
        const isValidByUser = this.onBeforeDrop?.call(this, this._currentEvent) ?? true;
        const isValid = Boolean(this.elDrop) && isValidDrop && isValidByUser;

        if (isValid) {
            // 3. Insert into DOM
            if (this.swap && !isDroppedOntoParent) {
                const elNext = elGrabbed.nextSibling;
                this.elDropParent?.insertBefore(elGrabbed, this.elDrop.nextSibling);
                elGrabParent?.insertBefore(this.elDrop, elNext);
            } else {
                if (isDroppedOntoParent) {
                    this.elDropParent?.append(elGrabbed);
                } else if (isSameParent) {
                    this.elDropParent?.insertBefore(elGrabbed, this.indexDrop < this.indexGrab ? this.elDrop : this.elDrop.nextSibling);
                } else {
                    this.elDropParent?.insertBefore(elGrabbed, this.elDrop);
                }
            }

            // 4. Animate other elements
            affectedElementsData.forEach((data) => {
                if (data.el === elGrabbed) return; // We'll animate the grabbed item later
                this.animateItem(data);
            });
        }

        // 5. Always animate the grabbed item
        if (ghostRect) {
            // const elGrabbed = this.elGrabbed;
            elGrabbed.classList.add(`${this.classAnimatedDrop}`);
            const anim = this.animateItem({ el: elGrabbed, x: ghostRect.left, y: ghostRect.top });
            if (anim) {
                anim.addEventListener("finish", () => {
                    elGrabbed.classList.remove(`${this.classAnimatedDrop}`);
                    this.onAnimationEnd?.call(this);
                });
            } else {
                elGrabbed.classList.remove(`${this.classAnimatedDrop}`);
            }
        }

        this.removeGhost();
        return isValid;
    }

    /**
     * Grab an item
     * @param {PointerEvent} ev
     */
    grab = (ev) => {
        if (this.elGrabbed) return;

        const evTarget = /** @type {Element} */ (ev.target);
        const elClosestItem = /** @type {HTMLElement} */ (evTarget.closest(`${this.selectorItems}`));

        if (
            // Not an item
            !elClosestItem ||
            // Does not belongs to this sortable
            elClosestItem.parentElement !== this.elGrabParent
        ) return;

        const foundHandler = /** @type {Element} */ (elClosestItem.querySelector(this.selectorHandler));
        const isHandlerVisible = foundHandler?.checkVisibility();
        const hasHandler = Boolean(foundHandler);
        const elHandler = evTarget?.closest(this.selectorHandler);

        if (hasHandler && isHandlerVisible && !elHandler) return;

        this.pointerStart.clientX = ev.clientX;
        this.pointerStart.clientY = ev.clientY;
        this.elGrabbed = elClosestItem;
        this.indexGrab = [...this.elGrabParent.children].indexOf(this.elGrabbed);

        const isUserValidated = this.onBeforeGrab?.call(this, ev) ?? true;

        if (isUserValidated) {
            // this.elGrabbed.setPointerCapture(ev.pointerId);
            this.elGrabbed.classList.add(this.classActive);
            this.elGrabbed.style.cursor = "move";
            this.elGrabbed.style.userSelect = "none";
            if (ev.pointerType === "mouse") {
                this.isScrollPrevented = true;
            }
            this.onGrab?.call(this, ev);
        } else {
            this.reset();
        }
    }

    /**
     * Move an item
     * @param {PointerEvent} ev
     */
    move = (ev) => {
        if (
            !this.elGrabbed ||
            !this.isScrollPrevented ||
            this.hasPointerMoved && !this.elGrabbed?.hasPointerCapture(ev.pointerId)
        ) return;

        const isSignificantMove = this.isSignificantMove(this.pointerStart, ev, this.dragThreshold);

        if (!this.hasPointerMoved && isSignificantMove) {
            this.hasPointerMoved = true;
            this.elGrabbed.setPointerCapture(ev.pointerId);
            // INSERT GHOST!
            this.appendGhost();
            this.elGrabbed.classList.add(this.classGrabbed);
        }

        const { clientX, clientY } = ev;
        const isValid = this.checkValidity({ clientX, clientY });
        if (this.elGhost) {
            this.elGhost.style.translate = `${clientX - this.pointerStart.clientX}px ${clientY - this.pointerStart.clientY}px`;
            this.elGhost.classList.toggle(this.classInvalid, !isValid);
        }
        this.elGrabbed.style.cursor = isValid ? "grab" : "not-allowed";
        const elFromPoint = document.elementFromPoint(clientX, clientY);
        const elTarget = /** @type {HTMLElement} */ (elFromPoint?.closest(`${this.selectorItems}, ${this.selectorParent}`));

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
        this.isScrollPrevented = false;

        if (!this.elGrabbed) return;

        this.elGrabbed.style.removeProperty("user-select");
        this.elGrabbed.style.removeProperty("cursor");
        this.elGrabbed.classList.remove(this.classActive, this.classGrabbed, this.classTouch);
        this.elTarget?.classList.remove(this.classTarget);

        if (this.elGrabbed?.hasPointerCapture(ev.pointerId)) {
            const { clientX, clientY } = ev;
            const elFromPoint = /** @type {HTMLElement} */ (document.elementFromPoint(clientX, clientY));
            // INSERT
            this._currentEvent = ev;
            const isInserted = this.insert(this.elGrabbed, elFromPoint);
            if (isInserted) this.onDrop?.call(this, ev);
        }

        this.reset();
        this.removeGhost();
    }

    /**
     * Handle touch start event - used for scroll-intent
     * @param {TouchEvent} ev
     */
    handleTouchStart = (ev) => {
        if (!this.elGrabbed || this.initialTouch) return;
        const { clientX, clientY } = ev.touches[0];
        this.initialTouch = { clientX, clientY };
        this.moveTimeout && clearTimeout(this.moveTimeout);
        this.moveTimeout = setTimeout(() => {
            // Only activate drag if we haven't moved beyond threshold
            if (!this.hasMoved) {
                this.elGrabbed?.classList.add(`${this.classTouch}`);
                this.isScrollPrevented = true;
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
        if (this.isScrollPrevented) {
            ev.preventDefault();
            return
        }

        // Handle scroll
        const isSignificantMove = this.isSignificantMove(this.initialTouch, ev.touches[0], this.scrollThreshold);
        if (!this.hasMoved && isSignificantMove) {
            this.hasMoved = true;
            clearTimeout(this.moveTimeout);
            this.moveTimeout = undefined;
        }
    }

    /**
     * Just like Array.sort() but animated
     * @param {(a: HTMLElement, b: HTMLElement) => number} fn
     * @returns {HTMLElement[]} Sorted items
     */
    sort(fn) {
        const items = this.getChildren(this.elGrabParent);
        const affectedElementsData = items.map((el) => {
            const { x, y } = el.getBoundingClientRect();
            return { el, x, y };
        });
        const itemsSorted = [...items].sort(fn);
        this.elGrabParent.append(...itemsSorted);
        affectedElementsData.forEach((data) => this.animateItem(data));
        return itemsSorted;
    }

    /**
     * Reset, cleanup internal-use properties
     * @returns {void}
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
        this.affectedElements = [];
        this.pointerStart = {};
        this.hasPointerMoved = false;
        this.scrollParent = null;
        this.scrollDirection = null;
        this.scrollAnim = null;
        this.edgePressure = 0;
        this.moveTimeout = undefined;
        this.isScrollPrevented = false;
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
        this.elGrabParent.addEventListener("touchmove", this.handleTouchMove);
        this.elGrabParent.addEventListener("pointerdown", this.grab);
        this.elGrabParent.addEventListener("pointermove", this.move);
        this.elGrabParent.addEventListener("pointerup", this.drop);
        this.elGrabParent.addEventListener("pointercancel", this.drop);
        if (this.group !== "") this.elGrabParent.dataset.jsortGroup = this.group;
    }

    /**
     * Destroy: remove event listeners
     */
    destroy() {
        this.removeGhost();
        this.elGrabParent.removeEventListener("touchstart", this.handleTouchStart);
        this.elGrabParent.removeEventListener("touchmove", this.handleTouchMove);
        this.elGrabParent.removeEventListener("pointerdown", this.grab);
        this.elGrabParent.removeEventListener("pointermove", this.move);
        this.elGrabParent.removeEventListener("pointerup", this.drop);
        this.elGrabParent.removeEventListener("pointercancel", this.drop);
        if (this.group !== "") delete this.elGrabParent.dataset.jsortGroup;
    }
}

export default JSort;
