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
}

interface AttrType {
    name: string;
    value: string;
}
interface SeedOption {
    prefix?: RegExp;
    parent?: import('./index').default;
}
