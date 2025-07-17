# JSort

Super small but powerfulsortable library with touch support

## Installation

```bash
npm install @rbuljan/jsort
```

## Usage

```html
<div class="jsort" id="list">
    <div class="jsort-item">1</div>
    <div class="jsort-item">2</div>
    <div class="jsort-item">3</div>
    <div class="jsort-item">4</div>
</div>

<script type="module">
    import JSort from '@rbuljan/jsort';
    const jsortList = new JSort(document.querySelector("#list"));
</script>
```

## Linked Groups

JSort allows to drag &amp; drop into a linked group by adding a `data-jsort-group` attribute.

```html
<div class="jsort" data-jsort-group="group-1">
    <div class="jsort-item">1</div>
    <div class="jsort-item">2</div>
    <div class="jsort-item">3</div>
    <div class="jsort-item">4</div>
</div>

<div class="jsort" data-jsort-group="group-1">
    <div class="jsort-item">1</div>
    <div class="jsort-item">2</div>
    <div class="jsort-item">3</div>
    <div class="jsort-item">4</div>
</div>

<script type="module">
    import JSort from '@rbuljan/jsort';
    document.querySelectorAll(".jsort").forEach((el) => new JSort(el));
</script>
```

## Styling

For custom styling JSort provides several classes you could use in your CSS to further style your UI:

| className | Description |
| --- | --- |
| .jsort | Parent container |
| .jsort-item | Item |
| .jsort-ghost | Ghost item |
| .is-jsort-invalid | Added dynamically to the ghost item if the hovered target is invalid (not allowed drop target) |
| .is-jsort-animated | Item that is currently being animated |
| .is-jsort-grabbed | Item that is currently grabbed (not to be confused with the ghost element) |
| .is-jsort-target | Item that is targeted (hovered) while dragging the grabbed item over it. It can also be the parent Element `.jsort` |

See the Example page for styling examples and inspiration.

___

Licence: [MIT](https://github.com/rokobuljan/jsort)