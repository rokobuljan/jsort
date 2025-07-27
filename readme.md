
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
- [x] Scroll parent on drag
- [ ] Multiple select (*soon*)

## Installation

```bash
npm install @rbuljan/jsort
```

## Syntax

```js
const JSortInstance = new JSort(Element, { /* Options */ });
```

## Usage

```html
<ul class="jsort" id="list">
    <li class="jsort-item">1</li>
    <li class="jsort-item">
        <div class="jsort-handler">✥</div>
        2 Grab by the handler
    </li>
    <li class="jsort-item">3</li>
    <li class="jsort-item">4</li>
</ul>

<script type="module">
    import JSort from '@rbuljan/jsort';
    const jsortList = new JSort(document.querySelector("#list"), {
        duration: 360,
        onGrab(ev) {
            console.log(this, ev);
        }
        onMove(ev) {
            console.log(this, ev);
        }
        onDrop(ev) {
            console.log(this, ev);
        }
    });
</script>
```

## Linked Groups

JSort allows to drag &amp; drop into a linked group by adding a `group` property in the `data-jsort` attribute.

```html
<div class="jsort" data-jsort="group:a">
    <div class="jsort-item">A 1</div>
    <div class="jsort-item">A 2</div>
    <div class="jsort-item">A 3</div>
</div>

<div class="jsort" data-jsort="group:a">
    <div class="jsort-item">B 1</div>
    <div class="jsort-item">B 2</div>
</div>

<script type="module">
    import JSort from '@rbuljan/jsort';
    document.querySelectorAll(".jsort").forEach((el) => {
        new JSort(el, {/*Options*/});
    });
</script>
```

## Swap items

By default JSort *reorders* the items on drop. If instead you want to **swap**, you can set the `swap` option to `true` to your element or group elements:

```html
<div class="jsort swap" data-jsort="group:a; swap:true">
    <div class="jsort-item">A 1</div>
    <div class="jsort-item">A 2</div>
    <div class="jsort-item">A 3</div>
</div>

<div class="jsort swap" data-jsort="group:a; swap:true">
    <div class="jsort-item">B 1</div>
    <div class="jsort-item">B 2</div>
</div>

<script type="module">
    import JSort from '@rbuljan/jsort';
    document.querySelectorAll(".swap").forEach(el => new JSort(el));
</script>
```

Instead of using data-jsort, you can set the options directly in the constructor:

```html
<div class="jsort list-swap">
    <div class="jsort-item">A 1</div>
    <div class="jsort-item">A 2</div>
    <div class="jsort-item">A 3</div>
</div>

<div class="jsort list-swap">
    <div class="jsort-item">B 1</div>
    <div class="jsort-item">B 2</div>
</div>

<script type="module">
    import JSort from '@rbuljan/jsort';
    document.querySelectorAll(".list-swap").forEach(el => {
        new JSort(el, {
            group: "swap-group-1",
            swap: true
        })
    });
</script>
```

And, following, are all the available **options** you can use

## Options

`JSort(Element, options)`

| Option                       | Type / `Default`                 | Description                              |
| ---------------------------- | -------------------------------- | ---------------------------------------- |
| `group`                      | String                           | Group name (Link-group parents)          |
| `swap`                       | `false`                          | Swap elements on drop                    |
| `duration`                   | `420`                            | Animation duration in milliseconds       |
| `easing`                     | `"cubic-bezier(0.6, 0, 0.6, 1)"` | Animation easing function                |
| `scale`                      | `1.1`                            | Ghost scale                              |
| `opacity`                    | `0.8`                            | Ghost opacity                            |
| `grabTimeout`                | `140`                            | Grab timeout (Touch devices only)        |
| `onGrab(PointerEvent)`       | Function                         | Callback on item grab                    |
| `onMove(PointerEvent)`       | Function                         | Callback on item move                    |
| `onBeforeDrop(PointerEvent)` | Function                         | Callback on before item drop             |
| `onDrop(PointerEvent)`       | Function                         | Callback on item drop                    |
| `onAnimationEnd()`           | Function                         | Callback on drop animation end           |
| `parentDrop`                 | `true`                           | If item can be dropped onto parent       |
| `edgeThreshold`              | `50`                             | Px near edge to start parent auto-scroll |
| `scrollSpeed`                | `10`                             | Prent scroll px per step (near edge)     |
| `zIndex`                     | `2147483647`                     | Ghost element z-index                    |
| `selectorParent`             | `".jsort"`                       | Custom parent selector                   |
| `selectorItems`              | `".jsort-item"`                  | Custom items selector                    |
| `selectorHandler`            | `".jsort-handler"`               | Custom handler selector                  |
| `classGhost`                 | `"is-jsort-ghost"`               | Custom class for ghost element           |
| `classAnimated`              | `"is-jsort-animated"`            | Custom animated class                    |
| `classGrabbed`               | `"is-jsort-grabbed"`             | Custom grabbed class                     |
| `classTarget`                | `"is-jsort-target"`              | Custom target class (hover, drop)        |
| `classInvalid`               | `"is-jsort-invalid"`             | Custom invalid class                     |

***Tip:***  
Options (that are not callbacks) can be assigned directly in your HTML markup using the `data-jsort` attribute in this format `option: value; option: value`

```html
<ul class="jsort" data-jsort="
        group: a;
        selectorHandler: .my-handler;
        swap: true;
        duration: 1000;
        easing: cubic-bezier(0.5, 0, 0.5, 1);
        zIndex: 9999;
        parentDrop: false;
    ">
    <li class="jsort-item"><div class="my-handler">✥</div>Item 1</li>
    <li class="jsort-item"><div class="my-handler">✥</div>Item 2</li>
</ul>
```

just remember that `data-jsort` options **will override** any instance options you passed to the constructor (analogue to stylesheet vs. `style=""` attribute). Having that in consideration, you can define some JSort global, shared options from JavaScript, and customize specific elements using the `data-jsort=""` attribute, if needed.

## Custom validation

To manually abort some actions depending on a condition, you can use the  `onBeforeGrab()` and `onBeforeDrop()` callbacks

```js
new JSort(myListElement, {
    onBeforeGrab(event) {
        if (this.indexGrab === 0) {
            console.error("Cannot grab first item");
            return false;
        }
        if (this.elGrab.closest(".no-grab")) {
            console.error("Grabbed an invalid item");
            return false;
        }
    },
    onGrab() {
        console.log(`Grabbed index ${this.indexGrab}`);
    },
    onBeforeDrop(event) {
        if (this.indexDrop === 0) {
            console.error("Cannot drop into first item");
            return false;
        }
        if (this.elDrop.closest(".no-drop")) {
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

| Method                | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `init({/*options*/})` | Re-initialize the instance with updated Options       |
| `destroy()`           | Destroys the instance and removes the event listeners |

## Properties

`JSortInstance`

| Property        | Type        | Description                                   |
| --------------- | ----------- | --------------------------------------------- |
| `elGrab`        | `Element`   | The grabbed item                              |
| `elGrabParent`  | `Element`   | The grabbed item's parent                     |
| `elGhost`       | `Element`   | Element that follows the pointer              |
| `elTarget`      | `Element`   | The hovered target (item or parent)           |
| `elDrop`        | `Element`   | Same as `elTarget` but on drop                |
| `elDropParent`  | `Element`   | The drop (target) item's parent on drop       |
| `indexGrab`     | `number`    | The index of the grabbed item                 |
| `indexDrop`     | `number`    | The new index on drop                         |
| `affectedItems` | `Element[]` | Array of affected (animated) elements on drop |

## Static Properties

| Property  | Type     | Description             |
| --------- | -------- | ----------------------- |
| `version` | `string` | Current library version |

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
| .jsort-item             | Sortable children elements                                                            |
| .jsort-handler          | Child of `.jsort-item` to be used as a grab handler                                   |
| .jsort-ghost            | Ghost element                                                                         |
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
