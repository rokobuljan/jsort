// import JSort from '@lib';
import JSort from "../lib/jsort.js"

document.querySelectorAll(".jsort").forEach((el) => {
    // Make sortable
    new JSort(el);
    // Random background colors
    el.querySelectorAll(":scope > *").forEach((el, i) => {
        el.style.backgroundColor = `hsl(${~~(Math.random() * 200 + 80)} 56% 65%)`;
    });
});
