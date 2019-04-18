const mutatorMethods = [
    'pop', 'push', 'reverse', 'shift', 'unshift', 'splice', 'sort',
];
const ArrayProto = Array.prototype as object as IndexFunction;

export default (arr: Record<string, Function>, callback: Function) => {
    mutatorMethods.forEach((method) => {
        arr[method] = function() {
            ArrayProto[method].apply(this, arguments);
            callback({ event: method, args: ArrayProto.slice(arguments), array: arr});
        };
    });
};
