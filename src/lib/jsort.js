/**
 * Small yet powerful drag and drop sortable library with touch support, smooth animations, for a great UX.
 * @class JSort
 * @author Roko C. Buljan <https://github.com/rokobuljan>
 * @license MIT
 * @see {@link https://github.com/rokobuljan/jsort}
 */
class JSort {

    /** @type {string} */
    static version = "__APP_VERSION__";

    /** @type {string} selectorParent + selectorItems*/
    selectorItemsFull = "";

    /** @type {HTMLElement | null} */
    elGhost;

    /** @type {HTMLElement | null} */
    elGrab;

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

    /** @type {HTMLElement | null} */
    scrollParent = null;

    /** @type {string | null} */
    scrollDirection = null;

    /** @type {null | { start: Function, stop: Function, tick: Function }} */
    scrollAnim = null;

    /** @type {number} */
    edgePressure = 0;

    /** @type {number | undefined} */
    moveTimeout;

    /** @type {boolean} */
    isScrollPrevented = false;

    /** @type {boolean} */
    hasPointerMoved = false;

    /** @type {boolean} */
    hasTouchMoved = false;

    /** @type {null | { clientX: number, clientY: number }} */
    pointerGrab = null;

    /** @type {null | { clientX: number, clientY: number }} */
    touchStart = null;

    /**
     * @constructor
     * @param {HTMLElement} el
     * @param {Object} [options]
     * @param {string} [options.group=""] Link-group parents i.e: "group-a"
     * @param {boolean} [options.swap=false] Swap items mode (Swap elements on drop)
     * @param {number} [options.duration=420] Ms items animation duration
     * @param {string} [options.easing="cubic-bezier(0.6, 0, 0.6, 1)"] Items animation easing
     * @param {number} [options.scale=1.1] Ghost element scale
     * @param {number} [options.opacity=0.8] Ghost element opacity
     * @param {number} [options.grabTimeout=140] Ms before grab is considered instead of scroll on touch devices (has no effect for mouse Event)
     * @param {boolean} [options.parentDrop=true] Can drop item onto parent
     * @param {number} [options.moveThreshold=0] Px before it's considered a pointer drag (Allows to click inner links, buttons, inputs, etc)
     * @param {number} [options.scrollThreshold=8] Px before it's considered a scroll
     * @param {number} [options.edgeThreshold=50] Pixels from edge to start parent auto-scrolling
     * @param {number} [options.scrollSpeed=10] Scroll pixels per frame while ghost is near parent edge
     * @param {number} [options.zIndex=2147483647] Maximum 32-bit signed integer
     * @param {string} [options.selectorParent=".jsort"] Selector for parent elements
     * @param {string} [options.selectorItems="*"] Selector for parent's immediate sortable children
     * @param {string} [options.selectorItemsIgnore=".jsort-ignore"] Selector for ignored immediate children
     * @param {string} [options.selectorHandler=".jsort.handler"] Selector for handler elements
     * @param {string} [options.selectorIgnoreTarget=""] Selector for ignoring specific item's descendant elements (closest to pointer target)
     * @param {string} [options.selectorIgnoreFields=""] Selector for ignoring specific item's descendant action fields elements like buttons, inputs, textarea, etc.
     * @param {string} [options.classGhost="is-jsort-ghost"] Class name for ghost element
     * @param {string} [options.classActive="is-jsort-active"] Class name for item on mousedown, pointerdown
     * @param {string} [options.classTouch="is-jsort-touch"] Class name for item on touchstart event only
     * @param {string} [options.classGrab="is-jsort-grab"] Class name for grabbed item
     * @param {string} [options.classTarget="is-jsort-target"] Class name for hovered element (either item or Sort parent)
     * @param {string} [options.classAnimated="is-jsort-animated"] Class name for all animated elements (on drop)
     * @param {string} [options.classAnimatedDrop="is-jsort-animated-drop"] Class name for the animated grabbed element (on drop)
     * @param {string} [options.classInvalid="is-jsort-invalid"] Class name for invalid item
     * @param {function} [options.onBeforeGrab=(data) => {}] Callback function called before grab (return false to cancel grab)
     * @param {function} [options.onGrab=(data) => {}] Callback function called after grab
     * @param {function} [options.onMove=(data) => {}] Callback function called on move
     * @param {function} [options.onBeforeDrop=(data) => {}] Callback function called before drop (return false to cancel drop)
     * @param {function} [options.onDrop=(data) => {}] Callback function called after drop
     * @param {function} [options.onAnimationEnd=() => {}] Callback function called when animation ends
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
        this.moveThreshold = 0;
        this.scrollThreshold = 8;
        this.edgeThreshold = 50;
        this.scrollSpeed = 10;
        this.zIndex = 2147483647 // 0x7FFFFFFF;
        this.selectorParent = ".jsort";
        this.selectorItems = "*";
        this.selectorItemsIgnore = ".jsort-ignore";
        this.selectorHandler = ".jsort-handler";
        this.selectorIgnoreTarget = "";
        this.selectorIgnoreFields = `:is(input, select, textarea, button, label, [contenteditable=""], [contenteditable="true"], [tabindex]:not([tabindex^="-"]), a[href]:not(a[href=""]), area[href]):not(:disabled)`;
        this.classGhost = "is-jsort-ghost";
        this.classActive = "is-jsort-active";
        this.classTouch = "is-jsort-touch";
        this.classGrab = "is-jsort-grab";
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
     * Get Array of all child elements (ignores .is-jsort-ghost element, if present)
     * @param {HTMLElement} elParent
     * @returns {HTMLElement[]}
     */
    getChildren(elParent) {
        if (!elParent) return [];
        const children = /** @type {HTMLElement[]} */ ([...elParent.children]);
        const childrenNoGhost = children.filter(el => !el.matches(`.${this.classGhost}`));
        return childrenNoGhost;
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
    insertGhost() {
        if (!this.elGrab) return;
        const { x, y, width, height } = this.elGrab.getBoundingClientRect();
        this.elGhost = /** @type {HTMLElement} */ (this.elGrab.cloneNode(true));
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
        const keyframes = el === this.elGrab ?
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
        const elTarget = elFromPoint?.closest(`${this.selectorItemsFull}, ${this.selectorParent}`);
        const isIgnored = elFromPoint?.closest(`${this.selectorItemsIgnore}`);
        if (isIgnored) return false;
        const elDropParent = /** @type {HTMLElement} */ (elFromPoint?.closest(this.selectorParent));
        const isParentDrop = elTarget === elDropParent;
        const isOntoSelf = elTarget && this.closestElement(elTarget, this.elGrab) === this.elGrab;
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
            if ((el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) &&
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
            this.scrollParent = /** @type {HTMLElement} */ (this.findScrollParent(this.elGrab));
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
     * @param {HTMLElement} elGrab
     * @param {HTMLElement} elTarget
     * @returns {boolean} True if insertion was successful
     */
    insert(elGrab, elTarget) {
        // Fallback to instance parent
        const elGrabParent = /** @type {HTMLElement} */ (elGrab.closest(this.selectorParent));
        const grabChildren = this.getChildren(elGrabParent);
        this.indexGrab = grabChildren.indexOf(elGrab);
        const grabSiblings = grabChildren.filter((el) => el !== elGrab);
        this.elDrop = /** @type {HTMLElement} */ (elTarget?.closest(`${this.selectorItemsFull}, ${this.selectorParent}`));
        const isDroppedOntoParent = this.elDrop?.matches(this.selectorParent);
        this.elDropParent = /** @type {HTMLElement} */ (this.elDrop?.closest(this.selectorParent));
        
        const dropChildren = this.getChildren(this.elDropParent);
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

        const isValidTarget = this.checkValidity({ el: elTarget });
        const isValidByUser = this.onBeforeDrop?.call(this, {
            elGrab: this.elGrab,
            elGrabParent,
            elGhost: this.elGhost,
            elDrop: this.elDrop,
            elDropParent: this.elDropParent,
            indexGrab: this.indexGrab,
            indexDrop: this.indexDrop,
            isValidTarget,
            isSameParent,
            event: this._currentEvent,
        }) ?? true;
        const isValid = Boolean(this.elDrop) && isValidTarget && isValidByUser;

        if (isValid) {
            // 3. Insert into DOM
            if (this.swap && !isDroppedOntoParent) {
                const elNext = elGrab.nextSibling;
                this.elDropParent?.insertBefore(elGrab, this.elDrop.nextSibling);
                elGrabParent?.insertBefore(this.elDrop, elNext);
            } else {
                if (isDroppedOntoParent) {
                    this.elDropParent?.append(elGrab);
                } else if (isSameParent) {
                    this.elDropParent?.insertBefore(elGrab, this.indexDrop < this.indexGrab ? this.elDrop : this.elDrop.nextSibling);
                } else {
                    this.elDropParent?.insertBefore(elGrab, this.elDrop);
                }
            }

            // 4. Animate other elements
            affectedElementsData.forEach((data) => {
                if (data.el === elGrab) return; // We'll animate the grabbed item later
                this.animateItem(data);
            });
        }

        // 5. Always animate the grabbed item
        if (ghostRect) {
            elGrab.classList.add(`${this.classAnimatedDrop}`);
            const anim = this.animateItem({ el: elGrab, x: ghostRect.left, y: ghostRect.top });
            if (anim) {
                anim.addEventListener("finish", () => {
                    elGrab.classList.remove(`${this.classAnimatedDrop}`);
                    this.onAnimationEnd?.call(this);
                });
            } else {
                elGrab.classList.remove(`${this.classAnimatedDrop}`);
            }
        }

        this.removeGhost();
        return isValid;
    }

    multiple = true;
    ctrlOn = false;
    classSelected = "is-selected";
    selekted = [];
    selektLast = null;
    onSelect = () => {};

    selekt(ev) {
        // Nohighlight
        let isCtrl = (this.ctrlOn || ev.ctrlKey || ev.metaKey);
        let isShift = ev.shiftKey;

        if (isShift || isCtrl) ev.preventDefault();

        const elTarget = ev.target.closest(`${this.classItems}`);
        if (!elTarget) return;
        const siblings = [...elTarget.parentElement?.children];

        console.log(siblings);


        let isHighlighted = elTarget.matches(this.classSelected);

        // Prevent toggle on single
        if (this.selekted.length === 1 && isHighlighted) {
            return;
        }
        // Prevent deselect on contextmenu
        if (this.selekted.length > 1 && ev.which === 3 && isHighlighted) {
            return;
        }

        this.selekted.forEach(el => el.classList.remove(this.classSelected));

        if (this.multiple) {

            isCtrl = (this.ctrlOn || ev.ctrlKey || ev.metaKey);
            isShift = ev.shiftKey;
            let ti = siblings.indexOf(elTarget); // target index
            let li = siblings.indexOf(this.selektLast); // last known index
            let ai = this.selekted.indexOf(elTarget); // indexes array

            if (isCtrl) {
                //console.log("Is CTRL")
                if (ai > -1) this.selekted.splice(ai, 1);
                else this.selekted.push(elTarget);
            }
            if (isShift && this.selekted.length > 0) {
                //console.log("Is SHIFT and one or more are selected")
                var selectDirectionUp = ti < li;
                if (ti > li) ti = [li, li = ti][0];
                this.selekted = siblings.slice(ti, li + 1);
                if (selectDirectionUp) {
                    this.selekted = this.selekted.reverse(); // Reverse in order to preserve user selection direction
                }
            }
            if (!isShift && !isCtrl) {
                this.selekted = ai < 0 || this.selekted.length > 1 ? [elTarget] : [];
            }
            this.selektLast = elTarget;
        } else {
            console.log("Logic: single")
            this.selektLast = elTarget;
            this.selekted = [elTarget];
        }

        this.selekted.forEach(el => el.classList.add(this.classSelected));

        // CALLBACK:
        this.onSelect?.call(this, this.selekted, this.selektLast);
    }

    /**
     * Grab an item
     * @param {PointerEvent} ev
     */
    grab = (ev) => {
        if (this.elGrab) return;

        const evTarget = /** @type {Element} */ (ev.target);
        const elClosestItem = /** @type {HTMLElement} */ (evTarget.closest(`${this.selectorItemsFull}`));
        const isElIgnored = Boolean(
            evTarget !== elClosestItem &&
            (
                (this.selectorIgnoreTarget && evTarget.closest(this.selectorIgnoreTarget)) ||
                (this.selectorIgnoreFields && evTarget.closest(this.selectorIgnoreFields))
            )
        );

        if (
            // Is in ignore list
            isElIgnored ||
            // Not an item
            !elClosestItem ||
            // Does not belongs to this sortable
            elClosestItem.parentElement !== this.elGrabParent
        ) {
            return;
        }

        const foundHandler = /** @type {Element} */ (elClosestItem.querySelector(this.selectorHandler));
        const isHandlerVisible = foundHandler?.['checkVisibility']?.();
        const hasHandler = Boolean(foundHandler);
        const elHandler = evTarget?.closest(this.selectorHandler);

        if (hasHandler && isHandlerVisible && !elHandler) return;
        const { clientX, clientY } = ev;
        this.pointerGrab = { clientX, clientY };
        this.elGrab = elClosestItem;
        const grabChildren = this.getChildren(this.elGrabParent);
        this.indexGrab = grabChildren.indexOf(this.elGrab);

        const isUserValidated = this.onBeforeGrab?.call(this, {
            elGrab: this.elGrab,
            elGrabParent: this.elGrabParent,
            indexGrab: this.indexGrab,
            event: ev
        }) ?? true;

        if (isUserValidated) {
            ev.preventDefault(); // prevent i.e: links drag and other browser defaults
            this.elGrab.classList.add(this.classActive);
            this.elGrab.style.cursor = "move";
            this.elGrab.style.userSelect = "none";
            if (ev.pointerType === "mouse") {
                this.isScrollPrevented = true;
            }
            this.onGrab?.call(this, {
                elGrab: this.elGrab,
                elGrabParent: this.elGrabParent,
                indexGrab: this.indexGrab,
                event: ev
            });
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
            !this.elGrab ||
            !this.isScrollPrevented ||
            this.hasPointerMoved && !this.elGrab?.hasPointerCapture(ev.pointerId)
        ) return;

        const isSignificantMove = this.isSignificantMove(this.pointerGrab, ev, this.moveThreshold);

        if (!this.hasPointerMoved && isSignificantMove) {
            this.hasPointerMoved = true;
            this.elGrab.setPointerCapture(ev.pointerId);
            this.elGrab.classList.add(this.classGrab);
            // INSERT GHOST!
            this.insertGhost();
        }

        const { clientX, clientY } = ev;
        const isValidTarget = this.checkValidity({ clientX, clientY });
        if (this.elGhost && this.pointerGrab) {
            this.elGhost.style.translate = `${clientX - this.pointerGrab.clientX}px ${clientY - this.pointerGrab.clientY}px`;
            this.elGhost.classList.toggle(this.classInvalid, !isValidTarget);
        }
        this.elGrab.style.cursor = isValidTarget ? "grab" : "not-allowed";
        const elFromPoint = document.elementFromPoint(clientX, clientY);
        const elTarget = /** @type {HTMLElement} */ (elFromPoint?.closest(`${this.selectorItemsFull}, ${this.selectorParent}`));

        if (elTarget !== this.elTarget) {
            this.elTarget?.classList.remove(this.classTarget);
            if (isValidTarget) {
                this.elTarget = elTarget;
                this.elTarget?.classList.add(this.classTarget);
            }
        }

        this.handleScrollParent(ev);

        // Notify
        this.onMove?.call(this, {
            elGrab: this.elGrab,
            elGrabParent: this.elGrabParent,
            elGhost: this.elGhost,
            elTarget: this.elTarget,
            isValidTarget,
            event: ev
        });
    }

    /**
     * Called when an item is dropped on pointerUp
     * @param {PointerEvent} ev
     */
    drop = (ev) => {
        if (!this.elGrab) return;
        this.stopEdgeScroll();
        this.isScrollPrevented = false;
        this.elGrab.style.removeProperty("user-select");
        this.elGrab.style.removeProperty("cursor");
        this.elGrab.classList.remove(this.classActive, this.classGrab, this.classTouch);
        this.elTarget?.classList.remove(this.classTarget);

        const { clientX, clientY } = ev;
        const elFromPoint = /** @type {HTMLElement} */ (document.elementFromPoint(clientX, clientY));
        // INSERT
        this._currentEvent = ev;
        const isInserted = this.insert(this.elGrab, elFromPoint);
        if (isInserted) this.onDrop?.call(this, {
            elGrab: this.elGrab,
            elGrabParent: this.elGrabParent,
            elDrop: this.elDrop,
            elDropParent: this.elDropParent,
            indexGrab: this.indexGrab,
            indexDrop: this.indexDrop,
            event: ev
        });

        this.reset();
        this.removeGhost();
    }

    /**
     * Handle touch start event - used for scroll-intent
     * @param {TouchEvent} ev
     */
    handleTouchStart = (ev) => {
        if (!this.elGrab || this.touchStart) return;
        const { clientX, clientY } = ev.touches[0];
        this.touchStart = { clientX, clientY };
        this.moveTimeout && clearTimeout(this.moveTimeout);
        this.moveTimeout = setTimeout(() => {
            // Only activate drag if we haven't moved beyond threshold
            if (!this.hasTouchMoved) {
                this.elGrab?.classList.add(`${this.classTouch}`);
                this.isScrollPrevented = true;
            }
        }, this.grabTimeout);
    }

    /**
     * Handle touch move event - used for scroll-intent
     * @param {TouchEvent} ev
     */
    handleTouchMove = (ev) => {
        if (!this.elGrab || !this.touchStart) return;

        // Handle drag
        if (this.isScrollPrevented) {
            if (ev.cancelable) ev.preventDefault();
            return
        }

        // Handle scroll
        const isSignificantMove = this.isSignificantMove(this.touchStart, ev.touches[0], this.scrollThreshold);
        if (!this.hasTouchMoved && isSignificantMove) {
            this.hasTouchMoved = true;
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
        this.elGrab = null;
        this.elTarget = null;
        this.elDrop = null; // Same as elTarget but after drop
        this.elDropParent = null;
        this.indexGrab = -1;
        this.indexDrop = -1;
        this.affectedElements = [];
        this.scrollParent = null;
        this.scrollDirection = null;
        this.scrollAnim = null;
        this.edgePressure = 0;
        this.moveTimeout = undefined;
        this.isScrollPrevented = false;
        this.pointerGrab = null;
        this.touchStart = null;
        this.hasPointerMoved = false;
        this.hasTouchMoved = false;
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
        this.selectorItems = (this.selectorItems ?? "*").replace(/^(?! *>)/, "> $&");
        this.selectorItemsFull = `${this.selectorParent}${this.selectorItems}${this.selectorItemsIgnore ? `:not(${this.selectorItemsIgnore})` : ""}`;
        if (this.elGrabParent) {
            this.elGrabParent.addEventListener("touchstart", this.handleTouchStart);
            this.elGrabParent.addEventListener("touchmove", this.handleTouchMove);
            this.elGrabParent.addEventListener("pointerdown", this.grab);
            this.elGrabParent.addEventListener("pointermove", this.move);
            this.elGrabParent.addEventListener("pointerup", this.drop);
            this.elGrabParent.addEventListener("pointercancel", this.drop);
            if (this.group !== "") this.elGrabParent.dataset.jsortGroup = this.group;
        }
    }

    /**
     * Destroy: remove event listeners
     */
    destroy() {
        this.removeGhost();
        if (this.elGrabParent) {
            this.elGrabParent.removeEventListener("touchstart", this.handleTouchStart);
            this.elGrabParent.removeEventListener("touchmove", this.handleTouchMove);
            this.elGrabParent.removeEventListener("pointerdown", this.grab);
            this.elGrabParent.removeEventListener("pointermove", this.move);
            this.elGrabParent.removeEventListener("pointerup", this.drop);
            this.elGrabParent.removeEventListener("pointercancel", this.drop);
            if (this.group !== "") delete this.elGrabParent.dataset.jsortGroup;
        }
    }
}

export default JSort;
