import { PREFIX_MASK, KEY_RE, FILTER__RE, FILTER_ARG_RE } from '../config'
import Seed from "../index";
import Utils from "./utils";
import Filter from "../filter";

interface DirectiveOptions {
    readonly attr: { name: string; value: string };
    readonly name: string;
    readonly arg: string;
    readonly key: string;
    readonly def: Function | UpdateType;
    readonly filters: Filter[];
    handlers: Record<string, EventListener>;
}

class Directive {
    private el: HTMLElement;

    public constructor(
        public readonly seed: Seed,
        public readonly opts: DirectiveOptions,
    ) {}

    public update(value: ValueType): void {
        if (typeof this.opts.def === "function") {
            this.opts.def(this.el, value);
        } else {
            this.opts.def.update.call(this, value);
        }
    }

    public setEl(el: HTMLElement): void {
        this.el = el;
    }

    public getEl(): HTMLElement {
        return this.el;
    }

    public static parse(seed: Seed, attr: AttrType): Directive {
        if (attr.name.indexOf(PREFIX_MASK) !== 0) {
            return null;
        }
        let noprefix = attr.name.slice(PREFIX_MASK.length + 1);
        let key = attr.value.match(KEY_RE)[0].trim();
        let params = attr.value.match(FILTER__RE);
        let filters = params && params.slice(1).map(filter => {
            let tokens = filter.match(FILTER_ARG_RE);
            let name = tokens[0];
            return new Filter(name, tokens.length > 1 ? tokens.slice(1) : null);
        })

        let argIndex = noprefix.indexOf("-");
        let arg = argIndex === -1 ? null : noprefix.slice(argIndex + 1);
        let name = arg ? noprefix.slice(0, argIndex) : noprefix;
        let def = Utils[name];

        if (def && key) {
            return new Directive(seed, {
                name,
                arg,
                key,
                attr,
                filters,
                def,
                handlers: {},
            });
        }

        return null;
    }

    public applyFilter(value: ValueType): ValueType {
        this.opts.filters.forEach((filter: Filter) => {
            value = filter.apply(value);
        });
        return value;
    }
}

export default Directive;