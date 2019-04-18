import { PREFIX_MASK, VAR_RE } from "./config";
import Directive from "./directive/index";
import Filter from './filter/index';

const forEach = Array.prototype.forEach;
const map = Array.prototype.map;

interface BindingType {
    value: object;
    directives: Directive[];
}

class Seed {
    private root: HTMLElement;

    public scope: IndexObject;
    private binding: Record<string, BindingType>;
    private options: Record<string, object>;

    public constructor(el: string | HTMLElement, initData: Record<string, object>, options: Record<string, object> = {}) {
        if (!(this instanceof Seed)) {
            throw new Error("please use new keyword");
        }
        this.scope = {};
        this.binding = {};
        this.options = options;
        if (typeof el === 'string') {
            this.root = document.querySelector(el);
        } else {
            this.root = el;
        }

        const content = this.root.innerHTML.replace(
            VAR_RE,
            (_: string, variable: string): string => {
                return this.makeToken(variable);
            },
        );
        this.root.innerHTML = content;

        // process node and directives
        this.compileNode(this.root);

        // init data by setter
        this.initData(initData);
    }

    private makeToken(variable: string): string {
        // 语法糖转换为指令
        return `<span ${PREFIX_MASK}-text='${variable}'></span>`;
    }

    private compileNode(node: HTMLElement): void {
        if (node.nodeType === 3) { // text node
            this.compileTextNode(node);
        } else if (node.attributes && node.attributes.length) {
            let attrs: AttrType[] = map.call(node.attributes, (attr: Attr) => {
                return { name: attr.name, value: attr.value };
            });
            attrs.forEach((attr: Attr) => {
                let directive = Directive.parse(this, attr, this.options as object as DirectiveParseOption);
                if (directive) {
                    this.bind(node, directive);
                }
            });
        }
        let el = node as object as IndexBoolean;
        if (!el['sd-block'] && node.children.length) {
            forEach.call(node.children, (child: HTMLElement) => {
                this.compileNode(child);
            });
        }
    }

    private compileTextNode(node: HTMLElement): void {
        // TODO
        console.log(node);
    }

    private bind(el: HTMLElement, dir: Directive): void {
        el.removeAttribute(dir.opts.attr.name);
        dir.el = el;

        let binding = this.binding[dir.opts.key] || this.createBinding(dir.opts.key);
        binding.directives.push(dir);

        let def = dir.opts.def as UpdateType;
        // invoke hook
        if (def.created) {
            def.created.call(dir, binding.value);
        }
    }

    private initData(initData: Record<string, object> = {}): void {
        for (const variable in this.binding) {
            this.scope[variable] = initData[variable];
        }
    }

    private createBinding(variable: string): BindingType {
        let binding: BindingType = {
            value: undefined,
            directives: [],
        };
        this.binding[variable] = binding;

        Object.defineProperty(this.scope, variable, {
            set: (value: ValueType) => {
                binding.value = value as object;

                // fire directive to update view
                forEach.call(
                    binding.directives,
                    (dir: Directive) => {
                        let tempValue = dir.opts.filters ? dir.applyFilter(value) : value;
                        dir.update(tempValue);
                    },
                );
            },
            get: () => {
                return binding.value;
            },
        });
        return binding;
    }

    public static filter(name: string, func: FilterType): void {
        Filter.add(name, func);
    }

    public static extend(Opts: Record<string, object>): typeof Seed {
        return class SeedChild extends Seed {
            public constructor(id: string, initData: Record<string, object>) {
                super(id, {...Opts, ...initData});
            }
        };
    }
}

export default Seed;
