function capitalizeFirstLetter(string: string) {
    return string[0].toUpperCase() + string.slice(1);
}

function jsonToFormData(ajson: any, aFormdata: FormData): FormData {
    for (const prop in ajson) {
      if (ajson.hasOwnProperty(prop) && ajson[prop] !== "") {
        aFormdata.append(prop, ajson[prop]);
      }
    }
    return aFormdata;
  }

export  {
    capitalizeFirstLetter,
    jsonToFormData
};