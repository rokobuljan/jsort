
![JSort logo](/src/docs/public/jsort-logo.png)

# JSort

Small yet powerful drag and drop sortable library with touch support, smooth animations, for a great UX.

[![NPM](https://img.shields.io/npm/v/@rbuljan/jsort)](https://www.npmjs.com/package/@rbuljan/jsort)<br>
NPM: [@rbuljan/jsort](https://www.npmjs.com/package/@rbuljan/jsort)  
Demo &amp; examples: [JSort — Homepage](https://rokobuljan.github.io/jsort/)  

## Features

- [x] Smooth animations for a better UX
- [x] Touch support (pointer events)
- [x] Customization options
- [x] Drag &amp; drop into linked groups
- [x] Grab handler
- [x] Nested groups
- [x] Swap items
- [x] Dynamic items (delegated events)
- [x] Scroll parent on edge drag
- [x] No external dependencies
- [ ] Multiple select (*soon*)

## Installation

```bash
npm install @rbuljan/jsort
```

## Syntax

```js
const JSortInstance = new JSort(HTMLElement, { /* Options */ });
```

## Usage

Add class `class="jsort"` to your HTML element, and instantiate `JSort` with the desired Options

```html
<ul class="jsort" id="list">
    <li>1</li>
    <li>2</li>
    <li>
        <div class="jsort-handler">✥</div>
        3 Grab me by the handler
    </li>
    <li>4</li>
</ul>

<script type="module">
    import JSort from '@rbuljan/jsort';
    const jsortList = new JSort(document.querySelector("#list"), {
        duration: 360,
        onGrab(data) {
            console.log(this, data);
        }
        onMove(data) {
            console.log(this, data);
        }
        onDrop(data) {
            console.log(this, data);
        }
    });
</script>
```

## Options

`JSort(HTMLElement, options)`

The second parameter accepts an options object to customize the sorting behavior and appearance.

| Option                 | Type       | Default               | Description                                           |
| ---------------------- | ---------- | --------------------- | ----------------------------------------------------- |
| **Event Callbacks**    |            |                       |                                                       |
| `onBeforeGrab(data)`   | `function` |                       | Called before item grab                               |
| `onGrab(data)`         | `function` |                       | Called on item grabb                                  |
| `onMove(data)`         | `function` |                       | Called on item move                                   |
| `onBeforeDrop(data)`   | `function` |                       | Called before itme drop                               |
| `onDrop(data)`         | `function` |                       | Called on drop                                        |
| `onAnimationEnd()`     | `function` |                       | Called on drop animation end                          |
| **Behavior**           |            |                       |                                                       |
| `group`                | `string`   | `""`                  | Group sortable parents                                |
| `swap`                 | `boolean`  | `false`               | Swap elements (instead of reordering)                 |
| `parentDrop`           | `boolean`  | `true`                | Allow drop onto parent container                      |
| `dragThreshold`        | `number`   | `0`                   | Px before it's considered a pointer-drag              |
| `grabTimeout`          | `number`   | `140`                 | Grab delay in *ms* (touch devices only)               |
| **Selectors**          |            |                       |                                                       |
| `selectorParent`       | `string`   | `".jsort"`            | Parent container selector                             |
| `selectorItems`        | `string`   | `"*"`                 | Sortable items (parent's immediate children) selector |
| `selectorItemsIgnore`  | `string`   | `".jsort-ignore"`     | Ignored sortable's immediate children                 |
| `selectorIgnoreTarget` | `string`   | `""`                  | Prevent grab on item descendant selectors             |
| `selectorIgnoreFields` | `string`   | *Read Tip below*      | Prevent grab on item descendant action elements       |
| `selectorHandler`      | `string`   | `".jsort-handler"`    | Drag handle selector                                  |
| **CSS Classes**        |            |                       |                                                       |
| `classGrabbed`         | `string`   | `"is-jsort-grabbed"`  | Grabbed element class                                 |
| `classGhost`           | `string`   | `"is-jsort-ghost"`    | Ghost element class                                   |
| `classTarget`          | `string`   | `"is-jsort-target"`   | Hovered, targeted element class                       |
| `classAnimated`        | `string`   | `"is-jsort-animated"` | Animated elements class                               |
| `classInvalid`         | `string`   | `"is-jsort-invalid"`  | Ghost element over invalid zones                      |
| `classTouch`           | `string`   | `"is-jsort-touch"`    | Grabbed element - only if Event was "touchstart"      |
| **Animation**          |            |                       |                                                       |
| `duration`             | `number`   | `420`                 | Sort animation duration in *ms*                       |
| `easing`               | `string`   | `"cubic-bezier()"`    | Animation easing function                             |
| **Ghost Styles**       |            |                       |                                                       |
| `scale`                | `number`   | `1.1`                 | Ghost element scale                                   |
| `opacity`              | `number`   | `0.8`                 | Ghost element opacity (0-1)                           |
| `zIndex`               | `number`   | `2147483647`          | Ghost element z-index                                 |
| **Scroll**             |            |                       |                                                       |
| `scrollThreshold`      | `number`   | `8`                   | Px before considering auto-scroll                     |
| `edgeThreshold`        | `number`   | `50`                  | Autoscroll distance to edge                           |
| `scrollSpeed`          | `number`   | `10`                  | Auto-scroll speed in pixels per step                  |

***Tip:***  
By defafult, the `selectorIgnoreFields` provides a good sane selector in order to prevent grabbing an item if the direct target is an *action element*, like: Anchor, Button, Input, Contenteditable, etc:

```css
/* DO NOT GRAB ITEM IF POINTER TARGET IS AN ACTION FIELD: */
:is(input, select, textarea, button, label, summary, [contenteditable=""], [contenteditable="true"], [tabindex]:not([tabindex^="-"]), a[href]:not(a[href=""]), area[href]):not(:disabled)
```

***Tip:***  
Internally, the Options **selectors** will be **concatenated** like `selectorParent > selectorItems:not( selectorItemsIgnore )` into i.e: `.jsort > *:not(.jsort-ignore)` (or like: `.jsort > *` if you pass an empty string to the `selectorItemsIgnore`). The `>` immediate child selector will always be injected by default.



### Example

```javascript
const sortable = new JSort(document.querySelector('.my-list'), {
  group: 'shared-group',
  duration: 300,
  scale: 1.05,
  onDrop: (data) => {
    console.log(this, data); // JSort, data{}
  }
});
```

***Tip:***  
Options (that are not callbacks) can be assigned directly in your HTML markup using the `data-jsort` attribute in this format `option: value; option: value`

```html
<ul class="jsort" data-jsort="
        group: a;
        selectorItems: .item;
        selectorHandler: .my-handler;
        swap: true;
        duration: 300;
        easing: ease-out;
        zIndex: 999;
        parentDrop: false;
    ">
    <li class="item"><div class="my-handler">✥</div>Item 1</li>
    <li class="item"><div class="my-handler">✥</div>Item 2</li>
</ul>
```

just remember that `data-jsort` options **will override** any instance options you passed to the constructor (analogue to stylesheet vs. `style=""` attribute). Having that in consideration, you can define some JSort global, shared options from JavaScript, and customize specific elements using the `data-jsort=""` attribute, if needed.

## Custom validation

To manually abort some actions depending on a condition, you can use the  `onBeforeGrab()` and `onBeforeDrop()` callbacks

```js
new JSort(myListElement, {
    onBeforeGrab(data) {
        if (data.indexGrab === 0) {
            console.error("Cannot grab first item");
            return false;
        }
        if (data.elGrab.closest(".no-grab")) {
            console.error("Grabbed an invalid item");
            return false;
        }
    },
    onGrab() {
        console.log(`Grabbed index ${this.indexGrab}`);
    },
    onBeforeDrop(data) {
        if (data.indexDrop === 0) {
            console.error("Cannot drop into first item");
            return false;
        }
        if (data.elDrop.closest(".no-drop")) {
            console.error("Cannot drop here");
            return false;
        }
    },
    onDrop() {
        console.log(`Dropped index ${this.indexGrab} into ${this.indexDrop}`);
    }
})
```

If you returned `false` from one of the callbacks, the respective  `onGrab` or `onDrop` actions will not be called.

## Methods

| Method                    | Description                                           |
| ------------------------- | ----------------------------------------------------- |
| `init({/*options*/})`     | Re-initialize the instance with updated Options       |
| `destroy()`               | Destroys the instance and removes the event listeners |
| `insert(Element, Target)` | Insert item at Target (parent or item)                |
| `sort(fn)`                | (*Beta*) In-place sort parent items (with animation)  |

## Properties

`JSort`

| Property           | Type            | Default | Description                                |
| ------------------ | --------------- | ------- | ------------------------------------------ |
| `indexGrab`        | `number`        | `-1`    | The index of the grabbed item              |
| `indexDrop`        | `number`        | `-1`    | The new index on drop                      |
| `elGrab`           | `HTMLElement`   | `null`  | The grabbed item                           |
| `elGrabParent`     | `HTMLElement`   | `null`  | The grabbed item's parent                  |
| `elGhost`          | `HTMLElement`   | `null`  | Element that follows the pointer           |
| `elTarget`         | `HTMLElement`   | `null`  | The hovered target (item or parent)        |
| `elDrop`           | `HTMLElement`   | `null`  | Same as `elTarget` but on drop             |
| `elDropParent`     | `HTMLElement`   | `null`  | The drop (target) item's parent on drop    |
| `affectedElements` | `HTMLElement[]` | `[]`    | Array of drop-affected (animated) elements |

## Static Properties

`JSort`

| Property  | Type     | Description             |
| --------- | -------- | ----------------------- |
| `version` | `string` | Current library version |

## Linked Groups

JSort allows to drag &amp; drop into a linked group by adding a `group` property in the `data-jsort` attribute.

```html
<div class="jsort" data-jsort="group:a">
    <div>A 1</div>
    <div>A 2</div>
    <div>A 3</div>
</div>

<div class="jsort" data-jsort="group:a">
    <div>B 1</div>
    <div>B 2</div>
</div>

<script type="module">
    import JSort from '@rbuljan/jsort';
    document.querySelectorAll(".jsort").forEach((el) => {
        new JSort(el, { /* Options */ });
    });
</script>
```

## Swap items

By default JSort *reorders* the items on drop. If instead you want to **swap**, you can set the `swap` option to `true` to your element or group elements:

```html
<div class="jsort" data-jsort="group:a; swap:true">
    <div>A 1</div>
    <div>A 2</div>
    <div>A 3</div>
</div>
<div class="jsort" data-jsort="group:a; swap:true">
    <div>B 1</div>
    <div>B 2</div>
</div>

<script type="module">
    import JSort from '@rbuljan/jsort';
    document.querySelectorAll(".jsort").forEach(el => new JSort(el));
</script>
```

Instead of using data-jsort, you can set the options directly in the constructor:

```js
document.querySelectorAll(".list-swap").forEach((el) => {
  new JSort(el, {
    group: "a",
    swap: true
  });
});
```

## Styling

> *Is there a minimal CSS styling I might want to use to get started?*

Yes! This is the minimal CSS styling you might want to use to get the best from JSort defaults:

```css
/* JSort — Minimal suggested styles */

.is-jsort-active.is-jsort-touch {
    outline: 0.15rem solid currentColor; /* Visual hint on touch devices */
}

.is-jsort-grabbed {
    opacity: 0; 
}

.is-jsort-target {
    z-index: 1;
    outline: 0.15rem dashed currentColor;
}

.is-jsort-invalid {
    outline: 0.15rem solid red;
}
```

The above was not hardcoded into the library since everyone wants to style their UI differently, i.e: set the grabbed element's opacity at a different value, change the targeted element styles, etc.

For custom styling JSort provides several classes you could use in your CSS to further style your UI:

| className               | Description                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------- |
| .jsort                  | Parent container                                                                      |
| .jsort-handler          | Child of item, to be used as a grab handler                                           |
| .is-jsort-ghost         | Class added tp Ghost element                                                          |
| .is-jsort-active        | Active item (not yet grabbed/moved). Useful as a *"drag ready"* clue on touch devices |
| .is-jsort-grabbed       | Currently grabbed item (PS: not the ghost element)                                    |
| .is-jsort-target        | Hovered element item or `.jsort` parent                                               |
| .is-jsort-animated      | All animating items (on drop)                                                         |
| .is-jsort-animated-drop | Grabbed animating item (on drop)                                                      |
| .is-jsort-invalid       | Added to the Ghost element if the target is *not allowed* (during hover)              |
| .is-jsort-touch         | Added to active item only if eventType is `touchstart`                                |

___

See the [JSort Homepage](https://rokobuljan.github.io/jsort/) for inspiration.

## Motivation

I needed a sortable library. After reviewing some popular ones like SortableJS, Dragula, jQueryUI, and others I found that many do not work the way I want, fast, smoothly, touch/mobile. An important factor was to minimize motion, only when necessary (on drop) and to animate all affected elements naturally and smoothly to support visual cognitive feedback and make the experience overall more natural and pleasant.  
**JSort** was born to fill this necessity.

___

Licence: [MIT](https://github.com/rokobuljan/jsort)
