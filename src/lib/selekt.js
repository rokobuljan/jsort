class Selekt {
    static selected = [];
    static previousInstance = null;
    static isClearInit = false;
    static isBusy = false;
    static handleClear(/** @type {PointerEvent} */ ev) {
        if (!Selekt.previousInstance || !Selekt.selected.length) return;
        const targetParent = Selekt.previousInstance.closest(
            /** @type {HTMLElement} */(ev.target),
            Selekt.previousInstance.elParent
        );
        if (!targetParent) {
            Selekt.previousInstance.clear();
            Selekt.previousInstance = null;
        }
    }

    #elPivot = null;
    elItem = null;
    isTouch = false;

    constructor(/** @type {HTMLElement} */ elParent, options = {}) {
        this.elParent = elParent;
        this.selectorIgnore = ".ignore";
        this.classSelected = "is-selected";
        this.ctrlOn = false;
        this.isMultiple = true;
        this.isEnabled = true;
        this.onSelect = () => { };

        this.handleDown = this.handleDown.bind(this);
        this.handleUp = this.handleUp.bind(this);
        this.handleTouchstart = this.handleTouchstart.bind(this);

        this.init(options);

        if (!Selekt.isClearInit) {
            Selekt.isClearInit = true;
            addEventListener("pointerdown", Selekt.handleClear);
        }
    }

    init(options = {}) {
        Object.assign(this, options);
        this.elParent.addEventListener("pointerdown", this.handleDown);
        this.elParent.addEventListener("touchstart", this.handleTouchstart);
    }

    destroy() {
        this.elParent.removeEventListener("pointerdown", this.handleDown);
        this.elParent.removeEventListener("touchstart", this.handleTouchstart);
    }

    disable() {
        this.isEnabled = false;
        return this;
    }

    enable(onNextTick = false) {
        if (!onNextTick) {
            this.isEnabled = true;
        } else {
            // RAF is helpful here for a drag-and-drop action to terminate, before re-enabling selection
            requestAnimationFrame(() => {
                this.isEnabled = true;
            });
        }
        return this;
    }

    /**
     * Find closest element (similar to Element.closest() but without selector string)
     * If not found, returns null, meaning el was not a descendant of elTarget, or elTarget itself
     * @param {Element|null} el
     * @param {Element|null} elTarget
     * @returns {Element|null}
     */
    closest(el, elTarget) {
        while (el && el !== elTarget) {
            el = el.parentElement;
        }
        return el === elTarget ? el : null;
    }

    /**
     * Get the closest valid child element of the parent element starting from the Event Target
     */
    getImmediateChild(elTarget) {
        // Quick validation
        if (!this.elParent.contains(elTarget)) {
            return null;
        }
        let el = elTarget;
        while (el && el.parentElement !== this.elParent) {
            el = el.parentElement;
        }
        if (el && !el.matches(this.selectorIgnore)) {
            return el;
        }
    }

    getControls(/** @type {PointerEvent} */ ev) {
        const isCtrl = this.ctrlOn || ev.ctrlKey || ev.metaKey;
        const isShift = ev.shiftKey;
        return {
            isCtrl,
            isShift,
            isAny: isCtrl || isShift,
            isNone: !isCtrl && !isShift
        };
    }

    getAllowedChildren() {
        return [...this.elParent.children].filter(el => !el.matches(this.selectorIgnore));
    }

    toggleCtrl(/** @type {boolean} */ state) {
        this.ctrlOn = state ?? !this.ctrlOn;
    }

    selectLogic(/** @type {PointerEvent} */ ev) {
        if (this.isMultiple) {
            const controls = this.getControls(ev);
            const siblings = this.getAllowedChildren();
            let oi = siblings.indexOf(this.elItem); // Target's original index
            // SINGLE
            if (controls.isNone) {
                const ai = Selekt.selected.indexOf(this.elItem); // Selected index in array
                this.#elPivot = this.elItem; // Set pivot element (for shift selection)
                if (ai === -1 || Selekt.selected.length > 1) this.clear().add(this.elItem, oi); // Select
                else this.clear(); // Deselect 
            }
            // CTRL
            else if (controls.isCtrl) {
                const ai = Selekt.selected.indexOf(this.elItem); // Selected index in array
                this.#elPivot = this.elItem;  // Set pivot element (for shift selection)
                if (ai === -1) this.add(this.elItem, oi); // Select
                else this.remove(this.elItem); // Deselect 
            }
            // SHIFT
            else if (controls.isShift && Selekt.selected.length > 0) {
                let pi = siblings.indexOf(this.#elPivot); // Pivot index
                if (oi > pi) [oi, pi] = [pi, oi];
                this.clear().add(siblings.slice(oi, pi + 1), oi);
            }
        } else {
            this.clear().add(this.elItem);
        }

        this.onSelect?.call(this, { selected: this.get() });
    }

    handleDown(/** @type {PointerEvent} */ ev) {
        if (!this.isEnabled) return;

        // Prevent nested selections bubble to selectable parent
        if (Selekt.isBusy) return;
        Selekt.isBusy = true;
        requestAnimationFrame(() => Selekt.isBusy = false);

        const controls = this.getControls(ev);
        this.elItem = this.getImmediateChild(/**@type {HTMLElement}*/(ev.target));
        if (controls.isAny) ev.preventDefault();

        // No child found, clear selection
        if (!this.elItem) {
            this.clear();
            return;
        }

        // Clear previous instances is selections were made in it
        if (Selekt.previousInstance !== this) {
            Selekt.previousInstance?.clear();
            Selekt.previousInstance = this;
        }

        // Determine if to handle on pointerdown or reschedule for pointerup
        const isSelected = this.elItem.matches(`.${this.classSelected}`); // Was already selected?

        if (
            (isSelected && Selekt.selected.length > 0 && controls.isNone) || // Handle already selected items on pointerup
            (isSelected && Selekt.selected.length === 1 && !controls.isCtrl) || // Prevent toggle on single (unless Ctrl key is pressed)
            (isSelected && !controls.isCtrl) // Do nothing on pointerdown if multiple select (we might want to drag items)
        ) {
            this.elItem.addEventListener("pointerup", this.handleUp, { once: true });
        } else {
            this.selectLogic(ev);
        }
    }

    handleUp(/** @type {PointerEvent} */ ev) {
        if (!this.isEnabled) return;
        this.selectLogic(ev);
    }

    handleTouchstart() {
        this.ctrlOn = true;
    }

    add(elItem, index = 0) {
        if (Array.isArray(elItem)) {
            elItem.forEach((el) => this.add(el, index++));
            return;
        }
        elItem.classList.add(this.classSelected);
        elItem.dataset.selektIndex = index;
        Selekt.selected.push(elItem);
        return this;
    }

    remove(elItem) {
        if (Array.isArray(elItem)) {
            elItem.forEach(el => this.remove(el));
            return;
        }
        const index = Selekt.selected.indexOf(elItem);
        if (index > -1) {
            elItem.classList.remove(this.classSelected);
            elItem.removeAttribute("data-selekt-index");
            Selekt.selected.splice(index, 1);
        }
        return this;
    }

    /** @returns {HTMLElement[]} Get current selected elements */
    get() {
        return Selekt.selected.sort((a, b) => Number(a.dataset.selektIndex) - Number(b.dataset.selektIndex));
    }

    clear() {
        Selekt.selected.forEach((el) => {
            el.classList.remove(this.classSelected);
            el.removeAttribute("data-selekt-index");
        });
        Selekt.selected = [];
        return this;
    }
}

export default Selekt;
