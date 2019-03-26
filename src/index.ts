import { Directive, PREFIX_MASK, VAR_RE } from "./directive";
import Directives from "./directives";
import { forEach } from "./utils";

interface BindingType {
  els: NodeListOf<HTMLElement>;
  value: object;
  directives: Directive[];
}

class Seed {
  private root: HTMLElement;

  private data: {
    [prop: string]: object;
  };
  private binding: Record<string, BindingType>;

  public constructor(id: string, initData: Record<string, object>) {
    if (!(this instanceof Seed)) {
      throw new Error("please use new keyword");
    }
    this.initProp();
    this.root = document.querySelector(id);
    const content = this.root.outerHTML.replace(
      VAR_RE,
      (_: string, variable: string): string => {
        return this.makeToken(variable);
      },
    );
    this.root.innerHTML = content;

    // init directive and binding
    this.initDirective();

    // two-way data binding
    this.initData(initData);
  }

  private initProp(): void {
    this.data = {};
    this.binding = {};
  }

  private makeToken(variable: string): string {
    return `<span ${PREFIX_MASK}=${variable}></span>`;
  }

  private initDirective(): void {
    const selector = Object.keys(Directives).map(
      (dir: string) => `[${PREFIX_MASK}-${dir}]`,
    );
    const els = this.root.querySelectorAll(selector.join());
    forEach.call(els, (el: HTMLElement) => {
      forEach.call(el.attributes, (attr: Attr) => {
        let directive = Directive.parser(attr);
        if (directive) {
          this.bindDirective(el, directive);
        }
      });
    });
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

  private initData(initData: Record<string, object>): void {
    for (const variable in this.binding) {
      this.bindData(variable);
    }
    if (initData) {
      for (const variable in initData) {
        this.data[variable] = initData[variable];
      }
    }
  }

  private bindData(variable: string): void {
    this.binding[variable].els = document.querySelectorAll(
      `[${PREFIX_MASK}=${variable}]`,
    );
    forEach.call(this.binding[variable].els, (el: HTMLElement) => {
      el.removeAttribute(PREFIX_MASK);
    });

    Object.defineProperty(this.data, variable, {
      set: (value: ValueType) => {
        // loop all bound element
        forEach.call(this.binding[variable].els, (el: HTMLElement) => {
          this.binding[variable].value = value as object;
          el.textContent = value as string;

          // fire directive to update view
          forEach.call(
            this.binding[variable].directives || [],
            (dir: Directive) => {
              let tempValue = dir.opts.filters ? dir.applyFilter(value) : value;
              dir.update(tempValue);
            },
          );
        });
      },
      get: () => {
        return this.binding[variable].value;
      },
    });
  }
}

export default Seed;
