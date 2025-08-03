import JSort from '@lib';
import hljs from 'https://unpkg.com/@highlightjs/cdn-assets@11.11.1/es/highlight.min.js';
import javascript from 'https://unpkg.com/@highlightjs/cdn-assets@11.11.1/es/languages/javascript.min.js';
import "./hljs.css";

hljs.registerLanguage('javascript', javascript);

const el = (sel, par = document) => par.querySelector(sel);
const els = (sel, par = document) => par.querySelectorAll(sel);

el("#version").textContent = `${JSort.version}`;
console.log(`Running JSort version: ${JSort.version}`);

els(".jsort:not([id^=example])").forEach((el) => {
    // Make sortable
    new JSort(el, {
        onDrop(data) {
            console.log(data);
            // console.log(`Dropped "${this.elGrabbed.textContent}" from index ${this.indexGrab} into index ${this.indexDrop} Parents:`, this.elGrabParent, this.elDropParent);
        }
    });
});

const elExampleSortSelect = el("#example-sort-select");
const elExampleSort = el("#example-sort");
const jsortExampleSort = new JSort(elExampleSort);
const elsLI = els("li", elExampleSort);
elsLI.forEach((el, i) => el.dataset.index = i);
elExampleSortSelect.addEventListener("input", () => {
    const isDec = elExampleSortSelect.value === "dec";
    const prop = elExampleSortSelect.value === "" ? "index" : "name";
    jsortExampleSort.sort((a, b) => {
        if (isDec) [a, b] = [b, a];
        return a.dataset[prop].localeCompare(b.dataset[prop], "en", { numeric: true });
    });
});

els("pre > code").forEach((el) => {
    hljs.highlightElement(el);
});

// Random background colors
els(".grid > *, .list > *").forEach((el) => {
    el.style.backgroundColor = `hsl(${~~(Math.random() * 200 + 80)} 56% 65%)`;
});
