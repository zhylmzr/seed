import Directive from "./index";
import Seed from "../index";
import watchArray from '../watchArray';

const directices: {
    [key: string]: Function | UpdateType;
} = {
    text(this: Directive, value: string): void {
        this.el.textContent = value;
    },
    value(this: Directive, value: string): void {
        (this.el as HTMLDataElement).value = value;
    },
    show(this: Directive, value: boolean): void {
        this.el.style.display = value ? '' : 'none';
    },
    class(this: Directive, value: string): void {
        this.el.classList[value ? 'add' : 'remove'](this.opts.arg);
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
            let el = this.el as object as IndexBoolean;
            el['sd-block'] = true;
            this.container = this.el.parentElement;
            this.container.removeChild(this.el);
        },
        update(this: Directive, collection: object[]) {
            collection.forEach((item: Record<string, object>, i) => {
                (this.opts.def as UpdateType).buildItem.bind(this)(item, i, collection);
            });
            watchArray(collection as object as Record<string, Function>, (this.opts.def as UpdateType).mutate.bind(this));
        },
        buildItem(this: Directive, data: Record<string, object>, index: number, collection: object[]): Seed {
            let node = this.el.cloneNode(true) as HTMLElement;
            let options: SeedOption = {
                prefix: new RegExp(`^${this.opts.arg}\\.`),
                parent: this.seed,
            };
            let childSeed = new Seed(node, data, options);
            this.container.appendChild(node);
            collection[index] = childSeed.scope;
            return childSeed;
        },
        mutate(mutation: Record<string, object>) {
            // TODO
            console.log(mutation);
        },
    },
};

export default directices;
