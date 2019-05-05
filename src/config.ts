const PREFIX_MASK = "sd";
const CTRL_ATTR = `${PREFIX_MASK}-controller`;
const EACH_ATTR = `${PREFIX_MASK}-each`;

const VAR_RE = /\{\{([^}]*)\}\}/g;
const ARG_RE = /([^:]+):(.+)$/;
const KEY_RE = /^[^\|]+/;
const FILTER__RE = /[^\|]+/g;
const FILTER_ARG_RE = /[^\s]+/g;

export {
    PREFIX_MASK,
    VAR_RE,
    KEY_RE,
    FILTER__RE,
    FILTER_ARG_RE,
    CTRL_ATTR,
    EACH_ATTR,
    ARG_RE,
};
