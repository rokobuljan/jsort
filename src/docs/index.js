import JSort from '@lib';
import hljs from 'https://unpkg.com/@highlightjs/cdn-assets@11.11.1/es/highlight.min.js';
import javascript from 'https://unpkg.com/@highlightjs/cdn-assets@11.11.1/es/languages/javascript.min.js';
import "./hljs.css";

hljs.registerLanguage('javascript', javascript);

document.querySelector("#version").textContent = `${JSort.version}`;

console.log(`Running JSort version: ${JSort.version}`);
document.querySelectorAll(".jsort").forEach((el) => {
    // Make sortable
    new JSort(el, {
        onAnimationEnd() {
            console.log("animation ended");
        }
    });
    // Random background colors
    el.querySelectorAll(":scope > *").forEach((el) => {
        el.style.backgroundColor = `hsl(${~~(Math.random() * 200 + 80)} 56% 65%)`;
    });
});

document.querySelectorAll("pre > code").forEach((el) => {
    hljs.highlightElement(el);
});

