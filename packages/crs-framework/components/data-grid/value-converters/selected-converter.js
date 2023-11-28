const selectedConverter = {
  get(value, args) {
    return value == "true" || value == true ? "check" : "check-box-blank";
  },
  set(value, args) {
    return value == "check" ? true : false;
  }
};
export {
  selectedConverter
};
