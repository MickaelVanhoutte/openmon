export function draggable(node, data) {
console.log(data);
    let state = data;

    node.draggable = true;
    node.style.cursor = 'grab';

    function handle_dragstart(e) {
        console.log(e);
        if (!e.dataTransfer) return;
        e.dataTransfer.setData('text/plain', state);
    }

    node.addEventListener('dragstart', handle_dragstart);

    return {
        update(data) {
            state = data;
        },

        destroy() {
            node.removeEventListener('dragstart', handle_dragstart);
        }
    };
}

export function dropzone(node, options) {
    console.log(node);
    let state = {
        dropEffect: 'move',
        dragover_class: 'droppable',
        ...options
    };

    function handle_dragenter(e) {
        if (!(e.target instanceof HTMLElement)) return;
        e.target.classList.add(state.dragover_class);
    }

    function handle_dragleave(e) {
        if (!(e.target instanceof HTMLElement)) return;
        e.target.classList.remove(state.dragover_class);
    }

    function handle_dragover(e) {
        e.preventDefault();
        if (!e.dataTransfer) return;
        e.dataTransfer.dropEffect = state.dropEffect;
    }

    function handle_drop(e) {
        e.preventDefault();
        if (!e.dataTransfer) return;
        const data = e.dataTransfer.getData('text/plain');
        if (!(e.target instanceof HTMLElement)) return;
        e.target.classList.remove(state.dragover_class);
        state.on_dropzone(data, e);
    }

    node.addEventListener('dragenter', handle_dragenter);
    node.addEventListener('dragleave', handle_dragleave);
    node.addEventListener('dragover', handle_dragover);
    node.addEventListener('drop', handle_drop);

    return {
        update(options) {
            state = {
                dropEffect: 'move',
                dragover_class: 'droppable',
                ...options
            };
        },

        destroy() {
            node.removeEventListener('dragenter', handle_dragenter);
            node.removeEventListener('dragleave', handle_dragleave);
            node.removeEventListener('dragover', handle_dragover);
            node.removeEventListener('drop', handle_drop);
        }
    };
}
