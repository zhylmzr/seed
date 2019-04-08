const PREFIX_MASK = "sd";
const VAR_RE = /\{\{([^}]*)\}\}/g;
const KEY_RE = /^[^\|]+/;
const FILTER__RE = /[^\|]+/g;
const FILTER_ARG_RE = /[^\s]+/g;

export { PREFIX_MASK, VAR_RE, KEY_RE, FILTER__RE, FILTER_ARG_RE };
