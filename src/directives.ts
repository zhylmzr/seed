import { Directive } from "./directive";

const directices: {
    [key: string]: Function | UpdateType;
} = {
    text: (el: HTMLDataElement, value: string): void => {
        el.textContent = value;
    },
    value: (el: HTMLDataElement, value: string): void => {
        el.value = value;
    },
    on: {
        update(this: Directive, handler: EventListener): void {
            let event = this.opts.arg;
            if (this.opts.handlers[event]) {
                this.getEl().removeEventListener(event, this.opts.handlers[event]);
            }
            if (handler) {
                handler = handler.bind(this.seed);
                this.getEl().addEventListener(event, handler);
                this.opts.handlers[event] = handler;
            }
            return;
        },
    },
};

export default directices;
