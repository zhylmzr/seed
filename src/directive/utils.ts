import Directive from "./index";
import Seed from "../index";
import watchArray from '../watchArray';

const reorder = function(this: Directive): void {
    this.childSeed.forEach((seed: Seed, i) => {
        seed.options.eachIndex = i;
    });
};

const mutationHandlers: IndexFunction = {
    push(this: Directive, mutate: MutationType) {
        mutate.args.forEach((data, i) => {
            let def = this.opts.def as UpdateType;
            def.buildItem.call(this, data, this.childSeed.length + i);
        });
    },
    pop(this: Directive, mutate: MutationType) {
        (mutate.result as ScopeType).$seed.destroy();
    },
    unshift(this: Directive, mutate: MutationType) {
        mutate.args.forEach((data, i) => {
            let def = this.opts.def as UpdateType;
            def.buildItem.call(this, data, this.childSeed.length + i);
        });
        reorder.call(this);
    },
    shift(this: Directive, mutate: MutationType) {
        (mutate.result as ScopeType).$seed.destroy();
        this.childSeed.shift();
    },
    splice(this: Directive, mutate: MutationType) {
        let index = mutate.args[0] as number,
            removed = mutate.args[1] as number,
            added = mutate.args.length - 2 as number;

        (mutate.result as ScopeType[]).forEach(r => {
            r.$seed.destroy();
        });

        if (added > 0) {
            mutate.args.slice(2).forEach((data, i) => {
                let def = this.opts.def as UpdateType;
                def.buildItem.call(this, data, index + i);
            });
        }
        this.childSeed.splice(index, removed);
        reorder.call(this);
    },
    sort(this: Directive, mutate: MutationType) {
        // TODO
        console.log(mutate);
    },
};

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
        update(this: Directive, collection: ValueType[]) {
            collection.forEach((item: Record<string, object>, i) => {
                (this.opts.def as UpdateType).buildItem.bind(this)(item, i);
            });
            watchArray(collection, (this.opts.def as UpdateType).mutate.bind(this));
        },
        buildItem(this: Directive, data: IndexValue, index: number): Seed {
            let node = this.el.cloneNode(true) as HTMLElement;
            let options: SeedOption = {
                data,
                prefix: new RegExp(`^${this.opts.arg}\\.`),
                parent: this.seed,
                eachIndex: index,
            };
            let childSeed = new Seed(node, options);
            this.childSeed.push(childSeed);
            this.container.appendChild(node);

            return childSeed;
        },
        mutate(mutation: MutationType) {
            if (mutationHandlers[mutation.event]) {
                mutationHandlers[mutation.event].call(this, mutation);
            }
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
