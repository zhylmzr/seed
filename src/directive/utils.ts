import Directive from "./index";

const directices: {
    [key: string]: Function | UpdateType;
} = {
    text: (el: HTMLDataElement, value: string): void => {
        el.textContent = value;
    },
    value: (el: HTMLDataElement, value: string): void => {
        el.value = value;
    },
    show: (el: HTMLElement, value: boolean): void => {
        el.style.display = value ? '' : 'none';
    },
    on: {
        update(this: Directive, handler: EventListener): void {
            let event = this.opts.arg;
            if (this.opts.handlers[event]) {
                this.el.removeEventListener(event, this.opts.handlers[event]);
            }
            if (handler) {
                handler = handler.bind(this.seed);
                this.el.addEventListener(event, handler);
                this.opts.handlers[event] = handler;
            }
            return;
        },
    },
    each: {
        created(this: Directive) {
            let el = this.el as object as { [prop:string]: boolean };
            el['sd-block'] = true;
            console.log(this.opts.arg);
        },
        update(this: Directive, collection: Record<string, object>) {

        },
    },
};

export default directices;
