const directices: {
  [key: string]: Function;
} = {
  text: (el: HTMLDataElement, value: string): void => {
    el.textContent = value;
  },
  value: (el: HTMLDataElement, value: string): void => {
    el.value = value;
  },
};

export default directices;
