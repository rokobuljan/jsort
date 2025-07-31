import JSort from '@lib';
import hljs from 'https://unpkg.com/@highlightjs/cdn-assets@11.11.1/es/highlight.min.js';
import javascript from 'https://unpkg.com/@highlightjs/cdn-assets@11.11.1/es/languages/javascript.min.js';
import "./hljs.css";

hljs.registerLanguage('javascript', javascript);

document.querySelector("#version").textContent = `${JSort.version}`;

console.log(`Running JSort version: ${JSort.version}`);

document.querySelectorAll(".jsort:not([id^=example])").forEach((el) => {
    // Make sortable
    new JSort(el, {
        onDrop() {
            console.log(`Dropped "${this.elGrabbed.textContent}" from index ${this.indexGrab} into index ${this.indexDrop} Parents:`, this.elGrabParent, this.elDropParent);
        }
    });
});

const elExampleSortSelect = document.querySelector("#example-sort-select");
const elExampleSort = document.querySelector("#example-sort");
const jsortExampleSort = new JSort(elExampleSort);
const elsLI = elExampleSort.querySelectorAll("li");
elsLI.forEach((el, i) => el.dataset.index = i);
elExampleSortSelect.addEventListener("input", () => {
    const isDec = elExampleSortSelect.value === "dec";
    const prop = elExampleSortSelect.value === "" ? "index" : "name";
    jsortExampleSort.sort((a, b) => {
        if (isDec) [a, b] = [b, a];
        return a.dataset[prop].localeCompare(b.dataset[prop], "en", { numeric: true });
    });
});

document.querySelectorAll("pre > code").forEach((el) => {
    hljs.highlightElement(el);
});

// Random background colors
document.querySelectorAll(".jsort-item").forEach((el) => {
    el.style.backgroundColor = `hsl(${~~(Math.random() * 200 + 80)} 56% 65%)`;
});
