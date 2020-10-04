// for jsonifying and stringifying
function replacer(key, value) {
  const originalObject = this[key];
  if (originalObject instanceof Map) {
    return {
      dataType: "Map",
      value: Array.from(originalObject.entries()) // or with spread: value: [...originalObject]
    };
  } else if (originalObject instanceof Set) {
    return {
      dataType: "Set",
      value: Array.from(originalObject)
    };
  } else {
    return value;
  }
}

function reviver(key, value) {
  if (typeof value === "object" && value !== null) {
    if (value.dataType === "Map") {
      return new Map(value.value);
    } else if (value.dataType === "Set") {
      return new Set(value.value);
    }
  }
  return value;
}

const SmartJSON = {
  parse(str: string): any {
    return JSON.parse(str, reviver);
  },

  stringify(obj: any): string {
    return JSON.stringify(obj, replacer);
  }
};

export { SmartJSON };
