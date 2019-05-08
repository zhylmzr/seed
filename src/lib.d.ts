interface IndexObject {
    [prop: string]: object;
}

interface IndexBoolean {
    [prop: string]: boolean;
}

interface IndexFunction {
    [prop: string]: Function;
}

type ValueType = object | string | number | boolean | Function;

interface FilterType {
    (...args: ValueType[]): ValueType;
}

interface UpdateType {
    update: Function;
    created?: Function;
    buildItem?: Function;
    mutate?: Function;
    destory?: Function;
}

interface AttrType {
    name: string;
    value: string;
}
interface SeedOption {
    prefix?: RegExp;
    parent?: import('./index').default;
    eachIndex?: number;
}

interface IndexValue {
    [prop: string]: ValueType;
}

interface EventWrap {
    el: EventTarget;
    event: Event;
    directive: import('./directive/index').default;
    seed: import('./index').default;

}
interface EventHandler {
    (event: EventWrap): void;
}
