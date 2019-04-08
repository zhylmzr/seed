import { PREFIX_MASK, VAR_RE } from "./config";
import Directive from "./directive/index";
import Filter from './filter/index';

const forEach = Array.prototype.forEach;
const map = Array.prototype.map;

interface BindingType {
    els: NodeListOf<HTMLElement>; // 语法糖绑定元素
    value: object;
    directives: Directive[];
}

class Seed {
    private root: HTMLElement;

    private scope: {
        [prop: string]: object;
    };
    private binding: Record<string, BindingType>;

    public constructor(id: string, initData: Record<string, object>) {
        if (!(this instanceof Seed)) {
            throw new Error("please use new keyword");
        }
        this.scope = {};
        this.binding = {};
        this.root = document.querySelector(id);
        const content = this.root.innerHTML.replace(
            VAR_RE,
            (_: string, variable: string): string => {
                return this.makeToken(variable);
            },
        );
        this.root.innerHTML = content;

        // process node and directives
        this.compileNode(this.root);

        // two-way data binding
        this.initData(initData);
    }

    private makeToken(variable: string): string {
        return `<span ${PREFIX_MASK}-text='${variable}'></span>`;
    }

    private compileNode(node: HTMLElement): void {
        if (node.nodeType === 3) { // text node
            this.compileTextNode(node);
        } else if (node.attributes && node.attributes.length) {
            let attrs: AttrType[] = map.call(node.attributes, (attr: Attr) => {
                return { name: attr.name, value: attr.value };
            })
            attrs.forEach((attr: Attr) => {
                let directive = Directive.parse(this, attr);
                if (directive) {
                    this.bindDirective(node, directive);
                }
            })
        }
        if (node.children.length) {
            forEach.call(node.children, (child: HTMLElement) => {
                this.compileNode(child)
            })
        }
    }

    private compileTextNode(node: HTMLElement): void {

    }

    private bindDirective(el: HTMLElement, dir: Directive): void {
        let binding = this.binding[dir.opts.key];
        if (!binding || !Object.keys(binding).length) {
            this.binding[dir.opts.key] = binding = {
                els: undefined,
                value: undefined,
                directives: [],
            };
        }
        el.removeAttribute(dir.opts.attr.name);
        dir.setEl(el);
        binding.directives.push(dir);
    }

    private initData(initData: Record<string, object> = {}): void {
        for (const variable in this.binding) {
            this.bindData(variable);
            this.scope[variable] = initData[variable];
        }
    }

    private bindData(variable: string): void {
        this.binding[variable].els = document.querySelectorAll(
            `[${PREFIX_MASK}=${variable}]`,
        );
        forEach.call(this.binding[variable].els, (el: HTMLElement) => {
            el.removeAttribute(PREFIX_MASK);
        });

        Object.defineProperty(this.scope, variable, {
            set: (value: ValueType) => {
                this.binding[variable].value = value as object;

                // loop all bound element
                forEach.call(this.binding[variable].els, (el: HTMLElement) => {
                    el.textContent = value as string;
                });

                // fire directive to update view
                forEach.call(
                    this.binding[variable].directives || [],
                    (dir: Directive) => {
                        let tempValue = dir.opts.filters ? dir.applyFilter(value) : value;
                        dir.update(tempValue);
                    },
                );
            },
            get: () => {
                return this.binding[variable].value;
            },
        });
    }

    public static filter(name: string, func: FilterType): void {
        Filter.add(name, func);
    }

    public static extend(Opts: Record<string, object>): typeof Seed {
        return class SeedChild extends Seed {
            constructor(id: string, initData: Record<string, object>) {
                super(id, {...Opts, ...initData});
            }
        }
    }
}

export default Seed;
