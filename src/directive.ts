const PREFIX_MASK = "sd";
const VAR_RE = /\{\{([^}]*)\}\}/g;
import Directives from "./directives";
import Filters from "./filters";

interface FilterType {
  (arg: ValueType): ValueType;
}

interface UpdateType {
  update: Function;
  customFilter?: FilterType;
}

function isFilterType(obj: Function | UpdateType): obj is UpdateType {
  return (obj as UpdateType).update !== undefined;
}

interface DirectiveOptions {
  readonly attr: { name: string; value: string };
  readonly name: string;
  readonly key: string;
  readonly def: Function | UpdateType;
  readonly filters: string[];
}

class Directive {
  private el: HTMLElement;

  public constructor(public readonly opts: DirectiveOptions) {}

  public update(value: ValueType): void {
    if (typeof this.opts.def === "function") {
      this.opts.def(this.el, value);
    } else {
      this.opts.def.update(this.el, value);
    }
  }

  public setEl(el: HTMLElement): void {
    this.el = el;
  }

  public static parser(attr: Attr): Directive {
    if (attr.name.indexOf(PREFIX_MASK) !== 0) {
      return null;
    }
    let dirName = attr.name.slice(PREFIX_MASK.length + 1);
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
    if (Directives[dirName]) {
      return new Directive({
        attr,
        key,
        filters,
        name: dirName,
        def: Directives[dirName],
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
