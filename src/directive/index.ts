import { PREFIX_MASK, KEY_RE, FILTER__RE, FILTER_ARG_RE, ARG_RE } from '../config';
import Seed from "../index";
import Utils from "./utils";
import Filter from "../filter/index";

interface DirectiveOptions {
    attr: { name: string; value: string };
    name: string;
    arg: string;
    key: string;
    def: Function | UpdateType;
    filters: Filter[];
    handlers: Record<string, EventListener>;
}

class Directive {
    public el: HTMLElement;
    public childSeed: Seed[];
    public container: HTMLElement;

    public constructor(
        public readonly seed: Seed,
        public readonly opts: DirectiveOptions,
    ) {}

    public update(value: ValueType): void {
        if (typeof this.opts.def === "function") {
            this.opts.def.call(this, value);
        } else {
            this.opts.def.update.call(this, value);
        }
    }

    //
    //     sd-text="msg | uppercase param | ..."
    //      \    \    \       \       \
    //    prefix name key  filter  filter_arg
    //
    //     sd-each="todo:todos"
    //              ----------
    //              ---- \
    //                \   \
    //               arg  key
    //
    //     sd-text="todo.title"
    //                \     \
    //      each_loop_arg   key
    //
    //
    public static parse(seed: Seed, attr: AttrType): Directive {
        if (attr.name.indexOf(PREFIX_MASK) !== 0) {
            return null;
        }
        let name = attr.name.slice(PREFIX_MASK.length + 1);
        let key = attr.value.match(KEY_RE)[0].trim();

        let params = attr.value.match(FILTER__RE);
        let filters = params && params.slice(1).map(filter => {
            let tokens = filter.match(FILTER_ARG_RE);
            let name = tokens[0];
            return new Filter(name, tokens.length > 1 ? tokens.slice(1) : null);
        });

        let argMatch = key.match(ARG_RE);
        key = argMatch ? argMatch[2].trim() : key;
        let arg = argMatch ? argMatch[1].trim() : null;
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
