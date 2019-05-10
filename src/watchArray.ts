const mutatorMethods = [
    'pop', 'push', 'reverse', 'shift', 'unshift', 'splice', 'sort',
];
const ArrayProto = Array.prototype as object as IndexFunction;

export default (arr: ValueType[], callback: (arg: MutationType) => void) => {
    mutatorMethods.forEach(method => {
        (arr as object as IndexObject)[method] = function(...args: ValueType[]) {
            let result = ArrayProto[method].apply(this, args);
            callback({ event: method, args, result});
        };
    });
};
