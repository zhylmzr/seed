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
        if (this.opts.arg) { // 参数式
            this.el.classList[value ? 'add' : 'remove'](this.opts.arg);
        } else { // 直接量
            let stoage = (this.el as object as IndexValue);
            this.el.classList.remove(stoage.lastVal as string);
            this.el.classList.add(value);
            stoage.lastVal = value;
        }
    },
    on: {
        update(this: Directive, handler: EventHandler): void {
            let event = this.opts.arg;
            if (this.opts.handlers[event]) {
                this.el.removeEventListener(event, this.opts.handlers[event]);
            }
            if (handler) {
                handler = handler.bind(this.seed);
                let proxy = (e: Event): void => {
                    handler({
                        el: e.currentTarget,
                        event: e,
                        directive: this,
                        seed: this.seed,
                    });
                };
                this.el.addEventListener(event, proxy);
                this.opts.handlers[event] = proxy;
            }
        },
        destory(this: Directive) {
            let event = this.opts.arg;
            if (this.opts.handlers[event]) {
                this.el.removeEventListener(event, this.opts.handlers[event]);
            }
        },
    },
    each: {
        created(this: Directive) {
            let el = this.el as object as IndexBoolean;
            el['sd-block'] = true;
            this.container = this.el.parentElement;
            this.childSeed = [];
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
                eachIndex: index,
            };
            let childSeed = new Seed(node, data, options);
            this.childSeed.push(childSeed);
            this.container.appendChild(node);
            collection[index] = childSeed.scope;
            return childSeed;
        },
        mutate(mutation: Record<string, object>) {
            // TODO
            console.log(mutation);
        },
        destory(this: Directive) {
            this.childSeed && this.childSeed.forEach(child => {
                child.destroy();
            });
        },
    },
    checked: {
        created(this: Directive) {
            let event = 'change';
            if (this.opts.handlers[event]) {
                this.el.removeEventListener(event, this.opts.handlers[event]);
            }

            let proxy = (): void => {
                this.seed.scope[this.opts.key] = (this.el as HTMLInputElement).checked;
            };
            this.el.addEventListener(event, proxy);
            this.opts.handlers[event] = proxy;

        },
        update(this: Directive, value: boolean) {
            (this.el as HTMLInputElement).checked = value;
        },
        destory(this: Directive) {
            let event = 'change';
            this.el.removeEventListener(event, this.opts.handlers[event]);
        },
    },
};

export default directices;
