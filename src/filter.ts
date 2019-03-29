export default class Filter {
    public constructor(public readonly name: string, public readonly def: FilterType, public readonly args: string[]) {}

    public apply(value: ValueType): ValueType {
        if (this.def) {
            return this.def(value, this.args);
        } else {
            throw new Error(`'${this.name}' filter doesn't defined`)
        }
    }
}
