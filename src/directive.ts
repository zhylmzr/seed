const PREFIX_MASK = "sd";
const VAR_RE = /\{\{([^}]*)\}\}/g;
import Directives from "./directives";
import Filters from "./filters";
import Seed from ".";

function isFilterType(obj: Function | UpdateType): obj is UpdateType {
  return (obj as UpdateType).update !== undefined;
}

interface DirectiveOptions {
  readonly attr: { name: string; value: string };
  readonly name: string;
  readonly arg: string;
  readonly key: string;
  readonly def: Function | UpdateType;
  readonly filters: string[];
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

  public static parser(seed: Seed, attr: AttrType): Directive {
    if (attr.name.indexOf(PREFIX_MASK) !== 0) {
      return null;
    }
    let noprefix = attr.name.slice(PREFIX_MASK.length + 1);
    let express = attr.value;
    let pipeIndex = express.indexOf("|");
    let key =
      pipeIndex === -1 ? express.trim() : express.slice(0, pipeIndex).trim();
    let filters =
      pipeIndex === -1
        ? null
        : express
            .slice(pipeIndex + 1)
            .split("|")
            .map(filter => {
              return filter.trim();
            });
    let argIndex = noprefix.indexOf("-");
    let arg = argIndex === -1 ? null : noprefix.slice(argIndex + 1);
    let name = arg ? noprefix.slice(0, argIndex) : noprefix;
    let def = Directives[name];

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
    if (isFilterType(this.opts.def) && this.opts.def.customFilter) {
      return this.opts.def.customFilter(value);
    } else {
      this.opts.filters.forEach((name: string) => {
        if (Filters[name]) {
          value = Filters[name](value);
        }
      });
      return value;
    }
  }
}

export { Directive, PREFIX_MASK, VAR_RE };
