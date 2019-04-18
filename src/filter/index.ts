import Utils from './utils';

export default class Filter {
    public constructor(public readonly name: string,
        public readonly args: string[],
        public readonly def?: FilterType) {
        if (!def) {
            this.def = Utils[name];
        }
    }

    public apply(value: ValueType): ValueType {
        if (this.def) {
            return this.def(value, this.args);
        } else {
            throw new Error(`'${this.name}' filter doesn't defined`);
        }
    }

    public static add(name: string, filter: FilterType): void {
        Utils[name] = filter;
    }
}
