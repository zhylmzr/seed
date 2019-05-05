import { PREFIX_MASK, VAR_RE, CTRL_ATTR, EACH_ATTR } from "./config";
import Directive from "./directive/index";
import Filter from './filter/index';
import Controller from './controller';

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
    private options: SeedOption;
    private _initCopy: IndexObject

    public constructor(el: string | HTMLElement, initData: IndexObject, options: SeedOption = {}) {
        if (!(this instanceof Seed)) {
            throw new Error("please use new keyword");
        }
        this.scope = initData;
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

        let ctrlExp = this.root.getAttribute(CTRL_ATTR);
        let controller: Function;

        if (ctrlExp) {
            controller = Controller[ctrlExp];
            this.root.removeAttribute(CTRL_ATTR);
            if (!controller) throw new Error(`controller ${ctrlExp} isn't defined.`);
        }

        this._initCopy = Object.assign({}, initData);
        // process node and directives
        this.compileNode(this.root, true);

        // copy method from controller
        if (controller) {
            controller.call(null, this.scope, this);
        }

        // init data by setter
        for (const variable in this._initCopy) {
            this.scope[variable] = this._initCopy[variable];
        }
    }

    private makeToken(variable: string): string {
        // 语法糖转换为指令
        return `<span ${PREFIX_MASK}-text='${variable}'></span>`;
    }

    private compileNode(node: HTMLElement, root?: boolean): void {
        if (node.nodeType === 3) { // text node
            this.compileTextNode(node);
        } else if (node.attributes && node.attributes.length) {
            let eachExp = node.getAttribute(EACH_ATTR),
                ctrlExp = node.getAttribute(CTRL_ATTR);

            // for init parent and remove each block
            if (eachExp) {
                let directive = Directive.parse(this, {
                    name: EACH_ATTR,
                    value: eachExp,
                });
                if (directive) {
                    this.bind(node, directive);
                    // init parent scope before son
                    this.scope[directive.opts.key] = this._initCopy[directive.opts.key];
                    delete this._initCopy[directive.opts.key];
                }
            } else if (!ctrlExp || root) {
                let attrs: AttrType[] = map.call(node.attributes, (attr: Attr) => {
                    return { name: attr.name, value: attr.value };
                });
                attrs.forEach((attr: Attr) => {
                    attr.value.split(',').forEach(express => {
                        let directive = Directive.parse(this, { name: attr.name, value: express });
                        if (directive) {
                            this.bind(node, directive);
                        }
                    });
                });
            }
        }
        if (node.childNodes.length) {
            forEach.call(node.childNodes, (child: HTMLElement) => {
                this.compileNode(child);
            });
        }
    }

    private compileTextNode(node: HTMLElement): void {
        // TODO
        node;
    }

    private bind(el: HTMLElement, dir: Directive): void {
        el.removeAttribute(dir.opts.attr.name);
        dir.el = el;

        let key = dir.opts.key,
            eachPrefix = this.options.prefix,
            isEachKey = eachPrefix && eachPrefix.test(key),
            self: Seed = this;

        if (isEachKey) {
            key = key.replace(eachPrefix, '');
        } else if (eachPrefix) {
            self = this.options.parent;
        }

        let binding = self.binding[key] || self.createBinding(key);
        binding.directives.push(dir);

        let def = dir.opts.def as UpdateType;
        // invoke hook
        if (def.created) {
            def.created.call(dir, binding.value);
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
                binding.directives.forEach(dir => {
                    let tempValue = dir.opts.filters ? dir.applyFilter(value) : value;
                    dir.update(tempValue);
                });
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

    public static controller(id: string, ext: Function): void {
        Controller[id] = ext;
    }
}

export default Seed;
