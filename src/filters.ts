const filters: {
  [key: string]: Function;
} = {
  capitalize: (value: ValueType): ValueType => {
    if (typeof value === "string") {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    return value;
  },
};

export default filters;
