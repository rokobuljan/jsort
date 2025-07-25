
![JSort logo](/src/docs/public/jsort-logo.png)

# JSort

Super small yet powerful *sortable* library with touch support, smooth animations, for a great UX.

[![NPM](https://img.shields.io/npm/v/@rbuljan/jsort)](https://www.npmjs.com/package/@rbuljan/jsort)<br>
NPM: [@rbuljan/jsort](https://www.npmjs.com/package/@rbuljan/jsort)  
Demo &amp; examples: [JSort homepage](https://rokobuljan.github.io/jsort/)  

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

| Option                 | Type / `Default`                 | Description                        |
| ---------------------- | -------------------------------- | ---------------------------------- |
| `group`                | String                           | Group name                         |
| `swap`                 | `false`                          | Swap elements on drop              |
| `duration`             | `420`                            | Animation duration in milliseconds |
| `easing`               | `"cubic-bezier(0.6, 0, 0.6, 1)"` | Animation easing function          |
| `scale`                | `1.1`                            | Scale factor of the ghost element  |
| `opacity`              | `0.8`                            | Opacity of the ghost element       |
| `onGrab(PointerEvent)` | Function                         | Called when an item is grabbed     |
| `onMove(PointerEvent)` | Function                         | Called when an item is moved       |
| `onDrop(PointerEvent)` | Function                         | Called when an item is dropped     |
| `parentDrop`           | `true`                           | If item can be dropped onto parent |
| `edgeThreshold`        | `50`                             | Px near edge to start scrolling    |
| `scrollSpeed`          | `10`                             | Prent scroll px per step           |
| `zIndex`               | `2147483647`                     | Ghost element  z-index             |
| `selectorParent`       | `".jsort"`                       | Custom selector                    |
| `selectorItems`        | `".jsort-item"`                  | Custom items selector              |
| `selectorHandler`      | `".jsort-handler"`               | Custom handler selector            |
| `classAnimated`        | `"is-jsort-animated"`            | Custom animated class              |
| `classGrabbed`         | `"is-jsort-grabbed"`             | Custom grabbed class               |
| `classTarget`          | `"is-jsort-target"`              | Custom target class (hover, drop)  |
| `classInvalid`         | `"is-jsort-invalid"`             | Custom invalid class               |

***Tip:***  
Options can be assigned directly from your HTML using the `data-jsort` attribute in this format `option: value;`

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

## Methods

| Method      | Description                                           |
| ----------- | ----------------------------------------------------- |
| `init({})`  | Re-initialize the instance with updated Options       |
| `destroy()` | Destroys the instance and removes the event listeners |

## Properties

`JSortInstance`

| Property        | Description                                                               |
| --------------- | ------------------------------------------------------------------------- |
| `elGrabbed`     | The grabbed item                                                          |
| `elGhost`       | The auto-generated ghost element that follows the pointer                 |
| `elTarget`      | The hovered target (item or parent)                                       |
| `indexGrab`     | The index of the grabbed item                                             |
| `indexDrop`     | The index of the target item (or items length-1 if drop target is parent) |
| `elParentDrop`  | The target item's parent (on drop)                                        |
| `affectedItems` | An array of affected (animated) items on drop                             |

## Styling

For custom styling JSort provides several classes you could use in your CSS to further style your UI:

| className          | Description                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| .jsort             | Parent container                                                            |
| .jsort-item        | Item                                                                        |
| .jsort-ghost       | Ghost item                                                                  |
| .is-jsort-animated | Item that is currently being animated                                       |
| .is-jsort-grabbed  | Item that is currently grabbed (not to be confused with the ghost element)  |
| .is-jsort-target   | Item that is targeted (hovered). It can also be the parent Element `.jsort` |
| .is-jsort-invalid  | Added to the ghost element if the hovered target is invalid / not allowed   |

___

See the [Example page](https://rokobuljan.github.io/jsort/) for inspiration.

## FAQ

<details>
    <summary>How to differentiate scroll intent vs sort/drag on touch devices?</summary>
    This is a pretty hard problem to solve. If we use CSS `touch-action: none;` the page will not scroll.  
    If we use `touch-action: pan-y;` the page will scroll, but the items will be draggable initially only on the X axis.  
    JSort uses instead `Event.preventDefault()` on the `"touchstart"` Event being the only *"touch"* Event in use.  
    JS does not allows to set CSS `touch-action: none;` or `Event.preventDefault()` once the "pointerdown" Events started. Adding a delay to "touchstart" does not allows to async preventDefault(), since it must be synchronous.  
    Instead of adding hundreds of lines of tricky hacks, I decided to rather wait for browsers to implement a sane, native *"intent"* solution. In the meantime my suggestion is to:  
    <ul>
      <li>leave some safe scroll zone between your sortable elements and the viewport</li>
      <li>add a sort handler on mobile. Using CSS `@media` queries you can set that handler element to `display: none;` on smaller screens. On desktop your items will still be draggable out of the box.</li>
    </ul>
</details>

## Motivation

I needed a sortable library. After reviewing some popular ones like SortableJS, Dragula, jQueryUI, and others I found that many do not work the way I want, fast, smoothly, touch/mobile. An important factor was to minimize motion, only when necessary (on drop) and to animate all affected elements naturally and smoothly to support cognitive feedback and make the experience overall more natural and pleasant.  
JSort was born to fill this necessity.

___

Licence: [MIT](https://github.com/rokobuljan/jsort)
