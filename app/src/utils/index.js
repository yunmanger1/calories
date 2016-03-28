export function checkHttpStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  if (response.status >= 500) {
    let error = new Error("Server error");
    error.response = response;
    throw error
  } else if (response.status >= 400 && response.status < 500) {
    let error = new Error("Form error");
    error.is_form_error = true;
    error.response = response;
    return response.json().then(json => {
      error.data = json;
      throw error;
    })
  } else {
    throw Error("Unexpected response");
  }
}

export function parseJSON(response) {
     return response.json()
}

export function Enum(...array) {
  let res = {};
  for (let i=1; i < array.length; i++){
    res[array[i].toUpperCase()] = array[0].toUpperCase() + "_" + array[i].toUpperCase();
  }
  return res;
}

export function updateOrAppend(array, item) {
  let present = false;
  let res = array.map((cur) => {
    if (cur.id == item.id) {
      present = true;
      return item;
    }
    return cur;
  });
  if (!present){
    res.push(item);
  }
  return res;
}

export const isStaff = (user) => (user && (user.is_superuser || user.is_manager));
