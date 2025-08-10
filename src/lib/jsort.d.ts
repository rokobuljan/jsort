export default JSort;
/**
 * @class JSort
 * @author Roko C. Buljan <https://github.com/rokobuljan>
 * @license MIT
 * @description Small yet powerful drag and drop sortable library with touch support, smooth animations, for a great UX.
 * @see {@link https://github.com/rokobuljan/jsort}
 */
declare class JSort {
    /** @type {string} */
    static version: string;
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
     * @param {function} [options.onBeforeGrab=() => {}] Callback function called before grab (return false to cancel grab)
     * @param {function} [options.onGrab=(data) => {}] Callback function called after grab
     * @param {function} [options.onMove=(data) => {}] Callback function called on move
     * @param {function} [options.onBeforeDrop=(data) => {}] Callback function called before drop (return false to cancel drop)
     * @param {function} [options.onDrop=(data) => {}] Callback function called after drop
     * @param {function} [options.onAnimationEnd=() => {}] Callback function called when animation ends
     */
    constructor(el: HTMLElement, options?: {
        group?: string;
        swap?: boolean;
        duration?: number;
        easing?: string;
        scale?: number;
        opacity?: number;
        grabTimeout?: number;
        parentDrop?: boolean;
        moveThreshold?: number;
        scrollThreshold?: number;
        edgeThreshold?: number;
        scrollSpeed?: number;
        zIndex?: number;
        selectorParent?: string;
        selectorItems?: string;
        selectorItemsIgnore?: string;
        selectorHandler?: string;
        selectorIgnoreTarget?: string;
        selectorIgnoreFields?: string;
        classGhost?: string;
        classActive?: string;
        classTouch?: string;
        classGrab?: string;
        classTarget?: string;
        classAnimated?: string;
        classAnimatedDrop?: string;
        classInvalid?: string;
        onBeforeGrab?: Function;
        onGrab?: Function;
        onMove?: Function;
        onBeforeDrop?: Function;
        onDrop?: Function;
        onAnimationEnd?: Function;
    });
    /** @type {string} selectorParent + selectorItems*/
    selectorItemsFull: string;
    /** @type {HTMLElement | null} */
    elGhost: HTMLElement | null;
    /** @type {HTMLElement | null} */
    elGrab: HTMLElement | null;
    /** @type {HTMLElement | null} */
    elTarget: HTMLElement | null;
    /** @type {HTMLElement | null} */
    elDrop: HTMLElement | null;
    /** @type {HTMLElement | null} */
    elDropParent: HTMLElement | null;
    /** @type {number} */
    indexGrab: number;
    /** @type {number} */
    indexDrop: number;
    /** @type {HTMLElement[]} */
    affectedElements: HTMLElement[];
    /** @type {HTMLElement | null} */
    scrollParent: HTMLElement | null;
    /** @type {string | null} */
    scrollDirection: string | null;
    /** @type {null | { start: Function, stop: Function, tick: Function }} */
    scrollAnim: null | {
        start: Function;
        stop: Function;
        tick: Function;
    };
    /** @type {number} */
    edgePressure: number;
    /** @type {number | undefined} */
    moveTimeout: number | undefined;
    /** @type {boolean} */
    isScrollPrevented: boolean;
    /** @type {boolean} */
    hasPointerMoved: boolean;
    /** @type {boolean} */
    hasTouchMoved: boolean;
    /** @type {null | { clientX: number, clientY: number }} */
    pointerGrab: null | {
        clientX: number;
        clientY: number;
    };
    /** @type {null | { clientX: number, clientY: number }} */
    touchStart: null | {
        clientX: number;
        clientY: number;
    };
    elGrabParent: HTMLElement;
    group: string;
    swap: boolean;
    duration: number;
    easing: string;
    scale: number;
    opacity: number;
    grabTimeout: number;
    parentDrop: boolean;
    moveThreshold: number;
    scrollThreshold: number;
    edgeThreshold: number;
    scrollSpeed: number;
    zIndex: number;
    selectorParent: string;
    selectorItems: string;
    selectorItemsIgnore: string;
    selectorHandler: string;
    selectorIgnoreTarget: string;
    selectorIgnoreFields: string;
    classGhost: string;
    classActive: string;
    classTouch: string;
    classGrab: string;
    classTarget: string;
    classAnimated: string;
    classAnimatedDrop: string;
    classInvalid: string;
    onBeforeGrab: () => void;
    onGrab: () => void;
    onMove: () => void;
    onBeforeDrop: () => void;
    onDrop: () => void;
    onAnimationEnd: () => void;
    /**
     * get all child elements of a sortable parent (ignore elGhost, if present)
     * @param {HTMLElement} elParent
     * @returns {HTMLElement[]}
     */
    getChildren(elParent: HTMLElement): HTMLElement[];
    /**
     * Parse `data-jsort` attribute
     * @param {HTMLElement} el
     * @returns {Object}
     */
    parseDataAttribute(el: HTMLElement): any;
    /**
     * Check if touch or pointer move distance is significant
     * @param {Object} startXY {clientX, clientY} start
     * @param {Object} currentXY {clientX, clientY} current
     * @param {number} distance Distance in px
     * @returns {boolean}
     */
    isSignificantMove(startXY: any, currentXY: any, distance: number): boolean;
    /**
     * Append ghost element to grab's parent
     * @returns {void}
     */
    insertGhost(): void;
    /**
     * Remove ghost element
     * @returns {void}
     */
    removeGhost(): void;
    /**
     * Animate item to new position
     * @param {Object} data
     * @param {Element} data.el - the Element to animate
     * @param {number} data.x - the new X position
     * @param {number} data.y - the new Y position
     * @returns {Animation|undefined}
     */
    animateItem({ el, x, y }: {
        el: Element;
        x: number;
        y: number;
    }): Animation | undefined;
    /**
     * Find closest element (similar to Element.closest() but without selector string)
     * If not found, returns null, meaning el was not a descendant of elTarget, or elTarget itself
     * @param {Element|null} el
     * @param {Element|null} elTarget
     * @returns {Element|null}
     */
    closestElement(el: Element | null, elTarget: Element | null): Element | null;
    /**
     * Check if drop is valid by the given coordinates
     * @param {Object} data
     * @param {number} [data.clientX]
     * @param {number} [data.clientY]
     * @param {HTMLElement} [data.el]
     * @returns {boolean} true if can be dropped at coordinates
     */
    checkValidity({ clientX, clientY, el }: {
        clientX?: number;
        clientY?: number;
        el?: HTMLElement;
    }): boolean;
    /**
     * Create reusable animation engine
     * @param {Function} cb callback function
     * @param {number} fps desired FPS target (60 frames per second by default)
     * @returns {Object} { start, stop, tick } methods
     */
    engine(cb: Function, fps?: number): any;
    /**
     * Find closest scrollable element
     * @param {Element|null|undefined} el Start element
     * @returns {Element} Scrollable element
     */
    findScrollParent(el: Element | null | undefined): Element;
    /**
     * Scroll parent element given a this.scrollDirection
     * @returns {void}
     */
    scrollStep(): void;
    /**
     * Start edge scroll engine
     * @param {string} direction
     */
    startEdgeScroll(direction: string): void;
    /**
     * Stop edge scroll engine
     */
    stopEdgeScroll(): void;
    /**
     * Handle parent scroll depending on the position od the dragged item
     * in regards to the closest scrollable parent's edges
     * @param {PointerEvent} ev
     */
    handleScrollParent(ev: PointerEvent): void;
    /**
     * Insert elItem into this JSort parent
     * @param {HTMLElement} elGrab
     * @param {HTMLElement} elTarget
     * @returns {boolean} True if insertion was successful
     */
    insert(elGrab: HTMLElement, elTarget: HTMLElement): boolean;
    /**
     * Grab an item
     * @param {PointerEvent} ev
     */
    grab: (ev: PointerEvent) => void;
    /**
     * Move an item
     * @param {PointerEvent} ev
     */
    move: (ev: PointerEvent) => void;
    /**
     * Called when an item is dropped on pointerUp
     * @param {PointerEvent} ev
     */
    drop: (ev: PointerEvent) => void;
    _currentEvent: PointerEvent;
    /**
     * Handle touch start event - used for scroll-intent
     * @param {TouchEvent} ev
     */
    handleTouchStart: (ev: TouchEvent) => void;
    /**
     * Handle touch move event - used for scroll-intent
     * @param {TouchEvent} ev
     */
    handleTouchMove: (ev: TouchEvent) => void;
    /**
     * Just like Array.sort() but animated
     * @param {(a: HTMLElement, b: HTMLElement) => number} fn
     * @returns {HTMLElement[]} Sorted items
     */
    sort(fn: (a: HTMLElement, b: HTMLElement) => number): HTMLElement[];
    /**
     * Reset, cleanup internal-use properties
     * @returns {void}
     */
    reset(): void;
    /**
     * Initialize: pass user options or data attr to constructor, and attach events
     * @param {Object} options
     */
    init(options: any): void;
    /**
     * Destroy: remove event listeners
     */
    destroy(): void;
}
