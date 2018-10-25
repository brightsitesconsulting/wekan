export const serialize = (obj) => Object.keys(obj)
  .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`).join('&');

export const skipFirst = (fn) => {
  var once = null;
  return (...args) => {
    if (!once) {
      return fn.apply(this, args)
    }
    once = false;
    return void 0;
  }
};
