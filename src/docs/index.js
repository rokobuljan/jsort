import JSort from '@lib';
import hljs from 'https://unpkg.com/@highlightjs/cdn-assets@11.11.1/es/highlight.min.js';
import javascript from 'https://unpkg.com/@highlightjs/cdn-assets@11.11.1/es/languages/javascript.min.js';
import "./hljs.css";

hljs.registerLanguage('javascript', javascript);

document.querySelector("#version").textContent = `${JSort.version}`;

console.log(`Running JSort version: ${JSort.version}`);

document.querySelectorAll(".jsort:not([id^=example])").forEach((el) => {
    // Make sortable
    new JSort(el);
});

const elExampleSortInput = document.querySelector("#example-sort-input");
const elExampleSort = document.querySelector("#example-sort");
const jsortExampleSort = new JSort(elExampleSort);
elExampleSortInput.addEventListener("input", () => {
    const isDec = elExampleSortInput.value === "dec";
    jsortExampleSort.sort((a, b) => {
        if (isDec) [a, b] = [b, a];
        return a.textContent.localeCompare(b.textContent, "en", { numeric: true });
    });
});

document.querySelectorAll("pre > code").forEach((el) => {
    hljs.highlightElement(el);
});

// Random background colors
document.querySelectorAll(".jsort-item").forEach((el) => {
    el.style.backgroundColor = `hsl(${~~(Math.random() * 200 + 80)} 56% 65%)`;
});
