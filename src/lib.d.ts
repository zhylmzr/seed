type ValueType = object | string | number | boolean | Function;

interface FilterType {
    (...args: ValueType[]): ValueType;
}

interface UpdateType {
    update: Function;
}

interface AttrType {
    name: string;
    value: string;
}
