type ValueType = object | string | number | boolean | Function;

interface FilterType {
  (arg: ValueType): ValueType;
}

interface UpdateType {
  update: Function;
  customFilter?: FilterType;
}

interface AttrType {
  name: string;
  value: string;
}
