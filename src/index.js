import Cycle from '@cycle/core';
import {h, hJSX, makeDOMDriver} from '@cycle/dom';

function intent({DOM, globalMouseMove}) {
    return {
        mouseMove$: globalMouseMove,
        mouseDown$: DOM.get('#dragTarget', 'mousedown'),
        mouseUp$: DOM.get('#dragTarget', 'mouseup')
    };
}

function model({mouseMove$, mouseDown$, mouseUp$}) {
    return mouseDown$.flatMap(() =>
            mouseMove$.map(({clientX, clientY}) => ({x: clientX, y: clientY}))
                .pairwise()
                .map(([b, a]) => ({x: a.x - b.x, y: a.y - b.y}))
                .takeUntil(mouseUp$)
    ).startWith({x: window.innerWidth / 2 - 100, y: 200})
        .scan((p1, p2) => ({x: p1.x + p2.x, y: p1.y + p2.y}))
}

function view(state$) {
    return state$.map(e => <div id="dragTarget" style={{
        left: e.x + 'px',
        top: e.y + 'px',
        backgroundSize: "contain",
        height: "200px",
        width: "200px",
        background: "#000000 url(https://raw.github.com/Reactive-Extensions/RxJS/master/examples/dragndrop/logo.png) no-repeat center",
        border: "1px solid #666666",
        color: "#ffffff",
        padding: "10px",
        position: "absolute",
        cursor: "move"
    }}>Drag Me!</div>);
}

Cycle.run((drivers => {
    let actions = intent(drivers);
    let state$ = model(actions);

    return {
        DOM: view(state$)
    };
}), {
    DOM: makeDOMDriver('#app'),
    globalMouseMove: () => Cycle.Rx.Observable.fromEvent(document, 'mousemove')
});

function main({DOM, globalMouseMove}) {
    let actions = intent(DOM, globalMouseMove);
    let state$ = model(actions);

    return {
        DOM: view(state$)
    };
}