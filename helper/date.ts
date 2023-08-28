export function strToDate(dateString: string) {
  // const dateString = "2023-08-28 12:46:39";
  const parsedDate = new Date(dateString.replace(/-/g, "/"));
  const timestamp = parsedDate.getTime();
  return timestamp;
}

export function dateToStr(timestamp: number) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}
